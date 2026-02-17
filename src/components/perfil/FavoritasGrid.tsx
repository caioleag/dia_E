"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type Favorita, type Item } from "@/types";
import { Star, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface FavoritasGridProps {
  userId: string;
}

export function FavoritasGrid({ userId }: FavoritasGridProps) {
  const [favoritas, setFavoritas] = useState<(Favorita & { items: Item })[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="text-center py-8 text-wine-200">
        Carregando favoritas...
      </div>
    );
  }

  if (favoritas.length === 0) {
    return (
      <div className="text-center py-8 text-wine-200">
        <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Você ainda não tem cartas favoritas.</p>
        <p className="text-sm mt-1">
          Durante o jogo, clique em ⭐ Favoritar para salvar suas cartas preferidas!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-wine-50 flex items-center gap-2">
          <Star className="w-5 h-5 fill-current text-gold-400" />
          Cartas Favoritas ({favoritas.length})
        </h3>
      </div>

      <div className="grid gap-3">
        {favoritas.map((fav) => (
          <div
            key={fav.id}
            className="bg-wine-900/50 border border-wine-700 rounded-lg p-4 hover:border-wine-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="categoria" className="text-xs">
                    {fav.items.modo}
                  </Badge>
                  <Badge variant="categoria" className="text-xs">
                    {fav.items.categoria}
                  </Badge>
                  <Badge variant="nivel" className="text-xs">
                    Nível {fav.items.nivel}
                  </Badge>
                  <Badge 
                    variant={fav.items.tipo === "Verdade" ? "verdade" : "desafio"}
                    className="text-xs"
                  >
                    {fav.items.tipo}
                  </Badge>
                </div>
                
                <p className="text-wine-100 text-sm leading-relaxed">
                  {fav.items.conteudo}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(fav.id)}
                className="text-wine-400 hover:text-rose-400 shrink-0"
                title="Remover favorita"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
