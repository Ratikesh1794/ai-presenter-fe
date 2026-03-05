// ─── Types ────────────────────────────────────────────────────────────────────

export interface ParsedSlide {
  id: number;
  title: string;
  subtitle: string;
  bullets: string[];
  notes: string;
}

export interface Slide extends ParsedSlide {
  accent: string;
  icon: string;
}

export interface UploadResult {
  session_id: string;
  slides: Slide[];
}

// ─── Visual palette ───────────────────────────────────────────────────────────

const ACCENTS = [
  "#6EE7B7",
  "#93C5FD",
  "#F9A8D4",
  "#FCD34D",
  "#C4B5FD",
  "#6EE7F7",
  "#FCA5A5",
  "#86EFAC",
];

const ICONS = ["🧠", "📦", "⚡", "🔄", "⚖️", "🚀", "🔬", "🌐", "💡", "🎯"];

export function enrichSlides(parsed: ParsedSlide[]): Slide[] {
  return parsed.map((s, i) => ({
    ...s,
    accent: ACCENTS[i % ACCENTS.length],
    icon: ICONS[i % ICONS.length],
  }));
}

// ─── API call ─────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function uploadPresentation(file: File): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? `Upload failed: ${res.status}`);
  }

  const body = await res.json();
  return {
    session_id: body.session_id,
    slides: enrichSlides(body.slides),
  };
}