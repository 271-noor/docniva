 
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { theme, toggleTheme } = useTheme();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link
          to="/"
          className="navbar-logo"
          onClick={closeMenu}
        >
          <span className="logo-icon">✚</span>
          <span>DocNiva</span>
        </Link>

        {/* Navigation */}
        <nav className={`navbar-links ${menuOpen ? "active" : ""}`}>

          <Link
            to="/"
            onClick={closeMenu}
          >
            Home
          </Link>

          <Link
            to="/patient/find-doctor"
            onClick={closeMenu}
          >
            Find a Doctor
          </Link>

          <Link
            to="/patient/appointments"
            onClick={closeMenu}
          >
            Appointments
          </Link>

          <Link
            to="/role"
            className="navbar-cta"
            onClick={closeMenu}
          >
            Get Started
          </Link>

          {/* Theme Toggle */}
          <button
            type="button"
            className="theme-toggle"
            onClick={handleThemeToggle}
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
            title={`Switch to ${
              theme === "light" ? "dark" : "light"
            } mode`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>
    </header>
  );
}

export default Navbar;
 
