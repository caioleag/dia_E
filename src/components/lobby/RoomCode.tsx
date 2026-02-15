"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface RoomCodeProps {
  codigo: string;
}

export default function RoomCode({ codigo }: RoomCodeProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/sala/${codigo}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-sans text-xs text-text-secondary uppercase tracking-widest">
        Código da sala
      </p>
      <button
        onClick={handleCopy}
        className="flex items-center gap-3 bg-bg-elevated border border-border-subtle rounded-2xl px-8 py-5 hover:border-brand-lilac/50 transition-all active:scale-[0.97]"
        aria-label={`Copiar código ${codigo}`}
      >
        <span className="font-display font-bold text-4xl text-text-primary tracking-[0.2em]">
          {codigo}
        </span>
        <div className={`transition-colors ${copied ? "text-green-400" : "text-text-secondary"}`}>
          {copied ? <Check size={20} /> : <Copy size={20} />}
        </div>
      </button>
      {copied && (
        <p className="font-sans text-xs text-green-400 animate-fade-slide-in">
          Link copiado!
        </p>
      )}
    </div>
  );
}
