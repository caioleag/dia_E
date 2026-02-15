"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import { type User, type SalaJogador } from "@/types";

export default function EsperaPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [hostName, setHostName] = useState<string>("");
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupPage();
  }, [codigo]);

  async function setupPage() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: sala } = await supabase
      .from("salas")
      .select("*, users!salas_host_id_fkey(nome)")
      .eq("codigo", codigo)
      .single();

    if (!sala) { router.push("/"); return; }

    if (sala.status === "em_jogo") {
      router.push(`/sala/${codigo}/jogo`);
      return;
    }

    if (sala.status === "encerrada") {
      router.push(`/sala/${codigo}/encerrada`);
      return;
    }

    setHostName((sala.users as { nome: string })?.nome ?? "Host");
    await loadPlayers(sala.id);
    setupRealtime(sala.id, codigo);
    setLoading(false);
  }

  async function loadPlayers(salaId: string) {
    const { data } = await supabase
      .from("sala_jogadores")
      .select("user_id, users(*)")
      .eq("sala_id", salaId);

    if (data) {
      const playerUsers = data.map((sj: SalaJogador & { users: User }) => sj.users).filter(Boolean);
      setPlayers(playerUsers);
    }
  }

  function setupRealtime(salaId: string, salaCode: string) {
    // Listen for new players
    const playersChannel = supabase
      .channel(`espera-players-${salaId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sala_jogadores", filter: `sala_id=eq.${salaId}` },
        () => loadPlayers(salaId)
      )
      .subscribe();

    // Listen for game start
    const salaChannel = supabase
      .channel(`espera-sala-${salaId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "salas", filter: `id=eq.${salaId}` },
        (payload) => {
          const updated = payload.new as { status: string };
          if (updated.status === "em_jogo") {
            router.push(`/sala/${salaCode}/jogo`);
          } else if (updated.status === "encerrada") {
            router.push(`/sala/${salaCode}/encerrada`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(salaChannel);
    };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-lilac border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col items-center px-6 py-safe">
      <main className="flex-1 flex flex-col items-center justify-center gap-8 w-full max-w-sm">
        {/* Status */}
        <div className="text-center">
          <div className="text-4xl mb-4" aria-hidden="true">🎲</div>
          <h1 className="font-display text-2xl font-bold text-text-primary mb-2">
            Você está na sala de
          </h1>
          <p className="font-display text-3xl font-bold gradient-text">
            {hostName}
          </p>
        </div>

        {/* Players */}
        <div className="w-full">
          <p className="font-sans text-xs text-text-secondary uppercase tracking-widest mb-3 text-center">
            {players.length} jogador{players.length !== 1 ? "es" : ""} na sala
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {players.map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-1 animate-fade-slide-in">
                <Avatar src={p.foto_url} alt={p.nome ?? "Jogador"} size="md" />
                <span className="font-sans text-xs text-text-secondary truncate max-w-[60px]">
                  {p.nome?.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Waiting indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-brand-lilac"
                style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
          <p className="font-sans text-sm text-text-secondary">
            Aguardando o host iniciar...
          </p>
        </div>
      </main>

      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
