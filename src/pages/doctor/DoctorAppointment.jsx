 
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

function DoctorAppointments() {
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

  const updateStatus = (status) => {
    if (!appointment) return;

    const updatedAppointment = {
      ...appointment,
      status,
    };

    localStorage.setItem(
      "docniva-appointment",
      JSON.stringify(updatedAppointment)
    );

    setAppointment(updatedAppointment);
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
      <div className="mx-auto max-w-6xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/doctor/dashboard")}
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">
            Doctor Appointments
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Appointments
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            View and manage patient appointments.
          </p>
        </div>

        {/* No Appointment */}
        {!appointment ? (
          <Card className="p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-light)] text-2xl">
              📅
            </div>

            <h2 className="mt-5 text-xl font-bold text-[var(--text-primary)]">
              No appointments yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
              Patient appointments will appear here once a patient books an
              appointment with you.
            </p>

            <Button
              className="mt-6"
              onClick={() => navigate("/doctor/dashboard")}
            >
              Back to Dashboard
            </Button>
          </Card>
        ) : (
          <Card className="overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col gap-4 border-b border-[var(--border)] p-6 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  Patient Appointment
                </p>

                <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                  {appointment.patient?.name || "Patient"}
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {appointment.patient?.email || "Patient details"}
                </p>
              </div>

              <Badge status={getBadgeStatus(appointment.status)}>
                {getStatusText(appointment.status)}
              </Badge>

            </div>

            {/* Appointment Details */}
            <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">

              {/* Patient */}
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  Patient
                </p>

                <p className="mt-2 font-semibold text-[var(--text-primary)]">
                  {appointment.patient?.name || "Patient"}
                </p>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {appointment.patient?.email || "Email not available"}
                </p>
              </div>

              {/* Doctor */}
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  Doctor
                </p>

                <p className="mt-2 font-semibold text-[var(--text-primary)]">
                  {appointment.doctor?.name || "Doctor"}
                </p>

                <p className="mt-1 text-sm text-[var(--primary)]">
                  {appointment.doctor?.specialization || "Specialist"}
                </p>
              </div>

              {/* Date */}
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  Appointment Date
                </p>

                <p className="mt-2 font-semibold text-[var(--text-primary)]">
                  {appointment.date || "Not available"}
                </p>
              </div>

              {/* Time */}
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  Appointment Time
                </p>

                <p className="mt-2 font-semibold text-[var(--text-primary)]">
                  {appointment.selectedTime || "Not available"}
                </p>
              </div>

              {/* Consultation */}
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  Consultation Type
                </p>

                <p className="mt-2 font-semibold text-[var(--text-primary)]">
                  {appointment.consultationType || "Clinic Visit"}
                </p>
              </div>

              {/* Fee */}
              <div>
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  Consultation Fee
                </p>

                <p className="mt-2 font-semibold text-[var(--text-primary)]">
                  {appointment.doctor?.fee || "Not available"}
                </p>
              </div>

            </div>

            {/* Reason */}
            {appointment.reason && (
              <div className="border-t border-[var(--border)] p-6">
                <p className="text-xs font-medium text-[var(--text-muted)]">
                  Reason for Visit
                </p>

                <p className="mt-2 rounded-xl bg-[var(--soft-background)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
                  {appointment.reason}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 border-t border-[var(--border)] p-6 sm:flex-row sm:justify-end">

              <Button
                variant="outline"
                onClick={() => navigate("/doctor/dashboard")}
              >
                Dashboard
              </Button>

              {appointment.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus("rejected")}
                  >
                    Reject
                  </Button>

                  <Button
                    onClick={() => updateStatus("confirmed")}
                  >
                    Accept Appointment
                  </Button>
                </>
              )}

              {appointment.status === "confirmed" && (
                <Button
                  variant="outline"
                  onClick={() => updateStatus("rejected")}
                >
                  Reject Appointment
                </Button>
              )}

              {appointment.status === "rejected" && (
                <Button
                  onClick={() => updateStatus("confirmed")}
                >
                  Accept Appointment
                </Button>
              )}

            </div>

          </Card>
        )}

      </div>
    </main>
  );
}

export default DoctorAppointments;
 
