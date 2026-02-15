"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import PlayerList from "@/components/lobby/PlayerList";
import RoomCode from "@/components/lobby/RoomCode";
import dynamic from "next/dynamic";
import { ArrowLeft, Users } from "lucide-react";
import { type Sala, type User, type SalaJogador } from "@/types";
import { encerrarSala, iniciarJogo } from "@/lib/sala";

const QRCodeDisplay = dynamic(() => import("@/components/lobby/QRCodeDisplay"), { ssr: false });

export default function LobbyPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [sala, setSala] = useState<Sala | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadData();
  }, [codigo]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setCurrentUserId(user.id);

    const { data: salaData } = await supabase
      .from("salas")
      .select("*")
      .eq("codigo", codigo)
      .single();

    if (!salaData) { router.push("/"); return; }
    // Only host sees lobby
    if (salaData.host_id !== user.id) {
      router.push(`/sala/${codigo}/espera`);
      return;
    }
    setSala(salaData as Sala);
    await loadPlayers(salaData.id);
    setupRealtime(salaData.id);
    setLoading(false);
  }

  async function loadPlayers(salaId: string) {
    const { data } = await supabase
      .from("sala_jogadores")
      .select("user_id, users(*)")
      .eq("sala_id", salaId);

    if (data) {
      const playerUsers = data
        .map((sj: SalaJogador & { users: User }) => sj.users)
        .filter(Boolean);
      setPlayers(playerUsers);
    }
  }

  function setupRealtime(salaId: string) {
    const channel = supabase
      .channel(`lobby-${salaId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sala_jogadores",
          filter: `sala_id=eq.${salaId}`,
        },
        async () => {
          await loadPlayers(salaId);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  async function handleIniciar() {
    if (!sala) return;
    setStarting(true);
    await iniciarJogo(sala.id);
    router.push(`/sala/${codigo}/jogo`);
  }

  async function handleCancelar() {
    if (!sala) return;
    setCancelling(true);
    await encerrarSala(sala.id);
    router.push("/");
  }

  const minPlayers = sala?.modo === "casal" ? 2 : 3;
  const maxReached = sala?.modo === "casal" ? players.length === 2 : true;
  const canStart =
    sala?.modo === "casal"
      ? players.length === 2
      : players.length >= 3;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-lilac border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col px-6">
      <header className="flex items-center gap-3 pt-safe py-4">
        <button
          onClick={() => router.push("/")}
          className="p-2 -ml-2 rounded-full hover:bg-bg-elevated transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold text-text-primary capitalize">
            Lobby — Modo {sala?.modo}
          </h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6 py-4 overflow-y-auto">
        {/* Room code + QR */}
        <div className="flex flex-col items-center gap-6">
          <RoomCode codigo={codigo} />
          <QRCodeDisplay codigo={codigo} />
        </div>

        {/* Players */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-text-secondary" />
            <span className="font-sans text-sm text-text-secondary">
              {players.length} jogador{players.length !== 1 ? "es" : ""}
              {sala?.modo === "casal" ? " / 2 necessários" : " / mínimo 3"}
            </span>
          </div>
          <PlayerList players={players} hostId={sala?.host_id} />
        </div>
      </main>

      <div className="pb-safe flex flex-col gap-3 py-4">
        <button
          onClick={handleCancelar}
          disabled={cancelling}
          className="text-text-secondary font-sans text-sm text-center py-2 hover:text-brand-red transition-colors disabled:opacity-50"
        >
          {cancelling ? "Cancelando..." : "Cancelar Sala"}
        </button>
        <Button
          onClick={handleIniciar}
          loading={starting}
          disabled={!canStart}
          className="w-full"
          size="lg"
        >
          Iniciar Jogo
        </Button>
        {!canStart && (
          <p className="font-sans text-xs text-text-disabled text-center">
            {sala?.modo === "casal"
              ? `Aguardando ${2 - players.length} jogador${2 - players.length !== 1 ? "es" : ""}`
              : `Aguardando mais ${Math.max(0, 3 - players.length)} jogador${Math.max(0, 3 - players.length) !== 1 ? "es" : ""}`}
          </p>
        )}
      </div>
    </div>
  );
}
