import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { api } from "../../lib/api";

const getToken = () => localStorage.getItem("docniva-doctor-token");

// India ki aaj ki date, browser ke timezone se alag
const todayIST = () =>
  new Date(Date.now() + 330 * 60 * 1000).toISOString().slice(0, 10);

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

function DoctorDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    async (signal) => {
      setError("");

      const res = await api("/api/doctors/dashboard", {
        token: getToken(),
        signal,
      });
      if (res.aborted) return;

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("docniva-doctor-token");
        navigate("/doctor/login");
        return;
      }

      if (!res.ok) {
        setError(res.data.message || "Unable to load your dashboard.");
      } else {
        setProfile(res.data.doctor);
        setStats(res.data.statistics);
        setUpcoming(res.data.upcomingAppointments || []);
        localStorage.setItem(
          "docniva-doctor-profile",
          JSON.stringify(res.data.doctor)
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

  const today = todayIST();
  const todayList = upcoming.filter((a) => a.date === today);
  const pendingList = upcoming.filter((a) => a.status === "pending");

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Card className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">
              Loading doctor dashboard...
            </p>
          </Card>
        </div>
      </main>
    );
  }

  const statCards = [
    ["Today's Appointments", stats?.todayAppointments ?? 0, true],
    ["Confirmed", stats?.confirmedAppointments ?? 0, false],
    ["Pending Requests", stats?.pendingAppointments ?? 0, false],
    ["Total Appointments", stats?.totalAppointments ?? 0, false],
  ];

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">Doctor Dashboard</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Welcome back, {profile?.name || "Doctor"} 👋
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            {profile?.specialization || "Specialist"}
            {profile?.city ? ` · ${profile.city}` : ""}
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

        {profile && !profile.city && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--primary-light)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--text-primary)]">
              Add your city so patients can find you in location search.
            </p>
            <Button size="sm" onClick={() => navigate("/doctor/profile")}>
              Complete Profile
            </Button>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map(([label, value, highlight]) => (
            <Card key={label} className="p-5">
              <p className="text-sm text-[var(--text-secondary)]">{label}</p>
              <p
                className={`mt-2 text-3xl font-bold ${
                  highlight ? "text-[var(--primary)]" : "text-[var(--text-primary)]"
                }`}
              >
                {value}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* TODAY */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Today's Schedule
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Your remaining appointments for today.
                </p>
              </div>

              <Badge status={todayList.length > 0 ? "confirmed" : "info"}>
                {todayList.length > 0
                  ? `${todayList.length} Appointment${todayList.length > 1 ? "s" : ""}`
                  : "No appointments"}
              </Badge>
            </div>

            {todayList.length > 0 ? (
              <div className="mt-6 space-y-4">
                {todayList.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-medium text-[var(--text-muted)]">
                          Patient
                        </p>
                        <h3 className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                          {item.patient?.name || "Patient"}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {item.patient?.email || "Email not available"}
                        </p>
                        {item.patient?.phone && (
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            {item.patient.phone}
                          </p>
                        )}
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-[var(--text-muted)]">Time</p>
                        <p className="mt-1 font-semibold text-[var(--primary)]">
                          {item.timeLabel || item.selectedTime}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">Consultation</p>
                        <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                          {item.consultationType}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">Date</p>
                        <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                          {item.date}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">Status</p>
                        <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                          {labelFor(item.status)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-xl bg-[var(--soft-background)] p-5 text-center">
                <div className="text-3xl">📅</div>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  No more appointments scheduled for today.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/doctor/appointments")}
                >
                  View Appointments
                </Button>
              </div>
            )}
          </Card>

          {/* QUICK ACTIONS */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Quick Actions
            </h2>

            <div className="mt-5 space-y-3">
              <Button className="w-full" onClick={() => navigate("/doctor/profile")}>
                Manage Profile
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/doctor/appointments")}>
                View Appointments
              </Button>
              <Button variant="outline" className="w-full" onClick={() => navigate("/doctor/schedule")}>
                Manage Schedule
              </Button>
            </div>

            {profile?.consultationFee ? (
              <p className="mt-5 text-xs text-[var(--text-muted)]">
                Current consultation fee: ₹{profile.consultationFee}
              </p>
            ) : null}
          </Card>
        </div>

        {/* PATIENT REQUESTS */}
        <div className="mt-8">
          <Card className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Patient Requests
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Paid requests waiting for your confirmation.
                </p>
              </div>

              {(stats?.pendingAppointments ?? 0) > 0 && (
                <Badge status="pending">{stats.pendingAppointments} Pending</Badge>
              )}
            </div>

            {pendingList.length > 0 ? (
              <div className="mt-5 space-y-3">
                {pendingList.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">
                        {item.patient?.name || "Patient"}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">
                        {item.date} · {item.timeLabel || item.selectedTime}
                      </p>
                    </div>

                    <Badge status={badgeFor(item.status)}>{labelFor(item.status)}</Badge>
                  </div>
                ))}

                <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                  <Button className="w-full sm:w-auto" onClick={() => navigate("/doctor/appointments")}>
                    Review Requests
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => load()}>
                    Refresh
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-[var(--soft-background)] p-5 text-center">
                <div className="text-3xl">📋</div>
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  New paid appointment requests will appear here.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

export default DoctorDashboard;