import type { Slide } from "../slides/slideData";

interface SlideDotsProps {
  slides: Slide[];
  current: number;
  onSelect: (index: number) => void;
}

export function SlideDots({ slides, current, onSelect }: SlideDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {slides.map((slide, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className="relative group transition-all duration-300"
          aria-label={`Go to slide ${i + 1}: ${slide.title}`}
        >
          <span
            className="block rounded-full transition-all duration-300"
            style={{
              width: i === current ? "24px" : "8px",
              height: "8px",
              background:
                i === current
                  ? slide.accent
                  : `${slides[current].accent}40`,
              boxShadow: i === current ? `0 0 8px ${slide.accent}80` : "none",
            }}
          />
        </button>
      ))}
    </div>
  );
}