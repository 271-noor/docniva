
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const doctors = {
  1: {
    name: "Dr. Rozy",
    specialization: "Cardiologist",
    fee: "₹800",
  },
  2: {
    name: "Dr. Noor",
    specialization: "Dermatologist",
    fee: "₹600",
  },
  3: {
    name: "Dr. Priya Singh",
    specialization: "General Physician",
    fee: "₹500",
  },
};

const timeSlots = [
  { label: "10:00 AM", hour: 10, minute: 0 },
  { label: "11:00 AM", hour: 11, minute: 0 },
  { label: "12:00 PM", hour: 12, minute: 0 },
  { label: "02:00 PM", hour: 14, minute: 0 },
  { label: "04:00 PM", hour: 16, minute: 0 },
  { label: "06:00 PM", hour: 18, minute: 0 },
];

function BookAppointment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const doctor = doctors[id];

  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [consultationType, setConsultationType] =
    useState("Clinic Visit");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const isPastTime = (hour, minute) => {
    if (!date) return false;

    const today = new Date();
    const selectedDate = new Date(`${date}T00:00:00`);

    const isToday =
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate();

    if (!isToday) return false;

    const slotTime = new Date();
    slotTime.setHours(hour, minute, 0, 0);

    return slotTime <= today;
  };

  if (!doctor) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[var(--soft-background)] px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Doctor not found
          </h1>

          <p className="mt-3 text-[var(--text-secondary)]">
            We couldn't find the doctor you're trying to book.
          </p>

          <Button
            className="mt-6"
            onClick={() => navigate("/patient/find-doctor")}
          >
            Back to Doctors
          </Button>
        </Card>
      </main>
    );
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!date || !selectedTime) {
      setError("Please select an appointment date and time.");
      return;
    }

    /*
     * Get currently logged-in patient.
     *
     * PatientLogin / PatientRegister save the current
     * patient inside "docniva-current-patient".
     */
    const savedPatient = localStorage.getItem(
      "docniva-current-patient"
    );

    if (!savedPatient) {
      setError(
        "Please login as a patient before booking an appointment."
      );
      return;
    }

    let patient;

    try {
      const parsedPatient = JSON.parse(savedPatient);

      patient = {
        id: parsedPatient.id || "",
        name:
          parsedPatient.name ||
          parsedPatient.fullName ||
          "Patient",
        email:
          parsedPatient.email ||
          "Email not available",
        mobile:
          parsedPatient.mobile ||
          "",
      };
    } catch (error) {
      console.error(
        "Invalid patient data:",
        error
      );

      setError(
        "Patient information could not be loaded. Please login again."
      );
      return;
    }

    /*
     * Appointment starts as PENDING.
     *
     * Doctor will Accept or Reject it later.
     */
    const appointment = {
      id: Date.now().toString(),

      patient,

      doctor: {
        name: doctor.name,
        specialization: doctor.specialization,
        fee: doctor.fee,
      },

      date,
      selectedTime,
      consultationType,
      reason: reason.trim(),

      status: "pending",

      createdAt: new Date().toISOString(),
    };

    /*
     * Save appointment locally.
     *
     * Backend will replace this later.
     */
    localStorage.setItem(
      "docniva-appointment",
      JSON.stringify(appointment)
    );

    /*
     * Go to confirmation page.
     */
    navigate("/patient/appointment-confirmed", {
      state: appointment,
    });
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            navigate(`/patient/doctor/${id}`)
          }
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Doctor
        </button>

        {/* Header */}
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

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* Booking Form */}
          <Card className="p-6 sm:p-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >

              {/* Doctor */}
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Doctor
                </p>

                <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-4">
                  <h2 className="font-semibold text-[var(--text-primary)]">
                    {doctor.name}
                  </h2>

                  <p className="mt-1 text-sm text-[var(--primary)]">
                    {doctor.specialization}
                  </p>
                </div>
              </div>

              {/* Date */}
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
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(event) => {
                    setDate(event.target.value);
                    setSelectedTime("");
                    setError("");
                  }}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                />

                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Select a convenient date for your appointment.
                </p>
              </div>

              {/* Time Slots */}
              <div>
                <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">
                  Select Time
                </p>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {timeSlots.map((slot) => {
                    const disabled = isPastTime(
                      slot.hour,
                      slot.minute
                    );

                    return (
                      <button
                        key={slot.label}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          setSelectedTime(slot.label);
                          setError("");
                        }}
                        className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                          disabled
                            ? "cursor-not-allowed border-[var(--border)] bg-gray-100 text-gray-400 opacity-60 dark:bg-gray-800 dark:text-gray-500"
                            : selectedTime ===
                              slot.label
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Consultation Type */}
              <div>
                <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">
                  Consultation Type
                </p>

                <div className="grid gap-3 sm:grid-cols-2">

                  <button
                    type="button"
                    onClick={() =>
                      setConsultationType(
                        "Clinic Visit"
                      )
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      consultationType ===
                      "Clinic Visit"
                        ? "border-[var(--primary)] bg-[var(--primary-light)]"
                        : "border-[var(--border)] bg-[var(--card)]"
                    }`}
                  >
                    <p className="font-medium text-[var(--text-primary)]">
                      Clinic Visit
                    </p>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Visit the doctor's clinic.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setConsultationType("Online")
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      consultationType === "Online"
                        ? "border-[var(--primary)] bg-[var(--primary-light)]"
                        : "border-[var(--border)] bg-[var(--card)]"
                    }`}
                  >
                    <p className="font-medium text-[var(--text-primary)]">
                      Online Consultation
                    </p>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Consult through an online appointment.
                    </p>
                  </button>

                </div>
              </div>

              {/* Reason */}
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

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!date || !selectedTime}
              >
                Send Appointment Request
              </Button>

            </form>
          </Card>

          {/* Summary */}
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
                    {doctor.name}
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
                    {consultationType}
                  </p>
                </div>

                <div className="border-t border-[var(--border)] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">
                      Consultation Fee
                    </span>

                    <span className="font-bold text-[var(--text-primary)]">
                      {doctor.fee}
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

