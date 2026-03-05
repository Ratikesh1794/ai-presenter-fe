import type { ConnectionStatus } from "../hooks/useWebSocket";

interface ConnectionBadgeProps {
  status: ConnectionStatus;
  onReconnect: () => void;
}

const CONFIG: Record<
  ConnectionStatus,
  { label: string; color: string; pulse: boolean }
> = {
  connected: { label: "Connected", color: "#6EE7B7", pulse: false },
  connecting: { label: "Connecting…", color: "#FCD34D", pulse: true },
  disconnected: { label: "Disconnected", color: "#F87171", pulse: false },
  error: { label: "Error", color: "#F87171", pulse: true },
};

export function ConnectionBadge({ status, onReconnect }: ConnectionBadgeProps) {
  const { label, color, pulse } = CONFIG[status];
  const isOffline = status === "disconnected" || status === "error";

  return (
    <button
      onClick={isOffline ? onReconnect : undefined}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200"
      style={{
        background: `${color}12`,
        border: `1px solid ${color}30`,
        cursor: isOffline ? "pointer" : "default",
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${pulse ? "animate-pulse" : ""}`}
        style={{ background: color }}
      />
      <span
        className="text-xs font-mono tracking-wide"
        style={{ color: `${color}cc` }}
      >
        {label}
        {isOffline && " · Retry"}
      </span>
    </button>
  );
}
