import mongoose from "mongoose";
import Appointment from "../../models/Appointment.js";
import { isSignatureValid, settlePayment } from "../../services/paymentService.js";

const str = (value) => (typeof value === "string" ? value : null);

const handleEvent = async (event) => {
  const type = event?.event;
  const payload = event?.payload || {};

  if (type === "payment.captured") {
    const p = payload.payment?.entity;
    if (!p || !str(p.id) || !str(p.order_id)) return;

    const result = await settlePayment({
      orderId: p.order_id,
      payment: {
        id: p.id,
        order_id: p.order_id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
      },
    });

    console.log(`Webhook payment.captured ${p.id}: ${result.outcome}`);
    return;
  }

  if (type === "payment.failed") {
    const p = payload.payment?.entity;
    if (!p || !str(p.order_id)) return;

    // Sirf pending se failed. Patient dobara try kar sakta hai.
    await Appointment.updateOne(
      { razorpayOrderId: p.order_id, paymentStatus: "pending" },
      { $set: { paymentStatus: "failed" } }
    );
    return;
  }

  if (type === "refund.processed") {
    const r = payload.refund?.entity;
    if (!r || !str(r.payment_id) || !str(r.id)) return;

    await Appointment.updateOne(
      { razorpayPaymentId: r.payment_id, paymentStatus: "refund_pending" },
      {
        $set: { paymentStatus: "refunded", refundId: r.id, refundedAt: new Date() },
        $unset: { refundStartedAt: 1 },
      }
    );
    return;
  }

  if (type === "refund.failed") {
    const r = payload.refund?.entity;
    if (!r || !str(r.payment_id)) return;

    console.error(`Refund FAILED at Razorpay for payment ${r.payment_id}`);

    // Wapas paid, taaki sweep dobara try kare (attempts ki limit hai)
    await Appointment.updateOne(
      {
        razorpayPaymentId: r.payment_id,
        paymentStatus: mongoose.trusted({ $in: ["refund_pending", "refunded"] }),
      },
      {
        $set: { paymentStatus: "paid" },
        $unset: { refundId: 1, refundedAt: 1, refundStartedAt: 1 },
      }
    );
  }
};

// POST /api/payments/webhook  (raw body, app.js me express.json se PEHLE mount hota hai)
export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set");
    return res.status(503).json({ success: false });
  }

  const raw = req.body;
  const signature = req.get("x-razorpay-signature");

  if (!Buffer.isBuffer(raw) || !isSignatureValid(raw, signature, secret)) {
    return res.status(400).json({ success: false, message: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(400).json({ success: false, message: "Invalid payload" });
  }

  try {
    await handleEvent(event);
  } catch (err) {
    // 500 dene par Razorpay baad me dobara bhejta hai
    console.error("Webhook processing error:", err.message);
    return res.status(500).json({ success: false });
  }

  return res.status(200).json({ success: true });
};