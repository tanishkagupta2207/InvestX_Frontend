import React, { useState, useEffect } from "react";
// Assuming ConformationalModal is the default export from this path
import ConformationalModal from '../../utils/ConformationalModal';

const GroupInfo = ({ chat, currentUser, onBack, onUpdate, onCloseChat, showAlert }) => {
  const [groupName, setGroupName] = useState(chat ? chat.name : "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  // --- FIX 1: Local State for Members ---
  const [membersList, setMembersList] = useState(chat ? chat.members : []);
  const [localPending, setLocalPending] = useState(chat.pending_members || []);

  // --- FIX 2: Sync state if the parent prop updates (e.g. background polling) ---
  useEffect(() => {
    if (chat) {
        setMembersList(chat.members);
        setLocalPending(chat.pending_members || []);
    }
  }, [chat]);

  // --- Modal Configuration State ---
  const [modalConfig, setModalConfig] = useState({
    show: false,
    title: "",
    message: "",
    action: null,
    variant: "danger",
    confirmText: "Confirm"
  });

  // Safe Admin Check
  const isAdmin = chat.is_group_chat && chat.group_admin && (
      (chat.group_admin._id === currentUser?._id) || 
      (chat.group_admin === currentUser?._id)
  );

  const closeModal = () => {
    setModalConfig({ ...modalConfig, show: false });
  };

  // ===========================================================================
  // 1. API EXECUTORS
  // ===========================================================================

  const executeRemoveMember = async (memberId) => {
    closeModal();
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/group/remove`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "auth-token": localStorage.getItem("token") },
        body: JSON.stringify({ chatRoomId: chat._id, memberId: memberId }),
      });
      const data = await response.json();
      if (data.success) { 
          showAlert("Member removed.", "success"); 
          
          // --- FIX 3: Update Local State Immediately ---
          setMembersList(prev => prev.filter(m => m._id !== memberId));
          
          onUpdate(); // Trigger background refresh
      } else { 
          showAlert(data.msg, "warning"); 
      }
    } catch (error) { console.error(error); }
  };

  const executeLeaveGroup = async () => {
    closeModal();
    try {
        const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/group/leave`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "auth-token": localStorage.getItem("token") },
            body: JSON.stringify({ chatRoomId: chat._id }),
        });
        const data = await response.json();
        if (data.success) {
            showAlert("You left the group.", "info");
            onCloseChat(); 
        } else { showAlert(data.msg, "danger"); }
    } catch (error) { console.error(error); }
  };

  const executeDeleteGroup = async () => {
    closeModal();
    try {
        const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/group/${chat._id}`, {
            method: "DELETE",
            headers: { "auth-token": localStorage.getItem("token") },
        });
        const data = await response.json();
        if (data.success) {
            showAlert("Group deleted.", "success");
            onCloseChat(); 
        } else { showAlert(data.msg, "danger"); }
    } catch (error) { console.error(error); }
  };

  // ===========================================================================
  // 2. MODAL TRIGGERS
  // ===========================================================================

  const handleRemoveClick = (memberId) => {
    setModalConfig({
        show: true,
        title: "Remove Member",
        message: "Are you sure you want to remove this user? They will no longer receive messages.",
        action: () => executeRemoveMember(memberId),
        variant: "warning",
        confirmText: "Remove"
    });
  };

  const handleLeaveClick = () => {
    setModalConfig({
        show: true,
        title: "Leave Group",
        message: "Are you sure you want to leave this group? You won't be able to rejoin unless invited.",
        action: () => executeLeaveGroup(),
        variant: "danger",
        confirmText: "Leave"
    });
  };

  const handleDeleteClick = () => {
    setModalConfig({
        show: true,
        title: "Delete Group",
        message: "WARNING: This will permanently delete the group and all messages for EVERYONE. This action cannot be undone.",
        action: () => executeDeleteGroup(),
        variant: "danger",
        confirmText: "Delete Permanently"
    });
  };

  // ===========================================================================
  // 3. STANDARD ACTIONS
  // ===========================================================================

  const handleRename = async () => {
    if (!groupName.trim() || groupName === chat.name) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/group/rename`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "auth-token": localStorage.getItem("token") },
        body: JSON.stringify({ chatRoomId: chat._id, newName: groupName }),
      });
      const data = await response.json();
      if (data.success) { showAlert("Group renamed!", "success"); onUpdate(); } 
      else { showAlert(data.msg, "danger"); }
    } catch (error) { console.error(error); }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/search-users?query=${searchQuery}`, {
        headers: { "auth-token": localStorage.getItem("token") },
      });
      const data = await response.json();
      if (data.success) setSearchResults(data.users);
    } catch (error) { console.error(error); }
  };

  const handleInviteMember = async (userId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/group/invite`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "auth-token": localStorage.getItem("token") },
        body: JSON.stringify({ chatRoomId: chat._id, newMemberId: userId }),
      });
      const data = await response.json();
      if (data.success) {
        showAlert("Invitation sent!", "success");
        setLocalPending([...localPending, userId]);
        onUpdate();
      } else { showAlert(data.msg, "warning"); }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="d-flex flex-column h-100 bg-black text-light">
      {/* Header */}
      <div className="p-3 border-bottom border-secondary bg-dark d-flex align-items-center">
        <button onClick={onBack} className="btn btn-sm btn-outline-light me-3"><i className="fa-solid fa-arrow-left"></i></button>
        <h5 className="mb-0">Group Settings</h5>
      </div>

      <div className="flex-grow-1 overflow-auto p-4 custom-scrollbar">
        {/* A. Details */}
        <div className="mb-5">
            <label className="text-secondary fw-bold small mb-2">GROUP NAME</label>
            <div className="d-flex gap-2">
                <input type="text" className="form-control bg-dark text-light border-secondary" value={groupName} onChange={(e) => setGroupName(e.target.value)} disabled={!isAdmin}/>
                {isAdmin && <button className="btn btn-primary" onClick={handleRename} disabled={groupName === chat.name}>Save</button>}
            </div>
        </div>

        {/* B. Invite (Admin) */}
        {isAdmin && (
            <div className="mb-5">
                <label className="text-secondary fw-bold small mb-2">INVITE MEMBERS</label>
                <form onSubmit={handleSearch} className="d-flex gap-2 mb-3">
                    <input type="text" className="form-control bg-dark text-light border-secondary" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                    <button type="submit" className="btn btn-outline-light">Search</button>
                </form>
                {searchResults.length > 0 && (
                    <div className="card bg-dark border-secondary mb-3">
                        <ul className="list-group list-group-flush">
                            {searchResults.map(user => {
                                // Check both active members and pending
                                const isMember = membersList.some(m => m._id === user._id);
                                const isPending = localPending.includes(user._id) || (chat.pending_members && chat.pending_members.includes(user._id));
                                const isActionable = !isMember && !isPending;
                                return (
                                    <li key={user._id} onClick={() => { if (isActionable) handleInviteMember(user._id); }} className={`list-group-item bg-transparent text-light border-secondary d-flex justify-content-between align-items-center ${isActionable ? 'list-group-item-action' : ''}`} style={{ cursor: isActionable ? "pointer" : "default" }}>
                                        <div><span className="fw-bold">{user.name}</span>{user.username && <span className="text-muted ms-2 small">@{user.username}</span>}</div>
                                        {isMember ? <span className="badge bg-success">Joined</span> : isPending ? <span className="badge bg-warning text-dark">Invited</span> : <button className="btn btn-sm btn-success"><i className="fa-solid fa-envelope me-1"></i> Invite</button>}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        )}

        {/* C. Members (FIX 4: Render membersList) */}
        <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="text-secondary fw-bold small">MEMBERS - {membersList.length}</label>
                <button onClick={onUpdate} className="btn btn-sm btn-link text-muted text-decoration-none"><i className="fa-solid fa-rotate-right me-1"></i></button>
            </div>
            <ul className="list-group list-group-flush border border-secondary rounded">
                {membersList.map(member => {
                    const isGroupAdmin = (chat.group_admin._id === member._id || chat.group_admin === member._id);
                    return (
                        <li key={member._id} className="list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center p-3">
                            <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-secondary d-flex justify-content-center align-items-center me-3" style={{ width: "35px", height: "35px" }}><i className="fa-solid fa-user"></i></div>
                                <div><span className="fw-bold">{member.name} {member._id === currentUser._id && "(You)"}</span><div className="small text-muted">{member.email}</div></div>
                            </div>
                            <div>
                                {isGroupAdmin && <span className="badge bg-primary me-2">Admin</span>}
                                {isAdmin && !isGroupAdmin && <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveClick(member._id)}><i className="fa-solid fa-trash"></i></button>}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>

        {/* D. Danger Zone */}
        <div className="border border-danger rounded p-3">
            <h6 className="text-danger fw-bold mb-3"><i className="fa-solid fa-triangle-exclamation me-2"></i> Danger Zone</h6>
            {isAdmin ? (
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Delete Group</strong>
                        <p className="text-muted small mb-0">Permanently remove this group and all messages.</p>
                    </div>
                    <button className="btn btn-danger" onClick={handleDeleteClick}>Delete Group</button>
                </div>
            ) : (
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Leave Group</strong>
                        <p className="text-muted small mb-0">You will stop receiving messages from this group.</p>
                    </div>
                    <button className="btn btn-outline-danger" onClick={handleLeaveClick}>Leave Group</button>
                </div>
            )}
        </div>
      </div>

      {/* RENDER THE MODAL */}
      <ConformationalModal 
        show={modalConfig.show}
        title={modalConfig.title}
        message={modalConfig.message}
        variant={modalConfig.variant}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.action}
        onCancel={closeModal}
      />
    </div>
  );
};

export default GroupInfo;