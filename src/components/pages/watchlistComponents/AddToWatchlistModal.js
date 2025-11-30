import React, { useState, useEffect, useCallback } from "react";

const AddToWatchlistModal = ({
  show,
  onClose,
  security_id,
  showAlert,
  stockName,
  securityType = "company", // Default to 'company'
}) => {
  const [userWatchlists, setUserWatchlists] = useState([]);
  const [selectedWatchlistName, setSelectedWatchlistName] = useState("");
  const [isWatchlistLoading, setIsWatchlistLoading] = useState(false);
  const [watchlistMessage, setWatchlistMessage] = useState("");
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [showCreateInput, setShowCreateInput] = useState(false);

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
        // Default to the first watchlist if available
        if (res.watchlists.length > 0) {
          setSelectedWatchlistName(res.watchlists[0].name);
        }
      } else {
        // Only show error if it's not just "no watchlists found" (404 is common for empty lists)
        if (response.status !== 404) {
          setWatchlistMessage(`Error: ${res.msg}`);
        }
      }
    } catch (error) {
      console.error("Error fetching watchlists:", error);
      setWatchlistMessage("Network error loading watchlists.");
    } finally {
      setIsWatchlistLoading(false);
    }
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (show) {
      setWatchlistMessage("");
      setShowCreateInput(false);
      setNewWatchlistName("");
      fetchUserWatchlists();
    }
  }, [show, fetchUserWatchlists]);

  const handleCreateNew = () => {
    setShowCreateInput(true);
    setNewWatchlistName("");
    setWatchlistMessage("");
  };

  const handleSubmit = async () => {
    setIsWatchlistLoading(true);
    setWatchlistMessage("");

    // 1. Handle Creation Flow
    if (showCreateInput) {
      if (!newWatchlistName.trim()) {
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
            body: JSON.stringify({ watchlistName: newWatchlistName }),
          }
        );
        const createRes = await createResponse.json();

        if (createRes.success) {
          // If creation succeeded, immediately add the item to this new watchlist
          await addToWatchlistAPI(newWatchlistName);
        } else {
          setWatchlistMessage(
            `Error: ${createRes.msg || "Failed to create watchlist."}`
          );
          setIsWatchlistLoading(false);
        }
      } catch (error) {
        setWatchlistMessage(`Error: ${error.message}`);
        setIsWatchlistLoading(false);
      }
    }
    // 2. Handle Existing Watchlist Flow
    else {
      if (!security_id || !selectedWatchlistName) {
        setWatchlistMessage(
          "Error: Missing security ID or selected watchlist."
        );
        setIsWatchlistLoading(false);
        return;
      }
      await addToWatchlistAPI(selectedWatchlistName);
    }
  };

  // Centralized function to call the /add endpoint
  const addToWatchlistAPI = async (targetList) => {
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
            security_id: security_id, // MATCHING BACKEND SCHEMA
            watchlistName: targetList,
            type: securityType, // MATCHING BACKEND SCHEMA
          }),
        }
      );
      const addRes = await addResponse.json();

      if (addRes.success) {
        // Notify parent of success and close modal
        onClose(true, addRes.msg);
      } else {
        // Keep modal open and show error
        setWatchlistMessage(
          `Error: ${addRes.msg || "Failed to add to watchlist."}`
        );
        setIsWatchlistLoading(false);
      }
    } catch (error) {
      console.error("Failed to add to watchlist:", error);
      setWatchlistMessage(`Error: ${error.message}`);
      setIsWatchlistLoading(false);
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
              onClick={() => onClose(false)}
            ></button>
          </div>
          <div className="modal-body">
            {isWatchlistLoading ? (
              <div className="text-center py-3">
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
                      <button
                        className="btn btn-link text-info p-0 text-decoration-none"
                        onClick={handleCreateNew}
                      >
                        + Create a new Watchlist
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
                      <button
                        className="btn btn-link text-secondary p-0 text-decoration-none"
                        onClick={() => setShowCreateInput(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Error Message Display */}
            {watchlistMessage && (
              <div
                className="alert alert-danger mt-3 py-2 text-center"
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
              onClick={() => onClose(false)}
              disabled={isWatchlistLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={
                isWatchlistLoading ||
                (!showCreateInput &&
                  !selectedWatchlistName &&
                  userWatchlists.length > 0) ||
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
