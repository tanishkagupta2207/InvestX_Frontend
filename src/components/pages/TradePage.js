import React, { useState, useEffect, useCallback } from "react"; 
import SideBar from "../SideBar";
import ChartWrapper from "./tradePageComponents/ChartWrapper";
import { FaSearch, FaTimes } from "react-icons/fa"; // Import icons

const SIDEBAR_WIDTH = "280px";
const LG_BREAKPOINT = 992;
const CATEGORY_TABS_BREAKPOINT = 768;

// --- Main Trade Page Component ---
function TradePage(props) {
  // Initialize from localStorage or default
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem("selectedTradeCategory") || "Technology";
  });

  const [stocksToDisplay, setStocksToDisplay] = useState([]);
  const [categoriesData, setCategoriesData] = useState({});
  const [categoryNames, setCategoryNames] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // --- NEW: Search State ---
  const [searchQuery, setSearchQuery] = useState("");

  const isMobileView = windowWidth < CATEGORY_TABS_BREAKPOINT;

  // 1. Fetch Data
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
        const rawData = res.data;
        Object.keys(rawData).forEach(sectorKey => {
            // Iterate over every stock in this sector and add the sector property
            rawData[sectorKey] = rawData[sectorKey].map(stock => ({
                ...stock,
                sector: sectorKey // Inject the grouping key as the sector name
            }));
        });
        setCategoriesData(rawData);
        const names = Object.keys(rawData);
        setCategoryNames(names);
        
        if (names.length > 0 && !names.includes(selectedCategory)) {
            setSelectedCategory(names[0]); 
        }
      } else {
        props.showAlert(res.msg || "An error occurred", "danger");
      }
    } catch (error) {
      console.error("Error Fetching Details: ", error);
      props.showAlert("Something went wrong! Please try again later.", "danger");
    }
  };

  // 2. Window Resize Listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 3. Initial Auth Check & Fetch
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
      return;
    }
    fetchCategoriesData();
    // eslint-disable-next-line
  }, []);

  // 4. Save Category Selection
  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem("selectedTradeCategory", selectedCategory);
    }
  }, [selectedCategory]);

  // --- 5. LOGIC: Determine Stocks to Display (Category vs Search) ---
  useEffect(() => {
    // A. If there is a search query, search across ALL categories
    if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        
        // Flatten all arrays from the object values into one single array
        const allStocks = Object.values(categoriesData).flat();
        
        // Filter by Symbol OR Name
        const filteredStocks = allStocks.filter(stock => 
            stock.symbol.toLowerCase().includes(query) || 
            stock.name.toLowerCase().includes(query)
        );
        
        setStocksToDisplay(filteredStocks);
    } 
    // B. If no search, show the selected category
    else if (selectedCategory) {
      setStocksToDisplay(categoriesData[selectedCategory] || []);
    } else {
      setStocksToDisplay([]);
    }
  }, [selectedCategory, categoriesData, searchQuery]);

  // --- Handlers ---

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setSearchQuery(""); // Clear search when user manually picks a category tab
  }, []);
  
  const handleDropdownChange = useCallback((event) => {
    setSelectedCategory(event.target.value);
    setSearchQuery(""); // Clear search
  }, []);

  // New Search Handler
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // --- Styles ---
  const mainContentMarginLeft = windowWidth >= LG_BREAKPOINT ? SIDEBAR_WIDTH : '0';
  const mainContentStyle = {
    marginLeft: mainContentMarginLeft,
    padding: windowWidth >= LG_BREAKPOINT ? "20px 50px 20px 20px" : "20px 15px",
    boxSizing: "border-box",
    backgroundColor: "#212529",
    minHeight: "100vh",
  };

  const ACTIVE_TAB_BG = '#343a40';
  const INACTIVE_TEXT_COLOR = '#adb5bd';
  const BORDER_COLOR = '#363636';

  const tabStyle = (category) => ({
      backgroundColor: selectedCategory === category && searchQuery === "" ? ACTIVE_TAB_BG : 'transparent', // Dim tabs if searching
      color: selectedCategory === category && searchQuery === "" ? 'white' : INACTIVE_TEXT_COLOR, 
      borderWidth: '1px', 
      borderStyle: 'solid',
      borderColor: BORDER_COLOR, 
      borderBottom: selectedCategory === category && searchQuery === "" ? 'none' : `1px solid ${BORDER_COLOR}`, 
      borderRadius: '5px 5px 0 0',
      padding: '0.5rem 1rem',
      transition: 'all 0.15s ease-in-out',
      cursor: 'pointer',
      textAlign: 'center',
  });

  // --- Components ---
  const CategoryNavigation = () => {
    const firstRow = categoryNames.slice(0, 5);
    const secondRow = categoryNames.slice(5);

    if (isMobileView) {
      return (
        <div className="mb-3">
          <select
            className="form-select form-select-lg bg-dark text-white border-secondary"
            value={selectedCategory}
            onChange={handleDropdownChange}
            disabled={searchQuery.length > 0} // Disable dropdown while searching to avoid confusion
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

    return (
      <div className="row mb-3">
        <div className="col-12 mb-1">
          <ul className="nav nav-tabs nav-justified" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
            {firstRow.map((category) => (
              <li className="nav-item" key={category}>
                <button
                  className={`nav-link ${selectedCategory === category && searchQuery === "" ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                  style={tabStyle(category)}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {secondRow.length > 0 && (
            <div className="col-12 mt-1">
                <ul className="nav nav-tabs nav-justified" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                    {secondRow.map((category) => (
                        <li className="nav-item" key={category}>
                            <button
                                className={`nav-link ${selectedCategory === category && searchQuery === "" ? 'active' : ''}`}
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

  return (
    <div data-bs-theme="dark" style={{ minHeight: "100vh" }}>
      <SideBar />
      <div className="py-4" style={mainContentStyle}>
        <h1 className="text-center text-white mb-3">Stock Trading Dashboard</h1>

        <div className="mb-4 p-3 bg-dark rounded border border-secondary">
          {/* --- SEARCH BAR SECTION --- */}
          <div className="mb-4">
            <div className="input-group input-group-lg">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                    <FaSearch />
                </span>
                <input 
                    type="text" 
                    className="form-control bg-dark text-white border-secondary" 
                    placeholder="Search any stock by Symbol (e.g. AAPL) or Name..." 
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                {searchQuery && (
                    <button 
                        className="btn btn-outline-secondary border-secondary" 
                        onClick={clearSearch}
                        type="button"
                    >
                        <FaTimes />
                    </button>
                )}
            </div>
          </div>

          <h3 className="text-white mb-3">Select Category:</h3>
          {/* Category tabs get disabled/dimmed logically via styles when searching */}
          <div style={{ opacity: searchQuery ? 0.5 : 1, pointerEvents: searchQuery ? 'none' : 'auto' }}>
             {CategoryNavigation()}
          </div>
        </div>

        {/* --- DYNAMIC HEADING --- */}
        <h2 className="text-white mt-4 mb-3">
            {searchQuery 
                ? `Search Results for "${searchQuery}"` 
                : (selectedCategory ? `Stocks in ${selectedCategory}` : "Select a Category")}
        </h2>
        
        <div className="row">
          {stocksToDisplay.length > 0 ? (
            stocksToDisplay.map((stock) => (
              <ChartWrapper
                key={stock.symbol} // Using symbol as key since searching might mix categories
                stockSymbol={stock.symbol}
                stockName={stock.name}
                sector={stock.sector}
                security_id={stock.security_id}
                showAlert={props.showAlert}
              />
            ))
          ) : (
            /* --- EMPTY STATES --- */
            <div className="col-12">
              <div className="alert alert-info">
                {searchQuery 
                    ? `No stocks found matching "${searchQuery}". Try a different name or symbol.`
                    : "No stocks found for this category."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TradePage;