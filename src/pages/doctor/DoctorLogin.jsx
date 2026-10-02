
import { Link } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

function DoctorLogin() {
  const handleSubmit = (event) => {
    event.preventDefault();

    // Backend authentication will be connected here later.
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
              Doctor Login
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Access your professional account.
            </p>
          </div>

          {/* Login Form */}
          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit}
          >
            <Input
              label="Email Address"
              type="email"
              placeholder="doctor@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              required
            />

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between gap-3 text-sm">

              <label className="flex cursor-pointer items-center gap-2 text-[var(--text-secondary)]">
                <input
                  type="checkbox"
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

