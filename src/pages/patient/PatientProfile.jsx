
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

const API_URL = "http://localhost:5000/api";

function PatientProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    age: "",
    gender: "",
    city: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD PATIENT PROFILE
  // ======================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("docniva-token");

      if (!token) {
        navigate("/patient/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/patients/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("docniva-token");
          localStorage.removeItem(
            "docniva-current-patient"
          );

          navigate("/patient/login");
          return;
        }

        throw new Error(
          data.message || "Failed to load profile"
        );
      }

      if (data.success && data.patient) {
        const patient = data.patient;

        setProfile({
          name: patient.name || "",
          email: patient.email || "",
          mobile: patient.phone || "",
          age:
            patient.age !== undefined &&
            patient.age !== null
              ? String(patient.age)
              : "",
          gender: patient.gender || "",
          city: patient.city || "",
        });

        // Current patient localStorage update
        localStorage.setItem(
          "docniva-current-patient",
          JSON.stringify(patient)
        );
      }
    } catch (error) {
      console.error(
        "Load patient profile error:",
        error
      );

      setError(
        error.message ||
          "Unable to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD PROFILE ON PAGE OPEN
  // ======================================================

  useEffect(() => {
    loadProfile();
  }, []);

  // ======================================================
  // HANDLE INPUT CHANGE
  // ======================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
    setError("");
  };

  // ======================================================
  // UPDATE PROFILE
  // ======================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setSaved(false);
      setError("");

      const token = localStorage.getItem(
        "docniva-token"
      );

      if (!token) {
        navigate("/patient/login");
        return;
      }

      // --------------------------------------------------
      // VALIDATION
      // --------------------------------------------------

      if (!profile.name.trim()) {
        setError("Name is required.");
        return;
      }

      if (!profile.mobile.trim()) {
        setError("Mobile number is required.");
        return;
      }

      // Age optional hai.
      // Agar diya gaya hai to number mein convert karenge.
      let ageValue = null;

      if (profile.age !== "") {
        const ageNumber = Number(profile.age);

        if (
          Number.isNaN(ageNumber) ||
          ageNumber < 1 ||
          ageNumber > 120
        ) {
          setError(
            "Age must be between 1 and 120."
          );
          return;
        }

        ageValue = ageNumber;
      }

      // --------------------------------------------------
      // BACKEND UPDATE
      // --------------------------------------------------

      const response = await fetch(
        `${API_URL}/patients/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.name.trim(),
            phone: profile.mobile.trim(),
            age: ageValue,
            gender: profile.gender,
            city: profile.city.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("docniva-token");
          localStorage.removeItem(
            "docniva-current-patient"
          );

          navigate("/patient/login");
          return;
        }

        throw new Error(
          data.message ||
            "Failed to update profile"
        );
      }

      // --------------------------------------------------
      // UPDATED PATIENT
      // --------------------------------------------------

      if (data.success && data.patient) {
        const updatedPatient = data.patient;

        setProfile({
          name: updatedPatient.name || "",
          email: updatedPatient.email || "",
          mobile: updatedPatient.phone || "",
          age:
            updatedPatient.age !== undefined &&
            updatedPatient.age !== null
              ? String(updatedPatient.age)
              : "",
          gender: updatedPatient.gender || "",
          city: updatedPatient.city || "",
        });

        // Dashboard/localStorage ke liye updated data
        localStorage.setItem(
          "docniva-current-patient",
          JSON.stringify(updatedPatient)
        );

        setSaved(true);
      }
    } catch (error) {
      console.error(
        "Update patient profile error:",
        error
      );

      setError(
        error.message ||
          "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="p-8">
            <p className="text-center text-sm text-[var(--text-secondary)]">
              Loading profile...
            </p>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            navigate("/patient/dashboard")
          }
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">
            Patient Profile
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Manage Your Profile
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            Update your personal information.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        )}

        <Card className="p-6 sm:p-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Personal Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                {/* Name */}
                <Input
                  label="Full Name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />

                {/* Email */}
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={profile.email}
                  placeholder="you@example.com"
                  disabled
                />

                {/* Mobile */}
                <Input
                  label="Mobile Number"
                  name="mobile"
                  type="tel"
                  value={profile.mobile}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  required
                />

                {/* Age */}
                <Input
                  label="Age"
                  name="age"
                  type="number"
                  value={profile.age}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  min="1"
                  max="120"
                />

                {/* Gender */}
                <div>
                  <label
                    htmlFor="gender"
                    className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
                  >
                    Gender
                  </label>

                  <select
                    id="gender"
                    name="gender"
                    value={profile.gender}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </div>

                {/* City */}
                <Input
                  label="City"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                />

              </div>
            </div>

            {/* Information */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-4">
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Email address cannot be changed from
                this page. Name, mobile number, age,
                gender and city can be updated.
              </p>
            </div>

            {/* Success */}
            {saved && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--primary-light)] p-4">
                <p className="text-sm font-medium text-[var(--primary)]">
                  ✓ Profile updated successfully.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate("/patient/dashboard")
                }
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </Button>

            </div>

          </form>
        </Card>

      </div>
    </main>
  );
}

export default PatientProfile;

