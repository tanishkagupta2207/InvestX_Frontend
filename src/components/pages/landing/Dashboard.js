import React from "react";
import { useEffect, useState} from "react";
import SideBar from "../../SideBar";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  registerables,
} from "chart.js";

import { usePortfolioData } from "../portfolioComponents/UsePortfolioData"; 
import StockAnalysis from "../portfolioComponents/StockAnalysis";
import AssetCards from "../portfolioComponents/AssetCards";
import PortfolioAllocationChart from "../portfolioComponents/PortfolioAllocationChart";
import MutualFundHoldingsAnalysis from "../portfolioComponents/MutualFundsAnalysis";

ChartJS.register(ArcElement, Tooltip, Legend, ...registerables);

const availableColors = [
  "rgba(255, 99, 132,1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
  "rgba(173, 216, 230, 1)", // Light Blue
  "rgba(255, 160, 122, 1)", // Light Salmon
  "rgba(144, 238, 144, 1)", // Light Green
  "rgba(255, 255, 0, 1)", // Yellow
];

// Define a constant for the sidebar width and breakpoint (992px for Bootstrap's lg)
const SIDEBAR_WIDTH = '280px';
const LG_BREAKPOINT = 992;

const Dashboard = (props) => {
  const token = localStorage.getItem("token");

  // State to manage the window width for conditional rendering
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // *** STATE FOR TAB MANAGEMENT ***
  const [activeTab, setActiveTab] = useState('stocks');
  
  // Use the hook for dashboard mode. We pass the token for authentication.
  const {
    portfolioData,
    isLoading,
    totalValue,
    cashHeld,
    moneyInvested,
    totalProfit,
    xirr,
    isPositiveChange,
    chartAllocationData,
  } = usePortfolioData(null, token, 'dashboard', props.showAlert); 

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Auth check
  useEffect(() => {
    if (!token) {
      window.location.href = "/";
    }
  }, [token]);

  const handleCopyLink = async () => {
    // Generate the portfolio share link
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
        if (res.user.profileType !== "Public") {
          props.showAlert(
            "Your portfolio is private. Please make it public to share.",
            "warning"
          );
          return;
        }
        const userId = res.user._id;
        const portfolioLink = `${process.env.REACT_APP_FRONTEND_URL}portfolio/${userId}`;
        await navigator.clipboard.writeText(portfolioLink);
        props.showAlert("Portfolio link copied to clipboard!", "success");
      } else {
        console.error(
          `Error fetching User data for ${res.msg || res.errors[0]?.msg}`
        );
        props.showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      props.showAlert(
        "Something went wrong! Please try again later.",
        "danger"
      );
    }
  };


  // Render loading state
  if (!token || isLoading) {
      return (
          <div style={{ backgroundColor: "black", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <SideBar />
              <h4 className="text-light">{!token ? "Redirecting..." : "Loading Portfolio Data..."}</h4>
          </div>
      );
  }

  const rawPortfolioData = portfolioData; 

  const mainContentMarginLeft = windowWidth >= LG_BREAKPOINT ? SIDEBAR_WIDTH : '0';

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      <SideBar />
      <main
        className="main-content"
        style={{ 
          marginLeft: mainContentMarginLeft, // Apply conditional margin
          padding: "20px",
          transition: 'margin-left 0.3s ease-in-out'
         }}
      >
        <div className="container-fluid text-light">
          <div className="row g-2 align-items-center mb-4">
            <div className="col-12 col-lg-8 offset-lg-2 order-1 order-lg-1">
              <h1 className="mb-0" style={{ textAlign: "center" }}>
                  Total Portfolio Overview
              </h1>
          </div>

          {/* 2. Copy Link Button (Pushed to the right on desktop) */}
          <div className="col-12 col-lg-2 text-center text-lg-end order-2 order-lg-2">
              <button
                  className="btn btn-sm" // Use btn-sm for better fit
                  onClick={handleCopyLink}
                  style={{
                      // Keep inline styles for color consistency
                      backgroundColor: "rgb(9, 96, 29)",
                      color: "white",
                      borderColor: "rgb(9, 96, 29)",
                  }}
              >
                  Copy Portfolio Link
              </button>
          </div>
          </div>

          {rawPortfolioData && (
            // --- Allocation Chart + Metric Cards ---
            <div className="row g-3 mb-5">
              
              {/* Pie Chart (Allocation: Stocks, Mutual Funds, Cash) - Change to col-lg-6 */}
              <div className="col-lg-6 col-md-12 d-flex">
                <PortfolioAllocationChart
                    chartData={chartAllocationData}
                    availableColors={availableColors}
                />
              </div>
              
              {/* Metric Cards (Total Value, Cash, Invested, XIRR) - Change to col-lg-6 */}
              <div className="col-lg-6 col-md-12 d-flex">
                <AssetCards
                    totalValue={totalValue}
                    cashHeld={cashHeld}
                    moneyInvested={moneyInvested}
                    totalProfit={totalProfit}
                    xirr={xirr}
                    isPositiveChange={isPositiveChange}
                />
              </div>
            </div>
          )}

          {/* --- NEW TABBED NAVIGATION --- */}
          {rawPortfolioData && (
            <div className="row mb-4">
                <div className="col-12">
                    <ul className="nav nav-tabs justify-content-center" style={{ borderBottom: "1px solid #363636" }}>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'stocks' ? 'active' : ''}`}
                                onClick={() => setActiveTab('stocks')}
                                style={{
                                    backgroundColor: activeTab === 'stocks' ? '#212529' : 'transparent', // Darker background for active tab
                                    color: activeTab === 'stocks' ? 'white' : '#adb5bd', // White text for active, light gray for inactive
                                    borderWidth: '1px', 
                                    borderStyle: 'solid',
                                    borderColor: activeTab === 'stocks' ? '#363636 #363636 transparent' : '#363636',
                                    borderBottom: activeTab === 'stocks' ? 'none' : '1px solid #363636' // Hide bottom border for active tab
                                }}
                            >
                                Stock Holdings Analysis
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'mutualfunds' ? 'active' : ''}`}
                                onClick={() => setActiveTab('mutualfunds')}
                                style={{
                                    backgroundColor: activeTab === 'mutualfunds' ? '#212529' : 'transparent',
                                    color: activeTab === 'mutualfunds' ? 'white' : '#adb5bd',
                                    borderColor: activeTab === 'stocks' ? '#363636 #363636 transparent' : '#363636',
                                    borderWidth: '1px', 
                                    borderStyle: 'solid',
                                    borderBottom: activeTab === 'mutualfunds' ? 'none' : '1px solid #363636'
                                }}
                            >
                                Mutual Fund Holdings Analysis
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
          )}
          {/* Detailed Analysis (Conditional Rendering) */}
          {rawPortfolioData && activeTab === 'stocks' && (
            <StockAnalysis
              portfolioData={rawPortfolioData}
              availableColors={availableColors}
              totalProfit={totalProfit}
              showAlert={props.showAlert}
            />
          )}
          {rawPortfolioData && activeTab === 'mutualfunds' && (
            <MutualFundHoldingsAnalysis
              portfolioData={rawPortfolioData}
              availableColors={availableColors}
              totalProfit={totalProfit}
              showAlert={props.showAlert}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;