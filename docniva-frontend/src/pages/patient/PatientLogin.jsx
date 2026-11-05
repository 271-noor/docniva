
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

  // Login request ke time loading state
  const [loading, setLoading] = useState(false);


const handleSubmit = async (event) => {
  event.preventDefault();

  setLoading(true);
  setError("");

  try {
    // Backend ko login request bhej rahe hain
    const response = await fetch(
      "http://localhost:5000/api/patients/login",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      }
    );

    // Backend response
    const data = await response.json();

    // Agar backend error bheje
    if (!response.ok) {
      setError(
        data.message || "Invalid email or password."
      );
      return;
    }

    // Login successful
    console.log("Patient logged in:", data);

    // JWT token save kar rahe hain
    localStorage.setItem(
      "docniva-token",
      data.token
    );

    // Logged-in patient ka data save kar rahe hain
    localStorage.setItem(
      "docniva-current-patient",
      JSON.stringify(data.patient)
    );

    // Remember me preference
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

    // Patient dashboard par redirect
    navigate("/patient/dashboard");

  } catch (error) {
    console.error("Login error:", error);

    setError(
      "Unable to connect to the server. Please make sure the backend is running."
    );
  } finally {
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

              {/* Forgot Password */}
          <div className="flex justify-end">
          <Link
              to="/patient/forgot-password"
              className="text-sm font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
          >
            Forgot Password?
          </Link>
          </div>


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
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
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

