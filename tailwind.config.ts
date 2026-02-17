import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "var(--color-brand-primary)",
          pink: "var(--color-brand-secondary)",
          wine: "#9D174D",
          lilac: "var(--color-brand-accent)",
          red: "#F43F5E",
          amber: "#F59E0B",
        },
        bg: {
          deep: "#0A0A0F",
          surface: "#13131C",
          elevated: "#1C1C2A",
        },
        text: {
          primary: "#F1F0F5",
          secondary: "#9B9AAF",
          disabled: "#4A4A62",
        },
        border: {
          subtle: "#2A2A3D",
        },
      },
      borderRadius: {
        pill: "9999px",
        card: "20px",
        "card-lg": "24px",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 30px rgba(168, 85, 247, 0.6), 0 0 60px rgba(236, 72, 153, 0.4)",
        "glow-soft": "0 0 20px rgba(168, 85, 247, 0.4)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
        "card-lg": "0 8px 32px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.8" },
          "50%": { opacity: "1" },
        },
        "fade-slide-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "fade-slide-in": "fade-slide-in 0.3s ease-in-out",
        "slide-in-right": "slide-in-right 0.25s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
