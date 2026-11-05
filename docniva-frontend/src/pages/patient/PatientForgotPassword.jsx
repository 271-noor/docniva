
import { useState } from "react";
import { Link } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

function PatientForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/patients/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to send reset email. Please try again."
        );
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password error:", err);

      setError(
        "Unable to connect to the server. Please check that the backend is running."
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
              Forgot Password
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Enter your registered email address to receive password reset instructions.
            </p>
          </div>

          {!submitted ? (
            <form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit}
            >
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                required
              />

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div
              role="status"
              className="mt-8 rounded-xl bg-[var(--primary-light)] p-4 text-center"
            >
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                If an account exists with{" "}
                <span className="font-medium text-[var(--text-primary)]">
                  {email}
                </span>
                , password reset instructions will be sent there.
              </p>

              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Please check your inbox and spam folder.
              </p>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Remember your password?{" "}
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

export default PatientForgotPassword;