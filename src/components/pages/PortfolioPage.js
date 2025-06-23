import React from "react";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  registerables,
} from "chart.js";
import StockAnalysis from "../landing/portfolioComponents/StockAnalysis";
import AssetCards from "../landing/portfolioComponents/AssetCards";

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

const PortfolioPage = (props) => {
  const userId = window.location.pathname.split("/").pop();
  const [portfolioData, setPortfolioData] = useState(null);

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/portfolio/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
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
    fetchPortfolioData();
    // eslint-disable-next-line
  }, [userId]); // Added userId to dependency array to refetch if URL changes

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <main
        className="main-content"
        style={{
          padding: "20px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div className="container-fluid text-light">
          <h1 className="mb-4" style={{ textAlign: "center" }}>
            Total Portfolio Overview
          </h1>

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

export default PortfolioPage;