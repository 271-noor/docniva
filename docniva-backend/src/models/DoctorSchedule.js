import mongoose from "mongoose";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TYPES = ["Clinic Visit", "Online"];

const timeField = {
  type: String,
  match: [TIME_RE, "Time must be in HH:mm format"],
};

const weeklyDaySchema = new mongoose.Schema(
  {
    day: { type: String, enum: DAYS, required: true },
    startTime: { ...timeField, required: true },
    endTime: { ...timeField, required: true },
    breakStart: timeField,
    breakEnd: timeField,
  },
  { _id: false }
);

const dateExceptionSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
      match: [DATE_RE, "Exception date must be in YYYY-MM-DD format"],
    },
    // false = doctor us din available nahi hai
    isAvailable: { type: Boolean, default: false },
    // Khali = weekly slots use honge
    timeSlots: { type: [{ ...timeField }], default: [] },
    // Khali = weekly consultation types use honge
    consultationTypes: { type: [{ type: String, enum: TYPES }], default: [] },
    // Sirf doctor ko dikhega, patient ko nahi
    reason: { type: String, default: "", trim: true, maxlength: 200 },
  },
  { _id: false }
);

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },

    // Har available din ki apni timing
    weekly: { type: [weeklyDaySchema], default: [] },

    slotDurationMinutes: {
      type: Number,
      enum: [15, 20, 30, 45, 60],
      default: 30,
    },

    consultationTypes: {
      type: [{ type: String, enum: TYPES }],
      default: ["Clinic Visit"],
    },

    // Booking rules
    maxAdvanceDays: { type: Number, default: 30, min: 1, max: 90 },
    minNoticeMinutes: { type: Number, default: 60, min: 0, max: 1440 },

    dateExceptions: { type: [dateExceptionSchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

const DoctorSchedule = mongoose.model("DoctorSchedule", doctorScheduleSchema);

export default DoctorSchedule;