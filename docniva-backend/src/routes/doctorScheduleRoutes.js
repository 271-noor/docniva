import express from "express";

import {
  getDoctorSchedule,
  updateDoctorSchedule,
  upsertDateException,
  deleteDateException,
} from "../controllers/doctor/doctorScheduleController.js";

import { protect, doctorOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  updateScheduleSchema,
  exceptionSchema,
  exceptionDateParams,
} from "../validators/scheduleSchemas.js";

const router = express.Router();

// Ye saare routes sirf logged-in doctor ke liye hain
router.use(protect, doctorOnly);

// GET /api/doctors/schedule
router.get("/", getDoctorSchedule);

// PUT /api/doctors/schedule
router.put("/", validate({ body: updateScheduleSchema }), updateDoctorSchedule);

// PUT /api/doctors/schedule/exception
router.put("/exception", validate({ body: exceptionSchema }), upsertDateException);

// DELETE /api/doctors/schedule/exception/:date
router.delete(
  "/exception/:date",
  validate({ params: exceptionDateParams }),
  deleteDateException
);

export default router;