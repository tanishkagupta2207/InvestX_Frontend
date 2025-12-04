import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StockChart from "./StockChart"; 
import AddToWatchlistModal from "../watchlistComponents/AddToWatchlistModal";

// --- Helper: Format API Data for Mutual Funds ---
const formatApiDataForChart = (apiData) => {
  if (!apiData || !Array.isArray(apiData)) return [];
  
  return apiData
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => {
      const navValue = parseFloat(item.nav);
      return {
        x: new Date(item.date),
        // Since Mutual Funds only have NAV, we map it to Open, High, Low, and Close.
        // This allows the candlestick chart to accept the data without crashing,
        // effectively rendering it as a line or a flat bar.
        y: [navValue, navValue, navValue, navValue], 
      };
    });
};

// --- Helper Hook: Intersection Observer (Lazy Loading) ---
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

    const currentElement = containerRef.current;

    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.disconnect();
      }
    };
  }, [options]);

  return [containerRef, isVisible];
};

const MutualFundChartWrapper = ({ fundName, fundHouse, security_id, showAlert }) => {
  const navigate = useNavigate();
  
  // Ref for Lazy Loading
  const [containerRef, isVisible] = useIntersectionObserver({
    root: null,
    rootMargin: "100px",
    threshold: 0.1,
  });

  // Default to true for Mutual Funds because Line Charts look better for single values (NAV)
  const [simplifyGraph, setSimplifyGraph] = useState(true); 
  const [chartData, setChartData] = useState([]);
  
  // Valid ranges for Mutual Funds: 1M, 6M, 1Y, 2Y
  const [selectedRange, setSelectedRange] = useState("1Y"); 
  const availableRanges = ["1M", "6M", "1Y", "2Y", "3Y"];
  
  const [isLoading, setIsLoading] = useState(false);
  const [watchlistMessage, setWatchlistMessage] = useState("");
  const [showWatchlistModal, setShowWatchlistModal] = useState(false);

  const [fundDetails, setFundDetails] = useState(null);
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
      const [chartRes, detailsRes] = await Promise.all([
        // 1. Fetch Historical Data (NAV)
        fetch(`${process.env.REACT_APP_HOST_URL}api/mutualfund/data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ security_id: security_id, range: range }),
        }),
        // 2. Fetch Details (Current NAV) - only if not already loaded
        !fundDetails ? fetch(`${process.env.REACT_APP_HOST_URL}api/mutualfund/details`, {
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
        console.error(`Error fetching MF chart: ${chartJson.msg || chartJson.error}`);
      }

      if (detailsRes) {
        const detailsJson = await detailsRes.json();
        if (detailsJson.success) {
          setFundDetails({
            symbol: "NAV", 
            name: detailsJson.data.name,
            companyId: detailsJson.data._id,
            current_price: detailsJson.current_nav, 
            security_type: 'mutualfund'
          });
        }
      }

    } catch (error) {
      console.error("Error fetching MF data:", error);
    } finally {
      setIsLoading(false);
      setHasFetchedInitialData(true);
    }
  }, [security_id, fundDetails]);

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
    if (!security_id || !fundDetails) {
      showAlert("Data loading, please wait...", "warning");
      return;
    }
    navigate("/trade/action", { 
        state: { 
            security: fundDetails, 
            action: action,
            type: 'mutualfund' 
        } 
    });
  };

  return (
    <div className="col-12 mb-4" ref={containerRef} style={{ minHeight: "450px" }}> 
      <div className="card bg-dark border-secondary h-100">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          {/* Header */}
          <div className="d-flex align-items-center gap-2" style={{ maxWidth: '60%' }}>
            <h5 className="mb-0 text-white text-truncate" title={fundName}>
              {fundName}
            </h5>
            <small className="text-muted d-none d-md-inline">({fundHouse})</small>
             <button
              type="button"
              className="btn btn-sm btn-outline-info"
              onClick={handleShowModal}
              disabled={isLoading}
            >
              + Watchlist
            </button>
          </div>

          {/* Status message */}
          {watchlistMessage && (
            <div className={`alert alert-${watchlistMessage.includes("Error") ? "danger" : "success"} py-1 px-3 m-2 mb-0 text-center small`}>
              {watchlistMessage}
            </div>
          )}

          {/* Controls */}
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
                id={`simplifyGraphSwitch-${security_id}`}
                checked={simplifyGraph}
                onChange={handleToggleSimplify}
                disabled={isLoading}
              />
              <label className="form-check-label text-white" htmlFor={`simplifyGraphSwitch-${security_id}`}>
                Line Chart
              </label>
            </div>
          </div>
        </div>

        {/* Chart Body */}
        <div className="card-body position-relative" style={{ minHeight: "380px" }}>
          
          {/* 1. Not Visible yet */}
          {!isVisible && (
             <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                <div className="spinner-border text-secondary me-2" role="status"></div>
                <span>Waiting to scroll into view...</span>
             </div>
          )}

          {/* 2. Loading */}
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
                symbol: "NAV", 
                name: fundName,
                data: chartData,
              }}
              simplifyGraph={simplifyGraph}
            />
          )}

          {/* 4. No Data */}
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
            disabled={!isVisible || isLoading} 
          >
            Invest (Buy)
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleTradeAction("SELL")}
            disabled={!isVisible || isLoading}
          >
            Redeem (Sell)
          </button>
        </div>
      </div>

      <AddToWatchlistModal
        show={showWatchlistModal}
        onClose={handleCloseModal}
        security_id={security_id}
        showAlert={showAlert}
        stockName={fundName}
      />
    </div>
  );
};

export default React.memo(MutualFundChartWrapper);