import { useCallback, useRef, useState } from "react";
import type { Slide } from "../slides/slideData";
import type { AgentStatus, ConnectionStatus, ServerMessage } from "./useWebSocket";
import { useWebSocket } from "./useWebSocket";
import { useVoice } from "./useVoice";

export function usePresentation() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");
  const [lastAgentText, setLastAgentText] = useState("");
  const [transcript, setTranscript] = useState("");

  const currentSlideRef = useRef(0);
  const slidesRef = useRef<Slide[]>([]);
  slidesRef.current = slides;

  const pendingSessionRef = useRef<string | null>(null);
  const connectionStatusRef = useRef<ConnectionStatus>("disconnected");

  // Keep send in a ref so handleConnectionChange can always call the latest version
  const sendRef = useRef<ReturnType<typeof useWebSocket>["send"] | null>(null);

  // ── WebSocket message handler ─────────────────────────────────────────────

  const handleServerMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case "status":
        setAgentStatus(msg.state);
        break;
      case "change_slide": {
        const idx = Math.max(0, Math.min(msg.index, slidesRef.current.length - 1));
        setCurrentSlide(idx);
        currentSlideRef.current = idx;
        sendRef.current?.({ type: "slide_changed", index: idx });
        break;
      }
      case "speak":
        setAgentStatus("speaking");
        setLastAgentText(msg.text);
        voice.speak(msg.text, () => setAgentStatus("idle"));
        break;
      case "interrupted":
        setAgentStatus("idle");
        break;
      case "error":
        console.error("[Agent error]", msg.message);
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnectionChange = useCallback((status: ConnectionStatus) => {
    console.log("[usePresentation] Connection status changed:", status);
    connectionStatusRef.current = status;
    if (status === "connected" && pendingSessionRef.current) {
      const sessionId = pendingSessionRef.current;
      pendingSessionRef.current = null;
      console.log("[usePresentation] Flushing queued load_deck:", sessionId);
      sendRef.current?.({ type: "load_deck", session_id: sessionId });
    }
  }, []);

  const { send, connectionStatus, reconnect } = useWebSocket({
    onMessage: handleServerMessage,
    onConnectionChange: handleConnectionChange,
  });

  // Keep sendRef current so closures always use latest send
  sendRef.current = send;

  // ── Voice ─────────────────────────────────────────────────────────────────

  const handleTranscript = useCallback((text: string) => {
    setTranscript(text);
    setAgentStatus("thinking");
    send({ type: "user_speech", text });
  }, [send]);

  const handleInterrupt = useCallback(() => {
    send({ type: "interrupt" });
    setAgentStatus("idle");
  }, [send]);

  const voice = useVoice({ onTranscript: handleTranscript, onInterrupt: handleInterrupt });

  // ── Load slides after upload ──────────────────────────────────────────────

  const loadSlides = useCallback((newSlides: Slide[], sessionId?: string) => {
    console.log("[usePresentation] loadSlides called:", {
      slideCount: newSlides.length,
      sessionId,
      connectionStatus: connectionStatusRef.current,
    });

    setSlides(newSlides);
    setCurrentSlide(0);
    setLastAgentText("");
    setTranscript("");
    currentSlideRef.current = 0;

    if (!sessionId) {
      console.warn("[usePresentation] No sessionId provided to loadSlides");
      return;
    }

    if (connectionStatusRef.current === "connected") {
      console.log("[usePresentation] Socket connected — sending load_deck immediately");
      sendRef.current?.({ type: "load_deck", session_id: sessionId });
    } else {
      console.log("[usePresentation] Socket not ready (", connectionStatusRef.current, ") — queuing load_deck");
      pendingSessionRef.current = sessionId;
    }
  }, []);

  // ── Manual navigation ─────────────────────────────────────────────────────

  const goToSlide = useCallback((index: number) => {
    const idx = Math.max(0, Math.min(index, slidesRef.current.length - 1));
    setCurrentSlide(idx);
    currentSlideRef.current = idx;
    send({ type: "slide_changed", index: idx });
  }, [send]);

  const nextSlide = useCallback(() => goToSlide(currentSlideRef.current + 1), [goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentSlideRef.current - 1), [goToSlide]);

  return {
    slides, currentSlide, loadSlides, goToSlide, nextSlide, prevSlide,
    agentStatus, lastAgentText, transcript,
    voiceState: voice.voiceState, volume: voice.volume, isSupported: voice.isSupported,
    startListening: voice.startListening, stopListening: voice.stopListening, interrupt: voice.interrupt,
    connectionStatus, reconnect,
  };
}