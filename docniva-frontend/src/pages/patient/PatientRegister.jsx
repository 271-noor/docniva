import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import { api } from "../../lib/api";

const selectClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-4 py-3 text-sm text-[var(--input-text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20";

function PatientRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
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
    if (loading) return;

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const body = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.mobile.trim(),
      password: formData.password,
    };

    // Ye teen optional hain, bhare ho tabhi bhejo
    if (formData.age !== "") body.age = Number(formData.age);
    if (formData.gender) body.gender = formData.gender;
    if (formData.city.trim()) body.city = formData.city.trim();

    setLoading(true);
    setError("");

    const res = await api("/api/patients/register", { method: "POST", body });

    setLoading(false);

    if (!res.ok) {
      setError(res.data.message || "Registration failed. Please try again.");
      return;
    }

    setSuccess(res.data.message || "Registration successful.");

    // Email verification chalu ho to user ko mail check karne ka message dikhao
    setTimeout(
      () => navigate("/patient/login"),
      res.data.requiresEmailVerification ? 4000 : 1500
    );
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto flex w-full max-w-md items-center justify-center">
        <Card className="w-full p-6 sm:p-8">
          <div className="text-center">
            <span className="inline-block font-semibold text-[var(--primary)]">
              DocNiva
            </span>
            <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
              Create Patient Account
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Create your account to manage your healthcare.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" required />

            <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />

            <Input label="Mobile Number" name="mobile" type="tel" value={formData.mobile} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />

            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} placeholder="Your age" min="0" max="120" required />

              <div>
                <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                  Gender 
                </label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={selectClass}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Noida" />

            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="At least 8 characters, letter and number" required minLength={8} />

            <Input label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm your password" required minLength={8} />

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
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link to="/patient/login" className="font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}

export default PatientRegister;