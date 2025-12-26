import React, { useState } from "react";

const CreateGroupModal = ({ onClose, onGroupCreated, showAlert }) => {
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!groupName) {
        showAlert("Group name is required", "warning");
        return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": localStorage.getItem("token"),
        },
        // Currently creating a group with just the creator. 
        // You can add a UI to select members here later.
        body: JSON.stringify({
          name: groupName,
          memberIds: [] 
        }),
      });
      const data = await response.json();
      if (data.success) {
        showAlert("Group created successfully!", "success");
        onGroupCreated();
      } else {
        showAlert(data.msg, "danger");
      }
    } catch (error) {
      console.error(error);
      showAlert("An error occurred", "danger");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content bg-dark text-light border-secondary">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">Create New Group</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Group Name</label>
              <input
                type="text"
                className="form-control bg-black text-light border-secondary"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Market Movers"
              />
            </div>
            <div className="alert alert-secondary py-2 small">
                <i className="fa-solid fa-info-circle me-2"></i>
                You can add members from the chat settings after creation.
            </div>
          </div>
          <div className="modal-footer border-secondary">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleCreate}
                disabled={loading}
            >
                {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;