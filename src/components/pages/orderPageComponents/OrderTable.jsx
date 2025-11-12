import React from 'react';
import FilterDropdown from './FilterDropdown';
import { formatDisplayDate } from "../../utils/dateFormatter";
import { 
  orderTypes, 
  orderSubTypes, 
  timeInForces, 
  orderStatuses,
  assetTypes
} from './UseOrderLogic'; // Import static options

const OrderTable = ({
  // Data props
  sortedOrderData,
  dataRows,
  rowsToDisplay,
  minRows,
  
  // Handlers and State
  handleRowClick,
  handleSort,
  sortBy,
  sortOrder,
  
  // Filter props
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
}) => {
  
  const getSortIndicator = (column) => 
    sortBy === column ? (sortOrder === "asc" ? "▲" : "▼") : "";

  return (
    <div
      className="table-responsive"
      style={{ maxHeight: "575px", overflow: "auto" }}
    >
      <table className="table table-striped table-dark table-bordered">
        <thead
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            backgroundColor: "black",
          }}
        >
          <tr>
            <FilterDropdown
                show={showSecurityTypeFilterDropdown}
                toggle={securityTypeHandlers.toggle}
                handleSelect={securityTypeHandlers.handle}
                currentFilter={securityTypeFilter}
                options={assetTypes}
                className="security-type"
                title="Asset Type"
            />
            <th>Asset Name</th>

            {/* Order Type Filter */}
            <FilterDropdown
              show={showOrderTypeFilterDropdown}
              toggle={orderTypeHandlers.toggle}
              handleSelect={orderTypeHandlers.handle}
              currentFilter={orderTypeFilter}
              options={orderTypes}
              className="order-type"
              title="Order Type"
            />

            {/* Order Sub Type Filter */}
            <FilterDropdown
              show={showOrderSubTypeFilterDropdown}
              toggle={orderSubTypeHandlers.toggle}
              handleSelect={orderSubTypeHandlers.handle}
              currentFilter={orderSubTypeFilter}
              options={orderSubTypes}
              className="order-sub-type"
              title="Order Sub Type"
            />

            {/* Sortable Header: Quantity */}
            <th onClick={() => handleSort("quantity")} style={{ cursor: "pointer", position: "relative" }}>
              Quantity {getSortIndicator("quantity")}
            </th>
            
            {/* Sortable Header: Price */}
            <th onClick={() => handleSort("price")} style={{ cursor: "pointer", position: "relative" }}>
              Price {getSortIndicator("price")}
            </th>
            
            {/* Time in Force Filter */}
            <FilterDropdown
              show={showTimeInForceFilterDropdown}
              toggle={timeInForceHandlers.toggle}
              handleSelect={timeInForceHandlers.handle}
              currentFilter={timeInForceFilter}
              options={timeInForces}
              className="time-in-force"
              title="Time in Force"
            />

            {/* Status Filter */}
            <FilterDropdown
              show={showStatusFilterDropdown}
              toggle={statusHandlers.toggle}
              handleSelect={statusHandlers.handle}
              currentFilter={statusFilter}
              options={orderStatuses}
              className="status"
              title="Status"
            />

            {/* Sortable Header: Filled Quantity */}
            <th onClick={() => handleSort("filled_quantity")} style={{ cursor: "pointer", position: "relative" }}>
              Filled Qty {getSortIndicator("filled_quantity")}
            </th>
            
            {/* Sortable Header: Average Fill Price */}
            <th onClick={() => handleSort("average_fill_price")} style={{ cursor: "pointer", position: "relative" }}>
              Avg Fill Price {getSortIndicator("average_fill_price")}
            </th>
            
            {/* Sortable Header: Order Date */}
            <th onClick={() => handleSort("date")} style={{ cursor: "pointer", position: "relative" }}>
              Order Date {getSortIndicator("date")}
            </th>
            
            {/* Sortable Header: Order Updation Date */}
            <th onClick={() => handleSort("order_updation_date")} style={{ cursor: "pointer", position: "relative" }}>
              Updation Date {getSortIndicator("order_updation_date")}
            </th>
          </tr>
        </thead>
        <tbody className="table-group-divider">
          {dataRows === 0 ? (
            <tr>
              <td
                colSpan="14"
                className="text-center"
                style={{ padding: "20px", height: "460px" }}
              >
                No orders found matching the current filters.
              </td>
            </tr>
          ) : (
            <>
              {sortedOrderData.slice(0, rowsToDisplay).map((item) => (
                <tr
                  key={item._id}
                  onClick={() => handleRowClick(item)}
                  style={{ cursor: "pointer" }}
                >
                  <th>{item.security_type==="company"? "Company Stock": "Mutual Fund"}</th>
                  <td>{item.security_identifier}</td>
                  <td>{item.order_type}</td>
                  <td>{item.order_sub_type}</td>
                  <td>{item.quantity}</td>
                  <td>{item.price || "N/A"}</td>
                  <td>{item.time_in_force}</td>
                  <td>{item.status}</td>
                  <td>{item.filled_quantity || 0}</td>
                  <td>{item.average_fill_price || "N/A"}</td>
                  <td>{formatDisplayDate(item.date)}</td>
                  <td>
                    {item.order_updation_date
                      ? formatDisplayDate(item.order_updation_date)
                      : formatDisplayDate(item.updatedAt)}
                  </td>
                </tr>
              ))}
              {/* Render empty rows to maintain minimum table height */}
              {dataRows < minRows &&
                Array(minRows - dataRows)
                  .fill(null)
                  .map((_, index) => (
                    <tr key={`empty-${index}`}>
                      {Array(12).fill(<td key={`empty-cell-${index}-col`}>&nbsp;</td>)}
                    </tr>
                  ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;