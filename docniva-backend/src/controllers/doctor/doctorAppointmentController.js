import mongoose from "mongoose";
import Appointment from "../../models/Appointment.js";
import { refundAppointment } from "../../services/paymentService.js";
import { slotStartDate } from "../../utils/dateTime.js";

// Doctor ko sirf wahi appointments dikhti hain jinka payment ho chuka hai
const PAID_STATES = ["paid", "refund_pending", "refunded"];
const PATIENT_FIELDS = "name email phone age gender city";

const fail = (res, code, message) =>
  res.status(code).json({ success: false, message });

// GET /api/doctors/appointments
export const getDoctorAppointments = async (req, res) => {
  const { status, page, limit } = req.validated.query;

  const filter = {
    doctor: req.user.id,
    paymentStatus: mongoose.trusted({ $in: PAID_STATES }),
  };
  if (status) filter.status = status;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate("patient", PATIENT_FIELDS)
      .sort({ date: -1, selectedTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Appointment.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    appointments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// PATCH /api/doctors/appointments/:appointmentId/status
export const updateAppointmentStatus = async (req, res) => {
  const { appointmentId } = req.validated.params;
  const { status, rejectReason, meetingLink } = req.validated.body;
  const doctorId = req.user.id;

  // Query me doctor bhi hai: doosre doctor ki appointment par 404 aayega
  const existing = await Appointment.findOne({
    _id: appointmentId,
    doctor: doctorId,
  }).select("status paymentStatus date selectedTime consultationType");

  if (!existing) return fail(res, 404, "Appointment not found");

  if (existing.status !== "pending") {
    return fail(res, 409, `This appointment is already ${existing.status}`);
  }

  if (existing.paymentStatus !== "paid") {
    return fail(res, 409, "The patient has not completed the payment yet");
  }

  const slotPassed =
    slotStartDate(existing.date, existing.selectedTime).getTime() <= Date.now();

  if (status === "confirmed" && slotPassed) {
    return fail(res, 409, "This appointment time has already passed");
  }

  const set =
    status === "confirmed"
      ? { status: "confirmed", confirmedAt: new Date() }
      : {
          status: "rejected",
          rejectReason: rejectReason || "Rejected by the doctor",
          cancelledBy: "doctor",
          cancelledAt: new Date(),
        };

  if (
    status === "confirmed" &&
    meetingLink &&
    existing.consultationType === "Online"
  ) {
    set.meetingLink = meetingLink;
  }

  // Ek hi atomic step: patient ne is beech cancel kiya ho to ye update nahi hoga
  const updated = await Appointment.findOneAndUpdate(
    {
      _id: appointmentId,
      doctor: doctorId,
      status: "pending",
      paymentStatus: "paid",
    },
    { $set: set },
    { new: true }
  ).populate("patient", PATIENT_FIELDS);

  if (!updated) {
    return fail(res, 409, "Appointment status has changed. Please refresh and try again.");
  }

  if (status === "rejected") {
    refundAppointment(updated._id, "Rejected by doctor").catch((err) =>
      console.error("Refund trigger failed:", err.message)
    );
  }

  return res.status(200).json({
    success: true,
    message: `Appointment ${status} successfully`,
    appointment: updated,
  });
};