import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

const API_URL = "http://localhost:5000/api";

function PatientAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  // ======================================================
  // GET PATIENT TOKEN
  // ======================================================

  const getToken = () => {
    return localStorage.getItem("docniva-token");
  };

  // ======================================================
  // LOAD APPOINTMENTS FROM BACKEND
  // ======================================================

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login as a patient.");
        return;
      }

      const response = await fetch(
        `${API_URL}/appointments`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "PATIENT APPOINTMENTS:",
        data
      );

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to load appointments."
        );
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
        "Load patient appointments error:",
        error
      );

      setError(
        "Unable to connect to backend."
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // CANCEL APPOINTMENT
  // ======================================================

  const cancelAppointment = async (
    appointmentId
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(appointmentId);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login as a patient.");
        return;
      }

      const response = await fetch(
        `${API_URL}/appointments/${appointmentId}/cancel`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "CANCEL APPOINTMENT:",
        data
      );

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to cancel appointment."
        );
        return;
      }

      if (data.success) {
        setAppointments((prev) =>
          prev.map((appointment) =>
            appointment._id === appointmentId
              ? data.appointment || {
                  ...appointment,
                  status: "cancelled",
                }
              : appointment
          )
        );
      }

    } catch (error) {
      console.error(
        "Cancel appointment error:",
        error
      );

      setError(
        "Unable to connect to backend."
      );

    } finally {
      setCancellingId(null);
    }
  };

  // ======================================================
  // BADGE
  // ======================================================

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

  // ======================================================
  // STATUS TEXT
  // ======================================================

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

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Card className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">
              Loading appointments...
            </p>
          </Card>
        </div>
      </main>
    );
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
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

          <Button
            variant="outline"
            onClick={loadAppointments}
          >
            Refresh
          </Button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* NO APPOINTMENTS */}

        {appointments.length === 0 ? (
          <Card className="p-8 text-center">

            <div className="text-4xl">
              📅
            </div>

            <h2 className="mt-4 text-xl font-bold text-[var(--text-primary)]">
              No appointments yet
            </h2>

            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              You haven't booked any appointment yet.
            </p>

            <Button
              className="mt-6"
              onClick={() =>
                navigate("/patient/find-doctor")
              }
            >
              Find a Doctor
            </Button>

          </Card>
        ) : (

          /* APPOINTMENTS */

          <div className="space-y-5">

            {appointments.map(
              (appointment) => {

                const isCancelling =
                  cancellingId ===
                  appointment._id;

                return (
                  <Card
                    key={appointment._id}
                    className="p-6 sm:p-8"
                  >

                    {/* HEADER */}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                          Appointment
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                          {appointment.doctor?.name ||
                            "Doctor"}
                        </h2>

                        <p className="mt-1 text-sm text-[var(--primary)]">
                          {appointment.doctor?.specialization ||
                            "Specialist"}
                        </p>
                      </div>

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

                    {/* DETAILS */}

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
                          {appointment.consultationType ||
                            "Clinic Visit"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[var(--text-muted)]">
                          Fee
                        </p>

                        <p className="mt-1 font-bold text-[var(--text-primary)]">
                          {appointment.doctor?.consultationFee
                            ? `₹${appointment.doctor.consultationFee}`
                            : "Not specified"}
                        </p>
                      </div>

                    </div>

                    {/* REASON */}

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

                    {/* STATUS MESSAGE */}

                    <div className="mt-6 rounded-xl bg-[var(--soft-background)] p-4">

                      {appointment.status ===
                        "pending" && (
                        <p className="text-sm text-[var(--text-secondary)]">
                          Your appointment request is
                          waiting for the doctor's
                          confirmation.
                        </p>
                      )}

                      {appointment.status ===
                        "confirmed" && (
                        <p className="text-sm text-green-600">
                          Your appointment has been
                          accepted by the doctor.
                        </p>
                      )}

                      {appointment.status ===
                        "rejected" && (
                        <p className="text-sm text-red-600">
                          Your appointment request was
                          rejected by the doctor.
                        </p>
                      )}

                      {appointment.status ===
                        "cancelled" && (
                        <p className="text-sm text-red-600">
                          This appointment has been
                          cancelled.
                        </p>
                      )}

                    </div>

                    {/* ACTIONS */}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                      <Button
                        onClick={() =>
                          navigate(
                            "/patient/find-doctor"
                          )
                        }
                      >
                        Find Another Doctor
                      </Button>

                      {appointment.status ===
                        "pending" && (
                        <Button
                          variant="outline"
                          disabled={
                            isCancelling
                          }
                          onClick={() =>
                            cancelAppointment(
                              appointment._id
                            )
                          }
                        >
                          {isCancelling
                            ? "Cancelling..."
                            : "Cancel Appointment"}
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(
                            "/patient/dashboard"
                          )
                        }
                      >
                        Back to Dashboard
                      </Button>

                    </div>

                  </Card>
                );
              }
            )}

          </div>
        )}

      </div>
    </main>
  );
}

export default PatientAppointments;