import { createClient } from "@/lib/supabase/client";
import { type User, type Preferencia, type Item, type TipoItem, type Modo } from "@/types";

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
  categoriasAtivas?: string[] // session-level category filter
): Promise<SorteioResult | null> {
  const supabase = createClient();

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
    const nivelMax = prefs.get(`${jogador.id}-${modo}-${categoria}`) ?? 1;

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

    // Pick a random item from results
    const item = items[Math.floor(Math.random() * items.length)] as Item;

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
