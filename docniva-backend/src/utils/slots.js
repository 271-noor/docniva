import { getWeekdayName } from "./dateTime.js";

export const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const toTimeString = (minutes) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(
    minutes % 60
  ).padStart(2, "0")}`;

// Ek din ke working hours se slots banata hai (break ke slots chhod kar)
export const buildDaySlots = (day, duration) => {
  const start = toMinutes(day.startTime);
  const end = toMinutes(day.endTime);
  const breakStart = day.breakStart ? toMinutes(day.breakStart) : null;
  const breakEnd = day.breakEnd ? toMinutes(day.breakEnd) : null;

  const slots = [];
  for (let t = start; t + duration <= end; t += duration) {
    const overlapsBreak =
      breakStart !== null && breakEnd !== null && t < breakEnd && t + duration > breakStart;
    if (!overlapsBreak) slots.push(toTimeString(t));
  }
  return slots;
};

// Kisi date par doctor ka final schedule: exception weekly se upar rehta hai
export const resolveDay = (schedule, date) => {
  const exceptions = schedule.dateExceptions || [];
  const exception = exceptions.find((e) => e.date === date);

  if (exception && !exception.isAvailable) {
    return { available: false, slots: [], types: [] };
  }

  const weekday = getWeekdayName(date);
  const dayConfig = (schedule.weekly || []).find((d) => d.day === weekday);
  const weeklySlots = dayConfig
    ? buildDaySlots(dayConfig, schedule.slotDurationMinutes)
    : [];

  if (exception && exception.isAvailable) {
    // Khali list = weekly wale use hote hain
    const slots = exception.timeSlots?.length ? exception.timeSlots : weeklySlots;
    const types = exception.consultationTypes?.length
      ? exception.consultationTypes
      : schedule.consultationTypes;
    return { available: slots.length > 0, slots: [...slots].sort(), types };
  }

  return {
    available: weeklySlots.length > 0,
    slots: weeklySlots,
    types: schedule.consultationTypes,
  };
};