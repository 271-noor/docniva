
import express from "express";

// ======================================================
// PATIENT AUTH CONTROLLER
// ======================================================

import {
  registerPatient,
  loginPatient,
} from "../controllers/auth/patientAuthController.js";

// ======================================================
// PATIENT DASHBOARD CONTROLLER
// ======================================================

import {
  getPatientDashboard,
} from "../controllers/patient/patientDashboardController.js";

// ======================================================
// PATIENT PROFILE CONTROLLER
// ======================================================

import {
  getPatientProfile,
  updatePatientProfile,
} from "../controllers/patient/patientProfileController.js";

// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

import {
  protect,
  patientOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// 1. PATIENT AUTH ROUTES
// ======================================================

// ------------------------------------------------------
// PATIENT REGISTER
// ------------------------------------------------------
// POST /api/patients/register
//
// Body:
// {
//   name,
//   email,
//   phone,
//   password
// }
// ------------------------------------------------------

router.post(
  "/register",
  registerPatient
);

// ------------------------------------------------------
// PATIENT LOGIN
// ------------------------------------------------------
// POST /api/patients/login
//
// Body:
// {
//   email,
//   password
// }
// ------------------------------------------------------

router.post(
  "/login",
  loginPatient
);

// ======================================================
// 2. PATIENT DASHBOARD
// ======================================================

// ------------------------------------------------------
// GET PATIENT DASHBOARD
// ------------------------------------------------------
// GET /api/patients/dashboard
//
// Login required.
// JWT token required.
// ------------------------------------------------------

router.get(
  "/dashboard",
  protect,
  patientOnly,
  getPatientDashboard
);

// ======================================================
// 3. PATIENT PROFILE
// ======================================================

// ------------------------------------------------------
// GET PATIENT PROFILE
// ------------------------------------------------------
// GET /api/patients/profile
//
// Login required.
// ------------------------------------------------------

router.get(
  "/profile",
  protect,
  patientOnly,
  getPatientProfile
);

// ------------------------------------------------------
// UPDATE PATIENT PROFILE
// ------------------------------------------------------
// PUT /api/patients/profile
//
// Body:
// {
//   name,
//   phone,
//   age,
//   gender,
//   city
// }
//
// Email update nahi hoga.
// Login required.
// ------------------------------------------------------

router.put(
  "/profile",
  protect,
  patientOnly,
  updatePatientProfile
);

// ======================================================
// IMPORTANT
// ======================================================
//
// Patient appointment routes yahan nahi hain.
//
// Appointments ke liye separate:
// appointmentRoutes.js
//
// POST   /api/appointments
// GET    /api/appointments
// PATCH  /api/appointments/:appointmentId/cancel
//
// ======================================================

export default router;

