
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

function PatientRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const {
      name,
      email,
      mobile,
      password,
      confirmPassword,
    } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const existingPatient = localStorage.getItem(
      "docniva-patient"
    );

    if (existingPatient) {
      try {
        const parsedPatient = JSON.parse(existingPatient);

        if (
          parsedPatient.email?.toLowerCase() ===
          email.toLowerCase()
        ) {
          setError(
            "An account with this email already exists."
          );
          return;
        }
      } catch (error) {
        console.error("Invalid patient data:", error);
      }
    }

    const patient = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      password,
    };

    localStorage.setItem(
      "docniva-patient",
      JSON.stringify(patient)
    );

    // Automatically log the patient in after registration.
    localStorage.setItem(
      "docniva-current-patient",
      JSON.stringify(patient)
    );

    navigate("/patient/dashboard");
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto flex w-full max-w-md items-center justify-center">

        <Card className="w-full p-6 sm:p-8">

          {/* Header */}
          <div className="text-center">
            <span className="inline-block font-semibold text-[var(--primary)]">
              DocNiva
            </span>

            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Create Patient Account
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Create your account to manage your healthcare.
            </p>
          </div>

          {/* Registration Form */}
          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit}
          >
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Mobile Number"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              minLength={6}
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              minLength={6}
            />

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}

            <Link
              to="/patient/login"
              className="font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
            >
              Login
            </Link>
          </p>

        </Card>

      </div>
    </main>
  );
}

export default PatientRegister;

