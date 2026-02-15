"use client";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  codigo: string;
}

export default function QRCodeDisplay({ codigo }: QRCodeDisplayProps) {
  if (typeof window === "undefined") return null;
  const url = `${window.location.origin}/sala/${codigo}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="bg-white p-4 rounded-2xl">
        <QRCodeSVG
          value={url}
          size={160}
          level="M"
          includeMargin={false}
        />
      </div>
      <p className="font-sans text-xs text-text-disabled text-center">
        Escaneie para entrar na sala
      </p>
    </div>
  );
}
