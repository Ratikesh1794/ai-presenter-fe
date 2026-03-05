import { useCallback, useRef, useState } from "react";
import type { Slide } from "../slides/slideData";
import { uploadPresentation } from "../slides/slideData";
import { theme } from "../theme";
import { GlobalStyles } from "../theme.styles";
import { Logo } from "./common/Logo";

interface UploadScreenProps {
  onLoaded: (slides: Slide[], sessionId: string) => void;
}

type UploadState = "idle" | "dragging" | "uploading" | "error";

// ── State-dependent visual config ─────────────────────────────────────────────
const STATE_CONFIG = {
  idle: {
    borderColor: theme.colors.white["10"],
    background: theme.colors.white["03"],
    boxShadow: "none",
  },
  dragging: {
    borderColor: theme.colors.cyan["400"],
    background: theme.colors.cyan.faint,
    boxShadow: `0 0 48px ${theme.colors.cyan.soft}`,
  },
  uploading: {
    borderColor: "rgba(147,197,253,0.35)",
    background: "rgba(147,197,253,0.04)",
    boxShadow: "0 0 40px rgba(147,197,253,0.10)",
  },
  error: {
    borderColor: theme.colors.red.border,
    background: theme.colors.red.soft,
    boxShadow: "none",
  },
};

export function UploadScreen({ onLoaded }: UploadScreenProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── File handler — logic unchanged ────────────────────────────────────────
  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".pptx")) {
        setErrorMsg("Only .pptx files are supported.");
        setUploadState("error");
        return;
      }
      setFileName(file.name);
      setUploadState("uploading");
      setProgress(0);

      const interval = setInterval(
        () => setProgress((p) => Math.min(p + 8, 85)),
        200,
      );

      try {
        console.log("[UploadScreen] Starting upload...");
        const result = await uploadPresentation(file);
        clearInterval(interval);
        setProgress(100);

        console.log("[UploadScreen] Upload success:", {
          session_id: result.session_id,
          slideCount: result.slides.length,
        });

        setTimeout(() => {
          console.log(
            "[UploadScreen] Calling onLoaded with session_id:",
            result.session_id,
          );
          onLoaded(result.slides, result.session_id);
        }, 400);
      } catch (err) {
        clearInterval(interval);
        const msg = err instanceof Error ? err.message : "Upload failed.";
        console.error("[UploadScreen] Upload error:", msg);
        setErrorMsg(msg);
        setUploadState("error");
      }
    },
    [onLoaded],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setUploadState("idle");
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const isClickable = uploadState === "idle" || uploadState === "error";
  const visual = STATE_CONFIG[uploadState];

  return (
    <>
      <GlobalStyles />

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: theme.colors.bg.root,
          fontFamily: theme.fonts.display,
          position: "relative",
          isolation: "isolate",
        }}
      >
        {/* Atmospheric layers */}
        <div className="ds-nebula ds-nebula-1" />
        <div className="ds-nebula ds-nebula-2" />
        <div className="ds-nebula ds-nebula-3" />
        <div className="ds-stars-layer" />
        <div className="ds-grain-layer" />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* ── Header copy ───────────────────────────────────────────────── */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            {/* Logo */}
            <div style={{ marginBottom: 20 }}>
              <Logo size="md" variant="simple" />
            </div>

            <h1
              style={{
                fontFamily: theme.fonts.display,
                fontWeight: 700,
                fontSize: clamp(36, 52),
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: theme.colors.white["90"],
                marginBottom: 14,
              }}
            >
              Upload your deck
            </h1>
            <p
              style={{
                fontFamily: theme.fonts.display,
                fontSize: theme.text.md.fontSize,
                color: theme.colors.white["30"],
                lineHeight: 1.5,
              }}
            >
              Drop a .pptx and let the AI present it for you
            </p>
          </div>

          {/* ── Drop zone ─────────────────────────────────────────────────── */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setUploadState("dragging");
            }}
            onDragLeave={() => setUploadState("idle")}
            onDrop={onDrop}
            onClick={() => isClickable && inputRef.current?.click()}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 480,
              minHeight: 280,
              borderRadius: theme.radius.xxl,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: isClickable ? "pointer" : "default",
              border: `1.5px dashed ${visual.borderColor}`,
              background: visual.background,
              boxShadow: visual.boxShadow,
              backdropFilter: "blur(20px)",
              transition: theme.transition.slow,
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pptx"
              style={{ display: "none" }}
              onChange={onInputChange}
            />

            {/* ── IDLE / DRAGGING ────────────────────────────────────────── */}
            {(uploadState === "idle" || uploadState === "dragging") && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  padding: "32px 24px",
                  textAlign: "center",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: theme.radius.lg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    background:
                      uploadState === "dragging"
                        ? theme.colors.cyan.soft
                        : theme.colors.white["05"],
                    border: `1px solid ${uploadState === "dragging" ? theme.colors.cyan.borderSoft : theme.colors.white["07"]}`,
                    transform:
                      uploadState === "dragging" ? "scale(1.1)" : "scale(1)",
                    transition: theme.transition.base,
                    boxShadow:
                      uploadState === "dragging"
                        ? theme.shadows.cyanGlow
                        : "none",
                  }}
                >
                  {uploadState === "dragging" ? "📂" : "📎"}
                </div>

                <div>
                  <p
                    style={{
                      fontFamily: theme.fonts.display,
                      fontWeight: 600,
                      fontSize: theme.text.md.fontSize,
                      color: theme.colors.white["90"],
                      marginBottom: 6,
                    }}
                  >
                    {uploadState === "dragging"
                      ? "Release to upload"
                      : "Drag & drop your .pptx"}
                  </p>
                  <p
                    style={{
                      fontFamily: theme.fonts.display,
                      fontSize: theme.text.sm.fontSize,
                      color: theme.colors.white["30"],
                    }}
                  >
                    or click to browse
                  </p>
                </div>

                {/* Pill tag */}
                <div
                  style={{
                    padding: "5px 14px",
                    borderRadius: theme.radius.full,
                    background: theme.colors.white["03"],
                    border: `1px solid ${theme.colors.white["07"]}`,
                    fontFamily: theme.fonts.mono,
                    fontSize: theme.text.xxs.fontSize,
                    letterSpacing: "0.1em",
                    color: theme.colors.white["30"],
                  }}
                >
                  .pptx only · max 50 MB
                </div>
              </div>
            )}

            {/* ── UPLOADING ─────────────────────────────────────────────── */}
            {uploadState === "uploading" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 20,
                  padding: "32px 24px",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: theme.radius.lg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    background: "rgba(147,197,253,0.10)",
                    border: "1px solid rgba(147,197,253,0.25)",
                  }}
                >
                  📊
                </div>

                <div style={{ width: "100%", textAlign: "center" }}>
                  <p
                    style={{
                      fontFamily: theme.fonts.display,
                      fontWeight: 600,
                      fontSize: theme.text.base.fontSize,
                      color: theme.colors.white["90"],
                      marginBottom: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      padding: "0 16px",
                    }}
                  >
                    {fileName}
                  </p>
                  <p
                    style={{
                      fontFamily: theme.fonts.mono,
                      fontSize: theme.text.xxs.fontSize,
                      letterSpacing: "0.1em",
                      color: theme.colors.white["30"],
                      marginBottom: 20,
                    }}
                  >
                    Parsing slides…
                  </p>

                  {/* Progress track */}
                  <div style={{ maxWidth: 240, margin: "0 auto" }}>
                    <div
                      style={{
                        width: "100%",
                        height: 3,
                        borderRadius: theme.radius.full,
                        background: theme.colors.white["05"],
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${progress}%`,
                          borderRadius: theme.radius.full,
                          background: `linear-gradient(90deg, ${theme.colors.cyan["400"]}, ${theme.colors.emerald["400"]})`,
                          boxShadow: `0 0 10px ${theme.colors.cyan.glow}`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <p
                      style={{
                        fontFamily: theme.fonts.mono,
                        fontSize: theme.text.xxs.fontSize,
                        letterSpacing: "0.1em",
                        color: `${theme.colors.cyan["400"]}70`,
                        marginTop: 8,
                      }}
                    >
                      {progress}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── ERROR ─────────────────────────────────────────────────── */}
            {uploadState === "error" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 14,
                  padding: "32px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: theme.radius.lg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    background: theme.colors.red.soft,
                    border: `1px solid ${theme.colors.red.border}`,
                  }}
                >
                  ⚠️
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: theme.fonts.display,
                      fontWeight: 600,
                      fontSize: theme.text.base.fontSize,
                      color: theme.colors.white["90"],
                      marginBottom: 6,
                    }}
                  >
                    Upload failed
                  </p>
                  <p
                    style={{
                      fontFamily: theme.fonts.display,
                      fontSize: theme.text.sm.fontSize,
                      color: theme.colors.red["400"],
                      marginBottom: 10,
                    }}
                  >
                    {errorMsg}
                  </p>
                  <p
                    style={{
                      fontFamily: theme.fonts.mono,
                      fontSize: theme.text.xxs.fontSize,
                      letterSpacing: "0.08em",
                      color: theme.colors.white["30"],
                    }}
                  >
                    Click to try again
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer note ───────────────────────────────────────────────── */}
          <p
            style={{
              marginTop: 32,
              fontFamily: theme.fonts.mono,
              fontSize: theme.text.xxs.fontSize,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: theme.colors.white["18"],
            }}
          >
            Powered by GPT-4o · Chrome recommended for voice
          </p>
        </div>
      </div>
    </>
  );
}

// Small utility for responsive font size without CSS clamp support in inline styles
function clamp(min: number, preferred: number): number {
  return typeof window !== "undefined" && window.innerWidth < 640
    ? min
    : preferred;
}
