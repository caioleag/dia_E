import { createClient } from "@/lib/supabase/client";
import { type User, type Preferencia, type Item, type TipoItem, type Modo } from "@/types";
import { getCartasFromCache } from "./offline-cache";

export interface SorteioResult {
  item: Item;
  segundoJogador: User | null;
}

export async function sortearItem(
  jogador: User,
  tipo: TipoItem,
  modo: Modo,
  allPlayers: User[],
  prefs: Map<string, number>, // key: `${userId}-${modo}-${categoria}`
  categoriasAtivas?: string[], // session-level category filter
  nivelMaxOverride?: number, // escalada: caps nivel globally
  favoritasJogador?: Set<string>, // favoritas do jogador atual
  favoritasSessao?: Set<string> // favoritas de todos da sessão
): Promise<SorteioResult | null> {
  const supabase = createClient();

  // Unir favoritas do jogador + sessão (sem duplicar)
  const todasFavoritas = new Set<string>([
    ...(favoritasJogador || []),
    ...(favoritasSessao || [])
  ]);

  // Get categories where this player has nivel >= 1 AND category is active in session
  const availableCategories: string[] = [];
  const prefPrefix = `${jogador.id}-${modo}-`;

  prefs.forEach((nivel, key) => {
    if (key.startsWith(prefPrefix) && nivel >= 1) {
      const categoria = key.replace(prefPrefix, "");
      if (!categoriasAtivas || categoriasAtivas.includes(categoria)) {
        availableCategories.push(categoria);
      }
    }
  });

  if (availableCategories.length === 0) return null;

  // Try up to 3 categories
  for (let attempt = 0; attempt < 3; attempt++) {
    // Pick a random category
    const categoria = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const playerNivel = prefs.get(`${jogador.id}-${modo}-${categoria}`) ?? 1;
    const nivelMax = nivelMaxOverride !== undefined ? Math.min(playerNivel, nivelMaxOverride) : playerNivel;

    // Query items from Supabase
    const { data: items } = await supabase
      .from("items")
      .select("*")
      .eq("modo", modo === "grupo" ? "Grupo" : "Casal")
      .eq("categoria", categoria)
      .eq("tipo", tipo)
      .lte("nivel", nivelMax)
      .limit(20);

    if (!items || items.length === 0) continue;

    // Sortear item considerando favoritas (10x mais chance)
    const item = todasFavoritas.size > 0 
      ? sortearComPeso(items as Item[], todasFavoritas)
      : items[Math.floor(Math.random() * items.length)] as Item;

    // Check if item involves a second player
    const needsSecondPlayer =
      item.quem === "Dupla" || item.conteudo.includes("[JOGADOR]");

    if (needsSecondPlayer) {
      const otherPlayers = allPlayers.filter((p) => p.id !== jogador.id);
      if (otherPlayers.length === 0) continue;

      // Try to find a compatible second player
      const compatible = otherPlayers.filter((p) => {
        const pNivel = prefs.get(`${p.id}-${modo}-${categoria}`) ?? 0;
        return pNivel >= item.nivel;
      });

      if (compatible.length === 0) {
        // No compatible second player — try another category
        continue;
      }

      const segundoJogador = compatible[Math.floor(Math.random() * compatible.length)];
      return { item, segundoJogador };
    }

    return { item, segundoJogador: null };
  }

  return null; // Fallback: no compatible item found
}

export function substituirPlaceholder(conteudo: string, jogador: User): string {
  const nome = jogador.nome?.split(" ")[0] ?? "Jogador";
  return conteudo.replace(/\[JOGADOR\]/g, nome);
}

export async function loadPrefsForPlayers(
  playerIds: string[],
  modo: Modo
): Promise<Map<string, number>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("preferencias")
    .select("*")
    .in("user_id", playerIds)
    .eq("modo", modo);

  const map = new Map<string, number>();
  if (data) {
    data.forEach((p: Preferencia) => {
      map.set(`${p.user_id}-${p.modo}-${p.categoria}`, p.nivel_max);
    });
  }
  return map;
}

// ============================================
// SISTEMA DE FAVORITOS
// ============================================

/**
 * Busca IDs das cartas favoritas de um usuário
 */
export async function loadFavoritasUsuario(userId: string): Promise<Set<string>> {
  const supabase = createClient();
  const { data } = await supabase
    .from("favoritas")
    .select("item_id")
    .eq("user_id", userId);

  const set = new Set<string>();
  if (data) {
    data.forEach((f) => set.add(f.item_id));
  }
  return set;
}

/**
 * Busca IDs das cartas favoritas de todos os jogadores de uma sessão
 * (união de favoritos de todos)
 */
export async function loadFavoritasSessao(playerIds: string[]): Promise<Set<string>> {
  if (playerIds.length === 0) return new Set();
  
  const supabase = createClient();
  const { data } = await supabase
    .from("favoritas")
    .select("item_id")
    .in("user_id", playerIds);

  const set = new Set<string>();
  if (data) {
    data.forEach((f) => set.add(f.item_id));
  }
  return set;
}

/**
 * Sorteia um item de uma lista considerando pesos de favoritos
 * Favoritos têm peso 10, normais têm peso 1
 */
function sortearComPeso(items: Item[], favoritasIds: Set<string>): Item {
  const PESO_FAVORITA = 10;
  const PESO_NORMAL = 1;

  // Calcular peso total
  const pesoTotal = items.reduce((sum, item) => {
    const peso = favoritasIds.has(item.id) ? PESO_FAVORITA : PESO_NORMAL;
    return sum + peso;
  }, 0);

  // Sortear número aleatório
  let random = Math.random() * pesoTotal;

  // Encontrar o item sorteado
  for (const item of items) {
    const peso = favoritasIds.has(item.id) ? PESO_FAVORITA : PESO_NORMAL;
    random -= peso;
    if (random <= 0) {
      return item;
    }
  }

  // Fallback (não deveria acontecer)
  return items[items.length - 1];
}
