
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

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
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const {
      name,
      email,
      phone,
      registrationNumber,
      qualification,
      specialization,
      experience,
      password,
      confirmPassword,
    } = formData;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/doctors/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            registrationNumber: registrationNumber.trim(),
            qualification: qualification.trim(),
            specialization: specialization.trim(),
            experience: Number(experience),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Doctor registration failed. Please try again."
        );
        return;
      }

      console.log("Doctor registered:", data);

      // Doctor login page par redirect
      navigate("/doctor/login");
    } catch (error) {
      console.error("Doctor registration error:", error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[var(--soft-background)] px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto flex w-full max-w-lg items-center justify-center">
        <Card className="w-full p-6 sm:p-8">

          {/* Header */}
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

          {/* Registration Form */}
          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit}
          >
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Dr. Your Name"
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="doctor@example.com"
              required
            />

            <Input
              label="Mobile Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 XXXXX XXXXX"
              required
            />

            <Input
              label="Medical Registration Number"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              placeholder="Registration number"
              required
            />

            <Input
              label="Qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="MBBS, MD, etc."
              required
            />

            <Input
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              placeholder="e.g. Cardiologist"
              required
            />

            <Input
              label="Experience"
              name="experience"
              type="number"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Years of experience"
              min="0"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength={6}
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              minLength={6}
              required
            />

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Submit Registration"}
            </Button>
          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already registered?{" "}

            <Link
              to="/doctor/login"
              className="font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
            >
              Login
            </Link>
          </p>

        </Card>
      </div>
    </main>
  );
}

export default DoctorRegister;

