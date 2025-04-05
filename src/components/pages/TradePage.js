import React, { useState, useEffect, useCallback } from "react";
import Chart from "react-apexcharts";
import SideBar from "../SideBar";

// --- Hardcoded Initial/Fallback Data ---
const rawApiStockDataAAPL = [
  {
    _id: "67efea93ffd2bf0009c264ad",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-03T14:30:00.000Z",
    __v: 0,
    close_price: 238.02999877929688,
    granularity: "daily",
    high_price: 244.02999877929688,
    low_price: 236.11000061035156,
    open_price: 241.7899932861328,
    volume: 47184000,
  },
  {
    _id: "67efea93ffd2bf0009c264ae",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-04T14:30:00.000Z",
    __v: 0,
    close_price: 235.92999267578125,
    granularity: "daily",
    high_price: 240.07000732421875,
    low_price: 234.67999267578125,
    open_price: 237.7100067138672,
    volume: 53798100,
  },
  {
    _id: "67efea93ffd2bf0009c264af",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-05T14:30:00.000Z",
    __v: 0,
    close_price: 235.74000549316406,
    granularity: "daily",
    high_price: 236.5500030517578,
    low_price: 229.22999572753906,
    open_price: 235.4199981689453,
    volume: 47227600,
  },
  {
    _id: "67efea93ffd2bf0009c264b0",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-06T14:30:00.000Z",
    __v: 0,
    close_price: 235.3300018310547,
    granularity: "daily",
    high_price: 237.86000061035156,
    low_price: 233.16000366210938,
    open_price: 234.44000244140625,
    volume: 45170400,
  },
  {
    _id: "67efea93ffd2bf0009c264b1",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-07T14:30:00.000Z",
    __v: 0,
    close_price: 239.07000732421875,
    granularity: "daily",
    high_price: 241.3699951171875,
    low_price: 234.75999450683594,
    open_price: 235.11000061035156,
    volume: 46273600,
  },
  {
    _id: "67efea93ffd2bf0009c264b2",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-10T13:30:00.000Z",
    __v: 0,
    close_price: 227.47999572753906,
    granularity: "daily",
    high_price: 236.16000366210938,
    low_price: 224.22000122070312,
    open_price: 235.5399932861328,
    volume: 72071200,
  },
  {
    _id: "67efea93ffd2bf0009c264b3",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-11T13:30:00.000Z",
    __v: 0,
    close_price: 220.83999633789062,
    granularity: "daily",
    high_price: 225.83999633789062,
    low_price: 217.4499969482422,
    open_price: 223.80999755859375,
    volume: 76137400,
  },
  {
    _id: "67efea93ffd2bf0009c264b4",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-12T13:30:00.000Z",
    __v: 0,
    close_price: 216.97999572753906,
    granularity: "daily",
    high_price: 221.75,
    low_price: 214.91000366210938,
    open_price: 220.13999938964844,
    volume: 62547500,
  },
  {
    _id: "67efea93ffd2bf0009c264b5",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-13T13:30:00.000Z",
    __v: 0,
    close_price: 209.67999267578125,
    granularity: "daily",
    high_price: 216.83999633789062,
    low_price: 208.4199981689453,
    open_price: 215.9499969482422,
    volume: 61368300,
  },
  {
    _id: "67efea93ffd2bf0009c264b6",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-14T13:30:00.000Z",
    __v: 0,
    close_price: 213.49000549316406,
    granularity: "daily",
    high_price: 213.9499969482422,
    low_price: 209.5800018310547,
    open_price: 211.25,
    volume: 60107600,
  },
  {
    _id: "67efea93ffd2bf0009c264b7",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-17T13:30:00.000Z",
    __v: 0,
    close_price: 214,
    granularity: "daily",
    high_price: 215.22000122070312,
    low_price: 209.97000122070312,
    open_price: 213.30999755859375,
    volume: 48073400,
  },
  {
    _id: "67efea93ffd2bf0009c264b8",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-18T13:30:00.000Z",
    __v: 0,
    close_price: 212.69000244140625,
    granularity: "daily",
    high_price: 215.14999389648438,
    low_price: 211.49000549316406,
    open_price: 214.16000366210938,
    volume: 42432400,
  },
  {
    _id: "67efea93ffd2bf0009c264b9",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-19T13:30:00.000Z",
    __v: 0,
    close_price: 215.24000549316406,
    granularity: "daily",
    high_price: 218.75999450683594,
    low_price: 213.75,
    open_price: 214.22000122070312,
    volume: 54385400,
  },
  {
    _id: "67efea93ffd2bf0009c264ba",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-20T13:30:00.000Z",
    __v: 0,
    close_price: 214.10000610351562,
    granularity: "daily",
    high_price: 217.49000549316406,
    low_price: 212.22000122070312,
    open_price: 213.99000549316406,
    volume: 48862900,
  },
  {
    _id: "67efea93ffd2bf0009c264bb",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-21T13:30:00.000Z",
    __v: 0,
    close_price: 218.27000427246094,
    granularity: "daily",
    high_price: 218.83999633789062,
    low_price: 211.27999877929688,
    open_price: 211.55999755859375,
    volume: 94127800,
  },
  {
    _id: "67efea93ffd2bf0009c264bc",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-24T13:30:00.000Z",
    __v: 0,
    close_price: 220.72999572753906,
    granularity: "daily",
    high_price: 221.47999572753906,
    low_price: 218.5800018310547,
    open_price: 221,
    volume: 44299500,
  },
  {
    _id: "67efea93ffd2bf0009c264bd",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-25T13:30:00.000Z",
    __v: 0,
    close_price: 223.75,
    granularity: "daily",
    high_price: 224.10000610351562,
    low_price: 220.0800018310547,
    open_price: 220.77000427246094,
    volume: 34493600,
  },
  {
    _id: "67efea93ffd2bf0009c264be",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-26T13:30:00.000Z",
    __v: 0,
    close_price: 221.52999877929688,
    granularity: "daily",
    high_price: 225.02000427246094,
    low_price: 220.47000122070312,
    open_price: 223.50999450683594,
    volume: 34466100,
  },
  {
    _id: "67efea93ffd2bf0009c264bf",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-27T13:30:00.000Z",
    __v: 0,
    close_price: 223.85000610351562,
    granularity: "daily",
    high_price: 224.99000549316406,
    low_price: 220.55999755859375,
    open_price: 221.38999938964844,
    volume: 37094800,
  },
  {
    _id: "67efea93ffd2bf0009c264c0",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-28T13:30:00.000Z",
    __v: 0,
    close_price: 217.89999389648438,
    granularity: "daily",
    high_price: 223.80999755859375,
    low_price: 217.67999267578125,
    open_price: 221.6699981689453,
    volume: 39818600,
  },
  {
    _id: "67efea93ffd2bf0009c264c1",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-03-31T13:30:00.000Z",
    __v: 0,
    close_price: 222.1300048828125,
    granularity: "daily",
    high_price: 225.6199951171875,
    low_price: 216.22999572753906,
    open_price: 217.00999450683594,
    volume: 65299300,
  },
  {
    _id: "67efea93ffd2bf0009c264c2",
    company_id: "67ec1a559f4fc60929429638",
    date: "2025-04-01T13:30:00.000Z",
    __v: 0,
    close_price: 223.19000244140625,
    granularity: "daily",
    high_price: 223.67999267578125,
    low_price: 218.89999389648438,
    open_price: 219.80999755859375,
    volume: 36412700,
  },
];

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

