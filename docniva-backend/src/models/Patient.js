
import mongoose from "mongoose";

// ========================================
// PATIENT SCHEMA
// ========================================

const patientSchema = new mongoose.Schema(
  {
    // Patient ka full name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Patient ka email
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // Patient ka mobile number
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // Patient ki age
    age: {
      type: Number,
      min: 1,
      max: 120,
    },

    // Patient ka gender
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    // Patient ka city
    city: {
      type: String,
      trim: true,
    },

    // Password database me plain text me store nahi hoga
    // Register API me bcrypt se hash kiya jayega
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    // createdAt aur updatedAt automatically add honge
    timestamps: true,
  }
);

// ========================================
// MODEL
// ========================================

const Patient = mongoose.model(
  "Patient",
  patientSchema
);

export default Patient;

