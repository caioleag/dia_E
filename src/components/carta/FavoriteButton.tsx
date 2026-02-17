"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";

interface FavoriteButtonProps {
  itemId: string;
  userId: string;
  className?: string;
  onToggle?: (isFavorita: boolean) => void;
}

export function FavoriteButton({ itemId, userId, className, onToggle }: FavoriteButtonProps) {
  const [isFavorita, setIsFavorita] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar se já é favorita ao carregar
  useEffect(() => {
    const checkFavorita = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("favoritas")
        .select("id")
        .eq("user_id", userId)
        .eq("item_id", itemId)
        .maybeSingle();

      setIsFavorita(!!data);
    };

    checkFavorita();
  }, [itemId, userId]);

  const handleToggle = async () => {
    setLoading(true);
    const supabase = createClient();

    try {
      if (isFavorita) {
        // Remover favorita
        const { error } = await supabase
          .from("favoritas")
          .delete()
          .eq("user_id", userId)
          .eq("item_id", itemId);

        if (!error) {
          setIsFavorita(false);
          onToggle?.(false);
        }
      } else {
        // Adicionar favorita
        const { error } = await supabase
          .from("favoritas")
          .insert({
            user_id: userId,
            item_id: itemId,
          });

        if (!error) {
          setIsFavorita(true);
          onToggle?.(true);
        }
      }
    } catch (error) {
      console.error("Erro ao favoritar/desfavoritar:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isFavorita ? "primary" : "secondary"}
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className={className}
    >
      <Star 
        className={`w-4 h-4 mr-2 ${isFavorita ? "fill-current" : ""}`} 
      />
      {isFavorita ? "Favoritada" : "Favoritar"}
    </Button>
  );
}
