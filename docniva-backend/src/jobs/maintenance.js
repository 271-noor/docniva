import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import { releaseExpiredHolds } from "../services/bookingService.js";
import { processPendingRefunds } from "../services/paymentService.js";
import { todayIST } from "../utils/dateTime.js";

const INTERVAL_MS = 60 * 1000;
const DOCTOR_REPLY_HOURS = 24;

let timer = null;
let running = false;

// Paid par doctor ne jawab nahi diya (ya appointment ka din nikal gaya): reject, phir refund
const autoRejectUnanswered = async () => {
  const reject = {
    $set: {
      status: "rejected",
      rejectReason: "The doctor did not respond in time",
      cancelledBy: "system",
      cancelledAt: new Date(),
    },
  };

  await Appointment.updateMany(
    {
      status: "pending",
      paymentStatus: "paid",
      paidAt: mongoose.trusted({
        $lt: new Date(Date.now() - DOCTOR_REPLY_HOURS * 60 * 60 * 1000),
      }),
    },
    reject
  );

  await Appointment.updateMany(
    {
      status: "pending",
      paymentStatus: "paid",
      date: mongoose.trusted({ $lt: todayIST() }),
    },
    reject
  );
};

const tick = async () => {
  if (running || mongoose.connection.readyState !== 1) return;
  running = true;

  try {
    await releaseExpiredHolds();
    await autoRejectUnanswered();
    await processPendingRefunds();
  } catch (err) {
    console.error("Maintenance job error:", err.message);
  } finally {
    running = false;
  }
};

export const startJobs = () => {
  if (timer) return;
  timer = setInterval(tick, INTERVAL_MS);
  timer.unref();
  tick();
};

export const stopJobs = () => {
  if (timer) clearInterval(timer);
  timer = null;
};