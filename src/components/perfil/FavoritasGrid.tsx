"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type Favorita, type Item } from "@/types";
import { Star, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

interface FavoritasGridProps {
  userId: string;
}

const ITEMS_PER_PAGE = 5;

export function FavoritasGrid({ userId }: FavoritasGridProps) {
  const [favoritas, setFavoritas] = useState<(Favorita & { items: Item })[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    loadFavoritas();
  }, [userId]);

  const loadFavoritas = async () => {
    setLoading(true);
    const supabase = createClient();
    
    const { data } = await supabase
      .from("favoritas")
      .select("*, items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (data) {
      setFavoritas(data as (Favorita & { items: Item })[]);
    }
    setLoading(false);
  };

  const handleRemove = async (favoritaId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("favoritas")
      .delete()
      .eq("id", favoritaId);

    if (!error) {
      setFavoritas(favoritas.filter((f) => f.id !== favoritaId));
    }
  };

  const toggleShowMore = () => {
    if (visibleCount >= favoritas.length) {
      setVisibleCount(ITEMS_PER_PAGE);
    } else {
      setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, favoritas.length));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-6 h-6 rounded-full border-2 border-brand-lilac border-t-transparent animate-spin mx-auto" />
      </div>
    );
  }

  if (favoritas.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="w-12 h-12 mx-auto mb-3 opacity-30 text-text-disabled" />
        <p className="font-sans text-sm text-text-secondary">
          Você ainda não tem cartas favoritas.
        </p>
        <p className="font-sans text-xs text-text-disabled mt-1">
          Durante o jogo, clique em ⭐ para salvar suas preferidas!
        </p>
      </div>
    );
  }

  const visibleFavoritas = favoritas.slice(0, visibleCount);
  const hasMore = favoritas.length > visibleCount;
  const isExpanded = visibleCount >= favoritas.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans text-sm text-text-secondary flex items-center gap-2">
          <Star className="w-4 h-4 fill-current text-brand-amber" />
          {favoritas.length} carta{favoritas.length !== 1 ? "s" : ""} salva{favoritas.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {visibleFavoritas.map((fav) => (
            <motion.div
              key={fav.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-bg-elevated border border-border-subtle rounded-xl p-3 hover:border-brand-lilac/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                      <Badge variant="categoria" className="text-xs px-2 py-0.5">
                        {fav.items.categoria}
                      </Badge>
                      <Badge variant="nivel" className="text-xs px-2 py-0.5">
                        Nv {fav.items.nivel}
                      </Badge>
                      <Badge 
                        variant={fav.items.tipo === "Verdade" ? "verdade" : "desafio"}
                        className="text-xs px-2 py-0.5"
                      >
                        {fav.items.tipo}
                      </Badge>
                    </div>
                    
                    <p className="font-sans text-sm text-text-primary leading-relaxed">
                      {fav.items.conteudo}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemove(fav.id)}
                    className="p-1.5 text-text-disabled hover:text-brand-red transition-colors rounded-lg hover:bg-bg-deep flex-shrink-0"
                    title="Remover favorita"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {favoritas.length > ITEMS_PER_PAGE && (
        <button
          onClick={toggleShowMore}
          className="w-full py-2.5 font-sans text-sm text-brand-lilac hover:text-brand-pink transition-colors flex items-center justify-center gap-2 rounded-lg hover:bg-bg-elevated"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Mostrar mais ({favoritas.length - visibleCount} restantes)
            </>
          )}
        </button>
      )}
    </div>
  );
}
