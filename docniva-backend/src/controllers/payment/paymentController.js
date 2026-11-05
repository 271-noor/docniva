
import Razorpay from "razorpay";
import crypto from "node:crypto";
import Appointment from "../../models/Appointment.js";

// ======================================================
// RAZORPAY CLIENT
// Secret key sirf backend par use hogi.
// ======================================================

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay API keys are missing");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// ======================================================
// CREATE PAYMENT ORDER
// POST /api/appointments/:appointmentId/payment/order
//
// Logged-in patient apne appointment ke liye order banayega.
// Amount database se li jayegi, frontend se nahi.
// ======================================================

export const createPaymentOrder = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const patientId = req.user.id;

    // Sirf logged-in patient ka appointment find karo.
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: patientId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Cancelled ya rejected appointment ke liye payment nahi.
    if (["cancelled", "rejected"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "This appointment cannot be paid for",
      });
    }

    // Paid appointment ke liye doosra order mat banao.
    if (appointment.paymentStatus === "paid") {
      return res.status(409).json({
        success: false,
        message: "Appointment is already paid",
      });
    }

    // Amount integer paise mein honi chahiye.
    if (
      !Number.isSafeInteger(appointment.amount) ||
      appointment.amount < 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment payment amount",
      });
    }

    // Razorpay order create karo.
    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: appointment.amount,
      currency: "INR",
      receipt: appointment._id.toString(),
      notes: {
        appointmentId: appointment._id.toString(),
      },
    });

    // Order ID ko appointment ke saath save karo.
    appointment.razorpayOrderId = order.id;
    appointment.paymentStatus = "pending";
    await appointment.save();

    return res.status(201).json({
      success: true,
      message: "Payment order created",
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create payment order error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
};

// ======================================================
// VERIFY PAYMENT
// POST /api/appointments/:appointmentId/payment/verify
//
// Signature aur Razorpay payment status verify honge.
// Client ke success message par blindly trust nahi karna.
// ======================================================

export const verifyAppointmentPayment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const patientId = req.user.id;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // Required payment details check karo.
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are required",
      });
    }

    // Patient sirf apna appointment verify kar sakta hai.
    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patient: patientId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Pehle se paid appointment ko dobara process mat karo.
    if (appointment.paymentStatus === "paid") {
      if (appointment.razorpayPaymentId === razorpay_payment_id) {
        return res.status(200).json({
          success: true,
          message: "Payment already verified",
          paymentStatus: "paid",
          appointmentStatus: appointment.status,
        });
      }

      return res.status(409).json({
        success: false,
        message: "Appointment is already paid",
      });
    }

    // Order ID database wale order se match honi chahiye.
    if (appointment.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment order does not match appointment",
      });
    }

    // Razorpay secret se expected signature generate karo.
    const secret = process.env.RAZORPAY_KEY_SECRET;

    if (!secret) {
      throw new Error("Razorpay secret key is missing");
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Signature compare karne se pehle length check karo.
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");

    const signatureIsValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!signatureIsValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    // Razorpay se actual payment details fetch karo.
    const razorpay = getRazorpayClient();

    const payment = await razorpay.payments.fetch(
      razorpay_payment_id
    );

    // Payment isi order ki honi chahiye.
    if (
      payment.order_id !== razorpay_order_id ||
      payment.amount !== appointment.amount ||
      payment.currency !== "INR"
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details do not match the appointment",
      });
    }

    // Payment captured hone par hi paid mark karo.
    if (payment.status !== "captured") {
      return res.status(409).json({
        success: false,
        message: "Payment has not been captured yet",
        paymentStatus: payment.status,
      });
    }

    // Verified payment details save karo.
    appointment.paymentStatus = "paid";
    appointment.razorpayPaymentId = razorpay_payment_id;

    // Appointment status ko pending hi rehne do.
    // Doctor ki existing approval process alag rahegi.
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentStatus: appointment.paymentStatus,
      appointmentStatus: appointment.status,
    });
  } catch (error) {
    console.error("Verify payment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to verify payment",
    });
  }
};