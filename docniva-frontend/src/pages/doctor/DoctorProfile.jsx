import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import { api } from "../../lib/api";

const selectClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20";

const emptyProfile = {
  name: "",
  email: "",
  phone: "",
  registrationNumber: "",
  qualification: "",
  specialization: "",
  experience: "",
  age: "",
  gender: "",
  city: "",
  consultationFee: "",
  about: "",
};

const getToken = () => localStorage.getItem("docniva-doctor-token");

function DoctorProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      const res = await api("/api/doctors/profile", {
        token: getToken(),
        signal: controller.signal,
      });
      if (res.aborted) return;

      if (!res.ok) {
        setError(res.data.message || "Unable to load doctor profile.");
      } else {
        setProfile({ ...emptyProfile, ...res.data.doctor });
        localStorage.setItem("docniva-doctor-profile", JSON.stringify(res.data.doctor));
      }
      setLoading(false);
    };

    load();
    return () => controller.abort();
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

    if (
      !profile.name.trim() ||
      !profile.phone.trim() ||
      !profile.qualification.trim() ||
      !profile.specialization.trim() ||
      !profile.city.trim() ||
      !profile.gender ||
      profile.experience === "" ||
      profile.age === "" ||
      profile.consultationFee === ""
    ) {
      setError("Please fill all required fields.");
      return;
    }

    setSaving(true);

    const res = await api("/api/doctors/profile", {
      method: "PUT",
      token: getToken(),
      body: {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        qualification: profile.qualification.trim(),
        specialization: profile.specialization.trim(),
        experience: Number(profile.experience),
        age: Number(profile.age),
        gender: profile.gender,
        city: profile.city.trim(),
        consultationFee: Number(profile.consultationFee),
        about: profile.about.trim(),
      },
    });

    setSaving(false);

    if (!res.ok) {
      setError(res.data.message || "Unable to update profile.");
      return;
    }

    setProfile({ ...emptyProfile, ...res.data.doctor });
    localStorage.setItem("docniva-doctor-profile", JSON.stringify(res.data.doctor));
    setSaved(true);

    // Thodi der success message dikhao, phir dashboard
    setTimeout(() => navigate("/doctor/dashboard"), 1000);
  };

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card className="p-8 text-center">
            <p className="text-[var(--text-secondary)]">Loading profile...</p>
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
          onClick={() => navigate("/doctor/dashboard")}
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">Doctor Profile</p>
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
              <Input label="Full Name" name="name" value={profile.name} onChange={handleChange} required />
              <Input label="Email" name="email" type="email" value={profile.email} disabled />
              <Input label="Phone" name="phone" value={profile.phone} onChange={handleChange} required />
              <Input label="Registration Number" name="registrationNumber" value={profile.registrationNumber} disabled />
              <Input label="Qualification" name="qualification" value={profile.qualification} onChange={handleChange} required />
              <Input label="Specialization" name="specialization" value={profile.specialization} onChange={handleChange} required />
              <Input label="Experience (Years)" name="experience" type="number" min="0" value={profile.experience} onChange={handleChange} required />
              <Input label="Age" name="age" type="number" min="21" max="90" value={profile.age} onChange={handleChange} required />

              <div>
                <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Gender
                </label>
                <select id="gender" name="gender" value={profile.gender} onChange={handleChange} required className={selectClass}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <Input label="City" name="city" value={profile.city} onChange={handleChange} placeholder="e.g. Noida" required />

              <Input label="Consultation Fee (₹100 to ₹5000)" name="consultationFee" type="number" min="100" max="5000" value={profile.consultationFee} onChange={handleChange} required />
            </div>

            <div className="mt-5">
              <label htmlFor="about" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                About You
              </label>
              <textarea
                id="about"
                name="about"
                rows="4"
                maxLength={1000}
                value={profile.about}
                onChange={handleChange}
                placeholder="Short introduction patients will see on your profile."
                className={`${selectClass} resize-none`}
              />
            </div>

            <p className="mt-3 text-xs text-[var(--text-muted)]">
              A new fee applies only to new appointments. Existing appointments keep the fee they were booked with.
            </p>

            {error && (
              <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            {saved && !error && (
              <div role="status" className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">
                  ✓ Profile updated successfully. Taking you to the dashboard...
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => navigate("/doctor/dashboard")}>
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

export default DoctorProfile;