import React, { useState, useEffect } from "react";

const ChatSidebar = ({ onSelectChat, activeChatId, onOpenGroupModal, refreshTrigger, showAlert }) => {
  const [chats, setChats] = useState([]);
  const [invites, setInvites] = useState([]); 
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // 1. Fetch Active Chats
      const chatRes = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/my-chats`, {
        headers: { "auth-token": token },
      });
      const chatData = await chatRes.json();
      if (chatData.success) setChats(chatData.chats);

      // 2. Fetch Pending Invitations
      const inviteRes = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/invites`, {
        headers: { "auth-token": token },
      });
      const inviteData = await inviteRes.json();
      if (inviteData.success) setInvites(inviteData.invites);
      
      // 3. Fetch Unread Counts
      const countRes = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/unread`, {
        headers: { "auth-token": token },
      });
      const countData = await countRes.json();
      if (countData.success) setUnreadCounts(countData.unreadMap);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000); 
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const handleInviteResponse = async (chatRoomId, action) => {
    const endpoint = action === 'accept' ? 'group/accept' : 'group/reject';
    try {
        const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/${endpoint}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "auth-token": localStorage.getItem("token") },
            body: JSON.stringify({ chatRoomId })
        });
        const data = await response.json();
        
        if (data.success) {
            showAlert(data.msg, action === 'accept' ? "success" : "info");
            fetchAllData(); 
        } else {
            showAlert(data.msg, "danger");
        }
    } catch (error) { console.error(error); }
  };

  return (
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <div className="p-3 border-bottom border-secondary d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold text-white">Messages</h5>
        <button className="btn btn-sm btn-outline-light" onClick={onOpenGroupModal}>
          <i className="fa-solid fa-pen-to-square"></i>
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <input
          type="text"
          className="form-control bg-dark text-light border-secondary"
          placeholder="Search chats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Content List */}
      <div className="flex-grow-1 overflow-auto custom-scrollbar">
        {loading ? (
            <div className="text-center mt-4 text-secondary">Loading...</div>
        ) : (
            <>
                {/* --- PENDING INVITATIONS CAROUSEL --- */}
                {invites.length > 0 && (
                    <div className="mb-3 border-bottom border-secondary">
                        {/* Header */}
                        <div className="px-3 py-2 text-warning small fw-bold bg-dark d-flex justify-content-between align-items-center">
                            <span>PENDING INVITES ({invites.length})</span>
                            <small className="text-muted" style={{fontSize: "0.6rem"}}>Swipe ⮕</small>
                        </div>
                        
                        {/* Horizontal Scroll Container */}
                        <div 
                            className="d-flex overflow-auto" 
                            style={{ 
                                scrollSnapType: "x mandatory", 
                                scrollBehavior: "smooth",
                                whiteSpace: "nowrap"
                            }}
                        >
                            {invites.map((invite, index) => (
                                <div 
                                    key={invite._id} 
                                    className="p-3 bg-dark flex-shrink-0 border-end border-secondary position-relative"
                                    style={{ 
                                        minWidth: "100%", 
                                        scrollSnapAlign: "start",
                                        whiteSpace: "normal" // Reset text wrapping
                                    }}
                                >
                                    {/* Invite Content */}
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <span className="fw-bold text-white d-block text-truncate" style={{maxWidth: "200px"}}>{invite.name}</span>
                                            <small className="text-secondary" style={{fontSize: "0.7rem"}}>
                                                invited by <span className="text-light">{invite.group_admin?.name || "Admin"}</span>
                                            </small>
                                        </div>
                                        <i className="fa-solid fa-envelope-open-text text-warning fa-lg"></i>
                                    </div>

                                    {/* Actions */}
                                    <div className="d-flex gap-2 mb-2">
                                        <button 
                                            className="btn btn-sm btn-success flex-grow-1"
                                            onClick={() => handleInviteResponse(invite._id, 'accept')}
                                        >
                                            Accept
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-outline-danger flex-grow-1"
                                            onClick={() => handleInviteResponse(invite._id, 'reject')}
                                        >
                                            Decline
                                        </button>
                                    </div>

                                    {/* Pagination Dots */}
                                    {invites.length > 1 && (
                                        <div className="d-flex justify-content-center gap-1 mt-1">
                                            {invites.map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`rounded-circle ${i === index ? "bg-warning" : "bg-secondary"}`} 
                                                    style={{width: "4px", height: "4px"}}
                                                ></div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- ACTIVE CHATS LIST --- */}
                <ul className="list-group list-group-flush">
                {chats
                .filter(chat => (chat.name || "").toLowerCase().includes(searchTerm.toLowerCase()))
                .map((chat) => {
                    
                    const isSystem = chat._id === "system";
                    const isActive = activeChatId === chat._id;
                    
                    let iconClass = "fa-user";
                    let bgClass = "bg-secondary";
                    
                    if (isSystem) {
                        iconClass = "fa-robot"; 
                        bgClass = "bg-primary"; 
                    } else if (chat.is_group_chat) {
                        iconClass = "fa-users";
                    }

                    const unreadCount = isSystem ? chat.unread_count : (unreadCounts[chat._id] || 0);

                    // Styling logic
                    const containerClass = isActive 
                        ? "bg-dark border-start border-primary border-4" 
                        : "bg-transparent";
                    
                    const titleColor = isActive ? "#ffffff" : "#e4e6eb"; 
                    const subTextColor = isActive ? "#cccccc" : "#b0b3b8"; 

                    return (
                    <li
                        key={chat._id}
                        className={`list-group-item list-group-item-action p-3 border-0 d-flex justify-content-between align-items-center ${containerClass}`}
                        style={{ cursor: "pointer", borderBottom: "1px solid #2c2c2c" }}
                        onClick={() => onSelectChat(chat)}
                    >
                        <div className="d-flex align-items-center flex-grow-1 overflow-hidden">
                        {/* Avatar */}
                        <div className={`rounded-circle ${bgClass} d-flex justify-content-center align-items-center me-3 flex-shrink-0`} style={{ width: "45px", height: "45px" }}>
                            <i className={`fa-solid ${iconClass} text-white`}></i>
                        </div>
                        
                        {/* Info Area */}
                        <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex justify-content-between align-items-center">
                                {/* Chat Name */}
                                <h6 className="mb-0 text-truncate fw-bold" style={{ color: titleColor }}>
                                    {chat.name} 
                                    {isSystem && <i className="fa-solid fa-circle-check text-primary ms-1" style={{fontSize: "0.8rem"}}></i>}
                                </h6>

                                {/* Timestamp */}
                                <small style={{ fontSize: "0.7rem", color: subTextColor, minWidth: "50px", textAlign: "right" }}>
                                    {chat.updated_at ? new Date(chat.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                                </small>
                            </div>

                            {/* Preview Message */}
                            <small className="d-block text-truncate" style={{ color: subTextColor, opacity: 0.9 }}>
                            {chat.last_message?.type === 'system_alert' 
                                ? <i>System Alert</i> 
                                : (chat.last_message?.content || "No messages yet")
                            }
                            </small>
                        </div>
                        </div>

                        {/* Unread Badge */}
                        {unreadCount > 0 && !isActive && (
                            <span className="badge rounded-pill bg-danger ms-2">
                                {unreadCount}
                            </span>
                        )}
                    </li>
                    );
                })}
                </ul>
            </>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;