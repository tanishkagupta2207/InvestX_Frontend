import React from "react";
import { useCallback, useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";

const StockAnalysis = (props) => {
  const portfolioData = props.portfolioData;
  const availableColors = props.availableColors;
  const minRows = 7;
  const dataRows = portfolioData.stocks.length;
  const rowsToDisplay = Math.max(minRows, dataRows);

  // --- State Variables ---
  const [totalValue, setTotalValue] = useState(0);
  const [stockLabels, setStockLabels] = useState([]);
  const [stockSymbols, setStockSymbols] = useState([]);
  const [stockValues, setStockValues] = useState([]);
  // Renamed for clarity: now stores ROI (%)
  const [individualReturnPercentages, setIndividualReturnPercentages] =
    useState([]);
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);

  const calculateTotal = useCallback((stocks) => {
    let total = 0;
    if (stocks && Array.isArray(stocks)) {
      stocks.forEach((stock) => {
        total += stock.quantity * stock.current_price;
      });
    }
    return parseFloat(total.toFixed(2));
  }, []);

  const calculateTotalProfit = useCallback((stocks) => {
    let total = 0;
    if (stocks && Array.isArray(stocks)) {
      stocks.forEach((stock) => {
        total += (stock.current_price - stock.average_price) * stock.quantity;
      });
    }
    // Changed to 2 decimal places for consistency with MutualFundAnalysis
    return parseFloat(total.toFixed(2)); 
  }, []);

  useEffect(() => {
    if (portfolioData && portfolioData.stocks) {
      const stocks = portfolioData.stocks;

      // Data for the 'Stocks Breakdown' Pie Chart
      const newStockLabels = stocks.map((stock) => stock.name);
      const newStockSymbols = stocks.map((stock) => stock.symbol);
      const newStockValues = stocks.map(
        (stock) => stock.quantity * stock.current_price
      );

      // Data for the 'Profit/Loss' Bar Chart
      const newTotalProfit = calculateTotalProfit(stocks);
      
      // *** CORRECTED PROFIT PERCENTAGE CALCULATION ***
      // Calculate Individual Stock Percentage Return on Investment (ROI)
      const newIndividualReturnPercentages = stocks.map((stock) => {
        const investmentValue = stock.average_price * stock.quantity;
        const currentProfit =
          (stock.current_price - stock.average_price) * stock.quantity;
        // Formula: (Profit / Investment Cost) * 100. Handle zero investment.
        const percentageReturn =
          investmentValue <= 0 ? 0 : (currentProfit / investmentValue) * 100;
        return parseFloat(percentageReturn.toFixed(2));
      });

      const newBackgroundColors = newStockLabels.map(
        (_, index) => availableColors[index % availableColors.length]
      );

      setStockLabels(newStockLabels);
      setStockSymbols(newStockSymbols);
      setStockValues(newStockValues);
      setTotalProfit(newTotalProfit);
      // Update state with new ROI calculation
      setIndividualReturnPercentages(newIndividualReturnPercentages); 
      setBackgroundColors(newBackgroundColors);
      setTotalValue(calculateTotal(stocks));
    }
  }, [portfolioData, availableColors, calculateTotal, calculateTotalProfit]);

  const handleDownloadCSV = () => {
    if (
      !portfolioData ||
      !portfolioData.stocks ||
      portfolioData.stocks.length === 0
    ) {
      alert("No data to download.");
      return;
    }

    const stocks = portfolioData.stocks;
    const header = [
      "Company",
      "Symbol",
      "Quantity",
      "Purchase Price",
      "Current Price",
      "Value",
      "Profit Value",
      "Profit Percentage (ROI)", // Updated Header
    ];

    // Add data rows
    const rows = stocks.map((item) => {
      const investmentValue = item.average_price * item.quantity;
      const profitValue = parseFloat(
        (item.current_price - item.average_price) * item.quantity
      ).toFixed(2); // Reduced to 2 decimal places
      const profitPercentage = parseFloat(
        investmentValue <= 0 ? 0 : (profitValue / investmentValue) * 100
      ).toFixed(2); // *** CORRECTED ROI CALCULATION ***

      return [
        `"${item.name.replace(/"/g, '""')}"`, // Handle commas and quotes
        item.symbol,
        item.quantity,
        item.average_price,
        item.current_price,
        (item.current_price * item.quantity).toFixed(2), // Fixed to 2 decimal places
        profitValue,
        profitPercentage + "%",
      ].join(",");
    });

    const csvContent = [header.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Stock_holdings_analysis.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    props.showAlert("CSV downloaded successfully!", "success");
  };

  const datastocks = {
    labels: stockLabels,
    datasets: [
      {
        label: "Stocks Allocation",
        data: stockValues,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const dataProfitPercentage = {
    labels: stockSymbols,
    datasets: [
      {
        // Updated label to reflect ROI
        label: "Individual Stock Percentage Return (ROI)", 
        // Using the new ROI state
        data: individualReturnPercentages, 
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
        labels: {
          color: "white",
        },
      },
    },
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: false, // ROI can be negative
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      x: {
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },
  };

  if (!portfolioData || !portfolioData.stocks) {
    return null;
  }

  return (
    <div>
      {" "}
      <h1
        className="text-light"
        style={{ textAlign: "center", marginBottom: "20px" }}
      >
        Stocks Holding Analysis
      </h1>
      {/* Charts Section */}
      <div
        className="row g-3"
        style={{ margin: "0px", paddingLeft: "4px", paddingRight: "4px" }}
      >
        <div className="col-lg-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body text-light">
              <h4 className="card-title">Stocks Breakdown</h4>
              <div
                className="d-flex justify-content-center align-items-center bg-secondary bg-opacity-10 rounded"
                style={{ height: "372px" }}
              >
                {portfolioData.stocks.length > 0 ? (
                  <Pie data={datastocks} options={options} />
                ) : (
                  <p className="text-muted">No stocks to display in chart.</p>
                )}
              </div>
              <p className="text-muted">Pie Chart for Stocks Distribution</p>
              <h5>
                Total Value of Stocks: <HiOutlineCurrencyRupee />{" "}
                {totalValue.toFixed(2)}
              </h5>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body text-light">
              <h4 className="card-title">Individual Stock Percentage Return</h4>
              <div
                className="d-flex justify-content-center align-items-center bg-secondary bg-opacity-10 rounded"
                style={{ height: "372px" }}
              >
                {portfolioData.stocks.length > 0 ? (
                  <Bar data={dataProfitPercentage} options={chartOptions} />
                ) : (
                  <p className="text-muted">No stocks to display in chart.</p>
                )}
              </div>
              <p className="text-muted">
                Bar Chart for Individual Stock Return on Investment
              </p>
              <h5>
                Total Profit/loss in Stocks: <HiOutlineCurrencyRupee />{" "}
                {totalProfit.toFixed(2)}
              </h5>
            </div>
          </div>
        </div>
      </div>
      <div>&nbsp;</div>

      {/* Detailed Holdings Table */}
      <div
        className="row g-3"
        style={{ margin: "0px", paddingLeft: "4px", paddingRight: "4px" }}
      >
        <div className="card bg-dark border-secondary">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="card-title mb-0 text-light">
              Detailed Stock Holdings Overview
            </h4>
            <button
              className="btn btn-sm btn-outline-info"
              onClick={handleDownloadCSV}
            >
              Download as CSV
            </button>
          </div>
          <div className="card-body text-light">
            <div className="table-responsive" style={{ maxHeight: "388px" }}>
              <table className="table table-striped table-dark table-bordered">
                <thead
                  style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    backgroundColor: "black",
                  }}
                >
                  <tr>
                    <th>Company</th>
                    <th>Symbol</th>
                    <th>Quantity</th>
                    <th>Purchase Price</th>
                    <th>Current Price</th>
                    <th>Value</th>
                    <th>Profit Value</th>
                    <th>Profit Percentage (ROI)</th>
                  </tr>
                </thead>
                <tbody
                  className="table-group-divider"
                  style={{
                    overflowY: dataRows > minRows ? "scroll" : "auto",
                  }}
                >
                  {portfolioData.stocks
                    .slice(0, rowsToDisplay)
                    .map((item, index) => {
                      const profitValue =
                        (item.current_price - item.average_price) *
                        item.quantity;
                      const investmentValue =
                        item.average_price * item.quantity;
                      const profitPercentage =
                        investmentValue <= 0
                          ? 0
                          : (profitValue / investmentValue) * 100;
                      const isPositive = profitValue >= 0;

                      return (
                        <tr key={item.id || index}>
                          <th>{item.name}</th>
                          <td>{item.symbol}</td>
                          <td>{item.quantity}</td>
                          <td>{item.average_price.toFixed(4)}</td>
                          <td>{item.current_price.toFixed(4)}</td>
                          <td>
                            <HiOutlineCurrencyRupee size={16} />
                            {(item.current_price * item.quantity).toFixed(2)}
                          </td>
                          <td
                            className={`card-text ${
                              isPositive ? "text-success" : "text-danger"
                            }`}
                          >
                            <HiOutlineCurrencyRupee size={16} />
                            {profitValue.toFixed(2)}
                          </td>
                          <td
                            className={`card-text ${
                              isPositive ? "text-success" : "text-danger"
                            }`}
                          >
                            {profitPercentage.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  {dataRows < minRows &&
                    Array(minRows - dataRows)
                      .fill(null)
                      .map((_, index) => (
                        <tr key={`empty-${index}`}>
                          <th>&nbsp;</th>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                          <td>&nbsp;</td>
                        </tr>
                      ))}
                  {portfolioData.stocks.length > 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        style={{ textAlign: "right", fontWeight: "bold" }}
                      >
                        Total:
                      </td>
                      <td
                        style={{ fontWeight: "bold" }}
                        className={`card-text ${
                          totalProfit >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        <HiOutlineCurrencyRupee size={16} />
                        {totalProfit.toFixed(2)}
                      </td>
                      <td
                        style={{ fontWeight: "bold" }}
                        className={`card-text ${
                          totalProfit >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {/* Overall Portfolio ROI: (Total Profit / Total Investment) * 100 */}
                        {((totalProfit / (totalValue - totalProfit)) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div>&nbsp;</div>
    </div>
  );
};

export default StockAnalysis;