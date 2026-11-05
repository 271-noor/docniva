
import React, { useState } from "react";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>DocNiva</h1>
        <h2 style={styles.heading}>Admin Login</h2>
        <p style={styles.subtitle}>
          Welcome back! Login to manage DocNiva.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter admin email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>

        <p style={styles.footer}>
          © 2026 DocNiva. All rights reserved.
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f0f7f8",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    padding: "40px 32px",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
  },
  logo: {
    color: "#0d9488",
    textAlign: "center",
    fontSize: "32px",
    marginBottom: "20px",
  },
  heading: {
    textAlign: "center",
    color: "#1f2937",
    marginBottom: "8px",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: "28px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#374151",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    padding: "13px",
    marginBottom: "20px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    boxSizing: "border-box",
    fontSize: "15px",
  },
  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "8px",
    background: "#0d9488",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },
  error: {
    color: "#dc2626",
    marginBottom: "15px",
    fontSize: "14px",
  },
  footer: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: "12px",
    marginTop: "25px",
  },
};

export default AdminLogin;
