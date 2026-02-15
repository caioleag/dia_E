"use client";
import { CATEGORIAS_GRUPO, CATEGORIAS_CASAL, type Modo } from "@/types";

interface CategorySelectorProps {
  modo: Modo;
  selecionadas: string[];
  onChange: (categorias: string[]) => void;
}

export default function CategorySelector({ modo, selecionadas, onChange }: CategorySelectorProps) {
  const categorias = modo === "grupo" ? CATEGORIAS_GRUPO : CATEGORIAS_CASAL;

  function toggle(nome: string) {
    if (selecionadas.includes(nome)) {
      if (selecionadas.length <= 1) return; // mínimo 1 categoria
      onChange(selecionadas.filter((c) => c !== nome));
    } else {
      onChange([...selecionadas, nome]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-sans text-sm font-medium text-text-secondary">
          Categorias da sessão
        </span>
        <span className="font-sans text-xs text-text-disabled">
          {selecionadas.length}/{categorias.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {categorias.map((cat) => {
          const ativa = selecionadas.includes(cat.nome);
          return (
            <button
              key={cat.codigo}
              onClick={() => toggle(cat.nome)}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-sans text-sm transition-all",
                ativa
                  ? "bg-brand-lilac/20 border border-brand-lilac text-brand-lilac"
                  : "bg-bg-elevated border border-border-subtle text-text-disabled",
              ].join(" ")}
            >
              <span>{cat.emoji}</span>
              <span>{cat.nome}</span>
            </button>
          );
        })}
      </div>

      {selecionadas.length === 1 && (
        <p className="font-sans text-xs text-text-disabled">
          Mínimo de 1 categoria ativa
        </p>
      )}
    </div>
  );
}
