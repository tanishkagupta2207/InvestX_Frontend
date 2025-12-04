import SideBar from "../SideBar";
import TransactionDetailsModal from "./transactionPageComponents/TransactionDetailsModal";
import TransactionTable from "./transactionPageComponents/TransactionTable";
import { useTransactionLogic } from "./transactionPageComponents/UseTransactionLogic";

const TransactionsPage = (props) => {
  const {
    sortedTransactionData,
    dataRows,
    rowsToDisplay,
    minRows,
    isFilterActive,
    // Sort
    handleSort,
    sortBy,
    sortOrder,
    // Filters & Dropdowns
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
  } = useTransactionLogic(props);

  return (
    <div style={{ backgroundColor: "black", minHeight: "100vh" }}>
      <SideBar />
      <main
        className="main-content"
        style={{ marginLeft: "280px", padding: "20px" }}
      >
        <div
          className="row g-3"
          style={{ margin: "0px", paddingLeft: "4px", paddingRight: "4px" }}
        >
          <div className="card bg-dark border-secondary">
            <div className="card-body text-light">
              <h4 className="card-title text-center">TRANSACTIONS OVERVIEW</h4>
              <p className="text-muted" style={{ margin: "0px" }}>
                Click on any row to view full transaction details.
              </p>

              <TransactionTable
                sortedTransactionData={sortedTransactionData}
                dataRows={dataRows}
                rowsToDisplay={rowsToDisplay}
                minRows={minRows}
                isFilterActive={isFilterActive}
                // Sort
                handleSort={handleSort}
                sortBy={sortBy}
                sortOrder={sortOrder}
                // Filters
                showActionFilterDropdown={showActionFilterDropdown}
                showSecurityTypeFilterDropdown={showSecurityTypeFilterDropdown}
                toggleActionFilterDropdown={toggleActionFilterDropdown}
                toggleSecurityTypeFilterDropdown={toggleSecurityTypeFilterDropdown}
                handleActionFilterChange={handleActionFilterChange}
                handleSecurityTypeFilterChange={handleSecurityTypeFilterChange}
                // Row Events
                handleRowClick={handleRowClick}
              />
            </div>
          </div>
        </div>
        
        {showDetailsModal && (
          <TransactionDetailsModal
            transaction={selectedTransaction}
            onClose={handleModalClose}
          />
        )}
      </main>
    </div>
  );
};

export default TransactionsPage;