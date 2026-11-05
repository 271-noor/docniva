import express from "express";

import {
  createPatientAppointment,
  getPatientAppointments,
  cancelPatientAppointment,
} from "../controllers/patient/patientAppointmentController.js";
import {
  createPaymentOrder,
  verifyAppointmentPayment,
} from "../controllers/payment/paymentController.js";

import { protect, patientOnly } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createAppointmentSchema,
  appointmentIdParams,
} from "../validators/bookingSchemas.js";

const router = express.Router();

// Is file ke saare routes sirf logged-in patient ke liye hain
router.use(protect, patientOnly);

router.post("/", validate({ body: createAppointmentSchema }), createPatientAppointment);
router.get("/", getPatientAppointments);
router.patch(
  "/:appointmentId/cancel",
  validate({ params: appointmentIdParams }),
  cancelPatientAppointment
);

// Payment (ye Step 5 mein badlega)
router.post(
  "/:appointmentId/payment/order",
  validate({ params: appointmentIdParams }),
  createPaymentOrder
);
router.post(
  "/:appointmentId/payment/verify",
  validate({ params: appointmentIdParams }),
  verifyAppointmentPayment
);

export default router;