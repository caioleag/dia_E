"use client";
import { useEffect } from "react";

export default function PWAInstallPrompt() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the default mini-infobar from appearing
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      console.log("[PWA] Install prompt ready");

      // Dispatch custom event that can be caught elsewhere
      window.dispatchEvent(new Event("pwa-install-available"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("[PWA] App is running in standalone mode");
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  return null;
}
