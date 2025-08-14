import React, { useState } from 'react';

const CreateWatchlistModal = ({ onClose, onCreate }) => {
  const [watchlistName, setWatchlistName] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (watchlistName.trim()) {
      onCreate(watchlistName.trim());
    }
  };

  return (
    <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-white border-secondary">
          <div className="modal-header">
            <h5 className="modal-title">Create New Watchlist</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleCreate}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="watchlistName" className="form-label">Watchlist Name</label>
                <input
                  type="text"
                  className="form-control bg-secondary text-white border-dark"
                  id="watchlistName"
                  value={watchlistName}
                  onChange={(e) => setWatchlistName(e.target.value)}
                  placeholder="e.g., My Favorites"
                  required
                />
              </div>
            </div>
            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={!watchlistName.trim()}>
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWatchlistModal;