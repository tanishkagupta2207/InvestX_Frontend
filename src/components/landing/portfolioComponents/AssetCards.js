import React from "react";
import { useState, useCallback, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";

const AssetCards = (props) => {
  const portfolioData = props.portfolioData;
  const availableColors = props.availableColors;
  const [totalValue, setTotalValue] = useState(0);

  const [totalProfit, setTotalProfit] = useState(0);
  const isPositiveChange = totalProfit >= 0;
  const cashHeld = portfolioData.Balance;
  const xirr = portfolioData.xirr || null;

  // Ensure totalValue is calculated before allocationWithPercent to avoid NaN
  const calculatedTotalValue = useCallback((stocks, balance) => {
    let total = 0;
    stocks.forEach((stock) => {
      total += stock.quantity * stock.current_price;
    });
    return parseFloat((total + balance).toFixed(2));
  }, []);

  const calculateTotal = useCallback((stocks) => {
    let total = 0;
    stocks.forEach((stock) => {
      total += stock.quantity * stock.current_price;
    });
    total = parseFloat((total).toFixed(2));
    return total;
  }, []);

  const calculateTotalProfit = useCallback((stocks) => {
    let total = 0;
    stocks.forEach((stock) => {
      total += (stock.current_price - stock.average_price) * stock.quantity;
    });
    total = parseFloat((total).toFixed(4));
    return total;
  }, []);

  useEffect(() => {
    const stocks = portfolioData?.stocks || [];
    setTotalProfit(calculateTotalProfit(stocks));
    setTotalValue(calculatedTotalValue(stocks, cashHeld)); // Use the new calculatedTotalValue
  }, [cashHeld, calculateTotalProfit, calculatedTotalValue, portfolioData]);

  // Recalculate allocationWithPercent whenever totalValue or cashHeld changes
  const allocationWithPercent = [
    {
      label: "Stocks",
      percentage: parseFloat(
        totalValue === 0 ? 0 : (((totalValue - cashHeld) / totalValue) * 100).toFixed(2)
      ),
      color: availableColors[0],
    },
    {
      label: "Balance",
      percentage: parseFloat(
        totalValue === 0 ? 0 : ((cashHeld / totalValue) * 100).toFixed(2)
      ),
      color: availableColors[1],
    },
  ];


  const backgroundColors = availableColors.slice(0, 2);

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
    maintainAspectRatio: false, // Crucial for allowing manual height control
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "white", // Set legend label color to white
        },
      },
    },
  };

  const PieChartPlaceholder = () => (
    <div
      className="d-flex justify-content-center align-items-center bg-secondary bg-opacity-10 rounded"
      style={{ height: "100%", width: "100%" }} // Make placeholder fill its container
    >
      {totalValue > 0 ? ( // Only render Pie chart if totalValue is greater than 0
        <Pie data={data} options={options} />
      ) : (
        <p className="text-muted">No data to display in chart.</p>
      )}
    </div>
  );

  return (
    <div className="row mb-4 g-3 align-items-stretch"> {/* Added align-items-stretch here */}
      {/* Asset Allocation Card */}
      <div className="col-lg-6 col-md-12 d-flex"> {/* Added d-flex to make this column a flex container */}
        <div className="card bg-dark border-secondary h-100 w-100"> {/* Added w-100 */}
          <div className="card-body text-light d-flex flex-column flex-md-row justify-content-center align-items-center">
            <div className="flex-grow-1 text-center text-md-start mb-3 mb-md-0 d-flex flex-column justify-content-center align-items-center w-100"> {/* Added d-flex, justify-content-center, align-items-center, w-100 */}
              <h4 className="card-title mb-3">Asset Allocation</h4>
              <div className="d-flex justify-content-center" style={{ flexGrow: 1, maxHeight: '300px' }}> {/* Added flexGrow, maxHeight */}
                <PieChartPlaceholder />
              </div>
            </div>
            {allocationWithPercent.length > 0 && (
              <ul
                className="list-unstyled mt-3 ms-md-4"
                style={{
                  minWidth: "150px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                {allocationWithPercent.map((asset) => (
                  <li
                    key={asset.label}
                    className="d-flex align-items-center mb-2"
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

      {/* Financial Overview Cards */}
      <div className="col-lg-6 col-md-12">
        <div className="row g-3">
          {/* Total Portfolio Value Card */}
          <div className="col-md-6 col-sm-12">
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body">
                <h5 className="card-title text-white-50">
                  Total Portfolio Value
                </h5>
                <p className="card-text display-6 fw-bold text-light mb-0">
                  <HiOutlineCurrencyRupee />{parseFloat(totalValue).toFixed(3)}
                </p>
                <p
                  className={`card-text ${
                    isPositiveChange ? "text-success" : "text-danger"
                  }`}
                >
                  {isPositiveChange ? "+" : ""}
                  <HiOutlineCurrencyRupee />{parseFloat(totalProfit).toFixed(3)} {isPositiveChange ? "+" : ""} Today
                </p>
              </div>
            </div>
          </div>

          {/* Total Cash Held Card */}
          <div className="col-md-6 col-sm-12">
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body">
                <h5 className="card-title text-white-50">Total Cash Held</h5>
                <p className="card-text display-6 fw-bold text-light">
                  <HiOutlineCurrencyRupee />{parseFloat(cashHeld).toFixed(3)}{" "}
                </p>
                <p className="card-text text-muted">&nbsp;</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3 mt-3">
          {/* Total Stocks Value Card */}
          <div className="col-md-6 col-sm-12">
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body">
                <h5 className="card-title text-white-50">Total Stocks Value</h5>
                <p
                  className="card-text display-6 fw-bold text-light"
                >
                  <HiOutlineCurrencyRupee />{calculateTotal(portfolioData?.stocks || [])}{" "}
                </p>
                <p
                  className={`card-text ${
                    isPositiveChange ? "text-success" : "text-danger"
                  }`}
                >
                  {isPositiveChange ? "+" : ""}
                  <HiOutlineCurrencyRupee />{parseFloat(totalProfit).toFixed(3)} {isPositiveChange ? "+" : ""} Today
                </p>
              </div>
            </div>
          </div>

          {/* XIRR Value Card */}
          <div className="col-md-6 col-sm-12">
            <div className="card bg-dark border-secondary h-100">
              <div className="card-body">
                <h5 className="card-title text-white-50">XIRR</h5>
                <p className="card-text display-6 fw-bold text-light">
                  {xirr}{"%"}
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