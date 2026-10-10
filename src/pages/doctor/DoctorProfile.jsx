import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

const API_URL = "http://localhost:5000/api";

const emptyProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  registrationNumber: "",
  qualification: "",
  specialization: "",
  experience: "",
};

function DoctorProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] =
    useState(emptyProfile);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem(
        "docniva-doctor-token"
      );

      if (!token) {
        setError(
          "Doctor login required. Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/doctors/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        "GET DOCTOR PROFILE:",
        data
      );

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to load doctor profile."
        );
        return;
      }

      if (data.success && data.doctor) {
        const doctor = {
          ...emptyProfile,
          ...data.doctor,
          id: data.doctor.id || data.doctor._id || "",
          experience:
            data.doctor.experience ?? "",
        };

        setProfile(doctor);

        localStorage.setItem(
          "docniva-doctor-profile",
          JSON.stringify(doctor)
        );
      }
    } catch (error) {
      console.error(
        "Load doctor profile error:",
        error
      );

      setError(
        "Unable to connect to backend."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaved(false);
    setError("");

    if (
      !profile.name.trim() ||
      !profile.phone.trim() ||
      !profile.qualification.trim() ||
      !profile.specialization.trim() ||
      profile.experience === ""
    ) {
      setError(
        "Please fill all required fields."
      );
      return;
    }

    const experienceNumber = Number(
      profile.experience
    );

    if (
      Number.isNaN(experienceNumber) ||
      experienceNumber < 0
    ) {
      setError(
        "Experience must be a valid number."
      );
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem(
        "docniva-doctor-token"
      );

      if (!token) {
        setError(
          "Doctor login required. Please login again."
        );
        return;
      }

      const response = await fetch(
        `${API_URL}/doctors/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.name.trim(),
            phone: profile.phone.trim(),
            qualification:
              profile.qualification.trim(),
            specialization:
              profile.specialization.trim(),
            experience: experienceNumber,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "UPDATE DOCTOR PROFILE:",
        data
      );

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to update profile."
        );
        return;
      }

      if (data.success && data.doctor) {
        const updatedProfile = {
          ...emptyProfile,
          ...data.doctor,
          id:
            data.doctor.id ||
            data.doctor._id ||
            profile.id,
          experience:
            data.doctor.experience ?? "",
        };

        setProfile(updatedProfile);

        localStorage.setItem(
          "docniva-doctor-profile",
          JSON.stringify(updatedProfile)
        );

        setSaved(true);
      }
    } catch (error) {
      console.error(
        "Update doctor profile error:",
        error
      );

      setError(
        "Unable to connect to backend."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">
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

        <button
          type="button"
          onClick={() =>
            navigate("/doctor/dashboard")
          }
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">
            Doctor Profile
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Manage Profile
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            Update your professional information.
          </p>
        </div>

        <Card className="p-6 sm:p-8">

          <form onSubmit={handleSubmit}>

            <div className="grid gap-5 sm:grid-cols-2">

              <Input
                label="Full Name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={profile.email}
                disabled
              />

              <Input
                label="Phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                required
              />

              <Input
                label="Registration Number"
                name="registrationNumber"
                value={
                  profile.registrationNumber
                }
                disabled
              />

              <Input
                label="Qualification"
                name="qualification"
                value={profile.qualification}
                onChange={handleChange}
                required
              />

              <Input
                label="Specialization"
                name="specialization"
                value={
                  profile.specialization
                }
                onChange={handleChange}
                required
              />

              <Input
                label="Experience (Years)"
                name="experience"
                type="number"
                min="0"
                value={profile.experience}
                onChange={handleChange}
                required
              />

            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">
                  {error}
                </p>
              </div>
            )}

            {saved && !error && (
              <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">
                  ✓ Profile updated successfully.
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate("/doctor/dashboard")
                }
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

export default DoctorProfile;