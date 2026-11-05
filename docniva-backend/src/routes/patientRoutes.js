import express from "express";

import {
  registerPatient,
  loginPatient,
  logoutPatient,
  getPatientMe,
  verifyPatientEmail,
  resendPatientVerification,
  forgotPatientPassword,
  resetPatientPassword,
} from "../controllers/auth/patientAuthController.js";
import { getPatientDashboard } from "../controllers/patient/patientDashboardController.js";
import {
  getPatientProfile,
  updatePatientProfile,
} from "../controllers/patient/patientProfileController.js";

import { protect, patientOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  loginSchema,
  patientRegisterSchema,
  emailOnlySchema,
  tokenSchema,
  resetPasswordSchema,
} from "../validators/authSchemas.js";

import { updatePatientProfileSchema } from "../validators/profileSchemas.js";

const router = express.Router();

// ---------- AUTH ----------
router.post("/register", validate({ body: patientRegisterSchema }), registerPatient);
router.post("/login", validate({ body: loginSchema }), loginPatient);
router.post("/logout", logoutPatient);
router.post("/verify-email", validate({ body: tokenSchema }), verifyPatientEmail);
router.post("/resend-verification", validate({ body: emailOnlySchema }), resendPatientVerification);
router.post("/forgot-password", validate({ body: emailOnlySchema }), forgotPatientPassword);
router.post("/reset-password", validate({ body: resetPasswordSchema }), resetPatientPassword);
router.get("/me", protect, patientOnly, getPatientMe);

// ---------- DASHBOARD + PROFILE (ye aage ke step me badlenge) ----------
router.get("/dashboard", protect, patientOnly, getPatientDashboard);
router.get("/profile", protect, patientOnly, getPatientProfile);
router.put("/profile", protect, patientOnly, validate({ body: updatePatientProfileSchema }), updatePatientProfile);

// Appointment routes appointmentRoutes.js me hain.

export default router;