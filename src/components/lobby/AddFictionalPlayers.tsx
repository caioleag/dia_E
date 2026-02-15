"use client";
import { useState } from "react";
import { type JogadorFicticio, type Modo, NIVEL_LABELS } from "@/types";
import Button from "@/components/ui/Button";
import { Plus, X, User } from "lucide-react";

interface AddFictionalPlayersProps {
  modo: Modo;
  jogadores: JogadorFicticio[];
  onJogadoresChange: (jogadores: JogadorFicticio[]) => void;
}

export default function AddFictionalPlayers({
  modo,
  jogadores,
  onJogadoresChange,
}: AddFictionalPlayersProps) {
  const [nomeInput, setNomeInput] = useState("");
  const [nivelInput, setNivelInput] = useState(2);

  const minPlayers = modo === "casal" ? 2 : 3;
  const maxPlayers = modo === "casal" ? 2 : 10;

  function handleAdd() {
    const nome = nomeInput.trim();
    if (!nome) return;
    if (jogadores.length >= maxPlayers) return;

    onJogadoresChange([...jogadores, { nome, nivel: nivelInput }]);
    setNomeInput("");
  }

  function handleRemove(index: number) {
    onJogadoresChange(jogadores.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="font-sans text-xs text-text-secondary uppercase tracking-widest">
          Adicionar Jogador
        </label>

        {/* Nome Input */}
        <input
          type="text"
          value={nomeInput}
          onChange={(e) => setNomeInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Nome do jogador"
          maxLength={30}
          className="w-full bg-bg-elevated border border-border-subtle focus:border-brand-lilac rounded-xl px-4 py-3 font-sans text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-lilac transition-colors"
        />

        {/* Nível Selector */}
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((nivel) => (
            <button
              key={nivel}
              onClick={() => setNivelInput(nivel)}
              className={`flex-1 px-3 py-2 rounded-lg border-2 font-sans text-xs font-medium transition-all ${
                nivelInput === nivel
                  ? "border-brand-lilac bg-bg-elevated text-text-primary"
                  : "border-border-subtle bg-bg-surface text-text-secondary"
              }`}
            >
              {NIVEL_LABELS[nivel]}
            </button>
          ))}
        </div>

        <Button
          onClick={handleAdd}
          disabled={!nomeInput.trim() || jogadores.length >= maxPlayers}
          size="sm"
          className="w-full"
        >
          <Plus size={16} className="mr-1" />
          Adicionar
        </Button>
      </div>

      {/* Lista de Jogadores */}
      {jogadores.length > 0 && (
        <div>
          <p className="font-sans text-xs text-text-secondary uppercase tracking-widest mb-3">
            {jogadores.length} jogador{jogadores.length !== 1 ? "es" : ""}
            {modo === "casal" ? " / 2 necessários" : ` / mínimo ${minPlayers}`}
          </p>

          <div className="flex flex-col gap-2">
            {jogadores.map((jogador, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-bg-elevated border border-border-subtle rounded-xl"
              >
                <div className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-medium text-text-primary truncate">
                    {jogador.nome}
                  </p>
                  <p className="font-sans text-xs text-text-secondary">
                    Nível {jogador.nivel} - {NIVEL_LABELS[jogador.nivel]}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="p-2 rounded-full hover:bg-bg-deep transition-colors"
                  aria-label="Remover"
                >
                  <X size={16} className="text-text-disabled" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
