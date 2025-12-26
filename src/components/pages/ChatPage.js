import React, { useState, useEffect } from "react";
import SideBar from "../SideBar";
import ChatSidebar from "./chatComponents/ChatSidebar";
import ChatWindow from "./chatComponents/ChatWindow";
import CreateGroupModal from "./chatComponents/CreateGroupModal";

// Constants matching your Dashboard logic
const SIDEBAR_WIDTH = "280px";
const LG_BREAKPOINT = 992;

const ChatPage = (props) => {
  const [activeChat, setActiveChat] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const token = localStorage.getItem("token");

  // 1. Auth Check
  useEffect(() => {
    if (!token) {
      window.location.href = "/";
    }
  }, [token]);

  // 2. Responsive Check (Same as Dashboard.js)
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
  };

  const handleCloseChat = () => {
    setActiveChat(null);
    triggerRefresh(); // Refresh sidebar to remove the deleted/left chat
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => !prev);
  };

  // Dynamic Margin Calculation
  const mainContentMarginLeft =
    windowWidth >= LG_BREAKPOINT ? SIDEBAR_WIDTH : "0";

  return (
    <div
      style={{
        backgroundColor: "black",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Sidebar is likely fixed position inside this component */}
      <SideBar />

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: mainContentMarginLeft,
          height: "100vh",
          display: "flex",
          transition: "margin-left 0.3s ease-in-out",
          width:
            windowWidth >= LG_BREAKPOINT
              ? `calc(100% - ${SIDEBAR_WIDTH})`
              : "100%",
          overflow: "hidden", // Prevents double scrollbars
        }}
      >
        {/* A. Chat List Sidebar */}
        {/* On mobile, hide this if a chat is active. On desktop, always show. */}
        <div
          className={`${
            activeChat && windowWidth < LG_BREAKPOINT ? "d-none" : "d-flex"
          } flex-column border-end border-secondary`}
          style={{
            width: windowWidth >= LG_BREAKPOINT ? "350px" : "100%",
            backgroundColor: "#121212",
            height: "100%",
          }}
        >
          <ChatSidebar
            onSelectChat={handleChatSelect}
            activeChatId={activeChat?._id}
            onOpenGroupModal={() => setShowGroupModal(true)}
            refreshTrigger={refreshTrigger}
            showAlert={props.showAlert}
          />
        </div>

        {/* B. Active Chat Window */}
        {/* On mobile, hide this if NO chat is active. On desktop, always show. */}
        <div
          className={`${
            !activeChat && windowWidth < LG_BREAKPOINT ? "d-none" : "d-flex"
          } flex-grow-1 flex-column`}
          style={{
            backgroundColor: "#000",
            height: "100%",
          }}
        >
          {activeChat ? (
            <>
              {/* Mobile Back Button Header */}
              {windowWidth < LG_BREAKPOINT && (
                <div className="p-2 bg-dark border-bottom border-secondary">
                  <button
                    className="btn btn-sm btn-outline-light"
                    onClick={() => setActiveChat(null)}
                  >
                    <i className="fa-solid fa-arrow-left me-2"></i> Back to
                    Chats
                  </button>
                </div>
              )}
              <ChatWindow
                chat={activeChat}
                currentUser={props.user}
                refreshSidebar={triggerRefresh}
                onCloseChat={handleCloseChat}
                showAlert={props.showAlert}
              />
            </>
          ) : (
            <div className="d-flex justify-content-center align-items-center h-100 text-muted flex-column">
              <i className="fa-regular fa-comments fa-4x mb-3"></i>
              <h4>Select a chat to start messaging</h4>
              <button
                className="btn btn-outline-primary mt-3"
                onClick={() => setShowGroupModal(true)}
              >
                <i className="fa-solid fa-plus me-2"></i>Create New Group
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create Group Modal */}
      {showGroupModal && (
        <CreateGroupModal
          onClose={() => setShowGroupModal(false)}
          onGroupCreated={() => {
            setShowGroupModal(false);
            triggerRefresh();
          }}
          showAlert={props.showAlert}
        />
      )}
    </div>
  );
};

export default ChatPage;
