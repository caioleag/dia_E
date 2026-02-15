"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import OnboardingStep from "@/components/onboarding/OnboardingStep";
import Button from "@/components/ui/Button";
import { CATEGORIAS_GRUPO, CATEGORIAS_CASAL } from "@/types";

const STORAGE_KEY = "dia_e_onboarding_progress";

interface OnboardingState {
  step: number;
  grupo: Record<string, number>;
  casal: Record<string, number>;
}

const defaultState = (): OnboardingState => ({
  step: 0,
  grupo: Object.fromEntries(CATEGORIAS_GRUPO.map((c) => [c.nome, 1])),
  casal: Object.fromEntries(CATEGORIAS_CASAL.map((c) => [c.nome, 1])),
});

// Steps: 0 = welcome, 1-6 = grupo, 7-14 = casal, 15 = confirm
const TOTAL_CONFIG_STEPS = CATEGORIAS_GRUPO.length + CATEGORIAS_CASAL.length;
const TOTAL_STEPS = TOTAL_CONFIG_STEPS + 2; // welcome + confirm

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as OnboardingState;
        setState(parsed);
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Save progress to localStorage on every change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, loaded]);

  function setSliderValue(modo: "grupo" | "casal", categoria: string, value: number) {
    setState((prev) => ({
      ...prev,
      [modo]: { ...prev[modo], [categoria]: value },
    }));
  }

  async function handleFinish() {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Build all preference records
      const prefs = [
        ...CATEGORIAS_GRUPO.map((c) => ({
          user_id: user.id,
          modo: "grupo" as const,
          categoria: c.nome,
          nivel_max: state.grupo[c.nome] ?? 1,
        })),
        ...CATEGORIAS_CASAL.map((c) => ({
          user_id: user.id,
          modo: "casal" as const,
          categoria: c.nome,
          nivel_max: state.casal[c.nome] ?? 1,
        })),
      ];

      // Upsert all preferences
      const { error: prefsError } = await supabase
        .from("preferencias")
        .upsert(prefs, { onConflict: "user_id,modo,categoria" });

      if (prefsError) throw prefsError;

      // Mark onboarding complete
      const { error: userError } = await supabase
        .from("users")
        .update({ onboarding_completo: true })
        .eq("id", user.id);

      if (userError) throw userError;

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEY);

      // Check if there's a pending sala to join
      const pendingSala = localStorage.getItem("dia_e_pending_sala");
      if (pendingSala) {
        localStorage.removeItem("dia_e_pending_sala");
        router.push(`/sala/${pendingSala}`);
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return null;

  const { step } = state;

  // Welcome screen
  if (step === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-deep px-6 justify-center items-center text-center">
        <div
          aria-hidden="true"
          className="text-6xl mb-6"
        >
          🎭
        </div>
        <h1 className="font-display text-3xl font-bold text-text-primary mb-4">
          Bem-vindo ao Dia E
        </h1>
        <p className="font-sans text-text-secondary text-base leading-relaxed max-w-sm mb-8">
          Antes de começar, vamos configurar suas preferências de conteúdo. Você decide o nível de intensidade para cada categoria — o jogo se adapta a você.
        </p>
        <p className="font-sans text-text-disabled text-sm mb-10 max-w-xs">
          Leva menos de 2 minutos. Você pode editar suas preferências depois no perfil.
        </p>
        <Button
          onClick={() => setState((p) => ({ ...p, step: 1 }))}
          className="w-full max-w-xs"
        >
          Configurar preferências
        </Button>
      </div>
    );
  }

  // Confirm screen
  if (step === TOTAL_CONFIG_STEPS + 1) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-deep px-6 justify-center items-center text-center">
        <div className="text-6xl mb-6" aria-hidden="true">✅</div>
        <h2 className="font-display text-2xl font-bold text-text-primary mb-4">
          Tudo configurado!
        </h2>
        <p className="font-sans text-text-secondary text-base leading-relaxed max-w-sm mb-10">
          Suas preferências foram salvas. O jogo vai respeitar os limites que você definiu para cada categoria.
        </p>
        <Button onClick={handleFinish} loading={saving} className="w-full max-w-xs">
          Começar a jogar
        </Button>
      </div>
    );
  }

  // Grupo steps (1 to 6)
  if (step <= CATEGORIAS_GRUPO.length) {
    const cat = CATEGORIAS_GRUPO[step - 1];
    const categoryDescriptions: Record<string, string> = {
      "Verbal / Confissão": "Confissões, perguntas íntimas e revelações verbais.",
      "Toque": "Contato físico não íntimo: mãos, costas, ombros.",
      "Beijo": "Beijos de diferentes tipos e intensidades.",
      "Performance": "Danças, encenações e atuações diante do grupo.",
      "Exposição Corporal": "Revelar partes do corpo de forma progressiva.",
      "Contato Íntimo": "Contato físico mais próximo e sugestivo.",
    };

    return (
      <OnboardingStep
        step={step}
        totalSteps={TOTAL_CONFIG_STEPS}
        emoji={cat.emoji}
        title={`Modo Grupo — ${cat.nome}`}
        description={categoryDescriptions[cat.nome] ?? cat.nome}
        value={state.grupo[cat.nome] ?? 1}
        onChange={(v) => setSliderValue("grupo", cat.nome, v)}
        onNext={() => setState((p) => ({ ...p, step: p.step + 1 }))}
        onBack={step > 1 ? () => setState((p) => ({ ...p, step: p.step - 1 })) : undefined}
        isLast={step === CATEGORIAS_GRUPO.length + CATEGORIAS_CASAL.length}
      />
    );
  }

  // Casal steps (7 to 14)
  const casalIdx = step - CATEGORIAS_GRUPO.length - 1;
  const cat = CATEGORIAS_CASAL[casalIdx];
  const casalDescriptions: Record<string, string> = {
    "Revelação": "Confissões e revelações íntimas entre o casal.",
    "Ato": "Desafios físicos e de proximidade para casais.",
    "Encenação": "Fantasias, roleplay e encenações a dois.",
    "Exposição": "Expor-se de forma progressiva ao parceiro.",
    "Sensorial": "Experiências que aguçam os sentidos.",
    "Resistência": "Desafios de controle e resistência física.",
    "Abertura": "Conversas e explorações de limites e desejos.",
    "Terceiros": "Situações envolvendo fantasias sobre outros.",
  };

  return (
    <OnboardingStep
      step={step}
      totalSteps={TOTAL_CONFIG_STEPS}
      emoji={cat.emoji}
      title={`Modo Casal — ${cat.nome}`}
      description={casalDescriptions[cat.nome] ?? cat.nome}
      value={state.casal[cat.nome] ?? 1}
      onChange={(v) => setSliderValue("casal", cat.nome, v)}
      onNext={() =>
        setState((p) => ({
          ...p,
          step: p.step < TOTAL_CONFIG_STEPS + 1 ? p.step + 1 : p.step,
        }))
      }
      onBack={() => setState((p) => ({ ...p, step: p.step - 1 }))}
      isLast={step === CATEGORIAS_GRUPO.length + CATEGORIAS_CASAL.length}
    />
  );
}
