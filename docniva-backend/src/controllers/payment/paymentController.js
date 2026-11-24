import Appointment from "../../models/Appointment.js";
import { releaseExpiredHolds } from "../../services/bookingService.js";
import {
  getRazorpay,
  isSignatureValid,
  razorpayErrorMessage,
  settlePayment,
} from "../../services/paymentService.js";
import { slotStartDate } from "../../utils/dateTime.js";

const PAYMENT_WINDOW_MINUTES = 15;
const ACTIVE = ["pending", "confirmed"];

const fail = (res, code, message, extra = {}) =>
  res.status(code).json({ success: false, message, ...extra });

// POST /api/appointments/:appointmentId/payment/order
export const createPaymentOrder = async (req, res) => {
  const { appointmentId } = req.validated.params;
  const patientId = req.user.id;

  await releaseExpiredHolds({ patient: patientId });

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patient: patientId,
  });

  if (!appointment) return fail(res, 404, "Appointment not found");

  if (!ACTIVE.includes(appointment.status)) {
    return fail(
      res,
      409,
      appointment.cancelledBy === "system"
        ? "The payment time has expired and the slot was released. Please book again."
        : "This appointment cannot be paid for"
    );
  }

  if (appointment.paymentStatus === "paid") {
    return fail(res, 409, "Appointment is already paid");
  }
  if (!["pending", "failed"].includes(appointment.paymentStatus)) {
    return fail(res, 409, "This payment is being refunded");
  }

  if (slotStartDate(appointment.date, appointment.selectedTime).getTime() <= Date.now()) {
    return fail(res, 409, "This appointment time has already passed");
  }

  if (!Number.isSafeInteger(appointment.amount) || appointment.amount < 100) {
    return fail(res, 400, "Invalid appointment payment amount");
  }

  let orderId = appointment.razorpayOrderId;

  // Order pehle se bana hai to wahi dobara use karo (naya mat banao)
  if (!orderId) {
    let order;
    try {
      order = await getRazorpay().orders.create({
        amount: appointment.amount,
        currency: "INR",
        receipt: String(appointment._id),
        notes: { appointmentId: String(appointment._id) },
      });
    } catch (err) {
      console.error("Razorpay order create failed:", razorpayErrorMessage(err));
      return fail(res, 502, "Payment service is unavailable. Please try again shortly.");
    }

    const update = { razorpayOrderId: order.id };
    // Pay karne ke liye hold 15 minute tak badhao (sirf pehle order par)
    if (appointment.status === "pending") {
      update.expiresAt = new Date(Date.now() + PAYMENT_WINDOW_MINUTES * 60 * 1000);
    }

    const stored = await Appointment.findOneAndUpdate(
      { _id: appointment._id, razorpayOrderId: null },
      { $set: update },
      { new: true }
    );

    if (stored) {
      orderId = order.id;
    } else {
      // Do click ek saath aaye the, jo pehle save hua wahi rakho
      const current = await Appointment.findById(appointment._id).select("razorpayOrderId");
      orderId = current?.razorpayOrderId;
    }
  }

  if (!orderId) return fail(res, 500, "Unable to create payment order");

  return res.status(201).json({
    success: true,
    message: "Payment order created",
    order: { id: orderId, amount: appointment.amount, currency: "INR" },
    keyId: process.env.RAZORPAY_KEY_ID,
  });
};

// POST /api/appointments/:appointmentId/payment/verify
export const verifyAppointmentPayment = async (req, res) => {
  const { appointmentId } = req.validated.params;
  const {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  } = req.validated.body;

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patient: req.user.id,
  });

  if (!appointment) return fail(res, 404, "Appointment not found");

  if (appointment.razorpayOrderId !== orderId) {
    return fail(res, 400, "Payment order does not match appointment");
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("Razorpay secret key is missing");

  if (!isSignatureValid(`${orderId}|${paymentId}`, signature, secret)) {
    return fail(res, 400, "Invalid payment signature");
  }

  let payment;
  try {
    payment = await getRazorpay().payments.fetch(paymentId);
  } catch (err) {
    console.error("Razorpay payment fetch failed:", razorpayErrorMessage(err));
    return fail(res, 502, "Unable to confirm payment right now. If money was deducted, it will be confirmed automatically.");
  }

  if (payment.order_id !== orderId) {
    return fail(res, 400, "Payment details do not match the appointment");
  }

  if (payment.status === "authorized") {
    return fail(
      res,
      409,
      "Payment received. It will be confirmed automatically within a few minutes.",
      { paymentStatus: "pending" }
    );
  }

  if (payment.status !== "captured") {
    return fail(res, 409, "Payment has not been completed", {
      paymentStatus: payment.status,
    });
  }

  const result = await settlePayment({ appointmentId: appointment._id, payment });

  switch (result.outcome) {
    case "paid":
    case "already_paid":
    case "revived":
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        paymentStatus: "paid",
        appointmentStatus: result.appointment?.status || appointment.status,
      });

    case "refunded":
      return fail(
        res,
        409,
        "Your slot is no longer available, so your payment is being refunded. It reaches your account in 5-7 working days.",
        { paymentStatus: "refund_pending" }
      );

    default:
      return fail(res, 409, "Payment could not be matched to this appointment. If money was deducted, contact support.");
  }
};