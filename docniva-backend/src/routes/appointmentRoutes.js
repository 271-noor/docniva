
import express from "express";

// ======================================================
// PATIENT APPOINTMENT CONTROLLER
// ======================================================

import {
  createPatientAppointment,
  getPatientAppointments,
  cancelPatientAppointment,
} from "../controllers/patient/patientAppointmentController.js";

// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

import {
  protect,
  patientOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// CREATE APPOINTMENT
// ======================================================
//
// POST /api/appointments
//
// Logged-in patient appointment create karega.
// ======================================================

router.post(
  "/",
  protect,
  patientOnly,
  createPatientAppointment
);

// ======================================================
// GET PATIENT APPOINTMENTS
// ======================================================
//
// GET /api/appointments
//
// Logged-in patient ke saare appointments.
// Patient ID URL mein nahi deni hai.
// JWT se req.user.id milega.
// ======================================================

router.get(
  "/",
  protect,
  patientOnly,
  getPatientAppointments
);

// ======================================================
// CANCEL APPOINTMENT
// ======================================================
//
// PATCH /api/appointments/:appointmentId/cancel
//
// Patient sirf apna appointment cancel kar sakta hai.
// ======================================================

router.patch(
  "/:appointmentId/cancel",
  protect,
  patientOnly,
  cancelPatientAppointment
);

// ======================================================
// EXPORT
// ======================================================

export default router;

