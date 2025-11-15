import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import img1 from "../../assets/background_auth.jpeg";

const ACCENT_COLOR = "rgb(9, 96, 29)"; // Signature green for buttons/accents
const MD_BREAKPOINT = 768; 

const Signup = (props) => {
  const [credentials, setCredentials] = useState({
    userName: "",
    name: "",
    email: "",
    password: "",
    cpassword: "",
    profileType: "Public",
  });
  let navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Effect to track window width for dynamic inline styling
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    credentials.profileType = isPublic ? "Public" : "Private";
    if (credentials.password !== credentials.cpassword) {
      props.showAlert("Password and Confirm Password do not match!", "danger");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      const res = await response.json();

      if (res.success) {
        localStorage.setItem("token", res.authToken);
        props.showAlert("Account created successfully!", "success");
        navigate("/dashboard");
      } else {
        props.showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error creating account:", error);
      props.showAlert(
        "Something went wrong! Please try again later.",
        "danger"
      );
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // --- Style Definitions ---
  
  const inputStyle = {
    backgroundColor: "#212529", 
    borderColor: "#495057",     
    color: "white",             
  };

  const buttonStyle = {
    backgroundColor: ACCENT_COLOR,
    color: "white",
    borderColor: ACCENT_COLOR,
    fontWeight: "bold",
  };
  
  // Custom Padding Logic
  const getPaddingStyle = () => {
    // Mobile (< 768px): 16px padding on all sides
    if (windowWidth < MD_BREAKPOINT) {
      return { padding: '16px' };
    } 
    // Tablet/Desktop (>= 768px): 40px top/bottom, 80px left/right
    else {
      return { 
        paddingTop: '15px', 
        paddingBottom: '10px',
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
      className={`container-fluid min-vh-100 ${alignmentClass}`}
      style={{ backgroundColor: "black", padding: 0 }}
    >
      <div className="row w-100">
        
        {/* Form Column: All padding controlled by the inline style returned by getPaddingStyle() */}
        <div 
          className="col-12 col-md-6 d-flex flex-column align-items-center align-items-md-start"
          style={{ ...getPaddingStyle() }}
        >
          {/* Inner Content Container: Max width control */}
          <div className="w-100" style={{ maxWidth: '400px' }}>
            <Link
              to="/"
              className="d-flex align-items-center mb-3 text-decoration-none" 
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
            <h2 className="fw-bold text-light">Create an account</h2>
            <form className="w-100" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-light" htmlFor="name">
                  Name<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  onChange={onChange}
                  value={credentials.name}
                  placeholder="Full Name"
                  required
                  style={inputStyle}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-light" htmlFor="userName">
                  UserName<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="userName"
                  name="userName"
                  onChange={onChange}
                  value={credentials.userName}
                  placeholder="UserName"
                  required
                  style={inputStyle}
                />
              </div>
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
              <div className="mb-3">
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
                  placeholder="Please pick a strong password"
                  required
                  style={inputStyle}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-light">
                  Confirm Password<span className="text-danger">*</span>
                </label>
                <input
                  type="password"
                  id="cpassword"
                  name="cpassword"
                  onChange={onChange}
                  value={credentials.cpassword}
                  aria-describedby="passwordHelpBlock"
                  className="form-control"
                  placeholder="Please retype password"
                  required
                  style={inputStyle}
                />
              </div>
              <div className="mb-4"> 
                <label className="form-label text-light">Profile Type</label>
                <div className="d-flex align-items-center">
                  <span
                    className={`me-2 fw-bold ${
                      isPublic ? "text-light" : "text-secondary"
                    }`}
                  >
                    Public
                  </span>
                  <div className="form-check form-switch mx-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="visibilityToggle"
                      checked={!isPublic}
                      onChange={() => setIsPublic(!isPublic)}
                      style={{ cursor: "pointer", backgroundColor: isPublic ? ACCENT_COLOR : '#6c757d', borderColor: isPublic ? ACCENT_COLOR : '#6c757d' }}
                    />
                  </div>
                  <span
                    className={`fw-bold ${
                      !isPublic ? "text-light" : "text-secondary"
                    }`}
                  >
                    Private
                  </span>
                </div>
                <small className="form-text text-secondary mt-1">
                  Private profiles cannot be viewed or shared publicly.
                </small>
              </div>
              <button type="submit" className="btn w-100" style={buttonStyle}>
                Sign up
              </button>
            </form>
            <p className="mt-1 text-light text-center">
              Already have an account?{" "}
              <Link to="/login" style={{ color: ACCENT_COLOR }}>
                Login
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

export default Signup;