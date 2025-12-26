import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { HiOutlineCurrencyRupee } from "react-icons/hi2";
import { FaSort, FaSortUp, FaSortDown, FaSearch } from "react-icons/fa";

const MutualFundHoldingsAnalysis = (props) => {
  const portfolioData = props.portfolioData;
  const availableColors = props.availableColors;
  const minRows = 5;

  // --- State Variables ---
  const [totalValue, setTotalValue] = useState(0);
  const [fundLabels, setFundLabels] = useState([]);
  const [fundValues, setFundValues] = useState([]);
  const [individualProfitPercentages, setIndividualProfitPercentages] = useState([]);
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);

  // --- Sorting & Filtering State ---
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // --- 1. Global Chart Calculations ---
  const calculateTotal = useCallback((funds) => {
    let total = 0;
    if (funds && Array.isArray(funds)) {
      funds.forEach((fund) => {
        total += fund.quantity * fund.current_price;
      });
    }
    return parseFloat(total.toFixed(2));
  }, []);

  const calculateTotalProfit = useCallback((funds) => {
    let total = 0;
    if (funds && Array.isArray(funds)) {
      funds.forEach((fund) => {
        total += (fund.current_price - fund.average_price) * fund.quantity;
      });
    }
    return parseFloat(total.toFixed(2));
  }, []);

  useEffect(() => {
    if (portfolioData && portfolioData.mutualFunds) {
      const funds = portfolioData.mutualFunds;
      const newFundLabels = funds.map((fund) => fund.name);
      const newFundValues = funds.map(
        (fund) => fund.quantity * fund.current_price
      );
      
      const newTotalProfit = calculateTotalProfit(funds);
      
      const newIndividualProfitPercentages = funds.map((fund) => {
        const investmentValue = fund.average_price * fund.quantity;
        const currentProfit =
          (fund.current_price - fund.average_price) * fund.quantity;
        const percentageReturn =
          investmentValue === 0 ? 0 : (currentProfit / investmentValue) * 100;
        return parseFloat(percentageReturn.toFixed(2));
      });

      const newBackgroundColors = newFundLabels.map(
        (_, index) => availableColors[index % availableColors.length]
      );

      setFundLabels(newFundLabels);
      setFundValues(newFundValues);
      setTotalProfit(newTotalProfit);
      setIndividualProfitPercentages(newIndividualProfitPercentages);
      setBackgroundColors(newBackgroundColors);
      setTotalValue(calculateTotal(funds));
    }
  }, [portfolioData, availableColors, calculateTotal, calculateTotalProfit]);

  // --- 2. Data Enrichment (Pre-calc for sorting) ---
  const enrichedFunds = useMemo(() => {
    if (!portfolioData || !portfolioData.mutualFunds) return [];
    return portfolioData.mutualFunds.map(fund => {
      const investmentValue = fund.average_price * fund.quantity;
      const currentValue = fund.current_price * fund.quantity;
      const profitValue = currentValue - investmentValue;
      const profitPercentage = investmentValue === 0 ? 0 : (profitValue / investmentValue) * 100;
      
      return {
        ...fund,
        investmentValue,
        currentValue,
        profitValue,
        profitPercentage
      };
    });
  }, [portfolioData]);

  // --- 3. Filtering ---
  const filteredFunds = useMemo(() => {
    return enrichedFunds.filter(fund => 
      fund.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [enrichedFunds, searchTerm]);

  // --- 4. Sorting ---
  const sortedFunds = useMemo(() => {
    let sortableItems = [...filteredFunds];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

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
  }, [filteredFunds, sortConfig]);

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
    if (sortedFunds.length === 0) {
      alert("No data available to download.");
      return;
    }

    const headers = [
      "Fund Name", "Quantity", "Average NAV",
      "Current NAV", "Value", "Profit Value", "Profit Percentage (ROI)",
    ];

    const csvRows = sortedFunds.map((fund) => {
      return [
        `"${fund.name.replace(/"/g, '""')}"`,
        fund.quantity,
        fund.average_price.toFixed(4),
        fund.current_price.toFixed(4),
        fund.currentValue.toFixed(2),
        fund.profitValue.toFixed(2),
        fund.profitPercentage.toFixed(2) + "%",
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Mutual_Fund_Holdings_INVEXTX.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    props.showAlert("CSV downloaded successfully!", "success");
  };

  // --- 6. Calculated Totals for Footer (View based) ---
  const viewTotalProfit = sortedFunds.reduce((acc, curr) => acc + curr.profitValue, 0);
  const viewTotalValue = sortedFunds.reduce((acc, curr) => acc + curr.currentValue, 0);

  // --- Charts Config ---
  const dataFunds = {
    labels: fundLabels,
    datasets: [{
      label: "Mutual Fund Allocation",
      data: fundValues,
      backgroundColor: backgroundColors,
      borderWidth: 1,
    }],
  };

  const dataProfitPercentage = {
    labels: fundLabels,
    datasets: [{
      label: "Individual Fund Percentage Return (%)",
      data: individualProfitPercentages,
      backgroundColor: backgroundColors,
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "right", labels: { color: "white" } } },
  };

  const chartOptions = {
    scales: {
      y: { beginAtZero: false, ticks: { color: "white" }, grid: { color: "rgba(255, 255, 255, 0.1)" } },
      x: { ticks: { color: "white" }, grid: { color: "rgba(255, 255, 255, 0.1)" } },
    },
    plugins: { legend: { labels: { color: "white" } } },
  };

  if (!portfolioData || !portfolioData.mutualFunds) return null;

  // Helper for Headers
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
        Mutual Fund Holdings Analysis
      </h1>
      
      {/* Charts section */}
      <div className="row g-3" style={{ margin: "0px", paddingLeft: "4px", paddingRight: "4px" }}>
        <div className="col-lg-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body text-light">
              <h4 className="card-title">Mutual Funds Breakdown</h4>
              <div className="d-flex justify-content-center align-items-center bg-secondary bg-opacity-10 rounded" style={{ height: "372px" }}>
                {portfolioData.mutualFunds.length > 0 ? (
                  <Pie data={dataFunds} options={options} />
                ) : (
                  <p className="text-muted">No mutual funds to display in chart.</p>
                )}
              </div>
              <p className="text-muted">Pie Chart for Fund Distribution</p>
              <h5>Total Value of Funds: <HiOutlineCurrencyRupee /> {totalValue.toFixed(2)}</h5>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card bg-dark border-secondary">
            <div className="card-body text-light">
              <h4 className="card-title">Individual Fund Percentage Return</h4>
              <div className="d-flex justify-content-center align-items-center bg-secondary bg-opacity-10 rounded" style={{ height: "372px" }}>
                {portfolioData.mutualFunds.length > 0 ? (
                  <Bar data={dataProfitPercentage} options={chartOptions} />
                ) : (
                  <p className="text-muted">No funds to display in chart.</p>
                )}
              </div>
              <p className="text-muted">Bar Chart for Individual Fund Return on Investment</p>
              <h5>Total Profit/loss in Funds: <HiOutlineCurrencyRupee /> {totalProfit.toFixed(2)}</h5>
            </div>
          </div>
        </div>
      </div>
      <div>&nbsp;</div> 

      {/* Detailed Table Section */}
      <div className="row g-3" style={{ margin: "0px", paddingLeft: "4px", paddingRight: "4px" }}>
        <div className="card bg-dark border-secondary">
          
          {/* Header & Controls */}
          <div className="card-header">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <h4 className="card-title mb-0 text-light">Detailed Mutual Fund Holdings</h4>
                
                <div className="d-flex gap-2">
                    {/* Search Bar */}
                    <div className="input-group input-group-sm" style={{ width: '250px' }}>
                        <span className="input-group-text bg-dark border-secondary text-light">
                            <FaSearch />
                        </span>
                        <input
                            type="text"
                            className="form-control bg-dark border-secondary text-light"
                            placeholder="Search Fund Name..."
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
                    <SortableHeader label="Fund Name" sortKey="name" />
                    <SortableHeader label="Qty" sortKey="quantity" align="center" />
                    <SortableHeader label="Avg NAV" sortKey="average_price" align="right" />
                    <SortableHeader label="Curr NAV" sortKey="current_price" align="right" />
                    <SortableHeader label="Value" sortKey="currentValue" align="right" />
                    <SortableHeader label="P/L" sortKey="profitValue" align="right" />
                    <SortableHeader label="ROI (%)" sortKey="profitPercentage" align="right" />
                  </tr>
                </thead>
                <tbody className="table-group-divider">
                  {sortedFunds.length > 0 ? (
                    sortedFunds.map((fund, index) => {
                      const isPositive = fund.profitValue >= 0;

                      return (
                        <tr key={fund.id || index}>
                          <td>{fund.name}</td>
                          <td className="text-center">{fund.quantity}</td>
                          <td className="text-end">{fund.average_price.toFixed(4)}</td>
                          <td className="text-end">{fund.current_price.toFixed(4)}</td>
                          <td className="text-end">
                            <HiOutlineCurrencyRupee size={16} />
                            {fund.currentValue.toFixed(2)}
                          </td>
                          <td className={`text-end ${isPositive ? "text-success" : "text-danger"}`}>
                            <HiOutlineCurrencyRupee size={16} />
                            {fund.profitValue.toFixed(2)}
                          </td>
                          <td className={`text-end ${isPositive ? "text-success" : "text-danger"}`}>
                            {fund.profitPercentage.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                     <tr>
                        <td colSpan="7" className="text-center py-4 text-muted">
                            No mutual funds found matching "{searchTerm}"
                        </td>
                     </tr>
                  )}
                  
                  {/* Empty rows filler */}
                  {sortedFunds.length < minRows && sortedFunds.length > 0 &&
                    Array(minRows - sortedFunds.length)
                      .fill(null)
                      .map((_, index) => (
                        <tr key={`empty-${index}`}>
                          <td colSpan="7">&nbsp;</td>
                        </tr>
                      ))}
                  
                  {/* Footer Row */}
                  {sortedFunds.length > 0 && (
                    <tr style={{ borderTop: '2px solid #6c757d' }}>
                      <td colSpan="4" className="text-end fw-bold">
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

export default MutualFundHoldingsAnalysis;