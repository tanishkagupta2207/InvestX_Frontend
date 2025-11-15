import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ACCENT_COLOR = 'rgb(9, 96, 29)';

const NavBar = () => {
  let location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Check for token outside of render logic

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const loginButtonStyle = {
    color: ACCENT_COLOR, // Green border and text for login/secondary action
    borderColor: ACCENT_COLOR,
    fontWeight: "bold",
    marginRight: '10px',
    padding: '6px 15px',
    textDecoration: 'none',
  };

  const signupButtonStyle = {
    backgroundColor: ACCENT_COLOR, // Solid green background for signup/primary action
    color: "white",
    borderColor: ACCENT_COLOR,
    fontWeight: "bold",
    padding: '6px 15px',
    textDecoration: 'none',
  };

  return (
    <nav className="navbar navbar-expand-lg bg-dark navbar-dark fixed-top">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">
          <span style={{color: ACCENT_COLOR}}>InvestX</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Home Link */}
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/" ? "active" : ""
                }`}
                aria-current="page"
                to="/"
              >
                Home
              </Link>
            </li>
            {/* About Link */}
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/about" ? "active" : ""
                }`}
                to="/about"
              >
                About
              </Link>
            </li>
             {/* Contact Link */}
            <li className="nav-item">
              <Link
                className={`nav-link ${
                  location.pathname === "/contact" ? "active" : ""
                }`}
                to="/contact"
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Conditional Auth Buttons/Links */}
          <div className="d-flex">
            {token ? (
              // --- Logged In View ---
              <>
                <Link 
                  className="btn btn-outline-success me-2" 
                  to="/dashboard"
                  style={loginButtonStyle}
                >
                  Dashboard
                </Link>
                <button 
                  className="btn btn-outline-danger" 
                  onClick={handleLogout}
                  style={signupButtonStyle} // Reusing the signup style for consistency
                >
                  Logout
                </button>
              </>
            ) : (
              // --- Logged Out View ---
              <>
                <Link 
                  className="btn btn-outline-success" 
                  to="/login"
                  style={loginButtonStyle}
                >
                  Login
                </Link>
                <Link 
                  className="btn btn-success" 
                  to="/signup"
                  style={signupButtonStyle}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;