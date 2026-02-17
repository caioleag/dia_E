"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CardLevelEffectsProps {
  nivel: number;
}

export function CardLevelEffects({ nivel }: CardLevelEffectsProps) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    if (nivel < 2) return;

    // Gerar partículas
    const particleCount = nivel === 2 ? 6 : 12;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));

    setParticles(newParticles);
  }, [nivel]);

  if (nivel === 1) return null;

  const emoji = nivel === 2 ? "✨" : "🔥";
  const color = nivel === 2 ? "rgba(251, 191, 36, 0.4)" : "rgba(239, 68, 68, 0.5)";

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-card-lg">
      {/* Glow de fundo */}
      {nivel === 3 && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Partículas */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-xl"
          initial={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: [`${particle.y}%`, `${particle.y - 50}%`],
            opacity: [0, 1, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: 3,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Brilho nos cantos para nível 3 */}
      {nivel === 3 && (
        <>
          <motion.div
            className="absolute top-0 left-0 w-16 h-16 rounded-full blur-xl"
            style={{ background: color }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-16 h-16 rounded-full blur-xl"
            style={{ background: color }}
            animate={{
              scale: [1.5, 1, 1.5],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}
    </div>
  );
}
