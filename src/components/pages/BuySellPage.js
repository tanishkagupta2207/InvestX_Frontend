import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SideBar from "../SideBar"; // Ensure this path is correct based on your folder structure
import { HiOutlineCurrencyRupee } from "react-icons/hi2";

// --- Helper Functions ---
const formatCurrency = (value) => {
  if (typeof value !== "number" || isNaN(value)) return " --.--";
  return `${value.toFixed(2)}`;
};

// =================================================================================
//                            MUTUAL FUND TRADE FORM
// =================================================================================
function MutualFundTradeForm({ action, fund, showAlert }) {
  // Order Types: MARKET (Lumpsum), SIP, SWP
  const [orderType, setOrderType] = useState("MARKET");
  const [quantity, setQuantity] = useState(""); // Units
  const [frequency, setFrequency] = useState("MONTHLY"); // For SIP/SWP
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const {
    name = "Unknown Fund",
    current_price: currentNav = 0, // Mapped from 'current_nav' in wrapper
    companyId: security_id, // Mapped from 'security_id' in wrapper
    fund_house = "",
  } = fund || {};

  // --- Calculate Estimated Value ---
  useEffect(() => {
    const numQuantity = parseFloat(quantity);
    const numNav = parseFloat(currentNav);

    if (!isNaN(numQuantity) && numQuantity > 0 && numNav > 0) {
      setEstimatedValue(numQuantity * numNav);
    } else {
      setEstimatedValue(0);
    }
  }, [quantity, currentNav]);

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    // Allow decimal units for Mutual Funds
    if (val === "" || (/^\d*\.?\d*$/.test(val) && parseFloat(val) >= 0)) {
      setQuantity(val);
    }
  };

  // --- API Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const numQuantity = parseFloat(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) {
      showAlert("Please enter a valid quantity (units).", "Info");
      setIsLoading(false);
      return;
    }

    // Determine Endpoint based on Order Type
    let endpoint = "";
    const payload = {
      action: action, // "BUY" or "SELL"
      quantity: quantity,
      security_id: security_id,
    };

    if (orderType === "MARKET") {
      endpoint = "api/transaction/mf/market";
    } else if (orderType === "SIP") {
      endpoint = "api/transaction/mf/sip";
      payload.frequency = frequency;
    } else if (orderType === "SWP") {
      endpoint = "api/transaction/mf/swp";
      payload.frequency = frequency;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const res = await response.json();
      if (res.success) {
        showAlert(res.msg || "Order Placed successfully", "success");
        // --- Navigation Logic: Go back to Mutual Funds Dashboard ---
        navigate("/mutualfunds"); 
      } else {
        showAlert(res.msg || "An error occurred", "danger");
      }
    } catch (error) {
      console.error("MF Order failed:", error);
      showAlert("An error occurred while placing the order.", "danger");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // --- Navigation Logic: Go back to Mutual Funds Dashboard ---
    navigate("/mutualfunds");
  };

  // --- UI Logic ---
  const isBuy = action === "BUY";

  // Determine Display Title
  let titleAction = "";
  if (orderType === "MARKET")
    titleAction = isBuy ? "Invest Lumpsum" : "Redeem";
  else if (orderType === "SIP") titleAction = "Start SIP";
  else if (orderType === "SWP") titleAction = "Start SWP";

  const btnClass = isBuy ? "btn-success" : "btn-danger";
  const costLabel = isBuy ? "Estimated Cost" : "Estimated Proceeds";

  return (
    <div className="card bg-dark text-white border-secondary shadow">
      <div className="card-header border-secondary">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0 text-truncate" style={{ maxWidth: "80%" }}>
            {titleAction}: {name}
          </h4>
          <span className="badge bg-primary">Mutual Fund</span>
        </div>
        {fund_house && <small className="text-muted">{fund_house}</small>}
      </div>

      <div className="card-body">
        <div className="alert alert-dark border-secondary mb-3">
          <div className="d-flex justify-content-between">
            <span>Current NAV:</span>
            <span className="fw-bold">
              <HiOutlineCurrencyRupee /> {formatCurrency(currentNav)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Order Type Selector */}
          <div className="mb-3">
            <label htmlFor="orderType" className="form-label">
              Investment Type
            </label>
            <select
              className="form-select bg-dark text-white border-secondary"
              id="orderType"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              disabled={isLoading}
            >
              <option value="MARKET">Lumpsum (One-time)</option>
              {isBuy && (
                <option value="SIP">SIP (Systematic Investment Plan)</option>
              )}
              {!isBuy && (
                <option value="SWP">SWP (Systematic Withdrawal Plan)</option>
              )}
            </select>
          </div>

          {/* Quantity Input */}
          <div className="mb-3">
            <label htmlFor="quantity" className="form-label">
              Quantity (Units)
            </label>
            <input
              type="number"
              className="form-control bg-dark text-white border-secondary"
              id="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              placeholder="Enter units (e.g., 10.5)"
              min="0"
              step="0.001"
              required
              disabled={isLoading}
            />
            <div className="form-text text-muted">
              Note: Orders are executed based on Units.
            </div>
          </div>

          {/* Frequency Input (Only for SIP/SWP) */}
          {(orderType === "SIP" || orderType === "SWP") && (
            <div className="mb-3">
              <label htmlFor="frequency" className="form-label">
                Frequency
              </label>
              <select
                className="form-select bg-dark text-white border-secondary"
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                disabled={isLoading}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          )}

          {/* Estimated Value Display */}
          <div className="mb-4 text-center border border-secondary rounded p-3 bg-opacity-10 bg-secondary">
            <p className="mb-1 text-muted">{costLabel}:</p>
            <h4 className="mb-1">
              <HiOutlineCurrencyRupee /> {formatCurrency(estimatedValue)}
            </h4>
            <small className="text-info">
              (Based on latest NAV. Actual value depends on execution date.)
            </small>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary btn-lg"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${btnClass} btn-lg`}
              disabled={isLoading || estimatedValue <= 0}
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Processing...
                </>
              ) : (
                `Confirm ${
                  orderType === "MARKET"
                    ? isBuy
                      ? "Investment"
                      : "Redemption"
                    : orderType
                }`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =================================================================================
//                            STOCK TRADE FORM
// =================================================================================
function StockTradeForm({ action, security, showAlert }) {
  const [orderType, setOrderType] = useState("MARKET");
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [takeProfitPrice, setTakeProfitPrice] = useState("");
  const [timeInForce, setTimeInForce] = useState("DAY");
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const {
    symbol = "----",
    name = "Unknown Company",
    current_price: currentMarketPrice = 0,
  } = security || {};

  // Calculate estimated cost/proceeds
  useEffect(() => {
    const numQuantity = parseFloat(quantity);
    const numLimitPrice = parseFloat(limitPrice);
    const numMarketPrice = parseFloat(currentMarketPrice);
    const numTakeProfitPrice = parseFloat(takeProfitPrice);

    if (!isNaN(numQuantity) && numQuantity > 0) {
      let priceToUse = numMarketPrice;

      if (orderType === "LIMIT" || orderType === "STOP_LIMIT") {
        if (!isNaN(numLimitPrice) && numLimitPrice > 0) {
          priceToUse = numLimitPrice;
        } else {
          setEstimatedValue(0);
          return;
        }
      } else if (orderType === "STOP") {
        priceToUse = numMarketPrice;
      } else if (orderType === "TAKE_PROFIT") {
        if (!isNaN(numTakeProfitPrice) && numTakeProfitPrice > 0) {
          priceToUse = numTakeProfitPrice;
        }
      }

      if (priceToUse > 0) {
        setEstimatedValue(numQuantity * priceToUse);
      } else if (orderType === "MARKET" && numMarketPrice <= 0) {
        setEstimatedValue(0);
        showAlert("Market price unavailable for estimation.", "danger");
      } else if (orderType !== "MARKET" && priceToUse <= 0) {
        setEstimatedValue(0);
      } else {
        setEstimatedValue(0);
      }
    } else {
      setEstimatedValue(0);
    }
    //eslint-disable-next-line
  }, [quantity, orderType, limitPrice, currentMarketPrice]);

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d*\.?\d*$/.test(val) && parseFloat(val) >= 0)) {
      setQuantity(val);
    }
  };

  const handlePriceChange = (setter) => (e) => {
    const val = e.target.value;
    if (val === "" || (/^\d*\.?\d{0,2}$/.test(val) && parseFloat(val) >= 0)) {
      setter(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // ... (Validation logic remains the same) ...
    const numQuantity = parseFloat(quantity);
    const numLimitPrice = parseFloat(limitPrice);
    const numStopPrice = parseFloat(stopPrice);
    const numTakeProfitPrice = parseFloat(takeProfitPrice);

    if (isNaN(numQuantity) || numQuantity <= 0) {
      showAlert("Please enter a valid quantity greater than zero.", "Info");
      setIsLoading(false);
      return;
    }
    
    // Quick validation check for prices based on order type
    if ((orderType.includes("LIMIT") && (isNaN(numLimitPrice) || numLimitPrice <= 0)) ||
        (orderType.includes("STOP") && (isNaN(numStopPrice) || numStopPrice <= 0)) ||
        (orderType === "TAKE_PROFIT" && (isNaN(numTakeProfitPrice) || numTakeProfitPrice <= 0))) {
        showAlert("Please enter a valid trigger/limit price.", "Info");
        setIsLoading(false);
        return;
    }

    // Common Fetch Wrapper
    const submitOrder = async (endpoint, body) => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_HOST_URL}${endpoint}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": `${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(body),
          }
        );
        const res = await response.json();
        if (res.success) {
          showAlert("Order Placed successfully", "success");
          // --- Navigation Logic: Go back to Stocks Dashboard ---
          navigate("/stocks"); 
        } else {
          console.error(`Error placing order ${res.msg || res.errors[0]?.msg}`);
          showAlert(
            res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
            "danger"
          );
        }
      } catch (error) {
        console.error("Order submission failed:", error);
        showAlert("An error occurred while placing the order.", "danger");
      } finally {
        setIsLoading(false);
      }
    };

    const baseBody = {
      action: action,
      quantity: quantity,
      companyId: security.companyId,
    };

    if (orderType === "MARKET") {
      await submitOrder("api/transaction/market", {
        ...baseBody,
        price: currentMarketPrice,
      });
    } else if (orderType === "LIMIT") {
      await submitOrder("api/transaction/limit", {
        ...baseBody,
        limit_price: numLimitPrice,
        time_in_force: timeInForce,
      });
    } else if (orderType === "STOP") {
      await submitOrder("api/transaction/stopLoss", {
        ...baseBody,
        stop_price: numStopPrice,
        time_in_force: timeInForce,
      });
    } else if (orderType === "STOP_LIMIT") {
      await submitOrder("api/transaction/stopLimit", {
        ...baseBody,
        stop_price: numStopPrice,
        limit_price: numLimitPrice,
        time_in_force: timeInForce,
      });
    } else if (orderType === "TAKE_PROFIT") {
      await submitOrder("api/transaction/takeProfit", {
        ...baseBody,
        take_profit_price: numTakeProfitPrice,
        time_in_force: timeInForce,
      });
    }
  };

  const handleCancel = () => {
    // --- Navigation Logic: Go back to Stocks Dashboard ---
    navigate("/stocks"); 
  };

  // UI Variable Helpers
  const isBuyAction = action === "BUY";
  const titleAction = isBuyAction ? "Buy" : "Sell";
  const btnClass = isBuyAction ? "btn-success" : "btn-danger";
  const costLabel = isBuyAction ? "Estimated Cost" : "Estimated Proceeds";
  const showLimitPrice = orderType === "LIMIT" || orderType === "STOP_LIMIT";
  const showStopPrice = orderType === "STOP" || orderType === "STOP_LIMIT";
  const showTakeProfitPrice = orderType === "TAKE_PROFIT";
  const showTimeInForce = orderType !== "MARKET";

  return (
    <div className="card bg-dark text-white border-secondary shadow">
      <div className="card-header">
        <h4 className="mb-0">
          {titleAction} {name} ({symbol})
        </h4>
        <span className="badge bg-secondary">Stock</span>
      </div>
      <div className="card-body">
        <p className="text-muted mb-3">
          Market Price: <HiOutlineCurrencyRupee />
          {formatCurrency(currentMarketPrice)}
        </p>
        <form onSubmit={handleSubmit}>
          {/* Order Type */}
          <div className="mb-3">
            <label htmlFor={`orderType-${symbol}`} className="form-label">
              Order Type
            </label>
            <select
              className="form-select bg-dark text-white border-secondary"
              id={`orderType-${symbol}`}
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              disabled={isLoading}
            >
              <option value="MARKET">Market</option>
              <option value="LIMIT">Limit</option>
              <option value="STOP">Stop Loss</option>
              <option value="STOP_LIMIT">Stop Limit</option>
              <option value="TAKE_PROFIT">Take Profit</option>
            </select>
          </div>

          {/* Quantity */}
          <div className="mb-3">
            <label htmlFor={`quantity-${symbol}`} className="form-label">
              Quantity
            </label>
            <input
              type="number"
              className="form-control bg-dark text-white border-secondary"
              id={`quantity-${symbol}`}
              value={quantity}
              onChange={handleQuantityChange}
              placeholder="Number of shares"
              min="0"
              step="1"
              required
              disabled={isLoading}
            />
          </div>

          {/* Limit Price */}
          {showLimitPrice && (
            <div className="mb-3">
              <label htmlFor={`limitPrice-${symbol}`} className="form-label">
                Limit Price
              </label>
              <div className="input-group">
                <span className="input-group-text bg-secondary border-secondary text-white">
                  <HiOutlineCurrencyRupee />
                </span>
                <input
                  type="number"
                  className="form-control bg-dark text-white border-secondary"
                  id={`limitPrice-${symbol}`}
                  value={limitPrice}
                  onChange={handlePriceChange(setLimitPrice)}
                  placeholder="Price per share"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Stop Price */}
          {showStopPrice && (
            <div className="mb-3">
              <label htmlFor={`stopPrice-${symbol}`} className="form-label">
                Stop Price
              </label>
              <div className="input-group">
                <span className="input-group-text bg-secondary border-secondary text-white">
                  <HiOutlineCurrencyRupee />
                </span>
                <input
                  type="number"
                  className="form-control bg-dark text-white border-secondary"
                  id={`stopPrice-${symbol}`}
                  value={stopPrice}
                  onChange={handlePriceChange(setStopPrice)}
                  placeholder="Trigger price per share"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Take Profit Price */}
          {showTakeProfitPrice && (
            <div className="mb-3">
              <label
                htmlFor={`takeProfitPrice-${symbol}`}
                className="form-label"
              >
                Take Profit Price
              </label>
              <div className="input-group">
                <span className="input-group-text bg-secondary border-secondary text-white">
                  <HiOutlineCurrencyRupee />
                </span>
                <input
                  type="number"
                  className="form-control bg-dark text-white border-secondary"
                  id={`takeProfitPrice-${symbol}`}
                  value={takeProfitPrice}
                  onChange={handlePriceChange(setTakeProfitPrice)}
                  placeholder="Trigger price per share"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Time in Force */}
          {showTimeInForce && (
            <div className="mb-3">
              <label htmlFor={`timeInForce-${symbol}`} className="form-label">
                Time In Force
              </label>
              <select
                className="form-select bg-dark text-white border-secondary"
                id={`timeInForce-${symbol}`}
                value={timeInForce}
                onChange={(e) => setTimeInForce(e.target.value)}
                disabled={isLoading}
              >
                <option value="DAY">Day</option>
                <option value="GTC">Good 'til Canceled (GTC)</option>
              </select>
            </div>
          )}

          {/* Estimated Value */}
          <div className="mb-4 text-center border border-secondary rounded p-3">
            <p className="mb-1 text-muted">{costLabel}:</p>
            <h4 className="mb-1">
              <HiOutlineCurrencyRupee />
              {formatCurrency(estimatedValue)}
            </h4>
            {orderType === "MARKET" && estimatedValue > 0 && (
              <small className="text-warning d-block">
                (Approx. based on market price)
              </small>
            )}
          </div>

          {/* Button Group */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary btn-lg"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${btnClass} btn-lg`}
              disabled={
                isLoading || (estimatedValue <= 0 && orderType !== "MARKET")
              }
            >
              {isLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Placing...
                </>
              ) : (
                `Place ${titleAction} Order`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// =================================================================================
//                            MAIN BUY/SELL PAGE WRAPPER
// =================================================================================
function BuySellPage(props) {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data passed from the navigation state
  const data = location.state;
  const security = data?.security;
  const action = data?.action;

  // If no security data is found, redirect to stocks as fallback
  useEffect(() => {
    if (!security) {
      navigate("/stocks");
    }
  }, [security, navigate]);

  if (!security) return null;

  // --- Determine Security Type ---
  // Mutual Funds have 'fund_house' or security_type='mutualfund'
  const isMutualFund =
    security.fund_house !== undefined ||
    security.security_type === "mutualfund";

  // --- Shared Styling ---
  const mainContentStyle = {
    marginLeft: "280px", 
    width: "calc(100% - 280px)", 
    minHeight: "100vh", 
    backgroundColor: "#000000",
    boxSizing: "border-box", 
    padding: "40px", 
    display: "flex",
    alignItems: "center", 
    justifyContent: "center", 
  };

  const pageWrapperStyle = {
    minHeight: "100vh",
    backgroundColor: "#000000",
  };

  return (
    <div data-bs-theme="dark" style={pageWrapperStyle}>
      <SideBar />
      <div style={mainContentStyle}>
        <div className="col-11 col-sm-10 col-md-8 col-lg-7 col-xl-6">
          {isMutualFund ? (
            <MutualFundTradeForm
              action={action}
              fund={security}
              showAlert={props.showAlert}
            />
          ) : (
            <StockTradeForm
              action={action}
              security={security}
              showAlert={props.showAlert}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default BuySellPage;