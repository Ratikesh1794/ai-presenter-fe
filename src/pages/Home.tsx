import { useEffect } from "react";
import { usePresentation } from "../hooks/usePresentation";
import { SlideCard } from "../components/SlideCard";
import { SlideDots } from "../components/SlideDots";
import { VoiceOrb } from "../components/VoiceOrb";
import { ConnectionBadge } from "../components/ConnectionBadge";
import { TranscriptBubble } from "../components/TranscriptBubble";
import { UploadScreen } from "../components/Uploadscreen";
import { theme } from "../theme";
import { GlobalStyles } from "../theme.styles";
import type { Slide } from "../slides/slideData";

// ─── Helper: build a mono text style object ───────────────────────────────────
const monoStyle = (
  size: keyof typeof theme.text,
  color: string,
  extra?: React.CSSProperties
): React.CSSProperties => ({
  fontFamily:    theme.fonts.mono,
  fontSize:      theme.text[size].fontSize,
  letterSpacing: theme.text[size].letterSpacing,
  color,
  ...extra,
});

// ─── Logo mark ────────────────────────────────────────────────────────────────
const LogoMark = () => (
  <div
    style={{
      width: 30, height: 30,
      borderRadius: theme.radius.sm,
      background: `linear-gradient(135deg, ${theme.colors.cyan.soft} 0%, ${theme.colors.cyan.faint} 100%)`,
      border: `1px solid ${theme.colors.cyan.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: theme.shadows.cyanGlow,
      flexShrink: 0,
    }}
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <polygon points="5,3 19,12 5,21" fill={theme.colors.cyan["400"]} opacity="0.95" />
    </svg>
  </div>
);

// ─── Nav chevrons ──────────────────────────────────────────────────────────────
const ChevronLeft  = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const {
    slides, currentSlide, loadSlides, goToSlide,
    nextSlide, prevSlide, phase, startPresentation,
    agentStatus, lastAgentText, transcript,
    voiceState, volume, isSupported,
    startListening, stopListening, interrupt,
    connectionStatus, reconnect,
  } = usePresentation();

  const hasSlides   = slides.length > 0;
  const slide       = slides[currentSlide] as Slide | undefined;
  const slideAccent = slide?.accent ?? theme.colors.cyan["400"];

  const isPresenting = phase === "presenting" || phase === "answering_doubt";
  const isComplete   = phase === "complete";
  const isAgentBusy  = agentStatus === "thinking" || agentStatus === "speaking";
  const isListening  = voiceState === "listening";
  const isConnected  = connectionStatus === "connected";

  const handleOrbClick = () => {
    if (voiceState === "speaking") { interrupt(); return; }
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
          minHeight:      "100vh",
          display:        "flex",
          flexDirection:  "column",
          background:     theme.colors.bg.root,
          fontFamily:     theme.fonts.display,
        }}
      >
        {/* ── Atmospheric background layers ──────────────────────────────── */}
        <div className="ds-nebula ds-nebula-1" />
        <div className="ds-nebula ds-nebula-2" />
        <div className="ds-nebula ds-nebula-3" />
        <div className={theme.cx.starsLayer} />
        <div className={theme.cx.grainLayer} />

        {/* ── Content above layers ───────────────────────────────────────── */}
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

          {/* ════════════════════════════════════════════════════════════════
              HEADER
          ════════════════════════════════════════════════════════════════ */}
          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 32px 16px",
            borderBottom: `1px solid ${theme.colors.white["05"]}`,
          }}>

            {/* Left — logo + wordmark + status badges */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <LogoMark />
              <span style={{
                fontFamily: theme.fonts.display, fontWeight: 600,
                fontSize: 14, letterSpacing: "0.04em",
                color: theme.colors.white["90"],
              }}>
                AI Presenter
              </span>

              <div style={{ width: 1, height: 18, background: theme.colors.white["10"] }} />

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
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  <span className={theme.cx.liveDot} />
                  {phase === "answering_doubt" ? "Q&A" : "Live"}
                </span>
              )}

              {/* Complete badge */}
              {isComplete && (
                <span style={{
                  ...monoStyle("xxs", theme.colors.emerald["400"]),
                  textTransform: "uppercase",
                  padding: "3px 11px",
                  borderRadius: theme.radius.full,
                  background: theme.colors.emerald.soft,
                  border: `1px solid ${theme.colors.emerald.border}`,
                }}>
                  ✓ Complete
                </span>
              )}
            </div>

            {/* Right — counter + replace + connection */}
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
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = theme.colors.white["70"];
                  (e.currentTarget as HTMLElement).style.borderColor = theme.colors.white["18"];
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = theme.colors.white["30"];
                  (e.currentTarget as HTMLElement).style.borderColor = theme.colors.white["07"];
                }}
              >
                ↑ Replace
              </button>

              <ConnectionBadge status={connectionStatus} onReconnect={reconnect} />
            </div>
          </header>

          {/* ════════════════════════════════════════════════════════════════
              MAIN
          ════════════════════════════════════════════════════════════════ */}
          <main style={{
            flex: 1,
            display: "flex", flexWrap: "wrap",
            alignItems: "center", justifyContent: "center",
            gap: 28, padding: "24px 40px",
          }}>

            {/* ── Slide stage ─────────────────────────────────────────────── */}
            <div
              className={theme.cx.fadeUp1}
              style={{ position: "relative", width: "100%", maxWidth: 820, aspectRatio: "16/9" }}
            >
              {/* Ambient glow halo behind slide */}
              <div style={{
                position: "absolute", inset: -14,
                borderRadius: theme.radius.xxl,
                background: `radial-gradient(ellipse at 50% 50%, ${slideAccent}09 0%, transparent 68%)`,
                pointerEvents: "none", zIndex: 0,
              }} />

              {/* Slide card */}
              <div style={{
                position: "relative", zIndex: 1, height: "100%",
                borderRadius: theme.radius.xl, overflow: "hidden",
                boxShadow: `${theme.shadows.slideCard}, 0 0 50px ${slideAccent}0c`,
              }}>
                {slide && (
                  <SlideCard key={slide.id} slide={slide} isActive index={currentSlide} total={slides.length} />
                )}
              </div>

              {/* Prev */}
              <button
                className={theme.cx.slideNavBtn}
                onClick={prevSlide}
                disabled={currentSlide === 0}
                style={{ position: "absolute", left: -54, top: "50%", transform: "translateY(-50%)" }}
              >
                <ChevronLeft />
              </button>

              {/* Next */}
              <button
                className={theme.cx.slideNavBtn}
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                style={{ position: "absolute", right: -54, top: "50%", transform: "translateY(-50%)" }}
              >
                <ChevronRight />
              </button>
            </div>

            {/* ── Control panel ───────────────────────────────────────────── */}
            <div
              className={`${theme.cx.glassPanel} ${theme.cx.fadeUp2}`}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                gap: 16, width: "100%", maxWidth: 268, padding: "22px 20px",
                boxShadow: theme.shadows.panel,
              }}
            >
              {/* Panel header */}
              <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={monoStyle("xxs", theme.colors.white["30"], { textTransform: "uppercase" })}>
                  Session
                </span>
                {isPresenting && (
                  <span className={theme.cx.sessionLive}>
                    <span className={theme.cx.liveDot} />
                    <span style={monoStyle("xxs", theme.colors.cyan["400"])}>ON AIR</span>
                  </span>
                )}
              </div>

              <div className={theme.cx.divider} />

              {/* Start */}
              {phase === "idle" && (
                <button
                  className={theme.cx.btnPrimary}
                  onClick={startPresentation}
                  disabled={!isConnected}
                  style={{
                    width: "100%", padding: "14px 0",
                    borderRadius: theme.radius.xl,
                    fontFamily: theme.fonts.display, fontWeight: 600,
                    fontSize: theme.text.base.fontSize,
                    letterSpacing: "0.06em",
                    background: isConnected
                      ? `linear-gradient(135deg, ${theme.colors.cyan.soft} 0%, ${theme.colors.cyan.faint} 100%)`
                      : theme.colors.white["03"],
                    border: `1px solid ${isConnected ? theme.colors.cyan.border : theme.colors.white["07"]}`,
                    color: isConnected ? theme.colors.cyan["400"] : theme.colors.white["30"],
                    boxShadow: isConnected ? theme.shadows.cyanGlow : "none",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Begin Session
                  </span>
                </button>
              )}

              {/* Restart */}
              {isComplete && (
                <button
                  className={theme.cx.btnPrimary}
                  onClick={startPresentation}
                  style={{
                    width: "100%", padding: "14px 0",
                    borderRadius: theme.radius.xl,
                    fontFamily: theme.fonts.display, fontWeight: 600,
                    fontSize: theme.text.base.fontSize,
                    letterSpacing: "0.06em",
                    background: `linear-gradient(135deg, ${theme.colors.emerald.soft} 0%, rgba(110,231,183,0.03) 100%)`,
                    border: `1px solid ${theme.colors.emerald.border}`,
                    color: theme.colors.emerald["400"],
                    cursor: "pointer",
                  }}
                >
                  ↺ Restart Session
                </button>
              )}

              {/* Agent status pill */}
              {(isPresenting || isComplete) && (
                <div style={{
                  width: "100%", padding: "10px 14px",
                  borderRadius: theme.radius.md,
                  background: isAgentBusy ? theme.colors.cyan.soft : theme.colors.white["03"],
                  border: `1px solid ${isAgentBusy ? theme.colors.cyan.borderSoft : theme.colors.white["07"]}`,
                  display: "flex", alignItems: "center", gap: 9,
                  transition: theme.transition.slow,
                }}>
                  <span
                    className={isAgentBusy ? theme.cx.pulseDot : ""}
                    style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      background: isAgentBusy ? theme.colors.cyan["400"] : theme.colors.white["18"],
                      boxShadow: isAgentBusy ? `0 0 6px ${theme.colors.cyan.glow}` : "none",
                      transition: theme.transition.slow,
                    }}
                  />
                  <span style={monoStyle("xs", isAgentBusy ? theme.colors.cyan["300"] : theme.colors.white["30"])}>
                    {agentStatus === "thinking" && "Thinking…"}
                    {agentStatus === "speaking" && "Speaking…"}
                    {agentStatus === "idle" && phase === "complete" && "Session ended"}
                    {agentStatus === "idle" && phase !== "complete" && "Standby"}
                  </span>
                </div>
              )}

              {/* Interrupt hint */}
              {isPresenting && agentStatus === "speaking" && (
                <p style={monoStyle("xxs", `${theme.colors.cyan["400"]}55`, { textAlign: "center", lineHeight: 1.6 })}>
                  Interrupt anytime — just speak
                </p>
              )}

              <div className={theme.cx.divider} />

              {/* Voice orb */}
              {isSupported ? (
                <VoiceOrb
                  voiceState={voiceState}
                  agentStatus={agentStatus}
                  volume={volume}
                  onClick={handleOrbClick}
                  accent={theme.colors.cyan["400"]}
                />
              ) : (
                <div style={{
                  width: "100%", padding: "12px 16px",
                  borderRadius: theme.radius.md,
                  background: theme.colors.red.soft,
                  border: `1px solid ${theme.colors.red.border}`,
                  color: theme.colors.red["400"],
                  ...monoStyle("sm", theme.colors.red["400"]),
                  textAlign: "center", lineHeight: 1.5,
                }}>
                  Voice unavailable — use Chrome
                </div>
              )}

              {/* Keyboard hint */}
              <p style={monoStyle("xxs", theme.colors.white["18"], { textAlign: "center", lineHeight: 1.8 })}>
                {voiceState === "speaking"
                  ? "Click orb to interrupt"
                  : "Space · click orb · Esc to stop"}
              </p>

              <div className={theme.cx.divider} />

              {/* Transcript */}
              <TranscriptBubble
                userText={transcript}
                agentText={lastAgentText}
                accent={theme.colors.cyan["400"]}
              />
            </div>
          </main>

          {/* ════════════════════════════════════════════════════════════════
              FOOTER
          ════════════════════════════════════════════════════════════════ */}
          <footer style={{
            display: "flex", justifyContent: "center",
            paddingBottom: 32, paddingTop: 12,
            borderTop: `1px solid ${theme.colors.white["05"]}`,
          }}>
            <SlideDots slides={slides} current={currentSlide} onSelect={goToSlide} />
          </footer>

        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  useKeyboard — unchanged
// ─────────────────────────────────────────────────────────────────────────────
function useKeyboard({
  onNext, onPrev, onToggleListen, onStop,
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
        case "ArrowRight": case "PageDown":  onNext();          break;
        case "ArrowLeft":  case "PageUp":    onPrev();          break;
        case " ":          e.preventDefault(); onToggleListen(); break;
        case "Escape":                        onStop();          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev, onToggleListen, onStop]);
}