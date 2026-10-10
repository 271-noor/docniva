
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Doctor from "../../models/Doctor.js";


// ======================================================
// DOCTOR REGISTER
// ======================================================
// New doctor registration.
//
// POST /api/doctors/register
//
// Body:
// {
//   name,
//   email,
//   phone,
//   registrationNumber,
//   qualification,
//   specialization,
//   experience,
//   password
// }
// ======================================================

export const registerDoctor = async (req, res) => {
  try {

    const {
      name,
      email,
      phone,
      registrationNumber,
      qualification,
      specialization,
      experience,
      password,
    } = req.body;


    // --------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------

    if (
      !name ||
      !email ||
      !phone ||
      !registrationNumber ||
      !qualification ||
      !specialization ||
      experience === undefined ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    // --------------------------------------------------
    // CHECK EXISTING DOCTOR
    // --------------------------------------------------

    const existingDoctor =
      await Doctor.findOne({
        $or: [
          {
            email: email
              .toLowerCase()
              .trim(),
          },
          {
            registrationNumber:
              registrationNumber.trim(),
          },
        ],
      });


    if (existingDoctor) {
      return res.status(409).json({
        success: false,
        message:
          "Doctor with this email or registration number already exists",
      });
    }


    // --------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );


    // --------------------------------------------------
    // CREATE DOCTOR
    // --------------------------------------------------

    const doctor =
      await Doctor.create({
        name: name.trim(),
        email: email
          .toLowerCase()
          .trim(),
        phone: phone.trim(),

        registrationNumber:
          registrationNumber.trim(),

        qualification:
          qualification.trim(),

        specialization:
          specialization.trim(),

        experience:
          Number(experience),

        password:
          hashedPassword,
      });


    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------
    // Password response me nahi bhejna.

    return res.status(201).json({
      success: true,
      message:
        "Doctor registered successfully",

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
      },
    });

  } catch (error) {

    console.error(
      "Doctor registration error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// DOCTOR LOGIN
// ======================================================
// Existing doctor login.
//
// POST /api/doctors/login
//
// Body:
// {
//   email,
//   password
// }
// ======================================================

export const loginDoctor = async (req, res) => {
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
        message:
          "Email and password are required",
      });
    }


    // --------------------------------------------------
    // FIND DOCTOR
    // --------------------------------------------------

    const doctor =
      await Doctor.findOne({
        email: email
          .toLowerCase()
          .trim(),
      });


    if (!doctor) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }


    // --------------------------------------------------
    // PASSWORD CHECK
    // --------------------------------------------------

    const isPasswordValid =
      await bcrypt.compare(
        password,
        doctor.password
      );


    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }


    // --------------------------------------------------
    // CREATE JWT TOKEN
    // --------------------------------------------------

    const token =
      jwt.sign(
        {
          id: doctor._id,
          role: "doctor",
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d",
        }
      );


    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Login successful",

      token,

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
      },
    });

  } catch (error) {

    console.error(
      "Doctor login error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const getAllDoctors = async (req, res) => {
try {
const doctors = await Doctor.find()
.select("-password")
.sort({ createdAt: -1 });

 
return res.status(200).json({
  success: true,
  doctors,
});
 

} catch (error) {
console.error(
"Get all doctors error:",
error.message
);

 
return res.status(500).json({
  success: false,
  message: "Server error",
});
 

}
};
