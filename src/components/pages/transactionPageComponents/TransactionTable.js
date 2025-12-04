import React from "react";
import { format, parseISO, formatDistanceToNow } from "date-fns";

const formatDisplayDate = (dateString, type = "shortDatetime") => {
  if (!dateString) return "";
  try {
    const dateObject = parseISO(dateString);
    switch (type) {
      case "dateOnly": return format(dateObject, "PPP");
      case "timeOnly": return format(dateObject, "p");
      case "relative": return formatDistanceToNow(dateObject, { addSuffix: true });
      case "fullDatetime": return format(dateObject, "PPP pp"); 
      case "shortDatetime":
      default: return format(dateObject, "PPP p");
    }
  } catch (error) {
    return dateString;
  }
};

const TransactionTable = ({
  sortedTransactionData,
  dataRows,
  rowsToDisplay,
  minRows,
  isFilterActive,
  // Sort
  handleSort,
  sortBy,
  sortOrder,
  // Filters State
  showActionFilterDropdown,
  showSecurityTypeFilterDropdown,
  // Filter Handlers
  toggleActionFilterDropdown,
  toggleSecurityTypeFilterDropdown,
  handleActionFilterChange,
  handleSecurityTypeFilterChange,
  handleRowClick,
}) => {
  // Empty State Logic
  if (dataRows === 0 && !isFilterActive && sortedTransactionData.length === 0) {
     // Special check: If no data AND no filter, it's truly empty. 
     // If filter is active but result is 0, we show "No transactions found".
    return (
      <div className="text-center" style={{ marginTop: "20px", height: "460px" }}>
        No transactions done, till now. Please place orders once they are completed you will be able to see all your transactions here.
      </div>
    );
  } else if (dataRows === 0 && isFilterActive) {
      return (
        <div className="text-center" style={{ marginTop: "20px", height: "460px" }}>
            No transactions found matching the selected filters.
        </div>
      );
  }

  return (
    <div className="table-responsive" style={{ maxHeight: "575px", overflow: "auto" }}>
      <table className="table table-striped table-dark table-bordered table-hover">
        <thead
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "black",
          }}
        >
          <tr>
            {/* --- Security Type Filter (Replaces Sort) --- */}
            <th 
                onClick={toggleSecurityTypeFilterDropdown} 
                style={{ cursor: "pointer", position: "relative" }}
                className="security-type-filter-dropdown"
            >
                Security
                {showSecurityTypeFilterDropdown && (
                <div
                  className="dropdown-menu show bg-dark border-secondary"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    minWidth: "150px",
                    zIndex: 10,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="dropdown-item text-light bg-dark" onClick={() => handleSecurityTypeFilterChange("")}>All</button>
                  <button className="dropdown-item text-light bg-dark" onClick={() => handleSecurityTypeFilterChange("company")}>Stocks</button>
                  <button className="dropdown-item text-light bg-dark" onClick={() => handleSecurityTypeFilterChange("mutualfund")}>Mutual Funds</button>
                </div>
              )}
            </th>

            {/* --- Action Filter --- */}
            <th
              onClick={toggleActionFilterDropdown}
              style={{ cursor: "pointer", position: "relative" }}
              className="action-filter-dropdown"
            >
              Action
              {showActionFilterDropdown && (
                <div
                  className="dropdown-menu show bg-dark border-secondary"
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    minWidth: "150px",
                    zIndex: 10,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="dropdown-item text-light bg-dark" onClick={() => handleActionFilterChange("")}>All</button>
                  <button className="dropdown-item text-light bg-dark" onClick={() => handleActionFilterChange("Buy")}>Buy</button>
                  <button className="dropdown-item text-light bg-dark" onClick={() => handleActionFilterChange("Sell")}>Sell</button>
                </div>
              )}
            </th>

            <th onClick={() => handleSort("quantity")} style={{ cursor: "pointer" }}>
              Quantity {sortBy === "quantity" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
            
            <th onClick={() => handleSort("trade_price")} style={{ cursor: "pointer" }}>
              Trade Price {sortBy === "trade_price" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSort("total_amount")} style={{ cursor: "pointer" }}>
              Total Amount {sortBy === "total_amount" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>

            <th onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>
              Transaction Date {sortBy === "date" && (sortOrder === "asc" ? "▲" : "▼")}
            </th>
          </tr>
        </thead>

        <tbody className="table-group-divider">
          {sortedTransactionData.slice(0, rowsToDisplay).map((item) => (
            <tr 
                key={item._id} 
                onClick={() => handleRowClick(item)} 
                style={{ cursor: "pointer" }}
            >
              <th>
                <div className="d-flex flex-column">
                    <span>{item.security_name || "Unknown Security"}</span>
                    <span className="badge bg-secondary" style={{width: 'fit-content', fontSize: '0.65rem'}}>
                        {item.security_type === 'mutualfund' ? 'Mutual Fund' : 'Stock'}
                    </span>
                </div>
              </th>
              <td className={item.action === "Buy" ? "text-success fw-semibold" : "text-danger fw-semibold"}>
                {item.action}
              </td>
              <td className={item.action === "Buy" ? "text-success fw-semibold" : "text-danger fw-semibold"}>
                {item.quantity}
              </td>
              <td className={item.action === "Buy" ? "text-success fw-semibold" : "text-danger fw-semibold"}>
                {item.trade_price}
              </td>
              <td className={item.action === "Buy" ? "text-success fw-semibold" : "text-danger fw-semibold"}>
                {(item.quantity * item.trade_price).toFixed(2)}
              </td>
              <td>{formatDisplayDate(item.date)}</td>
            </tr>
          ))}
          {/* Fill Empty Rows */}
          {dataRows < minRows &&
            Array(minRows - dataRows)
              .fill(null)
              .map((_, index) => (
                <tr key={`empty-${index}`}>
                  <th>&nbsp;</th>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;