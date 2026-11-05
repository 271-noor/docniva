import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Patient from "../../models/Patient.js";
import {
  hashPassword,
  fakePasswordCheck,
  isLocked,
  recordFailedLogin,
  clearLoginFailures,
  createRandomToken,
  sha256,
} from "../../utils/authHelpers.js";
import {
  issueAuthCookie,
  clearAuthCookie,
  withBearer,
} from "../../utils/tokens.js";
import {
  sendMailInBackground,
  getClientUrl,
  emailTemplate,
} from "../../utils/mailer.js";
import { makeForgotPassword, makeResetPassword } from "./passwordResetFactory.js";

const requireVerification = () =>
  process.env.REQUIRE_EMAIL_VERIFICATION === "true";

const publicPatient = (p) => ({
  id: p._id,
  name: p.name,
  email: p.email,
  phone: p.phone,
  age: p.age,
  gender: p.gender,
  city: p.city,
  isEmailVerified: p.isEmailVerified,
});

const sendVerificationEmail = (patient, rawToken) =>
  sendMailInBackground({
    to: patient.email,
    subject: "Verify your DocNiva email",
    html: emailTemplate({
      title: "Verify your email",
      intro: `Hi ${patient.name}, please confirm your email address to activate your DocNiva account. This link expires in 24 hours.`,
      buttonText: "Verify Email",
      link: `${getClientUrl()}/patient/verify-email?token=${rawToken}`,
      footer: "If you did not create this account, you can ignore this email.",
    }),
  });

// POST /api/patients/register
export const registerPatient = async (req, res) => {
 
    const { name, email, phone, password, age, gender, city } = req.validated.body;
  const verify = requireVerification();

  const doc = {
    name,
    email,
    phone,
    password: await hashPassword(password),
    isEmailVerified: !verify,
  };

  if (age !== undefined) doc.age = age;
  if (gender) doc.gender = gender;
  if (city) doc.city = city;

  let rawToken;
  if (verify) {
    const t = createRandomToken();
    rawToken = t.raw;
    doc.emailVerificationToken = t.hash;
    doc.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  let patient;
  try {
    patient = await Patient.create(doc);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Patient with this email already exists",
      });
    }
    throw err;
  }

  if (verify) sendVerificationEmail(patient, rawToken);

  return res.status(201).json({
    success: true,
    message: verify
      ? "Registration successful. Please check your email to verify your account."
      : "Patient registered successfully",
    requiresEmailVerification: verify,
    patient: publicPatient(patient),
  });
};

// POST /api/patients/login
export const loginPatient = async (req, res) => {
  const { email, password, rememberMe } = req.validated.body;

  const patient = await Patient.findOne({ email }).select(
    "+password +loginAttempts +lockUntil"
  );

  if (!patient) {
    await fakePasswordCheck(password);
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  if (isLocked(patient)) {
    return res.status(429).json({
      success: false,
      message: "Too many failed attempts. Please try again in 15 minutes.",
    });
  }

  const valid = await bcrypt.compare(password, patient.password);

  if (!valid) {
    await recordFailedLogin(Patient, patient);
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  if (patient.isBlocked) {
    return res
      .status(403)
      .json({ success: false, message: "Your account has been suspended" });
  }

  if (requireVerification() && !patient.isEmailVerified) {
    return res.status(403).json({
      success: false,
      code: "EMAIL_NOT_VERIFIED",
      message: "Please verify your email before logging in",
    });
  }

  await clearLoginFailures(Patient, patient);

  const token = issueAuthCookie(
    res,
    { id: patient._id, role: "patient" },
    Boolean(rememberMe)
  );

  return res.status(200).json(
    withBearer(
      {
        success: true,
        message: "Login successful",
        patient: publicPatient(patient),
      },
      token
    )
  );
};

// POST /api/patients/logout
export const logoutPatient = (req, res) => {
  clearAuthCookie(res);
  return res.status(200).json({ success: true, message: "Logged out" });
};

// GET /api/patients/me
export const getPatientMe = async (req, res) => {
  const patient = await Patient.findById(req.user.id);

  if (!patient) {
    return res
      .status(401)
      .json({ success: false, message: "Account not available" });
  }

  return res.status(200).json({ success: true, patient: publicPatient(patient) });
};

// POST /api/patients/verify-email
export const verifyPatientEmail = async (req, res) => {
  const { token } = req.validated.body;

  const patient = await Patient.findOneAndUpdate(
    {
      emailVerificationToken: sha256(token),
      emailVerificationExpires: mongoose.trusted({ $gt: new Date() }),
    },
    {
      $set: { isEmailVerified: true },
      $unset: { emailVerificationToken: 1, emailVerificationExpires: 1 },
    }
  ).select("_id");

  if (!patient) {
    return res.status(400).json({
      success: false,
      message: "Verification link is invalid or expired",
    });
  }

  return res
    .status(200)
    .json({ success: true, message: "Email verified. You can now log in." });
};

// POST /api/patients/resend-verification
export const resendPatientVerification = async (req, res) => {
  const { email } = req.validated.body;

  const patient = await Patient.findOne({ email }).select(
    "_id name email isEmailVerified isBlocked"
  );

  if (
    requireVerification() &&
    patient &&
    !patient.isEmailVerified &&
    !patient.isBlocked
  ) {
    const { raw, hash } = createRandomToken();

    await Patient.updateOne(
      { _id: patient._id },
      {
        $set: {
          emailVerificationToken: hash,
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }
    );

    sendVerificationEmail(patient, raw);
  }

  return res.status(200).json({
    success: true,
    message: "If the account needs verification, a new email has been sent.",
  });
};

// POST /api/patients/forgot-password
export const forgotPatientPassword = makeForgotPassword({
  Model: Patient,
  resetPath: "/patient/reset-password",
});

// POST /api/patients/reset-password
export const resetPatientPassword = makeResetPassword(Patient);