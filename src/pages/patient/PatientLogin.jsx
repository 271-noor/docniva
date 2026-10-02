
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

function PatientLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    const savedPatient = localStorage.getItem(
      "docniva-patient"
    );

    if (!savedPatient) {
      setError(
        "No patient account found. Please register first."
      );
      return;
    }

    try {
      const patient = JSON.parse(savedPatient);

      const emailMatches =
        patient.email?.toLowerCase() ===
        email.trim().toLowerCase();

      const passwordMatches =
        patient.password === password;

      if (!emailMatches || !passwordMatches) {
        setError("Invalid email or password.");
        return;
      }

      /*
        Save currently logged-in patient.

        BookAppointment.jsx will use this data
        to show the real patient name.
      */
      localStorage.setItem(
        "docniva-current-patient",
        JSON.stringify(patient)
      );

      if (rememberMe) {
        localStorage.setItem(
          "docniva-remember-me",
          "true"
        );
      } else {
        localStorage.removeItem(
          "docniva-remember-me"
        );
      }

      navigate("/patient/dashboard");
    } catch (error) {
      console.error("Invalid patient data:", error);

      setError(
        "Something went wrong. Please register again."
      );
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
              Patient Login
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Sign in to manage your healthcare.
            </p>
          </div>

          {/* Login Form */}
          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit}
          >
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
            />

            {/* Remember */}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                className="h-4 w-4 accent-[var(--primary)]"
              />

              <span>Remember me</span>
            </label>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              Login
            </Button>
          </form>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Don't have an account?{" "}

            <Link
              to="/patient/register"
              className="font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
            >
              Register
            </Link>
          </p>

        </Card>

      </div>
    </main>
  );
}

export default PatientLogin;

