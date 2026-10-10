
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
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

 const handleSubmit = async (event) => {
  event.preventDefault();

  const {
    name,
    email,
    mobile,
    password,
    confirmPassword,
  } = formData;

  // Password match check
  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  // Loading start
  setLoading(true);
  setError("");

  try {
    // Backend ko registration request bhej rahe hain
    const response = await fetch(
      "http://localhost:5000/api/patients/register",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        // Frontend ke mobile ko backend ke phone field me bhej rahe hain
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: mobile.trim(),
          password,
        }),
      }
    );

    // Backend response
    const data = await response.json();

    // Agar backend error bheje
    if (!response.ok) {
      setError(
        data.message || "Registration failed. Please try again."
      );
      return;
    }

    // Registration successful
    console.log("Patient registered:", data);

    // Login page par redirect
    navigate("/patient/login");

  } catch (error) {
    // Backend connect na ho paye
    console.error("Registration error:", error);

    setError(
      "Unable to connect to the server. Please make sure the backend is running."
    );
  } finally {
    // Loading stop
    setLoading(false);
  }
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
               disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
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

