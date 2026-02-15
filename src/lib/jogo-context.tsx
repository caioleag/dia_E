"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { type User, type Sala, type Item, type TipoItem } from "@/types";

type GameState = "sorteio" | "escolha" | "carta" | "encerrada";

interface JogoContextValue {
  sala: Sala | null;
  players: User[];
  prefs: Map<string, number>;
  gameState: GameState;
  jogadorAtual: User | null;
  segundoJogador: User | null;
  cartaAtual: Item | null;
  tipoAtual: TipoItem | null;
  rodada: number;

  setSala: (sala: Sala) => void;
  setPlayers: (players: User[]) => void;
  setPrefs: (prefs: Map<string, number>) => void;
  sortearJogador: () => User | null;
  escolherTipo: (tipo: TipoItem) => void;
  mostrarCarta: (item: Item, segundo: User | null) => void;
  proximaRodada: () => void;
  encerrarJogo: () => void;
}

const JogoContext = createContext<JogoContextValue | null>(null);

export function JogoProvider({ children }: { children: ReactNode }) {
  const [sala, setSala] = useState<Sala | null>(null);
  const [players, setPlayers] = useState<User[]>([]);
  const [prefs, setPrefs] = useState<Map<string, number>>(new Map());
  const [gameState, setGameState] = useState<GameState>("sorteio");
  const [jogadorAtual, setJogadorAtual] = useState<User | null>(null);
  const [segundoJogador, setSegundoJogador] = useState<User | null>(null);
  const [cartaAtual, setCartaAtual] = useState<Item | null>(null);
  const [tipoAtual, setTipoAtual] = useState<TipoItem | null>(null);
  const [rodada, setRodada] = useState(1);

  const sortearJogador = useCallback(() => {
    if (players.length === 0) return null;
    const jogador = players[Math.floor(Math.random() * players.length)];
    setJogadorAtual(jogador);
    setGameState("escolha");
    return jogador;
  }, [players]);

  const escolherTipo = useCallback((tipo: TipoItem) => {
    setTipoAtual(tipo);
    setGameState("carta");
  }, []);

  const mostrarCarta = useCallback((item: Item, segundo: User | null) => {
    setCartaAtual(item);
    setSegundoJogador(segundo);
  }, []);

  const proximaRodada = useCallback(() => {
    setRodada((r) => r + 1);
    setCartaAtual(null);
    setSegundoJogador(null);
    setTipoAtual(null);
    setGameState("sorteio");
  }, []);

  const encerrarJogo = useCallback(() => {
    setGameState("encerrada");
  }, []);

  return (
    <JogoContext.Provider
      value={{
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
      }}
    >
      {children}
    </JogoContext.Provider>
  );
}

export function useJogo() {
  const ctx = useContext(JogoContext);
  if (!ctx) throw new Error("useJogo must be used within JogoProvider");
  return ctx;
}
