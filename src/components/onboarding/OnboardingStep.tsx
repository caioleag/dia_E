"use client";
import Slider from "@/components/ui/Slider";
import Button from "@/components/ui/Button";
import { NIVEL_LABELS } from "@/types";

interface OnboardingStepProps {
  step: number;
  totalSteps: number;
  emoji: string;
  title: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  onNext: () => void;
  onBack?: () => void;
  loading?: boolean;
  isLast?: boolean;
}

export default function OnboardingStep({
  step,
  totalSteps,
  emoji,
  title,
  description,
  value,
  onChange,
  onNext,
  onBack,
  loading,
  isLast,
}: OnboardingStepProps) {
  const progress = step / totalSteps;

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep px-6 pt-safe">
      {/* Progress bar */}
      <div className="py-4">
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-pill transition-all duration-300 ${
                i < step
                  ? "bg-gradient-brand"
                  : i === step - 1
                  ? "bg-gradient-brand opacity-70"
                  : "bg-border-subtle"
              }`}
            />
          ))}
        </div>
        <p className="text-xs font-sans text-text-disabled mt-2 text-right">
          {step} de {totalSteps}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4" aria-hidden="true">
            {emoji}
          </div>
          <h2 className="font-display text-2xl font-bold text-text-primary mb-3">
            {title}
          </h2>
          <p className="font-sans text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        </div>

        {/* Slider */}
        <div className="bg-bg-surface rounded-card p-6 border border-border-subtle">
          <Slider value={value} onChange={onChange} min={0} max={3} />
        </div>

        {/* Level description */}
        <div className="mt-4 text-center">
          <p className="text-xs font-sans text-text-disabled">
            {value === 0 && "Essa categoria nunca aparecerá para você"}
            {value === 1 && "Conteúdo leve e sem muito compromisso"}
            {value === 2 && "Conteúdo intermediário, mais provocativo"}
            {value === 3 && "Conteúdo mais intenso e explícito"}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="pb-safe flex flex-col gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-text-secondary font-sans text-sm text-center py-2 hover:text-text-primary transition-colors"
          >
            Voltar
          </button>
        )}
        <Button
          onClick={onNext}
          loading={loading}
          className="w-full"
        >
          {isLast ? "Começar a jogar" : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
