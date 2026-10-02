
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const defaultSchedule = {
  Monday: {
    enabled: true,
    start: "10:00",
    end: "18:00",
    breakStart: "13:00",
    breakEnd: "14:00",
  },

  Tuesday: {
    enabled: true,
    start: "10:00",
    end: "18:00",
    breakStart: "13:00",
    breakEnd: "14:00",
  },

  Wednesday: {
    enabled: true,
    start: "10:00",
    end: "18:00",
    breakStart: "13:00",
    breakEnd: "14:00",
  },

  Thursday: {
    enabled: true,
    start: "10:00",
    end: "18:00",
    breakStart: "13:00",
    breakEnd: "14:00",
  },

  Friday: {
    enabled: true,
    start: "10:00",
    end: "18:00",
    breakStart: "13:00",
    breakEnd: "14:00",
  },

  Saturday: {
    enabled: false,
    start: "10:00",
    end: "14:00",
    breakStart: "",
    breakEnd: "",
  },

  Sunday: {
    enabled: false,
    start: "10:00",
    end: "14:00",
    breakStart: "",
    breakEnd: "",
  },
};

function DoctorSchedule() {
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(defaultSchedule);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedSchedule = localStorage.getItem(
      "docniva-doctor-schedule"
    );

    if (savedSchedule) {
      try {
        const parsedSchedule = JSON.parse(savedSchedule);

        setSchedule({
          ...defaultSchedule,
          ...parsedSchedule,
        });
      } catch (error) {
        console.error("Invalid schedule data:", error);
      }
    }
  }, []);

  const handleDayToggle = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));

    setSaved(false);
    setError("");
  };

  const handleChange = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));

    setSaved(false);
    setError("");
  };

  const validateSchedule = () => {
    for (const day of days) {
      const daySchedule = schedule[day];

      if (!daySchedule.enabled) {
        continue;
      }

      if (!daySchedule.start || !daySchedule.end) {
        return `${day}: Please select start and end time.`;
      }

      if (daySchedule.start >= daySchedule.end) {
        return `${day}: End time must be later than start time.`;
      }

      const hasBreakStart = Boolean(daySchedule.breakStart);
      const hasBreakEnd = Boolean(daySchedule.breakEnd);

      if (hasBreakStart !== hasBreakEnd) {
        return `${day}: Please select both break start and break end time.`;
      }

      if (hasBreakStart && hasBreakEnd) {
        if (daySchedule.breakStart >= daySchedule.breakEnd) {
          return `${day}: Break end must be later than break start.`;
        }

        if (
          daySchedule.breakStart <= daySchedule.start ||
          daySchedule.breakEnd >= daySchedule.end
        ) {
          return `${day}: Break must be inside working hours.`;
        }
      }
    }

    return "";
  };

  const handleSave = (event) => {
    event.preventDefault();

    const validationError = validateSchedule();

    if (validationError) {
      setError(validationError);
      setSaved(false);
      return;
    }

    localStorage.setItem(
      "docniva-doctor-schedule",
      JSON.stringify(schedule)
    );

    setError("");
    setSaved(true);
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset your schedule to the default timings?"
    );

    if (!confirmed) {
      return;
    }

    setSchedule(defaultSchedule);

    localStorage.setItem(
      "docniva-doctor-schedule",
      JSON.stringify(defaultSchedule)
    );

    setSaved(true);
    setError("");
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/doctor/dashboard")}
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">
            Doctor Schedule
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Manage Schedule
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            Set your available days and consultation timings.
          </p>
        </div>

        {/* Schedule */}
        <Card className="p-6 sm:p-8">

          <form onSubmit={handleSave}>

            <div className="space-y-4">

              {days.map((day) => {
                const daySchedule = schedule[day];

                return (
                  <div
                    key={day}
                    className={`rounded-2xl border p-4 transition sm:p-5 ${
                      daySchedule.enabled
                        ? "border-[var(--border)] bg-[var(--card)]"
                        : "border-[var(--border)] bg-[var(--soft-background)]"
                    }`}
                  >

                    {/* Day Header */}
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                      <div className="flex items-center gap-3">

                        <input
                          id={`${day}-enabled`}
                          type="checkbox"
                          checked={daySchedule.enabled}
                          onChange={() => handleDayToggle(day)}
                          className="h-5 w-5 accent-[var(--primary)]"
                        />

                        <label
                          htmlFor={`${day}-enabled`}
                          className="cursor-pointer"
                        >
                          <p className="font-semibold text-[var(--text-primary)]">
                            {day}
                          </p>

                          <p className="text-xs text-[var(--text-muted)]">
                            {daySchedule.enabled
                              ? "Available"
                              : "Unavailable"}
                          </p>
                        </label>

                      </div>

                      {/* Timing */}
                      {daySchedule.enabled && (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                          {/* Start */}
                          <div>
                            <label
                              htmlFor={`${day}-start`}
                              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
                            >
                              Start Time
                            </label>

                            <input
                              id={`${day}-start`}
                              type="time"
                              value={daySchedule.start}
                              onChange={(event) =>
                                handleChange(
                                  day,
                                  "start",
                                  event.target.value
                                )
                              }
                              required
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm text-[var(--input-text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                            />
                          </div>

                          {/* End */}
                          <div>
                            <label
                              htmlFor={`${day}-end`}
                              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
                            >
                              End Time
                            </label>

                            <input
                              id={`${day}-end`}
                              type="time"
                              value={daySchedule.end}
                              onChange={(event) =>
                                handleChange(
                                  day,
                                  "end",
                                  event.target.value
                                )
                              }
                              required
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm text-[var(--input-text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                            />
                          </div>

                          {/* Break Start */}
                          <div>
                            <label
                              htmlFor={`${day}-break-start`}
                              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
                            >
                              Break Start
                            </label>

                            <input
                              id={`${day}-break-start`}
                              type="time"
                              value={daySchedule.breakStart}
                              onChange={(event) =>
                                handleChange(
                                  day,
                                  "breakStart",
                                  event.target.value
                                )
                              }
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm text-[var(--input-text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                            />
                          </div>

                          {/* Break End */}
                          <div>
                            <label
                              htmlFor={`${day}-break-end`}
                              className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
                            >
                              Break End
                            </label>

                            <input
                              id={`${day}-break-end`}
                              type="time"
                              value={daySchedule.breakEnd}
                              onChange={(event) =>
                                handleChange(
                                  day,
                                  "breakEnd",
                                  event.target.value
                                )
                              }
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm text-[var(--input-text)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                            />
                          </div>

                        </div>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

            {/* Info */}
            <div className="mt-6 rounded-xl bg-[var(--primary-light)] p-4">
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Set your working hours and optional break timings for each
                available day. These settings will later be used by the
                appointment booking system.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {/* Success */}
            {saved && !error && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">
                  ✓ Schedule saved successfully.
                </p>
              </div>
            )}

            {/* Actions */}
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
              >
                Reset Schedule
              </Button>

              <Button type="submit">
                Save Schedule
              </Button>

            </div>

          </form>

        </Card>

      </div>
    </main>
  );
}

export default DoctorSchedule;

