import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import { resolveDay } from "../utils/slots.js";
import {
  addDaysToDateString,
  formatTime12h,
  slotStartDate,
  todayIST,
} from "../utils/dateTime.js";

export const HOLD_MINUTES = 10;
export const ACTIVE_STATUSES = ["pending", "confirmed"];

// Payment ke bina jo hold 10 minute se purane ho gaye, unhe cancel karke slot free karo
export const releaseExpiredHolds = (filter = {}) =>
  Appointment.updateMany(
    {
      ...filter,
      status: "pending",
      paymentStatus: "pending",
      expiresAt: mongoose.trusted({ $lt: new Date() }),
    },
    {
      $set: {
        status: "cancelled",
        cancelledBy: "system",
        cancelledAt: new Date(),
        cancelReason: "Payment not completed in time",
      },
      $unset: { expiresAt: 1 },
    }
  );

const closed = (reason) => ({
  available: false,
  reason,
  consultationTypes: [],
  slots: [],
});

// Kisi doctor ke kisi din ke slots, booked/past ke flags ke saath
export const getDaySlots = async (doctorId, schedule, date) => {
  const maxAdvance = schedule.maxAdvanceDays ?? 30;
  const today = todayIST();

  if (date < today) return closed("This date has already passed");
  if (date > addDaysToDateString(today, maxAdvance)) {
    return closed(`Bookings are open only up to ${maxAdvance} days ahead`);
  }

  const day = resolveDay(schedule, date);
  if (!day.available) return closed("Doctor is not available on this date");

  await releaseExpiredHolds({ doctor: doctorId, date });

  const taken = await Appointment.find({
    doctor: doctorId,
    date,
    status: mongoose.trusted({ $in: ACTIVE_STATUSES }),
  })
    .select("selectedTime")
    .lean();

  const takenSet = new Set(taken.map((a) => a.selectedTime));
  const earliest = Date.now() + (schedule.minNoticeMinutes ?? 60) * 60 * 1000;

  const slots = day.slots.map((time) => ({
    time,
    label: formatTime12h(time),
    available:
      !takenSet.has(time) && slotStartDate(date, time).getTime() >= earliest,
  }));

  return {
    available: true,
    reason: "",
    consultationTypes: day.types,
    slots,
  };
};