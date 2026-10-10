
import Doctor from "../../models/Doctor.js";

// ======================================================
// GET ALL DOCTORS
// ======================================================
// Patient ko available doctors ki list dikhane ke liye.
//
// GET /api/doctors
//
// Ye PUBLIC API hai.
// Patient ko doctors dekhne ke liye login required nahi hai.
//
// IMPORTANT:
// Password response me kabhi nahi bhejna.
// ======================================================

export const getAllDoctors = async (req, res) => {
  try {

    // --------------------------------------------------
    // GET DOCTORS
    // --------------------------------------------------

    const doctors = await Doctor.find()
      .select("-password")
      .sort({
        name: 1,
      });


    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

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

