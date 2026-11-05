import express from "express";

import {
  registerDoctor,
  loginDoctor,
  logoutDoctor,
  getDoctorMe,
  forgotDoctorPassword,
  resetDoctorPassword,
} from "../controllers/auth/doctorAuthController.js";
import {
  getAllDoctors,
  getDoctorById,
  getDoctorSlots,
} from "../controllers/doctor/doctorDirectoryController.js";
import { getDoctorDashboard } from "../controllers/doctor/doctorDashboardController.js";
import {
  getDoctorProfile,
  updateDoctorProfile,
} from "../controllers/doctor/doctorProfileController.js";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../controllers/doctor/doctorAppointmentController.js";

import { protect, doctorOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  loginSchema,
  doctorRegisterSchema,
  emailOnlySchema,
  resetPasswordSchema,
} from "../validators/authSchemas.js";
import {
  doctorIdParams,
  doctorListQuery,
  slotsQuery,
} from "../validators/bookingSchemas.js";

const router = express.Router();

// ---------- AUTH ----------
router.post("/register", validate({ body: doctorRegisterSchema }), registerDoctor);
router.post("/login", validate({ body: loginSchema }), loginDoctor);
router.post("/logout", logoutDoctor);
router.post("/forgot-password", validate({ body: emailOnlySchema }), forgotDoctorPassword);
router.post("/reset-password", validate({ body: resetPasswordSchema }), resetDoctorPassword);
router.get("/me", protect, doctorOnly, getDoctorMe);

// ---------- PUBLIC DIRECTORY ----------
router.get("/", validate({ query: doctorListQuery }), getAllDoctors);

// ---------- DOCTOR (login zaroori) ----------
router.get("/dashboard", protect, doctorOnly, getDoctorDashboard);
router.get("/profile", protect, doctorOnly, getDoctorProfile);
router.put("/profile", protect, doctorOnly, updateDoctorProfile);
router.get("/appointments", protect, doctorOnly, getDoctorAppointments);
router.patch("/appointments/:appointmentId/status", protect, doctorOnly, updateAppointmentStatus);

// ---------- PUBLIC DOCTOR (hamesha sabse neeche, "/:doctorId" baaki paths ko na pakde) ----------
router.get(
  "/:doctorId/slots",
  validate({ params: doctorIdParams, query: slotsQuery }),
  getDoctorSlots
);
router.get("/:doctorId", validate({ params: doctorIdParams }), getDoctorById);

// Schedule routes doctorScheduleRoutes.js me hain.

export default router;