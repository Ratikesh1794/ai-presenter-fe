import { useCallback, useRef, useState } from "react";
import type { Slide } from "../slides/slideData";
import type { AgentStatus, ConnectionStatus, ServerMessage } from "./useWebSocket";
import { useWebSocket } from "./useWebSocket";
import { useVoice } from "./useVoice";

export type PresentationPhase = "idle" | "presenting" | "answering_doubt" | "complete";

export function usePresentation() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle");
  const [lastAgentText, setLastAgentText] = useState("");
  const [transcript, setTranscript] = useState("");
  const [phase, setPhase] = useState<PresentationPhase>("idle");

  const currentSlideRef = useRef(0);
  const slidesRef = useRef<Slide[]>([]);
  slidesRef.current = slides;

  const pendingSessionRef = useRef<string | null>(null);
  const connectionStatusRef = useRef<ConnectionStatus>("disconnected");
  const sendRef = useRef<ReturnType<typeof useWebSocket>["send"] | null>(null);

  // ── Server message handler ────────────────────────────────────────────────

  const handleServerMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case "status":
        setAgentStatus(msg.state);
        break;

      case "change_slide": {
        const idx = Math.max(0, Math.min(msg.index, slidesRef.current.length - 1));
        setCurrentSlide(idx);
        currentSlideRef.current = idx;
        // Acknowledge back to backend
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

      case "presentation_complete":
        setPhase("complete");
        setAgentStatus("idle");
        break;

      case "error":
        console.error("[Agent error]", msg.message);
        break;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnectionChange = useCallback((status: ConnectionStatus) => {
    connectionStatusRef.current = status;
    if (status === "connected" && pendingSessionRef.current) {
      const sessionId = pendingSessionRef.current;
      pendingSessionRef.current = null;
      sendRef.current?.({ type: "load_deck", session_id: sessionId });
    }
  }, []);

  const { send, connectionStatus, reconnect } = useWebSocket({
    onMessage: handleServerMessage,
    onConnectionChange: handleConnectionChange,
  });

  sendRef.current = send;

  // ── Voice ─────────────────────────────────────────────────────────────────

  const handleTranscript = useCallback((text: string) => {
    setTranscript(text);
    setAgentStatus("thinking");
    setPhase("answering_doubt");
    send({ type: "user_speech", text });
  }, [send]);

  const handleInterrupt = useCallback(() => {
    send({ type: "interrupt" });
    setAgentStatus("idle");
  }, [send]);

  const voice = useVoice({ onTranscript: handleTranscript, onInterrupt: handleInterrupt });

  // ── Start presentation ────────────────────────────────────────────────────

  const startPresentation = useCallback(() => {
    setPhase("presenting");
    setCurrentSlide(0);
    currentSlideRef.current = 0;
    setLastAgentText("");
    setTranscript("");
    send({ type: "start_presentation" });
  }, [send]);

  // ── Load slides after upload ──────────────────────────────────────────────

  const loadSlides = useCallback((newSlides: Slide[], sessionId?: string) => {
    setSlides(newSlides);
    setCurrentSlide(0);
    setLastAgentText("");
    setTranscript("");
    setPhase("idle");
    currentSlideRef.current = 0;

    if (!sessionId) return;

    if (connectionStatusRef.current === "connected") {
      sendRef.current?.({ type: "load_deck", session_id: sessionId });
    } else {
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
    phase, startPresentation,
    agentStatus, lastAgentText, transcript,
    voiceState: voice.voiceState, volume: voice.volume, isSupported: voice.isSupported,
    startListening: voice.startListening, stopListening: voice.stopListening, interrupt: voice.interrupt,
    connectionStatus, reconnect, send,
  };
}