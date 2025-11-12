import React from 'react';
import { formatDisplayDate } from '../../utils/dateFormatter';

// --- Helper Function for formatting prices ---
const formatPrice = (price) => {
    if (price === null || price === undefined) return 'N/A';
    // Ensure it's a number before toFixed
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return 'N/A';
    return `$${numericPrice.toFixed(2)}`;
};

// --- Helper Function for calculating total executed value ---
const calculateExecutedValue = (order) => {
    // We use filled_quantity and average_fill_price for the actual executed fund value
    const qty = parseFloat(order.filled_quantity);
    const price = parseFloat(order.average_fill_price);
    
    if (isNaN(qty) || isNaN(price) || qty <= 0 || price <= 0) {
        return 'N/A';
    }
    return `$${(qty * price).toFixed(2)}`;
};

// --- New Order Details Modal Component ---
const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    // --- Dynamic Styles & Helpers ---
    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1050,
        padding: '20px'
    };

    const cardStyle = {
        maxWidth: '550px',
        width: '95%',
        backgroundColor: '#2b3035',
        borderColor: '#495057',
        borderRadius: '0.75rem',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.7)',
        color: '#f8f9fa',
        overflow: 'hidden'
    };

    const headerStyle = {
        backgroundColor: '#1e2124',
        borderBottom: '1px solid #495057',
        padding: '15px 20px',
        position: 'relative'
    };

    const detailItemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px dashed #3a3f44',
    };

    const labelStyle = {
        color: '#adb5bd',
    };

    const valueStyle = {
        fontWeight: 'bold',
        fontSize: '1.05rem',
        color: order.order_type === 'Buy' ? '#28a745' : '#dc3545',
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'FILLED':
                return '#28a745';
            case 'REJECTED':
            case 'CANCELED':
                return '#dc3545';
            case 'PENDING':
            case 'PARTIALLY_FILLED':
            default:
                return '#ffc107';
        }
    };
    
    // Determine the security identifier to display
    const securityIdentifier = order.security_type === 'company' 
        ? order.security_identifier 
        : (order.security_type === 'mutualfund' ? 'MF' : order.security_identifier);

    // Filter which price-related rows to display
    const conditionalPriceRows = [
        { label: 'Limit Price', value: order.limit_price },
        { label: 'Stop Price', value: order.stop_price },
        { label: 'Take Profit Price', value: order.take_profit_price },
    ];
    
    const executedValue = calculateExecutedValue(order);

    return (
        <div style={modalStyle} onClick={onClose}>
            <div
                style={cardStyle}
                onClick={(e) => e.stopPropagation()}
                className="card border-secondary"
            >
                <div style={headerStyle}>
                    <h5 className="card-title mb-0" style={{ fontSize: '1.4rem' }}>
                        {order.name} ({securityIdentifier})
                    </h5>
                    <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                        {order.order_type} Order Details
                    </span>
                    <button
                        type="button"
                        className="btn-close btn-close-white"
                        aria-label="Close"
                        onClick={onClose}
                        style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)' }}
                    ></button>
                </div>
                
                <div className="card-body" style={{ padding: '20px' }}>
                    {/* Basic Order Details */}
                    <div style={detailItemStyle}>
                        <span style={labelStyle}>Order Type</span>
                        <span style={valueStyle}>
                            {order.order_type} <span style={{ color: '#adb5bd', fontWeight: 'normal' }}>({order.order_sub_type})</span>
                        </span>
                    </div>
                    
                    <div style={detailItemStyle}>
                        <span style={labelStyle}>Status</span>
                        <span style={{ ...valueStyle, color: getStatusColor(order.status) }}>
                            {order.status}
                        </span>
                    </div>
                    
                    <div style={detailItemStyle}>
                        <span style={labelStyle}>Quantity (Filled / Requested)</span>
                        <span style={valueStyle}>
                            <span style={{ color: '#28a745' }}>{order.filled_quantity || 0}</span> / {order.quantity}
                        </span>
                    </div>

                    {/* Total Executed Value (Highlighting the "funds dealt with" for SIP/SWP concept) */}
                    {executedValue !== 'N/A' && (
                        <div style={{ ...detailItemStyle, marginTop: '15px', padding: '15px 0', border: '1px solid #495057', borderRadius: '0.5rem', paddingLeft: '10px', paddingRight: '10px', backgroundColor: '#343a40' }}>
                            <span style={{ ...labelStyle, color: '#f8f9fa', fontWeight: 'bold' }}>Total Executed Value (SWP/SIP Fund)</span>
                            <span style={{ ...valueStyle, color: '#007bff', fontSize: '1.2rem' }}>
                                {executedValue}
                            </span>
                        </div>
                    )}
                    
                    {/* Executed Price Details */}
                    <div style={{...detailItemStyle, marginTop: '15px'}}>
                        <span style={labelStyle}>Average Fill Price</span>
                        <span style={valueStyle}>{formatPrice(order.average_fill_price)}</span>
                    </div>

                    {/* Conditional Price Rows (Limit/Stop/Take Profit) */}
                    {conditionalPriceRows.map(row => 
                        (row.value !== null && row.value !== undefined) && (
                            <div style={detailItemStyle} key={row.label}>
                                <span style={labelStyle}>{row.label}</span>
                                <span style={{...valueStyle, color: '#ffc107'}}>{formatPrice(row.value)}</span>
                            </div>
                        )
                    )}

                    {/* Time & Reference Details */}
                    <div style={{...detailItemStyle, borderBottom: 'none', marginTop: '15px'}}>
                        <span style={labelStyle}>Time in Force</span>
                        <span style={{...valueStyle, color: '#adb5bd'}}>{order.time_in_force}</span>
                    </div>
                    
                    <div style={detailItemStyle}>
                        <span style={labelStyle}>Order Placed Date</span>
                        <span style={{...valueStyle, color: '#adb5bd'}}>{formatDisplayDate(order.date, 'fullDatetime')}</span>
                    </div>
                    
                    {/* Order Updation Date - Already here, but made explicit */}
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
            </div>
        </div>
    );
};

export default OrderDetailsModal;