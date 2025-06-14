import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StockChart from "./StockChart"; 

// --- Helper Function to Format API Data ---
const formatApiDataForChart = (apiData) => {
  // (Keep the same formatting function as the previous example)
  if (!apiData || !Array.isArray(apiData)) return [];
  return apiData
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => ({
      x: new Date(item.date),
      y: [
        typeof item.open_price === "number" ? item.open_price : null,
        typeof item.high_price === "number" ? item.high_price : null,
        typeof item.low_price === "number" ? item.low_price : null,
        typeof item.close_price === "number" ? item.close_price : null,
      ],
    }));
};

// --- ChartWrapper component ---
const ChartWrapper = ({ stockSymbol, stockName, company_id, showAlert }) => {
  const navigate = useNavigate();
  const [simplifyGraph, setSimplifyGraph] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("1Y");
  const [isLoading, setIsLoading] = useState(false);
  const availableRanges = ["1D", "5D", "1M", "6M", "1Y", "2Y"];
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [watchlistMessage, setWatchlistMessage] = useState("");
  const [company, setCompany] = useState(null);
  const [actionAllowed, setActionAllowed] = useState(false);
  const [marketEndedAlertShown, setMarketEndedAlertShown] = useState(false);

  const fetchChartData = useCallback(async (symbol, range, company_id) => {
    setIsLoading(true);
    setChartData([]);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/stock/data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ company_id: company_id, range: range }),
        }
      );
      const res = await response.json();
      if (res.success) {
        const formattedData = formatApiDataForChart(res.data);
        setChartData(formattedData);
      } else {
        console.error(
          `Error fetching data for ${symbol}: ${res.msg || res.errors[0]?.msg}`
        );
        showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      showAlert("Something went wrong! Please try again later.", "danger");
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, []);

  const fetchCompany = useCallback(async (company_id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/stock/company`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ company_id: company_id }),
        }
      );
      const res = await response.json();
      if (res.success) {
        const companyData = {
          symbol: res.data.symbol,
          name: res.data.name,
          companyId: res.data._id,
          current_price: res.current_price,
        };
        setCompany(companyData);
      } else {
        console.error(
          `Error fetching company data: ${res.msg || res.errors[0]?.msg}`
        );
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
    }
  }, []);

  useEffect(() => {
    const checkMarketHoursAndAlert = () => {
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
      const hour = now.getHours();
      const minute = now.getMinutes();

      // Market days: Monday (1) to Friday (5)
      const isMarketDay = dayOfWeek >= 2 && dayOfWeek <= 6; //one day behind schedule

      // Market hours: 4:00 AM (4) to 8:00 PM (20)
      const marketStartTimeHour = 4;
      const marketEndTimeHour = 20;

      const isMarketOpenTime =
        (hour > marketStartTimeHour ||
          (hour === marketStartTimeHour && minute >= 0)) &&
        (hour < marketEndTimeHour ||
          (hour === marketEndTimeHour && minute === 0));

      if (isMarketDay && isMarketOpenTime) {
        setActionAllowed(true);
        setMarketEndedAlertShown(false); // Reset alert flag if market re-opens
      } else {
        setActionAllowed(false);
        // Check if market has just ended and alert hasn't been shown today
        if (
          isMarketDay &&
          hour >= marketEndTimeHour &&
          !marketEndedAlertShown
        ) {
          showAlert("Market hours have ended for today.", "info");
          setMarketEndedAlertShown(true);
        }
      }
    };

    checkMarketHoursAndAlert(); // Check on initial load

    const intervalId = setInterval(checkMarketHoursAndAlert, 60000); // Check every minute

    return () => clearInterval(intervalId); // Cleanup
  }, [showAlert, marketEndedAlertShown]);

  useEffect(() => {
    if (company_id) {
      fetchChartData(stockSymbol, selectedRange, company_id);
    }
  }, [company_id, selectedRange, fetchChartData, simplifyGraph, stockSymbol]);

  useEffect(() => {
    if (company_id) {
      fetchCompany(company_id);
    }
  }, [company_id, fetchCompany]);

  const handleRangeChange = (newRange) => {
    setSelectedRange(newRange);
  };

  const handleToggleSimplify = (event) => {
    setSimplifyGraph(event.target.checked);
  };

  const handleTradeAction = (action) => {
    if (!company_id) {
      console.error(
        "Cannot initiate trade: companyId is missing for",
        stockSymbol
      );
      showAlert("Unable to initiate trade. Please try again later.", "danger");
      return;
    }
    navigate("/trade/action", {
      state: {
        company: company,
        action: action,
      },
    });
  };

  const handleAddToWatchlist = async () => {
    if (!company_id) {
      console.error(
        "Cannot add to watchlist: company_id is missing for",
        stockSymbol
      );
      setWatchlistMessage("Error: Company ID missing.");
      return;
    }
    setIsWatchlistLoading(true);
    setWatchlistMessage(""); // Clear previous message
    console.log(
      `Attempting to add ${stockSymbol} (ID: ${company_id}) to watchlist...`
    );

    // --- Simulate API Call ---
    try {
      // Replace with your actual API call:
      // const response = await fetch('/api/watchlist', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json', /* Auth */ },
      //     body: JSON.stringify({ companyId: companyId }) // Send ID
      // });
      // const result = await response.json();
      // if (!response.ok || !result.success) {
      //     throw new Error(result.error || 'Failed to add to watchlist.');
      // }
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay
      console.log(`${stockSymbol} added to watchlist (Simulated)`);
      // Set success message (could clear after a few seconds)
      setWatchlistMessage(`${stockSymbol} added to WatchList!`);
      setTimeout(() => setWatchlistMessage(""), 3000); // Clear message after 3s
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      setWatchlistMessage(`Error: ${error.message}`);
      // Don't auto-clear error message
    } finally {
      setIsWatchlistLoading(false);
    }
    // --- End Simulation ---
  };

  return (
    <div className="col-12 mb-4">
      <div className="card bg-dark border-secondary h-100">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="mb-0 text-white">
            {stockName} ({stockSymbol})
          </h5>
          <button
            type="button"
            className="btn btn-sm btn-outline-info"
            style={{ marginRight: "auto" }}
            onClick={handleAddToWatchlist}
            disabled={isWatchlistLoading || isLoading}
            title="Add to Watchlist"
          >
            {isWatchlistLoading ? (
              // Show spinner and visually hidden text when loading
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span className="visually-hidden ms-1">Adding...</span>
              </>
            ) : (
              // Show button text when not loading
              "+ Watchlist"
            )}
          </button>
          {watchlistMessage && (
            <div
              className={`alert alert-${
                watchlistMessage.startsWith("Error") ? "danger" : "success"
              } py-1 px-3 m-2 mb-0 text-center small`}
              role="alert"
            >
              {" "}
              {watchlistMessage}{" "}
            </div>
          )}
          <div
            className="btn-group btn-group-sm flex-wrap"
            role="group"
            aria-label="Chart Range Selector"
          >
            {availableRanges.map((range) => (
              <button
                key={range}
                type="button"
                className={`btn ${
                  selectedRange === range
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => handleRangeChange(range)}
                disabled={isLoading}
              >
                {range}{" "}
              </button>
            ))}{" "}
            <div
              className="form-check form-switch"
              style={{ marginLeft: "10px" }}
            >
              {" "}
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="simplifyGraphSwitch"
                checked={simplifyGraph}
                onChange={handleToggleSimplify}
                disabled={isLoading}
              />{" "}
              <label
                className="form-check-label text-white"
                htmlFor="simplifyGraphSwitch"
              >
                {" "}
                Simplify Graph{" "}
              </label>{" "}
            </div>
          </div>{" "}
        </div>{" "}
        <div
          className="card-body position-relative"
          style={{ minHeight: "380px" }}
        >
          {" "}
          {isLoading && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
              style={{ zIndex: 10 }}
            >
              {" "}
              <div className="spinner-border text-primary" role="status">
                {" "}
                <span className="visually-hidden">Loading...</span>{" "}
              </div>{" "}
            </div>
          )}{" "}
          {/* Pass simplifyGraph down */}{" "}
          {!isLoading && (
            <StockChart
              stockData={{
                symbol: stockSymbol,
                name: stockName,
                data: chartData,
              }}
              simplifyGraph={simplifyGraph}
            />
          )}{" "}
          {!isLoading && chartData.length === 0 && (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              {" "}
              Failed to load data or no data available.{" "}
            </div>
          )}{" "}
        </div>{" "}
        <div className="card-footer bg-dark border-secondary-subtle d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-success"
            onClick={() => handleTradeAction("BUY")}
            disabled={isLoading || !actionAllowed} // Disable if chart data is loading
            aria-label={`Buy ${stockSymbol}`}
          >
            Buy
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleTradeAction("SELL")}
            disabled={isLoading || !actionAllowed} // Disable if chart data is loading
            aria-label={`Sell ${stockSymbol}`}
          >
            Sell
          </button>
        </div>
      </div>{" "}
    </div>
  );
};

export default ChartWrapper;