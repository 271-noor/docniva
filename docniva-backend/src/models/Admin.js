import mongoose from "mongoose";

// Admin register nahi hota (public signup nahi hai).
// Admin ek seed script se banega, wo admin step mein dungi.
const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    password: { type: String, required: true, select: false },

    isActive: { type: Boolean, default: true },

    passwordChangedAt: { type: Date, select: false },

    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.password;
        delete ret.passwordChangedAt;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
  }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;