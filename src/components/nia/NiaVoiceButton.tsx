"use client";

import { useEffect, useState } from "react";

interface Props { text: string; className?: string; }

export default function NiaVoiceButton({ text, className = "" }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => { setSupported("speechSynthesis" in window); return () => { window.speechSynthesis?.cancel(); }; }, []);

  const toggle = () => {
    if (!supported) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const next = !enabled;
    setEnabled(next);
    if (!next) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.pitch = 1.02;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return <button suppressHydrationWarning type="button" disabled={!supported} onClick={toggle} className={className} aria-label={enabled ? "Desligar voz pública do NIA" : "Ouvir resposta do NIA"}>{speaking ? "NIA falando" : enabled ? "Voz do NIA ligada" : "Ouvir NIA"}</button>;
}
