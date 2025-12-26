import React, { useState, useEffect, useRef } from "react";
import GroupInfo from "./GroupInfo"; 

const ChatWindow = ({ chat, currentUser, refreshSidebar, onCloseChat, showAlert }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false); 
  const messagesEndRef = useRef(null);

  const isSystemChat = chat?._id === "system";

  // --- HELPER 1: Message Time (10:30 AM) ---
  const formatMessageTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // --- HELPER 2: Date Separator (Today, Yesterday, Dec 27) ---
  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    if (date.toDateString() === now.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // ===========================================================================
  // 1. DATA FETCHING
  // ===========================================================================
  const fetchMessages = async (isBackgroundPoll = false) => {
    if (!chat?._id) return;
    try {
      const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/messages/${chat._id}`, {
        method: "GET",
        headers: { "auth-token": localStorage.getItem("token") },
      });
      const data = await response.json();
      if (data.success) setMessages(data.messages);
    } catch (error) { console.error(error); } 
    finally { if (!isBackgroundPoll) setLoading(false); }
  };

  useEffect(() => {
    if (!chat?._id) return;
    setMessages([]); setLoading(true); setShowSettings(false); 
    fetchMessages(false);
    
    fetch(`${process.env.REACT_APP_HOST_URL}api/chat/read/${chat._id}`, {
        method: "PUT",
        headers: { "auth-token": localStorage.getItem("token") }
    }).then(() => refreshSidebar()).catch(err => console.error(err));

    const interval = setInterval(() => fetchMessages(true), 3000); 
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chat?._id]); 

  useEffect(() => {
    if (!loading) messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); 
  }, [messages, loading]);

  // ===========================================================================
  // 2. ACTIONS
  // ===========================================================================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat?._id || isSystemChat) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_HOST_URL}api/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "auth-token": localStorage.getItem("token") },
        body: JSON.stringify({ chatRoomId: chat._id, content: newMessage, type: "text" }),
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]); 
        setNewMessage(""); refreshSidebar();
      } else { showAlert("Failed to send message", "danger"); }
    } catch (error) { console.error(error); }
  };

  if (!chat || !currentUser) return <div className="d-flex justify-content-center align-items-center h-100 text-muted">Loading...</div>;

  if (showSettings && !isSystemChat) {
      return <GroupInfo chat={chat} currentUser={currentUser} onBack={() => setShowSettings(false)} onUpdate={refreshSidebar} onCloseChat={onCloseChat} showAlert={showAlert} />;
  }

  // ===========================================================================
  // 3. MAIN RENDER
  // ===========================================================================
  return (
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <div className="p-3 border-bottom border-secondary bg-dark d-flex justify-content-between align-items-center" style={{minHeight: "70px"}}>
        <div onClick={() => !isSystemChat && chat.is_group_chat && setShowSettings(true)} style={{cursor: (!isSystemChat && chat.is_group_chat) ? "pointer" : "default"}}>
          <h5 className="mb-0 text-white d-flex align-items-center">
            {chat.name} {isSystemChat && <span className="badge bg-primary ms-2" style={{fontSize: "0.6rem"}}>OFFICIAL</span>}
          </h5>
          {!isSystemChat && chat.is_group_chat && <small className="text-muted">{chat.members?.length || 0} members</small>}
        </div>
        {!isSystemChat && chat.is_group_chat && (
            <button className="btn btn-sm btn-outline-secondary border-0" onClick={() => setShowSettings(true)}><i className="fa-solid fa-gear fa-lg"></i></button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-grow-1 overflow-auto p-3 custom-scrollbar" style={{ backgroundColor: "#000", position: "relative" }}>
        {loading && <div className="position-absolute top-50 start-50 translate-middle"><div className="spinner-border text-primary"></div></div>}

        {!loading && (
            <>
                {messages.length === 0 ? (
                     <div className="d-flex flex-column justify-content-center align-items-center h-100" style={{ color: "#a0a0a0" }}>
                        <i className="fa-regular fa-comments fa-3x mb-3 text-secondary"></i>
                        <h6 className="fw-bold text-light">No messages yet</h6>
                     </div>
                ) : (
                    messages.map((msg, index) => {
                        if (!msg.sender_id) return null;

                        // --- DATE SEPARATOR LOGIC ---
                        const currentDateLabel = formatDateLabel(msg.date);
                        const prevDateLabel = index > 0 ? formatDateLabel(messages[index - 1].date) : null;
                        const showDateSeparator = currentDateLabel !== prevDateLabel;

                        // Define Message Content based on Type
                        let messageContent;

                        if (isSystemChat) {
                            // SYSTEM BOT MESSAGE
                            messageContent = (
                                <div className="d-flex mb-3 justify-content-start">
                                    <div className="p-3 rounded-3 bg-dark border border-secondary text-light" style={{ maxWidth: "85%" }}>
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fa-solid fa-robot text-primary me-2"></i><span className="fw-bold text-primary">System</span>
                                        </div>
                                        <p className="mb-1" style={{whiteSpace: "pre-line"}}>{msg.content}</p>
                                        <div className="text-end"><small className="text-light" style={{fontSize: "0.7rem"}}>{formatMessageTime(msg.date)}</small></div>
                                    </div>
                                </div>
                            );
                        } else if (msg.type === "system_alert") {
                            // GROUP ALERT (User Joined/Left)
                            messageContent = (
                                <div className="d-flex justify-content-center my-3">
                                    <span className="badge bg-dark text-secondary border border-secondary fw-normal px-3 py-1">{msg.sender_id.name} {msg.content}</span>
                                </div>
                            );
                        } else {
                            // NORMAL USER MESSAGE
                            const isMe = (msg.sender_id._id === currentUser._id) || (msg.sender_id === currentUser._id);
                            const senderName = msg.sender_id.name || "Unknown";
                            messageContent = (
                                <div className={`d-flex mb-3 ${isMe ? "justify-content-end" : "justify-content-start"}`}>
                                    <div className={`p-3 rounded-3 ${isMe ? "bg-primary text-white" : "bg-secondary text-light"}`} style={{ maxWidth: "70%", minWidth: "120px" }}>
                                        {!isMe && <div className="small fw-bold text-light mb-1">{senderName}</div>}
                                        <p className="mb-1" style={{ wordBreak: "break-word" }}>{msg.content}</p>
                                        <div className="text-end"><small style={{ fontSize: "0.7rem", opacity: 0.8 }}>{formatMessageTime(msg.date)}</small></div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <React.Fragment key={index}>
                                {/* Render Date Separator if Needed */}
                                {showDateSeparator && (
                                    <div className="d-flex justify-content-center my-4">
                                        <span className="badge rounded-pill bg-secondary text-secondary bg-opacity-25 border border-secondary px-3 py-1" style={{fontSize: "0.75rem", color: "#a0a0a0"}}>
                                            {currentDateLabel}
                                        </span>
                                    </div>
                                )}
                                {messageContent}
                            </React.Fragment>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-dark border-top border-secondary" style={{minHeight: "80px"}}>
        {isSystemChat ? (
            <div className="text-center small py-2 border border-secondary rounded bg-black" style={{ color: "#b0b0b0" }}><i className="fa-solid fa-lock me-2"></i> Official system channel.</div>
        ) : (
            <form onSubmit={handleSendMessage} className="d-flex gap-2">
                <input type="text" className="form-control bg-black text-light border-secondary" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)}/>
                <button type="submit" className="btn btn-primary px-4"><i className="fa-solid fa-paper-plane"></i></button>
            </form>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;