import { useEffect, useRef, useState } from "react";
import type { Slide } from "../slides/slideData";
import { resolveImageUrl } from "../slides/slideData";
import { theme } from "../theme";

interface SlideCardProps {
  slide: Slide;
  isActive: boolean;
  index: number;
  total: number;
}

export function SlideCard({ slide, isActive, index, total }: SlideCardProps) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);

  const imageUrl = resolveImageUrl(slide.image_url);
  const showImage = imageUrl && !imgError;

  // Fade-in animation on slide change — unchanged
  useEffect(() => {
    if (!isActive || !cardRef.current) return;
    const el = cardRef.current;
    el.style.opacity   = "0";
    el.style.transform = "translateY(14px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      el.style.opacity    = "1";
      el.style.transform  = "translateY(0)";
    });
  }, [isActive, slide.id]);

  // Slide counter label
  const counter = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return (
    <div
      ref={cardRef}
      style={{
        position:   "relative",
        display:    "flex",
        flexDirection: "column",
        height:     "100%",
        width:      "100%",
        borderRadius: theme.radius.xl,
        overflow:   "hidden",
        background: showImage
          ? "#000"
          : `linear-gradient(145deg, ${theme.colors.bg.raised} 0%, ${theme.colors.bg.overlay} 100%)`,
        border:     `1px solid ${slide.accent}1e`,
        boxShadow:  `0 0 60px ${slide.accent}12, 0 24px 64px rgba(0,0,0,0.65)`,
      }}
    >
      {/* ── Top accent bar — always present ─────────────────────────────── */}
      <div style={{
        position:   "absolute",
        top: 0, left: 0, right: 0,
        height:     2,
        background: `linear-gradient(90deg, transparent 0%, ${slide.accent} 40%, ${slide.accent} 60%, transparent 100%)`,
        zIndex:     10,
        opacity:    0.7,
      }} />

      {/* ════════════════════════════════════════════════════════════════════
          IMAGE MODE
      ════════════════════════════════════════════════════════════════════ */}
      {showImage ? (
        <>
          <img
            src={imageUrl}
            alt={slide.title}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={() => {
              console.warn("[SlideCard] Image failed to load:", imageUrl);
              setImgError(true);
            }}
          />

          {/* Slide counter overlay */}
          <div style={{
            position:       "absolute",
            bottom:         12,
            right:          16,
            padding:        "4px 10px",
            borderRadius:   theme.radius.md,
            background:     "rgba(0,0,0,0.58)",
            backdropFilter: "blur(8px)",
            fontFamily:     theme.fonts.mono,
            fontSize:       theme.text.xxs.fontSize,
            letterSpacing:  "0.14em",
            color:          `${slide.accent}cc`,
            zIndex:         10,
          }}>
            {counter}
          </div>
        </>
      ) : (
        /* ════════════════════════════════════════════════════════════════
            FALLBACK TEXT CARD
        ════════════════════════════════════════════════════════════════ */
        <>
          {/* Ambient glow blob */}
          <div style={{
            position:     "absolute",
            top: 0, right: 0,
            width:        360,
            height:       360,
            borderRadius: "50%",
            background:   slide.accent,
            filter:       "blur(90px)",
            opacity:      0.055,
            transform:    "translate(30%, -30%)",
            pointerEvents: "none",
          }} />

          {/* Bottom fade */}
          <div style={{
            position:   "absolute",
            bottom: 0, left: 0, right: 0,
            height:     120,
            background: `linear-gradient(to top, ${theme.colors.bg.raised}cc, transparent)`,
            pointerEvents: "none",
            zIndex:     1,
          }} />

          {/* Slide counter — top right */}
          <div style={{
            position:      "absolute",
            top:           20,
            right:         28,
            fontFamily:    theme.fonts.mono,
            fontSize:      theme.text.xxs.fontSize,
            letterSpacing: "0.2em",
            color:         `${slide.accent}70`,
            zIndex:        5,
          }}>
            {counter}
          </div>

          {/* Content */}
          <div style={{
            position:       "relative",
            zIndex:         2,
            display:        "flex",
            flexDirection:  "column",
            height:         "100%",
            padding:        "40px 48px",
          }}>
            {/* Icon chip */}
            <div style={{
              width:          56,
              height:         56,
              borderRadius:   theme.radius.lg,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       28,
              background:     `${slide.accent}12`,
              border:         `1px solid ${slide.accent}28`,
              marginBottom:   28,
              marginTop:      8,
              flexShrink:     0,
            }}>
              {slide.icon}
            </div>

            {/* Title block */}
            <div style={{ marginBottom: 28 }}>
              {slide.subtitle && (
                <p style={{
                  fontFamily:    theme.fonts.mono,
                  fontSize:      theme.text.xxs.fontSize,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color:         slide.accent,
                  marginBottom:  10,
                }}>
                  {slide.subtitle}
                </p>
              )}
              <h2 style={{
                fontFamily:  theme.fonts.display,
                fontWeight:  700,
                fontSize:    36,
                lineHeight:  1.2,
                color:       theme.colors.white["90"],
                letterSpacing: "-0.01em",
              }}>
                {slide.title}
              </h2>
            </div>

            {/* Bullets */}
            <ul style={{
              listStyle:  "none",
              padding:    0,
              margin:     0,
              marginTop:  "auto",
              display:    "flex",
              flexDirection: "column",
              gap:        14,
            }}>
              {slide.bullets.map((bullet, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  {/* Bullet marker */}
                  <span style={{
                    width:        6,
                    height:       6,
                    borderRadius: "50%",
                    background:   slide.accent,
                    flexShrink:   0,
                    marginTop:    7,
                    boxShadow:    `0 0 6px ${slide.accent}70`,
                  }} />
                  <span style={{
                    fontFamily:  theme.fonts.display,
                    fontSize:    theme.text.md.fontSize,
                    color:       theme.colors.white["70"],
                    lineHeight:  1.6,
                  }}>
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom accent line */}
          <div style={{
            position:   "absolute",
            bottom: 0, left: 0, right: 0,
            height:     1,
            background: `linear-gradient(90deg, transparent, ${slide.accent}30, transparent)`,
            zIndex:     5,
          }} />
        </>
      )}
    </div>
  );
}