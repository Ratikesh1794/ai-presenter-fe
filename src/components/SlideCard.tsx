import { useEffect, useRef, useState } from "react";
import type { Slide } from "../slides/slideData";
import { resolveImageUrl } from "../slides/slideData";

interface SlideCardProps {
  slide: Slide;
  isActive: boolean;
  index: number;
  total: number;
}

export function SlideCard({ slide, isActive, index, total }: SlideCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imgError, setImgError] = useState(false);

  const imageUrl = resolveImageUrl(slide.image_url);
  const showImage = imageUrl && !imgError;

  // Fade-in animation on slide change
  useEffect(() => {
    if (!isActive || !cardRef.current) return;
    const el = cardRef.current;
    el.style.opacity = "0";
    el.style.transform = "translateY(14px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, [isActive, slide.id]);

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col h-full w-full rounded-2xl overflow-hidden"
      style={{
        background: showImage
          ? "#000"
          : "linear-gradient(135deg, #0f1117 0%, #1a1d27 100%)",
        border: `1px solid ${slide.accent}22`,
        boxShadow: `0 0 60px ${slide.accent}18, 0 24px 64px rgba(0,0,0,0.6)`,
      }}
    >
      {/* ── Actual slide image ─────────────────────────────────────────────── */}
      {showImage ? (
        <>
          <img
            src={imageUrl}
            alt={slide.title}
            className="w-full h-full object-contain"
            onError={() => {
              console.warn("[SlideCard] Image failed to load:", imageUrl);
              setImgError(true);
            }}
          />

          {/* Slide counter overlay */}
          <div
            className="absolute bottom-3 right-4 px-2 py-1 rounded-lg text-xs font-mono"
            style={{
              background: "rgba(0,0,0,0.55)",
              color: `${slide.accent}cc`,
              backdropFilter: "blur(4px)",
            }}
          >
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </div>

          {/* Top accent bar */}
          <div
            className="absolute top-0 left-0 right-0 h-0.75"
            style={{
              background: `linear-gradient(90deg, transparent, ${slide.accent}, transparent)`,
            }}
          />
        </>
      ) : (
        /* ── Fallback: styled text card (if no image or image failed) ───── */
        <>
          <div
            className="absolute top-0 left-0 right-0 h-0.75"
            style={{
              background: `linear-gradient(90deg, transparent, ${slide.accent}, transparent)`,
            }}
          />
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5 pointer-events-none"
            style={{
              background: slide.accent,
              filter: "blur(80px)",
              transform: "translate(30%, -30%)",
            }}
          />

          <div className="absolute top-6 right-8">
            <span
              className="text-xs font-mono tracking-widest uppercase"
              style={{ color: `${slide.accent}88` }}
            >
              {String(index + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </span>
          </div>

          <div className="relative z-10 flex flex-col h-full px-12 py-10">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 mt-2"
              style={{
                background: `${slide.accent}14`,
                border: `1px solid ${slide.accent}30`,
              }}
            >
              {slide.icon}
            </div>

            <div className="mb-8">
              {slide.subtitle && (
                <p
                  className="text-xs font-mono tracking-[0.2em] uppercase mb-3"
                  style={{ color: slide.accent }}
                >
                  {slide.subtitle}
                </p>
              )}
              <h2
                className="text-4xl font-bold leading-tight text-white"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {slide.title}
              </h2>
            </div>

            <ul className="space-y-4 mt-auto">
              {slide.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-4">
                  <span
                    className="mt-1.75 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: slide.accent }}
                  />
                  <span
                    className="text-gray-300 text-base leading-relaxed"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-px opacity-20"
            style={{
              background: `linear-gradient(90deg, transparent, ${slide.accent}, transparent)`,
            }}
          />
        </>
      )}
    </div>
  );
}
