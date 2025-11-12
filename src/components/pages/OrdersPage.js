import SideBar from "../SideBar";
import OrderDetailsModal from "./orderPageComponents/OrderDetailsModal";
import OrderTable from "./orderPageComponents/OrderTable";
import { useOrderLogic } from "./orderPageComponents/UseOrderLogic";

const OrderPage = (props) => {
  const {
    sortedOrderData,
    dataRows,
    rowsToDisplay,
    minRows,
    showDetailsModal,
    selectedOrder,
    handleRowClick,
    handleModalClose,
    handleSort,
    sortBy,
    sortOrder,
    securityTypeFilter,
    orderTypeFilter,
    orderSubTypeFilter,
    timeInForceFilter,
    statusFilter,
    securityTypeHandlers,
    orderTypeHandlers,
    orderSubTypeHandlers,
    timeInForceHandlers,
    statusHandlers,
    showSecurityTypeFilterDropdown,
    showOrderTypeFilterDropdown,
    showOrderSubTypeFilterDropdown,
    showTimeInForceFilterDropdown,
    showStatusFilterDropdown,
  } = useOrderLogic(props);

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
              <h4 className="card-title text-center">ORDERS OVERVIEW</h4>
              <p className="text-muted" style={{ margin: "0px" }}>
                Click on any row to view full order details.
              </p>
              
              <OrderTable
                // Data
                sortedOrderData={sortedOrderData}
                dataRows={dataRows}
                rowsToDisplay={rowsToDisplay}
                minRows={minRows}
                
                // Handlers & Sort State
                handleRowClick={handleRowClick}
                handleSort={handleSort}
                sortBy={sortBy}
                sortOrder={sortOrder}
                
                // Filters & Dropdown State
                securityTypeFilter={securityTypeFilter}
                orderTypeFilter={orderTypeFilter}
                orderSubTypeFilter={orderSubTypeFilter}
                timeInForceFilter={timeInForceFilter}
                statusFilter={statusFilter}
                securityTypeHandlers={securityTypeHandlers}
                orderTypeHandlers={orderTypeHandlers}
                orderSubTypeHandlers={orderSubTypeHandlers}
                timeInForceHandlers={timeInForceHandlers}
                statusHandlers={statusHandlers}
                showSecurityTypeFilterDropdown={showSecurityTypeFilterDropdown}
                showOrderTypeFilterDropdown={showOrderTypeFilterDropdown}
                showOrderSubTypeFilterDropdown={showOrderSubTypeFilterDropdown}
                showTimeInForceFilterDropdown={showTimeInForceFilterDropdown}
                showStatusFilterDropdown={showStatusFilterDropdown}
              />
            </div>
          </div>
        </div>
        {/* Render the modal component */}
        {showDetailsModal && (
          <OrderDetailsModal order={selectedOrder} onClose={handleModalClose} />
        )}
      </main>
    </div>
  );
};

export default OrderPage;