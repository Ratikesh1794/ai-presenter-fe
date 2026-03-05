import { useCallback, useRef, useState } from "react";
import type { Slide } from "../slides/slideData";
import { uploadPresentation } from "../slides/slideData";

interface UploadScreenProps {
  onLoaded: (slides: Slide[], sessionId: string) => void;
}

type UploadState = "idle" | "dragging" | "uploading" | "error";

export function UploadScreen({ onLoaded }: UploadScreenProps) {
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

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

        // Small delay to show 100% then transition
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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, #1a1f35 0%, #080a10 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div className="text-center mb-12">
        <p
          className="text-xs font-mono tracking-[0.3em] uppercase mb-4"
          style={{ color: "#6EE7B788" }}
        >
          AI Voice Presenter
        </p>
        <h1
          className="text-5xl font-bold text-white mb-4"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Upload your deck
        </h1>
        <p className="text-gray-500 text-base">
          Drop a .pptx and let the AI present it for you
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setUploadState("dragging");
        }}
        onDragLeave={() => setUploadState("idle")}
        onDrop={onDrop}
        onClick={() => isClickable && inputRef.current?.click()}
        className="relative w-full max-w-lg rounded-2xl flex flex-col items-center justify-center transition-all duration-300"
        style={{
          minHeight: "280px",
          cursor: isClickable ? "pointer" : "default",
          border: `1.5px dashed ${uploadState === "dragging" ? "#6EE7B7" : uploadState === "error" ? "#F87171" : uploadState === "uploading" ? "#93C5FD" : "#ffffff18"}`,
          background:
            uploadState === "dragging"
              ? "#6EE7B714"
              : uploadState === "uploading"
                ? "#93C5FD08"
                : "#ffffff04",
          boxShadow:
            uploadState === "dragging"
              ? "0 0 40px #6EE7B720"
              : uploadState === "uploading"
                ? "0 0 40px #93C5FD18"
                : "none",
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pptx"
          className="hidden"
          onChange={onInputChange}
        />

        {(uploadState === "idle" || uploadState === "dragging") && (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-200"
              style={{
                background:
                  uploadState === "dragging" ? "#6EE7B722" : "#ffffff08",
                border: `1px solid ${uploadState === "dragging" ? "#6EE7B740" : "#ffffff14"}`,
                transform:
                  uploadState === "dragging" ? "scale(1.1)" : "scale(1)",
              }}
            >
              {uploadState === "dragging" ? "📂" : "📎"}
            </div>
            <div>
              <p className="text-white font-medium mb-1">
                {uploadState === "dragging"
                  ? "Release to upload"
                  : "Drag & drop your .pptx"}
              </p>
              <p className="text-gray-600 text-sm">or click to browse</p>
            </div>
            <div
              className="px-4 py-1.5 rounded-full text-xs font-mono tracking-wide"
              style={{
                background: "#ffffff08",
                color: "#ffffff40",
                border: "1px solid #ffffff10",
              }}
            >
              .pptx only · max 50 MB
            </div>
          </div>
        )}

        {uploadState === "uploading" && (
          <div className="flex flex-col items-center gap-6 p-8 w-full">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: "#93C5FD14", border: "1px solid #93C5FD30" }}
            >
              📊
            </div>
            <div className="w-full text-center">
              <p className="text-white font-medium mb-1 truncate px-4">
                {fileName}
              </p>
              <p className="text-gray-500 text-sm mb-4">Parsing slides…</p>
              <div
                className="w-full h-1 rounded-full mx-auto"
                style={{ background: "#ffffff0a", maxWidth: "240px" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: "linear-gradient(90deg, #93C5FD, #6EE7B7)",
                    boxShadow: "0 0 8px #93C5FD80",
                  }}
                />
              </div>
              <p
                className="text-xs font-mono mt-2"
                style={{ color: "#93C5FD88" }}
              >
                {progress}%
              </p>
            </div>
          </div>
        )}

        {uploadState === "error" && (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: "#F8717114", border: "1px solid #F8717130" }}
            >
              ⚠️
            </div>
            <div>
              <p className="text-white font-medium mb-1">Upload failed</p>
              <p className="text-sm mb-4" style={{ color: "#F87171" }}>
                {errorMsg}
              </p>
              <p className="text-gray-600 text-xs">Click to try again</p>
            </div>
          </div>
        )}
      </div>

      <p
        className="mt-8 text-xs font-mono tracking-widest uppercase"
        style={{ color: "#ffffff18" }}
      >
        Powered by GPT-4o · Chrome recommended for voice
      </p>
    </div>
  );
}
