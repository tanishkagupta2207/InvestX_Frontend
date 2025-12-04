import { useState, useEffect, useCallback, useMemo } from "react";

export const useTransactionLogic = (props) => {
  const token = localStorage.getItem("token");
  const [transactionsData, setTransactionsData] = useState(null);
  const [dataRows, setDataRows] = useState(0);
  const [rowsToDisplay, setRowsToDisplay] = useState(0);
  const minRows = 12;

  // --- Filter State ---
  const [actionFilter, setActionFilter] = useState("");
  const [securityTypeFilter, setSecurityTypeFilter] = useState(""); // New Filter
  const [isFilterActive, setIsFilterActive] = useState(false);
  
  // Dropdown Visibility State
  const [showActionFilterDropdown, setShowActionFilterDropdown] = useState(false);
  const [showSecurityTypeFilterDropdown, setShowSecurityTypeFilterDropdown] = useState(false); // New Dropdown

  // --- Sorting State ---
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  // --- Modal State ---
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // --- Fetching Logic ---
  const fetchTransactionsData = useCallback(async () => {
    // Check if any filter is active (Action or Security Type)
    // Note: We check securityTypeFilter later in client-side filtering, 
    // but visually we want to know if *any* filter is on.
    setIsFilterActive(!!actionFilter || !!securityTypeFilter);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/transaction/fetch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${token}`,
          },
          body: JSON.stringify({
            action: actionFilter, 
          }),
        }
      );

      const res = await response.json();
      if (res.success) {
        setTransactionsData(res.transactions);
        // We set rows based on raw data here, but display rows will be calculated from sorted/filtered data
        setDataRows(res.transactions.length); 
        setRowsToDisplay(Math.max(minRows, res.transactions.length));
      } else {
        console.error(
          `Error fetching Transaction data: ${res.msg || res.errors[0]?.msg}`
        );
        props.showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error fetching transaction data:", error);
      props.showAlert(
        "Something went wrong! Please try again later.",
        "danger"
      );
    }
  }, [actionFilter, securityTypeFilter, props, minRows, token]); // Added securityTypeFilter dependency to update active state

  // --- Effects ---
  useEffect(() => {
    if (!token) {
      window.location.href = "/";
      return;
    }
    fetchTransactionsData();

    // Click outside listener for dropdowns
    const handleClickOutside = (event) => {
      // Action Dropdown
      if (showActionFilterDropdown && !event.target.closest(".action-filter-dropdown")) {
        setShowActionFilterDropdown(false);
      }
      // Security Type Dropdown
      if (showSecurityTypeFilterDropdown && !event.target.closest(".security-type-filter-dropdown")) {
        setShowSecurityTypeFilterDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [token, fetchTransactionsData, showActionFilterDropdown, showSecurityTypeFilterDropdown]);

  // --- Handlers ---
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  // Action Filter Handlers
  const toggleActionFilterDropdown = (e) => {
    e.stopPropagation();
    setShowActionFilterDropdown((prevState) => !prevState);
    setShowSecurityTypeFilterDropdown(false); // Close other dropdowns
  };

  const handleActionFilterChange = (value) => {
    setActionFilter(value);
    setShowActionFilterDropdown(false);
  };

  // Security Type Filter Handlers
  const toggleSecurityTypeFilterDropdown = (e) => {
    e.stopPropagation();
    setShowSecurityTypeFilterDropdown((prevState) => !prevState);
    setShowActionFilterDropdown(false); // Close other dropdowns
  };

  const handleSecurityTypeFilterChange = (value) => {
    setSecurityTypeFilter(value);
    setShowSecurityTypeFilterDropdown(false);
  };

  const handleRowClick = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleModalClose = () => {
    setShowDetailsModal(false);
    setSelectedTransaction(null);
  };

  // --- Memoized Filtering & Sorting ---
  const sortedTransactionData = useMemo(() => {
    if (!transactionsData) return [];

    let processedData = [...transactionsData];

    // 1. Client-side Filtering for Security Type
    if (securityTypeFilter) {
        processedData = processedData.filter(item => item.security_type === securityTypeFilter);
    }

    // 2. Sorting
    if (sortBy) {
      processedData.sort((a, b) => {
        let valueA = a[sortBy];
        let valueB = b[sortBy];
        
        // Handle Calculated Fields
        if (sortBy === "total_amount") {
          valueA = a.quantity * a.trade_price;
          valueB = b.quantity * b.trade_price;
        }

        // Handle Date Sorting
        if (["date"].includes(sortBy)) {
          valueA = valueA ? new Date(valueA).getTime() : 0;
          valueB = valueB ? new Date(valueB).getTime() : 0;
        } 
        // Handle Number Sorting
        else if (["quantity", "trade_price", "total_amount"].includes(sortBy)) {
          valueA = parseFloat(valueA) || -Infinity;
          valueB = parseFloat(valueB) || -Infinity;
        } 
        // Handle String Sorting
        else {
          valueA = String(valueA).toLowerCase();
          valueB = String(valueB).toLowerCase();
        }

        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    return processedData;
  }, [transactionsData, sortBy, sortOrder, securityTypeFilter]);

  return {
    sortedTransactionData,
    dataRows: sortedTransactionData.length, // Update rows count based on filtered data
    rowsToDisplay,
    minRows,
    isFilterActive: !!actionFilter || !!securityTypeFilter,
    // Sorting
    handleSort,
    sortBy,
    sortOrder,
    // Filters
    actionFilter,
    securityTypeFilter,
    showActionFilterDropdown,
    showSecurityTypeFilterDropdown,
    toggleActionFilterDropdown,
    toggleSecurityTypeFilterDropdown,
    handleActionFilterChange,
    handleSecurityTypeFilterChange,
    // Modal
    showDetailsModal,
    selectedTransaction,
    handleRowClick,
    handleModalClose,
  };
};