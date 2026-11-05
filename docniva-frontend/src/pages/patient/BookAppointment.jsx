import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import { api } from "../../lib/api";

const pad = (n) => String(n).padStart(2, "0");

const getLocalToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const typeInfo = {
  "Clinic Visit": {
    title: "Clinic Visit",
    text: "Visit the doctor's clinic.",
  },
  Online: {
    title: "Online Consultation",
    text: "Consult through an online appointment.",
  },
};

function BookAppointment() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [doctorError, setDoctorError] = useState("");

  const [date, setDate] = useState("");
  const [slotsData, setSlotsData] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedTime, setSelectedTime] = useState("");
  const [consultationType, setConsultationType] = useState("");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const today = getLocalToday();

  // ---------- LOAD DOCTOR ----------
  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoadingDoctor(true);
      setDoctorError("");

      const res = await api(`/api/doctors/${id}`, { signal: controller.signal });
      if (res.aborted) return;

      if (!res.ok) {
        setDoctor(null);
        setDoctorError(res.data.message || "Unable to load doctor.");
      } else {
        setDoctor(res.data.doctor);
      }
      setLoadingDoctor(false);
    };

    load();
    return () => controller.abort();
  }, [id]);

  // ---------- LOAD SLOTS (date badalne par) ----------
  useEffect(() => {
    if (!date) {
      setSlotsData(null);
      return undefined;
    }

    const controller = new AbortController();

    const load = async () => {
      setLoadingSlots(true);
      setSelectedTime("");

      const res = await api(`/api/doctors/${id}/slots?date=${date}`, {
        signal: controller.signal,
      });
      if (res.aborted) return;

      if (!res.ok) {
        setSlotsData(null);
        setError(res.data.message || "Unable to load time slots.");
      } else {
        setSlotsData(res.data);
        const types = res.data.consultationTypes || [];
        setConsultationType((prev) =>
          types.includes(prev) ? prev : types[0] || ""
        );
      }
      setLoadingSlots(false);
    };

    load();
    return () => controller.abort();
  }, [id, date, refreshKey]);

  const slots = slotsData?.slots || [];
  const types = slotsData?.consultationTypes || [];
  const dayAvailable = Boolean(slotsData?.available);
  const hasFreeSlot = slots.some((slot) => slot.available);
  const selectedSlot = slots.find((slot) => slot.time === selectedTime);

  // ---------- SUBMIT ----------
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError("");

    if (!date || !selectedTime) {
      setError("Please select an appointment date and time.");
      return;
    }

    setSubmitting(true);

    const res = await api("/api/appointments", {
      method: "POST",
      token: localStorage.getItem("docniva-token"),
      body: {
        doctorId: id,
        date,
        selectedTime,
        consultationType,
        reason: reason.trim(),
      },
    });

    setSubmitting(false);

    if (res.status === 401) {
      setError("Please login as a patient before booking an appointment.");
      return;
    }

    if (!res.ok) {
      setError(res.data.message || "Appointment booking failed.");
      // Slot kisi aur ne le liya ho sakta hai, list dobara mangao
      if (res.status === 409) {
        setSelectedTime("");
        setRefreshKey((key) => key + 1);
      }
      return;
    }

    navigate("/patient/appointment-confirmed", { state: res.data.appointment });
  };

  // ---------- LOADING / NOT FOUND ----------
  if (loadingDoctor) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <Card className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">Loading doctor details...</p>
          </Card>
        </div>
      </main>
    );
  }

  if (!doctor) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[var(--soft-background)] px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Doctor not found
          </h1>
          <p className="mt-3 text-[var(--text-secondary)]">
            {doctorError || "We couldn't find the doctor you're trying to book."}
          </p>
          <Button className="mt-6" onClick={() => navigate("/patient/find-doctor")}>
            Back to Doctors
          </Button>
        </Card>
      </main>
    );
  }

  const fee = doctor.consultationFee;

  const summaryRows = [
    ["Doctor", doctor.name],
    ["Specialization", doctor.specialization],
    ["Date", date || "Not selected"],
    ["Time", selectedSlot?.label || "Not selected"],
    ["Consultation", consultationType || "Not selected"],
  ];

  // ---------- UI ----------
  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(`/patient/doctor/${id}`)}
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Doctor
        </button>

        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">Appointment</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Book an Appointment
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Choose your preferred date and time.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* DOCTOR */}
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">Doctor</p>
                <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-4">
                  <h2 className="font-semibold text-[var(--text-primary)]">{doctor.name}</h2>
                  <p className="mt-1 text-sm text-[var(--primary)]">{doctor.specialization}</p>
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
                  min={today}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setError("");
                  }}
                  required
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                />
                {!date && (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Select a date to see available time slots.
                  </p>
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
                ) : loadingSlots ? (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-4">
                    <p className="text-sm text-[var(--text-secondary)]">
                      Loading time slots...
                    </p>
                  </div>
                ) : !slotsData ? (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-4">
                    <p className="text-sm text-[var(--text-secondary)]">
                      Time slots could not be loaded. Please pick the date again.
                    </p>
                  </div>
                ) : !dayAvailable ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {slotsData.reason || "No appointments are available for this date."}
                    </p>
                  </div>
                ) : !hasFreeSlot ? (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-4">
                    <p className="text-sm text-[var(--text-secondary)]">
                      All slots for this date are booked. Please try another date.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => {
                          setSelectedTime(slot.time);
                          setError("");
                        }}
                        className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                          !slot.available
                            ? "cursor-not-allowed border-[var(--border)] bg-gray-100 text-gray-400 line-through opacity-60 dark:bg-gray-800 dark:text-gray-500"
                            : selectedTime === slot.time
                            ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                            : "border-[var(--border)] bg-[var(--card)] text-[var(--text-primary)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* CONSULTATION TYPE */}
              {dayAvailable && types.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">
                    Consultation Type
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {types.map((type) => (
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
                          {typeInfo[type]?.title || type}
                        </p>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {typeInfo[type]?.text || ""}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                  maxLength={500}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Briefly describe the reason for your visit..."
                  className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-text)] outline-none placeholder:text-[var(--input-placeholder)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!date || !selectedTime || !consultationType || submitting}
              >
                {submitting ? "Sending Request..." : "Send Appointment Request"}
              </Button>

              <p className="text-center text-xs text-[var(--text-muted)]">
                After sending the request you have 10 minutes to complete the
                payment, otherwise the slot is released.
              </p>
            </form>
          </Card>

          {/* SUMMARY */}
          <div>
            <Card className="p-6 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Booking Summary
              </h2>

              <div className="mt-5 space-y-4">
                {summaryRows.map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-[var(--text-muted)]">{label}</p>
                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                      {value}
                    </p>
                  </div>
                ))}

                <div className="border-t border-[var(--border)] pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">
                      Consultation Fee
                    </span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {fee ? `₹${fee}` : "Not specified"}
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