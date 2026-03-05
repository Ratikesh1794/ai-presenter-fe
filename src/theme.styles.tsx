// ─────────────────────────────────────────────────────────────────────────────
//  Deep Space Studio — Global Styles
//  Render <GlobalStyles /> exactly once, at the top of Home.tsx (or _app.tsx).
//  Defines all CSS animations, utility classes, and atmospheric layers.
// ─────────────────────────────────────────────────────────────────────────────

import { theme } from "./theme";

export const GlobalStyles = () => (
  <style>{`
    @import url('${theme.fonts.googleImport}');

    /* ── CSS custom properties ───────────────────────────────────────────── */
    :root {
      --ds-bg-root:    ${theme.colors.bg.root};
      --ds-bg-surface: ${theme.colors.bg.surface};
      --ds-bg-raised:  ${theme.colors.bg.raised};
      --ds-cyan:       ${theme.colors.cyan["400"]};
      --ds-cyan-300:   ${theme.colors.cyan["300"]};
      --ds-emerald:    ${theme.colors.emerald["400"]};
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; }

    html, body {
      background: var(--ds-bg-root);
      color: ${theme.colors.white["90"]};
      font-family: ${theme.fonts.display};
      -webkit-font-smoothing: antialiased;
    }

    /* ── Scrollbar ───────────────────────────────────────────────────────── */
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb {
      background: ${theme.colors.white["18"]};
      border-radius: 2px;
    }

    /* ── Root wrapper ────────────────────────────────────────────────────── */
    .ds-root { position: relative; isolation: isolate; }

    /* ── Atmospheric nebula orbs ─────────────────────────────────────────── */
    .ds-nebula {
      position: fixed; border-radius: 50%;
      filter: blur(100px); pointer-events: none; z-index: 0;
    }
    .ds-nebula-1 {
      width: 700px; height: 700px; top: -240px; left: -180px;
      background: radial-gradient(circle, rgba(10,22,60,0.75) 0%, transparent 70%);
      animation: ds-drift1 28s ease-in-out infinite alternate;
    }
    .ds-nebula-2 {
      width: 550px; height: 550px; bottom: -120px; right: -120px;
      background: radial-gradient(circle, rgba(5,28,50,0.65) 0%, transparent 70%);
      animation: ds-drift2 34s ease-in-out infinite alternate;
    }
    .ds-nebula-3 {
      width: 340px; height: 340px; top: 38%; left: 48%;
      background: radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%);
      animation: ds-drift3 22s ease-in-out infinite alternate;
    }
    @keyframes ds-drift1 {
      from { transform: translate(0,0) scale(1); }
      to   { transform: translate(70px,50px) scale(1.08); }
    }
    @keyframes ds-drift2 {
      from { transform: translate(0,0); }
      to   { transform: translate(-55px,-35px); }
    }
    @keyframes ds-drift3 {
      from { transform: translate(-50%,-50%) scale(1); }
      to   { transform: translate(-50%,-50%) scale(1.5); }
    }

    /* ── Star field ──────────────────────────────────────────────────────── */
    .ds-stars-layer {
      position: fixed; inset: 0; pointer-events: none; z-index: 0;
      background-image:
        radial-gradient(1px 1px at  8% 18%, rgba(255,255,255,0.32) 0%, transparent 100%),
        radial-gradient(1px 1px at 22% 62%, rgba(255,255,255,0.18) 0%, transparent 100%),
        radial-gradient(1px 1px at 38% 12%, rgba(255,255,255,0.22) 0%, transparent 100%),
        radial-gradient(1px 1px at 52% 78%, rgba(255,255,255,0.14) 0%, transparent 100%),
        radial-gradient(1px 1px at 68% 32%, rgba(255,255,255,0.26) 0%, transparent 100%),
        radial-gradient(1px 1px at 77% 52%, rgba(255,255,255,0.18) 0%, transparent 100%),
        radial-gradient(1px 1px at 88%  8%, rgba(255,255,255,0.20) 0%, transparent 100%),
        radial-gradient(1.5px 1.5px at 14% 88%, rgba(255,255,255,0.15) 0%, transparent 100%),
        radial-gradient(1px 1px at 58% 48%, rgba(34,211,238,0.28) 0%, transparent 100%),
        radial-gradient(1px 1px at 33% 42%, rgba(255,255,255,0.10) 0%, transparent 100%),
        radial-gradient(1px 1px at 44% 70%, rgba(255,255,255,0.13) 0%, transparent 100%),
        radial-gradient(1px 1px at 92% 66%, rgba(255,255,255,0.16) 0%, transparent 100%);
    }

    /* ── Grain overlay ───────────────────────────────────────────────────── */
    .ds-grain-layer {
      position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.45;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      background-size: 180px 180px;
    }

    /* ── Glass surfaces ──────────────────────────────────────────────────── */
    .ds-glass-panel {
      background: linear-gradient(145deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.02) 100%);
      backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: ${theme.radius.xl}px;
    }
    .ds-glass-card {
      background: linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: ${theme.radius.lg}px;
    }

    /* ── Slide nav buttons ───────────────────────────────────────────────── */
    .ds-slide-nav-btn {
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.09);
      transition: ${theme.transition.base}; cursor: pointer; color: white;
    }
    .ds-slide-nav-btn:hover:not(:disabled) {
      background: rgba(34,211,238,0.10);
      border-color: rgba(34,211,238,0.28);
      box-shadow: ${theme.shadows.navBtn};
    }
    .ds-slide-nav-btn:disabled { opacity: 0.18; cursor: not-allowed; }

    /* ── Divider ─────────────────────────────────────────────────────────── */
    .ds-divider {
      width: 100%; height: 1px; flex-shrink: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
    }

    /* ── Fade-up entrance ────────────────────────────────────────────────── */
    @keyframes ds-fade-up {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .ds-fade-up   { animation: ds-fade-up 0.5s ease forwards; }
    .ds-fade-up-1 { animation-delay: 0.04s; opacity: 0; }
    .ds-fade-up-2 { animation-delay: 0.13s; opacity: 0; }
    .ds-fade-up-3 { animation-delay: 0.22s; opacity: 0; }
    .ds-fade-up-4 { animation-delay: 0.31s; opacity: 0; }

    /* ── Pulsing cyan dot ────────────────────────────────────────────────── */
    @keyframes ds-pulse-cyan {
      0%, 100% { box-shadow: 0 0 0 0   rgba(34,211,238,0.5); }
      60%       { box-shadow: 0 0 0 5px rgba(34,211,238,0);   }
    }
    .ds-pulse-dot { animation: ds-pulse-cyan 2s ease-in-out infinite; }

    /* ── Primary button ──────────────────────────────────────────────────── */
    .ds-btn-primary {
      position: relative; overflow: hidden;
      transition: ${theme.transition.base}; cursor: pointer;
    }
    .ds-btn-primary::after {
      content: ''; position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(34,211,238,0.12) 0%, transparent 55%);
      opacity: 0; transition: opacity 0.22s ease;
    }
    .ds-btn-primary:hover:not(:disabled)::after { opacity: 1; }
    .ds-btn-primary:hover:not(:disabled) {
      transform: translateY(-1.5px);
      box-shadow: ${theme.shadows.btnHover};
    }
    .ds-btn-primary:active:not(:disabled) { transform: translateY(0); }
    .ds-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

    /* ── Session live badge ──────────────────────────────────────────────── */
    .ds-session-live { display: inline-flex; align-items: center; gap: 6px; }
    .ds-session-live-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--ds-cyan);
      animation: ds-pulse-cyan 2.2s ease-in-out infinite;
    }
  `}</style>
);
