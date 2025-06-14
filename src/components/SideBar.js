import React, { useEffect } from "react";
import { Link, NavLink } from 'react-router-dom';
import {
  IoHomeOutline,
  IoTicketOutline,
  IoPeopleOutline,
  IoNotificationsOutline,
  IoPersonOutline,
  IoLogOutOutline,
} from 'react-icons/io5'; 

import { AiOutlineStock } from 'react-icons/ai';

const SideBar = () => {
  // TODO: Replace with actual unread notifications count
  const unreadNotifications = 10; // Example unread notifications count
  const [userInfo, setUserInfo] = React.useState(null);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/auth/getUser`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          'auth-token': `${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUserInfo(data.user);
      } else {
        console.error("Error fetching user info:", data.msg);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  useEffect(() => {
    fetchUserInfo();
  }
  , []);

  return (
    <div
    className="sidebar-container vh-100 position-fixed top-0 start-0 bg-dark border-end border-secondary"
    style={{ width: '280px', zIndex: 1030 }}
    data-bs-theme="dark"
  >
    <div className="d-flex flex-column p-4 h-100">

      <div className="sidebar-brand mb-4">
        <Link to="/" className="h4 text-decoration-none text-white fw-bold">
          InvestX
        </Link>
      </div>

      <nav className="nav flex-column gap-2">
        <NavLink className="nav-link link-light d-flex align-items-center" to="/dashboard">
          <IoHomeOutline className="me-2" /> Home
        </NavLink>
        <NavLink className="nav-link link-light d-flex align-items-center" to="/trade">
          <AiOutlineStock  className="me-2" /> Trade
        </NavLink>
        <NavLink className="nav-link link-light d-flex align-items-center" to="/orders">
          <IoTicketOutline className="me-2" /> Orders
        </NavLink>
        <NavLink className="nav-link link-light d-flex align-items-center" to="/transactions">
          <IoPeopleOutline className="me-2" /> Transactions
        </NavLink>

        <button
          className="nav-link text-light d-flex align-items-center text-start position-relative" // Added text-light
          onClick={()=>{}}
          aria-label="Notifications"
        >
          <IoNotificationsOutline className="me-2" />
          Notifications
            <span className="position-absolute top-50 start-100 translate-middle badge rounded-pill bg-primary border border-light" style={{ transform: 'translate(5px, -50%)' }}> {/* Added border */}
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
              <span className="visually-hidden">unread messages</span>
            </span>
        </button>
      </nav>

      <div className="mt-auto d-flex flex-column gap-2">
        <NavLink
          title={userInfo?.name ?? 'User account'}
          className="nav-link link-light d-flex align-items-center gap-1"
          to="/account"
        >
          {userInfo ? (
            <>
              <IoPersonOutline className="me-1" />
              {userInfo.name?.split(" ")[0] || 'User'}
            </>
          ) : (
            <>
              <IoPersonOutline className="me-1" /> Account
            </>
          )}
        </NavLink>
        <button
           className="nav-link text-light d-flex align-items-center text-start"
           onClick={handleLogout}
        >
          <IoLogOutOutline className="me-2" /> Logout
        </button>
      </div>
    </div>
  </div>
  );
};

export default SideBar;
