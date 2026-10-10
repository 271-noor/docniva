
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

const API_URL = "http://localhost:5000";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const createDefaultSchedule = () => ({
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
});

function DoctorSchedule() {
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState(
    createDefaultSchedule()
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD SCHEDULE
  // ======================================================

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem(
          "docniva-doctor-token"
        );

        if (!token) {
          setError("Doctor login required.");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/doctors/schedule`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log(
          "GET DOCTOR SCHEDULE:",
          data
        );

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load doctor schedule."
          );
          return;
        }

        const backendSchedule = data.schedule;

        if (!backendSchedule) {
          return;
        }

        const backendDays =
          Array.isArray(
            backendSchedule.availableDays
          )
            ? backendSchedule.availableDays
            : [];

        const backendSlots =
          Array.isArray(
            backendSchedule.timeSlots
          )
            ? backendSchedule.timeSlots
            : [];

        const updatedSchedule =
          createDefaultSchedule();

        // --------------------------------------------------
        // AVAILABLE DAYS
        // --------------------------------------------------

        days.forEach((day) => {
          updatedSchedule[day].enabled =
            backendDays.includes(day);
        });

        // --------------------------------------------------
        // BACKEND SLOTS SE FIRST/LAST TIME
        // --------------------------------------------------

        if (backendSlots.length > 0) {
          const convertTo24Hour = (time) => {
            if (!time) {
              return "";
            }

            const parts = time.trim().split(" ");

            if (parts.length !== 2) {
              return time;
            }

            const rawTime = parts[0];
            const modifier =
              parts[1].toUpperCase();

            let [hours, minutes] =
              rawTime.split(":").map(Number);

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

            return `${String(hours).padStart(
              2,
              "0"
            )}:${String(minutes).padStart(
              2,
              "0"
            )}`;
          };

          const convertedSlots =
            backendSlots
              .map(convertTo24Hour)
              .filter(Boolean);

          if (convertedSlots.length > 0) {
            const firstSlot =
              convertedSlots[0];

            const lastSlot =
              convertedSlots[
                convertedSlots.length - 1
              ];

            days.forEach((day) => {
              if (
                updatedSchedule[day].enabled
              ) {
                updatedSchedule[day].start =
                  firstSlot;

                // Last slot ko exact end na maan kar
                // next 1 hour ko end maanenge.
                const [hours, minutes] =
                  lastSlot
                    .split(":")
                    .map(Number);

                const endDate = new Date();

                endDate.setHours(
                  hours,
                  minutes + 60,
                  0,
                  0
                );

                updatedSchedule[day].end =
                  `${String(
                    endDate.getHours()
                  ).padStart(
                    2,
                    "0"
                  )}:${String(
                    endDate.getMinutes()
                  ).padStart(
                    2,
                    "0"
                  )}`;
              }
            });
          }
        }

        setSchedule(updatedSchedule);
      } catch (error) {
        console.error(
          "Load doctor schedule error:",
          error
        );

        setError(
          "Unable to connect to the backend."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  // ======================================================
  // DAY TOGGLE
  // ======================================================

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

  // ======================================================
  // INPUT CHANGE
  // ======================================================

  const handleChange = (
    day,
    field,
    value
  ) => {
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

  // ======================================================
  // VALIDATE
  // ======================================================

  const validateSchedule = () => {
    const enabledDays = days.filter(
      (day) => schedule[day].enabled
    );

    if (enabledDays.length === 0) {
      return "Please select at least one available day.";
    }

    for (const day of days) {
      const daySchedule = schedule[day];

      if (!daySchedule.enabled) {
        continue;
      }

      if (
        !daySchedule.start ||
        !daySchedule.end
      ) {
        return `${day}: Please select start and end time.`;
      }

      if (
        daySchedule.start >=
        daySchedule.end
      ) {
        return `${day}: End time must be later than start time.`;
      }

      const hasBreakStart =
        Boolean(daySchedule.breakStart);

      const hasBreakEnd =
        Boolean(daySchedule.breakEnd);

      if (
        hasBreakStart !== hasBreakEnd
      ) {
        return `${day}: Please select both break start and break end time.`;
      }

      if (
        hasBreakStart &&
        hasBreakEnd
      ) {
        if (
          daySchedule.breakStart >=
          daySchedule.breakEnd
        ) {
          return `${day}: Break end must be later than break start.`;
        }

        if (
          daySchedule.breakStart <=
            daySchedule.start ||
          daySchedule.breakEnd >=
            daySchedule.end
        ) {
          return `${day}: Break must be inside working hours.`;
        }
      }
    }

    return "";
  };

  // ======================================================
  // FORMAT TIME
  // ======================================================

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    let [hours, minutes] =
      time.split(":").map(Number);

    const modifier =
      hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
      hours = 12;
    }

    return `${String(hours).padStart(
      2,
      "0"
    )}:${String(minutes).padStart(
      2,
      "0"
    )} ${modifier}`;
  };

  // ======================================================
  // GENERATE TIME SLOTS
  // ======================================================

  const generateTimeSlots = () => {
    const enabledDays = days.filter(
      (day) => schedule[day].enabled
    );

    if (enabledDays.length === 0) {
      return [];
    }

    // Backend currently has one common timeSlots array.
    // Isliye first enabled day ke timings use karenge.

    const firstDay = enabledDays[0];

    const {
      start,
      end,
      breakStart,
      breakEnd,
    } = schedule[firstDay];

    if (!start || !end) {
      return [];
    }

    let [startHour, startMinute] =
      start.split(":").map(Number);

    const [endHour, endMinute] =
      end.split(":").map(Number);

    const breakStartMinutes =
      breakStart
        ? Number(
            breakStart.split(":")[0]
          ) *
            60 +
          Number(
            breakStart.split(":")[1]
          )
        : null;

    const breakEndMinutes =
      breakEnd
        ? Number(
            breakEnd.split(":")[0]
          ) *
            60 +
          Number(
            breakEnd.split(":")[1]
          )
        : null;

    const slots = [];

    while (
      startHour * 60 +
        startMinute <
      endHour * 60 +
        endMinute
    ) {
      const currentMinutes =
        startHour * 60 +
        startMinute;

      if (
        breakStartMinutes !== null &&
        breakEndMinutes !== null &&
        currentMinutes >=
          breakStartMinutes &&
        currentMinutes <
          breakEndMinutes
      ) {
        startMinute += 60;

        if (startMinute >= 60) {
          startHour += Math.floor(
            startMinute / 60
          );

          startMinute =
            startMinute % 60;
        }

        continue;
      }

      slots.push(
        formatTime(
          `${String(
            startHour
          ).padStart(
            2,
            "0"
          )}:${String(
            startMinute
          ).padStart(
            2,
            "0"
          )}`
        )
      );

      startMinute += 60;

      if (startMinute >= 60) {
        startHour += Math.floor(
          startMinute / 60
        );

        startMinute =
          startMinute % 60;
      }
    }

    return slots;
  };

  // ======================================================
  // SAVE
  // ======================================================

  const handleSave = async (event) => {
    event.preventDefault();

    setSaved(false);
    setError("");

    const validationError =
      validateSchedule();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem(
        "docniva-doctor-token"
      );

      if (!token) {
        setError("Doctor login required.");
        return;
      }

      const availableDays =
        days.filter(
          (day) =>
            schedule[day].enabled
        );

      const timeSlots =
        generateTimeSlots();

      if (timeSlots.length === 0) {
        setError(
          "Unable to generate time slots. Please check your timings."
        );
        return;
      }

      const consultationTypes = [
        "Clinic Visit",
        "Online",
      ];

      const response = await fetch(
        `${API_URL}/api/doctors/schedule`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            availableDays,
            timeSlots,
            consultationTypes,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "UPDATE DOCTOR SCHEDULE:",
        data
      );

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to save schedule."
        );
        return;
      }

      setSaved(true);

      // Backend se returned schedule ko console mein
      // clearly verify kar sakte hain.
      console.log(
        "SAVED SCHEDULE:",
        data.schedule
      );
    } catch (error) {
      console.error(
        "Save doctor schedule error:",
        error
      );

      setError(
        "Unable to connect to the backend."
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // RESET
  // ======================================================

  const handleReset = () => {
    const confirmed =
      window.confirm(
        "Reset your schedule to the default timings?"
      );

    if (!confirmed) {
      return;
    }

    setSchedule(
      createDefaultSchedule()
    );

    setSaved(false);
    setError("");
  };

  // ======================================================
  // LOADING
  // ======================================================

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

  // ======================================================
  // UI
  // ======================================================

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">

        <button
          type="button"
          onClick={() =>
            navigate("/doctor/dashboard")
          }
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Dashboard
        </button>

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

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSave}>

            <div className="space-y-4">

              {days.map((day) => {
                const daySchedule =
                  schedule[day];

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
                          checked={
                            daySchedule.enabled
                          }
                          onChange={() =>
                            handleDayToggle(day)
                          }
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

                      {daySchedule.enabled && (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                              Start Time
                            </label>

                            <input
                              type="time"
                              value={
                                daySchedule.start
                              }
                              onChange={(event) =>
                                handleChange(
                                  day,
                                  "start",
                                  event.target.value
                                )
                              }
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                              End Time
                            </label>

                            <input
                              type="time"
                              value={
                                daySchedule.end
                              }
                              onChange={(event) =>
                                handleChange(
                                  day,
                                  "end",
                                  event.target.value
                                )
                              }
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                              Break Start
                            </label>

                            <input
                              type="time"
                              value={
                                daySchedule.breakStart
                              }
                              onChange={(event) =>
                                handleChange(
                                  day,
                                  "breakStart",
                                  event.target.value
                                )
                              }
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]">
                              Break End
                            </label>

                            <input
                              type="time"
                              value={
                                daySchedule.breakEnd
                              }
                              onChange={(event) =>
                                handleChange(
                                  day,
                                  "breakEnd",
                                  event.target.value
                                )
                              }
                              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
                            />
                          </div>

                        </div>
                      )}

                    </div>
                  </div>
                );
              })}

            </div>

            <div className="mt-6 rounded-xl bg-[var(--primary-light)] p-4">
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Your schedule will be saved in the backend database and used for patient appointment booking.
              </p>
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
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
                onClick={() =>
                  navigate("/doctor/dashboard")
                }
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

              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Schedule"}
              </Button>

            </div>

          </form>
        </Card>
      </div>
    </main>
  );
}

export default DoctorSchedule;

