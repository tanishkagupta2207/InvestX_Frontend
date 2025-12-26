import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StockChart from "./StockChart";
import AddToWatchlistModal from "../watchlistComponents/AddToWatchlistModal";

// --- Helper: Format API Data ---
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

// --- Helper Hook: Intersection Observer ---
const useIntersectionObserver = (options) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect(); 
      }
    }, options);

    // FIX: Capture the current value of the ref to a local variable
    const currentElement = containerRef.current;

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      // FIX: Use the captured local variable in the cleanup function
      if (currentElement) {
        observer.disconnect();
      }
    };
  }, [options]);

  return [containerRef, isVisible];
};

const ChartWrapper = ({ stockSymbol, stockName, sector, security_id, showAlert }) => {
  const navigate = useNavigate();
  
  // Ref for Lazy Loading
  const [containerRef, isVisible] = useIntersectionObserver({
    root: null,
    rootMargin: "100px",
    threshold: 0.1,
  });

  const [simplifyGraph, setSimplifyGraph] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("1Y");
  const [isLoading, setIsLoading] = useState(false);
  const availableRanges = ["1D", "5D", "1M", "6M", "1Y", "2Y"];

  const [watchlistMessage, setWatchlistMessage] = useState("");
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  const [company, setCompany] = useState(null);
  const [actionAllowed, setActionAllowed] = useState(false);
  
  const [hasFetchedInitialData, setHasFetchedInitialData] = useState(false);

  // --- Watchlist Handlers ---
  const handleShowModal = () => setShowWatchlistModal(true);
  const handleCloseModal = (success = false, message = "") => {
    setShowWatchlistModal(false);
    if (message) {
      setWatchlistMessage(message);
      setTimeout(() => setWatchlistMessage(""), 5000);
    }
  };

  // --- Data Fetching ---
  const fetchAllData = useCallback(async (range) => {
    if (!security_id) return;
    
    setIsLoading(true);
    try {
      const [chartRes, companyRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_HOST_URL}api/stock/data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ security_id: security_id, range: range }),
        }),
        !company ? fetch(`${process.env.REACT_APP_HOST_URL}api/stock/company`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ security_id: security_id }),
        }) : Promise.resolve(null)
      ]);

      const chartJson = await chartRes.json();
      
      if (chartJson.success) {
        setChartData(formatApiDataForChart(chartJson.data));
      } else {
        console.error(`Error fetching chart: ${chartJson.msg}`);
      }

      if (companyRes) {
        const companyJson = await companyRes.json();
        if (companyJson.success) {
          setCompany({
            symbol: companyJson.data.symbol,
            name: companyJson.data.name,
            companyId: companyJson.data._id,
            current_price: companyJson.current_price,
          });
        }
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
      setHasFetchedInitialData(true);
    }
  }, [security_id, company]);

  // --- Market Hours Logic ---
  useEffect(() => {
    const checkMarketHours = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const day = now.getDay();
      
      const isAfternoonSession = hour > 13 || (hour === 13 && minute >= 30);
      const isMorningSession = hour < 5 || (hour === 5 && minute <= 30);
      const isTradingOpen = (day >= 1 && day <= 5 && isAfternoonSession) || (day >= 2 && day <= 6 && isMorningSession);

      setActionAllowed(isTradingOpen);
    };

    checkMarketHours();
    const intervalId = setInterval(checkMarketHours, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // --- Trigger Fetching on Visibility ---
  useEffect(() => {
    if (isVisible && security_id) {
        fetchAllData(selectedRange);
    }
  }, [isVisible, security_id, selectedRange, fetchAllData]);


  // --- Event Handlers ---
  const handleRangeChange = (newRange) => {
    setSelectedRange(newRange);
  };

  const handleToggleSimplify = (e) => setSimplifyGraph(e.target.checked);

  const handleTradeAction = (action) => {
    if (!security_id || !company) {
      showAlert("Data loading, please wait...", "warning");
      return;
    }
    navigate("/trade/action", { state: { security: company, action } });
  };

  
  const displaySector = sector ? sector.replace(/_/g, " ") : "";

  return (
    <div className="col-12 mb-4" ref={containerRef} style={{ minHeight: "450px" }}> 
      <div className="card bg-dark border-secondary h-100">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          {/* Header & Watchlist Button */}
          <div className="d-flex flex-column" style={{ maxWidth: '60%' }}>
            <div className="d-flex align-items-center gap-2">
                <h5 className="mb-0 text-white text-truncate">
                {stockName} ({stockSymbol})
                </h5>
                <button
                type="button"
                className="btn btn-sm btn-outline-info"
                onClick={handleShowModal}
                disabled={isLoading}
                >
                + Watchlist
                </button>
            </div>
            {/* Added Sector Display here */}
            {displaySector && (
                <small className="text-muted mt-1">
                    Sector: {displaySector}
                </small>
            )}
          </div>

          {/* Status message */}
          {watchlistMessage && (
            <div className={`alert alert-${watchlistMessage.includes("Error") ? "danger" : "success"} py-1 px-3 m-2 mb-0 text-center small`}>
              {watchlistMessage}
            </div>
          )}

          {/* Range Selector & Simplify Switch */}
          <div className="btn-group btn-group-sm flex-wrap">
            {availableRanges.map((range) => (
              <button
                key={range}
                type="button"
                className={`btn ${selectedRange === range ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => handleRangeChange(range)}
                disabled={isLoading}
              >
                {range}
              </button>
            ))}
            <div className="form-check form-switch" style={{ marginLeft: "10px" }}>
              <input
                className="form-check-input"
                type="checkbox"
                id={`simplifyGraphSwitch-${stockSymbol}`}
                checked={simplifyGraph}
                onChange={handleToggleSimplify}
                disabled={isLoading}
              />
              <label className="form-check-label text-white" htmlFor={`simplifyGraphSwitch-${stockSymbol}`}>
                Simplify
              </label>
            </div>
          </div>
        </div>

        {/* Chart Body */}
        <div className="card-body position-relative" style={{ minHeight: "380px" }}>
          
          {/* 1. Not Visible yet (Placeholder) */}
          {!isVisible && (
             <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                <div className="spinner-border text-secondary me-2" role="status"></div>
                <span>Waiting to scroll into view...</span>
             </div>
          )}

          {/* 2. Visible but Loading */}
          {isVisible && isLoading && chartData.length === 0 && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75" style={{ zIndex: 10 }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {/* 3. Data Loaded */}
          {isVisible && chartData.length > 0 && (
            <StockChart
              stockData={{
                symbol: stockSymbol,
                name: stockName,
                data: chartData,
              }}
              simplifyGraph={simplifyGraph}
            />
          )}

          {/* 4. Loaded but no data */}
          {isVisible && !isLoading && chartData.length === 0 && hasFetchedInitialData && (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              Failed to load data or no data available.
            </div>
          )}
        </div>

        {/* Trade Buttons */}
        <div className="card-footer bg-dark border-secondary-subtle d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-success"
            onClick={() => handleTradeAction("BUY")}
            disabled={!isVisible || isLoading || !actionAllowed} 
          >
            Buy
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleTradeAction("SELL")}
            disabled={!isVisible || isLoading || !actionAllowed}
          >
            Sell
          </button>
        </div>
      </div>

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

export default React.memo(ChartWrapper);