"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { ArrowLeft, Users, Heart } from "lucide-react";
import { type Modo, type ModoJogo } from "@/types";
import { criarSala } from "@/lib/sala";
import { useSound } from "@/lib/hooks/useSound";

export default function CriarSalaPage() {
  const router = useRouter();
  const supabase = createClient();
  const { play } = useSound();
  const [modo, setModo] = useState<Modo>("grupo");
  const [modoJogo, setModoJogo] = useState<ModoJogo>("online");
  const [punicao, setPunicao] = useState("");
  const [modoEscalada, setModoEscalada] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCriar() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const sala = await criarSala(modo, user.id, modoJogo, punicao.trim() || null, modoEscalada);
      play("success", 0.4);
      router.push(`/sala/${sala.codigo}/lobby`);
    } catch (err) {
      console.error(err);
      play("alert", 0.5);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-fixed bg-bg-deep px-6">
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

      <main className="flex-1 overflow-y-auto flex flex-col gap-5 max-w-sm mx-auto w-full pt-4 pb-6">
        {/* Modo de Jogo: Online ou Solo */}
        <div>
          <p className="font-sans text-text-secondary text-sm text-center mb-3">
            Tipo de sessão
          </p>
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => {
                setModoJogo("online");
                play("click", 0.2);
              }}
              className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-sans text-sm font-medium transition-all ${
                modoJogo === "online"
                  ? "border-brand-lilac bg-bg-elevated text-text-primary"
                  : "border-border-subtle bg-bg-surface text-text-secondary"
              }`}
            >
              Online
            </button>
            <button
              onClick={() => {
                setModoJogo("solo");
                play("click", 0.2);
              }}
              className={`flex-1 px-4 py-2.5 rounded-xl border-2 font-sans text-sm font-medium transition-all ${
                modoJogo === "solo"
                  ? "border-brand-amber bg-bg-elevated text-text-primary"
                  : "border-border-subtle bg-bg-surface text-text-secondary"
              }`}
            >
              Solo
            </button>
          </div>
          <p className="font-sans text-text-disabled text-xs text-center">
            {modoJogo === "online"
              ? "Convide outros jogadores com código ou QR"
              : "Adicione nomes fictícios para jogar sozinho"}
          </p>
        </div>

        <div>
          <p className="font-sans text-text-secondary text-sm text-center mb-3">
            Escolha o modo de jogo
          </p>

          <div className="flex flex-col gap-2.5">
            {/* Grupo */}
            <button
              onClick={() => {
                setModo("grupo");
                play("click", 0.2);
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-card border-2 transition-all ${
                modo === "grupo"
                  ? "border-brand-lilac bg-bg-elevated shadow-glow-soft"
                  : "border-border-subtle bg-bg-surface hover:border-brand-purple/50"
              }`}
              aria-pressed={modo === "grupo"}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  modo === "grupo" ? "bg-gradient-brand" : "bg-bg-elevated"
                }`}
              >
                <Users size={20} className={modo === "grupo" ? "text-white" : "text-text-secondary"} />
              </div>
              <div className="text-left">
                <p className={`font-sans text-sm font-medium ${modo === "grupo" ? "text-text-primary" : "text-text-secondary"}`}>
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
              onClick={() => {
                setModo("casal");
                play("click", 0.2);
              }}
              className={`w-full flex items-center gap-3 p-4 rounded-card border-2 transition-all ${
                modo === "casal"
                  ? "border-brand-pink bg-bg-elevated shadow-glow-soft"
                  : "border-border-subtle bg-bg-surface hover:border-brand-wine/50"
              }`}
              aria-pressed={modo === "casal"}
              style={modo === "casal" ? { boxShadow: "0 0 12px rgba(236, 72, 153, 0.2)" } : {}}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  modo === "casal" ? "bg-gradient-casal" : "bg-bg-elevated"
                }`}
              >
                <Heart size={20} className={modo === "casal" ? "text-white" : "text-text-secondary"} />
              </div>
              <div className="text-left">
                <p className={`font-sans text-sm font-medium ${modo === "casal" ? "text-text-primary" : "text-text-secondary"}`}>
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

        {/* Modo Escalada */}
        <button
          onClick={() => { setModoEscalada((v) => !v); play("click", 0.2); }}
          className={`w-full flex items-center gap-3 p-3.5 rounded-card border-2 transition-all ${
            modoEscalada
              ? "border-brand-amber bg-bg-elevated"
              : "border-border-subtle bg-bg-surface"
          }`}
        >
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${modoEscalada ? "bg-brand-amber/20" : "bg-bg-deep"}`}>
            ⚡
          </div>
          <div className="text-left flex-1">
            <p className={`font-sans text-sm font-medium ${modoEscalada ? "text-text-primary" : "text-text-secondary"}`}>
              Modo Escalada
            </p>
            <p className="font-sans text-xs text-text-disabled mt-0.5">
              Cartas começam suaves e ficam mais intensas
            </p>
          </div>
          <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 ${modoEscalada ? "bg-brand-amber" : "bg-bg-elevated"}`}>
            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mt-0.5 ${modoEscalada ? "translate-x-5.5 ml-0.5" : "ml-0.5"}`} />
          </div>
        </button>

        {/* Punição opcional */}
        <div className="flex flex-col gap-1.5">
          <label className="font-sans text-sm text-text-secondary text-center">
            Punição por pular <span className="text-text-disabled">(opcional)</span>
          </label>
          <input
            type="text"
            value={punicao}
            onChange={(e) => setPunicao(e.target.value)}
            maxLength={100}
            placeholder="Ex: beba um gole, faça 10 flexões..."
            className="w-full px-4 py-2.5 rounded-xl bg-bg-surface border border-border-subtle text-text-primary font-sans text-sm placeholder:text-text-disabled focus:outline-none focus:border-brand-lilac transition-colors"
          />
          <p className="font-sans text-xs text-text-disabled text-center">
            Quem pular recebe uma carta da mesma categoria + essa punição
          </p>
        </div>

        <Button onClick={handleCriar} loading={loading} className="w-full" size="lg">
          Criar Sala
        </Button>
      </main>
    </div>
  );
}
