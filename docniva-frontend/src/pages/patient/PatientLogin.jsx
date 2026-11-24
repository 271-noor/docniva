import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Button from "../../components/common/Button";
import { api } from "../../lib/api";

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
  age: "",
  gender: "",
  city: "",
  password: "",
  confirmPassword: "",
};

function PatientLogin() {
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

    const res = await api("/api/patients/login", {
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

    // Purana frontend token maangta hai, isliye abhi rakha hai
    if (res.data.token) {
      localStorage.setItem("docniva-token", res.data.token);
    }
    localStorage.setItem(
      "docniva-current-patient",
      JSON.stringify(res.data.patient)
    );

    navigate("/patient/dashboard");
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

    const registeredEmail = formData.email.trim().toLowerCase();

    setTimeout(
      () => {
        setIsSignup(false);
        setSuccess("");
        setEmail(registeredEmail);
        setPassword("");
        setFormData(emptyForm);
      },
      res.data.requiresEmailVerification ? 4000 : 1500
    );
  };

  const switchForm = (signup) => {
    setError("");
    setSuccess("");
    setIsSignup(signup);
  };

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-[#020b0a] px-4 py-10 sm:px-6">
      <div
        className={`animated-auth-container ${isSignup ? "signup-active" : ""}`}
      >
        {/* LOGIN FORM */}
        <div className="auth-form-panel login-panel" aria-hidden={isSignup}>
          <div className="w-full max-w-sm">
            <div className="mb-7 text-center">
              <span className="text-lg font-extrabold tracking-[4px] text-teal-300">
                DocNiva
              </span>

              <h1 className="mt-3 text-3xl font-extrabold text-white">
                Welcome Back!
              </h1>

              <p className="mt-2 text-sm text-teal-100/60">
                Sign in to manage your healthcare.
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
                  placeholder="you@example.com"
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
                  to="/patient/forgot-password"
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
                Sign Up
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
                Create Patient Account
              </h1>

              <p className="mt-2 text-sm text-teal-100/60">
                Create your account to manage your healthcare.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label
                  htmlFor="reg-name"
                  className="mb-1 block text-sm font-semibold text-teal-50"
                >
                  Full Name
                </label>
                <input
                  id="reg-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                  className="auth-input"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="mb-1 block text-sm font-semibold text-teal-50"
                >
                  Email Address
                </label>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="auth-input"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-mobile"
                  className="mb-1 block text-sm font-semibold text-teal-50"
                >
                  Mobile Number
                </label>
                <input
                  id="reg-mobile"
                  name="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  autoComplete="tel"
                  required
                  className="auth-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="reg-age"
                    className="mb-1 block text-sm font-semibold text-teal-50"
                  >
                    Age
                  </label>
                  <input
                    id="reg-age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Optional"
                    min="0"
                    max="120"
                    className="auth-input"
                  />
                </div>

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
                    className="auth-input"
                  >
                    <option value="">Optional</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-city"
                  className="mb-1 block text-sm font-semibold text-teal-50"
                >
                  City
                </label>
                <input
                  id="reg-city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Noida (optional)"
                  autoComplete="address-level2"
                  className="auth-input"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="mb-1 block text-sm font-semibold text-teal-50"
                >
                  Password
                </label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8+ characters, with a letter and a number"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="auth-input"
                />
              </div>

              <div>
                <label
                  htmlFor="reg-confirm"
                  className="mb-1 block text-sm font-semibold text-teal-50"
                >
                  Confirm Password
                </label>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="auth-input"
                />
              </div>

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
                {loading && isSignup ? "Creating Account..." : "Create Account →"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-teal-100/60">
              Already have an account?{" "}
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
                <span className="mb-5 inline-block text-5xl">🩺</span>
                <h2>
                  WELCOME
                  <br />
                  BACK!
                </h2>
                <p>
                  Your health matters to us. Login to manage your appointments,
                  medical records and healthcare journey.
                </p>
              </>
            ) : (
              <>
                <span className="mb-5 inline-block text-5xl">💚</span>
                <h2>
                  HELLO,
                  <br />
                  FRIEND!
                </h2>
                <p>
                  Welcome to DocNiva. Your healthcare journey starts here. We
                  are happy to have you with us.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default PatientLogin;