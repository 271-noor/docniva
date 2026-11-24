import mongoose from "mongoose";
import Doctor from "../../models/Doctor.js";
import Appointment from "../../models/Appointment.js";
import { slotStartDate, todayIST } from "../../utils/dateTime.js";

const PAID_STATES = ["paid", "refund_pending", "refunded"];

// GET /api/doctors/dashboard
export const getDoctorDashboard = async (req, res) => {
  const doctorId = req.user.id;

  const doctor = await Doctor.findById(doctorId).lean();
  if (!doctor) {
    return res.status(404).json({ success: false, message: "Doctor not found" });
  }

  const today = todayIST();

  // 5 alag count ki jagah ek aggregation
  const [grouped, todayCount, upcomingRaw] = await Promise.all([
    Appointment.aggregate([
      {
        $match: {
          doctor: new mongoose.Types.ObjectId(doctorId),
          paymentStatus: { $in: PAID_STATES },
        },
      },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    Appointment.countDocuments({
      doctor: doctorId,
      date: today,
      status: mongoose.trusted({ $in: ["pending", "confirmed"] }),
      paymentStatus: "paid",
    }),

    Appointment.find({
      doctor: doctorId,
      date: mongoose.trusted({ $gte: today }),
      status: mongoose.trusted({ $in: ["pending", "confirmed"] }),
      paymentStatus: "paid",
    })
      .populate("patient", "name email phone")
      .sort({ date: 1, selectedTime: 1 })
      .limit(30),
  ]);

  const count = Object.fromEntries(grouped.map((g) => [g._id, g.count]));
  const total = grouped.reduce((sum, g) => sum + g.count, 0);

  // Aaj ke guzre hue slots "upcoming" me nahi dikhne chahiye
  const now = Date.now();
  const upcomingAppointments = upcomingRaw
    .filter((a) => slotStartDate(a.date, a.selectedTime).getTime() > now)
    .slice(0, 10);

  return res.status(200).json({
    success: true,

    doctor: {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      registrationNumber: doctor.registrationNumber,
      qualification: doctor.qualification,
      specialization: doctor.specialization,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      city: doctor.city || "",
      isVerified: doctor.isVerified,
    },

    statistics: {
      totalAppointments: total,
      pendingAppointments: count.pending || 0,
      confirmedAppointments: count.confirmed || 0,
      rejectedAppointments: count.rejected || 0,
      cancelledAppointments: count.cancelled || 0,
      completedAppointments: count.completed || 0,
      todayAppointments: todayCount,
    },

    upcomingAppointments,
  });
};