# PresenterAI Frontend

The frontend is the live stage for PresenterAI. It handles deck upload, renders visual slides, captures audience speech, plays AI narration, and keeps the UI synchronized with backend presentation control events.

## What This App Does

- Accepts `.pptx` upload from the user.
- Displays parsed slides with backend-generated images.
- Opens a persistent WebSocket session with the backend.
- Drives the presentation lifecycle from the browser:
  - start presentation
  - receive slide navigation instructions
  - render narrated text in real time
  - allow voice interruption for doubts
- Uses Web Speech APIs for speech-to-text and text-to-speech.

## Basic System Design

### UI and State Layers

- `src/components/Uploadscreen.tsx`: file upload and upload state UI.
- `src/hooks/usePresentation.ts`: central presentation state orchestration.
- `src/hooks/useWebSocket.ts`: resilient WebSocket client with reconnect logic.
- `src/hooks/useVoice.ts`: browser speech recognition and synthesis integration.
- `src/slides/slideData.ts`: upload API call, data shaping, and slide enrichment.

### Frontend Workflow

1. User uploads a deck from the upload screen.
2. Frontend sends file to backend `POST /upload`.
3. Response returns `session_id` and slide metadata.
4. Frontend opens WebSocket and sends `load_deck`.
5. On user action, frontend sends `start_presentation`.
6. Backend emits `change_slide`, `speak`, and `status`; frontend updates UI and voice playback.
7. If user speaks a question, frontend sends `user_speech`; backend handles interruption and resumes flow.

## Prerequisites

- Node.js 18+ recommended
- pnpm (or npm/yarn, though this project is configured with pnpm lockfile)

## Environment Configuration

Create `frontend/.env` from the example:

```bash
cp .env.example .env
```

Expected variables:

```env
VITE_WS_URL=ws://localhost:8000/ws
VITE_API_URL=http://localhost:8000
```

Use your deployed backend URLs in non-local environments.

## Installation

From the `frontend` directory:

```bash
pnpm install
```

## Run in Development

```bash
pnpm dev
```

Default local URL:
- `http://localhost:5173`

## Build and Preview

```bash
pnpm build
pnpm preview
```

## Browser Notes

- Microphone permissions are required for speech recognition.
- Speech synthesis voice availability depends on browser/OS voice packs.
- For best results, use a Chromium-based browser with Web Speech API support.

## Backend Dependency

This frontend requires the backend service to be running and reachable at:
- `VITE_API_URL`
- `VITE_WS_URL`

If upload works but presentation control does not, verify WebSocket URL and CORS settings on the backend.
