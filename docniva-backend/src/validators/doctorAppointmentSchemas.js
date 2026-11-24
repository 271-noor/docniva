import { z } from "zod";
import { objectId } from "../middleware/validate.js";

export const appointmentIdParams = z.object({ appointmentId: objectId });

export const doctorAppointmentsQuery = z.object({
  status: z
    .enum(["pending", "confirmed", "rejected", "cancelled", "completed", "no-show"])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const updateStatusSchema = z.object({
  status: z.enum(["confirmed", "rejected"], {
    error: "Status must be confirmed or rejected",
  }),
  rejectReason: z.string().trim().max(300, "Reason is too long").optional(),
  meetingLink: z
    .union([
      z
        .string()
        .trim()
        .max(500, "Link is too long")
        .refine((v) => v.startsWith("https://"), "Meeting link must start with https://"),
      z.literal(""),
    ])
    .optional(),
});