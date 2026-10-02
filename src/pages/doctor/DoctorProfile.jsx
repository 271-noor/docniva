
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

const defaultProfile = {
  name: "Dr. Rozy",
  specialization: "Cardiologist",
  qualification: "MBBS, MD Cardiology",
  experience: "8 years",
  location: "Agra",
  fee: "₹800",
  about:
    "Experienced cardiologist focused on providing personalized cardiac care and helping patients maintain a healthy heart.",
};

function DoctorProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(() => {
    const savedProfile = localStorage.getItem("docniva-doctor-profile");

    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (error) {
        console.error("Invalid doctor profile data:", error);
      }
    }

    return defaultProfile;
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    localStorage.setItem(
      "docniva-doctor-profile",
      JSON.stringify(profile)
    );

    setSaved(true);
  };

  const handleReset = () => {
    setProfile(defaultProfile);
    localStorage.setItem(
      "docniva-doctor-profile",
      JSON.stringify(defaultProfile)
    );
    setSaved(true);
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/doctor/dashboard")}
          className="mb-6 text-sm font-medium text-[var(--primary)] hover:underline"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="font-semibold text-[var(--primary)]">
            Doctor Profile
          </p>

          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Manage Your Profile
          </h1>

          <p className="mt-2 text-[var(--text-secondary)]">
            Update your professional information and consultation details.
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            Profile saved successfully.
          </div>
        )}

        {/* Profile Form */}
        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Basic Information
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">

                <Input
                  label="Doctor Name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter doctor name"
                  required
                />

                <Input
                  label="Specialization"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Cardiologist"
                  required
                />

                <Input
                  label="Qualification"
                  name="qualification"
                  value={profile.qualification}
                  onChange={handleChange}
                  placeholder="e.g. MBBS, MD"
                  required
                />

                <Input
                  label="Experience"
                  name="experience"
                  value={profile.experience}
                  onChange={handleChange}
                  placeholder="e.g. 8 years"
                  required
                />

                <Input
                  label="Location"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder="e.g. Agra"
                  required
                />

                <Input
                  label="Consultation Fee"
                  name="fee"
                  value={profile.fee}
                  onChange={handleChange}
                  placeholder="e.g. ₹800"
                  required
                />

              </div>
            </div>

            {/* About */}
            <div className="border-t border-[var(--border)] pt-6">
              <label
                htmlFor="about"
                className="mb-2 block text-sm font-medium text-[var(--text-primary)]"
              >
                About Doctor
              </label>

              <textarea
                id="about"
                name="about"
                rows="5"
                value={profile.about}
                onChange={handleChange}
                placeholder="Write something about your professional experience..."
                className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-text)] outline-none transition placeholder:text-[var(--input-placeholder)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>

            {/* Preview */}
            <div className="border-t border-[var(--border)] pt-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Profile Preview
              </h2>

              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--soft-background)] p-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary-light)] text-3xl">
                    👨‍⚕️
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">
                      {profile.name}
                    </h3>

                    <p className="mt-1 font-medium text-[var(--primary)]">
                      {profile.specialization}
                    </p>

                    <p className="mt-2 text-sm text-[var(--text-secondary)]">
                      {profile.qualification} · {profile.experience}
                    </p>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      📍 {profile.location}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                      Consultation Fee: {profile.fee}
                    </p>
                  </div>

                </div>

                {profile.about && (
                  <div className="mt-5 border-t border-[var(--border)] pt-4">
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                      {profile.about}
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:justify-end">

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/doctor/dashboard")}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
              >
                Reset
              </Button>

              <Button type="submit">
                Save Changes
              </Button>

            </div>

          </form>
        </Card>

      </div>
    </main>
  );
}

export default DoctorProfile;

