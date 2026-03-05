import { useEffect, useRef } from "react";
import type { VoiceState } from "../hooks/useVoice";
import type { AgentStatus } from "../hooks/useWebSocket";

interface VoiceOrbProps {
  voiceState: VoiceState;
  agentStatus: AgentStatus;
  volume: number; // 0–1
  onClick: () => void;
  accent: string;
}

export function VoiceOrb({ voiceState, agentStatus, volume, onClick, accent }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const phaseRef = useRef(0);

  const isListening = voiceState === "listening";
  const isSpeaking = voiceState === "speaking";
  const isThinking = agentStatus === "thinking";

  // Draw animated waveform ring on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      if (isListening || isSpeaking) {
        const baseR = 46;
        const points = 64;
        const amp = isListening ? volume * 18 : isSpeaking ? 8 + Math.sin(phaseRef.current * 2) * 6 : 0;

        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const noise = Math.sin(angle * 4 + phaseRef.current) * amp
            + Math.sin(angle * 7 - phaseRef.current * 1.3) * amp * 0.5;
          const r = baseR + noise;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        const grad = ctx.createRadialGradient(cx, cy, baseR - 4, cx, cy, baseR + amp + 4);
        grad.addColorStop(0, `${accent}88`);
        grad.addColorStop(1, `${accent}00`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      phaseRef.current += 0.06;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isListening, isSpeaking, volume, accent]);

  const label = isThinking
    ? "Thinking…"
    : isListening
    ? "Listening…"
    : isSpeaking
    ? "Speaking…"
    : "Hold to speak";

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <div className="relative">
        {/* Canvas waveform */}
        <canvas
          ref={canvasRef}
          width={120}
          height={120}
          className="absolute inset-0 pointer-events-none"
          style={{ transform: "translate(-10px, -10px)" }}
        />

        {/* The orb button */}
        <button
          onClick={onClick}
          className="relative w-[100px] h-[100px] rounded-full flex items-center justify-center transition-transform duration-150 active:scale-95"
          style={{
            background: isListening
              ? `radial-gradient(circle, ${accent}44 0%, ${accent}22 60%, transparent 100%)`
              : isThinking
              ? "radial-gradient(circle, #ffffff14 0%, #ffffff08 100%)"
              : "radial-gradient(circle, #ffffff0a 0%, transparent 100%)",
            border: `1.5px solid ${isListening ? accent : isThinking ? "#ffffff30" : "#ffffff18"}`,
            boxShadow: isListening
              ? `0 0 32px ${accent}50, inset 0 0 24px ${accent}20`
              : "none",
          }}
        >
          {/* Mic icon */}
          {!isThinking && !isSpeaking && (
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isListening ? accent : "#ffffff80"}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          )}

          {/* Thinking spinner */}
          {isThinking && (
            <svg
              className="animate-spin"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke={accent}
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M12 2a10 10 0 0 1 0 20A10 10 0 0 1 12 2" strokeDasharray="30 60" />
            </svg>
          )}

          {/* Speaking wave bars */}
          {isSpeaking && (
            <div className="flex items-end gap-[3px] h-6">
              {[1, 2, 3, 4, 3].map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full"
                  style={{
                    height: `${h * 5}px`,
                    background: accent,
                    animation: `speakBar 0.8s ease-in-out infinite`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </button>
      </div>

      {/* Label */}
      <span
        className="text-xs font-mono tracking-widest uppercase transition-all duration-300"
        style={{ color: isListening || isSpeaking ? accent : "#ffffff44" }}
      >
        {label}
      </span>

      <style>{`
        @keyframes speakBar {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}