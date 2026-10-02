
import { useLocation, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

function AppointmentConfirmed() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[var(--soft-background)] px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Appointment not found
          </h1>

          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Please book an appointment first.
          </p>

          <Button
            className="mt-6"
            onClick={() => navigate("/patient/find-doctor")}
          >
            Find a Doctor
          </Button>
        </Card>
      </main>
    );
  }

  const {
    doctor,
    date,
    selectedTime,
    consultationType,
  } = state;

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">

        <Card className="p-6 text-center sm:p-8">

          {/* Success Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-light)] text-3xl">
            ✓
          </div>

          <p className="mt-5 font-semibold text-[var(--primary)]">
            Appointment Confirmed
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Your appointment is booked!
          </h1>

          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Your appointment details are shown below.
          </p>

          {/* Appointment Details */}
          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--soft-background)] p-5 text-left">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Doctor
                </p>

                <h2 className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                  {doctor.name}
                </h2>

                <p className="mt-1 text-sm text-[var(--primary)]">
                  {doctor.specialization}
                </p>
              </div>

              <Badge status="confirmed">
                Confirmed
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Date
                </p>

                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {date}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Time
                </p>

                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {selectedTime}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Consultation
                </p>

                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {consultationType}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Consultation Fee
                </p>

                <p className="mt-1 font-bold text-[var(--text-primary)]">
                  {doctor.fee}
                </p>
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 grid gap-3 sm:grid-cols-2">

            <Button
              onClick={() => navigate("/patient/dashboard")}
              className="w-full"
            >
              Go to Dashboard
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/patient/find-doctor")}
              className="w-full"
            >
              Find Another Doctor
            </Button>

          </div>

        </Card>

      </div>
    </main>
  );
}

export default AppointmentConfirmed;

