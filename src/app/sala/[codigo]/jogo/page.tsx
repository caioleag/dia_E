"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { JogoProvider, useJogo } from "@/lib/jogo-context";
import { sortearItem, loadPrefsForPlayers, substituirPlaceholder } from "@/lib/sorteio";
import { encerrarSala } from "@/lib/sala";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import GameCard from "@/components/carta/GameCard";
import { MoreVertical, X as XIcon } from "lucide-react";
import { type User, type SalaJogador, type Sala, CATEGORIAS_GRUPO, CATEGORIAS_CASAL } from "@/types";
import { useSound } from "@/lib/hooks/useSound";

function JogoContent({ codigo }: { codigo: string }) {
  const { play } = useSound();
  const router = useRouter();
  const supabase = createClient();
  const {
    sala,
    players,
    prefs,
    gameState,
    jogadorAtual,
    segundoJogador,
    cartaAtual,
    tipoAtual,
    rodada,
    setSala,
    setPlayers,
    setPrefs,
    sortearJogador,
    escolherTipo,
    mostrarCarta,
    proximaRodada,
    encerrarJogo,
  } = useJogo();

  const [loading, setLoading] = useState(true);
  const [sorteando, setSorteando] = useState(false);
  const [buscandoCarta, setBuscandoCarta] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [encerrandoSala, setEncerrandoSala] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    loadData();
  }, [codigo]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { data: salaData } = await supabase
      .from("salas")
      .select("*")
      .eq("codigo", codigo)
      .single();

    if (!salaData || salaData.status !== "em_jogo") {
      router.push("/");
      return;
    }

    setIsHost(salaData.host_id === user.id);
    setSala(salaData as Sala);

    // Handle solo mode with fictional players
    if (salaData.modo_jogo === "solo" && salaData.jogadores_ficticios) {
      const fictionalPlayers = salaData.jogadores_ficticios as any[];
      const playerUsers = fictionalPlayers.map((fp, index) => ({
        id: `fictional-${index}`,
        nome: fp.nome,
        email: null,
        foto_url: null,
        created_at: new Date().toISOString(),
        onboarding_completo: true,
      } as User));

      setPlayers(playerUsers);

      // Generate fictional preferences
      const prefsMap = generateFictionalPrefs(fictionalPlayers, salaData.modo);
      setPrefs(prefsMap);
      setLoading(false);
      return;
    }

    // Online mode - load real players
    const { data: jogadoresData } = await supabase
      .from("sala_jogadores")
      .select("user_id, users(*)")
      .eq("sala_id", salaData.id);

    if (jogadoresData) {
      const playerUsers = jogadoresData
        .map((sj: any) => sj.users)
        .filter(Boolean);
      setPlayers(playerUsers);

      const playerIds = playerUsers.map((p: User) => p.id);
      const prefsMap = await loadPrefsForPlayers(playerIds, salaData.modo);
      setPrefs(prefsMap);
    }

    setLoading(false);
  }

  function generateFictionalPrefs(fictionalPlayers: any[], modo: string) {
    const categorias = modo === "grupo" ? CATEGORIAS_GRUPO : CATEGORIAS_CASAL;
    const prefsMap = new Map<string, number>();

    fictionalPlayers.forEach((fp, index) => {
      const playerId = `fictional-${index}`;
      categorias.forEach((cat) => {
        const key = `${playerId}-${modo}-${cat.nome}`;
        prefsMap.set(key, fp.nivel);
      });
    });

    return prefsMap;
  }

  async function handleSortearJogador() {
    setSorteando(true);
    // Animation delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const jogador = sortearJogador();

    // Play success sound when player is drawn
    play("success", 0.4);

    if (jogador && "vibrate" in navigator) {
      navigator.vibrate([30, 50, 30]);
    }
    setSorteando(false);
  }

  async function handleEscolherTipo(tipo: "Verdade" | "Desafio") {
    if (!jogadorAtual || !sala) return;
    setBuscandoCarta(true);
    escolherTipo(tipo);

    const result = await sortearItem(
      jogadorAtual,
      tipo,
      sala.modo,
      players,
      prefs,
      sala.categorias_ativas ?? undefined
    );

    if (!result) {
      // No compatible item — skip round
      play("alert", 0.5);
      alert("Nenhuma carta compatível encontrada. Pulando rodada.");
      proximaRodada();
      setBuscandoCarta(false);
      return;
    }

    // Play transition sound when card is shown
    play("transition", 0.4);
    mostrarCarta(result.item, result.segundoJogador);
    setBuscandoCarta(false);
  }

  async function handleEncerrar() {
    if (!sala) return;
    setEncerrandoSala(true);
    await encerrarSala(sala.id);
    router.push(`/sala/${codigo}/encerrada`);
  }

  const getCategoriaEmoji = (categoria: string) => {
    const allCats = [...CATEGORIAS_GRUPO, ...CATEGORIAS_CASAL];
    return allCats.find((c) => c.nome === categoria)?.emoji ?? "🎲";
  };

  if (loading) {
    return (
      <div className="h-screen bg-bg-deep flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-lilac border-t-transparent animate-spin" />
      </div>
    );
  }

  // Only host can interact
  if (!isHost) {
    return (
      <div className="h-screen bg-bg-deep flex items-center justify-center px-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🎮</div>
          <p className="font-sans text-text-secondary text-sm">
            O jogo está acontecendo no dispositivo do host
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fixed bg-bg-deep relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-safe py-4">
        <span className="font-sans text-xs text-text-disabled uppercase tracking-widest">
          Rodada {rodada}
        </span>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-bg-elevated transition-colors relative"
          aria-label="Menu"
        >
          <MoreVertical size={20} className="text-text-secondary" />
        </button>
      </header>

      {/* Menu dropdown */}
      {showMenu && (
        <div className="absolute top-16 right-6 bg-bg-surface border border-border-subtle rounded-xl shadow-card z-50 overflow-hidden animate-fade-slide-in">
          <button
            onClick={handleEncerrar}
            disabled={encerrandoSala}
            className="w-full px-4 py-3 font-sans text-sm text-brand-red hover:bg-bg-elevated transition-colors text-left disabled:opacity-50"
          >
            {encerrandoSala ? "Encerrando..." : "Encerrar Sala"}
          </button>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-start px-6 pt-12 pb-8">
        <AnimatePresence mode="wait">
          {/* State 1: Sorteio do jogador */}
          {gameState === "sorteio" && (
            <motion.div
              key="sorteio"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6 w-full max-w-sm"
            >
              <div className="text-center mb-4">
                <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
                  {sala?.modo === "casal" && rodada > 1 ? "Próxima vez" : "Próximo jogador"}
                </h2>
                <p className="font-sans text-sm text-text-secondary">
                  {sala?.modo === "casal" && rodada > 1 ? "Toque para continuar" : "Toque para sortear"}
                </p>
              </div>
              <Button
                onClick={handleSortearJogador}
                loading={sorteando}
                size="lg"
                className="w-full"
              >
                {sorteando
                  ? (sala?.modo === "casal" && rodada > 1 ? "Alternando..." : "Sorteando...")
                  : (sala?.modo === "casal" && rodada > 1 ? "Próximo Jogador" : "Sortear Jogador")}
              </Button>
            </motion.div>
          )}

          {/* State 2: Escolha Verdade/Desafio */}
          {gameState === "escolha" && jogadorAtual && (
            <motion.div
              key="escolha"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-8 w-full max-w-sm"
            >
              <div className="flex flex-col items-center gap-4">
                <Avatar
                  src={jogadorAtual.foto_url}
                  alt={jogadorAtual.nome ?? "Jogador"}
                  size="xl"
                  className="shadow-glow"
                />
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-text-primary mb-1">
                    {jogadorAtual.nome?.split(" ")[0]}
                  </p>
                  <p className="font-sans text-sm text-text-secondary">
                    é sua vez! Escolha:
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full">
                <Button
                  onClick={() => handleEscolherTipo("Verdade")}
                  disabled={buscandoCarta}
                  size="lg"
                  className="w-full bg-brand-amber hover:brightness-110 text-bg-deep"
                  style={{ background: "#F59E0B" }}
                >
                  Verdade
                </Button>
                <Button
                  onClick={() => handleEscolherTipo("Desafio")}
                  disabled={buscandoCarta}
                  size="lg"
                  className="w-full bg-brand-red"
                >
                  Desafio
                </Button>
              </div>

              {buscandoCarta && (
                <p className="font-sans text-xs text-text-disabled animate-pulse">
                  Buscando carta...
                </p>
              )}
            </motion.div>
          )}

          {/* State 3: Carta */}
          {gameState === "carta" && cartaAtual && (
            <motion.div
              key="carta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              <GameCard
                item={cartaAtual}
                segundoJogador={segundoJogador}
                emoji={getCategoriaEmoji(cartaAtual.categoria)}
              />

              <div className="flex flex-col gap-3 w-full max-w-sm">
                <Button onClick={proximaRodada} className="w-full">
                  Próxima Rodada
                </Button>
                <button
                  onClick={proximaRodada}
                  className="text-text-secondary font-sans text-sm text-center py-2 hover:text-text-primary transition-colors"
                >
                  Pular
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function JogoPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = use(params);
  return (
    <JogoProvider>
      <JogoContent codigo={codigo} />
    </JogoProvider>
  );
}
