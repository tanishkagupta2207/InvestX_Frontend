import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";
import { FaSort, FaSortUp, FaSortDown, FaSearch } from "react-icons/fa";

const StockAnalysis = (props) => {
  const portfolioData = props.portfolioData;
  const availableColors = props.availableColors;
  const minRows = 7;

  // --- State Variables ---
  const [totalValue, setTotalValue] = useState(0);
  const [stockLabels, setStockLabels] = useState([]);
  const [stockSymbols, setStockSymbols] = useState([]);
  const [stockValues, setStockValues] = useState([]);
  const [individualReturnPercentages, setIndividualReturnPercentages] = useState([]);
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);

  // --- Sorting & Filtering State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // --- 1. Calculations for Charts (Global Data) ---
  const calculateTotal = useCallback((stocks) => {
    let total = 0;
    if (stocks && Array.isArray(stocks)) {
      stocks.forEach((stock) => {
        total += stock.quantity * stock.current_price;
      });
    }
    return parseFloat(total.toFixed(2));
  }, []);

  const calculateTotalProfit = useCallback((stocks) => {
    let total = 0;
    if (stocks && Array.isArray(stocks)) {
      stocks.forEach((stock) => {
        total += (stock.current_price - stock.average_price) * stock.quantity;
      });
    }
    return parseFloat(total.toFixed(2));
  }, []);

  useEffect(() => {
    if (portfolioData && portfolioData.stocks) {
      const stocks = portfolioData.stocks;

      // Data for the 'Stocks Breakdown' Pie Chart
      const newStockLabels = stocks.map((stock) => stock.name);
      const newStockSymbols = stocks.map((stock) => stock.symbol);
      const newStockValues = stocks.map(
        (stock) => stock.quantity * stock.current_price
      );

      // Data for the 'Profit/Loss' Bar Chart
      const newTotalProfit = calculateTotalProfit(stocks);
      
      const newIndividualReturnPercentages = stocks.map((stock) => {
        const investmentValue = stock.average_price * stock.quantity;
        const currentProfit =
          (stock.current_price - stock.average_price) * stock.quantity;
        const percentageReturn =
          investmentValue <= 0 ? 0 : (currentProfit / investmentValue) * 100;
        return parseFloat(percentageReturn.toFixed(2));
      });

      const newBackgroundColors = newStockLabels.map(
        (_, index) => availableColors[index % availableColors.length]
      );

      setStockLabels(newStockLabels);
      setStockSymbols(newStockSymbols);
      setStockValues(newStockValues);
      setTotalProfit(newTotalProfit);
      setIndividualReturnPercentages(newIndividualReturnPercentages);
      setBackgroundColors(newBackgroundColors);
      setTotalValue(calculateTotal(stocks));
    }
  }, [portfolioData, availableColors, calculateTotal, calculateTotalProfit]);

  // --- 2. Data Enrichment for Table (Pre-calculate ROI/Profit for sorting) ---
  const enrichedStocks = useMemo(() => {
    if (!portfolioData || !portfolioData.stocks) return [];
    return portfolioData.stocks.map(stock => {
      const investmentValue = stock.average_price * stock.quantity;
      const currentValue = stock.current_price * stock.quantity;
      const profitValue = currentValue - investmentValue;
      const profitPercentage = investmentValue <= 0 ? 0 : (profitValue / investmentValue) * 100;
      
      return {
        ...stock,
        investmentValue,
        currentValue,
        profitValue,
        profitPercentage
      };
    });
  }, [portfolioData]);

  // --- 3. Filtering Logic ---
  const filteredStocks = useMemo(() => {
    return enrichedStocks.filter(stock => 
      stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enrichedStocks, searchTerm]);

  // --- 4. Sorting Logic ---
  const sortedStocks = useMemo(() => {
    let sortableItems = [...filteredStocks];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle string comparison for names/symbols
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredStocks, sortConfig]);

  // --- 5. Handlers ---
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (name) => {
    if (sortConfig.key !== name) return <FaSort className="text-muted" style={{fontSize: '0.8rem'}} />;
    if (sortConfig.direction === 'ascending') return <FaSortUp className="text-info" />;
    return <FaSortDown className="text-info" />;
  };

  const handleDownloadCSV = () => {
    if (sortedStocks.length === 0) {
      alert("No data to download.");
      return;
    }

    const header = [
      "Company", "Symbol", "Quantity", "Purchase Price",
      "Current Price", "Value", "Profit Value", "Profit Percentage (ROI)",
    ];

    const rows = sortedStocks.map((item) => {
      return [
        `"${item.name.replace(/"/g, '""')}"`,
        item.symbol,
        item.quantity,
        item.average_price,
        item.current_price,
        item.currentValue.toFixed(2),
        item.profitValue.toFixed(2),
        item.profitPercentage.toFixed(2) + "%",
      ].join(",");
    });

    const csvContent = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Stock_holdings_analysis.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    props.showAlert("CSV downloaded successfully!", "success");
  };

  // --- 6. Calculated Totals for the Table Footer (Based on View) ---
  const viewTotalProfit = sortedStocks.reduce((acc, curr) => acc + curr.profitValue, 0);
  const viewTotalValue = sortedStocks.reduce((acc, curr) => acc + curr.currentValue, 0);

  // --- Chart Data Config ---
  const datastocks = {
    labels: stockLabels,
    datasets: [
      {
        label: "Stocks Allocation",
        data: stockValues,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const dataProfitPercentage = {
    labels: stockSymbols,
    datasets: [
      {
        label: "Individual Stock Percentage Return (ROI)",
        data: individualReturnPercentages,
        backgroundColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "right", labels: { color: "white" } },
    },
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: false,
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      x: {
        ticks: { color: "white" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
    plugins: {
      legend: { labels: { color: "white" } },
    },
  };

  if (!portfolioData || !portfolioData.stocks) {
    return null;
  }

  // Helper for Table Headers
  const SortableHeader = ({ label, sortKey, align = "left" }) => (
    <th 
      onClick={() => requestSort(sortKey)} 
      style={{ cursor: 'pointer', textAlign: align, whiteSpace: 'nowrap' }}
      className="user-select-none"
    >
      <div className={`d-flex align-items-center gap-1 justify-content-${align === 'right' ? 'end' : 'start'}`}>
        {label} {getSortIcon(sortKey)}
      </div>
    </th>
  );

  return (
    <div>
      <h1 className="text-light" style={{ textAlign: "center", marginBottom: "20px" }}>
        Stocks Holding Analysis
      </h1>
      
      {/* Charts Section */}
      <div className="row g-3" style={{ margin: "0px", paddingLeft: "4px", paddingRight: "4px" }}>
        <div className="col-lg-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body text-light">
              <h4 className="card-title">Stocks Breakdown</h4>
              <div className="d-flex justify-content-center align-items-center bg-secondary bg-opacity-10 rounded" style={{ height: "372px" }}>
                {portfolioData.stocks.length > 0 ? (
                  <Pie data={datastocks} options={options} />
                ) : (
                  <p className="text-muted">No stocks to display in chart.</p>
                )}
              </div>
              <p className="text-muted">Pie Chart for Stocks Distribution</p>
              <h5>Total Value of Stocks: <HiOutlineCurrencyRupee /> {totalValue.toFixed(2)}</h5>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body text-light">
              <h4 className="card-title">Individual Stock Percentage Return</h4>
              <div className="d-flex justify-content-center align-items-center bg-secondary bg-opacity-10 rounded" style={{ height: "372px" }}>
                {portfolioData.stocks.length > 0 ? (
                  <Bar data={dataProfitPercentage} options={chartOptions} />
                ) : (
                  <p className="text-muted">No stocks to display in chart.</p>
                )}
              </div>
              <p className="text-muted">Bar Chart for Individual Stock Return on Investment</p>
              <h5>Total Profit/loss in Stocks: <HiOutlineCurrencyRupee /> {totalProfit.toFixed(2)}</h5>
            </div>
          </div>
        </div>
      </div>
      <div>&nbsp;</div>

      {/* Detailed Holdings Table */}
      <div className="row g-3" style={{ margin: "0px", paddingLeft: "4px", paddingRight: "4px" }}>
        <div className="card bg-dark border-secondary">
          
          {/* Header & Controls */}
          <div className="card-header">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <h4 className="card-title mb-0 text-light">Detailed Stock Holdings</h4>
                
                <div className="d-flex gap-2">
                    {/* Search Bar */}
                    <div className="input-group input-group-sm" style={{ width: '250px' }}>
                        <span className="input-group-text bg-dark border-secondary text-light">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            className="form-control bg-dark border-secondary text-light"
                            placeholder="Search Company or Symbol..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="btn btn-sm btn-outline-info" onClick={handleDownloadCSV}>
                        Download CSV
                    </button>
                </div>
            </div>
          </div>

          <div className="card-body text-light">
            <div className="table-responsive" style={{ maxHeight: "450px" }}>
              <table className="table table-striped table-dark table-bordered table-hover">
                <thead style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "black" }}>
                  <tr>
                    <SortableHeader label="Company" sortKey="name" />
                    <SortableHeader label="Symbol" sortKey="symbol" />
                    <SortableHeader label="Qty" sortKey="quantity" align="center" />
                    <SortableHeader label="Avg Price" sortKey="average_price" align="right" />
                    <SortableHeader label="Curr Price" sortKey="current_price" align="right" />
                    <SortableHeader label="Value" sortKey="currentValue" align="right" />
                    <SortableHeader label="P/L" sortKey="profitValue" align="right" />
                    <SortableHeader label="ROI (%)" sortKey="profitPercentage" align="right" />
                  </tr>
                </thead>
                <tbody className="table-group-divider">
                  {sortedStocks.length > 0 ? (
                    sortedStocks.map((item, index) => {
                      const isPositive = item.profitValue >= 0;

                      return (
                        <tr key={item.id || index}>
                          <th>{item.name}</th>
                          <td>{item.symbol}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">{item.average_price.toFixed(4)}</td>
                          <td className="text-end">{item.current_price.toFixed(4)}</td>
                          <td className="text-end">
                            <HiOutlineCurrencyRupee size={16} />
                            {item.currentValue.toFixed(2)}
                          </td>
                          <td className={`text-end ${isPositive ? "text-success" : "text-danger"}`}>
                            <HiOutlineCurrencyRupee size={16} />
                            {item.profitValue.toFixed(2)}
                          </td>
                          <td className={`text-end ${isPositive ? "text-success" : "text-danger"}`}>
                            {item.profitPercentage.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                     <tr>
                        <td colSpan="8" className="text-center py-4 text-muted">
                            No stocks found matching "{searchTerm}"
                        </td>
                     </tr>
                  )}
                  
                  {/* Empty rows filler */}
                  {sortedStocks.length < minRows && sortedStocks.length > 0 &&
                    Array(minRows - sortedStocks.length)
                      .fill(null)
                      .map((_, index) => (
                        <tr key={`empty-${index}`}>
                          <td colSpan="8">&nbsp;</td>
                        </tr>
                      ))}
                  
                  {/* Footer Row */}
                  {sortedStocks.length > 0 && (
                    <tr style={{ borderTop: '2px solid #6c757d' }}>
                      <td colSpan="5" className="text-end fw-bold">
                        {searchTerm ? "Filtered Total:" : "Total:"}
                      </td>
                      <td className="text-end fw-bold text-light">
                        <HiOutlineCurrencyRupee size={16} />
                        {viewTotalValue.toFixed(2)}
                      </td>
                      <td className={`text-end fw-bold ${viewTotalProfit >= 0 ? "text-success" : "text-danger"}`}>
                        <HiOutlineCurrencyRupee size={16} />
                        {viewTotalProfit.toFixed(2)}
                      </td>
                      <td className={`text-end fw-bold ${viewTotalProfit >= 0 ? "text-success" : "text-danger"}`}>
                        {viewTotalValue > 0 ? ((viewTotalProfit / (viewTotalValue - viewTotalProfit)) * 100).toFixed(2) : "0.00"}%
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div>&nbsp;</div>
    </div>
  );
};

export default StockAnalysis;