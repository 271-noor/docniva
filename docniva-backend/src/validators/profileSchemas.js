import { z } from "zod";
import { name, phone, gender, city, ageBetween, GENDERS } from "./authSchemas.js";

// Frontend se "" aaye to usse "khali" maana jaye
const blankToNull = (value) => (value === "" ? null : value);

export const updateDoctorProfileSchema = z.object({
  name,
  phone,
  qualification: z
    .string({ error: "Qualification is required" })
    .trim()
    .min(2, "Qualification is too short")
    .max(150, "Qualification is too long"),
  specialization: z
    .string({ error: "Specialization is required" })
    .trim()
    .min(2, "Specialization is too short")
    .max(80, "Specialization is too long"),
  experience: z
    .number({ error: "Experience must be a number" })
    .int("Experience must be a whole number")
    .min(0, "Experience cannot be negative")
    .max(70, "Experience is too high"),
  age: ageBetween(21, 90),
  gender,
  city,
  about: z.string().trim().max(1000, "About must be at most 1000 characters").default(""),
  consultationFee: z
    .number({ error: "Consultation fee must be a number" })
    .int("Consultation fee must be a whole number")
    .min(100, "Consultation fee must be at least ₹100")
    .max(5000, "Consultation fee must be at most ₹5000"),
});

export const updatePatientProfileSchema = z.object({
  name,
  phone,
  age: z.preprocess(blankToNull, ageBetween(0, 120).nullable()).optional(),
  gender: z.preprocess(blankToNull, z.enum(GENDERS, { error: "Select a valid gender" }).nullable()).optional(),
  city: z.preprocess(blankToNull, z.string().trim().min(2, "City is too short").max(80, "City is too long").nullable()).optional(),
});