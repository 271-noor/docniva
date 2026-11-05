import mongoose from "mongoose";
import Appointment from "../../models/Appointment.js";
import Doctor from "../../models/Doctor.js";
import DoctorSchedule from "../../models/DoctorSchedule.js";
import {
  ACTIVE_STATUSES,
  HOLD_MINUTES,
  getDaySlots,
  releaseExpiredHolds,
} from "../../services/bookingService.js";
import { slotStartDate } from "../../utils/dateTime.js";

const MAX_UNPAID_HOLDS = 3;
const FREE_CANCEL_HOURS = 2;

// Patient ko doctor ka email/phone nahi dikhta
const DOCTOR_FIELDS = "name specialization qualification experience consultationFee";

const fail = (res, code, message) =>
  res.status(code).json({ success: false, message });

// POST /api/appointments
export const createPatientAppointment = async (req, res) => {
  const patientId = req.user.id;
  const { doctorId, date, selectedTime, reason } = req.validated.body;

  const doctor = await Doctor.findOne({
    _id: doctorId,
    isVerified: true,
    isBlocked: false,
  })
    .select(DOCTOR_FIELDS)
    .lean();

  if (!doctor) return fail(res, 404, "Doctor not found");

  const schedule = await DoctorSchedule.findOne({ doctor: doctor._id }).lean();
  if (!schedule) return fail(res, 409, "Doctor has not set a schedule yet");

  const day = await getDaySlots(doctor._id, schedule, date);
  if (!day.available) return fail(res, 409, day.reason);

  const slot = day.slots.find((s) => s.time === selectedTime);
  if (!slot) {
    return fail(res, 409, "Selected time slot is not available for this doctor on this date");
  }
  if (!slot.available) {
    return fail(res, 409, "This time slot is no longer available. Please choose another.");
  }

  const consultationType =
    req.validated.body.consultationType || day.consultationTypes[0];

  if (!day.consultationTypes.includes(consultationType)) {
    return fail(res, 409, "Selected consultation type is not available on this date");
  }

  // Slot-hogging se bachav
  await releaseExpiredHolds({ patient: patientId });

  const unpaidHolds = await Appointment.countDocuments({
    patient: patientId,
    status: "pending",
    paymentStatus: "pending",
    expiresAt: mongoose.trusted({ $gt: new Date() }),
  });

  if (unpaidHolds >= MAX_UNPAID_HOLDS) {
    return fail(
      res,
      429,
      "You have too many unpaid appointments. Please complete payment or cancel them first."
    );
  }

  const clash = await Appointment.exists({
    patient: patientId,
    date,
    selectedTime,
    status: mongoose.trusted({ $in: ACTIVE_STATUSES }),
  });
  if (clash) {
    return fail(res, 409, "You already have an appointment at this time");
  }

  // Fee hamesha DB se, paise mein
  const fee = Number(doctor.consultationFee);
  const amount = Math.round(fee * 100);
  if (!Number.isFinite(fee) || amount < 100) {
    return fail(res, 400, "Doctor consultation fee is not configured correctly");
  }

  let appointment;
  try {
    appointment = await Appointment.create({
      patient: patientId,
      doctor: doctor._id,
      date,
      selectedTime,
      consultationType,
      reason,
      status: "pending",
      paymentStatus: "pending",
      amount,
      expiresAt: new Date(Date.now() + HOLD_MINUTES * 60 * 1000),
    });
  } catch (err) {
    // Do log ek hi pal par same slot le rahe the, unique index ne ek ko roka
    if (err?.code === 11000) {
      return fail(
        res,
        409,
        "This time slot has just been booked by someone else. Please choose another."
      );
    }
    throw err;
  }

  return res.status(201).json({
    success: true,
    message: `Appointment request created. Please complete the payment within ${HOLD_MINUTES} minutes to hold this slot.`,
    appointment: { ...appointment.toJSON(), doctor },
  });
};

// GET /api/appointments
export const getPatientAppointments = async (req, res) => {
  const patientId = req.user.id;

  await releaseExpiredHolds({ patient: patientId });

  const appointments = await Appointment.find({ patient: patientId })
    .populate("doctor", DOCTOR_FIELDS)
    .sort({ date: -1, selectedTime: -1 })
    .limit(100);

  return res.status(200).json({ success: true, appointments });
};

// PATCH /api/appointments/:appointmentId/cancel
export const cancelPatientAppointment = async (req, res) => {
  const patientId = req.user.id;
  const { appointmentId } = req.validated.params;

  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patient: patientId,
  });

  if (!appointment) return fail(res, 404, "Appointment not found");

  if (!ACTIVE_STATUSES.includes(appointment.status)) {
    return fail(res, 409, `This appointment is already ${appointment.status}`);
  }

  const msUntilStart =
    slotStartDate(appointment.date, appointment.selectedTime).getTime() -
    Date.now();

  if (msUntilStart <= 0) {
    return fail(res, 409, "Past appointments cannot be cancelled");
  }

  const wasPaid = appointment.paymentStatus === "paid";

  if (wasPaid && msUntilStart < FREE_CANCEL_HOURS * 60 * 60 * 1000) {
    return fail(
      res,
      409,
      `Paid appointments can only be cancelled up to ${FREE_CANCEL_HOURS} hours before the start time`
    );
  }

  // Ek hi atomic step: status badal chuka ho to ye update nahi hoga
  const updated = await Appointment.findOneAndUpdate(
    {
      _id: appointment._id,
      patient: patientId,
      status: mongoose.trusted({ $in: ACTIVE_STATUSES }),
    },
    {
      $set: {
        status: "cancelled",
        cancelledBy: "patient",
        cancelledAt: new Date(),
      },
      $unset: { expiresAt: 1 },
    },
    { new: true }
  ).populate("doctor", DOCTOR_FIELDS);

  if (!updated) {
    return fail(res, 409, "Appointment status has changed. Please refresh and try again.");
  }

  return res.status(200).json({
    success: true,
    message: wasPaid
      ? "Appointment cancelled. Your refund will be processed to the original payment method."
      : "Appointment cancelled successfully",
    refundDue: wasPaid,
    appointment: updated,
  });
};