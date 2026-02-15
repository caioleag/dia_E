"use client";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";

export default function EncerradaPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6" aria-hidden="true">
          ✨
        </div>
        <h1 className="font-display text-3xl font-bold text-text-primary mb-3">
          Jogo encerrado
        </h1>
        <p className="font-sans text-text-secondary text-sm mb-10">
          Obrigado por jogar! Espero que tenha sido inesquecível.
        </p>
        <Button onClick={() => router.push("/")} className="w-full">
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}
