import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { api } from "../../lib/api";

const getToken = () => localStorage.getItem("docniva-token");

const badgeFor = (status) => {
  if (status === "confirmed") return "confirmed";
  if (status === "rejected" || status === "cancelled") return "danger";
  return "pending";
};

const labelFor = (status) =>
  ({
    confirmed: "Confirmed",
    rejected: "Rejected",
    cancelled: "Cancelled",
    completed: "Completed",
  })[status] || "Pending";

const needsPayment = (a) =>
  a.status === "pending" && ["pending", "failed"].includes(a.paymentStatus);

const messageFor = (a) => {
  if (needsPayment(a)) {
    return "Complete the payment to hold this slot. Unpaid slots are released automatically.";
  }
  if (a.status === "pending") {
    return "Payment received. Your request is waiting for the doctor's confirmation.";
  }
  if (a.status === "confirmed") return "Your appointment has been accepted by the doctor.";
  if (a.status === "rejected") {
    return "Your appointment request was rejected by the doctor. Any payment will be refunded.";
  }
  if (a.status === "cancelled") return "This appointment has been cancelled.";
  return "";
};

function PatientDashboard() {
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);

  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(
    async (signal) => {
      const res = await api("/api/patients/dashboard", {
        token: getToken(),
        signal,
      });
      if (res.aborted) return;

      if (res.status === 401) {
        localStorage.removeItem("docniva-token");
        localStorage.removeItem("docniva-current-patient");
        navigate("/patient/login");
        return;
      }

      if (!res.ok) {
        setError(res.data.message || "Unable to load your dashboard.");
      } else {
        setPatient(res.data.patient);
        setStats(res.data.statistics);
        setUpcoming(res.data.upcomingAppointments || []);
        localStorage.setItem(
          "docniva-current-patient",
          JSON.stringify(res.data.patient)
        );
      }
      setLoading(false);
    },
    [navigate]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const appointment = upcoming[0] || null;

  const handleCancel = async () => {
    if (!appointment?._id || cancelling) return;

    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setCancelling(true);
    setError("");
    setNotice("");

    const res = await api(`/api/appointments/${appointment._id}/cancel`, {
      method: "PATCH",
      token: getToken(),
    });

    setCancelling(false);

    if (!res.ok) {
      setError(res.data.message || "Failed to cancel appointment.");
      return;
    }

    setNotice(res.data.message || "Appointment cancelled successfully.");
    load();
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Card className="p-6">
            <p className="text-sm text-[var(--text-secondary)]">
              Loading your dashboard...
            </p>
          </Card>
        </div>
      </main>
    );
  }

  const statCards = [
    ["Upcoming", stats?.upcomingAppointments ?? 0],
    ["Confirmed", stats?.confirmedAppointments ?? 0],
    ["Pending", stats?.pendingAppointments ?? 0],
    ["Cancelled", stats?.cancelledAppointments ?? 0],
  ];

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* WELCOME */}
        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">Patient Dashboard</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Welcome back{patient?.name ? `, ${patient.name}` : ""} 👋
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Manage your appointments and healthcare journey.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700"
          >
            {notice}
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map(([label, value]) => (
            <Card key={label} className="p-5">
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
                {value}
              </p>
            </Card>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-light)] text-xl">
              🔎
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
              Find a Doctor
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Search doctors by specialty and location.
            </p>
            <Button className="mt-5 w-full" onClick={() => navigate("/patient/find-doctor")}>
              Find Doctor
            </Button>
          </Card>

          <Card className="p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-light)] text-xl">
              📅
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
              My Appointments
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              View all your appointments and their status.
            </p>
            <Button variant="outline" className="mt-5 w-full" onClick={() => navigate("/patient/appointments")}>
              View Appointments
            </Button>
          </Card>

          <Card className="p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-light)] text-xl">
              👤
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
              My Profile
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              View and manage your personal information.
            </p>
            <Button variant="outline" className="mt-5 w-full" onClick={() => navigate("/patient/profile")}>
              View Profile
            </Button>
          </Card>
        </div>

        {/* NEXT APPOINTMENT */}
        <div className="mt-8">
          <Card className="p-6">
            {appointment ? (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                      Next Appointment
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                      {appointment.doctor?.name || "Doctor"}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--primary)]">
                      {appointment.doctor?.specialization || "Specialist"}
                    </p>
                  </div>

                  <Badge status={badgeFor(appointment.status)}>
                    {labelFor(appointment.status)}
                  </Badge>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Date</p>
                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                      {appointment.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Time</p>
                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                      {appointment.timeLabel || appointment.selectedTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">Consultation</p>
                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                      {appointment.consultationType || "Clinic Visit"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-[var(--soft-background)] p-4">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {messageFor(appointment)}
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {needsPayment(appointment) && (
                    <Button
                      onClick={() =>
                        navigate("/patient/appointment-confirmed", {
                          state: appointment,
                        })
                      }
                    >
                      Pay Now
                    </Button>
                  )}

                  <Button
                    variant={needsPayment(appointment) ? "outline" : undefined}
                    onClick={() => navigate("/patient/appointments")}
                  >
                    View Appointments
                  </Button>

                  <Button variant="outline" onClick={() => navigate("/patient/find-doctor")}>
                    Find Another Doctor
                  </Button>

                  {["pending", "confirmed"].includes(appointment.status) && (
                    <Button variant="outline" onClick={handleCancel} disabled={cancelling}>
                      {cancelling ? "Cancelling..." : "Cancel Appointment"}
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                      Next Appointment
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                      No upcoming appointments
                    </h2>
                  </div>
                  <Badge status="info">No Booking</Badge>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                  You don't have an upcoming appointment. Find a doctor and book
                  whenever you're ready.
                </p>

                <Button className="mt-5" onClick={() => navigate("/patient/find-doctor")}>
                  Book an Appointment
                </Button>
              </>
            )}
          </Card>
        </div>

        {/* UPCOMING LIST */}
        {upcoming.length > 1 && (
          <div className="mt-8">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Also Coming Up
              </h2>

              <div className="mt-5 space-y-3">
                {upcoming.slice(1).map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col gap-2 rounded-xl bg-[var(--soft-background)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {item.doctor?.name || "Doctor"}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {item.date} at {item.timeLabel || item.selectedTime}
                      </p>
                    </div>
                    <Badge status={badgeFor(item.status)}>{labelFor(item.status)}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

export default PatientDashboard;