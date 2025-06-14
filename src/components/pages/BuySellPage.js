import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SideBar from "../SideBar";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";

const formatCurrency = (value) => {
  if (typeof value !== "number" || isNaN(value)) return " --.--"; // Handle NaN as well
  return `${value.toFixed(2)}`;
};

function TradeForm({ action, company, showAlert }) {
  const [orderType, setOrderType] = useState("MARKET"); // MARKET, LIMIT, STOP, STOP_LIMIT
  const [quantity, setQuantity] = useState(""); // Number of shares
  const [limitPrice, setLimitPrice] = useState(""); // For LIMIT, STOP_LIMIT
  const [stopPrice, setStopPrice] = useState(""); // For STOP, STOP_LIMIT
  const [takeProfitPrice, setTakeProfitPrice] = useState(""); // For TAKE_PROFIT
  const [timeInForce, setTimeInForce] = useState("DAY"); // DAY, GTC
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // For API submission simulation

  const navigate = useNavigate();

  const {
    symbol = "----",
    name = "Unknown Company",
    current_price: currentMarketPrice = 0,
  } = company || {};

  // Calculate estimated cost/proceeds whenever relevant inputs change
  useEffect(() => {
    const numQuantity = parseFloat(quantity);
    const numLimitPrice = parseFloat(limitPrice);
    const numMarketPrice = parseFloat(currentMarketPrice);
    const numTakeProfitPrice = parseFloat(takeProfitPrice);

    if (!isNaN(numQuantity) && numQuantity > 0) {
      let priceToUse = numMarketPrice;

      if (orderType === "LIMIT" || orderType === "STOP_LIMIT") {
        if (!isNaN(numLimitPrice) && numLimitPrice > 0) {
          priceToUse = numLimitPrice; // Use limit price for estimate if set
        } else {
          setEstimatedValue(0); // Can't estimate without limit price
          return; // Exit effect early
        }
      } else if (orderType === "STOP") {
        // Estimate based on market price for stop orders, actual fill may vary
        priceToUse = numMarketPrice;
      } else if (orderType === "TAKE_PROFIT") {
        // Estimate based on market price for take profit orders, actual fill may vary
        if(!isNaN(numTakeProfitPrice) && numTakeProfitPrice > 0) {
          priceToUse = numTakeProfitPrice; // Use take profit price for estimate if set
        }
      }

      if (priceToUse > 0) {
        setEstimatedValue(numQuantity * priceToUse);
      } else if (orderType === "MARKET" && numMarketPrice <= 0) {
        setEstimatedValue(0); // Market price unknown or zero
        showAlert("Market price unavailable for estimation.", "danger");
      } else if (orderType !== "MARKET" && priceToUse <= 0) {
        // Handling for Limit/Stop Limit where price might be entered as 0
        setEstimatedValue(0);
      } else {
        setEstimatedValue(0);
      }
    } else {
      setEstimatedValue(0); // Reset if quantity is invalid or zero
    }
  //eslint-disable-next-line
  }, [quantity, orderType, limitPrice, currentMarketPrice]);

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    // Allow empty string or positive numbers (integer or decimal)
    if (val === "" || (/^\d*\.?\d*$/.test(val) && parseFloat(val) >= 0)) {
      setQuantity(val);
    }
  };

  const handlePriceChange = (setter) => (e) => {
    const val = e.target.value;
    // Allow empty string or positive numbers with up to 2 decimal places
    if (val === "" || (/^\d*\.?\d{0,2}$/.test(val) && parseFloat(val) >= 0)) {
      setter(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Validate inputs
    const numQuantity = parseFloat(quantity);
    const numLimitPrice = parseFloat(limitPrice);
    const numStopPrice = parseFloat(stopPrice);
    const numTakeProfitPrice = parseFloat(takeProfitPrice);

    if (isNaN(numQuantity) || numQuantity <= 0) {
      showAlert("Please enter a valid quantity greater than zero.", "Info");
      setIsLoading(false);
      return;
    }

    if (
      (orderType === "LIMIT" || orderType === "STOP_LIMIT") &&
      (isNaN(numLimitPrice) || numLimitPrice <= 0)
    ) {
      showAlert("Please enter a valid limit price greater than zero.", "Info");
      setIsLoading(false);
      return;
    }

    if (
      (orderType === "STOP" || orderType === "STOP_LIMIT") &&
      (isNaN(numStopPrice) || numStopPrice <= 0)
    ) {
      showAlert("Please enter a valid stop price greater than zero.", "Info");
      setIsLoading(false);
      return;
    }

    if (
      (orderType === "TAKE_PROFIT") &&
      (isNaN(numTakeProfitPrice) || numTakeProfitPrice <= 0)
    ) {
      showAlert("Please enter a valid take profit price greater than zero.", "Info");
      setIsLoading(false);
      return;
    }

    if (orderType === "MARKET") {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_HOST_URL}api/transaction/market`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": `${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              action: action,
              quantity: quantity,
              price: currentMarketPrice,
              companyId: company.companyId,
            }),
          }
        );
        const res = await response.json();
        if (res.success) {
          showAlert("Order Placed successfully", "success");
          setQuantity("");
          setLimitPrice("");
          setStopPrice("");
          setTakeProfitPrice("");
          setOrderType("MARKET");
          setTimeInForce("DAY");
        } else {
          console.error(`Error placing order ${res.msg || res.errors[0]?.msg}`);
          showAlert(
            res.msg ||
              (res.errors && res.errors[0]?.msg) ||
              "An error occurred",
            "danger"
          );
        }
      } catch (error) {
        console.error("Order submission failed:", error);
        showAlert("An error occurred while placing the order.", "danger");
      } finally {
        setIsLoading(false);
      }
    } else if (orderType === "LIMIT") {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_HOST_URL}api/transaction/limit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": `${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              action: action,
              quantity: quantity,
              limit_price: numLimitPrice,
              companyId: company.companyId,
              time_in_force: timeInForce,
            }),
          }
        );
        const res = await response.json();
        if (res.success) {
          showAlert("Order Placed successfully", "success");
          setQuantity("");
          setLimitPrice("");
          setStopPrice("");
          setTakeProfitPrice("");
          setOrderType("MARKET");
          setTimeInForce("DAY");
        } else {
          console.error(`Error placing order ${res.msg || res.errors[0]?.msg}`);
          showAlert(
            res.msg ||
              (res.errors && res.errors[0]?.msg) ||
              "An error occurred",
            "danger"
          );
        }
      } catch (error) {
        console.error("Order submission failed:", error);
        showAlert("An error occurred while placing the order.", "danger");
      } finally {
        setIsLoading(false);
      }
    } else if (orderType === "STOP") {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_HOST_URL}api/transaction/stopLoss`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": `${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              action: action,
              quantity: quantity,
              stop_price: numStopPrice,
              companyId: company.companyId,
              time_in_force: timeInForce,
            }),
          }
        );
        const res = await response.json();
        if (res.success) {
          showAlert("Order Placed successfully", "success");
          setQuantity("");
          setLimitPrice("");
          setStopPrice("");
          setTakeProfitPrice("");
          setOrderType("MARKET");
          setTimeInForce("DAY");
        } else {
          console.error(`Error placing order ${res.msg || res.errors[0]?.msg}`);
          showAlert(
            res.msg ||
              (res.errors && res.errors[0]?.msg) ||
              "An error occurred",
            "danger"
          );
        }
      } catch (error) {
        console.error("Order submission failed:", error);
        showAlert("An error occurred while placing the order.", "danger");
      } finally {
        setIsLoading(false);
      }
    } else if(orderType === "STOP_LIMIT") {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_HOST_URL}api/transaction/stopLimit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": `${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              action: action,
              quantity: quantity,
              stop_price: numStopPrice,
              limit_price: numLimitPrice,
              companyId: company.companyId,
              time_in_force: timeInForce,
            }),
          }
        );
        const res = await response.json();
        if (res.success) {
          showAlert("Order Placed successfully", "success");
          setQuantity("");
          setLimitPrice("");
          setStopPrice("");
          setTakeProfitPrice("");
          setOrderType("MARKET");
          setTimeInForce("DAY");
        } else {
          console.error(`Error placing order ${res.msg || res.errors[0]?.msg}`);
          showAlert(
            res.msg ||
              (res.errors && res.errors[0]?.msg) ||
              "An error occurred",
            "danger"
          );
        }
      } catch (error) {
        console.error("Order submission failed:", error);
        showAlert("An error occurred while placing the order.", "danger");
      } finally {
        setIsLoading(false);
      }
    } else if(orderType === "TAKE_PROFIT") {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_HOST_URL}api/transaction/takeProfit`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": `${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              action: action,
              quantity: quantity,
              take_profit_price: numTakeProfitPrice,
              companyId: company.companyId,
              time_in_force: timeInForce,
            }),
          }
        );
        const res = await response.json();
        if (res.success) {
          showAlert("Order Placed successfully", "success");
          setQuantity("");
          setLimitPrice("");
          setStopPrice("");
          setTakeProfitPrice("");
          setOrderType("MARKET");
          setTimeInForce("DAY");
        } else {
          console.error(`Error placing order ${res.msg || res.errors[0]?.msg}`);
          showAlert(
            res.msg ||
              (res.errors && res.errors[0]?.msg) ||
              "An error occurred",
            "danger"
          );
        }
      } catch (error) {
        console.error("Order submission failed:", error);
        showAlert("An error occurred while placing the order.", "danger");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    navigate("/trade"); // Navigate back to the /trade route
  };

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
      {" "}
      {/* Added shadow */}
      <div className="card-header">
        <h4 className="mb-0">
          {titleAction} {name} ({symbol})
        </h4>
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
              aria-label="Select Order Type"
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
              aria-label="Quantity"
            />
          </div>

          {/* Limit Price (Conditional) */}
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
                  min="0.01"
                  step="0.01"
                  required
                  disabled={isLoading}
                  aria-label="Limit Price"
                />
              </div>
            </div>
          )}

          {/* Stop Price (Conditional) */}
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
                  min="0.01"
                  step="0.01"
                  required
                  disabled={isLoading}
                  aria-label="Stop Price"
                />
              </div>
            </div>
          )}

          {/* Take Profit Price (Conditional) */}
          {showTakeProfitPrice && (
            <div className="mb-3">
              <label htmlFor={`takeProfitPrice-${symbol}`} className="form-label">
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
                  min="0.01"
                  step="0.01"
                  required
                  disabled={isLoading}
                  aria-label="Take Profit Price"
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
                aria-label="Select Time In Force"
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
            {/* Cancel Button */}
            <button
              type="button"
              className="btn btn-outline-secondary btn-lg"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              className={`btn ${btnClass} btn-lg`}
              disabled={
                isLoading || (estimatedValue <= 0 && orderType !== "MARKET")
              } // Disable if estimate is 0 for non-market orders
            >
              {isLoading ? (
                <>
                  {" "}
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span className="ms-1">Placing...</span>
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

function BuyAction(props) {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  const company = data?.company;
  const action = data?.action;

  if (!company) {
    navigate("/trade");
  }

  const mainContentStyle = {
    marginLeft: "280px", // Fixed margin for the sidebar
    width: "calc(100% - 280px)", // Calculate remaining width
    minHeight: "100vh", // Ensure it takes full viewport height
    backgroundColor: "#000000", // Set background to black
    boxSizing: "border-box", // Ensure padding is included within the width
    padding: "40px", // Overall padding inside the content area

    // Flexbox for centering
    display: "flex",
    alignItems: "center", // Vertically center content
    justifyContent: "center", // Horizontally center content
  };

  const pageWrapperStyle = {
    minHeight: "100vh",
    backgroundColor: "#000000", // Black background for the entire page area
  };

  return (
    <div data-bs-theme="dark" style={pageWrapperStyle}>
      <SideBar />
      <div style={mainContentStyle}>
        <div className="col-11 col-sm-10 col-md-8 col-lg-7 col-xl-6">
          {company ? (
            <TradeForm
              action={action}
              company={company}
              showAlert={props.showAlert}
            />
          ) : (
            <div className="text-center text-muted">
              <h2>Please select a company to trade.</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BuyAction;