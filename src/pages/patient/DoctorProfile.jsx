
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

const doctors = {
  1: {
    name: "Dr. Rozy",
    specialization: "Cardiologist",
    location: "Agra",
    experience: "8 years",
    qualification: "MBBS, MD Cardiology",
    fee: "₹800",
    availability: "Available",
    about:
      "Dr. Ananya Sharma is a cardiologist focused on providing personalized cardiac care and helping patients maintain a healthy heart.",
  },

  2: {
    name: "Dr. Noor",
    specialization: "Dermatologist",
    location: "Agra",
    experience: "6 years",
    qualification: "MBBS, MD Dermatology",
    fee: "₹600",
    availability: "Available",
    about:
      "Dr. Rahul Verma provides dermatology consultations for common skin, hair and related concerns.",
  },

  3: {
    name: "Dr. Priya Singh",
    specialization: "General Physician",
    location: "Agra",
    experience: "10 years",
    qualification: "MBBS, MD Medicine",
    fee: "₹500",
    availability: "Busy",
    about:
      "Dr. Priya Singh provides general medical consultations and preventive healthcare guidance.",
  },
};

function DoctorProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const doctor = doctors[id];

  if (!doctor) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[var(--soft-background)] px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Doctor not found
          </h1>

          <p className="mt-3 text-[var(--text-secondary)]">
            The doctor profile you're looking for doesn't exist.
          </p>

          <Button
            className="mt-6"
            onClick={() => navigate("/patient/find-doctor")}
          >
            Back to Doctors
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/patient/find-doctor")}
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Doctors
        </button>

        {/* Profile Header */}
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-[var(--primary-light)] text-4xl">
              👨‍⚕️
            </div>

            <div className="flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                    {doctor.name}
                  </h1>

                  <p className="mt-1 font-medium text-[var(--primary)]">
                    {doctor.specialization}
                  </p>
                </div>

                <Badge
                  status={
                    doctor.availability === "Available"
                      ? "available"
                      : "pending"
                  }
                >
                  {doctor.availability}
                </Badge>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
                <p>📍 {doctor.location}</p>
                <p>🩺 {doctor.experience} experience</p>
                <p>🎓 {doctor.qualification}</p>
                <p>💳 Consultation: {doctor.fee}</p>
              </div>
            </div>

          </div>
        </Card>

        {/* About */}
        <div className="mt-6">
          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              About the Doctor
            </h2>

            <p className="mt-4 leading-7 text-[var(--text-secondary)]">
              {doctor.about}
            </p>
          </Card>
        </div>

        {/* Booking */}
        <div className="mt-6">
          <Card className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Book a Consultation
                </h2>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Choose a convenient appointment time with this doctor.
                </p>
              </div>

              <Button
                size="lg"
                disabled={doctor.availability !== "Available"}
                onClick={() =>
                  navigate(`/patient/book/${id}`)
                }
              >
                Book Appointment
              </Button>

            </div>
          </Card>
        </div>

      </div>
    </main>
  );
}

export default DoctorProfile;
 
