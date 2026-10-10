
import jwt from "jsonwebtoken";

// ======================================================
// PROTECT MIDDLEWARE
// ======================================================
//
// JWT token verify karega.
//
// Header:
// Authorization: Bearer TOKEN
//
// Valid token ke baad:
// req.user = {
//   id: "...",
//   role: "patient" / "doctor"
// }
//
// ======================================================

export const protect = async (req, res, next) => {
  try {
    // --------------------------------------------------
    // GET AUTHORIZATION HEADER
    // --------------------------------------------------

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required",
      });
    }

    // --------------------------------------------------
    // CHECK BEARER FORMAT
    // --------------------------------------------------

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    // --------------------------------------------------
    // GET TOKEN
    // --------------------------------------------------

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is required",
      });
    }

    // --------------------------------------------------
    // VERIFY TOKEN
    // --------------------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // --------------------------------------------------
    // SAVE USER INFO IN REQUEST
    // --------------------------------------------------

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();

  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// ======================================================
// PATIENT ONLY
// ======================================================

export const patientOnly = (req, res, next) => {
  if (
    !req.user ||
    req.user.role !== "patient"
  ) {
    return res.status(403).json({
      success: false,
      message: "Patient access required",
    });
  }

  next();
};

// ======================================================
// DOCTOR ONLY
// ======================================================

export const doctorOnly = (req, res, next) => {
  if (
    !req.user ||
    req.user.role !== "doctor"
  ) {
    return res.status(403).json({
      success: false,
      message: "Doctor access required",
    });
  }

  next();
};

