"use client";
import { use, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type ResumoPart } from "@/types";

export default function EncerradaPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const [resumo, setResumo] = useState<ResumoPart | null>(null);

  useEffect(() => {
    supabase
      .from("salas")
      .select("resumo_partida")
      .eq("codigo", codigo)
      .single()
      .then(({ data }) => {
        if (data?.resumo_partida) setResumo(data.resumo_partida as ResumoPart);
      });
  }, [codigo]);

  const topCategorias = resumo
    ? Object.entries(resumo.categorias)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
    : [];

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-sm w-full">
        <div className="text-6xl mb-6" aria-hidden="true">✨</div>
        <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
          Jogo encerrado
        </h1>
        <p className="font-sans text-text-secondary text-sm mb-8">
          Obrigado por jogar! Espero que tenha sido inesquecível.
        </p>

        {resumo && (
          <div className="bg-bg-surface border border-border-subtle rounded-card p-5 mb-8 text-left flex flex-col gap-4">
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-elevated rounded-xl p-3 text-center">
                <p className="font-display text-2xl font-bold text-text-primary">{resumo.rodadas}</p>
                <p className="font-sans text-xs text-text-disabled mt-0.5">rodadas</p>
              </div>
              <div className="bg-bg-elevated rounded-xl p-3 text-center">
                <p className="font-display text-2xl font-bold text-text-primary">{resumo.pulos}</p>
                <p className="font-sans text-xs text-text-disabled mt-0.5">puladas</p>
              </div>
              <div className="bg-bg-elevated rounded-xl p-3 text-center">
                <p className="font-display text-2xl font-bold text-brand-red">{resumo.penalidades}</p>
                <p className="font-sans text-xs text-text-disabled mt-0.5">penitências</p>
              </div>
              <div className="bg-bg-elevated rounded-xl p-3 text-center">
                <p className="font-display text-2xl font-bold text-brand-lilac">{resumo.vetosUsados}</p>
                <p className="font-sans text-xs text-text-disabled mt-0.5">vetos usados</p>
              </div>
            </div>

            {/* Top categorias */}
            {topCategorias.length > 0 && (
              <div>
                <p className="font-sans text-xs text-text-disabled uppercase tracking-widest mb-2">
                  Categorias mais jogadas
                </p>
                <div className="flex flex-col gap-1.5">
                  {topCategorias.map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="font-sans text-sm text-text-secondary">{cat}</span>
                      <span className="font-sans text-sm font-medium text-text-primary">{count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Button onClick={() => router.push("/")} className="w-full">
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}
