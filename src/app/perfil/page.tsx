"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Slider from "@/components/ui/Slider";
import { CATEGORIAS_GRUPO, CATEGORIAS_CASAL, NIVEL_LABELS, type User, type Preferencia } from "@/types";
import { ArrowLeft, Pencil, Check, X, LogOut, RotateCcw } from "lucide-react";
import { FavoritasGrid } from "@/components/perfil/FavoritasGrid";
import ThemeSelector from "@/components/perfil/ThemeSelector";

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null>(null);
  const [prefs, setPrefs] = useState<Preferencia[]>([]);
  const [editingNome, setEditingNome] = useState(false);
  const [nomeValue, setNomeValue] = useState("");
  const [generoValue, setGeneroValue] = useState("");
  const [prefParceiroValue, setPrefParceiroValue] = useState("qualquer");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [showResetModal, setShowResetModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) { router.push("/login"); return; }

    const [{ data: userData }, { data: prefsData }] = await Promise.all([
      supabase.from("users").select("*").eq("id", authUser.id).single(),
      supabase.from("preferencias").select("*").eq("user_id", authUser.id),
    ]);

    if (userData) {
      setUser(userData as User);
      setNomeValue(userData.nome ?? "");
      setGeneroValue(userData.genero ?? "");
      setPrefParceiroValue(userData.preferencia_parceiro ?? "qualquer");
    }
    if (prefsData) {
      setPrefs(prefsData as Preferencia[]);
      const initial: Record<string, number> = {};
      prefsData.forEach((p: Preferencia) => {
        initial[`${p.modo}-${p.categoria}`] = p.nivel_max;
      });
      setSliderValues(initial);
    }
    setLoading(false);
  }

  async function saveNome() {
    if (!user) return;
    setSaving(true);
    await supabase.from("users").update({ nome: nomeValue }).eq("id", user.id);
    setUser((u) => u ? { ...u, nome: nomeValue } : u);
    setEditingNome(false);
    setSaving(false);
  }

  async function saveIdentidade(genero: string, prefParceiro: string) {
    if (!user) return;
    await supabase.from("users").update({ genero: genero || null, preferencia_parceiro: prefParceiro }).eq("id", user.id);
    setUser((u) => u ? { ...u, genero: genero || null, preferencia_parceiro: prefParceiro } : u);
  }

  async function savePref(modo: string, categoria: string, nivel: number) {
    if (!user) return;
    await supabase.from("preferencias").upsert(
      { user_id: user.id, modo, categoria, nivel_max: nivel, updated_at: new Date().toISOString() },
      { onConflict: "user_id,modo,categoria" }
    );
    setPrefs((prev) =>
      prev.map((p) =>
        p.modo === modo && p.categoria === categoria ? { ...p, nivel_max: nivel } : p
      )
    );
  }

  async function resetPrefs() {
    if (!user) return;
    setSaving(true);
    const allCats = [
      ...CATEGORIAS_GRUPO.map((c) => ({ user_id: user.id, modo: "grupo", categoria: c.nome, nivel_max: 1, updated_at: new Date().toISOString() })),
      ...CATEGORIAS_CASAL.map((c) => ({ user_id: user.id, modo: "casal", categoria: c.nome, nivel_max: 1, updated_at: new Date().toISOString() })),
    ];
    await supabase.from("preferencias").upsert(allCats, { onConflict: "user_id,modo,categoria" });
    const initial: Record<string, number> = {};
    allCats.forEach((p) => { initial[`${p.modo}-${p.categoria}`] = 1; });
    setSliderValues(initial);
    setShowResetModal(false);
    setSaving(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const getPrefLevel = (modo: string, categoria: string) =>
    sliderValues[`${modo}-${categoria}`] ?? 1;

  const levelColors: Record<number, string> = {
    0: "text-text-disabled border-border-subtle",
    1: "text-brand-lilac border-brand-lilac/30",
    2: "text-brand-amber border-brand-amber/30",
    3: "text-brand-red border-brand-red/30",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-lilac border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg-deep flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-6 pt-safe py-4 border-b border-border-subtle flex-shrink-0">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 rounded-full hover:bg-bg-elevated transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} className="text-text-secondary" />
        </button>
        <h1 className="font-display text-xl font-bold text-text-primary">Meu Perfil</h1>
      </header>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-6 space-y-6 max-w-lg mx-auto w-full">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <Avatar src={user?.foto_url} alt={user?.nome ?? "Usuário"} size="xl" />
          <div className="flex-1 min-w-0">
            {editingNome ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nomeValue}
                  onChange={(e) => setNomeValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveNome()}
                  className="flex-1 bg-bg-elevated border border-brand-lilac rounded-xl px-3 py-2 text-text-primary font-sans text-base focus:outline-none min-w-0"
                  autoFocus
                  aria-label="Nome"
                />
                <button onClick={saveNome} className="p-2 text-brand-lilac hover:text-text-primary" aria-label="Salvar nome">
                  <Check size={18} />
                </button>
                <button onClick={() => setEditingNome(false)} className="p-2 text-text-secondary" aria-label="Cancelar">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold text-text-primary truncate">
                  {user?.nome}
                </span>
                <button
                  onClick={() => setEditingNome(true)}
                  className="p-1 text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
                  aria-label="Editar nome"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}
            <p className="font-sans text-sm text-text-disabled truncate mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Preferências de Parceiro */}
        <section>
          <h2 className="font-sans text-sm font-medium text-text-secondary uppercase tracking-widest mb-3">
            Preferências de Parceiro
          </h2>
          <div className="bg-bg-surface rounded-card border border-border-subtle p-4 space-y-4">
            <div>
              <p className="font-sans text-xs text-text-disabled mb-2">Como você se identifica?</p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "homem", label: "Homem" },
                  { value: "mulher", label: "Mulher" },
                  { value: "nao_binario", label: "Não-binário" },
                  { value: "", label: "Prefiro não dizer" },
                ] as { value: string; label: string }[]).map((op) => (
                  <button
                    key={op.value}
                    onClick={() => {
                      setGeneroValue(op.value);
                      saveIdentidade(op.value, prefParceiroValue);
                    }}
                    className={`py-2 px-3 rounded-xl border font-sans text-sm font-medium transition-all ${
                      generoValue === op.value
                        ? "border-brand-lilac bg-brand-lilac/10 text-brand-lilac"
                        : "border-border-subtle bg-bg-elevated text-text-secondary hover:border-brand-lilac/50"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-sans text-xs text-text-disabled mb-2">Em atividades físicas, prefiro fazer par com...</p>
              <div className="flex flex-col gap-2">
                {([
                  { value: "qualquer", label: "Qualquer pessoa" },
                  { value: "mesmo_genero", label: "Mesmo gênero" },
                  { value: "genero_diferente", label: "Gênero diferente" },
                ] as { value: string; label: string }[]).map((op) => (
                  <button
                    key={op.value}
                    onClick={() => {
                      setPrefParceiroValue(op.value);
                      saveIdentidade(generoValue, op.value);
                    }}
                    className={`py-2 px-3 rounded-xl border font-sans text-sm font-medium transition-all text-left ${
                      prefParceiroValue === op.value
                        ? "border-brand-lilac bg-brand-lilac/10 text-brand-lilac"
                        : "border-border-subtle bg-bg-elevated text-text-secondary hover:border-brand-lilac/50"
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Preferences — Grupo */}
        <section>
          <h2 className="font-sans text-sm font-medium text-text-secondary uppercase tracking-widest mb-3">
            Modo Grupo
          </h2>
          <div className="bg-bg-surface rounded-card border border-border-subtle overflow-hidden">
            {CATEGORIAS_GRUPO.map((cat, i) => {
              const level = getPrefLevel("grupo", cat.nome);
              const key = `grupo-${cat.nome}`;
              const isExpanded = expandedCat === key;
              return (
                <div key={cat.nome} className={i > 0 ? "border-t border-border-subtle" : ""}>
                  <button
                    onClick={() => setExpandedCat(isExpanded ? null : key)}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-bg-elevated/50 transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <span className="flex items-center gap-2 font-sans text-sm text-text-primary">
                      <span aria-hidden="true">{cat.emoji}</span>
                      {cat.nome}
                    </span>
                    <span className={`text-xs font-sans px-2.5 py-1 rounded-pill border ${levelColors[level]}`}>
                      {NIVEL_LABELS[level]}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <Slider
                        value={level}
                        onChange={(v) => {
                          setSliderValues((p) => ({ ...p, [key]: v }));
                          savePref("grupo", cat.nome, v);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Preferences — Casal */}
        <section>
          <h2 className="font-sans text-sm font-medium text-text-secondary uppercase tracking-widest mb-3">
            Modo Casal
          </h2>
          <div className="bg-bg-surface rounded-card border border-border-subtle overflow-hidden">
            {CATEGORIAS_CASAL.map((cat, i) => {
              const level = getPrefLevel("casal", cat.nome);
              const key = `casal-${cat.nome}`;
              const isExpanded = expandedCat === key;
              return (
                <div key={cat.nome} className={i > 0 ? "border-t border-border-subtle" : ""}>
                  <button
                    onClick={() => setExpandedCat(isExpanded ? null : key)}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-bg-elevated/50 transition-colors"
                    aria-expanded={isExpanded}
                  >
                    <span className="flex items-center gap-2 font-sans text-sm text-text-primary">
                      <span aria-hidden="true">{cat.emoji}</span>
                      {cat.nome}
                    </span>
                    <span className={`text-xs font-sans px-2.5 py-1 rounded-pill border ${levelColors[level]}`}>
                      {NIVEL_LABELS[level]}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      <Slider
                        value={level}
                        onChange={(v) => {
                          setSliderValues((p) => ({ ...p, [key]: v }));
                          savePref("casal", cat.nome, v);
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Tema de Cores */}
        <section>
          <ThemeSelector />
        </section>

        {/* Cartas Favoritas */}
        {user && (
          <section>
            <h2 className="font-sans text-sm font-medium text-text-secondary uppercase tracking-widest mb-3">
              Cartas Favoritas
            </h2>
            <div className="bg-bg-surface rounded-card border border-border-subtle p-4">
              <FavoritasGrid userId={user.id} />
            </div>
          </section>
        )}

        {/* Reset + Sign out */}
        <div className="flex flex-col gap-3 pb-safe">
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full py-3 font-sans text-sm font-medium text-brand-red hover:text-red-400 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            Resetar Preferências
          </button>
          <button
            onClick={handleSignOut}
            className="w-full py-3 font-sans text-sm text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Sair da conta
          </button>
        </div>
      </div>

      {/* Reset modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50 px-6 pb-safe" onClick={() => setShowResetModal(false)}>
          <div
            className="bg-bg-surface rounded-t-card-lg w-full max-w-sm p-6 animate-fade-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-bold text-text-primary mb-2">
              Resetar Preferências?
            </h3>
            <p className="font-sans text-sm text-text-secondary mb-6">
              Todos os níveis voltarão para 1 (Leve). Isso não pode ser desfeito.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowResetModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button variant="danger" onClick={resetPrefs} loading={saving} className="flex-1">
                Resetar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
