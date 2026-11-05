
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password.");
        return;
      }

      if (!data.token || !data.admin) {
        setError("Admin authentication data was not received.");
        return;
      }

      localStorage.setItem(
        "docniva-admin-token",
        data.token
      );

      localStorage.setItem(
        "docniva-admin-profile",
        JSON.stringify(data.admin)
      );

      navigate("/admin/dashboard");

    } catch (error) {
      console.error("Admin login error:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
              Admin Login
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              Login to manage your DocNiva platform.
            </p>

          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={handleSubmit}
          >

            <Input
              label="Admin Email Address"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter admin password"
              required
            />

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
              {loading ? "Logging in..." : "Login as Admin"}
            </Button>

          </form>

          <p className="mt-6 text-center text-xs text-[var(--text-secondary)]">
            Authorized administrators only.
          </p>

        </Card>

      </div>

    </main>
  );
}

export default AdminLogin;
