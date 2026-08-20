"use client";

import { useEffect, useState, useRef } from "react";

interface Props {
  text: string;
  className?: string;
  modelId?: string;
}

export default function NiaVoiceStreamButton({ text, className = "", modelId }: Props) {
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = async () => {
    if (speaking) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setSpeaking(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/nia/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, modelId }),
      });

      const contentType = response.headers.get("content-type");

      if (response.ok && contentType && contentType.includes("audio")) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => setSpeaking(true);
        audio.onended = () => {
          setSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audio.onerror = () => {
          fallbackSpeech();
        };
        await audio.play();
      } else {
        fallbackSpeech();
      }
    } catch {
      fallbackSpeech();
    } finally {
      setLoading(false);
    }
  };

  const fallbackSpeech = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "pt-BR";
      utterance.rate = 0.95;
      utterance.pitch = 1.02;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setSpeaking(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void speak()}
      className={`flex items-center gap-2 transition-all active:scale-95 ${className}`}
      aria-label="Ouvir resposta da NIA com Fish Audio"
    >
      <span className="text-base">{speaking ? "🔊" : "🎤"}</span>
      <span>
        {loading
          ? "Gerando Voz..."
          : speaking
          ? "NIA Falando..."
          : "Ouvir NIA (Fish Audio)"}
      </span>
    </button>
  );
}
