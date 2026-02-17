"use client";

import { motion, AnimatePresence } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/hooks/useOnlineStatus";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500/95 backdrop-blur-sm text-white px-4 py-2 flex items-center justify-center gap-2 shadow-lg"
          style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
        >
          <WifiOff className="w-4 h-4" />
          <span className="font-sans text-sm font-medium">
            Modo Offline - Usando cartas do cache
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
