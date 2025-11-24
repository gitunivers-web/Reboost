import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";

let isInitialized = false;

type ChatView = "conversations" | "users";

const LISTENER_ID = "ALTUS_MESSAGE_LISTENER";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isCometChatReady, setIsCometChatReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ChatView>("conversations");
  const [selectedUser, setSelectedUser] = useState<CometChat.User | null>(null);
  const [messageRefreshKey, setMessageRefreshKey] = useState(0);
  const [adminUser, setAdminUser] = useState<CometChat.User | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
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

  // Real-time message listener
  useEffect(() => {
    if (!isCometChatReady) return;

    const messageListener = new CometChat.MessageListener({
      onTextMessageReceived: (message: CometChat.TextMessage) => {
        console.log("📩 New message received in real-time:", message);
        setMessageRefreshKey(prev => prev + 1);
      },
      onMediaMessageReceived: (message: CometChat.MediaMessage) => {
        console.log("📩 New media message received in real-time:", message);
        setMessageRefreshKey(prev => prev + 1);
      },
      onCustomMessageReceived: (message: CometChat.CustomMessage) => {
        console.log("📩 New custom message received in real-time:", message);
        setMessageRefreshKey(prev => prev + 1);
      },
    });

    CometChat.addMessageListener(LISTENER_ID, messageListener);
    console.log("✅ Real-time message listener registered");

    return () => {
      CometChat.removeMessageListener(LISTENER_ID);
      console.log("❌ Real-time message listener removed");
    };
  }, [isCometChatReady]);

  // Ne pas afficher le widget sur les pages publiques
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

  const handleContactSupport = async () => {
    if (adminUser) {
      setSelectedUser(adminUser);
      return;
    }

    setIsLoadingAdmin(true);
    try {
      const res = await fetch(getApiUrl("/api/cometchat/admin-uid"), {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to fetch admin");
      }
      const { adminUid } = await res.json();
      
      // Fetch the admin user from CometChat
      const admin = await CometChat.getUser(adminUid);
      setAdminUser(admin);
      setSelectedUser(admin);
    } catch (err) {
      console.error("Error loading admin user:", err);
      setError("Impossible de contacter le support. Veuillez réessayer.");
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  return createPortal(
    <>
      <Button
        data-testid="button-chat-widget"
        onClick={() => setOpen(!open)}
        size="icon"
        variant="default"
        className="fixed bottom-5 right-5 rounded-full bg-primary shadow-lg z-[9999] hover-elevate"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {open && (
        <Card className="fixed bottom-24 right-5 w-[400px] h-[600px] z-[9999] shadow-2xl flex flex-col">
          {error ? (
            <div className="flex items-center justify-center h-full p-5">
              <p className="text-destructive text-center">{error}</p>
            </div>
          ) : !isCometChatReady ? (
            <div className="flex items-center justify-center h-full p-5">
              <p className="text-muted-foreground">Chargement du chat...</p>
            </div>
          ) : (
            <>
              {/* Onglets élégants pour l'admin */}
              {isAdmin && (
                <div className="flex border-b bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0">
                  <Button
                    onClick={() => setActiveView("conversations")}
                    variant="ghost"
                    className={`flex-1 rounded-none border-b-2 transition-all duration-200 ${
                      activeView === "conversations" 
                        ? "border-primary bg-primary/10 text-primary font-bold" 
                        : "border-transparent text-muted-foreground hover:bg-primary/5"
                    }`}
                    data-testid="button-chat-conversations"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Conversations
                  </Button>
                  <Button
                    onClick={() => setActiveView("users")}
                    variant="ghost"
                    className={`flex-1 rounded-none border-b-2 transition-all duration-200 ${
                      activeView === "users" 
                        ? "border-primary bg-primary/10 text-primary font-bold" 
                        : "border-transparent text-muted-foreground hover:bg-primary/5"
                    }`}
                    data-testid="button-chat-users"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Utilisateurs
                  </Button>
                </div>
              )}
              <div className="flex flex-col flex-1 min-h-0">
                {!isAdmin && !selectedUser ? (
                  <>
                    {/* En-tête élégant pour les utilisateurs */}
                    <div className="flex flex-col p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">Mes Conversations</h3>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={handleContactSupport}
                          disabled={isLoadingAdmin}
                          data-testid="button-contact-support"
                          className="shadow-md"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {isLoadingAdmin ? "Chargement..." : "Contacter le Support"}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Besoin d'aide ? Démarrez une conversation avec notre équipe.
                      </p>
                    </div>
                    <div className="flex-1 min-h-0 overflow-auto">
                      <CometChatConversations key={messageRefreshKey} />
                    </div>
                  </>
                ) : !isAdmin && selectedUser ? (
                  <>
                    <div className="flex-shrink-0">
                      <CometChatMessageHeader user={selectedUser} onBack={handleBackToUsers} />
                    </div>
                    <div className="flex-1 min-h-0 overflow-auto">
                      <CometChatMessageList user={selectedUser} key={messageRefreshKey} />
                    </div>
                    <div className="flex-shrink-0">
                      <CometChatMessageComposer user={selectedUser} />
                    </div>
                  </>
                ) : isAdmin && activeView === "users" && !selectedUser ? (
                  <div className="flex-1 min-h-0 overflow-auto">
                    <CometChatUsers onItemClick={handleUserClick} key={messageRefreshKey} />
                  </div>
                ) : isAdmin && activeView === "users" && selectedUser ? (
                  <>
                    <div className="flex-shrink-0">
                      <CometChatMessageHeader user={selectedUser} onBack={handleBackToUsers} />
                    </div>
                    <div className="flex-1 min-h-0 overflow-auto">
                      <CometChatMessageList user={selectedUser} key={messageRefreshKey} />
                    </div>
                    <div className="flex-shrink-0">
                      <CometChatMessageComposer user={selectedUser} />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 min-h-0 overflow-auto">
                    <CometChatConversations key={messageRefreshKey} />
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      )}
    </>,
    document.body
  );
}
