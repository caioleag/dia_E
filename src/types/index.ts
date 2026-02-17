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
  genero: string | null;
  preferencia_parceiro: string | null;
}

export type Genero = "homem" | "mulher" | "nao_binario";
export type PreferenciaParceiro = "qualquer" | "mesmo_genero" | "genero_diferente";

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

export interface EstadoPartida {
  gameState: "sorteio" | "escolha" | "carta" | "encerrada";
  rodada: number;
  jogadorAtual: { id: string; nome: string | null; foto_url: string | null } | null;
  segundoJogador: { nome: string | null; foto_url: string | null } | null;
  cartaAtual: Item | null;
  tipoAtual: TipoItem | null;
  isPenalty: boolean;
}

export interface ResumoPart {
  rodadas: number;
  pulos: number;
  penalidades: number;
  vetosUsados: number;
  categorias: Record<string, number>;
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
  punicao?: string | null;
  estado_partida?: EstadoPartida | null;
  resumo_partida?: ResumoPart | null;
  modo_escalada?: boolean | null;
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

export interface Curiosidade {
  id: string;
  conteudo: string;
  categoria: string | null;
  ativo: boolean;
  created_at: string;
}

export interface Favorita {
  id: string;
  user_id: string;
  item_id: string;
  created_at: string;
  items?: Item; // Join opcional com a carta
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
