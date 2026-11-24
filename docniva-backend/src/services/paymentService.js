import crypto from "node:crypto";
import Razorpay from "razorpay";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import { slotStartDate } from "../utils/dateTime.js";

const ACTIVE = ["pending", "confirmed"];
const UNPAID = ["pending", "failed"];
const MAX_REFUND_ATTEMPTS = 10;

let client;
export const getRazorpay = () => {
  if (client) return client;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay API keys are missing");

  client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
};

// Razorpay ke errors me message aksar err.error.description me hota hai
export const razorpayErrorMessage = (err) =>
  err?.error?.description || err?.message || "Unknown payment gateway error";

// payload: string ya Buffer. signature: hex string.
export const isSignatureValid = (payload, signature, secret) => {
  if (typeof signature !== "string" || !/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }
  const expected = crypto.createHmac("sha256", secret).update(payload).digest();
  const received = Buffer.from(signature, "hex");
  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(expected, received)
  );
};

// ---------------------------------------------------------------
// REFUND
// Ek hi payment do baar refund na ho, isliye pehle atomic claim hota hai.
// ---------------------------------------------------------------
export const refundAppointment = async (appointmentId, reason = "Refund") => {
  const appt = await Appointment.findOneAndUpdate(
    { _id: appointmentId, paymentStatus: "paid" },
    {
      $set: { paymentStatus: "refund_pending", refundStartedAt: new Date() },
      $inc: { refundAttempts: 1 },
    },
    { new: true }
  );

  if (!appt) return { outcome: "skipped" };

  const release = () =>
    Appointment.updateOne(
      { _id: appt._id, paymentStatus: "refund_pending" },
      { $set: { paymentStatus: "paid" }, $unset: { refundStartedAt: 1 } }
    );

  if (!appt.razorpayPaymentId) {
    console.error(`Refund skipped, payment id missing: ${appt._id}`);
    await release();
    return { outcome: "failed" };
  }

  try {
    const refund = await getRazorpay().payments.refund(appt.razorpayPaymentId, {
      amount: appt.amount,
      speed: "normal",
      receipt: `rf_${appt._id}`,
      notes: { appointmentId: String(appt._id), reason },
    });

    await Appointment.updateOne(
      { _id: appt._id, paymentStatus: "refund_pending" },
      {
        $set: {
          paymentStatus: "refunded",
          refundId: refund.id,
          refundedAt: new Date(),
        },
        $unset: { refundStartedAt: 1 },
      }
    );

    return { outcome: "refunded", refundId: refund.id };
  } catch (err) {
    const message = razorpayErrorMessage(err);

    // Razorpay pe refund ho chuka hai (pichli call timeout ho gayi thi)
    if (/already.*refund/i.test(message)) {
      await Appointment.updateOne(
        { _id: appt._id, paymentStatus: "refund_pending" },
        {
          $set: { paymentStatus: "refunded", refundedAt: new Date() },
          $unset: { refundStartedAt: 1 },
        }
      );
      return { outcome: "refunded" };
    }

    console.error(`Refund failed for ${appt._id}: ${message}`);
    await release(); // agli sweep dobara try karegi
    return { outcome: "failed" };
  }
};

// Server refund ke beech me band ho gaya ho to Razorpay se pooch kar suljhao
const reconcileStaleRefund = async (appt) => {
  try {
    const payment = await getRazorpay().payments.fetch(appt.razorpayPaymentId);

    if (Number(payment.amount_refunded) >= appt.amount) {
      await Appointment.updateOne(
        { _id: appt._id, paymentStatus: "refund_pending" },
        {
          $set: { paymentStatus: "refunded", refundedAt: new Date() },
          $unset: { refundStartedAt: 1 },
        }
      );
    } else {
      await Appointment.updateOne(
        { _id: appt._id, paymentStatus: "refund_pending" },
        { $set: { paymentStatus: "paid" }, $unset: { refundStartedAt: 1 } }
      );
    }
  } catch (err) {
    console.error(`Refund reconcile failed for ${appt._id}:`, razorpayErrorMessage(err));
  }
};

