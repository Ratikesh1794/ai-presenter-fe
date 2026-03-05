import type { Slide } from "../slides/slideData";
import { theme } from "../theme";

interface SlideDotsProps {
  slides: Slide[];
  current: number;
  onSelect: (index: number) => void;
}

export function SlideDots({ slides, current, onSelect }: SlideDotsProps) {
  const accent = slides[current]?.accent ?? theme.colors.cyan["400"];

  return (
    <div
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            8,
        padding:        "8px 16px",
        borderRadius:   theme.radius.full,
        background:     theme.colors.white["03"],
        border:         `1px solid ${theme.colors.white["07"]}`,
        backdropFilter: "blur(12px)",
      }}
    >
      {slides.map((slide, i) => {
        const isActive = i === current;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            aria-label={`Go to slide ${i + 1}: ${slide.title}`}
            style={{
              padding:    0,
              background: "none",
              border:     "none",
              cursor:     "pointer",
              display:    "flex",
              alignItems: "center",
              justifyContent: "center",
              // Larger hit area
              width:  isActive ? 28 : 16,
              height: 16,
              transition: theme.transition.base,
            }}
          >
            <span
              style={{
                display:      "block",
                borderRadius: theme.radius.full,
                transition:   theme.transition.base,
                width:        isActive ? 22 : 6,
                height:       6,
                background:   isActive
                  ? accent
                  : `${accent}35`,
                boxShadow:    isActive ? `0 0 10px ${accent}70` : "none",
              }}
            />
          </button>
        );
      })}
    </div>
  );
}