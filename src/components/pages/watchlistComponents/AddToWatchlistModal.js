import React, { useState, useEffect, useCallback } from "react";

const AddToWatchlistModal = ({
  show,
  onClose,
  company_id,
  showAlert,
  stockName,
}) => {
  const [userWatchlists, setUserWatchlists] = useState([]);
  const [selectedWatchlistName, setSelectedWatchlistName] = useState("");
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [watchlistMessage, setWatchlistMessage] = useState("");
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [showCreateInput, setShowCreateInput] = useState(false); // NEW state for toggling create input

  const fetchUserWatchlists = useCallback(async () => {
    setIsWatchlistLoading(true);
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
        setUserWatchlists(res.watchlists);
        // Set the default selected watchlist to the first one, if available
        if (res.watchlists.length > 0) {
          setSelectedWatchlistName(res.watchlists[0].name);
        }
      } else {
        showAlert(res.msg || "Failed to load watchlists.", "danger");
      }
    } catch (error) {
      console.error("Error fetching watchlists:", error);
      showAlert("Something went wrong loading watchlists.", "danger");
    } finally {
      setIsWatchlistLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    if (show) {
      fetchUserWatchlists();
    }
  }, [show, fetchUserWatchlists]);

  const handleCreateNew = () => {
    setShowCreateInput(true);
    setNewWatchlistName("");
    setWatchlistMessage("");
  };

  const handleAddToWatchlist = async () => {
    setIsWatchlistLoading(true);
    setWatchlistMessage("");

    if (showCreateInput) {
      // Logic for creating a new watchlist first
      if (!newWatchlistName) {
        setWatchlistMessage("Watchlist name is required.");
        setIsWatchlistLoading(false);
        return;
      }
      try {
        const createResponse = await fetch(
          `${process.env.REACT_APP_HOST_URL}api/watchlist/create`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "auth-token": `${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              watchlistName: newWatchlistName,
            }),
          }
        );
        const createRes = await createResponse.json();
        if (createRes.success) {
          // If creation is successful, then add the company
          await handleAddCompanyToWatchlist(newWatchlistName);
        } else {
          setWatchlistMessage(`Error: ${createRes.msg || "Failed to create watchlist."}`);
        }
      } catch (error) {
        console.error("Failed to create watchlist:", error);
        setWatchlistMessage(`Error: ${error.message}`);
      } finally {
        setIsWatchlistLoading(false);
        setTimeout(() => setWatchlistMessage(""), 5000);
      }
    } else {
      // Logic for adding to an existing watchlist
      if (!company_id || !selectedWatchlistName) {
        setWatchlistMessage("Error: Missing company ID or selected watchlist name.");
        setIsWatchlistLoading(false);
        return;
      }
      await handleAddCompanyToWatchlist(selectedWatchlistName);
    }
  };

  const handleAddCompanyToWatchlist = async (watchlistName) => {
    try {
      const addResponse = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/watchlist/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": `${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            companyId: company_id,
            watchlistName: watchlistName,
          }),
        }
      );
      const addRes = await addResponse.json();
      if (addRes.success) {
        onClose(addRes.msg);
      } else {
        setWatchlistMessage(
          `Error: ${addRes.msg || "Failed to add to watchlist."}`
        );
      }
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      setWatchlistMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: show ? "rgba(0,0,0,0.5)" : "transparent" }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header">
            <h5 className="modal-title">Add {stockName} to Watchlist</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={() => onClose()}
            ></button>
          </div>
          <div className="modal-body">
            {isWatchlistLoading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                {!showCreateInput ? (
                  <div className="mb-3">
                    <label htmlFor="watchlist-select" className="form-label">
                      Select an existing watchlist:
                    </label>
                    <select
                      className="form-select bg-dark text-white border-secondary"
                      id="watchlist-select"
                      value={selectedWatchlistName}
                      onChange={(e) => setSelectedWatchlistName(e.target.value)}
                      disabled={!userWatchlists.length}
                    >
                      {userWatchlists.length > 0 ? (
                        userWatchlists.map((list) => (
                          <option key={list._id} value={list.name}>
                            {list.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No watchlists found
                        </option>
                      )}
                    </select>
                    <div className="d-flex justify-content-end mt-2">
                        <button className="btn btn-link text-info p-0" onClick={handleCreateNew}>
                          Create a new Watchlist
                        </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    <label htmlFor="new-watchlist-name" className="form-label">
                      New watchlist name:
                    </label>
                    <input
                      type="text"
                      id="new-watchlist-name"
                      className="form-control bg-dark text-white border-secondary"
                      value={newWatchlistName}
                      onChange={(e) => setNewWatchlistName(e.target.value)}
                      placeholder="e.g. My Favorite Stocks"
                    />
                    <div className="d-flex justify-content-end mt-2">
                        <button className="btn btn-link text-info p-0" onClick={() => setShowCreateInput(false)}>
                            Cancel
                        </button>
                    </div>
                  </div>
                )}
              </>
            )}
            {watchlistMessage && (
              <div
                className={`alert alert-${
                  watchlistMessage.includes("Error") ? "danger" : "success"
                } mt-3`}
                role="alert"
              >
                {watchlistMessage}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => onClose()}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddToWatchlist}
              disabled={
                isWatchlistLoading ||
                (!showCreateInput && !selectedWatchlistName) ||
                (showCreateInput && !newWatchlistName)
              }
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddToWatchlistModal;