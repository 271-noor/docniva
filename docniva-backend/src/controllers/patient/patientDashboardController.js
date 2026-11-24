import mongoose from "mongoose";
import Patient from "../../models/Patient.js";
import Appointment from "../../models/Appointment.js";
import { releaseExpiredHolds } from "../../services/bookingService.js";
import { slotStartDate, todayIST } from "../../utils/dateTime.js";

// GET /api/patients/dashboard
export const getPatientDashboard = async (req, res) => {
  const patientId = req.user.id;

  await releaseExpiredHolds({ patient: patientId });

  const patient = await Patient.findById(patientId).lean();
  if (!patient) {
    return res.status(404).json({ success: false, message: "Patient not found" });
  }

  const [grouped, upcomingRaw] = await Promise.all([
    Appointment.aggregate([
      { $match: { patient: new mongoose.Types.ObjectId(patientId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    Appointment.find({
      patient: patientId,
      date: mongoose.trusted({ $gte: todayIST() }),
      status: mongoose.trusted({ $in: ["pending", "confirmed"] }),
    })
      .populate("doctor", "name specialization qualification consultationFee city")
      .sort({ date: 1, selectedTime: 1 })
      .limit(30),
  ]);

  const count = Object.fromEntries(grouped.map((g) => [g._id, g.count]));
  const total = grouped.reduce((sum, g) => sum + g.count, 0);

  const now = Date.now();
  const upcomingAppointments = upcomingRaw
    .filter((a) => slotStartDate(a.date, a.selectedTime).getTime() > now)
    .slice(0, 5);

  return res.status(200).json({
    success: true,

    patient: {
      id: patient._id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      city: patient.city,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    },

    statistics: {
      totalAppointments: total,
      pendingAppointments: count.pending || 0,
      confirmedAppointments: count.confirmed || 0,
      completedAppointments: count.completed || 0,
      cancelledAppointments: (count.cancelled || 0) + (count.rejected || 0),
      upcomingAppointments: upcomingAppointments.length,
    },

    upcomingAppointments,
  });
};