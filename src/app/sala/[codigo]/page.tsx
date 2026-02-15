"use client";
import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// This is the room entry point — validates the sala and joins the user
export default function SalaEntryPage({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = use(params);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    handleEntry();
  }, [codigo]);

  async function handleEntry() {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Save the sala code for after login
      localStorage.setItem("dia_e_pending_sala", codigo);
      router.push("/login");
      return;
    }

    // Verify sala exists and is open
    const { data: sala } = await supabase
      .from("salas")
      .select("*")
      .eq("codigo", codigo)
      .single();

    if (!sala) {
      router.push("/?error=sala_not_found");
      return;
    }

    if (sala.status === "encerrada") {
      router.push(`/sala/${codigo}/encerrada`);
      return;
    }

    // If user is the host, go to lobby
    if (sala.host_id === user.id) {
      if (sala.status === "em_jogo") {
        router.push(`/sala/${codigo}/jogo`);
      } else {
        router.push(`/sala/${codigo}/lobby`);
      }
      return;
    }

    // Join the room (upsert to avoid duplicate)
    const { error: joinError } = await supabase
      .from("sala_jogadores")
      .upsert({ sala_id: sala.id, user_id: user.id }, { onConflict: "sala_id,user_id" });

    if (joinError) {
      console.error("Error joining room:", joinError);
      router.push("/?error=join_failed");
      return;
    }

    // Small delay to ensure realtime propagates
    await new Promise(resolve => setTimeout(resolve, 500));

    if (sala.status === "em_jogo") {
      // Late join — just go to wait/ended screen
      router.push(`/sala/${codigo}/espera`);
    } else {
      router.push(`/sala/${codigo}/espera`);
    }
  }

  return (
    <div className="min-h-screen bg-bg-deep flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-brand-lilac border-t-transparent animate-spin" />
        <p className="font-sans text-text-secondary text-sm">Entrando na sala...</p>
      </div>
    </div>
  );
}
