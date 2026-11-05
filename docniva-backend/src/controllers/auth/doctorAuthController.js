import bcrypt from "bcryptjs";
import Doctor from "../../models/Doctor.js";
import {
  hashPassword,
  fakePasswordCheck,
  isLocked,
  recordFailedLogin,
  clearLoginFailures,
} from "../../utils/authHelpers.js";
import {
  issueAuthCookie,
  clearAuthCookie,
  withBearer,
} from "../../utils/tokens.js";
import { makeForgotPassword, makeResetPassword } from "./passwordResetFactory.js";

const publicDoctor = (d) => ({
  id: d._id,
  name: d.name,
  email: d.email,
  phone: d.phone,
  registrationNumber: d.registrationNumber,
  qualification: d.qualification,
  specialization: d.specialization,
  experience: d.experience,
  consultationFee: d.consultationFee,
  city: d.city,
  gender: d.gender,
  age: d.age,
  isVerified: d.isVerified,
});

// POST /api/doctors/register
export const registerDoctor = async (req, res) => {
  const data = req.validated.body;

  let doctor;
  try {
    doctor = await Doctor.create({
      ...data,
      password: await hashPassword(data.password),
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Doctor with this email or registration number already exists",
      });
    }
    throw err;
  }

  return res.status(201).json({
    success: true,
    message:
      "Registration submitted. You can log in once our team verifies your account.",
    doctor: publicDoctor(doctor),
  });
};

// POST /api/doctors/login
export const loginDoctor = async (req, res) => {
  const { email, password, rememberMe } = req.validated.body;

  const doctor = await Doctor.findOne({ email }).select(
    "+password +loginAttempts +lockUntil"
  );

  if (!doctor) {
    await fakePasswordCheck(password);
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  if (isLocked(doctor)) {
    return res.status(429).json({
      success: false,
      message: "Too many failed attempts. Please try again in 15 minutes.",
    });
  }

  const valid = await bcrypt.compare(password, doctor.password);

  if (!valid) {
    await recordFailedLogin(Doctor, doctor);
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  if (doctor.isBlocked) {
    return res
      .status(403)
      .json({ success: false, message: "Your account has been suspended" });
  }

  if (!doctor.isVerified) {
    return res.status(403).json({
      success: false,
      code: "PENDING_APPROVAL",
      message: "Your account is pending admin approval",
    });
  }

  await clearLoginFailures(Doctor, doctor);

  const token = issueAuthCookie(
    res,
    { id: doctor._id, role: "doctor" },
    Boolean(rememberMe)
  );

  return res.status(200).json(
    withBearer(
      {
        success: true,
        message: "Login successful",
        doctor: publicDoctor(doctor),
      },
      token
    )
  );
};

// POST /api/doctors/logout
export const logoutDoctor = (req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ success: true, message: "Logged out" });
};

// GET /api/doctors/me
export const getDoctorMe = async (req, res) => {
  const doctor = await Doctor.findById(req.user.id);

  if (!doctor) {
    return res
      .status(401)
      .json({ success: false, message: "Account not available" });
  }

  return res.status(200).json({ success: true, doctor: publicDoctor(doctor) });
};

// POST /api/doctors/forgot-password
export const forgotDoctorPassword = makeForgotPassword({
  Model: Doctor,
  resetPath: "/doctor/reset-password",
});

// POST /api/doctors/reset-password
export const resetDoctorPassword = makeResetPassword(Doctor);