import React from "react";

const ConfirmationModal = ({ show, title, message, variant = "danger", confirmText = "Confirm", onConfirm, onCancel }) => {
  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-light border-secondary shadow-lg">
          
          {/* Header */}
          <div className="modal-header border-secondary">
            <h5 className="modal-title fw-bold">
              {variant === "danger" && <i className="fa-solid fa-triangle-exclamation text-danger me-2"></i>}
              {title}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onCancel}></button>
          </div>

          {/* Body */}
          <div className="modal-body">
            <p className="mb-0 text-secondary">{message}</p>
          </div>

          {/* Footer */}
          <div className="modal-footer border-secondary">
            <button type="button" className="btn btn-outline-light" onClick={onCancel}>
              Cancel
            </button>
            <button 
              type="button" 
              className={`btn btn-${variant}`} 
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;