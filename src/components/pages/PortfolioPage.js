// PortfolioPage.js
import React from "react";
import { useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  registerables,
} from "chart.js";

import StockAnalysis from "./portfolioComponents/StockAnalysis";
import AssetCards from "./portfolioComponents/AssetCards";
import { usePortfolioData } from "./portfolioComponents/UsePortfolioData";
import PortfolioAllocationChart from "./portfolioComponents/PortfolioAllocationChart";
import MutualFundHoldingsAnalysis from "../pages/portfolioComponents/MutualFundsAnalysis";

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
  
  // *** STATE FOR TAB MANAGEMENT ***
  const [activeTab, setActiveTab] = useState('stocks');

  // Use the custom hook for all data fetching and calculations
  const {
    portfolioData,
    isLoading,
    totalValue,
    cashHeld,
    moneyInvested,
    totalProfit,
    xirr,
    isPositiveChange,
    chartAllocationData
  } = usePortfolioData(userId, null, 'public', props.showAlert);

  // Render loading state if needed
  if (isLoading) {
      return (
          <div style={{ backgroundColor: "black", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <h4 className="text-light">Loading Portfolio Data...</h4>
          </div>
      );
  }

  return (
    <div style={{backgroundColor: "black", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center"}}>
      <main
        className="main-content"
        style={{
          padding: "20px",
          width: "100%",
          maxWidth: "1400px",
          boxSizing: "border-box",
          margin: "0 auto", 
        }}
      >
        <div className="container-fluid text-light">
          <h1 className="mb-4" style={{ textAlign: "center" }}>
            Total Portfolio Overview
          </h1>

          {portfolioData && (
            <div className="row g-3 mb-5">
              <div className="col-lg-6 col-md-12 d-flex">
                <PortfolioAllocationChart
                    chartData={chartAllocationData}
                    availableColors={availableColors}
                />
              </div>
              
              {/* Metric Cards (Total Value, Cash, Invested, XIRR) - 7 columns */}
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
          { portfolioData && (
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
                                    borderColor: activeTab === 'stocks' ? '#363636 #363636 transparent' : 'transparent', // Highlight bottom border
                                    border: '1px solid #363636',
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
                                    borderColor: activeTab === 'mutualfunds' ? '#363636 #363636 transparent' : 'transparent',
                                    border: '1px solid #363636',
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
          { portfolioData && activeTab === 'stocks' && (
            <StockAnalysis
              portfolioData={ portfolioData}
              availableColors={availableColors}
              totalProfit={totalProfit}
              showAlert={props.showAlert}
            />
          )}
          { portfolioData && activeTab === 'mutualfunds' && (
            <MutualFundHoldingsAnalysis
              portfolioData={ portfolioData}
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

export default PortfolioPage;