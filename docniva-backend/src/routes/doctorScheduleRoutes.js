
import express from "express";

import {
  getDoctorSchedule,
  getDoctorScheduleForPatient,
  updateDoctorSchedule,
  updateDoctorDateException,
} from "../controllers/doctor/doctorScheduleController.js";

import {
  protect,
  doctorOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ======================================================
// DOCTOR - GET OWN SCHEDULE
// GET /api/doctors/schedule
// ======================================================

router.get(
  "/",
  protect,
  doctorOnly,
  getDoctorSchedule
);

// ======================================================
// DOCTOR - UPDATE OWN WEEKLY SCHEDULE
// PUT /api/doctors/schedule
// ======================================================

router.put(
  "/",
  protect,
  doctorOnly,
  updateDoctorSchedule
);

// ======================================================
// DOCTOR - ADD / UPDATE DATE EXCEPTION
// PUT /api/doctors/schedule/exception
// ======================================================

router.put(
  "/exception",
  protect,
  doctorOnly,
  updateDoctorDateException
);

// ======================================================
// PATIENT - GET SPECIFIC DOCTOR SCHEDULE
// GET /api/doctors/schedule/doctor/:doctorId
// ======================================================
//
// Public route.
// Patient kisi specific doctor ka schedule dekh sakta hai.
//
// ======================================================

router.get(
  "/doctor/:doctorId",
  getDoctorScheduleForPatient
);

// ======================================================
// EXPORT
// ======================================================

export default router;

