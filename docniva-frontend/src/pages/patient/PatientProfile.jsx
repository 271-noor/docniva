import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import { api } from "../../lib/api";

const selectClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20";

const getToken = () => localStorage.getItem("docniva-token");

const toForm = (patient) => ({
  name: patient.name || "",
  email: patient.email || "",
  mobile: patient.phone || "",
  age: patient.age !== undefined && patient.age !== null ? String(patient.age) : "",
  gender: patient.gender || "",
  city: patient.city || "",
});

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

  const handleSessionExpired = () => {
    localStorage.removeItem("docniva-token");
    localStorage.removeItem("docniva-current-patient");
    navigate("/patient/login");
  };

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      const res = await api("/api/patients/profile", {
        token: getToken(),
        signal: controller.signal,
      });
      if (res.aborted) return;

      if (res.status === 401) {
        handleSessionExpired();
        return;
      }

      if (!res.ok) {
        setError(res.data.message || "Failed to load profile");
      } else if (res.data.patient) {
        setProfile(toForm(res.data.patient));
        localStorage.setItem("docniva-current-patient", JSON.stringify(res.data.patient));
      }
      setLoading(false);
    };

    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    setSaved(false);
    setError("");

    if (!profile.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!profile.mobile.trim()) {
      setError("Mobile number is required.");
      return;
    }

    let ageValue = "";
    if (profile.age !== "") {
      const ageNumber = Number(profile.age);
      if (!Number.isInteger(ageNumber) || ageNumber < 0 || ageNumber > 120) {
        setError("Age must be a whole number between 0 and 120.");
        return;
      }
      ageValue = ageNumber;
    }

    setSaving(true);

    // Khali field "" bhejne par backend use DB se hata deta hai
    const res = await api("/api/patients/profile", {
      method: "PUT",
      token: getToken(),
      body: {
        name: profile.name.trim(),
        phone: profile.mobile.trim(),
        age: ageValue,
        gender: profile.gender,
        city: profile.city.trim(),
      },
    });

    setSaving(false);

    if (res.status === 401) {
      handleSessionExpired();
      return;
    }

    if (!res.ok) {
      setError(res.data.message || "Failed to update profile");
      return;
    }

    if (res.data.patient) {
      setProfile(toForm(res.data.patient));
      localStorage.setItem("docniva-current-patient", JSON.stringify(res.data.patient));
    }

    setSaved(true);
    setTimeout(() => navigate("/patient/dashboard"), 1000);
  };

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
        <button
          type="button"
          onClick={() => navigate("/patient/dashboard")}
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">Patient Profile</p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Manage Your Profile
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Update your personal information.
          </p>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-600">{error}</p>
          </div>
        )}

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Personal Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Input label="Full Name" name="name" value={profile.name} onChange={handleChange} placeholder="Enter your full name" required />

                <Input label="Email Address" name="email" type="email" value={profile.email} placeholder="you@example.com" disabled />

                <Input label="Mobile Number" name="mobile" type="tel" value={profile.mobile} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />

                <Input label="Age" name="age" type="number" value={profile.age} onChange={handleChange} placeholder="Enter your age" min="0" max="120" />

                <div>
                  <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                    Gender
                  </label>
                  <select id="gender" name="gender" value={profile.gender} onChange={handleChange} className={selectClass}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <Input label="City" name="city" value={profile.city} onChange={handleChange} placeholder="Enter your city" />
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--soft-background)] p-4">
              <p className="text-sm leading-6 text-[var(--text-secondary)]">
                Email address cannot be changed from this page. Name, mobile
                number, age, gender and city can be updated.
              </p>
            </div>

            {saved && (
              <div role="status" className="rounded-xl border border-[var(--border)] bg-[var(--primary-light)] p-4">
                <p className="text-sm font-medium text-[var(--primary)]">
                  ✓ Profile updated successfully. Taking you to the dashboard...
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/patient/dashboard")} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || saved}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}

export default PatientProfile;