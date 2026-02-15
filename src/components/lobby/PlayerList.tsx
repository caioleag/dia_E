import Avatar from "@/components/ui/Avatar";
import { type User } from "@/types";

interface PlayerListProps {
  players: User[];
  hostId?: string;
}

export default function PlayerList({ players, hostId }: PlayerListProps) {
  return (
    <div className="space-y-2">
      {players.map((player) => (
        <div
          key={player.id}
          className="flex items-center gap-3 bg-bg-elevated rounded-xl px-4 py-3 animate-slide-in-right"
        >
          <Avatar src={player.foto_url} alt={player.nome ?? "Jogador"} size="sm" />
          <span className="font-sans text-sm font-medium text-text-primary flex-1 truncate">
            {player.nome ?? "Jogador"}
          </span>
          {player.id === hostId && (
            <span className="text-xs font-sans text-brand-amber px-2 py-0.5 rounded-pill bg-brand-amber/10 border border-brand-amber/20">
              Host
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
