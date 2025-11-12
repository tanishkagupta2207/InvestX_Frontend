import React, { useState, useEffect } from "react";
import SideBar from "../SideBar";
import ChartWrapper from "./tradePageComponents/ChartWrapper";

// Define a constant for the sidebar width and breakpoint (992px for Bootstrap's lg)
const SIDEBAR_WIDTH = "280px";
const LG_BREAKPOINT = 992;
const CATEGORY_TABS_BREAKPOINT = 768; // Custom breakpoint (Bootstrap's md) for switching to dropdown

// --- Main Trade Page Component ---
function TradePage(props) {
  const [selectedCategory, setSelectedCategory] = useState("Technology"); // Default category
  const [stocksToDisplay, setStocksToDisplay] = useState([]);
  const [categoriesData, setCategoriesData] = useState({});
  const [categoryNames, setCategoryNames] = useState([]);
  // State to manage the window width for conditional rendering
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobileView = windowWidth < CATEGORY_TABS_BREAKPOINT; // Flag to determine if we show dropdown

  // Categories/Stocks Data
  const fetchCategoriesData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/stock/categories`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
        }
      );
      const res = await response.json();
      if (res.success) {
        setCategoriesData(res.data);
        setCategoryNames(Object.keys(res.data));
        // Ensure default category is valid or set the first one
        if (!Object.keys(res.data).includes(selectedCategory) && Object.keys(res.data).length > 0) {
            setSelectedCategory(Object.keys(res.data)[0]);
        }
      } else {
        console.error(
          "Error fetching categories: ",
          res.msg || res.errors || "error"
        );
        props.showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error Fetching Details: ", error);
      props.showAlert(
        "Something went wrong! Please try again later.",
        "danger"
      );
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auth check and fetch categories data on mount
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
      return;
    }
    fetchCategoriesData();
    // eslint-disable-next-line
  }, []);

  // Update stock list on category change
  useEffect(() => {
    if (selectedCategory) {
      setStocksToDisplay(categoriesData[selectedCategory] || []);
    } else {
      setStocksToDisplay([]);
    }
  }, [selectedCategory, setStocksToDisplay, categoriesData]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };
  
  // Handler for the dropdown menu
  const handleDropdownChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const mainContentMarginLeft = windowWidth >= LG_BREAKPOINT ? SIDEBAR_WIDTH : '0';

  const mainContentStyle = {
    marginLeft: mainContentMarginLeft,
    padding: windowWidth >= LG_BREAKPOINT ? "20px 50px 20px 20px" : "20px 15px",
    boxSizing: "border-box",
    backgroundColor: "#212529",
    minHeight: "100vh",
  };
  const pageWrapperStyle = { minHeight: "100vh" };
  
  // --- Styling for Dark Justified Tabs ---
  const ACTIVE_TAB_BG = '#343a40'; // A slightly lighter gray/dark color for the active tab background
  const INACTIVE_TEXT_COLOR = '#adb5bd';
  const BORDER_COLOR = '#363636';

  const tabStyle = (category) => ({
      // Active tab has a distinct background color, inactive is transparent
      backgroundColor: selectedCategory === category ? ACTIVE_TAB_BG : 'transparent', 
      // White text for active, light gray for inactive
      color: selectedCategory === category ? 'white' : INACTIVE_TEXT_COLOR, 
      borderWidth: '1px', 
      borderStyle: 'solid',
      // Consistent dark border color
      borderColor: BORDER_COLOR, 
      // Hide the bottom border only for the active tab, matching the background
      borderBottom: selectedCategory === category ? 'none' : `1px solid ${BORDER_COLOR}`, 
      borderRadius: '5px 5px 0 0',
      // Removed marginRight for justified look, using padding for internal spacing
      padding: '0.5rem 1rem',
      transition: 'all 0.15s ease-in-out',
      cursor: 'pointer',
      textAlign: 'center', // Ensure text is centered
  });

  // --- Category Navigation UI ---
  const CategoryNavigation = () => {
    // Split category names into two rows for desktop view
    const firstRow = categoryNames.slice(0, 5);
    const secondRow = categoryNames.slice(5);

    if (isMobileView) {
      // 1. Dropdown Menu for Small Screens (Dark Theme Applied)
      return (
        <div className="mb-3">
          <select
            className="form-select form-select-lg bg-dark text-white border-secondary"
            aria-label="Select Stock Category"
            value={selectedCategory}
            onChange={handleDropdownChange}
          >
            {categoryNames.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      );
    }

    // 2. Tab Navigation for Medium/Large Screens (Justified and Dark Themed)
    return (
      <div className="row mb-3">
        {/* Row 1 of Tabs (Justified) */}
        <div className="col-12 mb-1">
          <ul className="nav nav-tabs nav-justified" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
            {firstRow.map((category) => (
              <li className="nav-item" key={category}>
                <button
                  className={`nav-link ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                  style={tabStyle(category)}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {/* Row 2 of Tabs (Justified) - only render if there are more than 5 categories */}
        {secondRow.length > 0 && (
            <div className="col-12 mt-1">
                <ul className="nav nav-tabs nav-justified" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                    {secondRow.map((category) => (
                        <li className="nav-item" key={category}>
                            <button
                                className={`nav-link ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => handleCategorySelect(category)}
                                style={tabStyle(category)}
                            >
                                {category}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    );
  };
  // --- End Category Navigation UI ---


  return (
    <div data-bs-theme="dark" style={pageWrapperStyle}>
      <SideBar />
      <div className="py-4" style={mainContentStyle}>
        <h1 className="text-center text-white mb-3">Stock Trading Dashboard</h1>

        <div className="mb-4 p-3 bg-dark rounded border border-secondary">
          <h3 className="text-white mb-3">Select Category:</h3>
          {CategoryNavigation()}
        </div>

        {selectedCategory && (
          <h2 className="text-white mt-4 mb-3">{`Stocks in ${selectedCategory}`}</h2>
        )}
        <div className="row">
          {stocksToDisplay.length > 0
            ? stocksToDisplay.map((stock) => (
                <ChartWrapper
                  key={stock.symbol}
                  stockSymbol={stock.symbol}
                  stockName={stock.name}
                  security_id={stock.security_id}
                  showAlert={props.showAlert}
                  inInWatchList={false}
                />
              ))
            : selectedCategory && (
                <div className="col-12">
                  <div className="alert alert-info">
                    {" "}
                    No stocks found for this category. Select one above.{" "}
                  </div>
                </div>
              )}
          {!selectedCategory && (
            <div className="col-12">
              <div className="alert alert-secondary">
                {" "}
                Please select a category to view stocks.{" "}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TradePage;