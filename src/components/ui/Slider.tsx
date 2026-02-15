"use client";
import { NIVEL_LABELS } from "@/types";
import { cn } from "@/lib/utils";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export default function Slider({
  value,
  onChange,
  min = 0,
  max = 3,
  className,
}: SliderProps) {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Current level label */}
      <div className="text-center mb-4">
        <span className="font-sans text-sm font-medium text-text-secondary uppercase tracking-widest">
          {NIVEL_LABELS[value]}
        </span>
        <span className="ml-2 text-2xl font-display font-bold gradient-text">
          {value}
        </span>
      </div>

      {/* Slider track */}
      <div className="relative h-6 flex items-center">
        {/* Track background */}
        <div className="w-full h-1.5 bg-border-subtle rounded-pill" />

        {/* Track fill */}
        <div
          className="absolute left-0 h-1.5 bg-gradient-brand rounded-pill transition-all duration-150"
          style={{ width: `${percent}%` }}
        />

        {/* Native input (invisible, over track) */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          aria-label={`Nível: ${NIVEL_LABELS[value]}`}
        />

        {/* Custom thumb */}
        <div
          className="absolute w-6 h-6 rounded-full bg-gradient-brand shadow-glow transition-all duration-150 pointer-events-none"
          style={{
            left: `calc(${percent}% - 12px)`,
          }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-3 px-1">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={cn(
              "text-xs font-sans transition-colors",
              value === n
                ? "text-brand-lilac font-medium"
                : "text-text-disabled hover:text-text-secondary"
            )}
          >
            {NIVEL_LABELS[n]}
          </button>
        ))}
      </div>
    </div>
  );
}
