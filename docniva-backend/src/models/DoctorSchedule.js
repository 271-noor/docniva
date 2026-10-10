
import mongoose from "mongoose";

const doctorScheduleSchema = new mongoose.Schema(
  {
    // --------------------------------------------------
    // DOCTOR REFERENCE
    // --------------------------------------------------

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },

    // --------------------------------------------------
    // WEEKLY AVAILABLE DAYS
    // --------------------------------------------------

    availableDays: {
      type: [String],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      default: [],
    },

    // --------------------------------------------------
    // WEEKLY AVAILABLE TIME SLOTS
    // --------------------------------------------------

    timeSlots: {
      type: [String],
      default: [],
    },

    // --------------------------------------------------
    // CONSULTATION TYPES
    // --------------------------------------------------

    consultationTypes: {
      type: [String],
      enum: ["Clinic Visit", "Online"],
      default: ["Clinic Visit"],
    },

    // --------------------------------------------------
    // DATE-SPECIFIC EXCEPTIONS
    // --------------------------------------------------
    //
    // Example:
    //
    // {
    //   date: "2026-10-12",
    //   isAvailable: false,
    //   reason: "Doctor on leave"
    // }
    //
    // Ya:
    //
    // {
    //   date: "2026-10-15",
    //   isAvailable: true,
    //   timeSlots: ["10:00 AM", "11:00 AM"]
    // }
    //
    // Isse weekly schedule ke upar specific-date
    // availability control kar sakte hain.
    // --------------------------------------------------

    dateExceptions: [
      {
        date: {
          type: String,
          required: true,
        },

        isAvailable: {
          type: Boolean,
          default: false,
        },

        timeSlots: {
          type: [String],
          default: [],
        },

        consultationTypes: {
          type: [String],
          enum: ["Clinic Visit", "Online"],
          default: [],
        },

        reason: {
          type: String,
          default: "",
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const DoctorSchedule = mongoose.model(
  "DoctorSchedule",
  doctorScheduleSchema
);

export default DoctorSchedule;

