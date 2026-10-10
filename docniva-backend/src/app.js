
import express from "express";
import cors from "cors";

import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorScheduleRoutes from "./routes/doctorScheduleRoutes.js";

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());

// ======================================================
// PATIENT ROUTES
// ======================================================

app.use(
  "/api/patients",
  patientRoutes
);

// ======================================================
// DOCTOR ROUTES
// ======================================================

app.use(
  "/api/doctors",
  doctorRoutes
);

// ======================================================
// DOCTOR SCHEDULE ROUTES
// ======================================================

app.use(
  "/api/doctors/schedule",
  doctorScheduleRoutes
);

// ======================================================
// APPOINTMENT ROUTES
// ======================================================

app.use(
  "/api/appointments",
  appointmentRoutes
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DocNiva API is running",
  });
});

// ======================================================
// DEFAULT EXPORT
// ======================================================

export default app;

