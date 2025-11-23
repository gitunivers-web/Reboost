import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/hooks/use-user";
import { 
  CometChatConversations, 
  CometChatUsers,
  CometChatMessageList,
  CometChatMessageHeader,
  CometChatMessageComposer
} from "@cometchat/chat-uikit-react";
import { CometChatUIKit, UIKitSettingsBuilder } from "@cometchat/chat-uikit-react";
import { CometChat } from "@cometchat/chat-sdk-javascript";
import { getApiUrl } from "@/lib/queryClient";

let isInitialized = false;

type ChatView = "conversations" | "users";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isCometChatReady, setIsCometChatReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ChatView>("conversations");
  const [selectedUser, setSelectedUser] = useState<CometChat.User | null>(null);
  const { data: user } = useUser();

  const initializeCometChat = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl("/api/cometchat/auth-token"), {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch auth token: ${res.status}`);
      }
      const data = await res.json();
      const { uid, authToken, appId, region } = data;

      if (!authToken || !appId || !region) {
        throw new Error("Configuration CometChat incomplète");
      }

      if (!isInitialized) {
        const UIKitSettings = new UIKitSettingsBuilder()
          .setAppId(appId)
          .setRegion(region)
          .subscribePresenceForAllUsers()
          .build();

        await CometChatUIKit.init(UIKitSettings);
        isInitialized = true;
        console.log("✔️ CometChat initialized");
      }

      await CometChatUIKit.loginWithAuthToken(authToken);
      console.log("✔️ CometChat login success for", uid);
      
      setIsCometChatReady(true);
      setError(null);
    } catch (err) {
      console.error("❌ CometChat error:", err);
      setError("Impossible de se connecter au chat. Veuillez réessayer.");
    }
  }, []);

  useEffect(() => {
    if (open && !isCometChatReady && user) {
      initializeCometChat();
    }
  }, [open, isCometChatReady, user, initializeCometChat]);

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'admin';

  const handleUserClick = (user: CometChat.User) => {
    console.log("User clicked:", user);
    setSelectedUser(user);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
  };

  return (
    <>
      <button
        data-testid="button-chat-widget"
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#6c5ce7",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          color: "#fff",
          fontSize: "26px",
          border: "none",
          cursor: "pointer",
          zIndex: 9999,
        }}
      >
        💬
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "400px",
            height: "600px",
            background: "#fff",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 9999,
          }}
        >
          {error ? (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <p style={{ color: "#e74c3c" }}>{error}</p>
            </div>
          ) : !isCometChatReady ? (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <p>Chargement du chat...</p>
            </div>
          ) : (
            <>
              {isAdmin && (
                <div style={{ 
                  display: "flex", 
                  borderBottom: "1px solid #e0e0e0",
                  background: "#f5f5f5"
                }}>
                  <button
                    onClick={() => setActiveView("conversations")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "none",
                      background: activeView === "conversations" ? "#fff" : "transparent",
                      borderBottom: activeView === "conversations" ? "2px solid #6c5ce7" : "none",
                      color: activeView === "conversations" ? "#6c5ce7" : "#666",
                      fontWeight: activeView === "conversations" ? "600" : "400",
                      cursor: "pointer",
                    }}
                    data-testid="button-chat-conversations"
                  >
                    Conversations
                  </button>
                  <button
                    onClick={() => setActiveView("users")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: "none",
                      background: activeView === "users" ? "#fff" : "transparent",
                      borderBottom: activeView === "users" ? "2px solid #6c5ce7" : "none",
                      color: activeView === "users" ? "#6c5ce7" : "#666",
                      fontWeight: activeView === "users" ? "600" : "400",
                      cursor: "pointer",
                    }}
                    data-testid="button-chat-users"
                  >
                    Utilisateurs
                  </button>
                </div>
              )}
              <div style={{ height: isAdmin ? "calc(100% - 49px)" : "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                {isAdmin && activeView === "users" && !selectedUser ? (
                  <CometChatUsers onItemClick={handleUserClick} />
                ) : isAdmin && activeView === "users" && selectedUser ? (
                  <>
                    <CometChatMessageHeader user={selectedUser} onBack={handleBackToUsers} />
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <CometChatMessageList user={selectedUser} />
                    </div>
                    <CometChatMessageComposer user={selectedUser} />
                  </>
                ) : (
                  <CometChatConversations />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
