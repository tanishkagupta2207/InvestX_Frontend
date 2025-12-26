import { useState, useEffect, useCallback, useMemo } from "react";

const minRows = 12;

// Constants based on Orders.js schema
export const assetTypes = ["company", "mutualfund"]; 
export const orderTypes = ["Buy", "Sell"];
export const orderSubTypes = ["MARKET", "LIMIT", "STOP_LOSS", "TAKE_PROFIT", "STOP_LIMIT", "SIP", "SWP"];
export const timeInForces = ["DAY", "GTC"];
export const orderStatuses = ["PENDING", "FILLED", "PARTIALLY_FILLED", "CANCELED", "REJECTED", "CANCEL_REQUESTED"];

export const useOrderLogic = (props) => {
  const token = localStorage.getItem("token");

  // --- State Variables ---
  const [orderData, setOrderData] = useState(null);
  const [dataRows, setDataRows] = useState(0);
  const [rowsToDisplay, setRowsToDisplay] = useState(minRows);
  
  // Modal State
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter States
  const [securityTypeFilter, setSecurityTypeFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");
  const [orderSubTypeFilter, setOrderSubTypeFilter] = useState("");
  const [timeInForceFilter, setTimeInForceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Dropdown Visibility States
  const [showSecurityTypeFilterDropdown, setShowSecurityTypeFilterDropdown] = useState(false);
  const [showOrderTypeFilterDropdown, setShowOrderTypeFilterDropdown] = useState(false);
  const [showOrderSubTypeFilterDropdown, setShowOrderSubTypeFilterDropdown] = useState(false);
  const [showTimeInForceFilterDropdown, setShowTimeInForceFilterDropdown] = useState(false);
  const [showStatusFilterDropdown, setShowStatusFilterDropdown] = useState(false);
  
  // Sorting States
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Search State
  const [searchQuery, setSearchQuery] = useState("");

  // --- Handlers for Modal ---
  const handleRowClick = useCallback((order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  }, []);
  
  // --- Handlers for Sorting ---
  const handleSort = useCallback((column) => {
    let newSortOrder = 'asc';
    if (sortBy === column) {
      newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    }
    setSortBy(column);
    setSortOrder(newSortOrder);
  }, [sortBy, sortOrder]);

  // --- Handlers for Filtering ---
  const createFilterHandlers = useCallback((setFilterState, setShowDropdownState) => ({
    toggle: () => setShowDropdownState((prevState) => !prevState),
    handle: (value) => {
      setFilterState(value);
      setShowDropdownState(false);
    },
  }), []);

  const securityTypeHandlers = createFilterHandlers(setSecurityTypeFilter, setShowSecurityTypeFilterDropdown);
  const orderTypeHandlers = createFilterHandlers(setOrderTypeFilter, setShowOrderTypeFilterDropdown);
  const orderSubTypeHandlers = createFilterHandlers(setOrderSubTypeFilter, setShowOrderSubTypeFilterDropdown);
  const timeInForceHandlers = createFilterHandlers(setTimeInForceFilter, setShowTimeInForceFilterDropdown);
  const statusHandlers = createFilterHandlers(setStatusFilter, setShowStatusFilterDropdown);
  
  // --- Data Fetching Logic ---
  const fetchOrderData = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/orders/fetch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${token}`,
          },
          body: JSON.stringify({
            security_type: securityTypeFilter,
            order_type: orderTypeFilter,
            order_sub_type: orderSubTypeFilter,
            time_in_force: timeInForceFilter,
            status: statusFilter,
            // 1. Pass the search query to the backend
            searchQuery: searchQuery 
          }),
        }
      );

      const res = await response.json();
      if (res.success) {
        setOrderData(res.orders);
        setDataRows(res.orders.length);
        setRowsToDisplay(Math.max(minRows, res.orders.length));
      } else {
        props.showAlert(res.msg || "An error occurred", "danger");
      }
    } catch (error) {
      props.showAlert("Something went wrong! Please try again later.", "danger");
    }
  }, [
    token,
    securityTypeFilter,
    orderTypeFilter,
    orderSubTypeFilter,
    timeInForceFilter,
    statusFilter,
    searchQuery, // 2. Add searchQuery to dependency array
    props,
  ]);

  // 3. Debounce Effect: Wait 500ms after search/filter changes before fetching
  useEffect(() => {
    if (!token) {
        window.location.href = "/";
        return;
    }
    const timeoutId = setTimeout(() => {
        fetchOrderData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fetchOrderData, token]); 

  // Click outside handler (unchanged)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = [
        { state: showSecurityTypeFilterDropdown, setter: setShowSecurityTypeFilterDropdown, className: ".security-type-filter-dropdown" },
        { state: showOrderTypeFilterDropdown, setter: setShowOrderTypeFilterDropdown, className: ".order-type-filter-dropdown" },
        { state: showOrderSubTypeFilterDropdown, setter: setShowOrderSubTypeFilterDropdown, className: ".order-sub-type-filter-dropdown" },
        { state: showTimeInForceFilterDropdown, setter: setShowTimeInForceFilterDropdown, className: ".time-in-force-filter-dropdown" },
        { state: showStatusFilterDropdown, setter: setShowStatusFilterDropdown, className: ".status-filter-dropdown" },
      ];
      
      dropdowns.forEach(({ state, setter, className }) => {
        if (state && !event.target.closest(className)) {
          setter(false);
        }
      });
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSecurityTypeFilterDropdown, showOrderTypeFilterDropdown, showOrderSubTypeFilterDropdown, showTimeInForceFilterDropdown, showStatusFilterDropdown]);
  
  // Memoized Sorting (unchanged)
  const sortedOrderData = useMemo(() => {
    if (!orderData) return [];
    const sortableData = [...orderData];

    if (sortBy) {
      sortableData.sort((a, b) => {
        let valueA = a[sortBy];
        let valueB = b[sortBy];

        if (["date", "order_updation_date"].includes(sortBy)) {
          valueA = valueA ? new Date(valueA).getTime() : -Infinity;
          valueB = valueB ? new Date(valueB).getTime() : -Infinity;
        } else if (
          ["quantity", "price", "limit_price", "stop_price", "take_profit_price", "filled_quantity", "average_fill_price"].includes(sortBy)
        ) {
          valueA = parseFloat(valueA) || -Infinity;
          valueB = parseFloat(valueB) || -Infinity;
        } else {
          valueA = String(valueA || "").toLowerCase();
          valueB = String(valueB || "").toLowerCase();
        }

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [orderData, sortBy, sortOrder]);

  return {
    sortedOrderData,
    dataRows,
    rowsToDisplay,
    minRows,
    showDetailsModal,
    selectedOrder,
    handleRowClick,
    handleModalClose,
    handleSort,
    
    securityTypeFilter,
    orderTypeFilter,
    orderSubTypeFilter,
    timeInForceFilter,
    statusFilter,
    
    securityTypeHandlers,
    orderTypeHandlers,
    orderSubTypeHandlers,
    timeInForceHandlers,
    statusHandlers,
    
    showSecurityTypeFilterDropdown,
    showOrderTypeFilterDropdown,
    showOrderSubTypeFilterDropdown,
    showTimeInForceFilterDropdown,
    showStatusFilterDropdown,
    
    sortBy,
    sortOrder,
    fetchOrderData,

    // 4. Export Search States
    searchQuery,
    setSearchQuery
  };
};