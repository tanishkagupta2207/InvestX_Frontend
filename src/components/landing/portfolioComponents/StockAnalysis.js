import React from "react";
import { Pie } from "react-chartjs-2";

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
    },
    {
      id: 2,
      name: "Amazon.com Inc.",
      symbol: "AMZN",
      quantity: 10,
      average_price: 300,
    },
    {
      id: 3,
      name: "Microsoft Corp.",
      symbol: "MSFT",
      quantity: 12,
      average_price: 400,
    },
    {
      id: 4,
      name: "Alphabet Inc.",
      symbol: "GOOGL",
      quantity: 16,
      average_price: 460,
    },
    {
      id: 5,
      name: "Apple Inc.",
      symbol: "AAPL",
      quantity: 10,
      average_price: 150,
    },
    {
      id: 6,
      name: "Amazon.com Inc.",
      symbol: "AMZN",
      quantity: 10,
      average_price: 300,
    },
    {
      id: 7,
      name: "Microsoft Corp.",
      symbol: "MSFT",
      quantity: 12,
      average_price: 400,
    },
    {
      id: 8,
      name: "Alphabet Inc.",
      symbol: "GOOGL",
      quantity: 16,
      average_price: 460,
    },
    {
      id: 9,
      name: "Apple Inc.",
      symbol: "AAPL",
      quantity: 10,
      average_price: 150,
    },
    {
      id: 10,
      name: "Amazon.com Inc.",
      symbol: "AMZN",
      quantity: 10,
      average_price: 300,
    },
    {
      id: 11,
      name: "Microsoft Corp.",
      symbol: "MSFT",
      quantity: 12,
      average_price: 400,
    },
    {
      id: 12,
      name: "Alphabet Inc.",
      symbol: "GOOGL",
      quantity: 16,
      average_price: 460,
    },
    {
      id: 13,
      name: "Apple Inc.",
      symbol: "AAPL",
      quantity: 10,
      average_price: 150,
    },
    {
      id: 14,
      name: "Amazon.com Inc.",
      symbol: "AMZN",
      quantity: 10,
      average_price: 300,
    },
    {
      id: 15,
      name: "Microsoft Corp.",
      symbol: "MSFT",
      quantity: 12,
      average_price: 400,
    },
    {
      id: 16,
      name: "Alphabet Inc.",
      symbol: "GOOGL",
      quantity: 16,
      average_price: 460,
    },
  ],
  Balance: 10000,
};

const StockAnalysis = () => {
  const minRows = 7;
  const dataRows = portfolioData.stocks.length;
  const rowsToDisplay = Math.max(minRows, dataRows);
  const stockLabels = portfolioData.stocks.map((stock) => stock.name);
  const stockValues = portfolioData.stocks.map(
    (stock) => stock.quantity * stock.average_price
  );
  const backgroundColors = stockLabels.map(
    (_, index) => availableColors[index % availableColors.length]
  );
  const datastocks = {
    labels: stockLabels,
    datasets: [
      {
        label: "Portfolio Allocation",
        data: stockValues,
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
      title: {
        display: true,
        text: "Stock Portfolio Allocation",
      },
    },
  };

  return (
    <div>
        <h1 className="text-light" style={{ textAlign: "center", marginBottom: "20px" }}>Stock Holdings Analysis</h1>
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
            </div>
          </div>
        </div>

        <div className="col-lg-6">
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
                      <th>Average Price</th>
                      <th>Value</th>
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
                      .map((item) => (
                        <tr key={item.id}>
                          <th>{item.name}</th>
                          <td>{item.symbol}</td>
                          <td>{item.quantity}</td>
                          <td>{item.average_price}</td>
                          <td>{item.average_price * item.quantity}</td>
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
                          </tr>
                        ))}
                    <tr>
                      <td
                        colSpan="4"
                        style={{ textAlign: "right", fontWeight: "bold" }}
                      >
                        Total:
                      </td>
                      <td style={{ fontWeight: "bold" }}>
                        {portfolioData.stocks
                          .slice(0, rowsToDisplay)
                          .reduce(
                            (total, item) =>
                              total + item.average_price * item.quantity,
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
    </div>
  );
};

export default StockAnalysis;