// --- MOCK API Data Generation ---
const generateIntradayPoint = (lastPrice) => {
  const change = (Math.random() - 0.5) * 0.5;
  const open = lastPrice + change;
  const close = open + (Math.random() - 0.5) * 0.3;
  const high = Math.max(open, close) + Math.random() * 0.2;
  const low = Math.min(open, close) - Math.random() * 0.2;
  return { open, high, low, close };
};
const generateMockIntradayData = (numPoints, intervalMinutes, basePrice) => {
  const data = [];
  let lastClose = basePrice + (Math.random() - 0.5);
  let currentTime = new Date();
  currentTime.setMinutes(
    currentTime.getMinutes() - numPoints * intervalMinutes
  );
  for (let i = 0; i < numPoints; i++) {
    const { open, high, low, close } = generateIntradayPoint(lastClose);
    data.push({
      date: new Date(currentTime.getTime()).toISOString(),
      open_price: parseFloat(open.toFixed(2)),
      high_price: parseFloat(high.toFixed(2)),
      low_price: parseFloat(low.toFixed(2)),
      close_price: parseFloat(close.toFixed(2)),
    });
    lastClose = close;
    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
  }
  return data;
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
const ChartWrapper = ({ stockSymbol, stockName }) => {
  const [simplifyGraph, setSimplifyGraph] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("1Y");
  const [isLoading, setIsLoading] = useState(false);
  const availableRanges = ["1D", "5D", "1M", "6M", "1Y", "2Y"];

  const fetchChartData = useCallback(async (symbol, range) => {
    console.log(`Workspaceing data for ${symbol} range ${range}`);
    setIsLoading(true);
    setChartData([]);
    await new Promise((resolve) => setTimeout(resolve, 800));
    let mockApiData = { success: false, data: [] };
    try {
      let basePrice = 100 + Math.random() * 200;
      if (symbol === "AAPL" && ["1M", "6M", "1Y", "2Y"].includes(range)) {
        const rangeMap = { "1M": 22, "6M": 130, "1Y": 252, "2Y": 504 };
        const points = rangeMap[range] || rawApiStockDataAAPL.length;
        mockApiData = {
          success: true,
          data: rawApiStockDataAAPL.slice(-points),
        };
      } else if (range === "1D") {
        mockApiData = {
          success: true,
          data: generateMockIntradayData(390, 1, basePrice),
        };
      } else if (range === "5D") {
        mockApiData = {
          success: true,
          data: generateMockIntradayData(390 * 5, 5, basePrice),
        };
      } else {
        const rangeMap = { "1M": 22, "6M": 130, "1Y": 252, "2Y": 504 };
        const points = rangeMap[range] || 252;
        mockApiData = {
          success: true,
          data: generateMockIntradayData(points, 60 * 24, basePrice),
        };
      }
      if (mockApiData.success) {
        const formattedData = formatApiDataForChart(mockApiData.data);
        setChartData(formattedData);
      } else {
        throw new Error(mockApiData.message || "Failed to fetch mock data");
      }
    } catch (error) {
      console.error(`Workspace error for ${symbol} (${range}):`, error);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (stockSymbol) {
      fetchChartData(stockSymbol, selectedRange);
    }
  }, [stockSymbol, selectedRange, fetchChartData, simplifyGraph]);

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

//   const fetchStocksData = async () => {
//     try {
//       for (const company of stocksToDisplay) {
//         const response = await fetch(
//           `${process.env.REACT_APP_HOST_URL}api/stock/data`,
//           {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               "auth-token": `${localStorage.getItem("token")}`,
//             },
//             body: {
//                 company_id: company.company_id,
//                 range: '1Y'
//             },
//           }
//         );
//         const res = await response.json();
//         if (res.success) {
//           setCategoriesData(res.data);
//           setCategoryNames(Object.keys(res.data));
//         } else {
//           props.showAlert(
//             res.msg ||
//               (res.errors && res.errors[0]?.msg) ||
//               "An error occurred",
//             "danger"
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Error Fetching Details: ", error);
//       props.showAlert(
//         "Something went wrong! Please try again later.",
//         "danger"
//       );
//     }
//   };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  // Update stock list on category change
  useEffect(() => {
    if (selectedCategory) {
      setStocksToDisplay(categoriesData[selectedCategory] || []);
    } else {
      setStocksToDisplay([]);
    }
    // fetchStocksData();
  }, [selectedCategory]);

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
