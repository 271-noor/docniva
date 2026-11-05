// Poore project ka date/time IST (Asia/Kolkata) mein.
// Server kisi bhi timezone par ho, ye sahi chalega.

const IST_OFFSET_MINUTES = 330;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

// getUTCDay() ke order mein (Sunday = 0)
export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const isValidDateString = (value) => {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
};

// 24-hour "HH:mm" (jaise "09:30", "14:00")
export const isValidTimeString = (value) =>
  typeof value === "string" && TIME_RE.test(value);

const istParts = (instant = new Date()) => {
  const shifted = new Date(instant.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
  const iso = shifted.toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
};

// Abhi IST mein kaun si date hai: "YYYY-MM-DD"
export const todayIST = () => istParts().date;

// Abhi IST mein time: "HH:mm"
export const nowTimeIST = () => istParts().time;

// "2026-11-02" -> "Monday"
export const getWeekdayName = (dateString) => {
  if (!isValidDateString(dateString)) return null;
  return WEEKDAYS[new Date(`${dateString}T00:00:00.000Z`).getUTCDay()];
};

// "2026-11-02" + 3 -> "2026-11-05"
export const addDaysToDateString = (dateString, days) => {
  const d = new Date(`${dateString}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

// Slot ka asli start time (Date object), IST maan kar
export const slotStartDate = (dateString, timeString) =>
  new Date(`${dateString}T${timeString}:00+05:30`);

// Display ke liye: "14:30" -> "02:30 PM"
export const formatTime12h = (timeString) => {
  const [h, m] = timeString.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
};