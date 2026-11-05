import { z } from "zod";
import { isValidDateString, todayIST } from "../utils/dateTime.js";
import { buildDaySlots, toMinutes } from "../utils/slots.js";

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export const TYPES = ["Clinic Visit", "Online"];
export const SLOT_DURATIONS = [15, 20, 30, 45, 60];

const hhmm = z
  .string({ error: "Time is required" })
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format");

const optionalTime = z
  .union([hhmm, z.literal("")])
  .optional()
  .transform((value) => value || undefined);

const isUnique = (arr) => new Set(arr).size === arr.length;

const dayEntry = z
  .object({
    day: z.enum(DAYS, { error: "Invalid day" }),
    startTime: hhmm,
    endTime: hhmm,
    breakStart: optionalTime,
    breakEnd: optionalTime,
  })
  .superRefine((d, ctx) => {
    const start = toMinutes(d.startTime);
    const end = toMinutes(d.endTime);

    if (start >= end) {
      ctx.addIssue({
        code: "custom",
        message: `${d.day}: End time must be later than start time`,
      });
      return;
    }

    if (Boolean(d.breakStart) !== Boolean(d.breakEnd)) {
      ctx.addIssue({
        code: "custom",
        message: `${d.day}: Please select both break start and break end time`,
      });
      return;
    }

    if (d.breakStart && d.breakEnd) {
      const bs = toMinutes(d.breakStart);
      const be = toMinutes(d.breakEnd);
      if (bs >= be) {
        ctx.addIssue({
          code: "custom",
          message: `${d.day}: Break end must be later than break start`,
        });
      } else if (bs <= start || be >= end) {
        ctx.addIssue({
          code: "custom",
          message: `${d.day}: Break must be inside working hours`,
        });
      }
    }
  });

const types = z
  .array(z.enum(TYPES, { error: "Invalid consultation type" }))
  .refine(isUnique, "Duplicate consultation types");

export const updateScheduleSchema = z
  .object({
    weekly: z
      .array(dayEntry)
      .min(1, "Please select at least one available day")
      .max(7)
      .refine((arr) => isUnique(arr.map((d) => d.day)), "Duplicate days are not allowed"),
    slotDurationMinutes: z
      .number({ error: "Slot duration is required" })
      .refine((v) => SLOT_DURATIONS.includes(v), "Slot duration must be 15, 20, 30, 45 or 60 minutes"),
    consultationTypes: types.min(1, "Select at least one consultation type"),
    maxAdvanceDays: z.number().int().min(1).max(90).optional(),
    minNoticeMinutes: z.number().int().min(0).max(1440).optional(),
  })
  .superRefine((data, ctx) => {
    for (const day of data.weekly) {
      if (buildDaySlots(day, data.slotDurationMinutes).length === 0) {
        ctx.addIssue({
          code: "custom",
          message: `${day.day}: Working hours are too short for the selected slot duration`,
        });
        return;
      }
    }
  });

export const exceptionSchema = z.object({
  date: z
    .string({ error: "Date is required" })
    .refine(isValidDateString, "Date must be a valid YYYY-MM-DD date")
    .refine((d) => d >= todayIST(), "Date cannot be in the past"),
  isAvailable: z.boolean({ error: "isAvailable must be true or false" }),
  timeSlots: z
    .array(hhmm)
    .max(48, "Too many time slots")
    .refine(isUnique, "Duplicate time slots are not allowed")
    .default([]),
  consultationTypes: types.default([]),
  reason: z.string().trim().max(200, "Reason is too long").default(""),
});

export const exceptionDateParams = z.object({
  date: z.string().refine(isValidDateString, "Invalid date"),
});