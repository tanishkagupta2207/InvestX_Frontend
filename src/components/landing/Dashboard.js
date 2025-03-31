import React from "react";
import { useEffect } from "react";
import SideBar from "../SideBar";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, registerables  } from "chart.js";
import StockAnalysis from "./portfolioComponents/StockAnalysis";
import AssetCards from "./portfolioComponents/AssetCards";

ChartJS.register(ArcElement, Tooltip, Legend, ...registerables);

const portfolioData = {
  stocks: [
    {
      id: 1,
      name: "Apple Inc.",
      symbol: "AAPL",
      quantity: 10,
      average_price: 150,
      currentPrice: 200,
    },
    {
      id: 2,
      name: "Amazon.com Inc.",
      symbol: "AMZN",
      quantity: 10,
      average_price: 300,
      currentPrice: 200,
    },
    {
      id: 3,
      name: "Microsoft Corp.",
      symbol: "MSFT",
      quantity: 12,
      average_price: 400,
      currentPrice: 100,
    },
    {
      id: 4,
      name: "Alphabet Inc.",
      symbol: "GOOGL",
      quantity: 16,
      average_price: 460,
      currentPrice: 450,
    },
    {
      id: 5,
      name: "Apple Inc.",
      symbol: "AAPL",
      quantity: 10,
      average_price: 150,
      currentPrice: 200,
    },
    {
      id: 6,
      name: "Amazon.com Inc.",
      symbol: "AMZN",
      quantity: 10,
      average_price: 300,
      currentPrice: 200,
    },
    {
      id: 7,
      name: "Microsoft Corp.",
      symbol: "MSFT",
      quantity: 12,
      average_price: 400,
      currentPrice: 200,
    },
    {
      id: 8,
      name: "Alphabet Inc.",
      symbol: "GOOGL",
      quantity: 16,
      average_price: 460,
      currentPrice: 200,
    },
    {
      id: 9,
      name: "Apple Inc.",
      symbol: "AAPL",
      quantity: 10,
      average_price: 150,
      currentPrice: 200,
    },
    {
      id: 10,
      name: "Amazon.com Inc.",
      symbol: "AMZN",
      quantity: 10,
      average_price: 300,
      currentPrice: 200,
    },
    {
      id: 11,
      name: "Microsoft Corp.",
      symbol: "MSFT",
      quantity: 12,
      average_price: 400,
      currentPrice: 200,
    },
    {
      id: 12,
      name: "Alphabet Inc.",
      symbol: "GOOGL",
      quantity: 16,
      average_price: 460,
      currentPrice: 200,
    },
    {
      id: 13,
      name: "Apple Inc.",
      symbol: "AAPL",
      quantity: 10,
      average_price: 150,
      currentPrice: 200,
    },
    {
      id: 14,
      name: "Amazon.com Inc.",
      symbol: "AMZN",
      quantity: 10,
      average_price: 300,
      currentPrice: 200,
    },
    {
      id: 15,
      name: "Microsoft Corp.",
      symbol: "MSFT",
      quantity: 12,
      average_price: 400,
      currentPrice: 200,
    },
    {
      id: 16,
      name: "Alphabet Inc.",
      symbol: "GOOGL",
      quantity: 16,
      average_price: 460,
      currentPrice: 200,
    },
  ],
  Balance: 10000,
};

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

          <AssetCards portfolioData={portfolioData} availableColors={availableColors}/>
        </div>
        {/* Row for Charts / Detailed Sections */}

        <StockAnalysis portfolioData={portfolioData} availableColors={availableColors}/>
      </main>
    </div>
  );
};

export default Dashboard;
