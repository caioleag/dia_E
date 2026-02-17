"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (!isSpinning) {
      setSpinCount(0);
      setSkipped(false);
      return;
    }

    // Se foi pulado, termina imediatamente
    if (skipped) {
      onComplete(players[currentIndex]);
      return;
    }

    // Velocidade inicial rápida, desacelera gradualmente
    const baseSpeed = 80;
    const maxSpins = 30;
    const slowdownFactor = Math.min(spinCount / 15, 1);
    const currentSpeed = baseSpeed + (slowdownFactor * 300);

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
  }, [isSpinning, spinCount, currentIndex, players, onComplete, skipped]);

  if (players.length === 0) return null;

  // Criar array circular de jogadores para efeito infinito
  const getVisiblePlayers = () => {
    const result = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + players.length) % players.length;
      result.push({ player: players[index], offset: i, key: `${players[index].id}-${i}` });
    }
    return result;
  };

  const visiblePlayers = getVisiblePlayers();

  const handleSkip = () => {
    if (isSpinning && !skipped) {
      setSkipped(true);
    }
  };

  return (
    <div 
      className="relative w-full flex items-center justify-center cursor-pointer py-8"
      onClick={handleSkip}
      role="button"
      aria-label="Clique para pular animação"
    >
      <div className="relative w-full h-32 flex items-center justify-center">
        {/* Indicador central fixo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="w-20 h-20 rounded-full border-3 border-brand-lilac shadow-lg" 
            style={{ boxShadow: "0 0 20px rgba(168, 85, 247, 0.4)" }}
          />
        </div>

        {/* Container dos avatares */}
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="sync">
            {visiblePlayers.map(({ player, offset, key }) => {
              const isCenter = offset === 0;
              const distance = Math.abs(offset);
              
              return (
                <motion.div
                  key={key}
                  className="absolute flex flex-col items-center gap-1"
                  initial={{ x: offset * 90, scale: 0.5, opacity: 0 }}
                  animate={{
                    x: offset * 90,
                    scale: isCenter ? 1 : Math.max(0.5, 1 - distance * 0.3),
                    opacity: isCenter ? 1 : Math.max(0.2, 1 - distance * 0.4),
                    zIndex: isCenter ? 10 : 5 - distance,
                  }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                >
                  <div className={`${isCenter ? "ring-4 ring-brand-lilac rounded-full shadow-xl" : ""}`}>
                    <Avatar
                      src={player.foto_url}
                      alt={player.nome ?? "Jogador"}
                      size="lg"
                    />
                  </div>
                  {isCenter && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-sans text-sm font-semibold text-text-primary mt-1"
                    >
                      {player.nome?.split(" ")[0]}
                    </motion.p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Gradientes laterais para fade */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg-deep via-bg-deep/50 to-transparent pointer-events-none z-30" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg-deep via-bg-deep/50 to-transparent pointer-events-none z-30" />
      </div>
      
      {/* Dica para pular */}
      {isSpinning && !skipped && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-1 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <p className="font-sans text-xs text-text-disabled text-center">
            Toque para pular
          </p>
        </motion.div>
      )}
    </div>
  );
}
