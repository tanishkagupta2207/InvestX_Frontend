import React, { useState, useEffect } from "react";
import SideBar from "../SideBar";
import ChartWrapper from "./tradePageComponents/ChartWrapper";

// --- Main Trade Page Component ---
function TradePage(props) {
  const [selectedCategory, setSelectedCategory] = useState("Technology"); // Default category
  const [stocksToDisplay, setStocksToDisplay] = useState([]);
  const [categoriesData, setCategoriesData] = useState({});
  const [categoryNames, setCategoryNames] = useState([]);

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

  const mainContentStyle = {
    marginLeft: "280px",
    paddingLeft: "20px",
    paddingRight: "50px",
    width: "calc(100% - 280px)",
    boxSizing: "border-box",
    backgroundColor: "#212529",
    minHeight: "100vh",
  };
  const pageWrapperStyle = { minHeight: "100vh" };

  return (
    <div data-bs-theme="dark" style={pageWrapperStyle}>
      <SideBar />
      <div className="py-4" style={mainContentStyle}>
        <h1 className="text-center text-white mb-3">Stock Trading Dashboard</h1>

        <div className="mb-4 p-3 bg-dark rounded border border-secondary">
          <h3 className="text-white mb-3">Select Category:</h3>{" "}
          <div className="d-flex flex-wrap gap-2">
            {" "}
            {categoryNames.map((category) => (
              <button
                key={category}
                type="button"
                className={`btn ${
                  selectedCategory === category
                    ? "btn-primary"
                    : "btn-outline-light"
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                {" "}
                {category}{" "}
              </button>
            ))}{" "}
          </div>
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
                  company_id={stock.company_id}
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