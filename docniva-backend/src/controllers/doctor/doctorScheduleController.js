
import DoctorSchedule from "../../models/DoctorSchedule.js";
import Doctor from "../../models/Doctor.js";

// ======================================================
// GET DOCTOR SCHEDULE
// ======================================================
// Logged-in doctor apna schedule dekh sakta hai.
//
// GET /api/doctors/schedule
// ======================================================

export const getDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const schedule = await DoctorSchedule.findOne({
      doctor: doctorId,
    });

    // Schedule abhi create nahi hua
    if (!schedule) {
      return res.status(200).json({
        success: true,
        schedule: {
          doctor: doctorId,
          availableDays: [],
          timeSlots: [],
          consultationTypes: ["Clinic Visit"],
        },
      });
    }

    return res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error) {
    console.error(
      "Get doctor schedule error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// ======================================================
// GET SPECIFIC DOCTOR SCHEDULE FOR PATIENT
// ======================================================
//
// GET /api/doctors/:doctorId/schedule
//
// Patient kisi specific doctor ka available schedule
// dekh sakta hai.
//
// ======================================================

export const getDoctorScheduleForPatient = async (
  req,
  res
) => {
  try {
    const { doctorId } = req.params;

    // --------------------------------------------------
    // CHECK DOCTOR
    // --------------------------------------------------

    const doctor = await Doctor.findById(
      doctorId
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // --------------------------------------------------
    // FIND SCHEDULE
    // --------------------------------------------------

    const schedule =
      await DoctorSchedule.findOne({
        doctor: doctorId,
      });

    // --------------------------------------------------
    // NO SCHEDULE
    // --------------------------------------------------

    if (!schedule) {
      return res.status(200).json({
        success: true,
        schedule: {
          doctor: doctorId,
          availableDays: [],
          timeSlots: [],
          consultationTypes: [],
          dateExceptions: [],
        },
      });
    }

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,

      schedule: {
        doctor: schedule.doctor,
        availableDays:
          schedule.availableDays || [],

        timeSlots:
          schedule.timeSlots || [],

        consultationTypes:
          schedule.consultationTypes || [],

        dateExceptions:
          schedule.dateExceptions || [],
      },
    });
  } catch (error) {
    console.error(
      "Get doctor schedule for patient error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




// ======================================================
// UPDATE DOCTOR SCHEDULE
// ======================================================
// Doctor apna available schedule set/update kar sakta hai.
//
// PUT /api/doctors/schedule
//
// Body:
//
// {
//   availableDays: ["Monday", "Tuesday"],
//   timeSlots: ["09:00 AM", "10:00 AM"],
//   consultationTypes: ["Clinic Visit", "Online"]
// }
// ======================================================

export const updateDoctorSchedule = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const {
      availableDays,
      timeSlots,
      consultationTypes,
    } = req.body;

    // --------------------------------------------------
    // CHECK DOCTOR
    // --------------------------------------------------

    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // --------------------------------------------------
    // VALIDATE ARRAYS
    // --------------------------------------------------

    if (
      !Array.isArray(availableDays) ||
      !Array.isArray(timeSlots) ||
      !Array.isArray(consultationTypes)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "availableDays, timeSlots and consultationTypes must be arrays",
      });
    }

    // --------------------------------------------------
    // VALIDATE DAYS
    // --------------------------------------------------

    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const invalidDays = availableDays.filter(
      (day) => !validDays.includes(day)
    );

    if (invalidDays.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid day provided",
        invalidDays,
      });
    }

    // --------------------------------------------------
    // VALIDATE CONSULTATION TYPES
    // --------------------------------------------------

    const validConsultationTypes = [
      "Clinic Visit",
      "Online",
    ];

    const invalidConsultationTypes =
      consultationTypes.filter(
        (type) =>
          !validConsultationTypes.includes(type)
      );

    if (invalidConsultationTypes.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation type provided",
        invalidConsultationTypes,
      });
    }

    // --------------------------------------------------
    // UPDATE / CREATE SCHEDULE
    // --------------------------------------------------

    const schedule =
      await DoctorSchedule.findOneAndUpdate(
        {
          doctor: doctorId,
        },
        {
          doctor: doctorId,
          availableDays,
          timeSlots,
          consultationTypes,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      );

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Doctor schedule updated successfully",
      schedule,
    });
  } catch (error) {
    console.error(
      "Update doctor schedule error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



// ======================================================
// ADD / UPDATE DATE EXCEPTION
// ======================================================
//
// PUT /api/doctors/schedule/exception
//
// Body:
//
// {
//   "date": "2026-10-12",
//   "isAvailable": false,
//   "timeSlots": [],
//   "consultationTypes": [],
//   "reason": "Doctor on leave"
// }
//
// Doctor sirf apne schedule mein exception add/update
// kar sakta hai.
// ======================================================

export const updateDoctorDateException = async (
  req,
  res
) => {
  try {
    const doctorId = req.user.id;

    const {
      date,
      isAvailable,
      timeSlots,
      consultationTypes,
      reason,
    } = req.body;

    // --------------------------------------------------
    // DATE REQUIRED
    // --------------------------------------------------

    if (
      !date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return res.status(400).json({
        success: false,
        message: "Date must be in YYYY-MM-DD format",
      });
    }

    // --------------------------------------------------
    // AVAILABILITY REQUIRED
    // --------------------------------------------------

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false",
      });
    }

    // --------------------------------------------------
    // FIND DOCTOR SCHEDULE
    // --------------------------------------------------

    const schedule =
      await DoctorSchedule.findOne({
        doctor: doctorId,
      });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message:
          "Doctor schedule not found. Please create your weekly schedule first.",
      });
    }

    // --------------------------------------------------
    // NORMALIZE DATA
    // --------------------------------------------------

    const finalTimeSlots =
      Array.isArray(timeSlots)
        ? timeSlots
        : [];

    const finalConsultationTypes =
      Array.isArray(consultationTypes)
        ? consultationTypes
        : [];

    const finalReason =
      typeof reason === "string"
        ? reason.trim()
        : "";

    // --------------------------------------------------
    // VALIDATE CONSULTATION TYPES
    // --------------------------------------------------

    const allowedConsultationTypes = [
      "Clinic Visit",
      "Online",
    ];

    const invalidConsultationType =
      finalConsultationTypes.some(
        (type) =>
          !allowedConsultationTypes.includes(type)
      );

    if (invalidConsultationType) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid consultation type",
      });
    }

    // --------------------------------------------------
    // FIND EXISTING EXCEPTION
    // --------------------------------------------------

    const existingException =
      schedule.dateExceptions.find(
        (exception) =>
          exception.date === date
      );

    // --------------------------------------------------
    // UPDATE EXISTING EXCEPTION
    // --------------------------------------------------

    if (existingException) {
      existingException.isAvailable =
        isAvailable;

      existingException.timeSlots =
        finalTimeSlots;

      existingException.consultationTypes =
        finalConsultationTypes;

      existingException.reason =
        finalReason;
    }

    // --------------------------------------------------
    // CREATE NEW EXCEPTION
    // --------------------------------------------------

    else {
      schedule.dateExceptions.push({
        date,
        isAvailable,
        timeSlots:
          finalTimeSlots,
        consultationTypes:
          finalConsultationTypes,
        reason:
          finalReason,
      });
    }

    await schedule.save();

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Doctor date exception updated successfully",
      schedule,
    });

  } catch (error) {
    console.error(
      "Update doctor date exception error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};