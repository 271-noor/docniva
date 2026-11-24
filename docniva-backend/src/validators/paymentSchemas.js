import { z } from "zod";

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z
    .string({ error: "Order id is required" })
    .regex(/^order_[A-Za-z0-9]{6,40}$/, "Invalid order id"),
  razorpay_payment_id: z
    .string({ error: "Payment id is required" })
    .regex(/^pay_[A-Za-z0-9]{6,40}$/, "Invalid payment id"),
  razorpay_signature: z
    .string({ error: "Signature is required" })
    .regex(/^[a-f0-9]{64}$/i, "Invalid signature"),
});