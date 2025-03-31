import React from "react";
import { useCallback, useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";

const availableColors = [
  "rgba(255, 99, 132,1)",
  "rgba(54, 162, 235, 1)",
  "rgba(255, 206, 86, 1)",
  "rgba(75, 192, 192, 1)",
  "rgba(153, 102, 255, 1)",
  "rgba(255, 159, 64, 1)",
  "rgba(173, 216, 230, 1)",
  "rgba(255, 160, 122, 1)",
  "rgba(144, 238, 144, 1)",
  "rgba(255, 255, 0, 1)",
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

const StockAnalysis = () => {
  const [totalValue, setTotalValue] = useState(0);
  const minRows = 7;
  const dataRows = portfolioData.stocks.length;
  const rowsToDisplay = Math.max(minRows, dataRows);
  const stockLabels = portfolioData.stocks.map((stock) => stock.name);
  const stockSymbols = portfolioData.stocks.map((stock) => stock.symbol);
  const [totalProfit, setTotalProfit] = useState(0);

  const stockValues = portfolioData.stocks.map(
    (stock) => stock.quantity * stock.currentPrice
  );
  const profitPercentages = portfolioData.stocks.map((stock) =>
    parseFloat(
      (
        (((stock.currentPrice - stock.average_price) * stock.quantity) /
          Math.abs(totalProfit)) *
        100
      ).toFixed(2)
    )
  );
  const backgroundColors = stockLabels.map(
    (_, index) => availableColors[index % availableColors.length]
  );

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
      },
    },
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
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
    setTotalValue(calculateTotal(portfolioData?.stocks || []));
  }, [calculateTotalProfit, calculateTotal]);

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
                <Pie data={datastocks} options={options} />
              </div>
              <p className="text-muted">Pie Chart for Stocks Distribution</p>
              <h5>Total Value of Stocks: <HiOutlineCurrencyRupee /> {totalValue}</h5>
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
                <Bar data={dataProfitPercentage} options={chartOptions} />
              </div>
              <p className="text-muted">Pie Chart for Stocks Distribution</p>
              <h5>Total Profit/loss in Stocks: <HiOutlineCurrencyRupee /> {totalProfit}</h5>
            </div>
          </div>
        </div>

      </div>


      <div
        className="row g-3"
        style={{ margin: "0px", paddingLeft: "4px", paddingRight: "4px" }}
      >
        <div className="card bg-dark border-secondary">
          <div className="card-body text-light">
            <h4 className="card-title">Detailed Stock Holdings Overview</h4>
            <p className="text-muted" style={{ margin: "0px" }}>
              Stock Holdings Overview
            </p>
            <div className="table-responsive" style={{ maxHeight: "388px" }}>
              {" "}
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
                  {portfolioData.stocks.slice(0, rowsToDisplay).map((item) => (
                    <tr key={item.id}>
                      <th>{item.name}</th>
                      <td>{item.symbol}</td>
                      <td>{item.quantity}</td>
                      <td>{item.average_price}</td>
                      <td>{item.currentPrice}</td>
                      <td>{item.currentPrice * item.quantity}</td>
                      <td
                        className={`card-text ${
                          item.currentPrice - item.average_price >= 0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {(item.currentPrice - item.average_price) *
                          item.quantity}
                      </td>
                      <td
                        className={`card-text ${
                          item.currentPrice - item.average_price >= 0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {parseFloat(
                          (
                            (((item.currentPrice - item.average_price) *
                              item.quantity) /
                              Math.abs(totalProfit)) *
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
                            total + item.currentPrice * item.quantity,
                          0
                        )}
                    </td>
                    <td  style={{ fontWeight: "bold" }}>
                      {portfolioData.stocks
                        .slice(0, rowsToDisplay)
                        .reduce(
                          (total, item) =>
                            total + ((item.currentPrice - item.average_price) * item.quantity),
                          0
                        )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default StockAnalysis;
