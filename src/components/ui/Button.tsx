"use client";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/hooks/useSound";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  soundOnClick?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      soundOnClick = true,
      onClick,
      children,
      ...props
    },
    ref
  ) => {
    const { play } = useSound();
    const base =
      "inline-flex items-center justify-center rounded-pill font-sans font-medium transition-all duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-lilac focus-visible:ring-offset-2 focus-visible:ring-offset-bg-deep select-none disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-gradient-brand text-white shadow-glow hover:brightness-110 disabled:opacity-40 disabled:shadow-none animate-glow-pulse",
      secondary:
        "bg-transparent border border-border-subtle text-text-secondary hover:border-brand-purple hover:text-text-primary disabled:opacity-40",
      ghost:
        "bg-transparent text-text-secondary hover:text-text-primary disabled:opacity-40",
      danger:
        "bg-brand-red text-white hover:brightness-110 disabled:opacity-40",
    };

    const sizes = {
      sm: "px-5 py-2 text-sm min-h-[40px]",
      md: "px-8 py-4 text-base min-h-[56px]",
      lg: "px-10 py-4 text-lg min-h-[64px]",
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (soundOnClick && !disabled && !loading) {
        play("click", 0.3);
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
