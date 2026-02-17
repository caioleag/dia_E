"use client";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 50%, color-mix(in srgb, var(--color-brand-primary) 15%, transparent) 0%, transparent 70%), #0A0A0F",
      }}
    >
      {/* Background glow orbs */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--color-brand-primary) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--color-brand-secondary) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Logo + Tagline */}
      <div className="flex flex-col items-center gap-4 mb-16">
        <Image src="/logo.svg" alt="Dia D" width={120} height={120} priority />
        <p className="font-sans text-text-secondary text-base text-center max-w-xs">
          O jogo que transforma a noite em algo inesquecível.
        </p>
      </div>

      {/* Login button */}
      <div className="w-full max-w-xs flex flex-col items-center gap-4">
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-sans font-medium text-base px-8 py-4 rounded-pill min-h-[56px] transition-all duration-150 active:scale-[0.97] hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
          aria-label="Entrar com Google"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          {loading ? "Entrando..." : "Entrar com Google"}
        </button>

        <p className="text-xs font-sans text-text-disabled text-center px-4">
          Ao entrar, você concorda com os termos de uso. Conteúdo adulto — apenas maiores de 18 anos.
        </p>
      </div>
    </main>
  );
}
