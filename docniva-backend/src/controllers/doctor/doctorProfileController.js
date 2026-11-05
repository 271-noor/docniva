import Doctor from "../../models/Doctor.js";

const view = (d) => ({
  id: d._id,
  name: d.name,
  email: d.email,
  phone: d.phone,
  registrationNumber: d.registrationNumber,
  qualification: d.qualification,
  specialization: d.specialization,
  experience: d.experience,
  consultationFee: d.consultationFee,
  city: d.city || "",
  gender: d.gender || "",
  age: d.age ?? "",
  about: d.about || "",
  isVerified: d.isVerified,
  createdAt: d.createdAt,
  updatedAt: d.updatedAt,
});

// GET /api/doctors/profile
export const getDoctorProfile = async (req, res) => {
  const doctor = await Doctor.findById(req.user.id).lean();

  if (!doctor) {
    return res.status(404).json({ success: false, message: "Doctor not found" });
  }

  return res.status(200).json({ success: true, doctor: view(doctor) });
};

// PUT /api/doctors/profile
// Email aur registration number yahan se change nahi hote.
// Nayi fee sirf aage ki appointments par lagu hogi, purani ka amount save hai.
export const updateDoctorProfile = async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(
    req.user.id,
    { $set: req.validated.body },
    { new: true, runValidators: true }
  ).lean();

  if (!doctor) {
    return res.status(404).json({ success: false, message: "Doctor not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Doctor profile updated successfully",
    doctor: view(doctor),
  });
};