"use client";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { JogoProvider, useJogo } from "@/lib/jogo-context";
import { loadPrefsForPlayers, loadFavoritasUsuario, loadFavoritasSessao } from "@/lib/sorteio";
import { encerrarSala } from "@/lib/sala";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import GameCard from "@/components/carta/GameCard";
import { MoreVertical } from "lucide-react";
import {
  type User,
  type Sala,
  type Item,
  type TipoItem,
  type EstadoPartida,
  type ResumoPart,
  CATEGORIAS_GRUPO,
  CATEGORIAS_CASAL,
  NIVEL_LABELS,
} from "@/types";
import { useSound } from "@/lib/hooks/useSound";

const REACAO_EMOJIS = ["🔥", "😂", "😰", "🫣"];

// ─── Timer ────────────────────────────────────────────────────────────────────
function extrairTempo(conteudo: string): number {
  const min = conteudo.match(/(\d+)\s*minuto/i);
  if (min) return parseInt(min[1]) * 60;
  const seg = conteudo.match(/(\d+)\s*segundo/i);
  if (seg) return parseInt(seg[1]);
  return 0;
}

function CardTimer({ segundos, cardId }: { segundos: number; cardId: string }) {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(segundos);

  useEffect(() => { setRunning(false); setRemaining(segundos); }, [cardId]);
  useEffect(() => {
    if (!running || remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);

  const done = remaining <= 0;
  if (!running && !done) {
    return (
      <button onClick={() => setRunning(true)}
        className="flex items-center gap-2 mx-auto px-4 py-2 rounded-full bg-bg-elevated border border-border-subtle text-text-secondary font-sans text-sm hover:border-brand-lilac hover:text-brand-lilac transition-all">
        ⏱ Iniciar timer ({segundos >= 60 ? `${segundos / 60}min` : `${segundos}s`})
      </button>
    );
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`font-display text-4xl font-bold ${done ? "text-brand-red" : "text-brand-lilac"}`}>
        {done ? "⏰" : remaining}
      </div>
      <p className="font-sans text-xs text-text-disabled">{done ? "Tempo esgotado!" : "segundos restantes"}</p>
      {done && <button onClick={() => { setRemaining(segundos); setRunning(true); }} className="font-sans text-xs text-text-disabled hover:text-text-secondary transition-colors mt-1">Reiniciar</button>}
    </div>
  );
}

// ─── Non-host view ────────────────────────────────────────────────────────────
function NonHostView({
  estado,
  onReagir,
  jaReagiu,
  currentUserId,
}: {
  estado: EstadoPartida | null;
  onReagir: (emoji: string) => void;
  jaReagiu: boolean;
  currentUserId: string | null;
}) {
  const allCats = [...CATEGORIAS_GRUPO, ...CATEGORIAS_CASAL];
  const getEmoji = (cat: string) => allCats.find((c) => c.nome === cat)?.emoji ?? "🎲";

  if (!estado || estado.gameState === "sorteio") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl animate-pulse">🎲</div>
        <p className="font-sans text-sm text-text-secondary">Aguardando próximo jogador...</p>
      </div>
    );
  }

  if (estado.gameState === "escolha" && estado.jogadorAtual) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Avatar src={estado.jogadorAtual.foto_url} alt={estado.jogadorAtual.nome ?? "?"} size="xl" className="shadow-glow" />
        <p className="font-display text-2xl font-bold text-text-primary">{estado.jogadorAtual.nome?.split(" ")[0]}</p>
        <p className="font-sans text-sm text-text-secondary">está escolhendo...</p>
      </div>
    );
  }

  if (estado.gameState === "carta" && estado.cartaAtual) {
    const card = estado.cartaAtual;
    const seg = estado.segundoJogador
      ? ({ id: "sj", nome: estado.segundoJogador.nome, foto_url: estado.segundoJogador.foto_url, email: null, created_at: "", onboarding_completo: true } as User)
      : null;
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-md">
        <GameCard 
          item={card} 
          segundoJogador={seg} 
          emoji={getEmoji(card.categoria)} 
          isPenalty={estado.isPenalty}
          currentUserId={currentUserId || undefined}
        />
        {/* Reações */}
        <div className="flex flex-col items-center gap-3">
          <p className="font-sans text-xs text-text-disabled">Sua reação</p>
          <div className="flex gap-4">
            {REACAO_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => onReagir(emoji)}
                disabled={jaReagiu}
                className={`text-3xl transition-all active:scale-125 ${jaReagiu ? "opacity-30 cursor-not-allowed" : "hover:scale-125 cursor-pointer"}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          {jaReagiu && <p className="font-sans text-xs text-text-disabled">Reação enviada!</p>}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Main game content ────────────────────────────────────────────────────────
function JogoContent({ codigo }: { codigo: string }) {
  const { play } = useSound();
  const router = useRouter();
  const supabase = createClient();
  const {
    sala, players, prefs, gameState, jogadorAtual, segundoJogador,
    cartaAtual, tipoAtual, rodada,
    setSala, setPlayers, setPrefs,
    sortearJogador, escolherTipo, mostrarCarta, proximaRodada,
  } = useJogo();

  const [loading, setLoading] = useState(true);
  const [sorteando, setSorteando] = useState(false);
  const [buscandoCarta, setBuscandoCarta] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [encerrandoSala, setEncerrandoSala] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [currentUserNome, setCurrentUserNome] = useState<string>("Jogador");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Feature states
  const [isPenalty, setIsPenalty] = useState(false);
  const [vetosUsados, setVetosUsados] = useState<Record<string, boolean>>({});
  const [stats, setStats] = useState<ResumoPart>({ rodadas: 0, pulos: 0, penalidades: 0, vetosUsados: 0, categorias: {} });
  const [estadoPartida, setEstadoPartida] = useState<EstadoPartida | null>(null);

  // Reactions
  const [reacoes, setReacoes] = useState<{ id: string; emoji: string; nome: string }[]>([]);
  const [jaReagiu, setJaReagiu] = useState(false);
  const reactionChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Escalada level-up notification
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLabel, setLevelUpLabel] = useState("");
  const lastNivelRef = useRef(1);

  // Computed: escalada nivel based on current round
  const nivelEscalada = sala?.modo_escalada ? Math.min(Math.ceil(rodada / 3), 3) : undefined;

  useEffect(() => { 
    loadData(); 
    
    // Cleanup function
    return () => {
      if (reactionChannelRef.current) {
        reactionChannelRef.current.unsubscribe();
      }
    };
  }, [codigo]);

  // Reset jaReagiu when card changes
  useEffect(() => { setJaReagiu(false); }, [estadoPartida?.cartaAtual?.id]);

  // Level-up notification
  useEffect(() => {
    if (!sala?.modo_escalada || nivelEscalada === undefined) return;
    if (nivelEscalada > lastNivelRef.current) {
      lastNivelRef.current = nivelEscalada;
      setLevelUpLabel(NIVEL_LABELS[nivelEscalada]);
      setShowLevelUp(true);
      const t = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(t);
    }
  }, [nivelEscalada]);

  // Sync estado_partida to DB (host only)
  useEffect(() => {
    if (!isHost || !sala) return;
    const estado: EstadoPartida = {
      gameState, rodada, isPenalty, tipoAtual, cartaAtual,
      jogadorAtual: jogadorAtual ? { id: jogadorAtual.id, nome: jogadorAtual.nome, foto_url: jogadorAtual.foto_url } : null,
      segundoJogador: segundoJogador ? { nome: segundoJogador.nome, foto_url: segundoJogador.foto_url } : null,
    };
    // Update asynchronously but don't block
    (async () => {
      await supabase.from("salas").update({ estado_partida: estado }).eq("id", sala.id);
    })();
  }, [gameState, cartaAtual, rodada, isPenalty, isHost, sala, jogadorAtual, segundoJogador, tipoAtual]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    setCurrentUserId(user.id); // Salvar ID do usuário

    const { data: salaData } = await supabase.from("salas").select("*").eq("codigo", codigo).single();
    if (!salaData || salaData.status !== "em_jogo") { router.push("/"); return; }

    const hostMode = salaData.host_id === user.id;
    setIsHost(hostMode);
    setSala(salaData as Sala);

    // Setup reaction channel for online mode
    if (salaData.modo_jogo === "online") {
      const ch = supabase.channel(`reacoes-${salaData.id}`);
      if (hostMode) {
        ch.on("broadcast", { event: "reacao" }, ({ payload }) => {
          const id = `${Date.now()}-${Math.random()}`;
          const reacao = { id, emoji: payload.emoji as string, nome: payload.nome as string };
          setReacoes((prev) => [...prev.slice(-3), reacao]);
          setTimeout(() => setReacoes((prev) => prev.filter((r) => r.id !== id)), 4000);
        });
      }
      ch.subscribe();
      reactionChannelRef.current = ch;
    }

    if (!hostMode) {
      // Load user name for reactions
      const { data: userData } = await supabase.from("users").select("nome").eq("id", user.id).single();
      setCurrentUserNome(userData?.nome?.split(" ")[0] ?? "Jogador");

      setEstadoPartida(salaData.estado_partida as EstadoPartida | null);
      supabase
        .channel(`jogo-estado-${salaData.id}`)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "salas", filter: `id=eq.${salaData.id}` }, (payload) => {
          const updated = payload.new as { estado_partida: EstadoPartida; status: string };
          if (updated.status === "encerrada") { router.push(`/sala/${codigo}/encerrada`); return; }
          setEstadoPartida(updated.estado_partida);
        })
        .subscribe();
      setLoading(false);
      return;
    }

    // Host: load players
    if (salaData.modo_jogo === "solo" && salaData.jogadores_ficticios) {
      const fps = salaData.jogadores_ficticios as any[];
      const playerUsers = fps.map((fp, i) => ({
        id: `fictional-${i}`, nome: fp.nome, email: null, foto_url: null,
        created_at: new Date().toISOString(), onboarding_completo: true,
      } as User));
      setPlayers(playerUsers);
      const cats = salaData.modo === "grupo" ? CATEGORIAS_GRUPO : CATEGORIAS_CASAL;
      const prefsMap = new Map<string, number>();
      fps.forEach((fp, i) => cats.forEach((cat) => prefsMap.set(`fictional-${i}-${salaData.modo}-${cat.nome}`, fp.nivel)));
      setPrefs(prefsMap);
      setLoading(false);
      return;
    }

    const { data: jogadoresData } = await supabase.from("sala_jogadores").select("user_id, users(*)").eq("sala_id", salaData.id);
    if (jogadoresData) {
      const playerUsers = jogadoresData.map((sj: any) => sj.users).filter(Boolean);
      setPlayers(playerUsers);
      const prefsMap = await loadPrefsForPlayers(playerUsers.map((p: User) => p.id), salaData.modo);
      setPrefs(prefsMap);
    }
    setLoading(false);
  }

  function handleReagir(emoji: string) {
    if (!reactionChannelRef.current || jaReagiu) return;
    reactionChannelRef.current.send({ type: "broadcast", event: "reacao", payload: { emoji, nome: currentUserNome } });
    setJaReagiu(true);
  }

  async function handleSortearJogador() {
    setSorteando(true);
    await new Promise((r) => setTimeout(r, 1200));
    const jogador = sortearJogador();
    play("success", 0.4);
    if (jogador && "vibrate" in navigator) navigator.vibrate([30, 50, 30]);
    setSorteando(false);
  }

  async function handleEscolherTipo(tipo: TipoItem) {
    if (!jogadorAtual || !sala) return;
    setBuscandoCarta(true);
    setIsPenalty(false);
    escolherTipo(tipo);

    // Carregar favoritas do jogador atual e de todos da sessão
    const favoritasJogador = await loadFavoritasUsuario(jogadorAtual.id);
    const playerIds = players.map(p => p.id).filter(id => !id.startsWith('fictional-')); // Excluir ficticios
    const favoritasSessao = playerIds.length > 0 ? await loadFavoritasSessao(playerIds) : new Set<string>();

    const { sortearItem } = await import("@/lib/sorteio");
    const result = await sortearItem(
      jogadorAtual, tipo, sala.modo, players, prefs,
      sala.categorias_ativas ?? undefined,
      nivelEscalada,
      favoritasJogador,
      favoritasSessao
    );

    if (!result) {
      play("alert", 0.5);
      alert("Nenhuma carta compatível encontrada. Pulando rodada.");
      proximaRodada();
      setBuscandoCarta(false);
      return;
    }

    setStats((prev) => ({
      ...prev,
      categorias: { ...prev.categorias, [result.item.categoria]: (prev.categorias[result.item.categoria] ?? 0) + 1 },
    }));
    play("transition", 0.4);
    mostrarCarta(result.item, result.segundoJogador);
    setBuscandoCarta(false);
  }

  async function handlePular() {
    if (!cartaAtual || !sala || !tipoAtual || !jogadorAtual) return;
    setStats((prev) => ({ ...prev, pulos: prev.pulos + 1 }));
    setBuscandoCarta(true);

    let query = supabase.from("items").select("*")
      .eq("modo", sala.modo === "grupo" ? "Grupo" : "Casal")
      .eq("categoria", cartaAtual.categoria)
      .eq("tipo", tipoAtual);

    if (nivelEscalada !== undefined) query = query.lte("nivel", nivelEscalada);

    const { data: items } = await query.limit(15);

    if (!items || items.length === 0) {
      setIsPenalty(false);
      proximaRodada();
      setBuscandoCarta(false);
      return;
    }

    const item = items[Math.floor(Math.random() * items.length)] as Item;
    let seg: User | null = null;
    if (item.quem === "Dupla" || item.conteudo.includes("[JOGADOR]")) {
      const others = players.filter((p) => p.id !== jogadorAtual.id);
      if (others.length > 0) seg = others[Math.floor(Math.random() * others.length)];
    }

    setStats((prev) => ({ ...prev, penalidades: prev.penalidades + 1 }));
    setIsPenalty(true);
    mostrarCarta(item, seg);
    play("alert", 0.5);
    setBuscandoCarta(false);
  }

  function handleVeto() {
    if (!jogadorAtual) return;
    setVetosUsados((prev) => ({ ...prev, [jogadorAtual.id]: true }));
    setStats((prev) => ({ ...prev, vetosUsados: prev.vetosUsados + 1 }));
    setIsPenalty(false);
    proximaRodada();
  }

  function handleProximaRodada() {
    setStats((prev) => ({ ...prev, rodadas: prev.rodadas + 1 }));
    setIsPenalty(false);
    proximaRodada();
  }

  async function handleEncerrar() {
    if (!sala) return;
    setEncerrandoSala(true);
    await supabase.from("salas").update({ resumo_partida: { ...stats, rodadas: rodada - 1 } }).eq("id", sala.id);
    await encerrarSala(sala.id);
    router.push(`/sala/${codigo}/encerrada`);
  }

  const getCategoriaEmoji = (categoria: string) => {
    const all = [...CATEGORIAS_GRUPO, ...CATEGORIAS_CASAL];
    return all.find((c) => c.nome === categoria)?.emoji ?? "🎲";
  };

  const podeVetar = jogadorAtual ? !vetosUsados[jogadorAtual.id] : false;

  if (loading) {
    return (
      <div className="h-screen bg-bg-deep flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-lilac border-t-transparent animate-spin" />
      </div>
    );
  }

  // ── Non-host ───────────────────────────────────────────────────────────────
  if (!isHost) {
    return (
      <div className="container-fixed bg-bg-deep flex flex-col">
        <header className="flex items-center justify-between px-6 pt-safe py-4">
          <span className="font-sans text-xs text-text-disabled uppercase tracking-widest">
            Rodada {estadoPartida?.rodada ?? "—"}
          </span>
          {sala?.modo_escalada && estadoPartida?.rodada && (
            <span className="font-sans text-xs text-brand-amber font-medium">
              ⚡ {NIVEL_LABELS[Math.min(Math.ceil(estadoPartida.rodada / 3), 3)]}
            </span>
          )}
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8 overflow-visible">
          <NonHostView estado={estadoPartida} onReagir={handleReagir} jaReagiu={jaReagiu} currentUserId={currentUserId} />
        </main>
      </div>
    );
  }

  // ── Host ───────────────────────────────────────────────────────────────────
  return (
    <div className="container-fixed bg-bg-deep relative">
      {/* Level-up notification */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-brand-amber text-bg-deep font-sans text-sm font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap"
          >
            ⚡ Intensidade: {levelUpLabel}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating reactions */}
      <div className="fixed top-20 right-4 flex flex-col gap-2 pointer-events-none z-40">
        <AnimatePresence>
          {reacoes.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="bg-bg-surface border border-border-subtle rounded-full px-3 py-1.5 flex items-center gap-1.5"
            >
              <span className="text-base">{r.emoji}</span>
              <span className="font-sans text-xs text-text-secondary">{r.nome}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <header className="flex items-center justify-between px-6 pt-safe py-4">
        <div className="flex items-center gap-3">
          <span className="font-sans text-xs text-text-disabled uppercase tracking-widest">
            Rodada {rodada}
          </span>
          {sala?.modo_escalada && nivelEscalada !== undefined && (
            <span className="font-sans text-xs text-brand-amber font-medium">
              ⚡ {NIVEL_LABELS[nivelEscalada]}
            </span>
          )}
        </div>
        <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full hover:bg-bg-elevated transition-colors" aria-label="Menu">
          <MoreVertical size={20} className="text-text-secondary" />
        </button>
      </header>

      {showMenu && (
        <div className="absolute top-16 right-6 bg-bg-surface border border-border-subtle rounded-xl shadow-card z-50 overflow-hidden animate-fade-slide-in">
          <button onClick={handleEncerrar} disabled={encerrandoSala}
            className="w-full px-4 py-3 font-sans text-sm text-brand-red hover:bg-bg-elevated transition-colors text-left disabled:opacity-50">
            {encerrandoSala ? "Encerrando..." : "Encerrar Sala"}
          </button>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-start px-6 pt-12 pb-8 overflow-visible">
        <AnimatePresence mode="wait">
          {/* Sorteio */}
          {gameState === "sorteio" && (
            <motion.div key="sorteio" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6 w-full max-w-sm">
              <div className="text-center mb-4">
                <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
                  {sala?.modo === "casal" && rodada > 1 ? "Próxima vez" : "Próximo jogador"}
                </h2>
                <p className="font-sans text-sm text-text-secondary">
                  {sala?.modo === "casal" && rodada > 1 ? "Toque para continuar" : "Toque para sortear"}
                </p>
              </div>
              <Button onClick={handleSortearJogador} loading={sorteando} size="lg" className="w-full">
                {sorteando
                  ? (sala?.modo === "casal" && rodada > 1 ? "Alternando..." : "Sorteando...")
                  : (sala?.modo === "casal" && rodada > 1 ? "Próximo Jogador" : "Sortear Jogador")}
              </Button>
            </motion.div>
          )}

          {/* Escolha */}
          {gameState === "escolha" && jogadorAtual && (
            <motion.div key="escolha" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-8 w-full max-w-sm">
              <div className="flex flex-col items-center gap-4">
                <Avatar src={jogadorAtual.foto_url} alt={jogadorAtual.nome ?? "Jogador"} size="xl" className="shadow-glow" />
                <div className="text-center">
                  <p className="font-display text-3xl font-bold text-text-primary mb-1">{jogadorAtual.nome?.split(" ")[0]}</p>
                  <p className="font-sans text-sm text-text-secondary">é sua vez! Escolha:</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full">
                <Button onClick={() => handleEscolherTipo("Verdade")} disabled={buscandoCarta} size="lg" className="w-full" style={{ background: "#F59E0B" }}>
                  Verdade
                </Button>
                <Button onClick={() => handleEscolherTipo("Desafio")} disabled={buscandoCarta} size="lg" className="w-full bg-brand-red">
                  Desafio
                </Button>
              </div>
              {buscandoCarta && <p className="font-sans text-xs text-text-disabled animate-pulse">Buscando carta...</p>}
            </motion.div>
          )}

          {/* Carta */}
          {gameState === "carta" && cartaAtual && (
            <motion.div key="carta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 w-full">
              <GameCard
                item={cartaAtual}
                segundoJogador={segundoJogador}
                emoji={getCategoriaEmoji(cartaAtual.categoria)}
                isPenalty={isPenalty}
                punicao={isPenalty ? sala?.punicao : undefined}
                currentUserId={currentUserId || undefined}
              />
              {extrairTempo(cartaAtual.conteudo) > 0 && (
                <CardTimer segundos={extrairTempo(cartaAtual.conteudo)} cardId={cartaAtual.id} />
              )}
              <div className="flex flex-col gap-3 w-full max-w-sm">
                {isPenalty ? (
                  <Button onClick={handleProximaRodada} className="w-full">Cumpriu a penitência ✓</Button>
                ) : (
                  <>
                    <Button onClick={handleProximaRodada} className="w-full">Próxima Rodada</Button>
                    <div className="flex gap-2">
                      {podeVetar && (
                        <button onClick={handleVeto} disabled={buscandoCarta}
                          className="flex-1 py-2 rounded-xl border border-border-subtle text-text-secondary font-sans text-sm hover:border-brand-lilac hover:text-brand-lilac transition-all disabled:opacity-50">
                          Veto 🛡️
                        </button>
                      )}
                      <button onClick={handlePular} disabled={buscandoCarta}
                        className="flex-1 py-2 rounded-xl border border-border-subtle text-text-secondary font-sans text-sm hover:border-brand-red hover:text-brand-red transition-all disabled:opacity-50">
                        {buscandoCarta ? "..." : "Pular ⚠️"}
                      </button>
                    </div>
                    <p className="font-sans text-xs text-text-disabled text-center">
                      {podeVetar
                        ? "Veto: pula sem penitência (1x) · Pular: recebe penitência"
                        : "Pular: recebe uma carta de penitência"}
                    </p>
                  </>
                )}
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
