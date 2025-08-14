import React, { useState, useEffect } from "react";
import SideBar from "../SideBar";
import ChartWrapper from "./tradePageComponents/ChartWrapper";
import CreateWatchlistModal from "./watchlistComponents/CreateWatchlistModal";
import RenameWatchlistModal from "./watchlistComponents/RenameWatchlistModal";
import DeleteConfirmationModal from "./watchlistComponents/DeleteConfirmationModal";

function WatchListPage(props) {
  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState(null);
  const [selectedWatchlistDetails, setSelectedWatchlistDetails] = useState(null); // New state for detailed view
  const [loading, setLoading] = useState(false); // New loading state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [watchlistToRename, setWatchlistToRename] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [watchlistToDelete, setWatchlistToDelete] = useState(null);

  // Fetches the list of all watchlists (without company details)
  const fetchWatchlists = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/watchlist/get`,
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
        setWatchlists(res.watchlists);
      } else {
        props.showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error Fetching WatchLists: ", error);
      props.showAlert(
        "Something went wrong! Please try again later.",
        "danger"
      );
    }
  };

  // NEW FUNCTION: Fetches the detailed contents of a specific watchlist
  const fetchWatchlistDetails = async (watchlist) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/watchlist/getCustom`,
        {
          method: "POST", // Assuming a POST request to send the watchlist ID
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ watchlistName: watchlist.name }),
        }
      );
      const res = await response.json();
      if (res.success) {
        setSelectedWatchlistDetails(res.watchlist);
        setSelectedWatchlist(watchlist); // Set the selected watchlist
      } else {
        props.showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error Fetching Watchlist Details: ", error);
      props.showAlert(
        "Something went wrong! Please try again later.",
        "danger"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWatchlist = async (watchlistName) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/watchlist/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ watchlistName: watchlistName }),
        }
      );
      const res = await response.json();
      if (res.success) {
        fetchWatchlists();
        props.showAlert(res.msg, "success");
        setShowCreateModal(false);
      } else {
        props.showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error Creating WatchList: ", error);
      props.showAlert(
        "Something went wrong! Please try again later.",
        "danger"
      );
    }
  };

  const handleRenameWatchlist = async (watchlistId, newName) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/watchlist/rename`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ newName: newName, watchlistId: watchlistId }),
        }
      );
      const res = await response.json();
      if (res.success) {
        fetchWatchlists();
        props.showAlert(res.msg, "success");
        setShowRenameModal(false);
      } else {
        props.showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error Renaming WatchList: ", error);
      props.showAlert(
        "Something went wrong! Please try again later.",
        "danger"
      );
    }
  };

  // NEW: Function to open the custom confirmation modal
  const handleDeleteConfirmation = (watchlist) => {
    setWatchlistToDelete(watchlist);
    setShowDeleteModal(true);
  };
  
  // NEW: Function to be called by the modal to trigger the actual deletion
  const onConfirmDelete = async () => {
    if (watchlistToDelete) {
      await handleDeleteWatchlist(watchlistToDelete._id);
      // Reset state after deletion
      setWatchlistToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteWatchlist = async (watchlistId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/watchlist/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ watchlistId: watchlistId }),
        }
      );
      const res = await response.json();
      if (res.success) {
        fetchWatchlists();
        props.showAlert(res.msg, "success");
        if (selectedWatchlist && selectedWatchlist._id === watchlistId) {
          setSelectedWatchlist(null);
          setSelectedWatchlistDetails(null);
        }
      } else {
        props.showAlert(
          res.msg || (res.errors && res.errors[0]?.msg) || "An error occurred",
          "danger"
        );
      }
    } catch (error) {
      console.error("Error Deleting WatchList: ", error);
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
    fetchWatchlists();
    // eslint-disable-next-line
  }, []);

  const renderWatchlistList = () => {
    return (
      <>
        <h2 className="text-white mt-4 mb-3">Your Watchlists</h2>
        <button className="btn btn-primary mb-3" onClick={() => setShowCreateModal(true)}>
          Create New Watchlist
        </button>
        <div className="list-group">
          {watchlists.length > 0 ? (
            watchlists.map((watchlist) => (
              <div
                key={watchlist._id}
                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center bg-dark text-white border-secondary"
                style={{ cursor: "pointer" }}
                onClick={() => fetchWatchlistDetails(watchlist)} // Modified onClick handler
              >
                {watchlist.name}
                <div>
                  <button
                    className="btn btn-sm btn-outline-info me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWatchlistToRename(watchlist);
                      setShowRenameModal(true);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConfirmation(watchlist);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="alert alert-info">
              You have no watchlists. Click "Create New Watchlist" to get started.
            </div>
          )}
        </div>
      </>
    );
  };

  const renderWatchlistDetails = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="d-flex justify-content-between align-items-center">
          <button className="btn btn-secondary" onClick={() => { setSelectedWatchlist(null); setSelectedWatchlistDetails(null); }}>
            &larr; Back to Watchlists
          </button>
          <h2 className="text-white mt-4 mb-3 text-center flex-grow-1">{selectedWatchlist?.name}</h2>
          <span style={{ width: "120px" }}></span>
        </div>
        <div className="row">
          {selectedWatchlistDetails?.companies && selectedWatchlistDetails.companies.length > 0 ? (
            selectedWatchlistDetails.companies.map((company) => (
              <ChartWrapper
                key={company.company_id}
                stockSymbol={company.symbol}
                stockName={company.name}
                company_id={company._id}
                showAlert={props.showAlert}
                inInWatchList={true}
                watchlistName={selectedWatchlist.name}
              />
            ))
          ) : (
            <div key="no-companies-in-watchlist" className="col-12">
              <div className="alert alert-info">
                No companies added to this watchlist.
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  const mainContentStyle = {
    marginLeft: "280px",
    paddingLeft: "20px",
    paddingRight: "50px",
    width: "calc(100% - 280px)",
    boxSizing: "border-box",
    backgroundColor: "#212529",
  };
  const pageWrapperStyle = { minHeight: "100vh", backgroundColor: "#212529" };

  return (
    <div data-bs-theme="dark" style={pageWrapperStyle}>
      <SideBar />
      <div className="py-4" style={mainContentStyle}>
        <h1 className="text-center text-white mb-3">WatchList</h1>
        {!selectedWatchlist ? renderWatchlistList() : renderWatchlistDetails()}
      </div>

      {showCreateModal && (
        <CreateWatchlistModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateWatchlist}
        />
      )}

      {showRenameModal && (
        <RenameWatchlistModal
          watchlist={watchlistToRename}
          onClose={() => setShowRenameModal(false)}
          onRename={handleRenameWatchlist}
        />
      )}

      {showDeleteModal && watchlistToDelete && (
        <DeleteConfirmationModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={onConfirmDelete}
          watchlistName={watchlistToDelete.name}
        />
      )}
    </div>
  );
}

export default WatchListPage;