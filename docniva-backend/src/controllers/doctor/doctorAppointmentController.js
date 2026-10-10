
import Appointment from "../../models/Appointment.js";

// ======================================================
// GET DOCTOR APPOINTMENTS
// ======================================================
// Logged-in doctor ke saare appointments.
//
// GET /api/doctors/appointments
//
// Doctor ID frontend se nahi lenge.
// JWT se req.user.id milega.
//
// Middleware:
// protect → doctorOnly → getDoctorAppointments
// ======================================================

export const getDoctorAppointments = async (req, res) => {
  try {

    // --------------------------------------------------
    // Logged-in doctor ki ID
    // --------------------------------------------------

    const doctorId = req.user.id;


    // --------------------------------------------------
    // Doctor ke appointments find karo
    // --------------------------------------------------

    const appointments = await Appointment.find({
      doctor: doctorId,
    })
      .populate(
        "patient",
        "name email phone"
      )
      .sort({
        createdAt: -1,
      });


    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      appointments,
    });

  } catch (error) {

    console.error(
      "Get doctor appointments error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// UPDATE APPOINTMENT STATUS
// ======================================================
// Doctor appointment ko:
// - confirmed
// - rejected
//
// kar sakta hai.
//
// PATCH /api/doctors/appointments/:appointmentId/status
//
// Body:
// {
//   "status": "confirmed"
// }
//
// Middleware:
// protect → doctorOnly → updateAppointmentStatus
// ======================================================

export const updateAppointmentStatus = async (req, res) => {
  try {

    // --------------------------------------------------
    // Appointment ID
    // --------------------------------------------------

    const { appointmentId } = req.params;


    // --------------------------------------------------
    // New status
    // --------------------------------------------------

    const { status } = req.body;


    // --------------------------------------------------
    // Appointment ID validation
    // --------------------------------------------------

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required",
      });
    }


    // --------------------------------------------------
    // Status validation
    // --------------------------------------------------
    // Doctor ke liye abhi sirf confirmed/rejected
    // allowed rakhe hain.

    if (
      !status ||
      !["confirmed", "rejected"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be confirmed or rejected",
      });
    }


    // --------------------------------------------------
    // Appointment find karo
    // --------------------------------------------------

    const appointment = await Appointment.findById(
      appointmentId
    );


    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }


    // --------------------------------------------------
    // SECURITY CHECK
    // --------------------------------------------------
    // Doctor sirf apne appointment ka status
    // change kar sakta hai.

    if (
      appointment.doctor.toString() !==
      req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only manage your own appointments",
      });
    }


    // --------------------------------------------------
    // Status update
    // --------------------------------------------------

    appointment.status = status;

    await appointment.save();


    // --------------------------------------------------
    // Updated appointment populate karo
    // --------------------------------------------------

    const updatedAppointment =
      await Appointment.findById(
        appointment._id
      )
        .populate(
          "patient",
          "name email phone"
        )
        .populate(
          "doctor",
          "name email phone qualification specialization experience"
        );


    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        `Appointment ${status} successfully`,
      appointment: updatedAppointment,
    });

  } catch (error) {

    console.error(
      "Update doctor appointment status error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};