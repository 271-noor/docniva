
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

export const getPatientProfile = async (req, res) => {
  try {
    // --------------------------------------------------
    // LOGGED-IN PATIENT ID
    // --------------------------------------------------

    const patientId = req.user.id;

    // --------------------------------------------------
    // FIND PATIENT
    // --------------------------------------------------

    const patient = await Patient.findById(patientId)
      .select("-password");

    // --------------------------------------------------
    // PATIENT NOT FOUND
    // --------------------------------------------------

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,

        // New profile fields
        age: patient.age,
        gender: patient.gender,
        city: patient.city,

        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Get patient profile error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// UPDATE PATIENT PROFILE
// ======================================================
// Logged-in patient apna:
// - name
// - phone
// - age
// - gender
// - city
//
// update kar sakta hai.
//
// Email change nahi kar sakte.
// Password ke liye separate API baad mein banayenge.
//
// PUT /api/patients/profile
// ======================================================

export const updatePatientProfile = async (req, res) => {
  try {
    // --------------------------------------------------
    // LOGGED-IN PATIENT ID
    // --------------------------------------------------

    const patientId = req.user.id;

    const {
      name,
      phone,
      age,
      gender,
      city,
    } = req.body;

    // --------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    // --------------------------------------------------
    // NAME VALIDATION
    // --------------------------------------------------

    if (
      typeof name !== "string" ||
      name.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }

    // --------------------------------------------------
    // PHONE VALIDATION
    // --------------------------------------------------

    if (
      typeof phone !== "string" ||
      phone.trim().length < 10
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number",
      });
    }

    // --------------------------------------------------
    // AGE VALIDATION
    // --------------------------------------------------

    let finalAge;

    if (
      age !== undefined &&
      age !== null &&
      age !== ""
    ) {
      finalAge = Number(age);

      if (
        Number.isNaN(finalAge) ||
        !Number.isInteger(finalAge) ||
        finalAge < 1 ||
        finalAge > 120
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Age must be a valid number between 1 and 120",
        });
      }
    } else {
      // Empty age ko undefined rakhenge
      finalAge = undefined;
    }

    // --------------------------------------------------
    // GENDER VALIDATION
    // --------------------------------------------------

    let finalGender;

    if (
      gender !== undefined &&
      gender !== null &&
      gender !== ""
    ) {
      const allowedGenders = [
        "Male",
        "Female",
        "Other",
      ];

      if (!allowedGenders.includes(gender)) {
        return res.status(400).json({
          success: false,
          message:
            "Gender must be Male, Female or Other",
        });
      }

      finalGender = gender;
    } else {
      finalGender = undefined;
    }

    // --------------------------------------------------
    // CITY
    // --------------------------------------------------

    const finalCity =
      typeof city === "string"
        ? city.trim()
        : "";

    // --------------------------------------------------
    // UPDATE PATIENT
    // --------------------------------------------------

    const updateData = {
      name: name.trim(),
      phone: phone.trim(),
      age: finalAge,
      gender: finalGender,
      city: finalCity,
    };

    const patient =
      await Patient.findByIdAndUpdate(
        patientId,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    // --------------------------------------------------
    // PATIENT NOT FOUND
    // --------------------------------------------------

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      patient: {
        id: patient._id,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,

        // Updated profile fields
        age: patient.age,
        gender: patient.gender,
        city: patient.city,

        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Update patient profile error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

