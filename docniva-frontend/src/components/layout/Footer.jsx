
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">
          <Link
            to="/"
            className="footer-logo"
          >
            <span className="footer-logo-icon">
              ✚
            </span>

            <span>DocNiva</span>
          </Link>

          <p>
            Healthcare, connected.
            <br />
            Find the right doctor and manage your
            healthcare with ease.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-links">
          <h3>Quick Links</h3>

          <Link to="/">
            Home
          </Link>

          <Link to="/role">
            Find a Doctor
          </Link>

          <Link to="/role">
            Appointments
          </Link>
        </div>

        {/* Account Links */}
        <div className="footer-links">
          <h3>For You</h3>

          <Link to="/patient/login">
            Patient Login
          </Link>

          <Link to="/patient/register">
            Patient Register
          </Link>

          <Link to="/doctor/login">
            Doctor Login
          </Link>

          <Link to="/doctor/register">
            Doctor Register
          </Link>
        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} DocNiva. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

