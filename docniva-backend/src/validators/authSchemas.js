import { z } from "zod";

const str = (label) => z.string({ error: `${label} is required` });

const email = str("Email")
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address").max(254));

// Spaces aur dashes hata kar check hota hai: "+91 98765 43210" bhi chalega
const phone = str("Phone")
  .trim()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^\+?\d{10,15}$/, "Enter a valid phone number"));

// Naye password ki policy. Login par ye lagu nahi, purane users ke liye.
const newPassword = str("Password")
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/\d/, "Password must contain a number");

const name = str("Name")
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name is too long");

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
  password: newPassword,
});

export const emailOnlySchema = z.object({ email });

export const tokenSchema = z.object({ token });

export const resetPasswordSchema = z.object({
  token,
  password: newPassword,
});