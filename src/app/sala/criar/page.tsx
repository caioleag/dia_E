"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { ArrowLeft, Users, Heart } from "lucide-react";
import { type Modo } from "@/types";
import { criarSala } from "@/lib/sala";

export default function CriarSalaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [modo, setModo] = useState<Modo>("grupo");
  const [loading, setLoading] = useState(false);

  async function handleCriar() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const sala = await criarSala(modo, user.id);
      router.push(`/sala/${sala.codigo}/lobby`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col px-6">
      <header className="flex items-center gap-3 pt-safe py-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-bg-elevated transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-text-secondary" />
        </button>
        <h1 className="font-display text-xl font-bold text-text-primary">Nova Sala</h1>
      </header>

      <main className="flex-1 flex flex-col justify-center gap-8 max-w-sm mx-auto w-full">
        <div>
          <p className="font-sans text-text-secondary text-sm text-center mb-6">
            Escolha o modo de jogo
          </p>

          <div className="flex flex-col gap-3">
            {/* Grupo */}
            <button
              onClick={() => setModo("grupo")}
              className={`w-full flex items-center gap-4 p-5 rounded-card border-2 transition-all ${
                modo === "grupo"
                  ? "border-brand-lilac bg-bg-elevated shadow-glow-soft"
                  : "border-border-subtle bg-bg-surface hover:border-brand-purple/50"
              }`}
              aria-pressed={modo === "grupo"}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  modo === "grupo" ? "bg-gradient-brand" : "bg-bg-elevated"
                }`}
              >
                <Users size={24} className={modo === "grupo" ? "text-white" : "text-text-secondary"} />
              </div>
              <div className="text-left">
                <p className={`font-sans text-base font-medium ${modo === "grupo" ? "text-text-primary" : "text-text-secondary"}`}>
                  Modo Grupo
                </p>
                <p className="font-sans text-xs text-text-disabled mt-0.5">
                  Mínimo 3 jogadores
                </p>
              </div>
              {modo === "grupo" && (
                <div className="ml-auto w-5 h-5 rounded-full bg-brand-lilac flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>

            {/* Casal */}
            <button
              onClick={() => setModo("casal")}
              className={`w-full flex items-center gap-4 p-5 rounded-card border-2 transition-all ${
                modo === "casal"
                  ? "border-brand-pink bg-bg-elevated shadow-glow-soft"
                  : "border-border-subtle bg-bg-surface hover:border-brand-wine/50"
              }`}
              aria-pressed={modo === "casal"}
              style={modo === "casal" ? { boxShadow: "0 0 12px rgba(236, 72, 153, 0.2)" } : {}}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  modo === "casal" ? "bg-gradient-casal" : "bg-bg-elevated"
                }`}
              >
                <Heart size={24} className={modo === "casal" ? "text-white" : "text-text-secondary"} />
              </div>
              <div className="text-left">
                <p className={`font-sans text-base font-medium ${modo === "casal" ? "text-text-primary" : "text-text-secondary"}`}>
                  Modo Casal
                </p>
                <p className="font-sans text-xs text-text-disabled mt-0.5">
                  Exatamente 2 jogadores
                </p>
              </div>
              {modo === "casal" && (
                <div className="ml-auto w-5 h-5 rounded-full bg-brand-pink flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </button>
          </div>
        </div>

        <Button onClick={handleCriar} loading={loading} className="w-full">
          Criar Sala
        </Button>
      </main>
    </div>
  );
}
