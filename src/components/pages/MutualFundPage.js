import React, { useState, useEffect, useCallback } from "react";
import SideBar from "../SideBar";
import MutualFundChartWrapper from "./tradePageComponents/MutualFundChartWrapper"; 

const SIDEBAR_WIDTH = "280px";
const LG_BREAKPOINT = 992;
const CATEGORY_TABS_BREAKPOINT = 768;

function MutualFundPage(props) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [fundsToDisplay, setFundsToDisplay] = useState([]);
  const [categoriesData, setCategoriesData] = useState({});
  const [categoryNames, setCategoryNames] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobileView = windowWidth < CATEGORY_TABS_BREAKPOINT;

  // --- Fetch Categories ---
  const fetchCategoriesData = async () => {
    try {
      // Changed endpoint to /api/mutualfund/categories
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
        setCategoriesData(res.data);
        const names = Object.keys(res.data);
        setCategoryNames(names);
        // Select first category by default if available
        if (!names.includes(selectedCategory) && names.length > 0) {
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
      setFundsToDisplay(categoriesData[selectedCategory] || []);
    } else {
      setFundsToDisplay([]);
    }
  }, [selectedCategory, categoriesData]);

  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
  }, []);
  
  const handleDropdownChange = useCallback((event) => {
    setSelectedCategory(event.target.value);
  }, []);

  // --- Styling Constants ---
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
      backgroundColor: selectedCategory === category ? ACTIVE_TAB_BG : 'transparent', 
      color: selectedCategory === category ? 'white' : INACTIVE_TEXT_COLOR, 
      borderWidth: '1px', 
      borderStyle: 'solid',
      borderColor: BORDER_COLOR, 
      borderBottom: selectedCategory === category ? 'none' : `1px solid ${BORDER_COLOR}`, 
      borderRadius: '5px 5px 0 0',
      padding: '0.5rem 1rem',
      transition: 'all 0.15s ease-in-out',
      cursor: 'pointer',
      textAlign: 'center',
  });

  // --- Navigation UI ---
  const CategoryNavigation = () => {
    // If many categories, you might want to slice differently or use a scrollable container
    const firstRow = categoryNames.slice(0, 5);
    const secondRow = categoryNames.slice(5);

    if (isMobileView) {
      return (
        <div className="mb-3">
          <select
            className="form-select form-select-lg bg-dark text-white border-secondary"
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

    return (
      <div className="row mb-3">
        <div className="col-12 mb-1">
          <ul className="nav nav-tabs nav-justified" style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
            {firstRow.map((category) => (
              <li className="nav-item" key={category}>
                <button
                  className={`nav-link ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                  style={tabStyle(category)}
                >
                  {category.replace(/_/g, " ")} {/* Beautify category names (e.g., Large_Cap -> Large Cap) */}
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
                                className={`nav-link ${selectedCategory === category ? 'active' : ''}`}
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
          <h3 className="text-white mb-3">Select Category:</h3>
          {CategoryNavigation()}
        </div>

        {selectedCategory && (
          <h2 className="text-white mt-4 mb-3">{`${selectedCategory.replace(/_/g, " ")} Funds`}</h2>
        )}
        
        <div className="row">
          {fundsToDisplay.length > 0
            ? fundsToDisplay.map((fund) => (
                <MutualFundChartWrapper
                  key={fund.security_id}
                  fundName={fund.name}
                  fundHouse={fund.fund_house} // Mutual funds usually have a Fund House
                  security_id={fund.security_id}
                  showAlert={props.showAlert}
                />
              ))
            : selectedCategory && (
                <div className="col-12">
                  <div className="alert alert-info">
                    No mutual funds found for this category.
                  </div>
                </div>
              )}
          {!selectedCategory && (
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