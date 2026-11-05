import Doctor from "../../models/Doctor.js";
import DoctorSchedule from "../../models/DoctorSchedule.js";
import { getDaySlots } from "../../services/bookingService.js";

// Sirf ye fields public hain. Email, phone, registration number kabhi nahi.
const PUBLIC_FIELDS =
  "name specialization qualification experience consultationFee city about";

const VISIBLE = { isVerified: true, isBlocked: false };

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/doctors
export const getAllDoctors = async (req, res) => {
  const { page, limit, search, specialization, city } = req.validated.query;

  const filter = { ...VISIBLE };

  if (specialization) {
    filter.specialization = new RegExp(`^${escapeRegex(specialization)}$`, "i");
  }
  if (city) {
    filter.city = new RegExp(escapeRegex(city), "i");
  }
  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: regex }, { specialization: regex }];
  }

  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .select(PUBLIC_FIELDS)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Doctor.countDocuments(filter),
  ]);

  return res.status(200).json({
    success: true,
    doctors,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// GET /api/doctors/:doctorId
export const getDoctorById = async (req, res) => {
  const { doctorId } = req.validated.params;

  const doctor = await Doctor.findOne({ _id: doctorId, ...VISIBLE })
    .select(PUBLIC_FIELDS)
    .lean();

  if (!doctor) {
    return res.status(404).json({ success: false, message: "Doctor not found" });
  }

  return res.status(200).json({ success: true, doctor });
};

// GET /api/doctors/:doctorId/slots?date=YYYY-MM-DD
export const getDoctorSlots = async (req, res) => {
  const { doctorId } = req.validated.params;
  const { date } = req.validated.query;

  const doctor = await Doctor.exists({ _id: doctorId, ...VISIBLE });
  if (!doctor) {
    return res.status(404).json({ success: false, message: "Doctor not found" });
  }

  const schedule = await DoctorSchedule.findOne({ doctor: doctorId }).lean();

  if (!schedule) {
    return res.status(200).json({
      success: true,
      date,
      available: false,
      reason: "Doctor has not set a schedule yet",
      consultationTypes: [],
      slots: [],
    });
  }

  const result = await getDaySlots(doctorId, schedule, date);

  return res.status(200).json({ success: true, date, ...result });
};