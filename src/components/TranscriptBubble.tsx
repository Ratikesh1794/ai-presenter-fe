import { theme } from "../theme";

interface TranscriptBubbleProps {
  userText: string;
  agentText: string;
  accent: string;
}

export function TranscriptBubble({ userText, agentText, accent }: TranscriptBubbleProps) {
  if (!userText && !agentText) return null;

  return (
    <div
      style={{
        display:   "flex",
        flexDirection: "column",
        gap:       8,
        width:     "100%",
      }}
    >
      {/* ── User bubble (right-aligned) ─────────────────────────────────── */}
      {userText && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              maxWidth:     "84%",
              padding:      "9px 13px",
              borderRadius: `${theme.radius.lg}px ${theme.radius.lg}px ${theme.radius.sm}px ${theme.radius.lg}px`,
              background:   theme.colors.white["07"],
              border:       `1px solid ${theme.colors.white["10"]}`,
              fontFamily:   theme.fonts.display,
              fontSize:     theme.text.sm.fontSize,
              color:        theme.colors.white["90"],
              lineHeight:   1.55,
            }}
          >
            {userText}
          </div>
        </div>
      )}

      {/* ── Agent bubble (left-aligned) ─────────────────────────────────── */}
      {agentText && (
        <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end", gap: 7 }}>
          {/* Agent avatar dot */}
          <div
            style={{
              width:        20,
              height:       20,
              borderRadius: "50%",
              background:   `${accent}18`,
              border:       `1px solid ${accent}35`,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
              flexShrink:   0,
              marginBottom: 2,
            }}
          >
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none">
              <polygon points="5,3 19,12 5,21" fill={accent} opacity="0.9" />
            </svg>
          </div>

          <div
            style={{
              maxWidth:     "84%",
              padding:      "9px 13px",
              borderRadius: `${theme.radius.lg}px ${theme.radius.lg}px ${theme.radius.lg}px ${theme.radius.sm}px`,
              background:   `${accent}10`,
              border:       `1px solid ${accent}22`,
              fontFamily:   theme.fonts.display,
              fontSize:     theme.text.sm.fontSize,
              color:        "rgba(220,230,240,0.90)",
              lineHeight:   1.55,
            }}
          >
            {agentText}
          </div>
        </div>
      )}
    </div>
  );
}