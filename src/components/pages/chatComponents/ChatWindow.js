import React, { useState, useEffect, useRef, useCallback } from "react";
import GroupInfo from "./GroupInfo";

const ChatWindow = ({
  chat,
  currentUser,
  refreshSidebar,
  onCloseChat,
  showAlert,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false); // Controls the initial load spinner
  const messagesEndRef = useRef(null);

  // Identify if this is the special System/Bot chat
  const isSystemChat = chat?._id === "system";

  // ===========================================================================
  // 1. DATA FETCHING
  // ===========================================================================

  const fetchMessages = useCallback(
    async (isBackgroundPoll = false) => {
      if (!chat?._id) return;
      try {
        const response = await fetch(
          `${process.env.REACT_APP_HOST_URL}api/chat/messages/${chat._id}`,
          {
            method: "GET",
            headers: { "auth-token": localStorage.getItem("token") },
          }
        );
        const data = await response.json();
        if (data.success) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        if (!isBackgroundPoll) setLoading(false);
      }
    },
    [chat?._id]
  );

  // Triggered when the selected chat changes
  useEffect(() => {
    if (!chat?._id) return;

    // 1. Reset State Immediately to prevent "Old Chat" ghosting
    setMessages([]);
    setLoading(true);
    setShowSettings(false);

    // 2. Initial Fetch
    fetchMessages(false);

    // 3. Mark as Read (Fire and forget)
    fetch(`${process.env.REACT_APP_HOST_URL}api/chat/read/${chat._id}`, {
      method: "PUT",
      headers: { "auth-token": localStorage.getItem("token") },
    })
      .then(() => refreshSidebar())
      .catch((err) => console.error(err));

    // 4. Set up Polling (Background updates)
    const interval = setInterval(() => fetchMessages(true), 3000);
    return () => clearInterval(interval);

    // eslint-disable-next-line
  }, [chat?._id]);

  // Auto-scroll logic
  useEffect(() => {
    if (!loading) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); // 'auto' is instant, 'smooth' can be slow on load
    }
  }, [messages, loading]);

  // ===========================================================================
  // 2. SEND MESSAGE LOGIC
  // ===========================================================================

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chat?._id || isSystemChat) return;

    // Optimistic UI Update (Optional: Add message locally before server responds to feel faster)
    // For now, we wait for server to keep it simple and consistent

    try {
      const response = await fetch(
        `${process.env.REACT_APP_HOST_URL}api/chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": localStorage.getItem("token"),
          },
          body: JSON.stringify({
            chatRoomId: chat._id,
            content: newMessage,
            type: "text",
          }),
        }
      );
      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, data.message]); // Append new message
        setNewMessage("");
        refreshSidebar();
      } else {
        showAlert("Failed to send message", "danger");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // ===========================================================================
  // 3. RENDERING
  // ===========================================================================

  // Safety check
  if (!chat || !currentUser) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 text-muted">
        Loading...
      </div>
    );
  }

  // Settings View
  if (showSettings && !isSystemChat) {
    return (
      <GroupInfo
        chat={chat}
        currentUser={currentUser}
        onBack={() => setShowSettings(false)}
        onUpdate={refreshSidebar}
        onCloseChat={onCloseChat}
        showAlert={showAlert}
      />
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      {/* --- A. HEADER --- */}
      <div
        className="p-3 border-bottom border-secondary bg-dark d-flex justify-content-between align-items-center"
        style={{ minHeight: "70px" }}
      >
        <div
          onClick={() =>
            !isSystemChat && chat.is_group_chat && setShowSettings(true)
          }
          style={{
            cursor: !isSystemChat && chat.is_group_chat ? "pointer" : "default",
          }}
        >
          <h5 className="mb-0 text-white d-flex align-items-center">
            {chat.name}
            {isSystemChat && (
              <span
                className="badge bg-primary ms-2"
                style={{ fontSize: "0.6rem" }}
              >
                OFFICIAL
              </span>
            )}
          </h5>
          {!isSystemChat && chat.is_group_chat && (
            <small className="text-muted">
              {chat.members?.length || 0} members
            </small>
          )}
        </div>

        {!isSystemChat && chat.is_group_chat && (
          <button
            className="btn btn-sm btn-outline-secondary border-0"
            onClick={() => setShowSettings(true)}
            title="Group Settings"
          >
            <i className="fa-solid fa-gear fa-lg"></i>
          </button>
        )}
      </div>

      {/* --- B. MESSAGES AREA --- */}
      <div
        className="flex-grow-1 overflow-auto p-3 custom-scrollbar"
        style={{ backgroundColor: "#000", position: "relative" }}
      >
        {/* Loading Spinner Overlay - Keeps layout stable while fetching */}
        {loading && (
          <div className="position-absolute top-50 start-50 translate-middle">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Message List - Only visible when not loading, or keep visible if you prefer */}
        {!loading && (
          <>
            {messages.length === 0 ? (
              <div className="d-flex flex-column justify-content-center align-items-center h-100 text-white opacity-50">
                <i className="fa-regular fa-comments fa-2x mb-2"></i>
                <small>No messages yet</small>
              </div>
            ) : (
              messages.map((msg, index) => {
                if (!msg.sender_id) return null;

                // 1. SYSTEM ALERTS
                if (msg.type === "system_alert") {
                  return (
                    <div
                      key={index}
                      className="d-flex justify-content-center my-3"
                    >
                      <span
                        className="badge bg-dark text-secondary border border-secondary fw-normal px-3 py-1"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {msg.sender_id.name ? (
                          <strong>{msg.sender_id.name} </strong>
                        ) : (
                          ""
                        )}
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                // 2. SYSTEM CHAT (Bot)
                if (isSystemChat) {
                  return (
                    <div
                      key={index}
                      className="d-flex mb-3 justify-content-start"
                    >
                      <div
                        className="p-3 rounded-3 bg-dark border border-secondary text-light"
                        style={{ maxWidth: "85%" }}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <i className="fa-solid fa-robot text-primary me-2"></i>
                          <span className="fw-bold text-primary">System</span>
                        </div>
                        <p className="mb-1" style={{ whiteSpace: "pre-line" }}>
                          {msg.content}
                        </p>
                        <div className="text-end">
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {new Date(msg.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </small>
                        </div>
                      </div>
                    </div>
                  );
                }

                // 3. USER MESSAGES
                const isMe =
                  msg.sender_id._id === currentUser._id ||
                  msg.sender_id === currentUser._id;
                const senderName = msg.sender_id.name || "Unknown";

                return (
                  <div
                    key={index}
                    className={`d-flex mb-3 ${
                      isMe ? "justify-content-end" : "justify-content-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-3 ${
                        isMe
                          ? "bg-primary text-white"
                          : "bg-secondary text-light"
                      }`}
                      style={{ maxWidth: "70%", minWidth: "120px" }}
                    >
                      {!isMe && (
                        <div className="d-flex justify-content-between mb-1">
                          <small
                            className="fw-bold"
                            style={{ fontSize: "0.8rem", color: "#ddd" }}
                          >
                            {senderName}
                          </small>
                        </div>
                      )}
                      <p className="mb-1" style={{ wordBreak: "break-word" }}>
                        {msg.content}
                      </p>
                      <div className="text-end">
                        <small style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                          {new Date(msg.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </small>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* --- C. INPUT AREA --- */}
      <div
        className="p-3 bg-dark border-top border-secondary"
        style={{ minHeight: "80px" }}
      >
        {isSystemChat ? (
          <div className="text-center text-white small py-2 border border-secondary rounded bg-black">
            <i className="fa-solid fa-lock me-2"></i>
            This is an official system channel. You cannot reply.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="d-flex gap-2">
            <input
              type="text"
              className="form-control bg-black text-light border-secondary"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="btn btn-primary px-4">
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
