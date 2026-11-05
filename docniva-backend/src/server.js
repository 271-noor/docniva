import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";
import mongoose from "mongoose";

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

const PORT = process.env.PORT || 5000;
let server;

// ---------- START ----------
const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(
        `DocNiva backend running on port ${PORT} (${process.env.NODE_ENV || "development"})`
      );
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
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);

  if (!server) process.exit(0);

  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log("Server and DB connection closed");
      process.exit(0);
    } catch (err) {
      console.error("Error during shutdown:", err);
      process.exit(1);
    }
  });

  // 10 sec me band na ho to force exit
  setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10 * 1000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// ---------- SAFETY NETS ----------
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  shutdown("unhandledRejection");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown("uncaughtException");
});

startServer();