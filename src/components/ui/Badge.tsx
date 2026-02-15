import { cn } from "@/lib/utils";
import { type TipoItem } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "verdade" | "desafio" | "categoria" | "nivel";
  className?: string;
}

export default function Badge({ children, variant = "categoria", className }: BadgeProps) {
  const variants = {
    verdade: "bg-brand-amber text-bg-deep",
    desafio: "bg-brand-red text-white",
    categoria: "bg-bg-elevated border border-border-subtle text-brand-lilac",
    nivel: "bg-bg-elevated border border-border-subtle text-text-secondary",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-sans font-medium tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function TipoBadge({ tipo }: { tipo: TipoItem }) {
  return (
    <Badge variant={tipo === "Verdade" ? "verdade" : "desafio"}>
      {tipo}
    </Badge>
  );
}
