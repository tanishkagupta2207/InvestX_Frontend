import { useEffect, useState, useCallback, useMemo } from "react";
import SideBar from "../SideBar";
import { format, parseISO, formatDistanceToNow } from 'date-fns'; // Import date-fns functions

// const formatDisplayDate = (dateString) => {
//   if (!dateString) return ""; // Handle cases where dateString might be null or undefined
//   try {
//     const dateObject = new Date(dateString);
//     // Use Intl.DateTimeFormat for locale-aware and user-friendly display
//     // 'default' uses the user's browser locale.
//     // Here we're showing a medium date style and short time style.
//     const options = {
//       year: 'numeric',
//       month: 'short', // e.g., Apr
//       day: 'numeric',
//       hour: '2-digit', // e.g., 05
//       minute: '2-digit', // e.g., 27
//       second: '2-digit', // e.g., 28
//       hour12: false, // Use 24-hour format (e.g., 17:27:28)
//       timeZoneName: 'shortOffset' // Display timezone offset (e.g., GMT+5:30)
//     };
//     return new Intl.DateTimeFormat('default', options).format(dateObject);
//   } catch (error) {
//     console.error("Error formatting date:", dateString, error);
//     return dateString; // Fallback to raw string if formatting fails
//   }
// };

// Helper function to format the date
const formatDisplayDate = (dateString, type = 'shortDatetime') => {
  if (!dateString) return ""; // Handle cases where dateString might be null or undefined

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
          hour12: false, // 24-hour format
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


const OrderPage = (props) => {
  const token = localStorage.getItem("token");
  const [orderData, setOrderData] = useState(null);
  const [dataRows, setDataRows] = useState(0);

  // State variables for sorting
  const [sortBy, setSortBy] = useState(null); // Stores the column key to sort by (e.g., 'quantity', 'date')
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' for ascending, 'desc' for descending

  // State variables for different filter types
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [orderSubTypeFilter, setOrderSubTypeFilter] = useState("");
  const [timeInForceFilter, setTimeInForceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // State variables for managing visibility of filter dropdowns
  const [showOrderTypeFilterDropdown, setShowOrderTypeFilterDropdown] = useState(false);
  const [showOrderSubTypeFilterDropdown, setShowOrderSubTypeFilterDropdown] = useState(false);
  const [showTimeInForceFilterDropdown, setShowTimeInForceFilterDropdown] = useState(false);
  const [showStatusFilterDropdown, setShowStatusFilterDropdown] = useState(false);

  const [rowsToDisplay, setRowsToDisplay] = useState(0);
  const minRows = 12;

  const fetchOrderData = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/orders/fetch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            order_type: orderTypeFilter,
            order_sub_type: orderSubTypeFilter,
            time_in_force: timeInForceFilter,
            status: statusFilter,
          }),
        }
      );

      const res = await response.json();
      if (res.success) {
        setOrderData(res.orders);
        setDataRows(res.orders.length);
        setRowsToDisplay(Math.max(minRows, res.orders.length));
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
  }, [orderTypeFilter, orderSubTypeFilter, timeInForceFilter, statusFilter, props, minRows]);

  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }
    fetchOrderData();

    const handleClickOutside = (event) => {
      if (showOrderTypeFilterDropdown && !event.target.closest('.order-type-filter-dropdown')) {
        setShowOrderTypeFilterDropdown(false);
      }
      if (showOrderSubTypeFilterDropdown && !event.target.closest('.order-sub-type-filter-dropdown')) {
        setShowOrderSubTypeFilterDropdown(false);
      }
      if (showTimeInForceFilterDropdown && !event.target.closest('.time-in-force-filter-dropdown')) {
        setShowTimeInForceFilterDropdown(false);
      }
      if (showStatusFilterDropdown && !event.target.closest('.status-filter-dropdown')) {
        setShowStatusFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };

  }, [token, fetchOrderData, showOrderTypeFilterDropdown, showOrderSubTypeFilterDropdown, showTimeInForceFilterDropdown, showStatusFilterDropdown]);

  // Handle sorting logic when a header is clicked
  const handleSort = (column) => {
    if (sortBy === column) {
      // If clicking the same column, toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new column, sort ascending by default
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Memoize sorted data to prevent re-sorting on every render
  const sortedOrderData = useMemo(() => {
    if (!orderData) return []; // If no data, return empty array

    const sortableData = [...orderData]; // Create a shallow copy to avoid mutating original state

    if (sortBy) {
      sortableData.sort((a, b) => {
        let valueA = a[sortBy];
        let valueB = b[sortBy];

        // Type-specific comparison logic
        if (['date', 'order_updation_date'].includes(sortBy)) {
          // For dates, convert to milliseconds for numerical comparison
          valueA = valueA ? new Date(valueA).getTime() : 0;
          valueB = valueB ? new Date(valueB).getTime() : 0;
        } else if (['quantity', 'price', 'limit_price', 'stop_price', 'take_profit_price', 'filled_quantity', 'average_fill_price'].includes(sortBy)) {
          // For numbers, parse to float and compare
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
  }, [orderData, sortBy, sortOrder]);

  const toggleOrderTypeFilterDropdown = () => {
    setShowOrderTypeFilterDropdown((prevState) => !prevState);
  };
  const handleOrderTypeFilterChange = (value) => {
    setOrderTypeFilter(value);
    setShowOrderTypeFilterDropdown(false);
  };

  const toggleOrderSubTypeFilterDropdown = () => {
    setShowOrderSubTypeFilterDropdown((prevState) => !prevState);
  };
  const handleOrderSubTypeFilterChange = (value) => {
    setOrderSubTypeFilter(value);
    setShowOrderSubTypeFilterDropdown(false);
  };

  const toggleTimeInForceFilterDropdown = () => {
    setShowTimeInForceFilterDropdown((prevState) => !prevState);
  };
  const handleTimeInForceFilterChange = (value) => {
    setTimeInForceFilter(value);
    setShowTimeInForceFilterDropdown(false);
  };

  const toggleStatusFilterDropdown = () => {
    setShowStatusFilterDropdown((prevState) => !prevState);
  };
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setShowStatusFilterDropdown(false);
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
              <h4 className="card-title text-center">ORDERS OVERVIEW</h4>
              <p className="text-muted" style={{ margin: "0px" }}>
                ORDERS OVERVIEW
              </p>

              {dataRows === 0 ? (
                <div className="text-center" style={{ marginTop: "20px" }}>
                  No orders found. Please place an order to see it here.
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
                          onClick={toggleOrderTypeFilterDropdown}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Order Type
                          {showOrderTypeFilterDropdown && (
                            <div
                              className="dropdown-menu show bg-dark border-secondary order-type-filter-dropdown"
                              style={{
                                position: "absolute", top: "100%", left: 0,
                                minWidth: "150px", zIndex: 10, borderRadius: '0.5rem'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleOrderTypeFilterChange("")}>
                                  All
                              </button>
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleOrderTypeFilterChange("Buy")}>
                                  Buy
                              </button>
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleOrderTypeFilterChange("Sell")}>
                                  Sell
                              </button>
                            </div>
                          )}
                        </th>
                        <th
                          onClick={toggleOrderSubTypeFilterDropdown}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Order Sub Type
                          {showOrderSubTypeFilterDropdown && (
                            <div
                              className="dropdown-menu show bg-dark border-secondary order-sub-type-filter-dropdown"
                              style={{
                                position: "absolute", top: "100%", left: 0,
                                minWidth: "150px", zIndex: 10, borderRadius: '0.5rem'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleOrderSubTypeFilterChange("")}>
                                  All
                              </button>
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleOrderSubTypeFilterChange("MARKET")}>
                                  MARKET
                              </button>
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleOrderSubTypeFilterChange("LIMIT")}>
                                  LIMIT
                              </button>
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleOrderSubTypeFilterChange("STOP_LOSS")}>
                                  STOP LOSS
                              </button>
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleOrderSubTypeFilterChange("TAKE_PROFIT")}>
                                  TAKE PROFIT
                              </button>
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleOrderSubTypeFilterChange("STOP_LIMIT")}>
                                  STOP LIMIT
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
                          onClick={() => handleSort('price')}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Price {sortBy === 'price' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th
                          onClick={() => handleSort('limit_price')}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Limit Price {sortBy === 'limit_price' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th
                          onClick={() => handleSort('stop_price')}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Stop Price {sortBy === 'stop_price' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th
                          onClick={() => handleSort('take_profit_price')}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Take Profit Price {sortBy === 'take_profit_price' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th
                          onClick={toggleTimeInForceFilterDropdown}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Time in Force
                          {showTimeInForceFilterDropdown && (
                            <div
                              className="dropdown-menu show bg-dark border-secondary time-in-force-filter-dropdown"
                              style={{
                                position: "absolute", top: "100%", left: 0,
                                minWidth: "150px", zIndex: 10, borderRadius: '0.5rem'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleTimeInForceFilterChange("")}>
                                  All
                              </button>
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleTimeInForceFilterChange("DAY")}>
                                  Day
                              </button>
                              <button className="dropdown-item text-light bg-dark" onClick={() => handleTimeInForceFilterChange("GTC")}>
                                  Good Till Cancelled (GTC)
                              </button>
                            </div>
                          )}
                        </th>
                        <th
                          onClick={toggleStatusFilterDropdown}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Status
                          {showStatusFilterDropdown && (
                            <div
                              className="dropdown-menu show bg-dark border-secondary status-filter-dropdown"
                              style={{
                                position: "absolute",
                                top: "100%",
                                left: 0,
                                minWidth: "150px",
                                zIndex: 10,
                                borderRadius: '0.5rem'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                  className="dropdown-item text-light bg-dark"
                                  onClick={() => handleStatusFilterChange("")}
                              >
                                  All
                              </button>
                              <button
                                  className="dropdown-item text-light bg-dark"
                                  onClick={() => handleStatusFilterChange("PENDING")}
                              >
                                  Pending
                              </button>
                              <button
                                  className="dropdown-item text-light bg-dark"
                                  onClick={() => handleStatusFilterChange("FILLED")}
                              >
                                  Filled
                              </button>
                              <button
                                  className="dropdown-item text-light bg-dark"
                                  onClick={() => handleStatusFilterChange("PARTIALLY_FILLED")}
                              >
                                  Partially Filled
                              </button>
                              <button
                                  className="dropdown-item text-light bg-dark"
                                  onClick={() => handleStatusFilterChange("CANCELLED")}
                              >
                                  Cancelled
                              </button>
                              <button
                                  className="dropdown-item text-light bg-dark"
                                  onClick={() => handleStatusFilterChange("REJECTED")}
                              >
                                  Rejected
                              </button>
                            </div>
                          )}
                        </th>
                        <th
                          onClick={() => handleSort('filled_quantity')}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Filled Quantity {sortBy === 'filled_quantity' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th
                          onClick={() => handleSort('average_fill_price')}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Average Fill Price {sortBy === 'average_fill_price' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th
                          onClick={() => handleSort('date')}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Order Date {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                        <th
                          onClick={() => handleSort('order_updation_date')}
                          style={{ cursor: "pointer", position: "relative" }}
                        >
                          Order Updation Date {sortBy === 'order_updation_date' && (sortOrder === 'asc' ? '▲' : '▼')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="table-group-divider">
                      {/* Render order data after sorting */}
                      {sortedOrderData.slice(0, rowsToDisplay).map((item) => (
                        <tr key={item._id}>
                          <th>{item.company}</th>
                          <td>{item.order_type}</td>
                          <td>{item.order_sub_type}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price}</td>
                          <td>{item.limit_price}</td>
                          <td>{item.stop_price}</td>
                          <td>{item.take_profit_price}</td>
                          <td>{item.time_in_force}</td>
                          <td>{item.status}</td>
                          <td>{item.filled_quantity}</td>
                          <td>{item.average_fill_price}</td>
                          <td>{formatDisplayDate(item.date)}</td>
                          <td>{formatDisplayDate(item.order_updation_date)}</td>
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
                              <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
                              <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>
                              <td>&nbsp;</td><td>&nbsp;</td>
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
export default OrderPage;
