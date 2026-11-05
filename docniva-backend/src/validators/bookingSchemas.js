import { z } from "zod";
import { objectId } from "../middleware/validate.js";
import { isValidDateString } from "../utils/dateTime.js";

const date = z
  .string({ error: "Date is required" })
  .refine(isValidDateString, "Date must be a valid YYYY-MM-DD date");

export const createAppointmentSchema = z.object({
  doctorId: objectId,
  date,
  selectedTime: z
    .string({ error: "Time is required" })
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:mm format"),
  consultationType: z
    .enum(["Clinic Visit", "Online"], { error: "Invalid consultation type" })
    .optional(),
  reason: z.string().trim().max(500, "Reason must be at most 500 characters").default(""),
});

export const appointmentIdParams = z.object({ appointmentId: objectId });

export const doctorIdParams = z.object({ doctorId: objectId });

export const slotsQuery = z.object({ date });

export const doctorListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(50),
  search: z.string().trim().max(80).optional(),
  specialization: z.string().trim().max(80).optional(),
  city: z.string().trim().max(80).optional(),
});