import React from "react";
import { useEffect } from "react";
import SideBar from "../SideBar";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import StockAnalysis from "./portfolioComponents/StockAnalysis";
import AssetCards from "./portfolioComponents/AssetCards";

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return; // Important: Exit the effect after redirecting
    }
  }, [token]);

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

          <AssetCards />
        </div>
        {/* Row for Charts / Detailed Sections */}

        <StockAnalysis />
      </main>
    </div>
  );
};

export default Dashboard;
