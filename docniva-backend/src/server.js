import "dotenv/config";
import mongoose from "mongoose";

import app from "./app.js";
import connectDB from "./config/db.js";
import { startJobs, stopJobs } from "./jobs/maintenance.js";

// ---------- ENV VALIDATION ----------
const required = ["MONGO_URI", "JWT_SECRET", "CLIENT_URL"];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required env variables: ${missing.join(", ")}`);
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET kam se kam 32 characters ka hona chahiye");
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  const productionVars = [
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "RESEND_API_KEY",
    "EMAIL_FROM",
  ];
  const missingProd = productionVars.filter((key) => !process.env[key]);

  if (missingProd.length > 0) {
    console.error(`Missing required env variables: ${missingProd.join(", ")}`);
    process.exit(1);
  }

  if (
    process.env.RAZORPAY_KEY_ID.startsWith("rzp_test_") &&
    process.env.ALLOW_TEST_PAYMENTS !== "true"
  ) {
    console.error("Production me rzp_test_ key use nahi ho sakti");
    process.exit(1);
  }
}

const PORT = Number(process.env.PORT) || 5000;
let server;
let isShuttingDown = false;

// ---------- START ----------
const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(
        `DocNiva backend running on port ${PORT} (${process.env.NODE_ENV || "development"})`
      );
      startJobs();
    });

    // Port busy jaisi listen errors yahin aati hain
    server.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });

    // Slow client attacks se bachne ke liye
    server.keepAliveTimeout = 65 * 1000;
    server.headersTimeout = 66 * 1000;
    server.requestTimeout = 30 * 1000;
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

// ---------- GRACEFUL SHUTDOWN ----------
const shutdown = (reason, exitCode = 0) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${reason} received, shutting down gracefully...`);
  stopJobs();

  // 10 sec me band na ho to force exit
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10 * 1000).unref();

  if (!server) return process.exit(exitCode);

  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log("Server and DB connection closed");
      process.exit(exitCode);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  });

  // Idle keep-alive connections band karo, warna close() atka rehta hai
  server.closeIdleConnections?.();
};

process.on("SIGTERM", () => shutdown("SIGTERM", 0));
process.on("SIGINT", () => shutdown("SIGINT", 0));

// ---------- SAFETY NETS (crash = exit code 1) ----------
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  shutdown("unhandledRejection", 1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown("uncaughtException", 1);
});

startServer();