import { createClient } from "@/lib/supabase/client";
import { type Modo } from "@/types";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

export function generateCode(): string {
  return Array.from({ length: 6 }, () =>
    CHARS[Math.floor(Math.random() * CHARS.length)]
  ).join("");
}

export async function criarSala(modo: Modo, hostId: string) {
  const supabase = createClient();

  // Generate unique code
  let codigo = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const { data } = await supabase
      .from("salas")
      .select("codigo")
      .eq("codigo", codigo)
      .maybeSingle();
    if (!data) break;
    codigo = generateCode();
    attempts++;
  }

  const { data, error } = await supabase
    .from("salas")
    .insert({ codigo, host_id: hostId, modo, status: "aguardando" })
    .select()
    .single();

  if (error) throw error;

  // Add host as player too
  await supabase
    .from("sala_jogadores")
    .insert({ sala_id: data.id, user_id: hostId });

  return data;
}

export async function encerrarSala(salaId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("salas")
    .update({ status: "encerrada", encerrada_at: new Date().toISOString() })
    .eq("id", salaId);
  if (error) throw error;
}

export async function iniciarJogo(salaId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("salas")
    .update({ status: "em_jogo" })
    .eq("id", salaId);
  if (error) throw error;
}
