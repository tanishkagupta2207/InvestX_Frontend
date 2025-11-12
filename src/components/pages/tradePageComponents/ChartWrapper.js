import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StockChart from "./StockChart";
import AddToWatchlistModal from "../watchlistComponents/AddToWatchlistModal";

// --- Helper Function to Format API Data ---
const formatApiDataForChart = (apiData) => {
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
const ChartWrapper = ({
  stockSymbol,
  stockName,
  security_id,
  showAlert,
  inInWatchList,
  watchlistName, // NEW: Added watchlistName prop
}) => {
  const navigate = useNavigate();
  const [simplifyGraph, setSimplifyGraph] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("1Y");
  const [isLoading, setIsLoading] = useState(false);
  const availableRanges = ["1D", "5D", "1M", "6M", "1Y", "2Y"];

  const [watchlistMessage, setWatchlistMessage] = useState("");
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);
  const [isAddedToWatchlist, setIsAddedToWatchlist] = useState(inInWatchList); // NEW: State to track if it's in a watchlist

  const [company, setCompany] = useState(null);
  const [actionAllowed, setActionAllowed] = useState(false);
  const [marketEndedAlertShown, setMarketEndedAlertShown] = useState(false);

  // Function to show the modal
  const handleShowModal = () => {
    setShowWatchlistModal(true);
  };

  // Function to close the modal and handle messages
  const handleCloseModal = (message = "") => {
    setShowWatchlistModal(false);
    if (message) {
      setWatchlistMessage(message);
      setTimeout(() => setWatchlistMessage(""), 5000);
    }
  };

  // NEW: Function to handle removal from watchlist
  const handleRemoveFromWatchlist = async () => {
    if (!security_id || !watchlistName) {
      showAlert("Error: Missing company ID or watchlist name for removal.", "danger");
      return;
    }
    setIsLoading(true);
    setWatchlistMessage("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/watchlist/remove`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            companyId: security_id,
            watchlistName: watchlistName,
          }),
        }
      );
      const res = await response.json();
      if (res.success) {
        setWatchlistMessage(res.msg);
        setIsAddedToWatchlist(false); // Update state on successful removal
      } else {
        setWatchlistMessage(`Error: ${res.msg || "Failed to remove from watchlist."}`);
      }
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      setWatchlistMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setWatchlistMessage(""), 5000);
    }
  };

  const fetchChartData = useCallback(async (symbol, range, security_id) => {
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
          body: JSON.stringify({ security_id: security_id, range: range }),
        }
      );
      const res = await response.json();
      if (res.success) {
        const formattedData = formatApiDataForChart(res.data);
        setChartData(formattedData);
        console.log(`Fetched chart data for ${symbol} (${range}):`, formattedData);
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

  const fetchCompany = useCallback(async (security_id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/stock/company`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ security_id: security_id }),
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
    if (security_id) {
      fetchChartData(stockSymbol, selectedRange, security_id);
    }
  }, [security_id, selectedRange, fetchChartData, simplifyGraph, stockSymbol]);

  useEffect(() => {
    if (security_id) {
      fetchCompany(security_id);
    }
  }, [security_id, fetchCompany]);

  const handleRangeChange = (newRange) => {
    setSelectedRange(newRange);
  };

  const handleToggleSimplify = (event) => {
    setSimplifyGraph(event.target.checked);
  };

  const handleTradeAction = (action) => {
    if (!security_id) {
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

  return (
    <div className="col-12 mb-4">
      <div className="card bg-dark border-secondary h-100">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          {/* Watchlist button placed next to the company name */}
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0 text-white">
              {stockName} ({stockSymbol})
            </h5>
            {isAddedToWatchlist ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={handleRemoveFromWatchlist}
                disabled={isLoading}
                title={`Remove from ${watchlistName}`}
              >
                - Watchlist
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-sm btn-outline-info"
                onClick={handleShowModal}
                disabled={isLoading}
                title="Add to Watchlist"
              >
                + Watchlist
              </button>
            )}
          </div>

          {/* Status message */}
          {watchlistMessage && (
            <div
              className={`alert alert-${
                watchlistMessage.includes("Error") ? "danger" : "success"
              } py-1 px-3 m-2 mb-0 text-center small`}
              role="alert"
            >
              {watchlistMessage}
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
                {range}
              </button>
            ))}
            <div
              className="form-check form-switch"
              style={{ marginLeft: "10px" }}
            >
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="simplifyGraphSwitch"
                checked={simplifyGraph}
                onChange={handleToggleSimplify}
                disabled={isLoading}
              />
              <label
                className="form-check-label text-white"
                htmlFor="simplifyGraphSwitch"
              >
                Simplify Graph
              </label>
            </div>
          </div>
        </div>
        <div
          className="card-body position-relative"
          style={{ minHeight: "380px" }}
        >
          {isLoading && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
              style={{ zIndex: 10 }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
          {!isLoading && (
            <StockChart
              stockData={{
                symbol: stockSymbol,
                name: stockName,
                data: chartData,
              }}
              simplifyGraph={simplifyGraph}
            />
          )}
          {!isLoading && chartData.length === 0 && (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              Failed to load data or no data available.
            </div>
          )}
        </div>
        <div className="card-footer bg-dark border-secondary-subtle d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-success"
            onClick={() => handleTradeAction("BUY")}
            disabled={isLoading || !actionAllowed}
            aria-label={`Buy ${stockSymbol}`}
          >
            Buy
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleTradeAction("SELL")}
            disabled={isLoading || !actionAllowed}
            aria-label={`Sell ${stockSymbol}`}
          >
            Sell
          </button>
        </div>
      </div>

      {/* Render the modal component */}
      <AddToWatchlistModal
        show={showWatchlistModal}
        onClose={handleCloseModal}
        security_id={security_id}
        showAlert={showAlert}
        stockName={stockName}
      />
    </div>
  );
};

export default ChartWrapper;