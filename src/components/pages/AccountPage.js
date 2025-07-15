import React, { useState, useEffect } from "react";
import { FaEdit, FaSave, FaTimesCircle } from "react-icons/fa";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";
import Sidebar from "../SideBar";

const App = (props) => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profileType, setProfileType] = useState("");
  const [balance, setBalance] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // State variables to store original values for cancellation
  const [originalName, setOriginalName] = useState(name);
  const [originalUsername, setOriginalUsername] = useState(username);
  const [originalProfileType, setOriginalProfileType] = useState(profileType);

  const handleEditClick = () => {
    setOriginalName(name);
    setOriginalUsername(username);
    setOriginalProfileType(profileType);
    setIsEditing(true);
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/auth/getUser`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
        }
      );
      const res = await response.json();
      if (res.success) {
        setName(res.user.name);
        setUsername(res.user.userName);
        setEmail(res.user.email);
        setProfileType(res.user.profileType);
        setBalance(res.user.balance);
        setOriginalName(res.user.name);
        setOriginalUsername(res.user.userName);
        setOriginalProfileType(res.user.profileType);
      } else {
        console.error("Failed to fetch user data:", res.msg);
        props.showAlert(
          "Failed to fetch user data. Please try again later.",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      props.showAlert(
        "Error fetching user data. Please try again later.",
        "danger"
      );
    }
  };

  useEffect(() => {
    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to handle the "Save Changes" button click
  const handleSaveClick = async () => {
    if (!name || !profileType || !username) {
      props.showAlert("Please fill in all fields before saving.", "warning");
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/auth/editAccount`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name,
            userName: username,
            profileType,
          }),
        }
      );
      const res = await response.json();
      if (res.success) {
        props.showAlert(res.msg, "success");
        // Update the original values after saving
        setOriginalName(name);
        setOriginalUsername(username);
        setOriginalProfileType(profileType);
      } else {
        setName(originalName);
        setUsername(originalUsername);
        setProfileType(originalProfileType);
        console.error("Failed to Update Profile:", res.msg);
        props.showAlert("Profile update failed: " + res.msg, "danger");
      }
    } catch (error) {
      setName(originalName);
      setUsername(originalUsername);
      setProfileType(originalProfileType);
      console.error("Error fetching user data:", error);
      props.showAlert(
        "Error fetching user data. Please try again later.",
        "danger"
      );
    }
    setIsEditing(false);
  };

  // Function to handle the "Cancel" button click
  const handleCancelClick = () => {
    setName(originalName);
    setUsername(originalUsername);
    setProfileType(originalProfileType);
    setIsEditing(false); // Disable edit mode
  };

  // Helper function to determine the badge color based on account type
  const getAccountTypeBadge = (status) => {
    switch (status) {
      case "Private":
        return "bg-danger text-white";
      case "Public":
        return "bg-success text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-dark text-white">
      <Sidebar />
      <div className="container d-flex align-items-center justify-content-center py-4">
        <div
          className="card bg-dark border-secondary shadow-lg"
          style={{ maxWidth: "600px", width: "100%" }}
        >
          <div className="card-body p-4 p-md-5">
            <h2 className="card-title text-center text-info mb-4">
              Account Details
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveClick();
              }}
            >
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label htmlFor="username" className="form-label text-light">
                    UserName
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="usernameInput"
                      className="form-control bg-dark text-white border border-info focus-ring focus-ring-info"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  ) : (
                    <p
                      id="nameDisplay"
                      className="form-control-plaintext text-white fs-5"
                    >
                      {username}
                    </p>
                  )}
                </div>
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label text-light">
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      id="nameInput"
                      className="form-control bg-dark text-white border border-info focus-ring focus-ring-info"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  ) : (
                    <p
                      id="nameDisplay"
                      className="form-control-plaintext text-white fs-5"
                    >
                      {name}
                    </p>
                  )}
                </div>
                <div className="col-md-6">
                  <label htmlFor="email" className="form-label text-light">
                    Email Address
                  </label>
                  <p
                    id="emailDisplay"
                    className="form-control-plaintext text-white fs-5"
                  >
                    {email}
                  </p>
                </div>
                <div className="col-md-6">
                  <label htmlFor="balance" className="form-label text-light">
                    Account Balance
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark border-end-0 text-info">
                      <HiOutlineCurrencyRupee className="fs-5" />
                    </span>
                    <input
                      type="text"
                      id="balanceInput"
                      className="form-control bg-dark text-info border border-info-subtle cursor-not-allowed"
                      value={balance}
                      disabled
                    />
                  </div>
                </div>
                <div className="col-12">
                  <label htmlFor="membership" className="form-label text-light">
                    Profile Type
                  </label>
                  {isEditing ? (
                    <select
                      id="profileTypeSelect"
                      className="form-select bg-dark text-white border border-info focus-ring focus-ring-info"
                      value={profileType}
                      onChange={(e) => setProfileType(e.target.value)}
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  ) : (
                    <p
                      id="profileTypeDisplay"
                      className="form-control-plaintext text-white fs-5"
                    >
                      <span
                        className={`badge rounded-pill px-3 py-2 ${getAccountTypeBadge(
                          profileType
                        )}`}
                      >
                        {profileType}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-center mt-4">
                {isEditing ? (
                  <div className="d-flex gap-3">
                    <button
                      type="submit"
                      className="btn btn-success d-flex align-items-center px-4 py-2"
                    >
                      <FaSave className="me-2" /> Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary d-flex align-items-center px-4 py-2"
                      onClick={handleCancelClick}
                    >
                      <FaTimesCircle className="me-2" /> Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center px-4 py-2"
                    onClick={handleEditClick}
                  >
                    <FaEdit className="me-2" /> Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
