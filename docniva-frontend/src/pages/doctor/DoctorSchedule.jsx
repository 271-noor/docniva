import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const durations = [15, 20, 30, 45, 60];
const typeOptions = ["Clinic Visit", "Online"];

const weekdayDefault = {
  enabled: true,
  startTime: "10:00",
  endTime: "18:00",
  breakStart: "13:00",
  breakEnd: "14:00",
};

const weekendDefault = {
  enabled: false,
  startTime: "10:00",
  endTime: "14:00",
  breakStart: "",
  breakEnd: "",
};

const createDefaultSchedule = () =>
  Object.fromEntries(
    days.map((day) => [
      day,
      { ...(day === "Saturday" || day === "Sunday" ? weekendDefault : weekdayDefault) },
    ])
  );

const getToken = () => localStorage.getItem("docniva-doctor-token");

function DoctorSchedule() {
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(createDefaultSchedule());
  const [slotDuration, setSlotDuration] = useState(30);
  const [consultationTypes, setConsultationTypes] = useState(["Clinic Visit"]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // ---------- LOAD ----------
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const response = await fetch(`${API_URL}/api/doctors/schedule`, {
          credentials: "include",
          headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Unable to load doctor schedule.");
          return;
        }

        const backend = data.schedule || {};
        const next = createDefaultSchedule();
        const savedDays = Array.isArray(backend.weekly) ? backend.weekly : [];

        // Pehle sab din band, phir save wale din chalu
        days.forEach((day) => {
          next[day].enabled = false;
        });

        savedDays.forEach((item) => {
          if (!next[item.day]) return;
          next[item.day] = {
            enabled: true,
            startTime: item.startTime,
            endTime: item.endTime,
            breakStart: item.breakStart || "",
            breakEnd: item.breakEnd || "",
          };
        });

        // Pehli baar (kuch save nahi hua) to default weekdays chalu rakho
        setSchedule(savedDays.length > 0 ? next : createDefaultSchedule());

        if (durations.includes(backend.slotDurationMinutes)) {
          setSlotDuration(backend.slotDurationMinutes);
        }
        if (
          Array.isArray(backend.consultationTypes) &&
          backend.consultationTypes.length > 0
        ) {
          setConsultationTypes(backend.consultationTypes);
        }
      } catch {
        setError("Unable to connect to the backend.");
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  // ---------- CHANGE HANDLERS ----------
  const markDirty = () => {
    setSaved(false);
    setError("");
  };

  const handleDayToggle = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
    markDirty();
  };

  const handleChange = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
    markDirty();
  };

  const handleTypeToggle = (type) => {
    setConsultationTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
    markDirty();
  };

  // ---------- VALIDATE ----------
  const validateSchedule = () => {
    const enabledDays = days.filter((day) => schedule[day].enabled);

    if (enabledDays.length === 0) {
      return "Please select at least one available day.";
    }

    if (consultationTypes.length === 0) {
      return "Please select at least one consultation type.";
    }

    for (const day of enabledDays) {
      const { startTime, endTime, breakStart, breakEnd } = schedule[day];

      if (!startTime || !endTime) {
        return `${day}: Please select start and end time.`;
      }
      if (startTime >= endTime) {
        return `${day}: End time must be later than start time.`;
      }
      if (Boolean(breakStart) !== Boolean(breakEnd)) {
        return `${day}: Please select both break start and break end time.`;
      }
      if (breakStart && breakEnd) {
        if (breakStart >= breakEnd) {
          return `${day}: Break end must be later than break start.`;
        }
        if (breakStart <= startTime || breakEnd >= endTime) {
          return `${day}: Break must be inside working hours.`;
        }
      }
    }

    return "";
  };

  // ---------- SAVE ----------
  const handleSave = async (event) => {
    event.preventDefault();
    setSaved(false);
    setError("");

    const validationError = validateSchedule();
    if (validationError) {
      setError(validationError);
      return;
    }

    const weekly = days
      .filter((day) => schedule[day].enabled)
      .map((day) => ({
        day,
        startTime: schedule[day].startTime,
        endTime: schedule[day].endTime,
        breakStart: schedule[day].breakStart || "",
        breakEnd: schedule[day].breakEnd || "",
      }));

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/api/doctors/schedule`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify({
          weekly,
          slotDurationMinutes: slotDuration,
          consultationTypes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to save schedule.");
        return;
      }

      setSaved(true);
    } catch {
      setError("Unable to connect to the backend.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- RESET ----------
  const handleReset = () => {
    if (!window.confirm("Reset your schedule to the default timings?")) return;

    setSchedule(createDefaultSchedule());
    setSlotDuration(30);
    setConsultationTypes(["Clinic Visit"]);
    markDirty();
  };

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]";

  // ---------- LOADING ----------
  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <Card className="p-8">
            <p className="text-center text-[var(--text-secondary)]">
              Loading schedule...
            </p>
          </Card>
        </div>
      </main>
    );
  }

  // ---------- UI ----------
  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <button
          type="button"
          onClick={() => navigate("/doctor/dashboard")}
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">Doctor Schedule</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Manage Schedule
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Set your available days and consultation timings.
          </p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSave}>
            {/* Slot duration + consultation types */}
            <div className="mb-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="slot-duration"
                  className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
                >
                  Appointment length
                </label>
                <select
                  id="slot-duration"
                  value={slotDuration}
                  onChange={(event) => {
                    setSlotDuration(Number(event.target.value));
                    markDirty();
                  }}
                  className={inputClass}
                >
                  {durations.map((minutes) => (
                    <option key={minutes} value={minutes}>
                      {minutes} minutes
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Consultation types
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  {typeOptions.map((type) => (
                    <label
                      key={type}
                      className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]"
                    >
                      <input
                        type="checkbox"
                        checked={consultationTypes.includes(type)}
                        onChange={() => handleTypeToggle(type)}
                        className="h-4 w-4 accent-[var(--primary)]"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Days */}
            <div className="space-y-4">
              {days.map((day) => {
                const daySchedule = schedule[day];

                return (
                  <div
                    key={day}
                    className={`rounded-2xl border p-4 sm:p-5 ${
                      daySchedule.enabled
                        ? "border-[var(--border)] bg-[var(--card)]"
                        : "border-[var(--border)] bg-[var(--soft-background)]"
                    }`}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          id={`${day}-enabled`}
                          type="checkbox"
                          checked={daySchedule.enabled}
                          onChange={() => handleDayToggle(day)}
                          className="h-5 w-5 accent-[var(--primary)]"
                        />
                        <label htmlFor={`${day}-enabled`} className="cursor-pointer">
                          <p className="font-semibold text-[var(--text-primary)]">
                            {day}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            {daySchedule.enabled ? "Available" : "Unavailable"}
                          </p>
                        </label>
                      </div>

                      {daySchedule.enabled && (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          {[
                            ["startTime", "Start Time"],
                            ["endTime", "End Time"],
                            ["breakStart", "Break Start"],
                            ["breakEnd", "Break End"],
                          ].map(([field, label]) => (
                            <div key={field}>
                              <label
                                htmlFor={`${day}-${field}`}
                                className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
                              >
                                {label}
                              </label>
                              <input
                                id={`${day}-${field}`}
                                type="time"
                                value={daySchedule[field]}
                                onChange={(event) =>
                                  handleChange(day, field, event.target.value)
                                }
                                className={inputClass}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl bg-[var(--primary-light)] p-4">
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Each day uses its own timings. Patients can book slots of the
                selected length, and break time is skipped automatically.
              </p>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {saved && !error && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">
                  ✓ Schedule saved successfully.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/doctor/dashboard")}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={saving}
              >
                Reset Schedule
              </Button>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Schedule"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default DoctorSchedule;