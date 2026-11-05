import DoctorSchedule from "../../models/DoctorSchedule.js";

const DEFAULT_SCHEDULE = {
  weekly: [],
  slotDurationMinutes: 30,
  consultationTypes: ["Clinic Visit"],
  maxAdvanceDays: 30,
  minNoticeMinutes: 60,
  dateExceptions: [],
};

const loadSchedule = (doctorId) =>
  DoctorSchedule.findOne({ doctor: doctorId }).lean();

// GET /api/doctors/schedule
export const getDoctorSchedule = async (req, res) => {
  const schedule = await loadSchedule(req.user.id);

  return res.status(200).json({
    success: true,
    schedule: schedule || { doctor: req.user.id, ...DEFAULT_SCHEDULE },
  });
};

// PUT /api/doctors/schedule
export const updateDoctorSchedule = async (req, res) => {
  const data = req.validated.body;

  const schedule = await DoctorSchedule.findOneAndUpdate(
    { doctor: req.user.id },
    { $set: data },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  ).lean();

  return res.status(200).json({
    success: true,
    message: "Doctor schedule updated successfully",
    schedule,
  });
};

// PUT /api/doctors/schedule/exception
export const upsertDateException = async (req, res) => {
  const { date, isAvailable, timeSlots, consultationTypes, reason } =
    req.validated.body;

  const existing = await DoctorSchedule.findOne({ doctor: req.user.id })
    .select("dateExceptions.date")
    .lean();

  const otherCount = (existing?.dateExceptions || []).filter(
    (e) => e.date !== date
  ).length;

  if (otherCount >= 366) {
    return res.status(400).json({
      success: false,
      message: "Too many date exceptions. Please delete old ones first.",
    });
  }

  const entry = {
    date,
    isAvailable,
    // Unavailable din par slots/types ka matlab nahi
    timeSlots: isAvailable ? [...timeSlots].sort() : [],
    consultationTypes: isAvailable ? consultationTypes : [],
    reason,
  };

  // Pehle us date ki purani entry hatao, phir nayi daalo
  await DoctorSchedule.updateOne(
    { doctor: req.user.id },
    { $pull: { dateExceptions: { date } } }
  );

  await DoctorSchedule.updateOne(
    { doctor: req.user.id },
    { $push: { dateExceptions: entry } },
    { upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  const schedule = await loadSchedule(req.user.id);

  return res.status(200).json({
    success: true,
    message: "Doctor date exception updated successfully",
    schedule,
  });
};

// DELETE /api/doctors/schedule/exception/:date
export const deleteDateException = async (req, res) => {
  const { date } = req.validated.params;

  await DoctorSchedule.updateOne(
    { doctor: req.user.id },
    { $pull: { dateExceptions: { date } } }
  );

  const schedule = await loadSchedule(req.user.id);

  return res.status(200).json({
    success: true,
    message: "Date exception removed",
    schedule: schedule || { doctor: req.user.id, ...DEFAULT_SCHEDULE },
  });
};