import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

function PatientDashboard() {
const navigate = useNavigate();

const [appointment, setAppointment] = useState(null);

const loadAppointment = () => {
const saved = localStorage.getItem("docniva-appointment");

 
if (!saved) {
  setAppointment(null);
  return;
}

try {
  setAppointment(JSON.parse(saved));
} catch (error) {
  console.error("Invalid appointment data:", error);
  localStorage.removeItem("docniva-appointment");
  setAppointment(null);
}
 

};

useEffect(() => {
loadAppointment();

 
const handleStorageChange = () => {
  loadAppointment();
};

window.addEventListener("storage", handleStorageChange);

return () => {
  window.removeEventListener("storage", handleStorageChange);
};
 

}, []);

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

const getStatusMessage = (status) => {
if (status === "confirmed") {
return "Your appointment has been accepted by the doctor.";
}

 
if (status === "rejected") {
  return "Your appointment request was rejected by the doctor.";
}

return "Your appointment request is waiting for the doctor's confirmation.";
 

};

const handleCancelAppointment = () => {
const shouldCancel = window.confirm(
"Are you sure you want to cancel this appointment?"
);

 
if (!shouldCancel) return;

localStorage.removeItem("docniva-appointment");
setAppointment(null);
 

};

return ( <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8"> <div className="mx-auto max-w-7xl">

 
    {/* Welcome */}
    <div className="mb-8">
      <p className="font-semibold text-[var(--primary)]">
        Patient Dashboard
      </p>

      <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
        Welcome back 👋
      </h1>

      <p className="mt-2 text-[var(--text-secondary)]">
        Manage your appointments and healthcare journey.
      </p>
    </div>

    {/* Quick Actions */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

      {/* Find Doctor */}
      <Card className="p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-light)] text-xl">
          🔎
        </div>

        <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
          Find a Doctor
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          Search doctors by specialty and find the right doctor for your
          healthcare needs.
        </p>

        <Button
          className="mt-5 w-full"
          onClick={() => navigate("/patient/find-doctor")}
        >
          Find Doctor
        </Button>
      </Card>

      {/* Appointments */}
      <Card className="p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-light)] text-xl">
          📅
        </div>

        <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
          My Appointments
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          View your appointment details and check the latest appointment
          status.
        </p>

        <Button
          variant="outline"
          className="mt-5 w-full"
          onClick={() => navigate("/patient/appointments")}
        >
          View Appointments
        </Button>
      </Card>

      {/* Profile */}
      <Card className="p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-light)] text-xl">
          👤
        </div>

        <h2 className="mt-4 text-lg font-semibold text-[var(--text-primary)]">
          My Profile
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
          View and manage your personal information and account details.
        </p>

        <Button
          variant="outline"
          className="mt-5 w-full"
          onClick={() => navigate("/patient/profile")}
        >
          View Profile
        </Button>
      </Card>

    </div>

    {/* Appointment */}
    <div className="mt-8">
      <Card className="p-6">

        {appointment ? (
          <>
            {/* Appointment Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  My Appointment
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

            {/* Appointment Details */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Date
                </p>

                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                  {appointment.date || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Time
                </p>

                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                  {appointment.selectedTime || "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Consultation
                </p>

                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                  {appointment.consultationType || "Clinic Visit"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Fee
                </p>

                <p className="mt-1 text-sm font-bold text-[var(--text-primary)]">
                  {appointment.doctor?.fee || "Not available"}
                </p>
              </div>

            </div>

            {/* Status Message */}
            <div className="mt-6 rounded-xl bg-[var(--soft-background)] p-4">
              <p className="text-sm text-[var(--text-secondary)]">
                {getStatusMessage(appointment.status)}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <Button
                onClick={() => navigate("/patient/appointments")}
              >
                View Appointment
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/patient/find-doctor")}
              >
                Find Another Doctor
              </Button>

              {appointment.status === "pending" && (
                <Button
                  variant="outline"
                  onClick={handleCancelAppointment}
                >
                  Cancel Appointment
                </Button>
              )}

            </div>
          </>
        ) : (
          <>
            {/* Empty Appointment */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  My Appointment
                </p>

                <h2 className="mt-1 text-xl font-bold text-[var(--text-primary)]">
                  No upcoming appointments
                </h2>
              </div>

              <Badge status="info">
                No Booking
              </Badge>

            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              You don't have an appointment yet. Find a doctor and book an
              appointment whenever you're ready.
            </p>

            <Button
              className="mt-5"
              onClick={() => navigate("/patient/find-doctor")}
            >
              Book an Appointment
            </Button>
          </>
        )}

      </Card>
    </div>

    {/* Recent Activity */}
    <div className="mt-8">
      <Card className="p-6">

        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Recent Activity
        </h2>

        {appointment ? (
          <div className="mt-5 rounded-xl bg-[var(--soft-background)] p-4">

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--primary-light)]">
                📅
              </div>

              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Appointment with{" "}
                  {appointment.doctor?.name || "Doctor"}
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                  {appointment.date} at{" "}
                  {appointment.selectedTime} ·{" "}
                  {getStatusText(appointment.status)}
                </p>
              </div>

            </div>

          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-[var(--soft-background)] p-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Your recent healthcare activity will appear here.
            </p>
          </div>
        )}

      </Card>
    </div>

  </div>
</main>


);
}

export default PatientDashboard;
