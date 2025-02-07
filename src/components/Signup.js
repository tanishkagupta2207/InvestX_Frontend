import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = (props) => {
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (credentials.password !== credentials.cpassword) {
      props.showAlert("Password and Confirm Password do not match!", "danger");
      return;
    }
    const response = await fetch(
      `${process.env.REACT_APP_HOST_URL}api/auth/createUser`,
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
      navigate("/");
    } else {
      if (res.msg) {
        props.showAlert(res.msg, "danger");
      } else {
        props.showAlert(res.errors[0].msg, "danger");
      }
    }
  };

  const onChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const containerStyle = {
    maxWidth: '500px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: 'rgba(114, 113, 113, 0.15)',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
    marginTop: '105px',
    color: 'rgb(0, 0, 0)',
  };

  const headingStyle = {
    textAlign: 'center',
    color: '#291a40',
    marginBottom: '20px',
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
  };

  const labelStyle = {
    marginBottom: '8px',
    color: '#333',
  };

  const inputStyle = {
    marginBottom: '16px',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  };

  const buttonStyle = {
    padding: '10px',
    backgroundColor: 'rgb(0, 0, 0)',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>Create Account</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label" style={labelStyle}>
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            required
            name="name"
            onChange={onChange}
            value={credentials.name}
            style={inputStyle}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label" style={labelStyle}>
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            required
            aria-describedby="emailHelp"
            onChange={onChange}
            value={credentials.email}
            style={inputStyle}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label" style={labelStyle}>
            Password
          </label>
          <input
            type="password"
            name="password"
            className="form-control"
            id="password"
            onChange={onChange}
            required
            minLength={5}
            value={credentials.password}
            style={inputStyle}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cpassword" className="form-label" style={labelStyle}>
            Confirm Password
          </label>
          <input
            type="password"
            name="cpassword"
            className="form-control"
            id="cpassword"
            onChange={onChange}
            required
            minLength={5}
            value={credentials.cpassword}
            style={inputStyle}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={buttonStyle}>
          Submit
        </button>
      </form>
    </div>
  );
};

export default Signup;