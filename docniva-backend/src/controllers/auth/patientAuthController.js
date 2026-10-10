
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Patient from "../../models/Patient.js";

// ======================================================
// PATIENT REGISTER
// ======================================================

export const registerPatient = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
    } = req.body;

    // --------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // --------------------------------------------------
    // CHECK EMAIL
    // --------------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    const existingPatient = await Patient.findOne({
      email: normalizedEmail,
    });

    if (existingPatient) {
      return res.status(409).json({
        success: false,
        message: "Patient with this email already exists",
      });
    }

    // --------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // --------------------------------------------------
    // CREATE PATIENT
    // --------------------------------------------------

    const patient = await Patient.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
    });

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",

      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        city: patient.city,
      },
    });
  } catch (error) {
    console.error(
      "Patient registration error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// PATIENT LOGIN
// ======================================================

export const loginPatient = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // --------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // --------------------------------------------------
    // FIND PATIENT
    // --------------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    const patient = await Patient.findOne({
      email: normalizedEmail,
    });

    if (!patient) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // --------------------------------------------------
    // CHECK PASSWORD
    // --------------------------------------------------

    const isPasswordValid =
      await bcrypt.compare(
        password,
        patient.password
      );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // --------------------------------------------------
    // CREATE JWT
    // --------------------------------------------------

    const token = jwt.sign(
      {
        id: patient._id.toString(),
        role: "patient",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // --------------------------------------------------
    // LOGIN SUCCESS
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age,
        gender: patient.gender,
        city: patient.city,
      },
    });
  } catch (error) {
    console.error(
      "Patient login error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

