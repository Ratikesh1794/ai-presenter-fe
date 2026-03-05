import { theme } from "../theme";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  accent?: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
}

export function ChatDrawer({ isOpen, onClose, messages }: ChatDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          zIndex: 999,
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: "100%",
          maxWidth: 420,
          background: theme.colors.bg.surface,
          border: `1px solid ${theme.colors.white["05"]}`,
          borderRight: "none",
          display: "flex",
          flexDirection: "column",
          zIndex: 1000,
          boxShadow: `-24px 0 60px rgba(0,0,0,0.5), 0 0 0 1px ${theme.colors.white["03"]}`,
          animation: "slideInRight 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 24px",
            borderBottom: `1px solid ${theme.colors.white["05"]}`,
          }}
        >
          <span
            style={{
              fontFamily: theme.fonts.display,
              fontWeight: 600,
              fontSize: theme.text.base.fontSize,
              color: theme.colors.white["90"],
            }}
          >
            Chat History
          </span>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: theme.colors.white["30"],
              padding: "4px 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              transition: theme.transition.fast,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color =
                theme.colors.white["70"];
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color =
                theme.colors.white["30"];
            }}
          >
            ✕
          </button>
        </div>

        {/* Messages container */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            padding: "16px 20px",
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: theme.colors.white["30"],
                fontFamily: theme.fonts.display,
                fontSize: theme.text.sm.fontSize,
                textAlign: "center",
              }}
            >
              No messages yet
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  alignItems: msg.role === "agent" ? "flex-end" : "flex-start",
                  gap: msg.role === "agent" ? 8 : 0,
                }}
              >
                {/* Agent avatar */}
                {msg.role === "agent" && (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: `${msg.accent || theme.colors.cyan["400"]}18`,
                      border: `1px solid ${msg.accent || theme.colors.cyan["400"]}35`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <polygon
                        points="5,3 19,12 5,21"
                        fill={msg.accent || theme.colors.cyan["400"]}
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                )}

                {/* Message bubble */}
                <div
                  style={{
                    maxWidth: msg.role === "user" ? "85%" : "80%",
                    padding: "10px 14px",
                    borderRadius:
                      msg.role === "user"
                        ? `${theme.radius.lg}px ${theme.radius.lg}px ${theme.radius.sm}px ${theme.radius.lg}px`
                        : `${theme.radius.lg}px ${theme.radius.lg}px ${theme.radius.lg}px ${theme.radius.sm}px`,
                    background:
                      msg.role === "user"
                        ? theme.colors.white["07"]
                        : theme.colors.white["03"],
                    border: `1px solid ${
                      msg.role === "user"
                        ? theme.colors.white["10"]
                        : theme.colors.white["05"]
                    }`,
                    fontFamily: theme.fonts.display,
                    fontSize: theme.text.sm.fontSize,
                    color: theme.colors.white["90"],
                    lineHeight: 1.55,
                    wordBreak: "break-word",
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CSS animation */}
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
}
