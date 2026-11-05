import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?\d{10,15}$/, "Please enter a valid phone number"],
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },

    qualification: { type: String, required: true, trim: true, maxlength: 150 },

    specialization: { type: String, required: true, trim: true, maxlength: 80 },

    experience: { type: Number, required: true, min: 0, max: 70 },

        // Patient ko doctor ke public page par dikhte hain
    city: { type: String, trim: true, maxlength: 80 },
    about: { type: String, trim: true, maxlength: 1000 },

    // Consultation fee in INR (rupees). Payment ke time backend isse paise banata hai.
    consultationFee: {
      type: Number,
      required: true,
      default: 500,
      min: 100,
      max: 5000,
      validate: {
        validator: Number.isInteger,
        message: "Consultation fee must be a whole number",
      },
    },

    // bcrypt hash store hota hai
    password: { type: String, required: true, select: false },

    // Admin approve karega tab hi doctor public list me dikhega aur login kar payega
    isVerified: { type: Boolean, default: false },

    // Admin kisi ko block kar sake
    isBlocked: { type: Boolean, default: false },

    // Is time se pehle bane tokens invalid maane jayenge (password change/reset ke baad)
    passwordChangedAt: { type: Date, select: false },

    // Account lockout (bar bar galat password)
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },

    // Password reset (token ka hash store hota hai, asli token nahi)
    resetPasswordToken: { type: String, default: undefined, select: false },
    resetPasswordExpires: { type: Date, default: undefined, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.passwordChangedAt;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
  }
);

// Public doctor list: verified + not blocked + specialization filter
doctorSchema.index({ isVerified: 1, isBlocked: 1, specialization: 1 });

// Password reset lookup
doctorSchema.index({ resetPasswordToken: 1 }, { sparse: true });

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;