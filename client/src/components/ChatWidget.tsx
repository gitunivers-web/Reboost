import { useState, useEffect } from "react";
import { useCometChatLogin } from "@/hooks/useCometChat";
import { useUser } from "@/hooks/use-user";
import { CometChatConversations } from "@cometchat/chat-uikit-react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [isCometChatReady, setIsCometChatReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: user } = useUser();
  const { login } = useCometChatLogin();

  if (!user) {
    return null;
  }

  useEffect(() => {
    if (open && !isCometChatReady) {
      login()
        .then(() => {
          setIsCometChatReady(true);
          setError(null);
        })
        .catch((err: unknown) => {
          console.error("CometChat login failed:", err);
          setError("Impossible de se connecter au chat. Veuillez réessayer.");
        });
    }
  }, [open, isCometChatReady, login]);

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
            <CometChatConversations />
          )}
        </div>
      )}
    </>
  );
}
