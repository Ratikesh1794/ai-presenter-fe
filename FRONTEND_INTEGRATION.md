# Frontend File Map

## New files to add to your project

```
src/
├── slides/
│   └── slideData.ts          ← 6-slide content, types
│
├── hooks/
│   ├── useWebSocket.ts       ← WS connection, reconnect, message protocol
│   ├── useVoice.ts           ← STT (Web Speech API), TTS, VAD, volume
│   └── usePresentation.ts    ← Orchestrator: ties WS + voice together
│
├── components/
│   ├── SlideCard.tsx         ← Animated slide renderer
│   ├── SlideDots.tsx         ← Dot navigation
│   ├── VoiceOrb.tsx          ← Mic button with canvas waveform
│   ├── ConnectionBadge.tsx   ← WS status pill
│   └── TranscriptBubble.tsx  ← User/agent chat bubbles
│
└── pages/
    └── Home.tsx              ← Main page (replace existing)
```

## .env.local
```
VITE_WS_URL=ws://localhost:8000/ws
```

## Keyboard shortcuts
| Key | Action |
|-----|--------|
| `Space` | Toggle listening |
| `→` / `PageDown` | Next slide |
| `←` / `PageUp` | Prev slide |
| `Escape` | Stop listening / interrupt |

## WebSocket message protocol

**Frontend → Backend**
```ts
{ type: "user_speech"; text: string }   // user transcript
{ type: "interrupt" }                    // user interrupted TTS
{ type: "slide_changed"; index: number } // slide changed (manual or agent)
```

**Backend → Frontend**
```ts
{ type: "change_slide"; index: number; reason: string }
{ type: "speak"; text: string }
{ type: "status"; state: "idle" | "listening" | "thinking" | "speaking" }
{ type: "interrupted" }
```
