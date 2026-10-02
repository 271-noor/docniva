import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

function PatientProfile() {
const navigate = useNavigate();

const [profile, setProfile] = useState({
name: "Patient Name",
email: "[patient@example.com](mailto:patient@example.com)",
mobile: "",
age: "",
gender: "",
city: "",
});

const [saved, setSaved] = useState(false);

const handleChange = (event) => {
const { name, value } = event.target;

 
setProfile((prev) => ({
  ...prev,
  [name]: value,
}));

setSaved(false);
 

};

const handleSubmit = (event) => {
event.preventDefault();

 
// Backend profile API will be connected here later.
setSaved(true);
 

};

return ( <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-8 sm:px-6 sm:py-10 lg:px-8"> <div className="mx-auto max-w-4xl">

 
    {/* Back */}
    <button
      type="button"
      onClick={() => navigate("/patient/dashboard")}
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

            <Input
              label="Full Name"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Mobile Number"
              name="mobile"
              type="tel"
              value={profile.mobile}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
            />

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
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <Input
              label="City"
              name="city"
              value={profile.city}
              onChange={handleChange}
              placeholder="Enter your city"
            />

          </div>
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
            onClick={() => navigate("/patient/dashboard")}
          >
            Cancel
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

export default PatientProfile;
