
import Doctor from "../../models/Doctor.js";

// ======================================================
// GET DOCTOR PROFILE
// ======================================================
// Logged-in doctor ka profile return karega.
//
// GET /api/doctors/profile
//
// JWT se doctor ID:
// req.user.id
// ======================================================

export const getDoctorProfile = async (req, res) => {
  try {
    // --------------------------------------------------
    // LOGGED-IN DOCTOR ID
    // --------------------------------------------------

    const doctorId = req.user.id;

    // --------------------------------------------------
    // FIND DOCTOR
    // --------------------------------------------------

    const doctor = await Doctor.findById(doctorId)
      .select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        registrationNumber:
          doctor.registrationNumber,
        qualification:
          doctor.qualification,
        specialization:
          doctor.specialization,
        experience:
          doctor.experience,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Get doctor profile error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// UPDATE DOCTOR PROFILE
// ======================================================
// Doctor apni profile information update kar sakta hai.
//
// Abhi update:
// - name
// - phone
// - qualification
// - specialization
// - experience
//
// Email aur registrationNumber ko abhi change nahi
// karenge.
// ======================================================

export const updateDoctorProfile = async (req, res) => {
  try {
    // --------------------------------------------------
    // LOGGED-IN DOCTOR ID
    // --------------------------------------------------

    const doctorId = req.user.id;

    const {
      name,
      phone,
      qualification,
      specialization,
      experience,
    } = req.body;

    // --------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------

    if (
      !name ||
      !phone ||
      !qualification ||
      !specialization ||
      experience === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, phone, qualification, specialization and experience are required",
      });
    }

    // --------------------------------------------------
    // EXPERIENCE VALIDATION
    // --------------------------------------------------

    const experienceNumber = Number(experience);

    if (
      Number.isNaN(experienceNumber) ||
      experienceNumber < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Experience must be a valid number",
      });
    }

    // --------------------------------------------------
    // UPDATE DOCTOR
    // --------------------------------------------------

    const doctor =
      await Doctor.findByIdAndUpdate(
        doctorId,
        {
          name: name.trim(),
          phone: phone.trim(),
          qualification:
            qualification.trim(),
          specialization:
            specialization.trim(),
          experience: experienceNumber,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select("-password");

    // --------------------------------------------------
    // DOCTOR NOT FOUND
    // --------------------------------------------------

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Doctor profile updated successfully",

      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        registrationNumber:
          doctor.registrationNumber,
        qualification:
          doctor.qualification,
        specialization:
          doctor.specialization,
        experience:
          doctor.experience,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Update doctor profile error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

