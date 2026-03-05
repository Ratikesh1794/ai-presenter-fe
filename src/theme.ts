// ─────────────────────────────────────────────────────────────────────────────
//  Deep Space Studio — Design Tokens
//  Pure data only — no JSX here so this stays a .ts file.
//  Import { theme } from "../theme"
//  Import { GlobalStyles } from "../theme.styles"
// ─────────────────────────────────────────────────────────────────────────────

export const theme = {

  // ── Color Palette ──────────────────────────────────────────────────────────
  colors: {
    bg: {
      root:    "#03050d",
      surface: "#070a16",
      raised:  "#0c1020",
      overlay: "#111828",
      subtle:  "#161e30",
    },

    cyan: {
      "400":      "#22d3ee",
      "300":      "#67e8f9",
      "200":      "#a5f3fc",
      glow:       "rgba(34,211,238,0.18)",
      soft:       "rgba(34,211,238,0.08)",
      faint:      "rgba(34,211,238,0.04)",
      border:     "rgba(34,211,238,0.25)",
      borderSoft: "rgba(34,211,238,0.14)",
    },

    emerald: {
      "400":  "#6EE7B7",
      glow:   "rgba(110,231,183,0.15)",
      soft:   "rgba(110,231,183,0.08)",
      border: "rgba(110,231,183,0.25)",
    },

    red: {
      "400":  "#F87171",
      soft:   "rgba(248,113,113,0.08)",
      border: "rgba(248,113,113,0.18)",
    },

    // All keys are plain strings — no octal ambiguity
    white: {
      "100": "rgba(255,255,255,1.00)",
      "90":  "rgba(255,255,255,0.90)",
      "70":  "rgba(255,255,255,0.70)",
      "50":  "rgba(255,255,255,0.50)",
      "30":  "rgba(255,255,255,0.30)",
      "18":  "rgba(255,255,255,0.18)",
      "10":  "rgba(255,255,255,0.10)",
      "07":  "rgba(255,255,255,0.07)",
      "05":  "rgba(255,255,255,0.05)",
      "03":  "rgba(255,255,255,0.03)",
    },
  },

  // ── Typography ─────────────────────────────────────────────────────────────
  fonts: {
    display:      "'Syne', sans-serif",
    mono:         "'JetBrains Mono', monospace",
    googleImport: "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap",
  },

  text: {
    xxs:  { fontSize: 9,  letterSpacing: "0.16em" },
    xs:   { fontSize: 10, letterSpacing: "0.12em" },
    sm:   { fontSize: 11, letterSpacing: "0.08em" },
    base: { fontSize: 13, letterSpacing: "0.04em" },
    md:   { fontSize: 15, letterSpacing: "0.02em" },
    lg:   { fontSize: 18, letterSpacing: "0.01em" },
    xl:   { fontSize: 22, letterSpacing: "0em"    },
  },

  // ── Border Radius ──────────────────────────────────────────────────────────
  radius: {
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,
    xxl:  28,
    full: 9999,
  },

  // ── Shadows ────────────────────────────────────────────────────────────────
  shadows: {
    panel:      "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
    slideCard:  "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)",
    cyanGlow:   "0 0 24px rgba(34,211,238,0.14)",
    cyanStrong: "0 0 40px rgba(34,211,238,0.22)",
    btnHover:   "0 8px 32px rgba(34,211,238,0.22), 0 0 0 1px rgba(34,211,238,0.3)",
    navBtn:     "0 0 16px rgba(34,211,238,0.12)",
  },

  // ── Transitions ────────────────────────────────────────────────────────────
  transition: {
    fast:   "all 0.15s ease",
    base:   "all 0.22s ease",
    slow:   "all 0.35s ease",
  },

  // ── CSS class name map ─────────────────────────────────────────────────────
  cx: {
    root:        "ds-root",
    glassPanel:  "ds-glass-panel",
    glassCard:   "ds-glass-card",
    slideNavBtn: "ds-slide-nav-btn",
    divider:     "ds-divider",
    fadeUp1:     "ds-fade-up ds-fade-up-1",
    fadeUp2:     "ds-fade-up ds-fade-up-2",
    fadeUp3:     "ds-fade-up ds-fade-up-3",
    fadeUp4:     "ds-fade-up ds-fade-up-4",
    pulseDot:    "ds-pulse-dot",
    btnPrimary:  "ds-btn-primary",
    sessionLive: "ds-session-live",
    liveDot:     "ds-session-live-dot",
    starsLayer:  "ds-stars-layer",
    grainLayer:  "ds-grain-layer",
  },
};