import type { ConnectionStatus } from "../hooks/useWebSocket";
import { theme } from "../theme";

interface ConnectionBadgeProps {
  status: ConnectionStatus;
  onReconnect: () => void;
}

const CONFIG: Record<
  ConnectionStatus,
  { label: string; color: string; pulse: boolean }
> = {
  connected: {
    label: "Connected",
    color: theme.colors.emerald["400"],
    pulse: false,
  },
  connecting: { label: "Connecting", color: "#FCD34D", pulse: true },
  disconnected: {
    label: "Disconnected",
    color: theme.colors.red["400"],
    pulse: false,
  },
  error: { label: "Error", color: theme.colors.red["400"], pulse: true },
};

export function ConnectionBadge({ status, onReconnect }: ConnectionBadgeProps) {
  const { label, color, pulse } = CONFIG[status];
  const isOffline = status === "disconnected" || status === "error";

  return (
    <button
      onClick={isOffline ? onReconnect : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "5px 12px",
        borderRadius: theme.radius.full,
        background: `${color}10`,
        border: `1px solid ${color}28`,
        cursor: isOffline ? "pointer" : "default",
        transition: theme.transition.base,
        outline: "none",
      }}
      onMouseEnter={(e) => {
        if (isOffline)
          (e.currentTarget as HTMLElement).style.background = `${color}18`;
      }}
      onMouseLeave={(e) => {
        if (isOffline)
          (e.currentTarget as HTMLElement).style.background = `${color}10`;
      }}
    >
      {/* Status dot */}
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          flexShrink: 0,
          boxShadow: `0 0 6px ${color}80`,
          animation: pulse ? "ds-pulse-conn 1.8s ease-in-out infinite" : "none",
        }}
      />

      {/* Label */}
      <span
        style={{
          fontFamily: theme.fonts.mono,
          fontSize: theme.text.xxs.fontSize,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: `${color}cc`,
          whiteSpace: "nowrap",
        }}
      >
        {label}
        {isOffline && " · Retry"}
      </span>

      <style>{`
        @keyframes ds-pulse-conn {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.35; }
        }
      `}</style>
    </button>
  );
}
