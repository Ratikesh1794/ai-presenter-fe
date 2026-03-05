import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type VoiceState = "idle" | "listening" | "speaking";

interface UseVoiceOptions {
  onTranscript: (text: string) => void;
  onInterrupt: () => void;
  enabled?: boolean;
}

// ─── Web Speech API type augmentation ─────────────────────────────────────────

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useVoice({ onTranscript, onInterrupt, enabled = true }: UseVoiceOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [isSupported, setIsSupported] = useState(false);
  const [volume, setVolume] = useState(0); // 0–1 for visualizer

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isSpeakingRef = useRef(false);
  const isListeningRef = useRef(false);

  // Audio analyser for volume visualisation
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const onTranscriptRef = useRef(onTranscript);
  const onInterruptRef = useRef(onInterrupt);
  onTranscriptRef.current = onTranscript;
  onInterruptRef.current = onInterrupt;

  // ── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    synthRef.current = window.speechSynthesis;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ")
        .trim();

      if (transcript) {
        onTranscriptRef.current(transcript);
      }
    };

    recognition.onerror = (e) => {
      console.warn("[STT] Error:", e);
      setVoiceState("idle");
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      if (voiceStateRef.current === "listening") {
        setVoiceState("idle");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep a ref to voiceState to avoid stale closure in recognition.onend
  const voiceStateRef = useRef<VoiceState>("idle");
  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // ── Volume analyser ───────────────────────────────────────────────────────

  const startVolumeTracking = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      micStreamRef.current = stream;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((s, v) => s + v, 0) / data.length;
        setVolume(avg / 128); // normalise to 0–1
        animFrameRef.current = requestAnimationFrame(tick);
      };

      animFrameRef.current = requestAnimationFrame(tick);
    } catch {
      console.warn("[VAD] Microphone access denied");
    }
  }, []);

  const stopVolumeTracking = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    audioContextRef.current = null;
    analyserRef.current = null;
    micStreamRef.current = null;
    setVolume(0);
  }, []);

  // ── STT controls ─────────────────────────────────────────────────────────

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || !enabled) return;
    if (isListeningRef.current) return;

    // Interrupt TTS if playing
    if (isSpeakingRef.current) {
      synthRef.current?.cancel();
      isSpeakingRef.current = false;
      onInterruptRef.current();
    }

    await startVolumeTracking();
    setVoiceState("listening");
    isListeningRef.current = true;

    try {
      recognitionRef.current.start();
    } catch {
      // already started
    }
  }, [enabled, startVolumeTracking]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    isListeningRef.current = false;
    stopVolumeTracking();
    setVoiceState("idle");
  }, [stopVolumeTracking]);

  // ── TTS controls ─────────────────────────────────────────────────────────

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!synthRef.current || !enabled) return;

      // cancel any in-progress speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1;
      utterance.volume = 1;

      // pick a decent voice if available
      const voices = synthRef.current.getVoices();
      const preferred = voices.find(
        (v) => v.lang === "en-US" && v.name.toLowerCase().includes("google")
      );
      if (preferred) utterance.voice = preferred;

      utterance.onstart = () => {
        isSpeakingRef.current = true;
        setVoiceState("speaking");
      };

      utterance.onend = () => {
        isSpeakingRef.current = false;
        setVoiceState("idle");
        onEnd?.();
      };

      utterance.onerror = () => {
        isSpeakingRef.current = false;
        setVoiceState("idle");
      };

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    },
    [enabled]
  );

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    isSpeakingRef.current = false;
    setVoiceState("idle");
  }, []);

  const interrupt = useCallback(() => {
    stopSpeaking();
    onInterruptRef.current();
  }, [stopSpeaking]);

  // ── Cleanup ───────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopVolumeTracking();
      synthRef.current?.cancel();
    };
  }, [stopVolumeTracking]);

  return {
    voiceState,
    isSupported,
    volume,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    interrupt,
    isSpeaking: voiceState === "speaking",
    isListening: voiceState === "listening",
  };
}