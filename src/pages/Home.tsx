import { useEffect, useRef, useReducer, useState } from "react";
import { usePresentation } from "../hooks/usePresentation";
import { SlideCard } from "../components/SlideCard";
import { SlideDots } from "../components/SlideDots";
import { VoiceOrb } from "../components/VoiceOrb";
import { ConnectionBadge } from "../components/ConnectionBadge";
import { ChatDrawer } from "../components/ChatDrawer";
import { UploadScreen } from "../components/Uploadscreen";
import { theme } from "../theme";
import { GlobalStyles } from "../theme.styles";
import type { Slide } from "../slides/slideData";
import type { ChatMessage } from "../components/ChatDrawer";

// ─── Helper: build a mono text style object ───────────────────────────────────
const monoStyle = (
  size: keyof typeof theme.text,
  color: string,
  extra?: React.CSSProperties,
): React.CSSProperties => ({
  fontFamily: theme.fonts.mono,
  fontSize: theme.text[size].fontSize,
  letterSpacing: theme.text[size].letterSpacing,
  color,
  ...extra,
});

// ─── Nav chevrons ──────────────────────────────────────────────────────────────
const ChevronLeft = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const {
    slides,
    currentSlide,
    loadSlides,
    goToSlide,
    nextSlide,
    prevSlide,
    phase,
    startPresentation,
    agentStatus,
    lastAgentText,
    transcript,
    voiceState,
    volume,
    isSupported,
    startListening,
    stopListening,
    interrupt,
    connectionStatus,
    reconnect,
  } = usePresentation();

  // Chat message reducer
  type ChatAction =
    | { type: "ADD_USER_MESSAGE"; content: string }
    | { type: "ADD_AGENT_MESSAGE"; content: string; accent: string }
    | { type: "CLEAR" };

  const chatReducer = (
    state: ChatMessage[],
    action: ChatAction,
  ): ChatMessage[] => {
    switch (action.type) {
      case "ADD_USER_MESSAGE":
        // Only add if not already present
        if (
          !state.some((m) => m.role === "user" && m.content === action.content)
        ) {
          return [
            ...state,
            { id: `user-${Date.now()}`, role: "user", content: action.content },
          ];
        }
        return state;
      case "ADD_AGENT_MESSAGE":
        // Only add if not already present
        if (
          !state.some((m) => m.role === "agent" && m.content === action.content)
        ) {
          return [
            ...state,
            {
              id: `agent-${Date.now()}`,
              role: "agent",
              content: action.content,
              accent: action.accent,
            },
          ];
        }
        return state;
      case "CLEAR":
        return [];
      default:
        return state;
    }
  };

  // Chat drawer state
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [chatMessages, dispatchChat] = useReducer(chatReducer, []);

  // Use refs to track previous values to determine when to add new messages
  const lastTranscriptRef = useRef<string>("");
  const lastAgentTextRef = useRef<string>("");

  // Track transcript changes
  useEffect(() => {
    if (transcript && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      dispatchChat({ type: "ADD_USER_MESSAGE", content: transcript });
    }
  }, [transcript]);

  // Track agent text changes
  useEffect(() => {
    if (lastAgentText && lastAgentText !== lastAgentTextRef.current) {
      lastAgentTextRef.current = lastAgentText;
      dispatchChat({
        type: "ADD_AGENT_MESSAGE",
        content: lastAgentText,
        accent: theme.colors.cyan["400"],
      });
    }
  }, [lastAgentText]);

  const hasSlides = slides.length > 0;
  const slide = slides[currentSlide] as Slide | undefined;
  const slideAccent = slide?.accent ?? theme.colors.cyan["400"];

  const isPresenting = phase === "presenting" || phase === "answering_doubt";
  const isComplete = phase === "complete";
  const isAgentBusy = agentStatus === "thinking" || agentStatus === "speaking";
  const isListening = voiceState === "listening";
  const isConnected = connectionStatus === "connected";

  const handleOrbClick = () => {
    if (voiceState === "speaking") {
      interrupt();
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  useKeyboard({
    onNext: nextSlide,
    onPrev: prevSlide,
    onToggleListen: handleOrbClick,
    onStop: stopListening,
  });

  if (!hasSlides) {
    return <UploadScreen onLoaded={(s, id) => loadSlides(s, id)} />;
  }

  return (
    <>
      <GlobalStyles />

      <div
        className={theme.cx.root}
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: theme.colors.bg.root,
          fontFamily: theme.fonts.display,
          overflow: "hidden",
        }}
      >
        {/* ── Atmospheric background layers ──────────────────────────────── */}
        <div className="ds-nebula ds-nebula-1" />
        <div className="ds-nebula ds-nebula-2" />
        <div className="ds-nebula ds-nebula-3" />
        <div className={theme.cx.starsLayer} />
        <div className={theme.cx.grainLayer} />

        {/* ── Content above layers ───────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            overflow: "hidden",
          }}
        >
          {/* ════════════════════════════════════════════════════════════════
              HEADER
          ════════════════════════════════════════════════════════════════ */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 24px",
              borderBottom: `1px solid ${theme.colors.white["05"]}`,
              minHeight: "52px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span
                style={{
                  fontFamily: theme.fonts.display,
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: "0.1em",
                  background: `linear-gradient(135deg, ${theme.colors.cyan["400"]} 0%, ${theme.colors.cyan["300"]} 50%, ${theme.colors.white["90"]} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textTransform: "uppercase",
                  textShadow: `0 0 20px ${theme.colors.cyan.glow}, 0 0 40px ${theme.colors.cyan["400"]}15`,
                  filter: `drop-shadow(0 0 8px ${theme.colors.cyan["400"]}40)`,
                  position: "relative",
                }}
              >
                PRESENTO
              </span>

              <div
                style={{
                  width: 1,
                  height: 18,
                  background: theme.colors.white["10"],
                }}
              />

              {/* Presenting badge */}
              {isPresenting && (
                <span
                  className={theme.cx.fadeUp1}
                  style={{
                    ...monoStyle("xxs", theme.colors.cyan["400"]),
                    textTransform: "uppercase",
                    padding: "3px 11px",
                    borderRadius: theme.radius.full,
                    background: theme.colors.cyan.soft,
                    border: `1px solid ${theme.colors.cyan.borderSoft}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span className={theme.cx.liveDot} />
                  {phase === "answering_doubt" ? "Q&A" : "Live"}
                </span>
              )}

              {/* Complete badge */}
              {isComplete && (
                <span
                  style={{
                    ...monoStyle("xxs", theme.colors.emerald["400"]),
                    textTransform: "uppercase",
                    padding: "3px 11px",
                    borderRadius: theme.radius.full,
                    background: theme.colors.emerald.soft,
                    border: `1px solid ${theme.colors.emerald.border}`,
                  }}
                >
                  ✓ Complete
                </span>
              )}
            </div>

            {/* Right — counter + replace + message + connection */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={monoStyle("sm", theme.colors.white["30"])}>
                {currentSlide + 1} / {slides.length}
              </span>

              <button
                onClick={() => loadSlides([])}
                style={{
                  ...monoStyle("xxs", theme.colors.white["30"]),
                  textTransform: "uppercase",
                  padding: "5px 13px",
                  borderRadius: theme.radius.sm,
                  border: `1px solid ${theme.colors.white["07"]}`,
                  background: "transparent",
                  cursor: "pointer",
                  transition: theme.transition.base,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    theme.colors.white["70"];
                  (e.currentTarget as HTMLElement).style.borderColor =
                    theme.colors.white["18"];
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color =
                    theme.colors.white["30"];
                  (e.currentTarget as HTMLElement).style.borderColor =
                    theme.colors.white["07"];
                }}
              >
                ↑ Replace
              </button>

              {/* Message button */}
              <button
                onClick={() => setChatDrawerOpen(true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  ...monoStyle(
                    "xxs",
                    chatMessages.length > 0
                      ? theme.colors.cyan["400"]
                      : theme.colors.white["30"],
                  ),
                  textTransform: "uppercase",
                  padding: "5px 13px",
                  borderRadius: theme.radius.sm,
                  border: `1px solid ${chatMessages.length > 0 ? theme.colors.cyan.borderSoft : theme.colors.white["07"]}`,
                  background:
                    chatMessages.length > 0
                      ? theme.colors.cyan.soft
                      : "transparent",
                  cursor: "pointer",
                  transition: theme.transition.base,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (chatMessages.length > 0) {
                    el.style.background = theme.colors.cyan.soft;
                    el.style.borderColor = theme.colors.cyan.border;
                  } else {
                    el.style.color = theme.colors.white["70"];
                    el.style.borderColor = theme.colors.white["18"];
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (chatMessages.length > 0) {
                    el.style.background = theme.colors.cyan.soft;
                    el.style.borderColor = theme.colors.cyan.borderSoft;
                  } else {
                    el.style.color = theme.colors.white["30"];
                    el.style.borderColor = theme.colors.white["07"];
                  }
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 3c5.5 0 10 3.58 10 8s-4.5 8-10 8c-1.25 0-2.45-.2-3.57-.58-.5 1.45-2.02 2.58-3.83 2.58-.5 0-.96-.09-1.4-.25.37-.6.58-1.29.58-2.03C2.5 13.87 1 12.38 1 10.5 1 7.5 5.5 3 12 3z" />
                </svg>
                Messages {chatMessages.length > 0 && `(${chatMessages.length})`}
              </button>

              <ConnectionBadge
                status={connectionStatus}
                onReconnect={reconnect}
              />
            </div>
          </header>

          {/* ════════════════════════════════════════════════════════════════
              MAIN
          ════════════════════════════════════════════════════════════════ */}
          <main
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px 32px",
              minHeight: 0,
            }}
          >
            {/* ── Slide stage ─────────────────────────────────────────────── */}
            <div
              className={theme.cx.fadeUp1}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                maxWidth: 1200,
                maxHeight: 675,
                aspectRatio: "16/9",
              }}
            >
              {/* Ambient glow halo behind slide */}
              <div
                style={{
                  position: "absolute",
                  inset: -14,
                  borderRadius: theme.radius.xxl,
                  background: `radial-gradient(ellipse at 50% 50%, ${slideAccent}09 0%, transparent 68%)`,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />

              {/* AI Speaking glow effect - Left side */}
              <div
                style={{
                  position: "absolute",
                  left: -80,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 200,
                  height: "80%",
                  borderRadius: "50%",
                  background: `radial-gradient(ellipse at center, ${theme.colors.cyan["400"]}35 0%, ${theme.colors.cyan["400"]}20 30%, transparent 70%)`,
                  filter: "blur(40px)",
                  pointerEvents: "none",
                  zIndex: 0,
                  opacity: agentStatus === "speaking" ? 1 : 0,
                  transition: "opacity 0.6s ease-in-out",
                  animation:
                    agentStatus === "speaking"
                      ? "speakingGlowLeft 2s ease-in-out infinite"
                      : "none",
                }}
              />

              {/* AI Speaking glow effect - Right side */}
              <div
                style={{
                  position: "absolute",
                  right: -80,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 200,
                  height: "80%",
                  borderRadius: "50%",
                  background: `radial-gradient(ellipse at center, ${theme.colors.cyan["400"]}35 0%, ${theme.colors.cyan["400"]}20 30%, transparent 70%)`,
                  filter: "blur(40px)",
                  pointerEvents: "none",
                  zIndex: 0,
                  opacity: agentStatus === "speaking" ? 1 : 0,
                  transition: "opacity 0.6s ease-in-out",
                  animation:
                    agentStatus === "speaking"
                      ? "speakingGlowRight 2s ease-in-out infinite"
                      : "none",
                }}
              />

              {/* Slide card */}
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  height: "100%",
                  borderRadius: theme.radius.xl,
                  overflow: "hidden",
                  boxShadow: `${theme.shadows.slideCard}, 0 0 50px ${slideAccent}0c`,
                }}
              >
                {slide && (
                  <SlideCard
                    key={slide.id}
                    slide={slide}
                    isActive
                    index={currentSlide}
                    total={slides.length}
                  />
                )}
              </div>

              {/* Prev */}
              <button
                className={theme.cx.slideNavBtn}
                onClick={prevSlide}
                disabled={currentSlide === 0}
                style={{
                  position: "absolute",
                  left: -54,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <ChevronLeft />
              </button>

              {/* Next */}
              <button
                className={theme.cx.slideNavBtn}
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                style={{
                  position: "absolute",
                  right: -54,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                <ChevronRight />
              </button>
            </div>
          </main>

          {/* ════════════════════════════════════════════════════════════════
              FOOTER DOCK
          ════════════════════════════════════════════════════════════════ */}
          <footer
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "12px 24px",
              borderTop: `1px solid ${theme.colors.white["05"]}`,
              background: theme.colors.bg.surface,
              minHeight: "60px",
              flexShrink: 0,
            }}
          >
            {/* Left — Session button and status */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minWidth: "fit-content",
              }}
            >
              {/* Start/Restart button */}
              {phase === "idle" && (
                <button
                  onClick={startPresentation}
                  disabled={!isConnected}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    padding: "7px 12px",
                    borderRadius: theme.radius.md,
                    fontFamily: theme.fonts.display,
                    fontWeight: 600,
                    fontSize: 14,
                    letterSpacing: "0.02em",
                    background: isConnected
                      ? `linear-gradient(135deg, ${theme.colors.cyan.soft} 0%, ${theme.colors.cyan.faint} 100%)`
                      : theme.colors.white["03"],
                    border: `1px solid ${isConnected ? theme.colors.cyan.border : theme.colors.white["07"]}`,
                    color: isConnected
                      ? theme.colors.cyan["400"]
                      : theme.colors.white["30"],
                    boxShadow: isConnected ? theme.shadows.cyanGlow : "none",
                    cursor: isConnected ? "pointer" : "default",
                    transition: theme.transition.base,
                    whiteSpace: "nowrap",
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                  Start Presentation
                </button>
              )}

              {/* Restart button */}
              {isComplete && (
                <button
                  onClick={startPresentation}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                    padding: "7px 12px",
                    borderRadius: theme.radius.md,
                    fontFamily: theme.fonts.display,
                    fontWeight: 600,
                    fontSize: 14,
                    letterSpacing: "0.02em",
                    background: `linear-gradient(135deg, ${theme.colors.emerald.soft} 0%, rgba(110,231,183,0.03) 100%)`,
                    border: `1px solid ${theme.colors.emerald.border}`,
                    color: theme.colors.emerald["400"],
                    cursor: "pointer",
                    transition: theme.transition.base,
                    whiteSpace: "nowrap",
                  }}
                >
                  ↺ Restart Presentation
                </button>
              )}

              {/* Session status */}
              {(isPresenting || isComplete) && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    paddingLeft: 10,
                    borderLeft: `1px solid ${theme.colors.white["05"]}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span
                      className={isAgentBusy ? theme.cx.pulseDot : ""}
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: isAgentBusy
                          ? theme.colors.cyan["400"]
                          : theme.colors.white["18"],
                        boxShadow: isAgentBusy
                          ? `0 0 6px ${theme.colors.cyan.glow}`
                          : "none",
                        transition: theme.transition.slow,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: theme.fonts.mono,
                        fontSize: 10,
                        letterSpacing: "0.05em",
                        color: isAgentBusy
                          ? theme.colors.cyan["300"]
                          : theme.colors.white["30"],
                        whiteSpace: "nowrap",
                      }}
                    >
                      {agentStatus === "thinking" && "Thinking"}
                      {agentStatus === "speaking" && "Speaking"}
                      {agentStatus === "idle" &&
                        phase === "complete" &&
                        "Complete"}
                      {agentStatus === "idle" &&
                        phase !== "complete" &&
                        "Ready"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Center — Slide dots */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flex: 1,
                justifyContent: "center",
              }}
            >
              {/* Slide dots */}
              <SlideDots
                slides={slides}
                current={currentSlide}
                onSelect={goToSlide}
              />
            </div>

            {/* Right — Voice control */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                minWidth: "160px",
                justifyContent: "flex-end",
              }}
            >
              {/* Voice orb */}
              {isSupported ? (
                <div style={{ transform: "scale(0.65)" }}>
                  <VoiceOrb
                    voiceState={voiceState}
                    agentStatus={agentStatus}
                    volume={volume}
                    onClick={handleOrbClick}
                    accent={theme.colors.cyan["400"]}
                  />
                </div>
              ) : (
                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: theme.radius.sm,
                    background: theme.colors.red.soft,
                    border: `1px solid ${theme.colors.red.border}`,
                    fontFamily: theme.fonts.mono,
                    fontSize: 10,
                    color: theme.colors.red["400"],
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  Voice N/A
                </div>
              )}
            </div>
          </footer>
        </div>
      </div>

      {/* Chat drawer */}
      <ChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        messages={chatMessages}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  useKeyboard — unchanged
// ─────────────────────────────────────────────────────────────────────────────
function useKeyboard({
  onNext,
  onPrev,
  onToggleListen,
  onStop,
}: {
  onNext: () => void;
  onPrev: () => void;
  onToggleListen: () => void;
  onStop: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          onNext();
          break;
        case "ArrowLeft":
        case "PageUp":
          onPrev();
          break;
        case " ":
          e.preventDefault();
          onToggleListen();
          break;
        case "Escape":
          onStop();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev, onToggleListen, onStop]);
}
