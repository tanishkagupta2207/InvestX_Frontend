import React, { useCallback, useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";

const MutualFundHoldingsAnalysis = (props) => {
  const portfolioData = props.portfolioData;
  const availableColors = props.availableColors;
  const minRows = 7; // Minimum rows to display in the table
  const dataRows = portfolioData.mutualFunds?.length || 0;
  const rowsToDisplay = Math.max(minRows, dataRows);

  // --- State Variables ---

  const [totalValue, setTotalValue] = useState(0);
  const [fundLabels, setFundLabels] = useState([]);
  const [fundValues, setFundValues] = useState([]);
  const [individualProfitPercentages, setIndividualProfitPercentages] =
    useState([]);
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);

  // --- Calculation Functions ---

  const calculateTotal = useCallback((funds) => {
    let total = 0;
    if (funds && Array.isArray(funds)) {
      funds.forEach((fund) => {
        // Use current_price (NAV)
        total += fund.quantity * fund.current_price;
      });
    }
    return parseFloat(total.toFixed(2));
  }, []);

  const calculateTotalProfit = useCallback((funds) => {
    let total = 0;
    if (funds && Array.isArray(funds)) {
      funds.forEach((fund) => {
        // Use current_price and average_price
        total += (fund.current_price - fund.average_price) * fund.quantity;
      });
    }
    return parseFloat(total.toFixed(2));
  }, []);

  // --- useEffect for Data Processing ---

  useEffect(() => {
    if (portfolioData && portfolioData.mutualFunds) {
      const funds = portfolioData.mutualFunds;
      const newFundLabels = funds.map((fund) => fund.name);
      const newFundValues = funds.map(
        (fund) => fund.quantity * fund.current_price
      );
      // Calculate Total Profit
      const newTotalProfit = calculateTotalProfit(funds);
      // Calculate Individual Fund Percentage Return on Investment
      const newIndividualProfitPercentages = funds.map((fund) => {
        const investmentValue = fund.average_price * fund.quantity;
        const currentProfit =
          (fund.current_price - fund.average_price) * fund.quantity;
        const percentageReturn =
          investmentValue === 0 ? 0 : (currentProfit / investmentValue) * 100;
        return parseFloat(percentageReturn.toFixed(2));
      });
      const newBackgroundColors = newFundLabels.map(
        (_, index) => availableColors[index % availableColors.length]
      );

      setFundLabels(newFundLabels);
      setFundValues(newFundValues);
      setTotalProfit(newTotalProfit);
      setIndividualProfitPercentages(newIndividualProfitPercentages);
      setBackgroundColors(newBackgroundColors);
      setTotalValue(calculateTotal(funds));
    }
  }, [portfolioData, availableColors, calculateTotal, calculateTotalProfit]);

  // --- Chart Data Structure ---

  const dataFunds = {
    labels: fundLabels,
    datasets: [
      {
        label: "Mutual Fund Allocation",
        data: fundValues,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const dataProfitPercentage = {
    labels: fundLabels,
    datasets: [
      {
        label: "Individual Fund Percentage Return (%)",
        data: individualProfitPercentages,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  // --- CSV Download Functionality ---
  const handleDownloadCSV = () => {
    if (!portfolioData.mutualFunds || portfolioData.mutualFunds.length === 0) {
      alert("No data available to download.");
      return;
    }

    // Removed Scheme Code from headers
    const headers = [
      "Fund Name",
      "Quantity",
      "Average NAV",
      "Current NAV",
      "Value",
      "Profit Value",
      "Profit Percentage (ROI)",
    ];

    const csvRows = portfolioData.mutualFunds.map((fund) => {
      const fundValue = fund.quantity * fund.current_price;
      const investmentValue = fund.quantity * fund.average_price;
      const profitValue = fundValue - investmentValue;
      const profitPercentage =
        investmentValue === 0 ? 0 : (profitValue / investmentValue) * 100;

      return [
        `"${fund.name.replace(/"/g, '""')}"`, // Handle quotes
        // fund.scheme_code || "N/A", // SCHEME CODE REMOVED
        fund.quantity,
        fund.average_price.toFixed(4),
        fund.current_price.toFixed(4),
        fundValue.toFixed(2),
        profitValue.toFixed(2),
        profitPercentage.toFixed(2),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Mutual_Fund_Holdings_INVEXTX.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    props.showAlert("CSV downloaded successfully!", "success");
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
        beginAtZero: false,
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

  if (!portfolioData || !portfolioData.mutualFunds) {
    return null;
  }

  return (
    <div>
      <h1
        className="text-light"
        style={{ textAlign: "center", marginBottom: "20px" }}
      >
        Mutual Fund Holdings Analysis
      </h1>
      {/* Charts section */}
      <div
        className="row g-3"
        style={{ margin: "0px", paddingLeft: "4px", paddingRight: "4px" }}
      >
        <div className="col-lg-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body text-light">
              <h4 className="card-title">Mutual Funds Breakdown</h4>
              <div
                className="d-flex justify-content-center align-items-center bg-secondary bg-opacity-10 rounded"
                style={{ height: "372px" }}
              >
                {dataRows > 0 ? (
                  <Pie data={dataFunds} options={options} />
                ) : (
                  <p className="text-muted">
                    No mutual funds to display in chart.
                  </p>
                )}
              </div>
              <p className="text-muted">Pie Chart for Fund Distribution</p>
              <h5>
                Total Value of Funds: <HiOutlineCurrencyRupee />
                {totalValue.toFixed(2)}
              </h5>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body text-light">
              <h4 className="card-title">Individual Fund Percentage Return</h4>
              <div
                className="d-flex justify-content-center align-items-center bg-secondary bg-opacity-10 rounded"
                style={{ height: "372px" }}
              >
                {dataRows > 0 ? (
                  <Bar data={dataProfitPercentage} options={chartOptions} />
                ) : (
                  <p className="text-muted">No funds to display in chart.</p>
                )}
              </div>
              <p className="text-muted">
                Bar Chart for Individual Fund Return on Investment
              </p>
              <h5>
                Total Profit/loss in Funds: <HiOutlineCurrencyRupee />
                {totalProfit.toFixed(2)}
              </h5>
            </div>
          </div>
        </div>
      </div>
      <div>&nbsp;</div> {/* Detailed Table Section */}
      <div
        className="row g-3"
        style={{ margin: "0px", paddingLeft: "4px", paddingRight: "4px" }}
      >
        <div className="card bg-dark border-secondary">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h4 className="card-title mb-0 text-light">
              Detailed Mutual Fund Holdings Overview
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
                <thead>
                  <tr>
                    <th>Fund Name</th>
                    {/* <th>Scheme Code</th> REMOVED */}
                    <th>Quantity</th>
                    <th>Average NAV</th>
                    <th>Current NAV</th>
                    <th>Value</th>
                    <th>Profit Value</th>
                    <th>Profit Percentage (ROI)</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.mutualFunds?.map((fund, index) => {
                    const fundValue = fund.quantity * fund.current_price;
                    const investmentValue = fund.quantity * fund.average_price;
                    const profitValue = fundValue - investmentValue;
                    const profitPercentage =
                      investmentValue === 0
                        ? 0
                        : (profitValue / investmentValue) * 100;
                    const isPositive = profitValue >= 0;

                    return (
                      <tr key={fund.id || index}>
                        <td>{fund.name}</td>
                        {/* <td>{fund.scheme_code || "N/A"}</td> REMOVED */}
                        <td>{fund.quantity}</td>
                        <td>{fund.average_price.toFixed(4)}</td>
                        <td>{fund.current_price.toFixed(4)}</td>
                        <td>
                          <HiOutlineCurrencyRupee size={16} />
                          {fundValue.toFixed(2)}
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
                          {profitPercentage.toFixed(2)} %
                        </td>
                      </tr>
                    );
                  })}
                  {/* Padding rows to maintain height */}
                  {[...Array(rowsToDisplay - dataRows)].map((_, index) => (
                    <tr key={`pad-${index}`}>
                      <td>&nbsp;</td>
                      {/* <td>&nbsp;</td> REMOVED */}
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                      <td>&nbsp;</td>
                    </tr>
                  ))}
                  {dataRows > 0 && (
                    <tr>
                      <td
                        colSpan="4" // Adjusted colspan from 5 to 4
                        style={{ textAlign: "right", fontWeight: "bold" }}
                      >
                        Total:
                      </td>
                      <td style={{ fontWeight: "bold" }}>
                        <HiOutlineCurrencyRupee size={16} />
                        {totalValue.toFixed(2)}
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

export default MutualFundHoldingsAnalysis;