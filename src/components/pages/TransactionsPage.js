import { useEffect, useState, useCallback, useMemo } from "react";
import SideBar from "../SideBar";
import { format, parseISO, formatDistanceToNow } from 'date-fns'; // Import date-fns functions

const formatDisplayDate = (dateString, type = 'shortDatetime') => {
  if (!dateString) return ""; 

  try {
    const dateObject = parseISO(dateString); // Use parseISO for robust ISO string parsing

    switch (type) {
      case 'dateOnly':
        // Example: Apr 16, 2025
        return format(dateObject, 'PPP');
      case 'timeOnly':
        // Example: 11:57 AM or 17:27
        return format(dateObject, 'p');
      case 'relative':
        // Example: 9 months ago, in 2 hours
        return formatDistanceToNow(dateObject, { addSuffix: true });
      case 'fullDatetime':
        // Example: Apr 16, 2025, 17:27:28 +05:30
        const options = {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZoneName: 'shortOffset' // Display timezone offset (e.g., GMT+5:30)
        };
        return new Intl.DateTimeFormat('default', options).format(dateObject);
      case 'shortDatetime': // Default if type is not specified or unrecognized
      default:
        // Example: Apr 16, 2025, 5:27 PM (using locale-aware 'PPP p' from date-fns)
        return format(dateObject, 'PPP p');
    }
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString; // Fallback to raw string if formatting fails
  }
};

const TransactionsPage = (props) => {
  const token = localStorage.getItem("token");
  const [transactionsData, setTransactionsData] = useState(null);
  const [dataRows, setDataRows] = useState(0);
  const [rowsToDisplay, setRowsToDisplay] = useState(0);
  const minRows = 12;

  
  // State variables for different filter types
  const [actionFilter, setActionFilter] = useState("");

  // State variables for sorting
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  // State variables for managing visibility of filter dropdowns
  const [showActionFilterDropdown, setShowActionFilterDropdown] = useState(false);

  const fetchTransactionsData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/transaction/fetch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            action: actionFilter, // Pass the action filter to the backend
          }),
        }
      );

      const res = await response.json();
      if (res.success) {
        setTransactionsData(res.transactions);
        setDataRows(res.transactions.length);
        setRowsToDisplay(Math.max(minRows, res.transactions.length));
      } else {
        console.error(
          `Error fetching Order data: ${res.msg || res.errors[0]?.msg}`
        );
        props.showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error fetching order data:", error);
      props.showAlert("Something went wrong! Please try again later.", "danger");
    }
  }, [actionFilter, props, minRows]);

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }
    fetchTransactionsData();

    const handleClickOutside = (event) => {
      if (showActionFilterDropdown && !event.target.closest('.order-type-filter-dropdown')) {
        setShowActionFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };

  }, [token, fetchTransactionsData, showActionFilterDropdown]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Memoize sorted data to prevent re-sorting on every render
  const sortedTransactionsData = useMemo(() => {
    if (!transactionsData) return []; 

    const sortableData = [...transactionsData]; 

    if (sortBy) {
      sortableData.sort((a, b) => {
        let valueA = a[sortBy];
        let valueB = b[sortBy];
        if(sortBy === 'total_amount') {
            valueA = a.quantity * a.trade_price;
            valueB = b.quantity * b.trade_price;
        }

        // Type-specific comparison logic
        if (['date'].includes(sortBy)) {
          valueA = valueA ? new Date(valueA).getTime() : 0;
          valueB = valueB ? new Date(valueB).getTime() : 0;
        } else if (['quantity', 'trade_price', 'total_amount'].includes(sortBy)) {
          valueA = parseFloat(valueA) || 2147483647; // Use a large number for NaN values
          valueB = parseFloat(valueB) || 2147483647; // Use a large number for NaN values
        } else {
          valueA = String(valueA).toLowerCase();
          valueB = String(valueB).toLowerCase();
        }
        if (valueA < valueB) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [transactionsData, sortBy, sortOrder]);

  const toggleActionFilterDropdown = () => {
    setShowActionFilterDropdown((prevState) => !prevState);
  };
  const handleActionFilterChange = (value) => {
    setActionFilter(value);
    setShowActionFilterDropdown(false);
  };

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      <SideBar />
      <main
        className="main-content"
        style={{ marginLeft: "280px", padding: "20px" }}
      >
        <div
          className="row g-3"
          style={{ margin: "0px", paddingLeft: "4px", paddingRight: "4px" }}
        >
          <div className="card bg-dark border-secondary">
            <div className="card-body text-light">
              <h4 className="card-title text-center">TRANSACTIONS OVERVIEW</h4>
              <p className="text-muted" style={{ margin: "0px" }}>
                TRANSACTIONS OVERVIEW
              </p>

              {dataRows === 0 ? (
                <div className="text-center" style={{ marginTop: "20px" }}>
                  No transcactions done, till now. Please place orders once they are completed you will be able to see all your transactions here.
                </div>
              ) : (
                <div
                  className="table-responsive"
                  style={{ maxHeight: "575px", overflow: "auto" }}
                >
                  <table className="table table-striped table-dark table-bordered">
                    <thead
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        backgroundColor: "black",
                      }}
                    >
                      <tr>
                        <th>Company</th>

                        <th
                          onClick={toggleActionFilterDropdown}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Action
                          {showActionFilterDropdown && (
                            <div
                              className="dropdown-menu show bg-dark border-secondary order-type-filter-dropdown"
                              style={{
                                position: "absolute", top: "100%", left: 0,
                                minWidth: "150px", zIndex: 10, borderRadius: '0.5rem'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleActionFilterChange("")}>
                                  All
                              </button>
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleActionFilterChange("Buy")}>
                                  Buy
                              </button>
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleActionFilterChange("Sell")}>
                                  Sell
                              </button>
                            </div>
                          )}
                        </th>
                        
                        <th
                          onClick={() => handleSort('quantity')}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Quantity {sortBy === 'quantity' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th
                          onClick={() => handleSort('trade_price')}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Trade Price {sortBy === 'trade_price' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>

                        <th onClick={() => handleSort('total_amount')}
                          style={{ cursor: "pointer", position: "relative" }}>
                            Total Amount {sortBy === 'total_amount' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        
                        <th
                          onClick={() => handleSort('date')}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Transaction Date {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>

                      </tr>
                    </thead>

                    <tbody className="table-group-divider">
                      {/* Render order data after sorting */}
                      {sortedTransactionsData.slice(0, rowsToDisplay).map((item) => (
                        <tr key={item._id}>
                          <th>{item.company}</th>
                          <td className={item.action === "Buy" ? "text-success fw-semibold" : "text-danger fw-semibold"}>{item.action}</td>
                          <td className={item.action === "Buy" ? "text-success fw-semibold" : "text-danger fw-semibold"}>{item.quantity}</td>
                          <td className={item.action === "Buy" ? "text-success fw-semibold" : "text-danger fw-semibold"}>{item.trade_price}</td>
                          <td className={item.action === "Buy" ? "text-success fw-semibold" : "text-danger fw-semibold"}>{item.quantity * item.trade_price}</td>
                          <td>{formatDisplayDate(item.date)}</td>
                        </tr>
                      ))}
                      {/* Render empty rows to maintain minimum table height */}
                      {dataRows < minRows &&
                        Array(minRows - dataRows)
                          .fill(null)
                          .map((_, index) => (
                            <tr key={`empty-${index}`}>
                              <th>&nbsp;</th><td>&nbsp;</td><td>&nbsp;</td>
                              <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default TransactionsPage;
