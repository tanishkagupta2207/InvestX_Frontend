import React, { useState, useEffect } from 'react';

const RenameWatchlistModal = ({ onClose, onRename, watchlist }) => {
  const [newWatchlistName, setNewWatchlistName] = useState('');

  useEffect(() => {
    if (watchlist) {
      setNewWatchlistName(watchlist.name);
    }
  }, [watchlist]);

  const handleRename = (e) => {
    e.preventDefault();
    if (newWatchlistName.trim() && newWatchlistName.trim() !== watchlist.name) {
      onRename(watchlist._id, newWatchlistName.trim());
    }
  };

  const isNameUnchanged = newWatchlistName.trim() === watchlist.name;

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header">
            <h5 className="modal-title">Rename Watchlist</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleRename}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="renameWatchlistName" className="form-label">New Watchlist Name</label>
                <input
                  type="text"
                  className="form-control bg-secondary text-white border-dark"
                  id="renameWatchlistName"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  placeholder="Enter a new name"
                  required
                />
              </div>
            </div>
            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newWatchlistName.trim() || isNameUnchanged}
              >
                Rename
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RenameWatchlistModal;