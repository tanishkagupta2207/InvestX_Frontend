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
    fetchOrderData,
    searchQuery,
    setSearchQuery
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
              
              {/* HEADER SECTION - NOW CONTAINS SEARCH BAR */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                  {/* Left Side: Title & Description */}
                  <div>
                    <h4 className="card-title mb-1">ORDERS OVERVIEW</h4>
                    <p className="text-muted small mb-0">
                        Click on any row to view full order details.
                    </p>
                  </div>

                  {/* Right Side: Search Bar (Narrower width) */}
                  <div style={{ width: "300px" }}> 
                    <div className="input-group input-group-sm"> {/* Added input-group-sm for compacter look */}
                        <span className="input-group-text bg-black border-secondary text-secondary">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </span>
                        <input 
                            type="text" 
                            className="form-control bg-black text-light border-secondary" 
                            placeholder="Search orders..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button 
                                className="btn btn-outline-secondary border-start-0 bg-black" 
                                onClick={() => setSearchQuery("")}
                                type="button"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        )}
                    </div>
                  </div>
              </div>

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
        
        {showDetailsModal && (
          <OrderDetailsModal order={selectedOrder} onClose={handleModalClose} showAlert={props.showAlert} onOrderUpdate={fetchOrderData} />
        )}
      </main>
    </div>
  );
};

export default OrderPage;