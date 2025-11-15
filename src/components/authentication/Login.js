import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import img1 from "../../assets/background_auth.jpeg";

const ACCENT_COLOR = "rgb(9, 96, 29)"; // Signature green for buttons/accents
const MD_BREAKPOINT = 768; 

const Login = (props) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  let navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Effect to track window width for dynamic inline styling
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      // Handle non-200 responses
      if (!response.ok) {
        // Attempt to parse JSON error message if available
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.msg || `HTTP error! Status: ${response.status}`);
      }

      const res = await response.json();

      if (res.success) {
        localStorage.setItem("token", res.authToken);
        props.showAlert("Login Successful!", "success");
        navigate("/dashboard");
      } else {
        props.showAlert(
          res.msg ||
          (res.errors && res.errors[0]?.msg) ||
          "Invalid credentials",
          "danger"
        );
      }
    } catch (error) {
      console.error("Login failed:", error.message);
      props.showAlert(
        "Login failed. Please check your credentials.",
        "danger"
      );
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // --- Style Definitions ---
  const inputStyle = {
    backgroundColor: "#212529", // Darker input background
    borderColor: "#495057",     // Subtle border
    color: "white",             // White text inside input
  };

  const buttonStyle = {
    backgroundColor: ACCENT_COLOR,
    color: "white",
    borderColor: ACCENT_COLOR,
    fontWeight: "bold",
  };

  // Custom Padding Logic (Matching Signup.js)
  const getPaddingStyle = () => {
    // Mobile (< 768px): 16px padding on all sides
    if (windowWidth < MD_BREAKPOINT) {
      return { padding: '16px' };
    } 
    // Tablet/Desktop (>= 768px): 40px top/bottom, 80px left/right
    else {
      return { 
        paddingTop: '40px', 
        paddingBottom: '40px',
        paddingLeft: '80px',
        paddingRight: '80px',
      };
    }
  };

  // Custom Alignment Logic: Center vertically on mobile, top-align on desktop
  const alignmentClass = windowWidth < MD_BREAKPOINT 
    ? "d-flex align-items-center justify-content-center" 
    : "d-flex align-items-start justify-content-center"; 

  return (
    <div
      // Use the calculated alignment class
      className={`container-fluid min-vh-100 ${alignmentClass}`}
      style={{ backgroundColor: "black", padding: 0 }}
    >
      <div className="row w-100">
        
        {/* Form Column: Using inline styles for padding control */}
        <div 
          className="col-12 col-md-6 d-flex flex-column align-items-center align-items-md-center justify-content-center"
          style={{ ...getPaddingStyle() }}
        >
          {/* Inner Content Container: Max width control */}
          <div className="w-100" style={{ maxWidth: '400px' }}>
            <Link
              to="/"
              className="d-flex align-items-center mb-4 text-decoration-none"
              style={{ color: ACCENT_COLOR, fontWeight: 'bold' }} 
            >
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                height="24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
                className="me-2"
              >
                <path fill="none" d="M0 0h24v24H0V0z"></path>
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
              </svg>
              Go back
            </Link>
            <h2 className="mb-4 fw-bold text-light">Login to your account</h2>
            <form className="w-100" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-light" htmlFor="email">
                  Email<span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  onChange={onChange}
                  value={credentials.email}
                  placeholder="example@email.com"
                  required
                  style={inputStyle}
                />
              </div>
              <div className="mb-4"> {/* Increased spacing before the button */}
                <label className="form-label text-light" htmlFor="password">
                  Password<span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  onChange={onChange}
                  value={credentials.password}
                  aria-describedby="passwordHelpBlock"
                  className="form-control"
                  placeholder="Please enter your password"
                  required
                  style={inputStyle}
                />
              </div>
              <button type="submit" className="btn w-100" style={buttonStyle}>
                Login
              </button>
            </form>
            <p className="mt-3 text-light text-center">
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: ACCENT_COLOR }}>
                Register
              </Link>
            </p>
          </div>
        </div>

        {/* Image Panel */}
        <div
          className="col-md-6 d-none d-md-block position-relative text-white text-center p-0"
          style={{
            backgroundImage: `url(${img1})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100vh",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Login;