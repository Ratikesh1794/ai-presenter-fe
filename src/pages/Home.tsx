import { useEffect } from "react";
import { usePresentation } from "../hooks/usePresentation";
import { SlideCard } from "../components/SlideCard";
import { SlideDots } from "../components/SlideDots";
import { VoiceOrb } from "../components/VoiceOrb";
import { ConnectionBadge } from "../components/ConnectionBadge";
import { TranscriptBubble } from "../components/TranscriptBubble";
import { UploadScreen } from "../components/Uploadscreen";
import type { Slide } from "../slides/slideData";

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

  const hasSlides = slides.length > 0;
  const slide = slides[currentSlide] as Slide | undefined;
  const accent = slide?.accent ?? "#6EE7B7";

  const isPresenting = phase === "presenting" || phase === "answering_doubt";
  const isComplete = phase === "complete";
  const isAgentBusy = agentStatus === "thinking" || agentStatus === "speaking";
  const isListening = voiceState === "listening";

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
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, #1a1f35 0%, #080a10 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-8 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-mono tracking-[0.25em] uppercase"
            style={{ color: `${accent}88` }}
          >
            AI Presenter
          </span>
          {/* Phase badge */}
          {isPresenting && (
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full flex items-center gap-1.5"
              style={{
                background: `${accent}18`,
                border: `1px solid ${accent}35`,
                color: accent,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: accent }}
              />
              {phase === "answering_doubt" ? "Answering doubt" : "Presenting"}
            </span>
          )}
          {isComplete && (
            <span
              className="text-xs font-mono px-2 py-0.5 rounded-full"
              style={{
                background: "#6EE7B718",
                border: "1px solid #6EE7B735",
                color: "#6EE7B7",
              }}
            >
              ✓ Complete
            </span>
          )}
          <button
            onClick={() => loadSlides([])}
            className="text-xs font-mono px-2 py-1 rounded-lg hover:opacity-80 transition-opacity"
            style={{
              color: "#ffffff28",
              border: "1px solid #ffffff10",
              background: "transparent",
            }}
          >
            ↑ Replace deck
          </button>
        </div>
        <ConnectionBadge status={connectionStatus} onReconnect={reconnect} />
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex flex-1 flex-col lg:flex-row items-center justify-center gap-8 px-6 py-4">
        {/* Slide */}
        <div
          className="relative w-full max-w-2xl"
          style={{ aspectRatio: "16/9" }}
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
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="absolute -left-13 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-20 hover:opacity-80 transition-opacity"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="absolute -right-13 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-20 hover:opacity-80 transition-opacity"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Right panel */}
        <div className="flex flex-col items-center gap-5 w-full max-w-xs">
          {/* ── Not started → Start button ─────────────────────────────────── */}
          {phase === "idle" && (
            <button
              onClick={startPresentation}
              disabled={connectionStatus !== "connected"}
              className="w-full py-4 rounded-2xl font-medium text-sm tracking-wide transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${accent}30, ${accent}15)`,
                border: `1.5px solid ${accent}50`,
                color: accent,
                boxShadow:
                  connectionStatus === "connected"
                    ? `0 0 28px ${accent}22`
                    : "none",
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
                Start Presentation
              </span>
            </button>
          )}

          {/* ── Complete → restart option ──────────────────────────────────── */}
          {isComplete && (
            <button
              onClick={startPresentation}
              className="w-full py-3 rounded-2xl font-medium text-sm tracking-wide transition-all duration-300"
              style={{
                background: "rgba(110,231,183,0.1)",
                border: "1.5px solid rgba(110,231,183,0.3)",
                color: "#6EE7B7",
              }}
            >
              ↺ Restart Presentation
            </button>
          )}

          {/* ── Agent status pill ──────────────────────────────────────────── */}
          {(isPresenting || isComplete) && (
            <div
              className="w-full px-4 py-2.5 rounded-xl text-xs font-mono flex items-center gap-2"
              style={{
                background: isAgentBusy
                  ? `${accent}12`
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${isAgentBusy ? accent + "30" : "rgba(255,255,255,0.07)"}`,
                color: isAgentBusy ? accent : "rgba(255,255,255,0.28)",
              }}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${isAgentBusy ? "animate-pulse" : ""}`}
                style={{
                  background: isAgentBusy ? accent : "rgba(255,255,255,0.18)",
                }}
              />
              {agentStatus === "thinking" && "Agent is thinking…"}
              {agentStatus === "speaking" && "Agent is speaking…"}
              {agentStatus === "idle" &&
                phase === "complete" &&
                "Presentation complete"}
              {agentStatus === "idle" &&
                phase !== "complete" &&
                "Agent is idle"}
            </div>
          )}

          {/* ── Interrupt hint (while agent is speaking) ───────────────────── */}
          {isPresenting && agentStatus === "speaking" && (
            <p
              className="text-xs font-mono text-center"
              style={{ color: `${accent}70` }}
            >
              💬 Ask a question anytime to pause & clarify
            </p>
          )}

          {/* ── Voice orb ─────────────────────────────────────────────────── */}
          {isSupported ? (
            <VoiceOrb
              voiceState={voiceState}
              agentStatus={agentStatus}
              volume={volume}
              onClick={handleOrbClick}
              accent={accent}
            />
          ) : (
            <div
              className="px-4 py-3 rounded-xl text-sm text-center"
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.2)",
                color: "#F87171",
              }}
            >
              Voice not supported. Try Chrome.
            </div>
          )}

          <p
            className="text-xs font-mono text-center"
            style={{ color: "rgba(255,255,255,0.18)" }}
          >
            {voiceState === "speaking"
              ? "Click orb to interrupt"
              : "Click orb · Space to speak · Esc to stop"}
          </p>

          <TranscriptBubble
            userText={transcript}
            agentText={lastAgentText}
            accent={accent}
          />
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="flex justify-center pb-8 pt-2">
        <SlideDots
          slides={slides}
          current={currentSlide}
          onSelect={goToSlide}
        />
      </footer>
    </div>
  );
}

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
