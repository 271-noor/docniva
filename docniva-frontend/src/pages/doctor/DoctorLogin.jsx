import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Button from "../../components/common/Button";
import { api } from "../../lib/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  age: "",
  gender: "",
  city: "",
  registrationNumber: "",
  qualification: "",
  specialization: "",
  experience: "",
  password: "",
  confirmPassword: "",
};

function DoctorLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isSignup, setIsSignup] = useState(searchParams.get("signup") === "1");

  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Registration state
  const [formData, setFormData] = useState(emptyForm);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------- LOGIN ----------
  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    const res = await api("/api/doctors/login", {
      method: "POST",
      body: {
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      },
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.data.message || "Invalid email or password.");
      return;
    }

    if (!res.data.doctor) {
      setError("Doctor profile was not received from server.");
      return;
    }

    // Purana frontend token maangta hai, isliye abhi rakha hai
    if (res.data.token) {
      localStorage.setItem("docniva-doctor-token", res.data.token);
    }
    localStorage.setItem("docniva-doctor-id", res.data.doctor.id);
    localStorage.setItem(
      "docniva-doctor-profile",
      JSON.stringify(res.data.doctor)
    );

    navigate("/doctor/dashboard");
  };

  // ---------- REGISTER ----------
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setError("");
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (loading) return;

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
      setError(res.data.message || "Registration failed. Please try again.");
      return;
    }

    setSuccess(
      res.data.message ||
        "Registration submitted. You can log in once our team verifies your account."
    );

    const registeredEmail = formData.email.trim().toLowerCase();

    setTimeout(() => {
      setIsSignup(false);
      setSuccess("");
      setEmail(registeredEmail);
      setPassword("");
      setFormData(emptyForm);
    }, 3500);
  };

  const switchForm = (signup) => {
    setError("");
    setSuccess("");
    setIsSignup(signup);
  };

  const field = (id, label, props = {}) => (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-semibold text-teal-50"
      >
        {label}
      </label>
      <input
        id={id}
        value={formData[props.name]}
        onChange={handleChange}
        className="auth-input"
        {...props}
      />
    </div>
  );

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-[#020b0a] px-4 py-10 sm:px-6">
      <div
        className={`animated-auth-container doctor-auth ${
          isSignup ? "signup-active" : ""
        }`}
      >
        {/* LOGIN FORM */}
        <div className="auth-form-panel login-panel" aria-hidden={isSignup}>
          <div className="w-full max-w-sm">
            <div className="mb-7 text-center">
              <span className="text-lg font-extrabold tracking-[4px] text-teal-300">
                DocNiva
              </span>

              <h1 className="mt-3 text-3xl font-extrabold text-white">
                Doctor Login
              </h1>

              <p className="mt-2 text-sm text-teal-100/60">
                Access your professional account.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-2 block text-sm font-semibold text-teal-50"
                >
                  Email Address
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@example.com"
                  autoComplete="email"
                  required
                  className="auth-input"
                />
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-2 block text-sm font-semibold text-teal-50"
                >
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="auth-input"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm text-teal-100/70">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 accent-teal-400"
                  />
                  Remember me
                </label>

                <Link
                  to="/doctor/forgot-password"
                  className="text-sm font-semibold text-teal-300 hover:text-white"
                >
                  Forgot Password?
                </Link>
              </div>

              {error && !isSignup && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-400/30 bg-red-950/50 p-3 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading && !isSignup ? "Logging in..." : "Login →"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-teal-100/60">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchForm(true)}
                className="font-bold text-teal-300 hover:text-white"
              >
                Register
              </button>
            </p>
          </div>
        </div>

        {/* REGISTRATION FORM */}
        <div className="auth-form-panel signup-panel" aria-hidden={!isSignup}>
          <div className="w-full max-w-sm">
            <div className="mb-5 text-center">
              <span className="text-lg font-extrabold tracking-[4px] text-teal-300">
                DocNiva
              </span>

              <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                Doctor Registration
              </h1>

              <p className="mt-2 text-sm text-teal-100/60">
                Create your professional DocNiva account.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              {field("reg-name", "Full Name", {
                name: "name",
                placeholder: "Dr. Your Name",
                autoComplete: "name",
                required: true,
              })}

              {field("reg-email", "Email Address", {
                name: "email",
                type: "email",
                placeholder: "doctor@example.com",
                autoComplete: "email",
                required: true,
              })}

              {field("reg-phone", "Mobile Number", {
                name: "phone",
                type: "tel",
                placeholder: "+91 XXXXX XXXXX",
                autoComplete: "tel",
                required: true,
              })}

              <div className="grid grid-cols-2 gap-3">
                {field("reg-age", "Age", {
                  name: "age",
                  type: "number",
                  placeholder: "Your age",
                  min: "21",
                  max: "90",
                  required: true,
                })}

                <div>
                  <label
                    htmlFor="reg-gender"
                    className="mb-1 block text-sm font-semibold text-teal-50"
                  >
                    Gender
                  </label>
                  <select
                    id="reg-gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {field("reg-city", "City", {
                name: "city",
                placeholder: "e.g. Noida",
                autoComplete: "address-level2",
                required: true,
              })}

              {field("reg-regno", "Medical Registration Number", {
                name: "registrationNumber",
                placeholder: "Registration number",
                required: true,
              })}

              {field("reg-qualification", "Qualification", {
                name: "qualification",
                placeholder: "MBBS, MD, etc.",
                required: true,
              })}

              {field("reg-specialization", "Specialization", {
                name: "specialization",
                placeholder: "e.g. Cardiologist",
                required: true,
              })}

              {field("reg-experience", "Experience (years)", {
                name: "experience",
                type: "number",
                placeholder: "Years of experience",
                min: "0",
                max: "70",
                required: true,
              })}

              {field("reg-password", "Password", {
                name: "password",
                type: "password",
                placeholder: "8+ characters, with a letter and a number",
                autoComplete: "new-password",
                minLength: 8,
                required: true,
              })}

              {field("reg-confirm", "Confirm Password", {
                name: "confirmPassword",
                type: "password",
                placeholder: "Confirm your password",
                autoComplete: "new-password",
                minLength: 8,
                required: true,
              })}

              {error && isSignup && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-400/30 bg-red-950/50 p-3 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="rounded-xl border border-teal-300/30 bg-teal-950/50 p-3 text-sm text-teal-200"
                >
                  {success}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={loading || Boolean(success)}
                className="w-full"
              >
                {loading && isSignup
                  ? "Submitting..."
                  : "Submit Registration →"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-teal-100/60">
              Already registered?{" "}
              <button
                type="button"
                onClick={() => switchForm(false)}
                className="font-bold text-teal-300 hover:text-white"
              >
                Login
              </button>
            </p>
          </div>
        </div>

        {/* OVERLAY PANEL */}
        <div className="auth-overlay" aria-hidden="true">
          <div className="overlay-content">
            {!isSignup ? (
              <>
                <span className="mb-5 inline-block text-5xl">👨‍⚕️</span>
                <h2>
                  WELCOME
                  <br />
                  DOCTOR!
                </h2>
                <p>
                  Login to manage your schedule, appointments and patients in
                  one place.
                </p>
              </>
            ) : (
              <>
                <span className="mb-5 inline-block text-5xl">🩺</span>
                <h2>
                  JOIN
                  <br />
                  DOCNIVA!
                </h2>
                <p>
                  Register your practice. Our team verifies every doctor before
                  the account goes live.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default DoctorLogin;