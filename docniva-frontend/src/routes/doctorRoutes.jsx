
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
// Login required nahi hai.
//
// Patient is API se available doctors ki list
// dekh sakta hai.
// ======================================================

router.get(
  "/",
  getAllDoctors
);




// ======================================================
// 2. DOCTOR DASHBOARD
// ======================================================

// GET /api/doctors/dashboard
//
// Login required
// Doctor only

router.get(
  "/dashboard",
  protect,
  doctorOnly,
  getDoctorDashboard
);


// ======================================================
// 3. DOCTOR PROFILE
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
// 4. DOCTOR APPOINTMENTS
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


export default router;

