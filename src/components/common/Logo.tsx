import { theme } from "../../theme";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "simple" | "header";
}

export function Logo({ size = "md", variant = "simple" }: LogoProps) {
  if (variant === "header") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: size === "sm" ? 8 : size === "md" ? 10 : 12,
        }}
      >
        <span
          style={{
            fontFamily: theme.fonts.display,
            fontWeight: 700,
            fontSize: size === "sm" ? 16 : size === "md" ? 20 : 24,
            letterSpacing: "0.1em",
            background: `linear-gradient(135deg, ${theme.colors.cyan["400"]} 0%, ${theme.colors.cyan["300"]} 50%, ${theme.colors.white["90"]} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textTransform: "uppercase",
            textShadow: `0 0 20px ${theme.colors.cyan.glow}, 0 0 40px ${theme.colors.cyan["400"]}15`,
            filter: `drop-shadow(0 0 8px ${theme.colors.cyan["400"]}40)`,
          }}
        >
          PRESENTO
        </span>
      </div>
    );
  }

  // Simple text-only variant
  return (
    <span
      style={{
        fontFamily: theme.fonts.display,
        fontSize: size === "sm" ? "14px" : size === "md" ? "16px" : "18px",
        fontWeight: 700,
        letterSpacing: "0.3em",
        textTransform: "uppercase",
        background: `linear-gradient(135deg, ${theme.colors.cyan["400"]} 0%, ${theme.colors.emerald["400"]} 50%, ${theme.colors.cyan["300"]} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        textShadow: `0 0 20px ${theme.colors.cyan.glow}, 0 0 40px ${theme.colors.cyan["400"]}20`,
        filter: `drop-shadow(0 0 12px ${theme.colors.cyan["400"]}30)`,
        position: "relative" as const,
      }}
    >
      PRESENTO
    </span>
  );
}
