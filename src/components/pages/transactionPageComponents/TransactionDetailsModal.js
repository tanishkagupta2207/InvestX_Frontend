import React from "react";
import { format, parseISO } from "date-fns";

const TransactionDetailsModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return format(parseISO(dateString), "PPP p");
    } catch (e) {
        return dateString;
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.7)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-light border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Transaction Details</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-2">
              <strong>Security Name:</strong> {transaction.security_name}
            </div>
            <div className="mb-2">
              <strong>Type:</strong>{" "}
              <span className="badge bg-secondary">
                 {transaction.security_type === 'mutualfund' ? 'Mutual Fund' : 'Stock'}
              </span>
            </div>
            <div className="mb-2">
              <strong>Action:</strong>{" "}
              <span
                className={
                  transaction.action === "Buy" ? "text-success" : "text-danger"
                }
              >
                {transaction.action}
              </span>
            </div>
            <div className="mb-2">
              <strong>Quantity:</strong> {transaction.quantity}
            </div>
            <div className="mb-2">
              <strong>Trade Price:</strong> {transaction.trade_price}
            </div>
            <div className="mb-2">
              <strong>Total Amount:</strong>{" "}
              {(transaction.quantity * transaction.trade_price).toFixed(2)}
            </div>
            <div className="mb-2">
              <strong>Date:</strong> {formatDate(transaction.date)}
            </div>
            <div className="mb-2 text-muted small">
              <strong>Transaction ID:</strong> {transaction._id}
            </div>
            <div className="mb-2 text-muted small">
              <strong>Security ID:</strong> {transaction.security_id}
            </div>
          </div>
          <div className="modal-footer border-secondary">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;