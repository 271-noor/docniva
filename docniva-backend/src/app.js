import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { sanitizeBody } from "./middleware/sanitize.js";

import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorScheduleRoutes from "./routes/doctorScheduleRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";   // banane ke baad
// import adminRoutes from "./routes/adminRoutes.js";       // banane ke baad

const app = express();

// Render/Railway proxy ke peeche hote hain (rate-limit + secure cookie ke liye)
app.set("trust proxy", 1);
app.disable("x-powered-by");

// ---------- SECURITY ----------
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // origin undefined = Postman/server-to-server, allow
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      const err = new Error("Not allowed by CORS");
      err.statusCode = 403;
      cb(err);
    },
    credentials: true,
  })
);

// Razorpay webhook ke liye raw body chahiye hoga, usko json se PEHLE mount karna
// app.use("/api/payments/webhook", express.raw({ type: "application/json" }), webhookHandler);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cookieParser());
app.use(sanitizeBody);

// ---------- HEALTH (rate limit se pehle) ----------
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "DocNiva API is running" });
});

// ---------- RATE LIMITING ----------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, try again later" },
});

app.use("/api", apiLimiter);
// Apne actual login/register/forgot paths ke hisaab se adjust karo:
app.use("/api/patients/login", authLimiter);
app.use("/api/patients/register", authLimiter);
app.use("/api/patients/forgot-password", authLimiter);
app.use("/api/doctors/login", authLimiter);
app.use("/api/doctors/register", authLimiter);
app.use("/api/doctors/forgot-password", authLimiter);

// ---------- ROUTES ----------
app.use("/api/patients", patientRoutes);
// IMPORTANT: specific route (schedule) pehle, generic (/api/doctors) baad me
app.use("/api/doctors/schedule", doctorScheduleRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
// app.use("/api/payments", paymentRoutes);
// app.use("/api/admin", adminRoutes);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ---------- GLOBAL ERROR HANDLER (hamesha sabse last) ----------
app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message:
      status >= 500 && process.env.NODE_ENV === "production"
        ? "Something went wrong"
        : err.message,
  });
});

export default app;