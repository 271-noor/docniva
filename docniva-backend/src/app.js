import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import { sanitizeBody } from "./middleware/sanitize.js";
import { csrfGuard } from "./middleware/csrf.js";
import { razorpayWebhook } from "./controllers/payment/webhookController.js";

import patientRoutes from "./routes/patientRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import doctorScheduleRoutes from "./routes/doctorScheduleRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js"; // admin step me

const app = express();
const isProd = process.env.NODE_ENV === "production";

// Render/Railway proxy ke peeche hote hain (rate-limit + secure cookie ke liye)
app.set("trust proxy", 1);
app.disable("x-powered-by");

// ---------- SECURITY ----------
app.use(helmet());

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // origin undefined = Postman/server-to-server (webhook), allow
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      const err = new Error("Not allowed by CORS");
      err.statusCode = 403;
      cb(err);
    },
    credentials: true,
    maxAge: 600,
  })
);

// ---------- RAZORPAY WEBHOOK ----------
// Raw body zaroori hai (signature check), isliye json parser se PEHLE
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json", limit: "100kb" }),
  razorpayWebhook
);

// ---------- HEALTH (rate limit se pehle) ----------
app.get("/api/health", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    success: dbUp,
    message: dbUp ? "DocNiva API is running" : "Database not connected",
    uptime: Math.round(process.uptime()),
  });
});

// ---------- RATE LIMITING (body parse se PEHLE) ----------
const makeLimiter = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });

const apiLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: { success: false, message: "Too many requests, try again later" },
});

// Login: sirf failed attempts gine jayenge
const loginLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: { success: false, message: "Too many login attempts, try again later" },
});

const registerLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { success: false, message: "Too many attempts, try again later" },
});

// Forgot/reset/verify mail: email bombing rokne ke liye strict
const passwordLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { success: false, message: "Too many requests, try again in an hour" },
});

const paymentLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { success: false, message: "Too many payment requests, try again later" },
});

app.use("/api", apiLimiter);
app.use(["/api/patients/login", "/api/doctors/login"], loginLimiter);
app.use(["/api/patients/register", "/api/doctors/register"], registerLimiter);
app.use(
  [
    "/api/patients/forgot-password",
    "/api/patients/reset-password",
    "/api/patients/resend-verification",
    "/api/doctors/forgot-password",
    "/api/doctors/reset-password",
  ],
  passwordLimiter
);
app.use("/api/appointments/:appointmentId/payment", paymentLimiter);

// ---------- BODY PARSING ----------
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(cookieParser());
app.use(sanitizeBody);
app.use(csrfGuard);

// ---------- ROUTES ----------
app.use("/api/patients", patientRoutes);
// IMPORTANT: specific route (schedule) pehle, generic (/api/doctors) baad me
app.use("/api/doctors/schedule", doctorScheduleRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);
// app.use("/api/admin", adminRoutes);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ---------- GLOBAL ERROR HANDLER (hamesha sabse last) ----------
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  let status = err.statusCode || err.status || 500;
  let message = err.message;

  if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body too large";
  } else if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = "Invalid ID format";
  } else if (err.code === 11000) {
    status = 409;
    message = "Record already exists";
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Invalid or expired token";
  }

  if (status >= 500) console.error(err);

  res.status(status).json({
    success: false,
    message: status >= 500 && isProd ? "Something went wrong" : message,
  });
});

export default app;