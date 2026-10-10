
import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    // Patient reference
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    // Doctor reference
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    selectedTime: {
      type: String,
      required: true,
    },

    consultationType: {
      type: String,
      enum: ["Clinic Visit", "Online"],
      default: "Clinic Visit",
    },

    reason: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.model(
  "Appointment",
  appointmentSchema
);

export default Appointment;

