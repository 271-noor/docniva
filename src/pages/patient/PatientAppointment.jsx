
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

function PatientAppointments() {
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    loadAppointment();
  }, []);

  const loadAppointment = () => {
    const savedAppointment = localStorage.getItem(
      "docniva-appointment"
    );

    if (savedAppointment) {
      try {
        setAppointment(JSON.parse(savedAppointment));
      } catch (error) {
        console.error("Invalid appointment data:", error);
        setAppointment(null);
      }
    }
  };

  const getBadgeStatus = (status) => {
    if (status === "confirmed") return "confirmed";
    if (status === "rejected") return "danger";
    return "pending";
  };

  const getStatusText = (status) => {
    if (status === "confirmed") return "Confirmed";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">
            Patient Dashboard
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            My Appointments
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            View and manage your appointments.
          </p>
        </div>

        {!appointment ? (
          <Card className="p-8 text-center">

            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              No appointments yet
            </h2>

            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              You haven't booked any appointment yet.
            </p>

            <Button
              className="mt-6"
              onClick={() => navigate("/patient/find-doctor")}
            >
              Find a Doctor
            </Button>

          </Card>
        ) : (
          <Card className="p-6 sm:p-8">

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div>
                <p className="text-sm text-[var(--text-secondary)]">
                  Appointment
                </p>

                <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                  {appointment.doctor?.name || "Doctor"}
                </h2>

                <p className="mt-1 text-sm text-[var(--primary)]">
                  {appointment.doctor?.specialization || "Specialist"}
                </p>
              </div>

              <Badge status={getBadgeStatus(appointment.status)}>
                {getStatusText(appointment.status)}
              </Badge>

            </div>

            {/* Details */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Date
                </p>

                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {appointment.date}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Time
                </p>

                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {appointment.selectedTime}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Consultation
                </p>

                <p className="mt-1 font-medium text-[var(--text-primary)]">
                  {appointment.consultationType}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Fee
                </p>

                <p className="mt-1 font-bold text-[var(--text-primary)]">
                  {appointment.doctor?.fee}
                </p>
              </div>

            </div>

            {/* Reason */}
            {appointment.reason && (
              <div className="mt-6 border-t border-[var(--border)] pt-5">
                <p className="text-xs text-[var(--text-muted)]">
                  Reason for Visit
                </p>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {appointment.reason}
                </p>
              </div>
            )}

            {/* Status message */}
            <div className="mt-6 rounded-xl bg-[var(--soft-background)] p-4">
              {appointment.status === "pending" && (
                <p className="text-sm text-[var(--text-secondary)]">
                  Your appointment request is waiting for the doctor's
                  confirmation.
                </p>
              )}

              {appointment.status === "confirmed" && (
                <p className="text-sm text-[var(--text-secondary)]">
                  Your appointment has been accepted by the doctor.
                </p>
              )}

              {appointment.status === "rejected" && (
                <p className="text-sm text-[var(--text-secondary)]">
                  Your appointment request was rejected by the doctor.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <Button
                onClick={() => navigate("/patient/find-doctor")}
              >
                Find Another Doctor
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/patient/dashboard")}
              >
                Back to Dashboard
              </Button>

            </div>

          </Card>
        )}

      </div>
    </main>
  );
}

export default PatientAppointments;
 
