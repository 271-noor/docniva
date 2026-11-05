import mongoose from "mongoose";
import { formatTime12h } from "../utils/dateTime.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// Ye statuses slot ko occupied rakhte hain
const ACTIVE_STATUSES = ["pending", "confirmed"];

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },

    // IST date: YYYY-MM-DD
    date: {
      type: String,
      required: true,
      match: [DATE_RE, "Date must be in YYYY-MM-DD format"],
    },

    // 24-hour IST time: HH:mm (jaise "14:30")
    selectedTime: {
      type: String,
      required: true,
      match: [TIME_RE, "Time must be in HH:mm format"],
    },

    consultationType: {
      type: String,
      enum: ["Clinic Visit", "Online"],
      default: "Clinic Visit",
    },

    reason: { type: String, default: "", trim: true, maxlength: 500 },

    // Online consultation ka link (doctor confirm karte waqt dega)
    meetingLink: { type: String, default: "", trim: true, maxlength: 500 },

    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled", "completed", "no-show"],
      default: "pending",
    },

    // Unpaid pending appointment ka slot hold. Payment hone par hata diya jayega.
    expiresAt: { type: Date },

    confirmedAt: { type: Date },

    cancelledBy: { type: String, enum: ["patient", "doctor", "admin", "system"] },
    cancelledAt: { type: Date },
    cancelReason: { type: String, trim: true, maxlength: 300 },
    rejectReason: { type: String, trim: true, maxlength: 300 },

    // ---------- PAYMENT ----------
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    // Paise mein. Rs 500 = 50000
    amount: { type: Number, required: true, min: 100 },

    // Default nahi hai, warna unique index nahi lag sakta
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },

    paidAt: { type: Date },
    refundId: { type: String },
    refundedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        if (typeof ret.selectedTime === "string" && TIME_RE.test(ret.selectedTime)) {
          ret.timeLabel = formatTime12h(ret.selectedTime);
        }
        return ret;
      },
    },
  }
);

// Double booking roke: ek doctor, date aur time par sirf ek active appointment
appointmentSchema.index(
  { doctor: 1, date: 1, selectedTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ACTIVE_STATUSES } },
  }
);

// Ek payment se do appointments na ban sakein
appointmentSchema.index(
  { razorpayOrderId: 1 },
  { unique: true, partialFilterExpression: { razorpayOrderId: { $gt: "" } } }
);
appointmentSchema.index(
  { razorpayPaymentId: 1 },
  { unique: true, partialFilterExpression: { razorpayPaymentId: { $gt: "" } } }
);

// Lists aur dashboards
appointmentSchema.index({ patient: 1, date: -1 });
appointmentSchema.index({ doctor: 1, date: 1, status: 1 });
appointmentSchema.index({ status: 1, paymentStatus: 1, expiresAt: 1 });

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;