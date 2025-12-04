import React, { useState } from 'react';
import { formatDisplayDate } from '../../utils/dateFormatter';

// --- Helper Functions ---
const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return 'N/A';
    return `$${numericPrice.toFixed(2)}`;
};

const calculateExecutedValue = (order) => {
    const qty = parseFloat(order.filled_quantity);
    const price = parseFloat(order.average_fill_price);
    if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) return 'N/A';
    return `$${(qty * price).toFixed(2)}`;
};

const OrderDetailsModal = ({ order, onClose, showAlert, onOrderUpdate }) => {
    // State for cancellation flow
    const [isCancelling, setIsCancelling] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false); // Controls the custom confirmation view

    if (!order) return null;

    // --- Dynamic Styles ---
    const modalStyle = {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(5px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1050, padding: '20px'
    };
    const cardStyle = {
        maxWidth: '550px', width: '95%', backgroundColor: '#2b3035', borderColor: '#495057',
        borderRadius: '0.75rem', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.7)', color: '#f8f9fa',
        overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh', position: 'relative'
    };
    const headerStyle = { backgroundColor: '#1e2124', borderBottom: '1px solid #495057', padding: '15px 20px', position: 'relative' };
    const detailItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #3a3f44' };
    const labelStyle = { color: '#adb5bd' };
    const valueStyle = { fontWeight: 'bold', fontSize: '1.05rem', color: order.order_type === 'Buy' ? '#28a745' : '#dc3545' };

    // --- Confirmation Overlay Style ---
    const confirmOverlayStyle = {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: 'rgba(33, 37, 41, 0.98)', 
        zIndex: 1060,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '30px', textAlign: 'center'
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'FILLED': return '#28a745';
            case 'REJECTED': case 'CANCELLED': case 'CANCELED': return '#dc3545';
            case 'CANCEL_REQUESTED': return '#fd7e14';
            default: return '#ffc107';
        }
    };

    const securityIdentifier = order.security_type === 'company' ? order.security_identifier : (order.security_type === 'mutualfund' ? 'MF' : order.security_identifier);
    const conditionalPriceRows = [
        { label: 'Limit Price', value: order.limit_price },
        { label: 'Stop Price', value: order.stop_price },
        { label: 'Take Profit Price', value: order.take_profit_price },
    ];
    const executedValue = calculateExecutedValue(order);

    // --- LOGIC: Execute Cancellation ---
    const executeCancellation = async () => {
        setIsCancelling(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/orders/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token')
                },
                body: JSON.stringify({ orderId: order._id })
            });

            const json = await response.json();

            if (json.success) {
                // 1. Show Success Toast
                if(showAlert) showAlert("Cancellation requested successfully!", "success");
                
                // 2. Refresh Parent Data (Fixes "Page does not reload" issue)
                if (onOrderUpdate) {
                    await onOrderUpdate(); 
                }
                
                // 3. Close Modal
                onClose(); 
            } else {
                if(showAlert) showAlert(json.msg || "Failed to request cancellation.", "danger");
                setShowConfirm(false); // Go back to details view
            }
        } catch (error) {
            console.error("Cancellation Error:", error);
            if(showAlert) showAlert("Internal Server Error", "danger");
            setShowConfirm(false);
        } finally {
            setIsCancelling(false);
        }
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={cardStyle} onClick={(e) => e.stopPropagation()} className="card border-secondary">
                
                {/* --- CUSTOM CONFIRMATION OVERLAY --- */}
                {showConfirm && (
                    <div style={confirmOverlayStyle}>
                        <div className="mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#ffc107" className="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16">
                                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                            </svg>
                        </div>
                        <h4 className="text-white mb-3">Confirm Cancellation?</h4>
                        <p className="text-muted mb-4">
                            Are you sure you want to cancel this <strong>{order.name}</strong> order?
                            <br/>
                            <small>The request will be processed at the end of the trading day.</small>
                        </p>
                        <div className="d-flex gap-3 w-100 justify-content-center">
                            <button 
                                className="btn btn-outline-light px-4" 
                                onClick={() => setShowConfirm(false)}
                                disabled={isCancelling}
                            >
                                No, Go Back
                            </button>
                            <button 
                                className="btn btn-danger px-4" 
                                onClick={executeCancellation}
                                disabled={isCancelling}
                            >
                                {isCancelling ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Processing...
                                    </>
                                ) : (
                                    "Yes, Cancel Order"
                                )}
                            </button>
                        </div>
                    </div>
                )}
                {/* ----------------------------------- */}

                {/* Header */}
                <div style={headerStyle}>
                    <h5 className="card-title mb-0" style={{ fontSize: '1.4rem' }}>{order.name} ({securityIdentifier})</h5>
                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>{order.order_type} Order Details</span>
                    <button type="button" className="btn-close btn-close-white" onClick={onClose} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)' }}></button>
                </div>
                
                {/* Body */}
                <div className="card-body" style={{ padding: '20px', overflowY: 'auto' }}>
                    <div style={detailItemStyle}>
                        <span style={labelStyle}>Status</span>
                        <span style={{ ...valueStyle, color: getStatusColor(order.status) }}>{order.status}</span>
                    </div>

                    {/* Message Field */}
                    {order.msg && (
                        <div style={{...detailItemStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '5px', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '10px', borderRadius: '5px', border: '1px solid #495057'}}>
                            <span style={{...labelStyle, fontSize: '0.85rem', textTransform: 'uppercase'}}>Message / Reason</span>
                            <span style={{...valueStyle, color: '#e9ecef', fontSize: '0.95rem', fontWeight: 'normal', whiteSpace: 'pre-wrap'}}>{order.msg}</span>
                        </div>
                    )}

                    <div style={detailItemStyle}>
                        <span style={labelStyle}>Quantity (Filled / Requested)</span>
                        <span style={valueStyle}><span style={{ color: '#28a745' }}>{order.filled_quantity || 0}</span> / {order.quantity}</span>
                    </div>

                    {executedValue !== 'N/A' && (
                        <div style={{ ...detailItemStyle, marginTop: '15px', padding: '15px 0', border: '1px solid #495057', borderRadius: '0.5rem', paddingLeft: '10px', paddingRight: '10px', backgroundColor: '#343a40' }}>
                            <span style={{ ...labelStyle, color: '#f8f9fa', fontWeight: 'bold' }}>Total Executed Value</span>
                            <span style={{ ...valueStyle, color: '#007bff', fontSize: '1.2rem' }}>{executedValue}</span>
                        </div>
                    )}

                    <div style={{...detailItemStyle, marginTop: '15px'}}>
                        <span style={labelStyle}>Average Fill Price</span>
                        <span style={valueStyle}>{formatPrice(order.average_fill_price)}</span>
                    </div>

                    {conditionalPriceRows.map(row => (row.value != null) && (
                        <div style={detailItemStyle} key={row.label}>
                            <span style={labelStyle}>{row.label}</span>
                            <span style={{...valueStyle, color: '#ffc107'}}>{formatPrice(row.value)}</span>
                        </div>
                    ))}

                    <div style={detailItemStyle}>
                        <span style={labelStyle}>Placed Date</span>
                        <span style={{...valueStyle, color: '#adb5bd'}}>{formatDisplayDate(order.date, 'fullDatetime')}</span>
                    </div>

                    {order.order_updation_date && (
                        <div style={{...detailItemStyle, borderBottom: '1px dashed #3a3f44'}}>
                            <span style={labelStyle}>Order Updation Date</span>
                            <span style={{...valueStyle, color: '#adb5bd'}}>{formatDisplayDate(order.order_updation_date, 'fullDatetime')}</span>
                        </div>
                    )}

                    {/* Footer IDs */}
                    <div style={{ backgroundColor: '#343a40', padding: '10px 15px', borderRadius: '0.5rem', marginTop: '15px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                            <span className='text-secondary'>Order ID:</span>
                            <span className='text-light'>{order._id}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span className='text-secondary'>Security ID:</span>
                            <span className='text-light'>{order.security_id}</span>
                        </div>
                    </div>
                </div>

                {/* Footer: Request Cancellation Button */}
                {/* Only visible if PENDING */}
                {order.status === 'PENDING' && (
                    <div className="card-footer bg-transparent border-top border-secondary p-3 d-flex justify-content-end">
                        <button 
                            type="button" 
                            className="btn btn-outline-danger w-100"
                            onClick={() => setShowConfirm(true)} // Opens the custom overlay
                        >
                            Request Cancellation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderDetailsModal;