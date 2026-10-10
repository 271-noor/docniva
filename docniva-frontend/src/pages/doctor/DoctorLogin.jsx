
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

function DoctorLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/doctors/login",
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

      const data = await response.json();

      console.log("DOCTOR LOGIN RESPONSE:", data);

      if (!response.ok) {
        setError(
          data.message || "Invalid email or password."
        );
        return;
      }

      if (!data.doctor) {
        setError(
          "Doctor profile was not received from server."
        );

        console.error(
          "Doctor data missing:",
          data
        );

        return;
      }

      // ========================================
      // SAVE DOCTOR TOKEN
      // ========================================

      localStorage.setItem(
        "docniva-doctor-token",
        data.token
      );

      // ========================================
      // SAVE DOCTOR ID
      // ========================================

      localStorage.setItem(
        "docniva-doctor-id",
        data.doctor.id
      );

      // ========================================
      // SAVE DOCTOR PROFILE
      // ========================================

      localStorage.setItem(
        "docniva-doctor-profile",
        JSON.stringify(data.doctor)
      );

      console.log(
        "DOCTOR ID SAVED:",
        data.doctor.id
      );

      console.log(
        "DOCTOR PROFILE SAVED:",
        data.doctor
      );

      // ========================================
      // GO TO DASHBOARD
      // ========================================

      navigate("/doctor/dashboard");

    } catch (error) {
      console.error(
        "Doctor login error:",
        error
      );

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

          <div className="text-center">

            <span className="inline-block font-semibold text-[var(--primary)]">
              DocNiva
            </span>

            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Doctor Login
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Access your professional account.
            </p>

          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit}
          >

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="doctor@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              required
            />

            <div className="flex items-center justify-between gap-3 text-sm">

              <label className="flex cursor-pointer items-center gap-2 text-[var(--text-secondary)]">

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

              <Link
                to="/doctor/forgot-password"
                className="font-medium text-[var(--primary)] hover:text-[var(--primary-hover)]"
              >
                Forgot password?
              </Link>

            </div>

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
              {loading ? "Logging in..." : "Login"}
            </Button>

          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Don't have an account?{" "}

            <Link
              to="/doctor/register"
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

export default DoctorLogin;

