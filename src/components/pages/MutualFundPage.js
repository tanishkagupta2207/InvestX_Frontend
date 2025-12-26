import React, { useState, useEffect, useCallback } from "react";
import SideBar from "../SideBar";
import MutualFundChartWrapper from "./tradePageComponents/MutualFundChartWrapper"; 
import { FaSearch, FaTimes } from "react-icons/fa"; 

const SIDEBAR_WIDTH = "280px";
const LG_BREAKPOINT = 992;
const CATEGORY_TABS_BREAKPOINT = 768;

function MutualFundPage(props) {
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return localStorage.getItem("selectedMFCategory") || "";
  });

  const [fundsToDisplay, setFundsToDisplay] = useState([]);
  const [categoriesData, setCategoriesData] = useState({});
  const [categoryNames, setCategoryNames] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [searchQuery, setSearchQuery] = useState("");

  const isMobileView = windowWidth < CATEGORY_TABS_BREAKPOINT;

  // --- 1. Fetch Categories & INJECT Category Name ---
  const fetchCategoriesData = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/mutualfund/categories`,
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
        
        // *** FIX START: Inject 'category' into the fund objects ***
        const rawData = res.data;
        Object.keys(rawData).forEach(catKey => {
            rawData[catKey] = rawData[catKey].map(fund => ({
                ...fund,
                category: catKey // Add the category key (e.g., "Large_Cap") to the object
            }));
        });
        // *** FIX END ***

        setCategoriesData(rawData);
        const names = Object.keys(rawData);
        setCategoryNames(names);
        
        if (names.length > 0 && (!selectedCategory || !names.includes(selectedCategory))) {
            setSelectedCategory(names[0]);
        }
      } else {
        props.showAlert(res.msg || "An error occurred fetching categories", "danger");
      }
    } catch (error) {
      console.error("Error Fetching MF Details: ", error);
      props.showAlert("Something went wrong! Please try again later.", "danger");
    }
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/";
      return;
    }
    fetchCategoriesData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem("selectedMFCategory", selectedCategory);
    }
  }, [selectedCategory]);

  // --- 5. LOGIC: Determine Funds to Display ---
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        // Flatten all categories
        const allFunds = Object.values(categoriesData).flat();
        
        const filteredFunds = allFunds.filter(fund => 
            fund.name.toLowerCase().includes(query) || 
            (fund.fund_house && fund.fund_house.toLowerCase().includes(query))
        );
        setFundsToDisplay(filteredFunds);
    } 
    else if (selectedCategory) {
      setFundsToDisplay(categoriesData[selectedCategory] || []);
    } else {
      setFundsToDisplay([]);
    }
  }, [selectedCategory, categoriesData, searchQuery]);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setSearchQuery(""); 
  }, []);
  
  const handleDropdownChange = useCallback((event) => {
    setSelectedCategory(event.target.value);
    setSearchQuery(""); 
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

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
      backgroundColor: selectedCategory === category && searchQuery === "" ? ACTIVE_TAB_BG : 'transparent', 
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
            disabled={searchQuery.length > 0}
          >
            {categoryNames.map((category) => (
              <option key={category} value={category}>
                {category.replace(/_/g, " ")}
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
                  {category.replace(/_/g, " ")}
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
                                {category.replace(/_/g, " ")}
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
        <h1 className="text-center text-white mb-3">Mutual Funds Dashboard</h1>

        <div className="mb-4 p-3 bg-dark rounded border border-secondary">
          <div className="mb-4">
            <div className="input-group input-group-lg">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                    <FaSearch />
                </span>
                <input 
                    type="text" 
                    className="form-control bg-dark text-white border-secondary" 
                    placeholder="Search Funds by Name or Fund House..." 
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
          <div style={{ opacity: searchQuery ? 0.5 : 1, pointerEvents: searchQuery ? 'none' : 'auto' }}>
             {CategoryNavigation()}
          </div>
        </div>

        <h2 className="text-white mt-4 mb-3">
            {searchQuery 
                ? `Search Results for "${searchQuery}"` 
                : (selectedCategory ? `${selectedCategory.replace(/_/g, " ")} Funds` : "Select a Category")}
        </h2>
        
        <div className="row">
          {fundsToDisplay.length > 0 ? (
            fundsToDisplay.map((fund) => (
              <MutualFundChartWrapper
                key={fund.security_id}
                fundName={fund.name}
                fundHouse={fund.fund_house}
                
                // *** FIX: Pass the injected category prop here ***
                category={fund.category} 
                
                security_id={fund.security_id}
                showAlert={props.showAlert}
              />
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info">
                {searchQuery 
                    ? `No mutual funds found matching "${searchQuery}".`
                    : "No mutual funds found for this category."}
              </div>
            </div>
          )}
          
          {!selectedCategory && !searchQuery && (
            <div className="col-12">
              <div className="alert alert-secondary">
                Please select a category to view mutual funds.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MutualFundPage;