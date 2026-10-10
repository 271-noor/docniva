
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const API_URL = "http://localhost:5000";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

async function getJsonResponse(response) {
  const contentType =
    response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await response.json();
  }

  const text = await response.text();

  return {
    success: false,
    message:
      text || `Request failed with status ${response.status}`,
  };
}

function BookAppointment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [schedule, setSchedule] = useState(null);

  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [consultationType, setConsultationType] =
    useState("");
  const [reason, setReason] = useState("");

  const [loadingDoctor, setLoadingDoctor] =
    useState(true);
  const [loadingSchedule, setLoadingSchedule] =
    useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ======================================================
  // TODAY
  // ======================================================

  const todayString = useMemo(() => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  // ======================================================
  // LOAD DOCTOR
  // ======================================================

  useEffect(() => {
    const loadDoctor = async () => {
      if (!id) {
        setError("Doctor ID is missing.");
        setLoadingDoctor(false);
        return;
      }

      try {
        setLoadingDoctor(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/doctors`
        );

        const data = await getJsonResponse(response);

        console.log(
          "DOCTORS FROM BACKEND:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load doctors."
          );
        }

        const doctors = Array.isArray(data)
          ? data
          : data.doctors || [];

        const foundDoctor = doctors.find(
          (item) =>
            String(item._id || item.id) ===
            String(id)
        );

        if (!foundDoctor) {
          throw new Error(
            "Doctor not found."
          );
        }

        setDoctor(foundDoctor);
      } catch (error) {
        console.error(
          "Load doctor error:",
          error
        );

        setDoctor(null);

        setError(
          error.message ||
            "Unable to load doctor."
        );
      } finally {
        setLoadingDoctor(false);
      }
    };

    loadDoctor();
  }, [id]);

  // ======================================================
  // LOAD DOCTOR SCHEDULE
  // ======================================================

  useEffect(() => {
    const loadDoctorSchedule = async () => {
      if (!id) {
        setLoadingSchedule(false);
        return;
      }

      try {
        setLoadingSchedule(true);

        const response = await fetch(
          `${API_URL}/api/doctors/schedule/doctor/${id}`
        );

        const data = await getJsonResponse(response);

        console.log(
          "DOCTOR SCHEDULE FROM BACKEND:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load doctor's schedule."
          );
        }

        if (!data.schedule) {
          throw new Error(
            "Doctor schedule is not available."
          );
        }

        setSchedule(data.schedule);

        const types =
          data.schedule.consultationTypes || [];

        if (types.length > 0) {
          setConsultationType(types[0]);
        } else {
          setConsultationType("");
        }
      } catch (error) {
        console.error(
          "Load doctor schedule error:",
          error
        );

        setSchedule(null);

        setError(
          error.message ||
            "Unable to load doctor's schedule."
        );
      } finally {
        setLoadingSchedule(false);
      }
    };

    loadDoctorSchedule();
  }, [id]);

  // ======================================================
  // DATE EXCEPTION
  // ======================================================

  const selectedDateException = useMemo(() => {
    if (!schedule || !date) {
      return null;
    }

    const exceptions =
      schedule.dateExceptions || [];

    return (
      exceptions.find(
        (exception) =>
          String(exception.date) ===
          String(date)
      ) || null
    );
  }, [schedule, date]);

  // ======================================================
  // SELECTED DAY
  // ======================================================

  const selectedDay = useMemo(() => {
    if (!date) {
      return "";
    }

    const [year, month, day] =
      date.split("-").map(Number);

    const selectedDate = new Date(
      year,
      month - 1,
      day
    );

    return dayNames[
      selectedDate.getDay()
    ];
  }, [date]);

  // ======================================================
  // DATE AVAILABILITY
  // ======================================================

  const dateAvailability = useMemo(() => {
    if (!schedule || !date) {
      return {
        available: false,
        reason: "",
      };
    }

    // Date exception gets priority
    if (selectedDateException) {
      if (
        selectedDateException.isAvailable ===
        false
      ) {
        return {
          available: false,
          reason:
            selectedDateException.reason ||
            "Doctor is not available on this date.",
        };
      }

      return {
        available: true,
        reason: "",
      };
    }

    const availableDays =
      schedule.availableDays || [];

    if (
      !availableDays.includes(
        selectedDay
      )
    ) {
      return {
        available: false,
        reason:
          "Doctor is not available on this day.",
      };
    }

    return {
      available: true,
      reason: "",
    };
  }, [
    schedule,
    date,
    selectedDay,
    selectedDateException,
  ]);

  // ======================================================
  // AVAILABLE TIME SLOTS
  // ======================================================

  const availableTimeSlots = useMemo(() => {
    if (
      !schedule ||
      !date ||
      !dateAvailability.available
    ) {
      return [];
    }

    if (selectedDateException) {
      return (
        selectedDateException.timeSlots || []
      );
    }

    return schedule.timeSlots || [];
  }, [
    schedule,
    date,
    dateAvailability.available,
    selectedDateException,
  ]);

  // ======================================================
  // CONSULTATION TYPES
  // ======================================================

  const consultationTypes = useMemo(() => {
    if (!schedule) {
      return [];
    }

    if (selectedDateException) {
      return (
        selectedDateException.consultationTypes ||
        []
      );
    }

    return (
      schedule.consultationTypes || []
    );
  }, [
    schedule,
    selectedDateException,
  ]);

  // ======================================================
  // DATE CHANGE
  // ======================================================

  const handleDateChange = (event) => {
    const newDate = event.target.value;

    setDate(newDate);
    setSelectedTime("");
    setError("");

    const exception =
      schedule?.dateExceptions?.find(
        (item) =>
          String(item.date) ===
          String(newDate)
      );

    const types = exception
      ? exception.consultationTypes || []
      : schedule?.consultationTypes || [];

    if (types.length > 0) {
      setConsultationType(types[0]);
    } else {
      setConsultationType("");
    }
  };

  // ======================================================
  // PAST TIME
  // ======================================================

  const isPastTime = (timeString) => {
    if (!date || !timeString) {
      return false;
    }

    if (date !== todayString) {
      return false;
    }

    const parts =
      timeString.trim().split(" ");

    if (parts.length !== 2) {
      return false;
    }

    const time = parts[0];
    const modifier =
      parts[1].toUpperCase();

    let [hours, minutes] =
      time.split(":").map(Number);

    if (
      modifier === "PM" &&
      hours !== 12
    ) {
      hours += 12;
    }

    if (
      modifier === "AM" &&
      hours === 12
    ) {
      hours = 0;
    }

    const now = new Date();

    const slotTime = new Date();

    slotTime.setHours(
      hours,
      minutes,
      0,
      0
    );

    return slotTime <= now;
  };

  // ======================================================
  // SUBMIT APPOINTMENT
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!date || !selectedTime) {
      setError(
        "Please select an appointment date and time."
      );
      return;
    }

    if (!dateAvailability.available) {
      setError(
        dateAvailability.reason ||
          "Doctor is not available on this date."
      );
      return;
    }

    if (
      !availableTimeSlots.includes(
        selectedTime
      )
    ) {
      setError(
        "Selected time slot is not available."
      );
      return;
    }

    if (isPastTime(selectedTime)) {
      setError(
        "This time slot has already passed. Please select another time."
      );

      setSelectedTime("");
      return;
    }

    if (
      !consultationTypes.includes(
        consultationType
      )
    ) {
      setError(
        "Selected consultation type is not available."
      );
      return;
    }

    const token = localStorage.getItem(
      "docniva-token"
    );

    if (!token) {
      setError(
        "Please login as a patient before booking an appointment."
      );
      return;
    }

    setLoading(true);

    try {
      console.log(
        "BOOKING APPOINTMENT:",
        {
          doctorId: id,
          date,
          selectedTime,
          consultationType,
          reason: reason.trim(),
        }
      );

      const response = await fetch(
        `${API_URL}/api/appointments`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            doctorId: id,
            date,
            selectedTime,
            consultationType,
            reason: reason.trim(),
          }),
        }
      );

      const data =
        await getJsonResponse(response);

      console.log(
        "CREATE APPOINTMENT RESPONSE:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Appointment booking failed."
        );
      }

      if (!data.appointment) {
        throw new Error(
          "Appointment was created but confirmation data was not returned."
        );
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      navigate(
        "/patient/appointment-confirmed",
        {
          state: data.appointment,
        }
      );
    } catch (error) {
      console.error(
        "Appointment booking error:",
        error
      );

      setError(
        error.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (
    loadingDoctor ||
    loadingSchedule
  ) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <Card className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">
              Loading doctor details...
            </p>
          </Card>
        </div>
      </main>
    );
  }

  // ======================================================
  // DOCTOR NOT FOUND
  // ======================================================

  if (!doctor) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[var(--soft-background)] px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Doctor not found
          </h1>

          <p className="mt-3 text-[var(--text-secondary)]">
            {error ||
              "We couldn't find the doctor you're trying to book."}
          </p>

          <Button
            className="mt-6"
            onClick={() =>
              navigate(
                "/patient/find-doctor"
              )
            }
          >
            Back to Doctors
          </Button>
        </Card>
      </main>
    );
  }

  // ======================================================
  // DOCTOR DATA
  // ======================================================

  const doctorName =
    doctor.name ||
    doctor.fullName ||
    `Dr. ${doctor.firstName || ""} ${
      doctor.lastName || ""
    }`.trim() ||
    "Doctor";

  const specialization =
    doctor.specialization ||
    doctor.speciality ||
    doctor.specialty ||
    "Doctor";

  const fee =
    doctor.consultationFee ??
    doctor.fee ??
    doctor.consultation_fee ??
    0;

  // ======================================================
  // UI
  // ======================================================

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">

        <button
          type="button"
          onClick={() =>
            navigate(
              `/patient/doctor/${id}`
            )
          }
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Doctor
        </button>

        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">
            Appointment
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Book an Appointment
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            Choose your preferred date and time.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* ==================================================
              FORM
          ================================================== */}

          <Card className="p-6 sm:p-8">

            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >

              {/* DOCTOR */}

              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Doctor
                </p>

                <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-4">
                  <h2 className="font-semibold text-[var(--text-primary)]">
                    {doctorName}
                  </h2>

                  <p className="mt-1 text-sm text-[var(--primary)]">
                    {specialization}
                  </p>
                </div>
              </div>

              {/* DATE */}

              <div>
                <label
                  htmlFor="appointment-date"
                  className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                >
                  Select Date
                </label>

                <input
                  id="appointment-date"
                  type="date"
                  value={date}
                  min={todayString}
                  onChange={handleDateChange}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                />

                {!date && (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Select a date to see available time slots.
                  </p>
                )}

                {date && (
                  <div className="mt-3 rounded-xl bg-[var(--soft-background)] p-3">

                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {selectedDay}
                    </p>

                    {!dateAvailability.available && (
                      <p className="mt-1 text-xs text-red-500">
                        {dateAvailability.reason}
                      </p>
                    )}

                    {dateAvailability.available && (
                      <p className="mt-1 text-xs text-green-600">
                        Doctor is available on this date.
                      </p>
                    )}

                    {selectedDateException?.reason && (
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Note:{" "}
                        {selectedDateException.reason}
                      </p>
                    )}

                  </div>
                )}
              </div>

              {/* TIME */}

              <div>
                <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">
                  Select Time
                </p>

                {!date ? (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-4">
                    <p className="text-sm text-[var(--text-secondary)]">
                      Please select a date first.
                    </p>
                  </div>
                ) : !dateAvailability.available ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      No appointments are available for this date.
                    </p>
                  </div>
                ) : availableTimeSlots.length === 0 ? (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-4">
                    <p className="text-sm text-[var(--text-secondary)]">
                      No time slots available for this date.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                    {availableTimeSlots.map(
                      (slot) => {
                        const disabled =
                          isPastTime(slot);

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                              setSelectedTime(slot);
                              setError("");
                            }}
                            className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                              disabled
                                ? "cursor-not-allowed border-[var(--border)] bg-gray-100 text-gray-400 opacity-60 dark:bg-gray-800 dark:text-gray-500"
                                : selectedTime === slot
                                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                                : "border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      }
                    )}

                  </div>
                )}

              </div>

              {/* CONSULTATION */}

              <div>
                <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">
                  Consultation Type
                </p>

                {consultationTypes.length === 0 ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      No consultation type is available for this date.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">

                    {consultationTypes.map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setConsultationType(type);
                            setError("");
                          }}
                          className={`rounded-xl border p-4 text-left transition ${
                            consultationType === type
                              ? "border-[var(--primary)] bg-[var(--primary-light)]"
                              : "border-[var(--border)] bg-[var(--card)]"
                          }`}
                        >
                          <p className="font-medium text-[var(--text-primary)]">
                            {type === "Online"
                              ? "Online Consultation"
                              : "Clinic Visit"}
                          </p>

                          <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            {type === "Online"
                              ? "Consult through an online appointment."
                              : "Visit the doctor's clinic."}
                          </p>
                        </button>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* REASON */}

              <div>
                <label
                  htmlFor="reason"
                  className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
                >
                  Reason for Visit
                </label>

                <textarea
                  id="reason"
                  rows="4"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="Briefly describe the reason for your visit..."
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                />
              </div>

              {/* SUBMIT */}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={
                  !date ||
                  !selectedTime ||
                  !dateAvailability.available ||
                  consultationTypes.length === 0 ||
                  !consultationType ||
                  loading
                }
              >
                {loading
                  ? "Sending Request..."
                  : "Send Appointment Request"}
              </Button>

            </form>

          </Card>

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div>
            <Card className="p-6 lg:sticky lg:top-24">

              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Booking Summary
              </h2>

              <div className="mt-5 space-y-4">

                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Doctor
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                    {doctorName}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Specialization
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                    {specialization}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                    {date || "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Day
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                    {selectedDay || "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Time
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                    {selectedTime || "Not selected"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Consultation
                  </p>

                  <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                    {consultationType || "Not selected"}
                  </p>
                </div>

                <div className="border-t border-[var(--border)] pt-4">

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-[var(--text-secondary)]">
                      Consultation Fee
                    </span>

                    <span className="font-bold text-[var(--text-primary)]">
                      {fee
                        ? `₹${fee}`
                        : "Not specified"}
                    </span>

                  </div>

                </div>

              </div>

            </Card>
          </div>

        </div>
      </div>
    </main>
  );
}

export default BookAppointment;

