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
  const isListening = voiceState === "listening";

  const handleOrbClick = () => {
    if (voiceState === "speaking") { interrupt(); return; }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Always register keyboard handler — hooks must not be called conditionally
  useKeyboard({ onNext: nextSlide, onPrev: prevSlide, onToggleListen: handleOrbClick, onStop: stopListening });

  // ── Upload screen ──────────────────────────────────────────────────────────
  if (!hasSlides) {
    return <UploadScreen onLoaded={loadSlides} />;
  }

  // ── Presentation view ──────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% -10%, #1a1f35 0%, #080a10 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-8 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-mono tracking-[0.25em] uppercase"
            style={{ color: `${accent}88` }}
          >
            AI Presenter
          </span>
          <button
            onClick={() => loadSlides([])}
            className="text-xs font-mono tracking-wide px-2 py-1 rounded-lg transition-all duration-200 hover:opacity-80"
            style={{ color: "#ffffff30", border: "1px solid #ffffff10", background: "transparent" }}
          >
            ↑ Replace deck
          </button>
        </div>
        <ConnectionBadge status={connectionStatus} onReconnect={reconnect} />
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col lg:flex-row items-center justify-center gap-8 px-6 py-4">

        {/* Slide area */}
        <div className="relative w-full max-w-2xl" style={{ aspectRatio: "16/9" }}>
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
            className="absolute -left-13 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-20 hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Previous slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="absolute -right-13 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-20 hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Next slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Right panel */}
        <div className="flex flex-col items-center gap-6 w-full max-w-xs">
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
              style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#F87171" }}
            >
              Voice not supported. Try Chrome.
            </div>
          )}

          <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
            Click orb · Space to toggle · Esc to stop
          </p>

          <TranscriptBubble
            userText={transcript}
            agentText={lastAgentText}
            accent={accent}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="flex justify-center pb-8 pt-2">
        <SlideDots slides={slides} current={currentSlide} onSelect={goToSlide} />
      </footer>
    </div>
  );
}

// ── Keyboard hook (extracted so it's always called before any return) ──────────

function useKeyboard({ onNext, onPrev, onToggleListen, onStop }: {
  onNext: () => void;
  onPrev: () => void;
  onToggleListen: () => void;
  onStop: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case "ArrowRight": case "PageDown": onNext(); break;
        case "ArrowLeft":  case "PageUp":   onPrev(); break;
        case " ": e.preventDefault(); onToggleListen(); break;
        case "Escape": onStop(); break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onNext, onPrev, onToggleListen, onStop]);
}