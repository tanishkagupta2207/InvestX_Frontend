import React, { useState, useEffect, useCallback } from "react";
import Chart from "react-apexcharts";
import SideBar from "../SideBar";

// --- Helper Function to Format API Data ---
const formatApiDataForChart = (apiData) => {
  // (Keep the same formatting function as the previous example)
  if (!apiData || !Array.isArray(apiData)) return [];
  return apiData
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((item) => ({
      x: new Date(item.date),
      y: [
        typeof item.open_price === "number" ? item.open_price : null,
        typeof item.high_price === "number" ? item.high_price : null,
        typeof item.low_price === "number" ? item.low_price : null,
        typeof item.close_price === "number" ? item.close_price : null,
      ],
    }));
};

// --- Actual StockChart component ---
const StockChart = ({ stockData, simplifyGraph }) => {
  if (!stockData || !stockData.data || stockData.data.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 text-muted">
        {" "}
        No data available for chart.{" "}
      </div>
    );
  }

  const chartType = simplifyGraph ? "line" : "candlestick";

  const series = simplifyGraph
    ? [
        {
          name: `${stockData.symbol} (Close)`,
          data: stockData.data
            .map((item) => ({
              x: item.x,
              y:
                item.y && item.y.length > 3 && typeof item.y[3] === "number"
                  ? item.y[3]
                  : null,
            }))
            .filter((item) => item.y !== null),
        },
      ]
    : [
        {
          name: stockData.symbol,
          data: stockData.data.filter(
            (item) =>
              Array.isArray(item.y) &&
              item.y.length === 4 &&
              item.y.every((p) => typeof p === "number")
          ),
        },
      ];

  if (!series[0] || !series[0].data || series[0].data.length === 0) {
    return (
      <div className="d-flex align-items-center justify-content-center h-100 text-warning">
        {" "}
        Insufficient valid data points for {stockData.symbol}.{" "}
      </div>
    );
  }

  // --- MODIFICATION START ---
  const options = {
    chart: {
      type: chartType,
      height: 350,
      background: "transparent",
      foreColor: "#adb5bd",
      animations: { enabled: true, easing: "easeinout", speed: 500 },
    },
    theme: { mode: "dark" },
    title: { text: undefined },
    xaxis: { type: "datetime", labels: { datetimeUTC: false } },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        formatter: function (v) {
          return typeof v === "number" ? "$" + v.toFixed(2) : "$ --";
        },
      },
    },
    tooltip: {
      theme: "dark",
      x: { format: "dd MMM yy HH:mm" },
      // Explicitly format the Y value in the tooltip
      y: {
        formatter: function (
          value,
          { series, seriesIndex, dataPointIndex, w }
        ) {
          // For line chart (simplifyGraph=true), 'value' is the direct y-value (close price)
          if (simplifyGraph) {
            return typeof value === "number" ? "$" + value.toFixed(2) : "$ --";
          }
          // For candlestick, ApexCharts default often works, but we can be explicit
          // The 'value' might not be useful directly here, we need original OHLC
          // Accessing original data point: w.globals.initialSeries[seriesIndex].data[dataPointIndex]
          const point =
            w.globals.initialSeries[seriesIndex]?.data[dataPointIndex];
          if (point && Array.isArray(point.y) && point.y.length === 4) {
            const [open, high, low, close] = point.y;
            // You could format this differently if needed, but default usually shows OHLC
            // This formatter primarily helps ensure the line chart doesn't error
            // Let's return the close price formatted for consistency if needed,
            // otherwise rely on default OHLC display for candlestick.
            // Returning undefined lets ApexCharts use its default for candlestick.
            return undefined;
          }
          // Fallback if something goes wrong
          return typeof value === "number" ? "$" + value.toFixed(2) : "$ --";
        },
        title: {
          // Optional: Use series name for tooltip title
          formatter: (seriesName) => seriesName,
        },
      },
    },
    grid: { borderColor: "#555" },
    ...(chartType === "candlestick" && {
      plotOptions: {
        candlestick: { colors: { upward: "#00B746", downward: "#EF403C" } },
      },
    }),
    ...(chartType === "line" && {
      stroke: { curve: "smooth", width: 2 },
      markers: { size: 0 },
    }),
  };
  // --- MODIFICATION END ---

  return (
    <Chart
      options={options}
      series={series}
      type={chartType}
      height={350}
      width="100%"
    />
  );
};

// --- ChartWrapper component ---
const ChartWrapper = ({ stockSymbol, stockName, company_id, showAlert }) => {
  const [simplifyGraph, setSimplifyGraph] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("1Y");
  const [isLoading, setIsLoading] = useState(false);
  const availableRanges = ["1D", "5D", "1M", "6M", "1Y", "2Y"];

  const fetchChartData = useCallback(async (symbol, range, company_id) => {
    setIsLoading(true);
    setChartData([]);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/stock/data`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ company_id: company_id, range: range }),
        }
      );
      const res = await response.json();
      if (res.success) {
        const formattedData = formatApiDataForChart(res.data);
        setChartData(formattedData);
      } else {
        console.error(
          `Error fetching data for ${symbol}: ${res.msg || res.errors[0]?.msg}`
        );
        showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
      showAlert(
        "Something went wrong! Please try again later.",
        "danger"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (company_id) {
      fetchChartData(stockSymbol, selectedRange, company_id);
    }
  }, [company_id, selectedRange, fetchChartData, simplifyGraph]);

  const handleRangeChange = (newRange) => {
    setSelectedRange(newRange);
  };

  const handleToggleSimplify = (event) => {
    setSimplifyGraph(event.target.checked);
  };

  return (
    <div className="col-12 mb-4">
      <div className="card bg-dark border-secondary h-100">
        <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h5 className="mb-0 text-white">
            {stockName} ({stockSymbol})
          </h5>
          <div
            className="btn-group btn-group-sm flex-wrap"
            role="group"
            aria-label="Chart Range Selector"
          >
            {availableRanges.map((range) => (
              <button
                key={range}
                type="button"
                className={`btn ${
                  selectedRange === range
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => handleRangeChange(range)}
                disabled={isLoading}
              >
                {range}{" "}
              </button>
            ))}{" "}
            <div
              className="form-check form-switch"
              style={{ marginLeft: "10px" }}
            >
              {" "}
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="simplifyGraphSwitch"
                checked={simplifyGraph}
                onChange={handleToggleSimplify}
                disabled={isLoading}
              />{" "}
              <label
                className="form-check-label text-white"
                htmlFor="simplifyGraphSwitch"
              >
                {" "}
                Simplify Graph{" "}
              </label>{" "}
            </div>
          </div>{" "}
        </div>{" "}
        <div
          className="card-body position-relative"
          style={{ minHeight: "380px" }}
        >
          {" "}
          {isLoading && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-dark bg-opacity-75"
              style={{ zIndex: 10 }}
            >
              {" "}
              <div className="spinner-border text-primary" role="status">
                {" "}
                <span className="visually-hidden">Loading...</span>{" "}
              </div>{" "}
            </div>
          )}{" "}
          {/* Pass simplifyGraph down */}{" "}
          {!isLoading && (
            <StockChart
              stockData={{
                symbol: stockSymbol,
                name: stockName,
                data: chartData,
              }}
              simplifyGraph={simplifyGraph}
            />
          )}{" "}
          {!isLoading && chartData.length === 0 && (
            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
              {" "}
              Failed to load data or no data available.{" "}
            </div>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};

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
    fetchCategoriesData();
    // setStocksToDisplay(categoriesData[selectedCategory]);
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
    paddingRight: "20px",
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