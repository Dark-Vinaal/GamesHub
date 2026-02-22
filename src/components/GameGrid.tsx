import { Game } from "../types";
import GameCard from "./GameCard";

interface GameGridProps {
  games: Game[];
}

export default function GameGrid({ games }: GameGridProps) {
  if (!games || games.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-zinc-500 text-lg">No games found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {games.map((game, index) => (
        <div
          key={game.id}
          style={{ animationDelay: `${index * 0.08}s` }}
        >
          <GameCard game={game} />
        </div>
      ))}
    </div>
  );
}
