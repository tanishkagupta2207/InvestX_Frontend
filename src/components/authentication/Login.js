import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = (props) => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    const res = await response.json();
    if (res.success) {
      localStorage.setItem("token", res.authToken);
      props.showAlert("Login Successful!", "success");
      navigate("/");
    } else {
      if (res.msg) {
        props.showAlert(res.msg, "danger");
      } else {
        props.showAlert(res.errors[0].msg, 'danger');
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
    marginTop: '160px',
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
      <h1 style={headingStyle}>Login</h1>
      <form onSubmit={handleSubmit} style={formStyle}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label" style={labelStyle}>
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            aria-describedby="emailHelp"
            onChange={onChange}
            style={inputStyle}
            value={credentials.email}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label" style={labelStyle}>
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            onChange={onChange}
            value={credentials.password}
            style={inputStyle}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={buttonStyle}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default Login;