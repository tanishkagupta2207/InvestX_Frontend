import React from "react";
import { useState, useCallback, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";

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

const AssetCards = () => {
  const [totalValue, setTotalValue] = useState(0);
  
  const [totalProfit, setTotalProfit] = useState(0);
  const isPositiveChange = totalProfit >= 0;
  const cashHeld = portfolioData.Balance;
  const stockLabels = portfolioData.stocks.map((stock) => stock.name);

  const allocationWithPercent = [
    {
      label: "Stocks",
      percentage: parseFloat(
        (((totalValue - cashHeld) / totalValue) * 100).toFixed(2)
      ),
      color: availableColors[0],
    },
    {
      label: "Balance",
      percentage: parseFloat(((cashHeld / totalValue) * 100).toFixed(2)),
      color: availableColors[1],
    },
  ];

  const backgroundColors = stockLabels.map(
    (_, index) => availableColors[index % availableColors.length]
  );

  const data = {
    labels: ["Stocks", "Cash Held"],
    datasets: [
      {
        label: "Portfolio Allocation",
        data: [totalValue - cashHeld, cashHeld],
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
    },
  };

  const calculateTotal = useCallback((stocks) => {
    let total = 0;
    stocks.forEach((stock) => {
      total += stock.quantity * stock.currentPrice;
    });
    return total;
  }, []);

  const calculateTotalProfit = useCallback((stocks) => {
      let total = 0;
      stocks.forEach((stock) => {
        total += (stock.currentPrice - stock.average_price) * stock.quantity;
      });
      return total;
    }, []);

  useEffect(() => {
    setTotalProfit(calculateTotalProfit(portfolioData?.stocks || []));
    setTotalValue(calculateTotal(portfolioData?.stocks || []) + cashHeld);
  }, [cashHeld, calculateTotal, calculateTotalProfit]);

  const PieChartPlaceholder = () => (
    <div
      className="d-flex justify-content-center align-items-center bg-secondary bg-opacity-10 rounded"
      style={{ height: "300px" }}
    >
      <Pie data={data} options={options} />
    </div>
  );

  return (
    <div className="row mb-4 g-3 align-items-stretch">

      <div className="col-lg-6">
        <div className="card bg-dark border-secondary h-100">
          <div className="card-body text-light d-flex">
            <div className="flex-grow-1">
              <h4 className="card-title mb-3">Asset Allocation</h4>
              <div className="d-flex justify-content-center">
                <PieChartPlaceholder />
              </div>
            </div>
            {allocationWithPercent.length > 0 && (
              <ul
                className="list-unstyled mt-3"
                style={{
                  maxWidth: "150px",
                  textAlign: "center",
                  display: "flex", // Use Flexbox for alignment
                  flexDirection: "column", // Stack items vertically
                  justifyContent: "center", // Center items vertically
                  alignItems: "center", // Center items horizontally
                }}
              >
                {allocationWithPercent.map((asset) => (
                  <li
                    key={asset.label}
                    className="d-flex align-items-center mb-2"
                    style={{
                      display: "flex", // Ensure Flexbox is applied to the <li>
                      alignItems: "center", // Vertically center the content
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        backgroundColor: asset.color,
                        marginRight: "8px",
                        borderRadius: "2px",
                      }}
                    ></span>
                    <span className="me-2">{asset.label}</span>
                    <span className="text-white-50">{asset.percentage}%</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="col-lg-6" style={{ width: "578px", height: "372px" }}>

        <div className="row g-3" style={{ marginTop: "0px" }}>

          <div className="col-md-6" style={{ height: "180px", margin: "0px" }}>
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body">
                <h5 className="card-title text-white-50">
                  Total Portfolio Value
                </h5>
                <p className="card-text display-6 fw-bold text-light">
                  <HiOutlineCurrencyRupee />{totalValue}
                </p>
                <p
                  className={`card-text ${
                    isPositiveChange ? "text-success" : "text-danger"
                  }`}
                >
                  {isPositiveChange ? "+" : ""}
                  <HiOutlineCurrencyRupee />{totalProfit} {isPositiveChange ? "+" : ""} Today
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6" style={{ margin: "0px" }}>
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body">
                <h5 className="card-title text-white-50">Total Cash Held</h5>
                <p className="card-text display-6 fw-bold text-light">
                <HiOutlineCurrencyRupee />{cashHeld}
                </p>
                <p className="card-text text-muted">&nbsp;</p>
              </div>
            </div>
          </div>

        </div>

        <div className="row g-3 mt-3">
        
        <div className="col-md-6" style={{ margin: "0px" }}>
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body">
                <h5 className="card-title text-white-50">Total Stocks Value</h5>
                  <p
                    className="card-text display-6 fw-bold text-light"
                  >
                    <HiOutlineCurrencyRupee />{calculateTotal(portfolioData.stocks)}{" "}
                  </p>
                  <p
                  className={`card-text ${
                    isPositiveChange ? "text-success" : "text-danger"
                  }`}
                >
                  {isPositiveChange ? "+" : ""}
                  <HiOutlineCurrencyRupee />{totalProfit} {isPositiveChange ? "+" : ""} Today
                </p>
              </div>
            </div>
          </div>

          <div className="col-md-6" style={{ height: "180px", margin: "0px" }}>
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body">
                <h5 className="card-title text-white-50">Total Bonds Value</h5>
                <p className="card-text display-6 fw-bold text-light">
                <HiOutlineCurrencyRupee />{0}{" "}  {/** TODO */}
                </p>
                <p className="card-text text-muted">&nbsp;</p>
              </div>
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
};

export default AssetCards;
