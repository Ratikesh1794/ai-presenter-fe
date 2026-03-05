import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type ClientMessage =
  | { type: "load_deck"; session_id: string }
  | { type: "user_speech"; text: string }
  | { type: "interrupt" }
  | { type: "slide_changed"; index: number };

export type ServerMessage =
  | { type: "change_slide"; index: number; reason: string }
  | { type: "speak"; text: string }
  | { type: "status"; state: AgentStatus }
  | { type: "interrupted" }
  | { type: "error"; message: string };

export type AgentStatus = "idle" | "listening" | "thinking" | "speaking";
export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8000/ws";
const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

interface UseWebSocketOptions {
  onMessage: (msg: ServerMessage) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

export function useWebSocket({ onMessage, onConnectionChange }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const onMessageRef = useRef(onMessage);
  const onConnectionChangeRef = useRef(onConnectionChange);
  const connectRef = useRef<() => void>(() => {});

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");

  // Sync latest callbacks into refs after every render
  useLayoutEffect(() => {
    onMessageRef.current = onMessage;
    onConnectionChangeRef.current = onConnectionChange;
  });

  // ── updateStatus — only called from async callbacks (onopen/onclose/onerror)
  // so setState never fires synchronously inside an effect body
  const updateStatus = useCallback((status: ConnectionStatus) => {
    setConnectionStatus(status);
    onConnectionChangeRef.current?.(status);
  }, []);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      updateStatus("connected");
    };

    ws.onmessage = (event: MessageEvent) => {
      try { onMessageRef.current(JSON.parse(event.data as string)); }
      catch { console.error("[WS] Failed to parse message:", event.data); }
    };

    ws.onerror = () => { updateStatus("error"); };

    ws.onclose = () => {
      if (!isMountedRef.current) return;
      updateStatus("disconnected");
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(
          () => connectRef.current(),
          RECONNECT_DELAY_MS
        );
      }
    };
  }, [updateStatus]);

  // Keep connectRef current after every render
  useLayoutEffect(() => {
    connectRef.current = connect;
  });

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn("[WS] Cannot send — socket not open:", msg);
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    // Defer initial connection by one tick so no setState fires
    // synchronously inside this effect body
    const timer = setTimeout(() => connectRef.current(), 0);
    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
      disconnect();
    };
  // connect/disconnect intentionally omitted — we use connectRef instead
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { send, connectionStatus, reconnect: connect };
}