"use client";

import { useTheme, TEMAS } from "@/lib/theme-context";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useSound } from "@/lib/hooks/useSound";

export default function ThemeSelector() {
  const { tema, setTema } = useTheme();
  const { play } = useSound();

  const handleSelectTema = (temaId: string) => {
    setTema(temaId);
    play("click", 0.3);
    if ("vibrate" in navigator) navigator.vibrate(20);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-sans text-sm font-semibold text-text-primary uppercase tracking-widest">
            Tema de Cores
          </h3>
          <p className="font-sans text-xs text-text-secondary mt-1">
            Personalize as cores do aplicativo
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TEMAS.map((t) => {
          const isSelected = tema.id === t.id;
          
          return (
            <motion.button
              key={t.id}
              onClick={() => handleSelectTema(t.id)}
              className={`relative p-4 rounded-card border-2 transition-all ${
                isSelected
                  ? "border-white/30 bg-bg-elevated"
                  : "border-border-subtle bg-bg-surface hover:border-white/10"
              }`}
              whileTap={{ scale: 0.97 }}
            >
              {/* Gradiente de preview */}
              <div
                className="w-full h-16 rounded-lg mb-3 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                }}
              >
                {/* Brilho sutil */}
                <div className="absolute inset-0 bg-white/10" />
                
                {/* Check mark se selecionado */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center"
                  >
                    <Check size={14} className="text-bg-deep" />
                  </motion.div>
                )}
              </div>

              {/* Info */}
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{t.emoji}</span>
                  <p className={`font-sans text-sm font-medium ${isSelected ? "text-text-primary" : "text-text-secondary"}`}>
                    {t.nome}
                  </p>
                </div>
                <p className="font-sans text-xs text-text-disabled">
                  {t.descricao}
                </p>
              </div>

              {/* Borda brilhante se selecionado */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-card pointer-events-none"
                  style={{
                    boxShadow: `0 0 20px ${t.secondary}40`,
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
