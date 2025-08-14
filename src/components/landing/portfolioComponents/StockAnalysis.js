import React from "react";
import { useCallback, useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";

const StockAnalysis = (props) => {
  const portfolioData = props.portfolioData;
  const availableColors = props.availableColors;
  const [totalValue, setTotalValue] = useState(0);
  const minRows = 7;
  const dataRows = portfolioData.stocks.length;
  const rowsToDisplay = Math.max(minRows, dataRows);
  const [stockLabels, setStockLabels] = useState([]);
  const [stockSymbols, setStockSymbols] = useState([]);
  const [stockValues, setStockValues] = useState([]);
  const [profitPercentages, setProfitPercentages] = useState([]);
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
    return parseFloat(total.toFixed(4));
  }, []);

  useEffect(() => {
    if (portfolioData && portfolioData.stocks) {
      const stocks = portfolioData.stocks;
      const newStockLabels = stocks.map((stock) => stock.name);
      const newStockSymbols = stocks.map((stock) => stock.symbol);
      const newStockValues = stocks.map(
        (stock) => stock.quantity * stock.current_price
      );
      const newTotalProfit = calculateTotalProfit(stocks);
      
      const newProfitPercentages = stocks.map((stock) =>
        parseFloat(
          (
            (((stock.current_price - stock.average_price) * stock.quantity) /
              Math.abs(newTotalProfit || 1)) *
            100
          ).toFixed(2)
        )
      );

      const newBackgroundColors = newStockLabels.map(
        (_, index) => availableColors[index % availableColors.length]
      );

      setStockLabels(newStockLabels);
      setStockSymbols(newStockSymbols);
      setStockValues(newStockValues);
      setTotalProfit(newTotalProfit);
      setProfitPercentages(newProfitPercentages);
      setBackgroundColors(newBackgroundColors);
      setTotalValue(calculateTotal(stocks));
    }
  }, [portfolioData, availableColors, calculateTotal, calculateTotalProfit]);

  const handleDownloadCSV = () => {
    if (!portfolioData || !portfolioData.stocks || portfolioData.stocks.length === 0) {
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
      "Profit Percentage",
    ];
    
    // Add data rows
    const rows = stocks.map((item) => {
      const profitValue = parseFloat((item.current_price - item.average_price) * item.quantity).toFixed(4);
      const profitPercentage = parseFloat(
          ((((item.current_price - item.average_price) * item.quantity) / Math.abs(totalProfit || 1)) * 100)
        ).toFixed(2);
      
      return [
        `"${item.name.replace(/"/g, '""')}"`, // Handle commas and quotes
        item.symbol,
        item.quantity,
        item.average_price,
        item.current_price,
        item.current_price * item.quantity,
        profitValue,
        profitPercentage + "%",
      ].join(",");
    });
    
    const csvContent = [
      header.join(","),
      ...rows,
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "stock_holdings_analysis.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        label: "Profit Percentage Allocation",
        data: profitPercentages,
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
        beginAtZero: true,
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" }
      },
      x: {
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" }
      }
    },
    plugins: {
      legend: {
        labels: {
          color: "white"
        }
      }
    }
  };

  if (!portfolioData) {
    return null;
  }

  return (
    <div>
      <h1
        className="text-light"
        style={{ textAlign: "center", marginBottom: "20px" }}
      >
        Stocks Holding Analysis
      </h1>

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
                Total Value of Stocks: <HiOutlineCurrencyRupee /> {totalValue}
              </h5>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body text-light">
              <h4 className="card-title">Stocks Profit Percentage Breakdown</h4>
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
              <p className="text-muted">Bar Chart for Stocks Profit/Loss</p>
              <h5>
                Total Profit/loss in Stocks: <HiOutlineCurrencyRupee />{" "}
                {totalProfit}
              </h5>
            </div>
          </div>
        </div>
      </div>
      <div>&nbsp;</div>

      <div
        className="row g-3"
        style={{ margin: "0px", paddingLeft: "4px", paddingRight: "4px" }}
      >
        <div className="card bg-dark border-secondary">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="card-title mb-0 text-light">Detailed Stock Holdings Overview</h4>
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
                    <th>Profit Percentage</th>
                  </tr>
                </thead>
                <tbody
                  className="table-group-divider"
                  style={{
                    overflowY: dataRows > minRows ? "scroll" : "auto",
                  }}
                >
                  {portfolioData.stocks.slice(0, rowsToDisplay).map((item, index) => (
                    <tr key={item.id || index}>
                      <th>{item.name}</th>
                      <td>{item.symbol}</td>
                      <td>{item.quantity}</td>
                      <td>{item.average_price}</td>
                      <td>{item.current_price}</td>
                      <td>{item.current_price * item.quantity}</td>
                      <td
                        className={`card-text ${
                          item.current_price - item.average_price >= 0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {parseFloat(
                          (item.current_price - item.average_price) *
                            item.quantity
                        ).toFixed(4)}
                      </td>
                      <td
                        className={`card-text ${
                          item.current_price - item.average_price >= 0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {parseFloat(
                          (
                            (((item.current_price - item.average_price) *
                              item.quantity) /
                              Math.abs(totalProfit || 1)) *
                            100
                          ).toFixed(2)
                        )}
                        %
                      </td>
                    </tr>
                  ))}
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
                        colSpan="5"
                        style={{ textAlign: "right", fontWeight: "bold" }}
                      >
                        Total:
                      </td>
                      <td style={{ fontWeight: "bold" }}>
                        {portfolioData.stocks
                          .slice(0, rowsToDisplay)
                          .reduce(
                            (total, item) =>
                              total + item.current_price * item.quantity,
                            0
                          ).toFixed(2)}
                      </td>
                      <td
                        style={{ fontWeight: "bold" }}
                        className={`card-text ${
                          totalProfit >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        {totalProfit}
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