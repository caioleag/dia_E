"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";

export function NavigationEvents() {
  const pathname = usePathname();

  useEffect(() => {
    // Iniciar progresso em mudanças de rota
    const handleStart = () => NProgress.start();
    const handleComplete = () => NProgress.done();

    // Listener para clicks em links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      
      if (anchor && anchor.href && !anchor.target) {
        const url = new URL(anchor.href);
        if (url.pathname !== pathname && url.origin === window.location.origin) {
          NProgress.start();
        }
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      handleComplete();
    };
  }, [pathname]);

  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  return null;
}
