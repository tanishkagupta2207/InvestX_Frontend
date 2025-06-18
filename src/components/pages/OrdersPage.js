import { useEffect, useState, useCallback } from "react";
import SideBar from "../SideBar";

const OrderPage = (props) => {
  const token = localStorage.getItem("token");
  const [orderData, setOrderData] = useState(null);
  const [dataRows, setDataRows] = useState(0);

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
  }, [orderTypeFilter, orderSubTypeFilter,timeInForceFilter, statusFilter, props, minRows]);

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
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Limit Price</th>
                      <th>Stop Price</th>
                      <th>Take Profit Price</th>
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
                        onClick={toggleStatusFilterDropdown} // Click handler to toggle dropdown
                        style={{ cursor: "pointer", position: "relative" }} // Style for clickable header
                      >
                        Status
                        {showStatusFilterDropdown && (
                          <div
                            className="dropdown-menu show bg-dark border-secondary status-filter-dropdown" // Bootstrap dropdown classes, custom class for outside click detection
                            style={{
                              position: "absolute", // Position relative to the parent <th>
                              top: "100%", // Place it directly below the header
                              left: 0,
                              minWidth: "150px", // Ensure minimum width for readability
                              zIndex: 10, // Ensure it overlays other content
                              borderRadius: '0.5rem'
                            }}
                            // Stop event propagation to prevent immediate closing by document click
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
                      <th>Filled Quantity</th>
                      <th>Average Fill Price</th>
                    </tr>
                  </thead>
                  <tbody className="table-group-divider">
                    {/* Render order data if available */}
                    {orderData &&
                      orderData.slice(0, rowsToDisplay).map((item) => (
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
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderPage;
