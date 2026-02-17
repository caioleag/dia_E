"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Avatar from "@/components/ui/Avatar";
import { type User } from "@/types";

interface PlayerRouletteProps {
  players: User[];
  onComplete: (player: User) => void;
  isSpinning: boolean;
}

export function PlayerRoulette({ players, onComplete, isSpinning }: PlayerRouletteProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spinCount, setSpinCount] = useState(0);

  useEffect(() => {
    if (!isSpinning) {
      setSpinCount(0);
      return;
    }

    // Velocidade inicial rápida, desacelera gradualmente
    const baseSpeed = 50;
    const maxSpins = 20;
    const currentSpeed = baseSpeed + (spinCount * 15); // Acelera conforme gira

    if (spinCount < maxSpins) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % players.length);
        setSpinCount((prev) => prev + 1);
      }, currentSpeed);

      return () => clearTimeout(timer);
    } else {
      // Terminou - retornar jogador selecionado
      onComplete(players[currentIndex]);
    }
  }, [isSpinning, spinCount, currentIndex, players, onComplete]);

  if (players.length === 0) return null;

  const displayPlayers = [...players, ...players, ...players]; // Triplicar para efeito circular
  const offset = currentIndex % players.length;

  return (
    <div className="relative w-full max-w-sm mx-auto overflow-hidden py-8">
      {/* Indicador central */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="w-24 h-24 rounded-full border-4 border-brand-lilac bg-brand-lilac/10 backdrop-blur-sm" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-brand-lilac" />
        </div>
      </div>

      {/* Carrossel de avatares */}
      <motion.div
        className="flex items-center justify-center gap-6"
        animate={{
          x: `-${offset * 120}px`,
        }}
        transition={{
          duration: 0.05,
          ease: "linear",
        }}
      >
        {displayPlayers.map((player, idx) => {
          const isCenter = idx % players.length === offset;
          return (
            <motion.div
              key={`${player.id}-${idx}`}
              className="flex flex-col items-center gap-2 flex-shrink-0"
              animate={{
                scale: isCenter ? 1.2 : 0.7,
                opacity: isCenter ? 1 : 0.4,
              }}
              transition={{ duration: 0.2 }}
            >
              <Avatar
                src={player.foto_url}
                alt={player.nome ?? "Jogador"}
                size="lg"
                className={isCenter ? "shadow-glow ring-2 ring-brand-lilac" : ""}
              />
              {isCenter && (
                <p className="font-sans text-sm font-medium text-text-primary">
                  {player.nome?.split(" ")[0]}
                </p>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Efeito de desfoque nas bordas */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-bg-deep to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-bg-deep to-transparent pointer-events-none" />
    </div>
  );
}
