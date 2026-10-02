
import { Link } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

function DoctorRegister() {
  const handleSubmit = (event) => {
    event.preventDefault();

    // Backend registration will be connected here later.
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto flex w-full max-w-lg items-center justify-center">

        <Card className="w-full p-6 sm:p-8">

          {/* Header */}
          <div className="text-center">
            <span className="inline-block font-semibold text-[var(--primary)]">
              DocNiva
            </span>

            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Doctor Registration
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Create your professional DocNiva account.
            </p>
          </div>

          {/* Registration Form */}
          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit}
          >
            <Input
              label="Full Name"
              placeholder="Dr. Your Name"
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="doctor@example.com"
              required
            />

            <Input
              label="Mobile Number"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              required
            />

            <Input
              label="Medical Registration Number"
              placeholder="Registration number"
              required
            />

            <Input
              label="Qualification"
              placeholder="MBBS, MD, etc."
              required
            />

            <Input
              label="Specialization"
              placeholder="e.g. Cardiologist"
              required
            />

            <Input
              label="Experience"
              type="number"
              placeholder="Years of experience"
              min="0"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              Submit Registration
            </Button>
          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already registered?{" "}

            <Link
              to="/doctor/login"
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

export default DoctorRegister;

