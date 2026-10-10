
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

function RoleSelection() {
  const navigate = useNavigate();

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block font-semibold text-[var(--primary)]">
            Welcome to DocNiva
          </span>

          <h1 className="mt-3 text-3xl font-bold leading-tight text-[var(--text-primary)] sm:text-4xl">
            How would you like to continue?
          </h1>

          <p className="mt-4 text-base text-[var(--text-secondary)] sm:text-lg">
            Choose your role to continue.
          </p>
        </div>

        {/* Role Cards */}
        <div className="mt-10 grid gap-6 md:mt-12 md:grid-cols-2">

          {/* Patient */}
          <Card className="p-6 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-2xl">
              👤
            </div>

            <h2 className="mt-6 text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              I'm a Patient
            </h2>

            <p className="mt-3 leading-7 text-[var(--text-secondary)]">
              Find doctors, book appointments and manage
              your healthcare journey.
            </p>

            <Button
              className="mt-8 w-full"
              size="lg"
              onClick={() => navigate("/patient/login")}
            >
              Continue as Patient
            </Button>
          </Card>

          {/* Doctor */}
          <Card className="p-6 sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-2xl">
              👨‍⚕️
            </div>

            <h2 className="mt-6 text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              I'm a Doctor
            </h2>

            <p className="mt-3 leading-7 text-[var(--text-secondary)]">
              Manage your schedule, appointments and
              patient consultations.
            </p>

            <Button
              className="mt-8 w-full"
              size="lg"
              onClick={() => navigate("/doctor/login")}
            >
              Continue as Doctor
            </Button>
          </Card>

        </div>
      </div>
    </main>
  );
}

export default RoleSelection;

