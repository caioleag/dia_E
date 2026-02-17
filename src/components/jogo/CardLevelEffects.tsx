"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CardLevelEffectsProps {
  nivel: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  size: "small" | "medium" | "large";
  duration: number;
}

export function CardLevelEffects({ nivel }: CardLevelEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (nivel < 2) return;

    // Gerar partículas - muito mais para ser visível
    const particleCount = nivel === 2 ? 15 : 25;
    const sizes: Array<"small" | "medium" | "large"> = ["small", "medium", "large"];
    
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      size: sizes[Math.floor(Math.random() * sizes.length)],
      duration: 2 + Math.random() * 2, // Variação de 2-4 segundos
    }));

    setParticles(newParticles);
  }, [nivel]);

  if (nivel === 1) return null;

  const emoji = nivel === 2 ? "✨" : "🔥";
  const color = nivel === 2 ? "rgba(251, 191, 36, 0.5)" : "rgba(239, 68, 68, 0.6)";

  const getSizeClass = (size: "small" | "medium" | "large") => {
    switch (size) {
      case "small": return "text-2xl";
      case "medium": return "text-3xl";
      case "large": return "text-4xl";
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-card-lg">
      {/* Glow de fundo mais intenso */}
      {nivel === 3 && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-orange-500/10 to-yellow-500/20"
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {nivel === 2 && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-yellow-300/10"
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

      {/* Partículas - camada 1 (flutuando) */}
      {particles.slice(0, Math.floor(particles.length / 2)).map((particle) => (
        <motion.div
          key={`float-${particle.id}`}
          className={`absolute ${getSizeClass(particle.size)}`}
          style={{
            filter: "drop-shadow(0 0 8px currentColor)",
          }}
          initial={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            y: [`${particle.y}%`, `${particle.y - 60}%`],
            x: [`${particle.x}%`, `${particle.x + (Math.random() - 0.5) * 20}%`],
            opacity: [0, 0.9, 0.9, 0],
            scale: [0, 1.2, 1, 0.8],
            rotate: [0, 360],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Partículas - camada 2 (laterais) */}
      {particles.slice(Math.floor(particles.length / 2)).map((particle) => (
        <motion.div
          key={`side-${particle.id}`}
          className={`absolute ${getSizeClass(particle.size)}`}
          style={{
            filter: "drop-shadow(0 0 8px currentColor)",
          }}
          initial={{
            x: particle.x < 50 ? "-10%" : "110%",
            y: `${particle.y}%`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            x: particle.x < 50 ? "20%" : "80%",
            y: [`${particle.y}%`, `${Math.random() * 100}%`],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0.5],
            rotate: [0, particle.x < 50 ? 180 : -180],
          }}
          transition={{
            duration: particle.duration * 1.5,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {emoji}
        </motion.div>
      ))}

      {/* Brilhos nos 4 cantos para nível 3 */}
      {nivel === 3 && (
        <>
          <motion.div
            className="absolute top-0 left-0 w-24 h-24 rounded-full blur-2xl"
            style={{ background: color }}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl"
            style={{ background: color }}
            animate={{
              scale: [1.8, 1, 1.8],
              opacity: [0.7, 0.4, 0.7],
            }}
            transition={{
              duration: 2,
              delay: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl"
            style={{ background: color }}
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 2,
              delay: 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-24 h-24 rounded-full blur-2xl"
            style={{ background: color }}
            animate={{
              scale: [1.8, 1, 1.8],
              opacity: [0.7, 0.4, 0.7],
            }}
            transition={{
              duration: 2,
              delay: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </>
      )}

      {/* Borda pulsante para nível 3 */}
      {nivel === 3 && (
        <motion.div
          className="absolute inset-0 rounded-card-lg border-2"
          style={{ borderColor: "rgba(239, 68, 68, 0.5)" }}
          animate={{
            borderColor: ["rgba(239, 68, 68, 0.3)", "rgba(251, 191, 36, 0.6)", "rgba(239, 68, 68, 0.3)"],
            boxShadow: [
              "0 0 10px rgba(239, 68, 68, 0.3)",
              "0 0 30px rgba(251, 191, 36, 0.6)",
              "0 0 10px rgba(239, 68, 68, 0.3)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Borda suave para nível 2 */}
      {nivel === 2 && (
        <motion.div
          className="absolute inset-0 rounded-card-lg border-2"
          style={{ borderColor: "rgba(251, 191, 36, 0.4)" }}
          animate={{
            borderColor: ["rgba(251, 191, 36, 0.2)", "rgba(251, 191, 36, 0.6)", "rgba(251, 191, 36, 0.2)"],
            boxShadow: [
              "0 0 10px rgba(251, 191, 36, 0.2)",
              "0 0 20px rgba(251, 191, 36, 0.5)",
              "0 0 10px rgba(251, 191, 36, 0.2)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}
