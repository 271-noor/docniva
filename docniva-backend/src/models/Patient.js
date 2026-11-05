import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
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

    // Ek phone se ek se zyada account allowed hain (unique nahi)
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?\d{10,15}$/, "Please enter a valid phone number"],
    },

    // 0 = 1 saal se chhota bachha
    age: { type: Number, min: 0, max: 120 },

    gender: { type: String, enum: ["Male", "Female", "Other"] },

    city: { type: String, trim: true, maxlength: 80 },

    // bcrypt hash store hota hai
    password: { type: String, required: true, select: false },

    // Admin kisi ko block kar sake
    isBlocked: { type: Boolean, default: false },

    // Email verification
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: undefined, select: false },
    emailVerificationExpires: { type: Date, default: undefined, select: false },

    // Is time se pehle bane tokens invalid maane jayenge
    passwordChangedAt: { type: Date, select: false },

    // Account lockout
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },

    // Password reset (token ka hash)
    resetPasswordToken: { type: String, default: undefined, select: false },
    resetPasswordExpires: { type: Date, default: undefined, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordChangedAt;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
  }
);

patientSchema.index({ resetPasswordToken: 1 }, { sparse: true });
patientSchema.index({ emailVerificationToken: 1 }, { sparse: true });

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;