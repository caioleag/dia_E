export type Modo = "grupo" | "casal";
export type ModoJogo = "online" | "solo";
export type StatusSala = "aguardando" | "em_jogo" | "encerrada";
export type TipoItem = "Verdade" | "Desafio";

export interface User {
  id: string;
  email: string | null;
  nome: string | null;
  foto_url: string | null;
  created_at: string;
  onboarding_completo: boolean;
}

export interface Preferencia {
  id: string;
  user_id: string;
  modo: Modo;
  categoria: string;
  nivel_max: number;
  updated_at: string;
}

export interface JogadorFicticio {
  nome: string;
  nivel: number; // 0-3, aplicado a todas as categorias
}

export interface Sala {
  id: string;
  codigo: string;
  host_id: string;
  modo: Modo;
  modo_jogo: ModoJogo;
  status: StatusSala;
  created_at: string;
  encerrada_at: string | null;
  jogadores_ficticios?: JogadorFicticio[] | null;
  categorias_ativas?: string[] | null;
}

export interface SalaJogador {
  id: string;
  sala_id: string;
  user_id: string;
  entrou_em: string;
  users?: User;
}

export interface Item {
  id: string;
  modo: string;
  categoria: string;
  nivel: number;
  tipo: TipoItem;
  quem: string;
  conteudo: string;
}

// Categorias por modo
export const CATEGORIAS_GRUPO = [
  { codigo: "VC", nome: "Verbal / Confissão", emoji: "💬" },
  { codigo: "TO", nome: "Toque", emoji: "👋" },
  { codigo: "BJ", nome: "Beijo", emoji: "💋" },
  { codigo: "PE", nome: "Performance", emoji: "🎭" },
  { codigo: "EC", nome: "Exposição Corporal", emoji: "🙈" },
  { codigo: "CI", nome: "Contato Íntimo", emoji: "🌶️" },
] as const;

export const CATEGORIAS_CASAL = [
  { codigo: "RE", nome: "Revelação", emoji: "💬" },
  { codigo: "AT", nome: "Ato", emoji: "🔥" },
  { codigo: "EN", nome: "Encenação", emoji: "🎭" },
  { codigo: "EX", nome: "Exposição", emoji: "🙈" },
  { codigo: "SE", nome: "Sensorial", emoji: "🎯" },
  { codigo: "RS", nome: "Resistência", emoji: "⏱️" },
  { codigo: "AB", nome: "Abertura", emoji: "🔓" },
  { codigo: "TE", nome: "Terceiros", emoji: "👥" },
] as const;

export const NIVEL_LABELS: Record<number, string> = {
  0: "Nunca",
  1: "Leve",
  2: "Médio",
  3: "Intenso",
};

export type CategoriaGrupo = (typeof CATEGORIAS_GRUPO)[number];
export type CategoriaCasal = (typeof CATEGORIAS_CASAL)[number];
