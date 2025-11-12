// AssetCards.js (Refactored)

import React from "react";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";

// Define the cards structure, passing in necessary metrics as props
const AssetCards = ({
  totalValue,
  cashHeld,
  moneyInvested, // NEW metric for "Total Money Invested"
  totalProfit,
  xirr,
  isPositiveChange,
}) => {
  const profitChangeText = `${isPositiveChange ? "+" : ""}${parseFloat(totalProfit).toFixed(3)}`;

  // Metric for Total Money Invested is now separate from Total Holdings Value
  const totalMoneyInvested = moneyInvested; // Use prop directly

  return (
    <div className="row g-3">
      {/* 1. Total Portfolio Value Card */}
      <div className="col-lg-6 col-md-6 col-sm-12">
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
              {profitChangeText} {isPositiveChange ? "Profit" : "Loss"} (Lifetime)
            </p>
          </div>
        </div>
      </div>

      {/* 2. Total Cash Held Card */}
      <div className="col-lg-6 col-md-6 col-sm-12">
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

      {/* 3. Total Money Invested Card (Previously Total Stocks Value) */}
      <div className="col-lg-6 col-md-6 col-sm-12">
        <div className="card bg-dark border-secondary h-100">
          <div className="card-body">
            <h5 className="card-title text-white-50">Total Money Invested</h5>
            <p
              className="card-text display-6 fw-bold text-light"
            >
              <HiOutlineCurrencyRupee />{parseFloat(totalMoneyInvested).toFixed(3)}{" "}
            </p>
            <p className="card-text text-muted">Original Capital Invested in Assets</p>
          </div>
        </div>
      </div>

      {/* 4. XIRR Value Card */}
      <div className="col-lg-6 col-md-6 col-sm-12">
        <div className="card bg-dark border-secondary h-100">
          <div className="card-body">
            <h5 className="card-title text-white-50">XIRR</h5>
            <p 
                className={`card-text display-6 fw-bold ${xirr >= 0 ? "text-success" : "text-danger"}`}
            >
              {xirr !== null ? `${xirr.toFixed(2)}%` : "N/A"}
            </p>
            <p className="card-text text-muted">Extended Internal Rate of Return</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCards;