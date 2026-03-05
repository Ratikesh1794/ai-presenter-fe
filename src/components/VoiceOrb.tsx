import { useEffect, useRef } from "react";
import type { VoiceState } from "../hooks/useVoice";
import type { AgentStatus } from "../hooks/useWebSocket";
import { theme } from "../theme";

interface VoiceOrbProps {
  voiceState: VoiceState;
  agentStatus: AgentStatus;
  volume: number; // 0–1
  onClick: () => void;
  accent: string;
}

export function VoiceOrb({ voiceState, agentStatus, volume, onClick, accent }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number | null>(null);
  const phaseRef  = useRef(0);

  const isListening = voiceState === "listening";
  const isSpeaking  = voiceState === "speaking";
  const isThinking  = agentStatus === "thinking";

  // ── Canvas waveform ring — logic unchanged ────────────────────────────────
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
        const baseR  = 46;
        const points = 64;
        const amp    = isListening
          ? volume * 18
          : isSpeaking
          ? 8 + Math.sin(phaseRef.current * 2) * 6
          : 0;

        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const noise =
            Math.sin(angle * 4 + phaseRef.current) * amp +
            Math.sin(angle * 7 - phaseRef.current * 1.3) * amp * 0.5;
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
        grad.addColorStop(0, `${accent}90`);
        grad.addColorStop(1, `${accent}00`);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.8;
        ctx.stroke();
      }

      phaseRef.current += 0.06;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isListening, isSpeaking, volume, accent]);

  // ── Status label ──────────────────────────────────────────────────────────
  const label = isThinking
    ? "Thinking"
    : isListening
    ? "Listening"
    : isSpeaking
    ? "Speaking"
    : "Click to speak";

  // ── Orb background / border based on state ────────────────────────────────
  const orbBackground = isListening
    ? `radial-gradient(circle at 40% 35%, ${accent}50 0%, ${accent}28 50%, ${accent}0c 100%)`
    : isThinking
    ? `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)`
    : `radial-gradient(circle at 40% 35%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)`;

  const orbBorder = isListening
    ? `1.5px solid ${accent}80`
    : isThinking
    ? `1.5px solid rgba(255,255,255,0.22)`
    : `1.5px solid rgba(255,255,255,0.12)`;

  const orbShadow = isListening
    ? `0 0 40px ${accent}45, 0 0 80px ${accent}18, inset 0 0 28px ${accent}18`
    : isSpeaking
    ? `0 0 24px ${accent}30`
    : "none";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, userSelect: "none" }}>

      {/* ── Orb + canvas wrapper ─────────────────────────────────────────── */}
      <div style={{ position: "relative" }}>

        {/* Waveform canvas — same size/offset as original */}
        <canvas
          ref={canvasRef}
          width={120}
          height={120}
          style={{
            position:      "absolute",
            inset:         0,
            pointerEvents: "none",
            transform:     "translate(-10px, -10px)",
          }}
        />

        {/* Outer glow ring — decorative only */}
        {(isListening || isSpeaking) && (
          <div style={{
            position:     "absolute",
            inset:        -8,
            borderRadius: "50%",
            border:       `1px solid ${accent}20`,
            animation:    "ds-orb-ring 2.5s ease-in-out infinite",
            pointerEvents: "none",
          }} />
        )}

        {/* ── Orb button ───────────────────────────────────────────────── */}
        <button
          onClick={onClick}
          style={{
            position:       "relative",
            width:          100,
            height:         100,
            borderRadius:   "50%",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            background:     orbBackground,
            border:         orbBorder,
            boxShadow:      orbShadow,
            cursor:         "pointer",
            transition:     "transform 0.15s ease, box-shadow 0.3s ease",
            outline:        "none",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
          onMouseDown={e =>  { (e.currentTarget as HTMLElement).style.transform = "scale(0.96)"; }}
          onMouseUp={e =>    { (e.currentTarget as HTMLElement).style.transform = "scale(1.04)"; }}
        >
          {/* Mic icon */}
          {!isThinking && !isSpeaking && (
            <svg
              width="26" height="26" viewBox="0 0 24 24"
              fill="none"
              stroke={isListening ? accent : "rgba(255,255,255,0.55)"}
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 10a7 7 0 0 0 14 0" />
              <line x1="12" y1="19" x2="12" y2="22" />
              <line x1="8"  y1="22" x2="16" y2="22" />
            </svg>
          )}

          {/* Thinking spinner */}
          {isThinking && (
            <svg
              width="26" height="26" viewBox="0 0 24 24"
              fill="none" stroke={accent} strokeWidth="1.7" strokeLinecap="round"
              style={{ animation: "spin 1s linear infinite" }}
            >
              <path d="M12 2a10 10 0 0 1 0 20A10 10 0 0 1 12 2" strokeDasharray="30 60" />
            </svg>
          )}

          {/* Speaking wave bars */}
          {isSpeaking && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 24 }}>
              {[1, 2, 3, 4, 3].map((h, i) => (
                <span
                  key={i}
                  style={{
                    width:            3,
                    height:           h * 5,
                    borderRadius:     2,
                    background:       accent,
                    animation:        "ds-speak-bar 0.8s ease-in-out infinite",
                    animationDelay:   `${i * 100}ms`,
                    display:          "block",
                  }}
                />
              ))}
            </div>
          )}
        </button>
      </div>

      {/* ── Status label ─────────────────────────────────────────────────── */}
      <span style={{
        fontFamily:    theme.fonts.mono,
        fontSize:      theme.text.xxs.fontSize,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color:         (isListening || isSpeaking) ? accent : "rgba(255,255,255,0.28)",
        transition:    theme.transition.base,
      }}>
        {label}
      </span>

      <style>{`
        @keyframes ds-speak-bar {
          0%, 100% { transform: scaleY(0.35); }
          50%       { transform: scaleY(1); }
        }
        @keyframes ds-orb-ring {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.08); opacity: 0.2; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}