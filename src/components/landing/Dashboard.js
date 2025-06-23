import React from "react";
import { useEffect, useState } from "react";
import SideBar from "../SideBar";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  registerables,
} from "chart.js";
import StockAnalysis from "./portfolioComponents/StockAnalysis";
import AssetCards from "./portfolioComponents/AssetCards";

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

const Dashboard = (props) => {
  const token = localStorage.getItem("token");
  const [portfolioData, setPortfolioData] = useState(null);

  const fetchPortfolioData = async (token) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/portfolio/getPortfolio`,
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
        setPortfolioData(res.data);
      } else {
        console.error(
          `Error fetching Portfolio data for ${res.msg || res.errors[0]?.msg}`
        );
        props.showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      props.showAlert(
        "Something went wrong! Please try again later.",
        "danger"
      );
    }
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }
    fetchPortfolioData(token);
    // eslint-disable-next-line
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

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      <SideBar />
      <main
        className="main-content"
        style={{ marginLeft: "280px", padding: "20px" }}
      >
        <div className="container-fluid text-light">
          <h1 className="mb-4" style={{ textAlign: "center" }}>
            Total Portfolio Overview
          </h1>

          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              zIndex: 1000,
            }}
          >
            <button
              className="btn"
              onClick={handleCopyLink}
              style={{
                backgroundColor: "rgb(9, 96, 29)",
                color: "white",
                borderColor: "rgb(9, 96, 29)",
              }}
            >
              Copy Portfolio Link
            </button>
          </div>

          {portfolioData && (
            <AssetCards
              portfolioData={portfolioData}
              availableColors={availableColors}
            />
          )}
        </div>
        {/* Row for Charts / Detailed Sections */}

        {portfolioData && (
          <StockAnalysis
            portfolioData={portfolioData}
            availableColors={availableColors}
          />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