// Cancelled/rejected par jin appointments ka paisa abhi wapas nahi hua
export const processPendingRefunds = async () => {
  const due = await Appointment.find({
    status: mongoose.trusted({ $in: ["cancelled", "rejected"] }),
    paymentStatus: "paid",
    refundAttempts: mongoose.trusted({ $not: { $gte: MAX_REFUND_ATTEMPTS } }),
  })
    .select("_id")
    .limit(25)
    .lean();

  for (const item of due) {
    await refundAppointment(item._id, "Appointment cancelled or rejected");
  }

  const stale = await Appointment.find({
    paymentStatus: "refund_pending",
    refundStartedAt: mongoose.trusted({ $lt: new Date(Date.now() - 10 * 60 * 1000) }),
  })
    .select("_id amount razorpayPaymentId")
    .limit(25);

  for (const item of stale) await reconcileStaleRefund(item);
};

// ---------------------------------------------------------------
// PAYMENT SETTLEMENT (verify endpoint aur webhook dono yahi use karte hain)
// payment: { id, order_id, amount, currency, status }
// Outcomes: paid | already_paid | revived | refunded | mismatch | duplicate | not_found
// ---------------------------------------------------------------
export const settlePayment = async ({ appointmentId, orderId, payment }) => {
  const filter = appointmentId
    ? { _id: appointmentId }
    : { razorpayOrderId: orderId };

  const appt = await Appointment.findOne(filter);
  if (!appt) return { outcome: "not_found" };

  if (
    appt.razorpayOrderId !== payment.order_id ||
    payment.amount !== appt.amount ||
    payment.currency !== "INR" ||
    payment.status !== "captured"
  ) {
    console.error(`Payment mismatch for appointment ${appt._id}`);
    return { outcome: "mismatch" };
  }

  // Pehle se process ho chuka (webhook aur verify ek saath aaye)
  if (["paid", "refund_pending", "refunded"].includes(appt.paymentStatus)) {
    return {
      outcome: appt.razorpayPaymentId === payment.id ? "already_paid" : "duplicate",
      appointment: appt,
    };
  }

  const paidFields = {
    paymentStatus: "paid",
    razorpayPaymentId: payment.id,
    paidAt: new Date(),
  };

  try {
    // 1) Normal case: appointment abhi bhi active hai
    const active = await Appointment.findOneAndUpdate(
      {
        _id: appt._id,
        status: mongoose.trusted({ $in: ACTIVE }),
        paymentStatus: mongoose.trusted({ $in: UNPAID }),
      },
      { $set: paidFields, $unset: { expiresAt: 1 } },
      { new: true }
    );
    if (active) return { outcome: "paid", appointment: active };

    // 2) Hold expire ho gaya tha par slot abhi free ho to wapas chalu karo
    const slotInFuture =
      slotStartDate(appt.date, appt.selectedTime).getTime() > Date.now();

    if (appt.status === "cancelled" && appt.cancelledBy === "system" && slotInFuture) {
      try {
        const revived = await Appointment.findOneAndUpdate(
          {
            _id: appt._id,
            status: "cancelled",
            cancelledBy: "system",
            paymentStatus: mongoose.trusted({ $in: UNPAID }),
          },
          {
            $set: { ...paidFields, status: "pending" },
            $unset: { expiresAt: 1, cancelledBy: 1, cancelledAt: 1, cancelReason: 1 },
          },
          { new: true }
        );
        if (revived) return { outcome: "revived", appointment: revived };
      } catch (err) {
        // Unique index: slot kisi aur ne le liya. Neeche refund hoga.
        if (err?.code !== 11000) throw err;
      }
    }

    // 3) Slot gaya, ya appointment cancel/reject ho chuki: payment record karke refund
    await Appointment.updateOne(
      { _id: appt._id, paymentStatus: mongoose.trusted({ $in: UNPAID }) },
      { $set: paidFields, $unset: { expiresAt: 1 } }
    );
  } catch (err) {
    if (err?.code === 11000) return { outcome: "duplicate" };
    throw err;
  }

  await refundAppointment(appt._id, "Slot no longer available");
  return { outcome: "refunded" };
};