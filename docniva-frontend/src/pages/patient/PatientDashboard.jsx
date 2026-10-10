import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

const API_URL = "http://localhost:5000/api";

function PatientDashboard() {
const navigate = useNavigate();

const [patient, setPatient] = useState(null);
const [appointment, setAppointment] = useState(null);

const [loading, setLoading] = useState(true);
const [cancelling, setCancelling] = useState(false);

// ======================================================
// GET JWT TOKEN
// ======================================================

const getToken = () => {
return (
localStorage.getItem("docniva-token") ||
localStorage.getItem("token") ||
localStorage.getItem("docniva-auth-token")
);
};

// ======================================================
// LOAD PATIENT DASHBOARD
// ======================================================

const loadPatient = async () => {
try {
const token = getToken();

 
  if (!token) {
    setPatient(null);
    return;
  }

  const response = await fetch(
    `${API_URL}/patients/dashboard`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Failed to load patient:",
      data.message
    );

    setPatient(null);
    return;
  }

  if (data.success && data.patient) {
    setPatient(data.patient);

    // LocalStorage ko latest patient data ke saath sync
    localStorage.setItem(
      "docniva-current-patient",
      JSON.stringify(data.patient)
    );
  } else {
    setPatient(null);
  }
} catch (error) {
  console.error(
    "Load patient error:",
    error
  );

  setPatient(null);
}
 

};

// ======================================================
// LOAD PATIENT APPOINTMENTS
// ======================================================

const loadAppointment = async () => {
try {
const token = getToken();

 
  if (!token) {
    setAppointment(null);
    return;
  }

  // IMPORTANT:
  // Backend route:
  // GET /api/appointments
  //
  // Patient ID URL mein nahi bhejni.
  // Backend JWT se req.user.id lega.

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

  if (!response.ok) {
    console.error(
      "Failed to load appointments:",
      data.message
    );

    setAppointment(null);
    return;
  }

  if (
    data.success &&
    Array.isArray(data.appointments) &&
    data.appointments.length > 0
  ) {
    // Backend createdAt descending mein bhej raha hai.
    // First appointment latest appointment hai.
    setAppointment(data.appointments[0]);
  } else {
    setAppointment(null);
  }
} catch (error) {
  console.error(
    "Load appointment error:",
    error
  );

  setAppointment(null);
}
 

};

// ======================================================
// LOAD DASHBOARD DATA
// ======================================================

useEffect(() => {
const loadDashboard = async () => {
setLoading(true);

 
  await Promise.all([
    loadPatient(),
    loadAppointment(),
  ]);

  setLoading(false);
};

loadDashboard();
 

}, []);

// ======================================================
// BADGE STATUS
// ======================================================

