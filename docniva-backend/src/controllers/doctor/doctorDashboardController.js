
import Doctor from "../../models/Doctor.js";
import Appointment from "../../models/Appointment.js";

// ======================================================
// GET DOCTOR DASHBOARD
// ======================================================
// Logged-in doctor ke dashboard ka complete data.
//
// GET /api/doctors/dashboard
//
// JWT middleware se:
// req.user.id = logged-in doctor ki ID
//
// Dashboard me:
// - doctor information
// - total appointments
// - pending appointments
// - confirmed appointments
// - rejected appointments
// - cancelled appointments
// - upcoming appointments
// ======================================================

export const getDoctorDashboard = async (req, res) => {
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
    // GET APPOINTMENT COUNTS
    // --------------------------------------------------

    const totalAppointments =
      await Appointment.countDocuments({
        doctor: doctorId,
      });

    const pendingAppointments =
      await Appointment.countDocuments({
        doctor: doctorId,
        status: "pending",
      });

    const confirmedAppointments =
      await Appointment.countDocuments({
        doctor: doctorId,
        status: "confirmed",
      });

    const rejectedAppointments =
      await Appointment.countDocuments({
        doctor: doctorId,
        status: "rejected",
      });

    const cancelledAppointments =
      await Appointment.countDocuments({
        doctor: doctorId,
        status: "cancelled",
      });

    // --------------------------------------------------
    // UPCOMING APPOINTMENTS
    // --------------------------------------------------
    // Date String format:
    // YYYY-MM-DD
    //
    // Aaj ke baad ki appointments la rahe hain.

    const today = new Date()
      .toISOString()
      .split("T")[0];

    const upcomingAppointments =
      await Appointment.find({
        doctor: doctorId,
        date: {
          $gte: today,
        },
        status: {
          $in: ["pending", "confirmed"],
        },
      })
        .populate(
          "patient",
          "name email phone"
        )
        .sort({
          date: 1,
          selectedTime: 1,
        })
        .limit(10);

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
      },

      statistics: {
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        rejectedAppointments,
        cancelledAppointments,
      },

      upcomingAppointments,
    });
  } catch (error) {
    console.error(
      "Doctor dashboard error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

