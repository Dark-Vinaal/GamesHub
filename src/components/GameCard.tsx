import { Link } from "react-router-dom";
import { Game } from "../types";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <div className="group relative glass-card rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Neon Border Effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue opacity-20 blur-md"></div>
      </div>

      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-60 z-10" />
        <img
          src={game.thumbnail_url}
          alt={game.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm bg-black/20">
            <span className="px-6 py-2 rounded-full border border-neon-blue/50 bg-neon-blue/10 text-neon-blue font-bold shadow-[0_0_20px_rgba(0,243,255,0.4)] transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                PLAY NOW
            </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 relative z-10">
        <h3 className="mb-2 text-xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-neon-blue group-hover:to-neon-purple transition-colors">
          {game.title}
        </h3>
        <p className="mb-6 text-sm text-zinc-400 line-clamp-2 leading-relaxed flex-1">
          {game.description}
        </p>

        <Link
          to={game.play_url}
          className="relative inline-flex w-full items-center justify-center rounded-xl overflow-hidden p-[1px] group/btn"
        >
            <span className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple opacity-50 transition-opacity group-hover/btn:opacity-100"></span>
            <span className="relative flex w-full items-center justify-center rounded-xl bg-black/80 px-4 py-2.5 text-sm font-bold text-white transition-all group-hover/btn:bg-black/40">
                Start Game <span className="ml-2 group-hover/btn:translate-x-1 transition-transform">→</span>
            </span>
        </Link>
      </div>
    </div>
  );
}
