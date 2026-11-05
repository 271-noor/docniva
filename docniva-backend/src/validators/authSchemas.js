import { z } from "zod";

const str = (label) => z.string({ error: `${label} is required` });

export const GENDERS = ["Male", "Female", "Other"];

const email = str("Email")
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address").max(254));

// "+91 98765 43210" bhi chalega
export const phone = str("Phone")
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^\+?\d{10,15}$/, "Enter a valid phone number"));

const newPassword = str("Password")
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/\d/, "Password must contain a number");

export const name = str("Name")
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name is too long");

export const gender = z.enum(GENDERS, { error: "Select a valid gender" });

export const city = str("City")
  .trim()
  .min(2, "City is too short")
  .max(80, "City is too long");

export const ageBetween = (min, max) =>
  z
    .number({ error: "Age must be a number" })
    .int("Age must be a whole number")
    .min(min, `Age must be at least ${min}`)
    .max(max, `Age must be at most ${max}`);

const token = str("Token").regex(/^[a-f0-9]{64}$/, "Invalid or expired link");

export const loginSchema = z.object({
  email,
  password: str("Password").min(1, "Password is required").max(128),
  rememberMe: z.boolean().optional(),
});

export const patientRegisterSchema = z.object({
  name,
  email,
  phone,
  password: newPassword,
  age: ageBetween(0, 120).optional(),
  gender: gender.optional(),
  city: city.optional(),
});

export const doctorRegisterSchema = z.object({
  name,
  email,
  phone,
  registrationNumber: str("Registration number")
    .trim()
    .min(3, "Registration number is too short")
    .max(50, "Registration number is too long"),
  qualification: str("Qualification")
    .trim()
    .min(2, "Qualification is too short")
    .max(150, "Qualification is too long"),
  specialization: str("Specialization")
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
  password: newPassword,
});

export const emailOnlySchema = z.object({ email });

export const tokenSchema = z.object({ token });

export const resetPasswordSchema = z.object({
  token,
  password: newPassword,
});