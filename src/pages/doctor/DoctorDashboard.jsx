
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

function DoctorDashboard() {
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [profile, setProfile] = useState({
    name: "Dr. Rozy",
    specialization: "Cardiologist",
  });

  useEffect(() => {
    loadData();

    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const loadData = () => {
    const savedAppointment = localStorage.getItem(
      "docniva-appointment"
    );

    const savedProfile = localStorage.getItem(
      "docniva-doctor-profile"
    );

    if (savedAppointment) {
      try {
        setAppointment(JSON.parse(savedAppointment));
      } catch (error) {
        console.error("Invalid appointment data:", error);
        setAppointment(null);
      }
    } else {
      setAppointment(null);
    }

    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);

        setProfile({
          name: parsedProfile.name || "Doctor",
          specialization:
            parsedProfile.specialization || "Specialist",
        });
      } catch (error) {
        console.error("Invalid doctor profile data:", error);
      }
    }
  };

  const refreshDashboard = () => {
    loadData();
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

  const isToday = (date) => {
    if (!date) return false;

    const today = new Date();
    const appointmentDate = new Date(`${date}T00:00:00`);

    return (
      today.getFullYear() === appointmentDate.getFullYear() &&
      today.getMonth() === appointmentDate.getMonth() &&
      today.getDate() === appointmentDate.getDate()
    );
  };

  const todayAppointmentCount =
    appointment && isToday(appointment.date) ? 1 : 0;

  const upcomingCount =
    appointment &&
    !isToday(appointment.date) &&
    appointment.status !== "rejected"
      ? 1
      : 0;

  const pendingCount =
    appointment?.status === "pending" ? 1 : 0;

  const totalPatients = appointment ? 1 : 0;

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Welcome */}
        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">
            Doctor Dashboard
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Welcome back, {profile.name} 👋
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            Manage your appointments, schedule and patients.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Card className="p-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Today's Appointments
            </p>

            <p className="mt-2 text-3xl font-bold text-[var(--primary)]">
              {todayAppointmentCount}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-[var(--text-secondary)]">
              Upcoming
            </p>

            <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
              {upcomingCount}
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
              {pendingCount}
            </p>
          </Card>

        </div>

        {/* Main Section */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">

          {/* Today's Schedule */}
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

              {appointment && isToday(appointment.date) ? (
                <Badge status={getBadgeStatus(appointment.status)}>
                  {getStatusText(appointment.status)}
                </Badge>
              ) : (
                <Badge status="info">
                  No appointments
                </Badge>
              )}

            </div>

            {appointment && isToday(appointment.date) ? (
              <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <p className="text-xs font-medium text-[var(--text-muted)]">
                      Patient
                    </p>

                    <h3 className="mt-1 text-lg font-bold text-[var(--text-primary)]">
                      {appointment.patient?.name || "Patient"}
                    </h3>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {appointment.patient?.email ||
                        "Email not available"}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xs text-[var(--text-muted)]">
                      Time
                    </p>

                    <p className="mt-1 font-semibold text-[var(--primary)]">
                      {appointment.selectedTime}
                    </p>
                  </div>

                </div>

                <div className="mt-5 grid gap-4 border-t border-[var(--border)] pt-5 sm:grid-cols-3">

                  <div>
                    <p className="text-xs text-[var(--text-muted)]">
                      Consultation
                    </p>

                    <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                      {appointment.consultationType}
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
                      {getStatusText(appointment.status)}
                    </p>
                  </div>

                </div>

                <Button
                  className="mt-5 w-full sm:w-auto"
                  onClick={() =>
                    navigate("/doctor/appointments")
                  }
                >
                  Manage Appointment
                </Button>

              </div>
            ) : (
              <div className="mt-6 rounded-xl bg-[var(--soft-background)] p-5 text-center">
                <div className="text-3xl">
                  📅
                </div>

                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  Your schedule will appear here once appointments are booked.
                </p>

                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() =>
                    navigate("/doctor/appointments")
                  }
                >
                  View Appointments
                </Button>
              </div>
            )}

          </Card>

          {/* Quick Actions */}
          <Card className="p-6">

            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Quick Actions
            </h2>

            <div className="mt-5 space-y-3">

              <Button
                className="w-full"
                onClick={() => navigate("/doctor/profile")}
              >
                Manage Profile
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  navigate("/doctor/appointments")
                }
              >
                View Appointments
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/doctor/schedule")}
              >
                Manage Schedule
              </Button>

            </div>

          </Card>

        </div>

        {/* Patient Requests */}
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

              {pendingCount > 0 && (
                <Badge status="pending">
                  {pendingCount} Pending
                </Badge>
              )}

            </div>

            {appointment ? (
              <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">
                      {appointment.patient?.name || "Patient"}
                    </p>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {appointment.date} ·{" "}
                      {appointment.selectedTime}
                    </p>
                  </div>

                  <Badge status={getBadgeStatus(appointment.status)}>
                    {getStatusText(appointment.status)}
                  </Badge>

                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                  <Button
                    className="w-full sm:w-auto"
                    onClick={() =>
                      navigate("/doctor/appointments")
                    }
                  >
                    View Request
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={refreshDashboard}
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
                  New patient appointment requests will appear here.
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