const getBadgeStatus = (status) => {
if (status === "confirmed") {
return "confirmed";
}

 
if (status === "rejected") {
  return "danger";
}

if (status === "cancelled") {
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
// STATUS MESSAGE
// ======================================================

const getStatusMessage = (status) => {
if (status === "confirmed") {
return "Your appointment has been accepted by the doctor.";
}

 
if (status === "rejected") {
  return "Your appointment request was rejected by the doctor.";
}

if (status === "cancelled") {
  return "This appointment has been cancelled.";
}

return "Your appointment request is waiting for the doctor's confirmation.";
 

};

// ======================================================
// CANCEL APPOINTMENT
// ======================================================

const handleCancelAppointment = async () => {
if (!appointment?._id) {
return;
}

 
const shouldCancel = window.confirm(
  "Are you sure you want to cancel this appointment?"
);

if (!shouldCancel) {
  return;
}

try {
  setCancelling(true);

  const token = getToken();

  if (!token) {
    alert("Please login again.");
    return;
  }

  // Backend:
  // PATCH /api/appointments/:appointmentId/cancel

  const response = await fetch(
    `${API_URL}/appointments/${appointment._id}/cancel`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    alert(
      data.message ||
        "Failed to cancel appointment"
    );
    return;
  }

  if (data.success) {
    // Backend se updated appointment
    setAppointment(
      data.appointment || null
    );

    alert(
      "Appointment cancelled successfully."
    );
  }
} catch (error) {
  console.error(
    "Cancel appointment error:",
    error
  );

  alert(
    "Unable to cancel appointment. Please try again."
  );
} finally {
  setCancelling(false);
}
 

};

// ======================================================
// LOADING STATE
// ======================================================

if (loading) {
return ( <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8"> <div className="mx-auto max-w-7xl"> <Card className="p-6"> <p className="text-sm text-[var(--text-secondary)]">
Loading your dashboard... </p> </Card> </div> </main>
);
}

// ======================================================
// MAIN DASHBOARD
// ======================================================

return ( <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8"> <div className="mx-auto max-w-7xl">

 
    {/* ==================================================
        WELCOME
    ================================================== */}

    <div className="mb-8">
      <p className="font-semibold text-[var(--primary)]">
        Patient Dashboard
      </p>

      <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
        Welcome back
        {patient?.name
          ? `, ${patient.name}`
          : ""}{" "}
        👋
      </h1>

      <p className="mt-2 text-[var(--text-secondary)]">
        Manage your appointments and healthcare journey.
      </p>
    </div>

    {/* ==================================================
        QUICK ACTIONS
    ================================================== */}

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
          Search doctors by specialty and find the right doctor for your healthcare needs.
        </p>

        <Button
          className="mt-5 w-full"
          onClick={() =>
            navigate("/patient/find-doctor")
          }
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
          View your appointment details and check the latest appointment status.
        </p>

        <Button
          variant="outline"
          className="mt-5 w-full"
          onClick={() =>
            navigate("/patient/appointments")
          }
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
          onClick={() =>
            navigate("/patient/profile")
          }
        >
          View Profile
        </Button>
      </Card>

    </div>

    {/* ==================================================
        APPOINTMENT
    ================================================== */}

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
                  {appointment.doctor?.name ||
                    "Doctor"}
                </h2>

                <p className="mt-1 text-sm text-[var(--primary)]">
                  {appointment.doctor
                    ?.specialization ||
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

            {/* Appointment Details */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Date
                </p>

                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                  {appointment.date ||
                    "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Time
                </p>

                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                  {appointment.selectedTime ||
                    "Not available"}
                </p>
              </div>

              <div>
                <p className="text-xs text-[var(--text-muted)]">
                  Consultation
                </p>

                <p className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                  {appointment.consultationType ||
                    "Clinic Visit"}
                </p>
              </div>

            </div>

            {/* Status Message */}

            <div className="mt-6 rounded-xl bg-[var(--soft-background)] p-4">
              <p className="text-sm text-[var(--text-secondary)]">
                {getStatusMessage(
                  appointment.status
                )}
              </p>
            </div>

            {/* Actions */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">

              <Button
                onClick={() =>
                  navigate(
                    "/patient/appointments"
                  )
                }
              >
                View Appointment
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  navigate(
                    "/patient/find-doctor"
                  )
                }
              >
                Find Another Doctor
              </Button>

              {(appointment.status ===
                "pending" ||
                appointment.status ===
                  "confirmed") && (
                <Button
                  variant="outline"
                  onClick={
                    handleCancelAppointment
                  }
                  disabled={cancelling}
                >
                  {cancelling
                    ? "Cancelling..."
                    : "Cancel Appointment"}
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
                  No appointments
                </h2>
              </div>

              <Badge status="info">
                No Booking
              </Badge>

            </div>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
              You don't have an appointment yet. Find a doctor and book an appointment whenever you're ready.
            </p>

            <Button
              className="mt-5"
              onClick={() =>
                navigate(
                  "/patient/find-doctor"
                )
              }
            >
              Book an Appointment
            </Button>
          </>
        )}

      </Card>
    </div>

    {/* ==================================================
        RECENT ACTIVITY
    ================================================== */}

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
                  {appointment.doctor?.name ||
                    "Doctor"}
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                  {appointment.date} at{" "}
                  {appointment.selectedTime} ·{" "}
                  {getStatusText(
                    appointment.status
                  )}
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
