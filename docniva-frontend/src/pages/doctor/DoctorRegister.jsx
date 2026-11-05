import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import { api } from "../../lib/api";

const selectClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20";

function DoctorRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
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
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.gender) {
      setError("Please select your gender.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await api("/api/doctors/register", {
      method: "POST",
      body: {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        registrationNumber: formData.registrationNumber.trim(),
        qualification: formData.qualification.trim(),
        specialization: formData.specialization.trim(),
        experience: Number(formData.experience),
        age: Number(formData.age),
        gender: formData.gender,
        city: formData.city.trim(),
        password: formData.password,
      },
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.data.message || "Doctor registration failed. Please try again.");
      return;
    }

    setSuccess(
      res.data.message ||
        "Registration submitted. You can log in once our team verifies your account."
    );
    setTimeout(() => navigate("/doctor/login"), 2500);
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto flex w-full max-w-lg items-center justify-center">
        <Card className="w-full p-6 sm:p-8">
          <div className="text-center">
            <span className="inline-block font-semibold text-[var(--primary)]">
              DocNiva
            </span>
            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Doctor Registration
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Create your professional DocNiva account.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Dr. Your Name" required />

            <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="doctor@example.com" required />

            <Input label="Mobile Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />

            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Your age" min="21" max="90" required />

              <div>
                <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Gender
                </label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className={selectClass}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Noida" required />

            <Input label="Medical Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="Registration number" required />

            <Input label="Qualification" name="qualification" value={formData.qualification} onChange={handleChange} placeholder="MBBS, MD, etc." required />

            <Input label="Specialization" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g. Cardiologist" required />

            <Input label="Experience" name="experience" type="number" value={formData.experience} onChange={handleChange} placeholder="Years of experience" min="0" required />

            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="At least 8 characters, letter and number" minLength={8} required />

            <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" minLength={8} required />

            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading || Boolean(success)}>
              {loading ? "Creating Account..." : "Submit Registration"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already registered?{" "}
            <Link to="/doctor/login" className="font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}

export default DoctorRegister;