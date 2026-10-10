import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

const API_URL = "http://localhost:5000/api";

function DoctorDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const getToken = () => {
    return localStorage.getItem("docniva-doctor-token");
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Doctor login required. Please login again.");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [profileResponse, appointmentsResponse] =
        await Promise.all([
          fetch(`${API_URL}/doctors/profile`, {
            method: "GET",
            headers,
          }),

          fetch(`${API_URL}/doctors/appointments`, {
            method: "GET",
            headers,
          }),
        ]);

      const profileData = await profileResponse.json();
      const appointmentsData =
        await appointmentsResponse.json();

      if (!profileResponse.ok) {
        setError(
          profileData.message ||
            "Unable to load doctor profile."
        );
        return;
      }

      if (!appointmentsResponse.ok) {
        setError(
          appointmentsData.message ||
            "Unable to load appointments."
        );
        return;
      }

      if (profileData.success) {
        setProfile(profileData.doctor);

        localStorage.setItem(
          "docniva-doctor-profile",
          JSON.stringify(profileData.doctor)
        );
      }

      if (
        appointmentsData.success &&
        Array.isArray(appointmentsData.appointments)
      ) {
        setAppointments(
          appointmentsData.appointments
        );
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error(
        "Doctor dashboard error:",
        error
      );

      setError(
        "Unable to connect to backend. Please make sure the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const isToday = (date) => {
    if (!date) return false;

    const today = new Date();
    const appointmentDate = new Date(
      `${date}T00:00:00`
    );

    return (
      today.getFullYear() ===
        appointmentDate.getFullYear() &&
      today.getMonth() ===
        appointmentDate.getMonth() &&
      today.getDate() ===
        appointmentDate.getDate()
    );
  };

  const todayAppointments = appointments.filter(
    (appointment) =>
      isToday(appointment.date) &&
      appointment.status !== "cancelled" &&
      appointment.status !== "rejected"
  );

  const upcomingAppointments =
    appointments.filter(
      (appointment) =>
        !isToday(appointment.date) &&
        appointment.status !== "cancelled" &&
        appointment.status !== "rejected"
    );

  const pendingAppointments =
    appointments.filter(
      (appointment) =>
        appointment.status === "pending"
    );

  const totalPatients = new Set(
    appointments
      .map((appointment) =>
        appointment.patient?._id
      )
      .filter(Boolean)
  ).size;

  const appointment =
    todayAppointments[0] ||
    upcomingAppointments[0] ||
    appointments[0] ||
    null;

  const getBadgeStatus = (status) => {
    if (status === "confirmed") return "confirmed";
    if (
      status === "rejected" ||
      status === "cancelled"
    ) {
      return "danger";
    }

    return "pending";
  };

  const getStatusText = (status) => {
    if (status === "confirmed") return "Confirmed";
    if (status === "rejected") return "Rejected";
    if (status === "cancelled") return "Cancelled";

    return "Pending";
  };

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

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">
            Doctor Dashboard
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Welcome back,{" "}
            {profile?.name || "Doctor"} 👋
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            {profile?.specialization ||
              "Specialist"}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Card className="p-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Today's Appointments
            </p>

            <p className="mt-2 text-3xl font-bold text-[var(--primary)]">
              {todayAppointments.length}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Upcoming
            </p>

            <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
              {upcomingAppointments.length}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Total Patients
            </p>

            <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
              {totalPatients}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Pending Requests
            </p>

            <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
              {pendingAppointments.length}
            </p>
          </Card>

        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          <Card className="p-6 lg:col-span-2">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Today's Schedule
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Your appointments for today.
                </p>
              </div>

              {todayAppointments.length > 0 ? (
                <Badge
                  status={getBadgeStatus(
                    todayAppointments[0].status
                  )}
                >
                  {todayAppointments.length} Appointment
                  {todayAppointments.length > 1
                    ? "s"
                    : ""}
                </Badge>
              ) : (
                <Badge status="info">
                  No appointments
                </Badge>
              )}

            </div>

            {todayAppointments.length > 0 ? (
              <div className="mt-6 space-y-4">

                {todayAppointments
                  .slice(0, 3)
                  .map((item) => (
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
                            {item.patient?.name ||
                              "Patient"}
                          </h3>

                          <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            {item.patient?.email ||
                              "Email not available"}
                          </p>

                          {item.patient?.phone && (
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                              {item.patient.phone}
                            </p>
                          )}
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs text-[var(--text-muted)]">
                            Time
                          </p>

                          <p className="mt-1 font-semibold text-[var(--primary)]">
                            {item.selectedTime}
                          </p>
                        </div>

                      </div>

                      <div className="mt-5 grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-3">

                        <div>
                          <p className="text-xs text-[var(--text-muted)]">
                            Consultation
                          </p>

                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                            {item.consultationType}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[var(--text-muted)]">
                            Date
                          </p>

                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                            {item.date}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-[var(--text-muted)]">
                            Status
                          </p>

                          <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                            {getStatusText(
                              item.status
                            )}
                          </p>
                        </div>

                      </div>
                    </div>
                  ))}

              </div>
            ) : (
              <div className="mt-6 rounded-xl bg-[var(--soft-background)] p-5 text-center">

                <div className="text-3xl">
                  📅
                </div>

                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  No appointments scheduled for today.
                </p>

                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    navigate(
                      "/doctor/appointments"
                    )
                  }
                >
                  View Appointments
                </Button>

              </div>
            )}

          </Card>

          <Card className="p-6">

            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Quick Actions
            </h2>

            <div className="mt-5 space-y-3">

              <Button
                className="w-full"
                onClick={() =>
                  navigate("/doctor/profile")
                }
              >
                Manage Profile
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  navigate(
                    "/doctor/appointments"
                  )
                }
              >
                View Appointments
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  navigate("/doctor/schedule")
                }
              >
                Manage Schedule
              </Button>

            </div>

          </Card>

        </div>

        <div className="mt-8">

          <Card className="p-6">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Patient Requests
                </h2>

                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Manage appointment requests from patients.
                </p>
              </div>

              {pendingAppointments.length > 0 && (
                <Badge status="pending">
                  {pendingAppointments.length} Pending
                </Badge>
              )}

            </div>

            {appointment ? (
              <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {appointment.patient?.name ||
                        "Patient"}
                    </p>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {appointment.date} ·{" "}
                      {appointment.selectedTime}
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

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                  <Button
                    className="w-full sm:w-auto"
                    onClick={() =>
                      navigate(
                        "/doctor/appointments"
                      )
                    }
                  >
                    View Requests
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={loadDashboard}
                  >
                    Refresh
                  </Button>

                </div>

              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-[var(--soft-background)] p-5 text-center">

                <div className="text-3xl">
                  📋
                </div>

                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  New patient appointment requests
                  will appear here.
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