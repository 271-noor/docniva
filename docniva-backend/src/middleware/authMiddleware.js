import jwt from "jsonwebtoken";
import Patient from "../models/Patient.js";
import Doctor from "../models/Doctor.js";
import Admin from "../models/Admin.js";

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

const ACCOUNTS = {
  patient: { Model: Patient, fields: "isBlocked passwordChangedAt" },
  doctor: { Model: Doctor, fields: "isBlocked isVerified passwordChangedAt" },
  admin: { Model: Admin, fields: "isActive passwordChangedAt" },
};

const fail = (res, code, message) =>
  res.status(code).json({ success: false, message });

const getToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;

  // Sirf transition ke liye. Frontend migrate hone par ALLOW_BEARER_AUTH=false.
  if (process.env.ALLOW_BEARER_AUTH === "true") {
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) return header.slice(7);
  }
  return null;
};

export const protect = async (req, res, next) => {
  const token = getToken(req);
  if (!token) return fail(res, 401, "Authentication required");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return fail(res, 401, "Invalid or expired token");
  }

  const entry = ACCOUNTS[decoded.role];
  if (
    !entry ||
    typeof decoded.id !== "string" ||
    !OBJECT_ID_RE.test(decoded.id)
  ) {
    return fail(res, 401, "Invalid token");
  }

  let account;
  try {
    account = await entry.Model.findById(decoded.id)
      .select(entry.fields)
      .lean();
  } catch (cause) {
    // DB ki problem me user ko logout nahi karna, 503 dena hai
    const err = new Error("Service temporarily unavailable");
    err.statusCode = 503;
    err.cause = cause;
    return next(err);
  }

  if (!account || account.isBlocked || account.isActive === false) {
    return fail(res, 401, "Account not available");
  }

  if (decoded.role === "doctor" && !account.isVerified) {
    return fail(res, 403, "Your account is pending admin approval");
  }

  // Password badalne ke baad purane tokens band
  if (
    account.passwordChangedAt &&
    decoded.iat * 1000 < new Date(account.passwordChangedAt).getTime()
  ) {
    return fail(res, 401, "Session expired, please log in again");
  }

  req.user = { id: String(account._id), role: decoded.role };
  next();
};

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, 403, "Access denied");
    }
    next();
  };

export const patientOnly = requireRole("patient");
export const doctorOnly = requireRole("doctor");
export const adminOnly = requireRole("admin");