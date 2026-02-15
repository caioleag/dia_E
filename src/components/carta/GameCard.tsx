"use client";
import { motion } from "framer-motion";
import Avatar from "@/components/ui/Avatar";
import { TipoBadge } from "@/components/ui/Badge";
import { type Item, type User } from "@/types";

interface GameCardProps {
  item: Item;
  segundoJogador: User | null;
  emoji: string;
}

export default function GameCard({ item, segundoJogador, emoji }: GameCardProps) {
  const conteudo = segundoJogador
    ? item.conteudo.replace(/\[JOGADOR\]/g, segundoJogador.nome?.split(" ")[0] ?? "Jogador")
    : item.conteudo;

  return (
    <motion.div
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="w-full max-w-md bg-bg-surface rounded-card-lg p-8 border gradient-border shadow-card-lg relative"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Header badges */}
      <div className="flex items-center justify-between mb-6">
        <TipoBadge tipo={item.tipo} />
        <span className="flex items-center gap-1.5 text-xs font-sans font-medium text-brand-lilac">
          <span aria-hidden="true">{emoji}</span>
          {item.categoria}
        </span>
      </div>

      {/* Card content */}
      <div className="text-center mb-6">
        <p className="font-display text-2xl md:text-3xl font-bold text-text-primary leading-tight">
          {conteudo}
        </p>
      </div>

      {/* Second player if applicable */}
      {segundoJogador && (
        <div className="mt-6 pt-6 border-t border-border-subtle flex items-center justify-center gap-3">
          <Avatar src={segundoJogador.foto_url} alt={segundoJogador.nome ?? "Jogador"} size="sm" />
          <span className="font-sans text-sm text-text-secondary">
            com <span className="text-text-primary font-medium">{segundoJogador.nome}</span>
          </span>
        </div>
      )}

      {/* Nivel indicator */}
      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center">
        <span className="text-xs font-sans font-bold text-text-secondary">{item.nivel}</span>
      </div>
    </motion.div>
  );
}
