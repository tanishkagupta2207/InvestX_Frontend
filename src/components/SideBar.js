import React, { useEffect, useState } from "react";
import { Link, NavLink } from 'react-router-dom';
import {
  IoHomeOutline,
  IoTicketOutline,
  IoPersonOutline,
  IoLogOutOutline,
  IoMenuOutline, 
  IoCloseOutline,
  IoListOutline,
  IoCashOutline,
  IoChatbox
} from 'react-icons/io5'; 
import { AiOutlineStock } from 'react-icons/ai';
import { MdAccountBalance } from "react-icons/md";


// --- Responsive Breakpoint Constant ---
// We will use 992px (lg breakpoint) as the threshold for the full fixed sidebar.
const LARGE_SCREEN_MIN_WIDTH = 992;
const SIDEBAR_WIDTH = '280px';
const ACCENT_COLOR = 'rgb(9, 96, 29)';

const SideBar = () => {
  const [userInfo, setUserInfo] = useState(null);
  
  // State to handle the visibility/collapsed state, primarily for small screens
  const [isMobileOpen, setIsMobileOpen] = useState(false); 

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
  
  // New handler to close mobile menu after click
  const handleLinkClick = () => {
      if (window.innerWidth < LARGE_SCREEN_MIN_WIDTH) {
          setIsMobileOpen(false);
      }
  }

  useEffect(() => {
    fetchUserInfo();
  }
  , []);

  const sidebarLeftPosition = 
      (window.innerWidth >= LARGE_SCREEN_MIN_WIDTH) ? '0' :
      (isMobileOpen ? '0' : `-${SIDEBAR_WIDTH}`);

  return (
    <>
      {/* --- MOBILE TOGGLE BUTTON (Visible only on small screens) --- */}
      <button 
        className="btn btn-dark d-lg-none position-fixed top-0 start-0 m-3"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-controls="sidebar-menu"
        aria-expanded={isMobileOpen}
        style={{ zIndex: 1040 }} 
      >
        {isMobileOpen ? <IoCloseOutline size={24} /> : <IoMenuOutline size={24} />}
      </button>
      {/* --- MOBILE OVERLAY --- */}
      {isMobileOpen && (
          <div 
              className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark"
              style={{ zIndex: 1030, opacity: 0.5 }} 
              onClick={() => setIsMobileOpen(false)}
          ></div>
      )}

      {/* --- MAIN SIDEBAR CONTAINER --- */}
      <div
          className={`sidebar-container vh-100 position-fixed top-0 bg-dark border-end border-secondary ${window.innerWidth < LARGE_SCREEN_MIN_WIDTH ? 'd-block' : ''}`
          } 
          style={{ 
              width: SIDEBAR_WIDTH, 
              zIndex: 1038,
              left: sidebarLeftPosition, 
              transition: 'left 0.3s ease-in-out'
          }}
          data-bs-theme="dark"
          id="sidebar-menu"
      >
          <div className="d-flex flex-column p-4 h-100">

              <div className="sidebar-brand mb-4" style={{color: ACCENT_COLOR}}>
                  <Link to="/" className="h4 text-decoration-none text-white fw-bold" style={{color: ACCENT_COLOR}}>
                      <span style={{color: ACCENT_COLOR}}>InvestX</span>
                  </Link>
              </div>

              <nav className="nav flex-column gap-2">
                  <NavLink className="nav-link link-light d-flex align-items-center" to="/dashboard" onClick={handleLinkClick}>
                      <IoHomeOutline className="me-2" /> Home
                  </NavLink>
                  <NavLink className="nav-link link-light d-flex align-items-center" to="/stocks" onClick={handleLinkClick}>
                      <AiOutlineStock  className="me-2" /> Stocks
                  </NavLink>
                  <NavLink className="nav-link link-light d-flex align-items-center" to="/mutualFunds" onClick={handleLinkClick}>
                      <MdAccountBalance className="me-2" /> Mutual Funds
                  </NavLink>
                  <NavLink className="nav-link link-light d-flex align-items-center" to="/orders" onClick={handleLinkClick}>
                      <IoTicketOutline className="me-2" /> Orders
                  </NavLink>
                  <NavLink className="nav-link link-light d-flex align-items-center" to="/transactions" onClick={handleLinkClick}>
                      <IoCashOutline className="me-2" /> Transactions
                  </NavLink>
                  <NavLink className="nav-link link-light d-flex align-items-center" to="/watchList" onClick={handleLinkClick}>
                      <IoListOutline className="me-2" /> Watchlist
                  </NavLink>
                  <NavLink className="nav-link link-light d-flex align-items-center" to="/chat" onClick={handleLinkClick}>
                      <IoChatbox className="me-2" /> Chat
                  </NavLink>
              </nav>

              <div className="mt-auto d-flex flex-column gap-2">
                  <NavLink
                      title={userInfo?.name ?? 'User account'}
                      className="nav-link link-light d-flex align-items-center gap-1"
                      to="/account"
                      onClick={handleLinkClick}
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
      {/* Note: You must update your main content wrapper to use a responsive margin/padding like ms-lg-280px */}
    </>
  );
};

export default SideBar;