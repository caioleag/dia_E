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
import { useSound } from "@/lib/hooks/useSound";
import AddFictionalPlayers from "@/components/lobby/AddFictionalPlayers";
import { type JogadorFicticio } from "@/types";

const QRCodeDisplay = dynamic(() => import("@/components/lobby/QRCodeDisplay"), { ssr: false });

export default function LobbyPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const { play } = useSound();

  const [sala, setSala] = useState<Sala | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [jogadoresFicticios, setJogadoresFicticios] = useState<JogadorFicticio[]>([]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    loadData().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) cleanup();
    };
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

    // Load fictional players if solo mode
    if (salaData.modo_jogo === "solo" && salaData.jogadores_ficticios) {
      setJogadoresFicticios(salaData.jogadores_ficticios as JogadorFicticio[]);
      setLoading(false);
      return;
    }

    // Online mode - load real players and setup realtime
    await loadPlayers(salaData.id);
    const cleanup = setupRealtime(salaData.id);
    setLoading(false);
    return cleanup;
  }

  async function loadPlayers(salaId: string) {
    const { data } = await supabase
      .from("sala_jogadores")
      .select("user_id, users(*)")
      .eq("sala_id", salaId);

    if (data) {
      const playerUsers = data
        .map((sj: any) => sj.users)
        .filter(Boolean);
      setPlayers(playerUsers);
    }
  }

  function setupRealtime(salaId: string) {
    // Realtime channel for player changes
    const channel = supabase
      .channel(`lobby-${salaId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "sala_jogadores",
          filter: `sala_id=eq.${salaId}`,
        },
        async () => {
          play("click", 0.15);
          await loadPlayers(salaId);
        }
      )
      .subscribe();

    // Fallback polling every 3 seconds to ensure sync
    const pollInterval = setInterval(() => {
      loadPlayers(salaId);
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }

  async function handleIniciar() {
    if (!sala) return;
    setStarting(true);

    // If solo mode, save fictional players before starting
    if (sala.modo_jogo === "solo") {
      await supabase
        .from("salas")
        .update({ jogadores_ficticios: jogadoresFicticios })
        .eq("id", sala.id);
    }

    await iniciarJogo(sala.id);
    play("transition", 0.5);
    router.push(`/sala/${codigo}/jogo`);
  }

  async function handleCancelar() {
    if (!sala) return;
    setCancelling(true);
    await encerrarSala(sala.id);
    router.push("/");
  }

  const minPlayers = sala?.modo === "casal" ? 2 : 3;
  const isSoloMode = sala?.modo_jogo === "solo";
  const playerCount = isSoloMode ? jogadoresFicticios.length : players.length;
  const maxReached = sala?.modo === "casal" ? playerCount === 2 : true;
  const canStart =
    sala?.modo === "casal"
      ? playerCount === 2
      : playerCount >= 3;

  if (loading) {
    return (
      <div className="h-screen bg-bg-deep flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-lilac border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-fixed bg-bg-deep px-6">
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
            <span className="text-sm text-text-disabled font-sans font-normal ml-2">
              ({isSoloMode ? "Solo" : "Online"})
            </span>
          </h1>
        </div>
      </header>

      <main className="scrollable-content flex flex-col gap-6 py-4">
        {isSoloMode ? (
          /* Solo Mode - Add Fictional Players */
          <AddFictionalPlayers
            modo={sala.modo}
            jogadores={jogadoresFicticios}
            onJogadoresChange={setJogadoresFicticios}
          />
        ) : (
          /* Online Mode - Show QR and Players */
          <>
            <div className="flex flex-col items-center gap-6">
              <RoomCode codigo={codigo} />
              <QRCodeDisplay codigo={codigo} />
            </div>

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
          </>
        )}
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
              ? `${isSoloMode ? "Adicione" : "Aguardando"} ${2 - playerCount} jogador${2 - playerCount !== 1 ? "es" : ""}`
              : `${isSoloMode ? "Adicione" : "Aguardando"} mais ${Math.max(0, 3 - playerCount)} jogador${Math.max(0, 3 - playerCount) !== 1 ? "es" : ""}`}
          </p>
        )}
      </div>
    </div>
  );
}
