import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

const API_URL = "http://localhost:5000/api";

function DoctorAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] =
    useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem(
        "docniva-doctor-token"
      );

      if (!token) {
        setError(
          "Doctor login required. Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/doctors/appointments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "GET DOCTOR APPOINTMENTS:",
        data
      );

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to load appointments."
        );
        setAppointments([]);
        return;
      }

      if (
        data.success &&
        Array.isArray(data.appointments)
      ) {
        setAppointments(data.appointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error(
        "Load doctor appointments error:",
        error
      );

      setError(
        "Unable to connect to backend."
      );

      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (
    appointmentId,
    status
  ) => {
    try {
      setUpdatingId(appointmentId);
      setError("");

      const token = localStorage.getItem(
        "docniva-doctor-token"
      );

      if (!token) {
        setError(
          "Doctor login required. Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/doctors/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "UPDATE APPOINTMENT STATUS:",
        data
      );

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to update appointment."
        );
        return;
      }

      if (data.success) {
        setAppointments((prev) =>
          prev.map((appointment) =>
            appointment._id === appointmentId
              ? data.appointment ||
                {
                  ...appointment,
                  status,
                }
              : appointment
          )
        );
      }
    } catch (error) {
      console.error(
        "Update appointment status error:",
        error
      );

      setError(
        "Unable to update appointment."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getBadgeStatus = (status) => {
    if (status === "confirmed") {
      return "confirmed";
    }

    if (
      status === "rejected" ||
      status === "cancelled"
    ) {
      return "danger";
    }

    return "pending";
  };

  const getStatusText = (status) => {
    if (status === "confirmed") {
      return "Confirmed";
    }

    if (status === "rejected") {
      return "Rejected";
    }

    if (status === "cancelled") {
      return "Cancelled";
    }

    return "Pending";
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Card className="p-8 text-center">

            <div className="text-3xl">
              ⏳
            </div>

            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              Loading appointments...
            </p>

          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-6xl">

        <button
          type="button"
          onClick={() =>
            navigate("/doctor/dashboard")
          }
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="font-semibold text-[var(--primary)]">
              Doctor Appointments
            </p>

            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Appointment Requests
            </h1>

            <p className="mt-2 text-[var(--text-secondary)]">
              View and manage appointments booked by patients.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={loadAppointments}
          >
            Refresh
          </Button>

        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {appointments.length === 0 ? (
          <Card className="p-10 text-center">

            <div className="text-4xl">
              📋
            </div>

            <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
              No appointments
            </h2>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Patient appointment requests will appear here.
            </p>

          </Card>
        ) : (
          <div className="space-y-5">

            {appointments.map((appointment) => {

              const isUpdating =
                updatingId === appointment._id;

              return (
                <Card
                  key={appointment._id}
                  className="p-6"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    <div>

                      <div className="flex flex-wrap items-center gap-3">

                        <h2 className="text-xl font-bold text-[var(--text-primary)]">
                          {appointment.patient?.name ||
                            "Patient"}
                        </h2>

                        <Badge
                          status={getBadgeStatus(
                            appointment.status
                          )}
                        >
                          {getStatusText(
                            appointment.status
                          )}
                        </Badge>

                      </div>

                      <div className="mt-3 space-y-1">

                        <p className="text-sm text-[var(--text-secondary)]">
                          📧{" "}
                          {appointment.patient?.email ||
                            "Email not available"}
                        </p>

                        {appointment.patient?.phone && (
                          <p className="text-sm text-[var(--text-secondary)]">
                            📞{" "}
                            {appointment.patient.phone}
                          </p>
                        )}

                      </div>

                    </div>

                    <div className="rounded-xl bg-[var(--primary-light)] px-5 py-4 lg:min-w-[220px]">

                      <p className="text-xs text-[var(--text-muted)]">
                        Appointment
                      </p>

                      <p className="mt-1 font-semibold text-[var(--text-primary)]">
                        {appointment.date}
                      </p>

                      <p className="mt-1 font-semibold text-[var(--primary)]">
                        {appointment.timeLabel || appointment.selectedTime}
                      </p>

                    </div>

                  </div>

                  <div className="mt-6 grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-3">

                    <div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Consultation
                      </p>

                      <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                        {appointment.consultationType ||
                          "Clinic Visit"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                        {appointment.date}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[var(--text-muted)]">
                        Status
                      </p>

                      <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                        {getStatusText(
                          appointment.status
                        )}
                      </p>
                    </div>

                  </div>

                  {appointment.reason && (
                    <div className="mt-5 border-t border-[var(--border)] pt-5">

                      <p className="text-xs text-[var(--text-muted)]">
                        Reason
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
                        {appointment.reason}
                      </p>

                    </div>
                  )}

                  {appointment.status ===
                    "pending" && (
                    <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">

                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUpdating}
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "rejected"
                          )
                        }
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Reject"}
                      </Button>

                      <Button
                        type="button"
                        disabled={isUpdating}
                        onClick={() =>
                          updateStatus(
                            appointment._id,
                            "confirmed"
                          )
                        }
                      >
                        {isUpdating
                          ? "Updating..."
                          : "Confirm"}
                      </Button>

                    </div>
                  )}

                </Card>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}

export default DoctorAppointments;