
import { useState } from "react";
import { Link } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

function DoctorForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Backend password reset API will be connected here later.
    setSubmitted(true);
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
              Forgot Password
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Enter your registered email address to reset your password.
            </p>
          </div>

          {!submitted ? (
            <form
              className="mt-8 space-y-5"
              onSubmit={handleSubmit}
            >
              <Input
                label="Email Address"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
              >
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="mt-8 rounded-xl bg-[var(--primary-light)] p-4">
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                If an account exists with this email address, password reset
                instructions will be sent there.
              </p>
            </div>
          )}

          {/* Back to Login */}
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Remember your password?{" "}

            <Link
              to="/doctor/login"
              className="font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
            >
              Back to Login
            </Link>
          </p>

        </Card>
      </div>
    </main>
  );
}

export default DoctorForgotPassword;

