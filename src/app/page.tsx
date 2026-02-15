"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { User as UserIcon, Plus, LogIn, AlertCircle } from "lucide-react";
import { type User, type Sala } from "@/types";
import { encerrarSala } from "@/lib/sala";

export default function HomePage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [activeSala, setActiveSala] = useState<Sala | null>(null);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [encerrandoSala, setEncerrandoSala] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { router.push("/login"); return; }

    const [{ data: userData }, { data: salasData }] = await Promise.all([
      supabase.from("users").select("*").eq("id", authUser.id).single(),
      supabase
        .from("salas")
        .select("*")
        .eq("host_id", authUser.id)
        .in("status", ["aguardando", "em_jogo"])
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

    if (userData) setUser(userData as User);
    if (salasData && salasData.length > 0) setActiveSala(salasData[0] as Sala);
    setLoading(false);
  }

  async function handleEncerrarSala() {
    if (!activeSala) return;
    setEncerrandoSala(true);
    await encerrarSala(activeSala.id);
    setActiveSala(null);
    setEncerrandoSala(false);
  }

  async function handleJoinRoom() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    router.push(`/sala/${code}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-lilac border-t-transparent animate-spin" />
      </div>
    );
  }

  const primeiroNome = user?.nome?.split(" ")[0] ?? "Jogador";

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col px-6">
      {/* Header */}
      <header className="flex items-center justify-between pt-safe py-4">
        <div className="flex items-center gap-3">
          <Avatar src={user?.foto_url} alt={user?.nome ?? "Usuário"} size="sm" />
          <span className="font-sans text-text-secondary text-sm">
            Olá, <span className="text-text-primary font-medium">{primeiroNome}</span>
          </span>
        </div>
        <button
          onClick={() => router.push("/perfil")}
          className="p-2.5 rounded-full bg-bg-elevated border border-border-subtle hover:border-brand-purple transition-colors"
          aria-label="Ver perfil"
        >
          <UserIcon size={18} className="text-text-secondary" />
        </button>
      </header>

      {/* Active room banner */}
      {activeSala && (
        <div className="mt-2 bg-brand-wine/20 border border-brand-wine/40 rounded-card p-4 flex items-center gap-3 animate-fade-slide-in">
          <AlertCircle size={20} className="text-brand-amber flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-sans text-sm font-medium text-text-primary">
              Sala ativa: <span className="font-mono tracking-widest">{activeSala.codigo}</span>
            </p>
            <p className="font-sans text-xs text-text-secondary capitalize">
              {activeSala.status === "em_jogo" ? "Jogo em andamento" : "Aguardando jogadores"}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() =>
                router.push(
                  activeSala.status === "em_jogo"
                    ? `/sala/${activeSala.codigo}/jogo`
                    : `/sala/${activeSala.codigo}/lobby`
                )
              }
              className="px-3 py-1.5 text-xs font-sans font-medium text-brand-lilac hover:text-text-primary transition-colors"
            >
              Retomar
            </button>
            <button
              onClick={handleEncerrarSala}
              disabled={encerrandoSala}
              className="px-3 py-1.5 text-xs font-sans text-brand-red hover:text-red-400 transition-colors disabled:opacity-50"
            >
              Encerrar
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 py-8">
        <div className="text-center mb-4">
          <h1 className="font-display text-5xl font-bold gradient-text mb-2">Dia E</h1>
          <p className="font-sans text-text-disabled text-sm">Verdade ou Desafio</p>
        </div>

        <div className="w-full max-w-xs flex flex-col gap-3">
          <Button
            onClick={() => router.push("/sala/criar")}
            className="w-full"
            size="lg"
          >
            <Plus size={20} className="mr-2" />
            Criar Sala
          </Button>

          {showJoinInput ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
                placeholder="Código da sala (ex: X7K2QP)"
                maxLength={6}
                className="w-full bg-bg-elevated border border-border-subtle focus:border-brand-lilac rounded-xl px-4 py-3 font-mono text-text-primary text-center text-xl tracking-widest focus:outline-none focus:ring-1 focus:ring-brand-lilac transition-colors"
                autoFocus
                aria-label="Código da sala"
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => { setShowJoinInput(false); setJoinCode(""); }}
                  className="flex-1"
                  size="sm"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleJoinRoom}
                  disabled={joinCode.length < 6}
                  className="flex-1"
                  size="sm"
                >
                  Entrar
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setShowJoinInput(true)}
              className="w-full"
              size="lg"
            >
              <LogIn size={20} className="mr-2" />
              Entrar em uma Sala
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
