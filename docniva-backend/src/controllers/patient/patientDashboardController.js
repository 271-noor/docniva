
import Patient from "../../models/Patient.js";

// ======================================================
// GET PATIENT DASHBOARD
// ======================================================
// Logged-in patient ke dashboard ke liye patient information
// database se fetch karega.
//
// JWT se:
// req.user.id = logged-in patient ki ID
//
// GET /api/patients/dashboard
// ======================================================

export const getPatientDashboard = async (req, res) => {
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

        // Additional profile information
        age: patient.age,
        gender: patient.gender,
        city: patient.city,

        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Patient dashboard error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
