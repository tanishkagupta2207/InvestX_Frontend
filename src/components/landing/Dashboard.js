import React from "react";
import { useEffect } from "react";
import SideBar from "../SideBar";
import StockAnalysis from "./portfolioComponents/StockAnalysis";
import AssetCards from "./portfolioComponents/AssetCards";

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
            Portfolio Overview
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
