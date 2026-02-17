"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface ThemeColors {
  id: string;
  nome: string;
  descricao: string;
  emoji: string;
  primary: string;    // Cor mais escura do gradiente
  secondary: string;  // Cor mais clara do gradiente
  accent: string;     // Cor de destaque
}

export const TEMAS: ThemeColors[] = [
  {
    id: "rose",
    nome: "Rosa Vibrante",
    descricao: "O clássico Dia E",
    emoji: "💗",
    primary: "#6B21A8",
    secondary: "#EC4899",
    accent: "#A855F7",
  },
  {
    id: "ocean",
    nome: "Oceano",
    descricao: "Azul profundo e refrescante",
    emoji: "🌊",
    primary: "#1E40AF",
    secondary: "#06B6D4",
    accent: "#3B82F6",
  },
  {
    id: "emerald",
    nome: "Esmeralda",
    descricao: "Verde vibrante e natural",
    emoji: "💚",
    primary: "#047857",
    secondary: "#10B981",
    accent: "#059669",
  },
  {
    id: "sunset",
    nome: "Pôr do Sol",
    descricao: "Laranja quente e energético",
    emoji: "🌅",
    primary: "#C2410C",
    secondary: "#F59E0B",
    accent: "#EA580C",
  },
  {
    id: "cherry",
    nome: "Cereja",
    descricao: "Vermelho intenso e apaixonado",
    emoji: "🍒",
    primary: "#BE123C",
    secondary: "#F43F5E",
    accent: "#E11D48",
  },
  {
    id: "galaxy",
    nome: "Galáxia",
    descricao: "Roxo profundo e místico",
    emoji: "🌌",
    primary: "#5B21B6",
    secondary: "#8B5CF6",
    accent: "#7C3AED",
  },
  {
    id: "mint",
    nome: "Menta",
    descricao: "Verde menta suave",
    emoji: "🍃",
    primary: "#0D9488",
    secondary: "#14B8A6",
    accent: "#0F766E",
  },
  {
    id: "lavender",
    nome: "Lavanda",
    descricao: "Roxo suave e relaxante",
    emoji: "🪻",
    primary: "#7E22CE",
    secondary: "#C084FC",
    accent: "#9333EA",
  },
];

interface ThemeContextType {
  tema: ThemeColors;
  setTema: (temaId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTemaState] = useState<ThemeColors>(TEMAS[0]);

  useEffect(() => {
    // Carregar tema salvo do localStorage
    const savedThemeId = localStorage.getItem("dia-e-theme");
    if (savedThemeId) {
      const foundTheme = TEMAS.find((t) => t.id === savedThemeId);
      if (foundTheme) {
        setTemaState(foundTheme);
        applyTheme(foundTheme);
      }
    }
  }, []);

  const setTema = (temaId: string) => {
    const foundTheme = TEMAS.find((t) => t.id === temaId);
    if (foundTheme) {
      setTemaState(foundTheme);
      applyTheme(foundTheme);
      localStorage.setItem("dia-e-theme", temaId);
    }
  };

  const applyTheme = (theme: ThemeColors) => {
    // Aplicar CSS variables no root
    const root = document.documentElement;
    root.style.setProperty("--color-brand-primary", theme.primary);
    root.style.setProperty("--color-brand-secondary", theme.secondary);
    root.style.setProperty("--color-brand-accent", theme.accent);
  };

  return (
    <ThemeContext.Provider value={{ tema, setTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
}
