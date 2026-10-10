
import DoctorSchedule from "../../models/DoctorSchedule.js";
import Appointment from "../../models/Appointment.js";
import Patient from "../../models/Patient.js";
import Doctor from "../../models/Doctor.js";


// ======================================================
// HELPERS
// ======================================================

// YYYY-MM-DD ko safely parse karke weekday nikalna.
// Server timezone par depend karne se bachne ke liye
// UTC use kar rahe hain.
const getDayNameFromDate = (dateString) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
};


// Date format validate:
// YYYY-MM-DD
const isValidDateFormat = (dateString) => {
  if (
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return false;
  }

  const date = new Date(`${dateString}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (
    date.toISOString().slice(0, 10) === dateString
  );
};


// Past date check
const isPastDate = (dateString) => {
  const today = new Date()
    .toISOString()
    .slice(0, 10);

  return dateString < today;
};


// ======================================================
// CREATE PATIENT APPOINTMENT
// ======================================================
// POST /api/appointments
//
// Logged-in patient appointment book karega.
//
// Body:
//
// {
//   doctorId,
//   date,
//   selectedTime,
//   consultationType,
//   reason
// }
// ======================================================

export const createPatientAppointment = async (
  req,
  res
) => {
  try {
    // --------------------------------------------------
    // LOGGED-IN PATIENT
    // --------------------------------------------------

    const patientId = req.user.id;

    const {
      doctorId,
      date,
      selectedTime,
      consultationType,
      reason,
    } = req.body;


    // --------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------

    if (
      !doctorId ||
      !date ||
      !selectedTime
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Doctor, date and time are required",
      });
    }


    // --------------------------------------------------
    // DATE FORMAT VALIDATION
    // --------------------------------------------------

    if (!isValidDateFormat(date)) {
      return res.status(400).json({
        success: false,
        message:
          "Date must be in YYYY-MM-DD format",
      });
    }


    // --------------------------------------------------
    // PAST DATE VALIDATION
    // --------------------------------------------------

    if (isPastDate(date)) {
      return res.status(400).json({
        success: false,
        message:
          "Appointments cannot be booked for a past date",
      });
    }


    // --------------------------------------------------
    // FIND PATIENT
    // --------------------------------------------------

    const patient =
      await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }


    // --------------------------------------------------
    // FIND DOCTOR
    // --------------------------------------------------

    const doctor =
      await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }


    // --------------------------------------------------
    // FIND DOCTOR SCHEDULE
    // --------------------------------------------------

    const schedule =
      await DoctorSchedule.findOne({
        doctor: doctor._id,
      });

    if (!schedule) {
      return res.status(409).json({
        success: false,
        message:
          "Doctor has not configured a schedule yet",
      });
    }


    // --------------------------------------------------
    // CHECK AVAILABLE DAY
    // --------------------------------------------------

    const dayName =
      getDayNameFromDate(date);

    if (!dayName) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
    }


    const isDayAvailable =
      schedule.availableDays.includes(
        dayName
      );

    if (!isDayAvailable) {
      return res.status(409).json({
        success: false,
        message:
          `Doctor is not available on ${dayName}`,
      });
    }


    // --------------------------------------------------
// CHECK DATE EXCEPTION
// --------------------------------------------------
// Weekly schedule ke alawa doctor kisi specific
// date par available/unavailable ho sakta hai.
//
// Example:
// 2026-10-05 -> Doctor on leave
// --------------------------------------------------

const dateException =
  schedule.dateExceptions?.find(
    (exception) =>
      exception.date === date
  );

// --------------------------------------------------
// DOCTOR UNAVAILABLE ON THIS SPECIFIC DATE
// --------------------------------------------------

if (
  dateException &&
  dateException.isAvailable === false
) {
  return res.status(409).json({
    success: false,
    message:
      dateException.reason
        ? `Doctor is not available on ${date}: ${dateException.reason}`
        : `Doctor is not available on ${date}`,
  });
}





  // --------------------------------------------------
// CHECK TIME SLOT
// --------------------------------------------------
// Agar specific date par custom slots diye gaye hain,
// to weekly slots ke bajay date-specific slots use honge.
// --------------------------------------------------

const allowedTimeSlots =
  dateException &&
  dateException.isAvailable === true &&
  Array.isArray(dateException.timeSlots) &&
  dateException.timeSlots.length > 0
    ? dateException.timeSlots
    : schedule.timeSlots;

const isTimeAvailable =
  allowedTimeSlots.includes(
    selectedTime
  );

if (!isTimeAvailable) {
  return res.status(409).json({
    success: false,
    message:
      "Selected time slot is not available for this doctor on this date",
  });
}


    // --------------------------------------------------
    // CHECK CONSULTATION TYPE
    // --------------------------------------------------

    const finalConsultationType =
      consultationType || "Clinic Visit";


   const allowedConsultationTypes =
  dateException &&
  dateException.isAvailable === true &&
  Array.isArray(dateException.consultationTypes) &&
  dateException.consultationTypes.length > 0
    ? dateException.consultationTypes
    : schedule.consultationTypes;

const isConsultationTypeAvailable =
  allowedConsultationTypes.includes(
    finalConsultationType
  );

if (!isConsultationTypeAvailable) {
  return res.status(409).json({
    success: false,
    message:
      "Selected consultation type is not available for this doctor on this date",
  });
}

  


    // --------------------------------------------------
    // CHECK DUPLICATE ACTIVE BOOKING
    // --------------------------------------------------
    //
    // Same doctor + same date + same time.
    //
    // Pending aur confirmed appointment slot
    // ko occupied maana jayega.
    //
    // Cancelled/rejected slot dobara book ho sakta hai.
    // --------------------------------------------------

    const existingAppointment =
      await Appointment.findOne({
        doctor: doctor._id,
        date,
        selectedTime,
        status: {
          $in: [
            "pending",
            "confirmed",
          ],
        },
      });


    if (existingAppointment) {
      return res.status(409).json({
        success: false,
        message:
          "This time slot is already booked",
      });
    }


    // --------------------------------------------------
    // CREATE APPOINTMENT
    // --------------------------------------------------

    const appointment =
      await Appointment.create({
        patient: patient._id,
        doctor: doctor._id,
        date,
        selectedTime,
        consultationType:
          finalConsultationType,
        reason:
          typeof reason === "string"
            ? reason.trim()
            : "",
        status: "pending",
      });


    // --------------------------------------------------
    // POPULATE RESPONSE
    // --------------------------------------------------

    const populatedAppointment =
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
    // RESPONSE
    // --------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Appointment request created successfully",
      appointment:
        populatedAppointment,
    });

  } catch (error) {

    console.error(
      "Create patient appointment error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// GET MY PATIENT APPOINTMENTS
// ======================================================
// GET /api/appointments
//
// Logged-in patient ke saare appointments.
// Patient ID JWT se milegi.
// ======================================================

export const getPatientAppointments = async (
  req,
  res
) => {
  try {

    const patientId = req.user.id;


    // --------------------------------------------------
    // PATIENT CHECK
    // --------------------------------------------------

    const patient =
      await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }


    // --------------------------------------------------
    // GET APPOINTMENTS
    // --------------------------------------------------

    const appointments =
      await Appointment.find({
        patient: patientId,
      })
        .populate(
          "doctor",
          "name email phone qualification specialization experience"
        )
        .sort({
          createdAt: -1,
        });


    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      appointments,
    });

  } catch (error) {

    console.error(
      "Get patient appointments error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ======================================================
// CANCEL PATIENT APPOINTMENT
// ======================================================
// PATCH /api/appointments/:appointmentId/cancel
//
// Patient sirf apna appointment cancel kar sakta hai.
// ======================================================

export const cancelPatientAppointment = async (
  req,
  res
) => {
  try {

    const patientId = req.user.id;

    const {
      appointmentId,
    } = req.params;


    // --------------------------------------------------
    // APPOINTMENT ID CHECK
    // --------------------------------------------------

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message:
          "Appointment ID is required",
      });
    }


    // --------------------------------------------------
    // FIND PATIENT'S APPOINTMENT
    // --------------------------------------------------

    const appointment =
      await Appointment.findOne({
        _id: appointmentId,
        patient: patientId,
      });


    if (!appointment) {
      return res.status(404).json({
        success: false,
        message:
          "Appointment not found",
      });
    }


    // --------------------------------------------------
    // ALREADY CANCELLED
    // --------------------------------------------------

    if (
      appointment.status === "cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Appointment is already cancelled",
      });
    }


    // --------------------------------------------------
    // REJECTED APPOINTMENT
    // --------------------------------------------------

    if (
      appointment.status === "rejected"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rejected appointment cannot be cancelled",
      });
    }


    // --------------------------------------------------
    // CANCEL
    // --------------------------------------------------

    appointment.status = "cancelled";

    await appointment.save();


    // --------------------------------------------------
    // POPULATE DOCTOR
    // --------------------------------------------------

    const updatedAppointment =
      await Appointment.findById(
        appointment._id
      ).populate(
        "doctor",
        "name email phone qualification specialization experience"
      );


    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Appointment cancelled successfully",
      appointment:
        updatedAppointment,
    });

  } catch (error) {

    console.error(
      "Cancel patient appointment error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
