
import express from "express";

import {
  registerDoctor,
  loginDoctor,
} from "../controllers/auth/doctorAuthController.js";

// ======================================================
// DOCTOR DIRECTORY CONTROLLER
// ======================================================

import {
  getAllDoctors,
} from "../controllers/doctor/doctorDirectoryController.js";

// ======================================================
// DOCTOR DASHBOARD CONTROLLER
// ======================================================

import {
  getDoctorDashboard,
} from "../controllers/doctor/doctorDashboardController.js";

// ======================================================
// DOCTOR PROFILE CONTROLLER
// ======================================================

import {
  getDoctorProfile,
  updateDoctorProfile,
} from "../controllers/doctor/doctorProfileController.js";

// ======================================================
// DOCTOR APPOINTMENT CONTROLLER
// ======================================================

import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../controllers/doctor/doctorAppointmentController.js";

// ======================================================
// AUTH MIDDLEWARE
// ======================================================

import {
  protect,
  doctorOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// 1. DOCTOR AUTH
// ======================================================

// POST /api/doctors/register
router.post(
  "/register",
  registerDoctor
);

// POST /api/doctors/login
router.post(
  "/login",
  loginDoctor
);

// ======================================================
// 2. DOCTOR DIRECTORY
// ======================================================

// GET /api/doctors
//
// Public route.
// Patient doctors ki list dekh sakta hai.

router.get(
  "/",
  getAllDoctors
);

// ======================================================
// 3. DOCTOR DASHBOARD
// ======================================================

// GET /api/doctors/dashboard

router.get(
  "/dashboard",
  protect,
  doctorOnly,
  getDoctorDashboard
);

// ======================================================
// 4. DOCTOR PROFILE
// ======================================================

// GET /api/doctors/profile

router.get(
  "/profile",
  protect,
  doctorOnly,
  getDoctorProfile
);

// PUT /api/doctors/profile

router.put(
  "/profile",
  protect,
  doctorOnly,
  updateDoctorProfile
);

// ======================================================
// 5. DOCTOR APPOINTMENTS
// ======================================================

// GET /api/doctors/appointments

router.get(
  "/appointments",
  protect,
  doctorOnly,
  getDoctorAppointments
);

// PATCH /api/doctors/appointments/:appointmentId/status

router.patch(
  "/appointments/:appointmentId/status",
  protect,
  doctorOnly,
  updateAppointmentStatus
);

// ======================================================
// 6. DOCTOR SCHEDULE
// ======================================================
//
// IMPORTANT:
//
// Doctor schedule ke routes alag file mein hain:
//
// doctorScheduleRoutes.js
//
// Is file mein schedule routes add nahi karne.
// ======================================================

// ======================================================
// EXPORT
// ======================================================

export default router;

