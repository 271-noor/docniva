
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

const API_URL = "http://localhost:5000";

function DoctorProfile() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD DOCTOR FROM BACKEND
  // ======================================================

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        setLoading(true);
        setError("");
        setDoctor(null);

        const url = `${API_URL}/api/doctors/${id}`;

        console.log("Fetching doctor:", url);

        const response = await fetch(url);

        console.log("Doctor API status:", response.status);

        const contentType =
          response.headers.get("content-type") || "";

        let data;

        if (contentType.includes("application/json")) {
          data = await response.json();
        } else {
          data = await response.text();
        }

        console.log("Doctor API response:", data);

        // --------------------------------------------------
        // BACKEND ERROR
        // --------------------------------------------------

        if (!response.ok) {
          const message =
            typeof data === "object" && data !== null
              ? data.message
              : data;

          setError(
            message ||
              `Unable to load doctor profile. Server returned ${response.status}.`
          );

          setDoctor(null);
          return;
        }

        // --------------------------------------------------
        // SUPPORT DIFFERENT BACKEND RESPONSE FORMATS
        //
        // { success: true, doctor: {...} }
        // { doctor: {...} }
        // { ...doctor }
        // --------------------------------------------------

        const backendDoctor =
          data?.doctor || data;

        if (
          !backendDoctor ||
          typeof backendDoctor !== "object"
        ) {
          setError("Invalid doctor data received from backend.");
          setDoctor(null);
          return;
        }

        console.log(
          "Doctor loaded successfully:",
          backendDoctor
        );

        setDoctor(backendDoctor);

      } catch (err) {
        console.error("Load doctor error:", err);

        // --------------------------------------------------
        // CONNECTION ERROR
        // --------------------------------------------------

        if (
          err.name === "TypeError" ||
          err.message?.includes("fetch")
        ) {
          setError(
            "Unable to connect to the backend. Please make sure the server is running on port 5000."
          );
        } else {
          setError(
            err.message ||
              "Unable to load doctor profile."
          );
        }

        setDoctor(null);

      } finally {
        setLoading(false);
      }
    };

    // ----------------------------------------------------
    // CHECK DOCTOR ID
    // ----------------------------------------------------

    if (id) {
      loadDoctor();
    } else {
      setLoading(false);
      setError("Doctor ID is missing.");
    }
  }, [id]);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[var(--soft-background)] px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Loading doctor profile...
          </p>
        </Card>
      </main>
    );
  }

  // ======================================================
  // ERROR / NOT FOUND
  // ======================================================

  if (error || !doctor) {
    return (
      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[var(--soft-background)] px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Doctor not found
          </h1>

          <p className="mt-3 text-[var(--text-secondary)]">
            {error ||
              "The doctor profile you're looking for doesn't exist."}
          </p>

          <Button
            className="mt-6"
            onClick={() =>
              navigate("/patient/find-doctor")
            }
          >
            Back to Doctors
          </Button>
        </Card>
      </main>
    );
  }

  // ======================================================
  // MAP BACKEND FIELDS
  // ======================================================

  const doctorId =
    doctor._id ||
    doctor.id ||
    id;

  const doctorName =
    doctor.name ||
    doctor.fullName ||
    `${doctor.firstName || ""} ${
      doctor.lastName || ""
    }`.trim() ||
    "Doctor";

  const doctorSpecialization =
    doctor.specialization ||
    doctor.speciality ||
    doctor.specialty ||
    "Specialist";

  const doctorLocation =
    doctor.location ||
    doctor.city ||
    "Location not specified";

  const doctorExperience =
    doctor.experience !== undefined &&
    doctor.experience !== null
      ? `${doctor.experience} years`
      : "Experience not specified";

  const doctorQualification =
    doctor.qualification ||
    doctor.qualifications ||
    doctor.education ||
    "Qualification not specified";

  const doctorFee =
    doctor.consultationFee ??
    doctor.fee ??
    doctor.consultation_fee ??
    null;

  const doctorAbout =
    doctor.about ||
    doctor.bio ||
    doctor.description ||
    "No information about this doctor is available.";

  const doctorAvailability =
    doctor.availability ||
    doctor.status ||
    "Available";

  const availabilityText =
    String(doctorAvailability).toLowerCase();

  const isAvailable =
    availabilityText === "available" ||
    availabilityText === "active";

  // ======================================================
  // UI
  // ======================================================

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            navigate("/patient/find-doctor")
          }
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Doctors
        </button>

        {/* Profile Header */}
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

            {/* Doctor Icon */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-[var(--primary-light)] text-4xl">
              👨‍⚕️
            </div>

            {/* Doctor Info */}
            <div className="flex-1">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                <div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                    {doctorName}
                  </h1>

                  <p className="mt-1 font-medium text-[var(--primary)]">
                    {doctorSpecialization}
                  </p>
                </div>

                <Badge
                  status={
                    isAvailable
                      ? "available"
                      : "pending"
                  }
                >
                  {doctorAvailability}
                </Badge>

              </div>

              {/* Doctor Details */}
              <div className="mt-5 grid gap-3 text-sm text-[var(--text-secondary)] sm:grid-cols-2">

                <p>
                  📍 {doctorLocation}
                </p>

                <p>
                  🩺 {doctorExperience} experience
                </p>

                <p>
                  🎓 {doctorQualification}
                </p>

                <p>
                  💳 Consultation:{" "}
                  {doctorFee !== null
                    ? `₹${doctorFee}`
                    : "Not specified"}
                </p>

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
              {doctorAbout}
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
                disabled={!isAvailable}
                onClick={() =>
                  navigate(
                    `/patient/book/${doctorId}`
                  )
                }
              >
                {isAvailable
                  ? "Book Appointment"
                  : "Currently Unavailable"}
              </Button>

            </div>

          </Card>
        </div>

      </div>
    </main>
  );
}

export default DoctorProfile;

