import Patient from "../../models/Patient.js";
// ======================================================
// GET PATIENT PROFILE
// ======================================================
// Logged-in patient ka complete profile database se
// fetch karega.
//
// GET /api/patients/profile
//
// JWT se:
// req.user.id
//
// Password response mein nahi bhejna.
// ======================================================



const view = (p) => ({
  id: p._id,
  name: p.name,
  email: p.email,
  phone: p.phone,
  age: p.age,
  gender: p.gender,
  city: p.city,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

// GET /api/patients/profile
export const getPatientProfile = async (req, res) => {
  const patient = await Patient.findById(req.user.id).lean();

  if (!patient) {
    return res.status(404).json({ success: false, message: "Patient not found" });
  }

  return res.status(200).json({ success: true, patient: view(patient) });
};

// PUT /api/patients/profile
export const updatePatientProfile = async (req, res) => {
  const { name, phone, ...optional } = req.validated.body;

  const set = { name, phone };
  const unset = {};

  // age, gender, city: khali bheje to DB se hata do
  for (const key of ["age", "gender", "city"]) {
    const value = optional[key];
    if (value === undefined) continue;
    if (value === null) unset[key] = 1;
    else set[key] = value;
  }

  const update = { $set: set };
  if (Object.keys(unset).length > 0) update.$unset = unset;

  const patient = await Patient.findByIdAndUpdate(req.user.id, update, {
    new: true,
    runValidators: true,
  }).lean();

  if (!patient) {
    return res.status(404).json({ success: false, message: "Patient not found" });
  }

  return res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    patient: view(patient),
  });
};