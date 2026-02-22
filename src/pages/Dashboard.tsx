import { useState } from "react";
import GameGrid from "../components/GameGrid";
import { Game } from "../types";

/* ── Mock Data ──────────────────────────────────────────────── */
const MOCK_GAMES: Game[] = [
  {
    id: 1,
    title: "Rock Paper Scissors",
    description: "The classic game of chance. Test your luck against the AI.",
    thumbnail_url: "https://images.unsplash.com/photo-1534067783865-9abd3562a014?auto=format&fit=crop&q=80&w=1000",
    play_url: "/game/rps",
  },
  {
    id: 2,
    title: "Tic Tac Toe",
    description: "Strategy vs AI. Can you beat the computer in this timeless classic?",
    thumbnail_url: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&q=80&w=1000",
    play_url: "/game/ttt",
  },
  {
    id: 3,
    title: "Dice Roll",
    description: "Roll the dice and see what fate has in store. Track your stats!",
    thumbnail_url: "https://images.unsplash.com/photo-1595757816291-ab4c1cba0fc2?auto=format&fit=crop&q=80&w=1000",
    play_url: "/game/dice",
  },
  {
    id: 4,
    title: "Coin Flip",
    description: "Heads or Tails? Make your prediction and build your streak.",
    thumbnail_url: "https://images.unsplash.com/photo-1512418490979-92798cec1380?auto=format&fit=crop&q=80&w=1000",
    play_url: "/game/coin",
  },
  {
    id: 5,
    title: "Neon Snake",
    description: "Eat the glowing dots, grow your tail, and avoid crashing into yourself.",
    thumbnail_url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000",
    play_url: "/game/snake",
  },
  {
    id: 6,
    title: "Memory Match",
    description: "Test your brain! Flip cards to find matching pairs with the lowest moves.",
    thumbnail_url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&q=80&w=1000",
    play_url: "/game/memory",
  },
  {
    id: 7,
    title: "Tetris",
    description: "The classic block-stacking puzzle. Clear lines to increase your level and score!",
    thumbnail_url: "https://images.unsplash.com/photo-1591852445851-eb1287c800bc?auto=format&fit=crop&q=80&w=1000",
    play_url: "/game/tetris",
  },
  {
    id: 8,
    title: "2048",
    description: "Slide tiles to merge matching numbers and reach the legendary 2048 tile.",
    thumbnail_url: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=1000",
    play_url: "/game/2048",
  },
  {
    id: 9,
    title: "Breakout",
    description: "Smash through the neon bricks using your paddle and bouncing ball.",
    thumbnail_url: "https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?auto=format&fit=crop&q=80&w=1000",
    play_url: "/game/breakout",
  },
  {
    id: 10,
    title: "Word Guess",
    description: "Crack the secret 5-letter word in 6 tries. A fun daily brain teaser!",
    thumbnail_url: "https://images.unsplash.com/photo-1644329843491-99d6d5ef621a?auto=format&fit=crop&q=80&w=1000",
    play_url: "/game/wordle",
  }
];

/* ── Sidebar Nav Items ──────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: "🏠", label: "Home" },
  { icon: "🔥", label: "Trending" },
  { icon: "⭐", label: "Favorites" },
  { icon: "🕹️", label: "My Games" },
  { icon: "⚙️", label: "Settings" },
];

export default function Dashboard() {
  const [games] = useState<Game[]>(MOCK_GAMES);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed on small screens

  const filteredGames = games.filter((g) =>
    g.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden font-sans selection:bg-neon-blue selection:text-black">
      
      {/* ── Background Glows ────────────────────────────────── */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-glow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* ── Mobile Header / Hamburger ───────────────────────── */}
      <header className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between glass-panel rounded-2xl px-6 py-4 md:hidden">
          <div className="flex items-center gap-3">
             <span className="text-2xl">🎮</span>
             <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">GamesHub</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-zinc-300 hover:text-white"
          >
              <span className="text-2xl">☰</span>
          </button>
      </header>

      <div className="flex h-screen pt-24 md:pt-0">
        {/* ── Sidebar (Desktop: Static, Mobile: Overlay) ────── */}
        
        {/* Mobile Overlay Backdrop */}
        <div 
            className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setSidebarOpen(false)}
        />

        <aside
            className={`
                fixed md:relative z-50 h-screen w-72 
                glass-panel border-r-0 md:border-r border-white/10
                flex flex-col
                transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1)
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                top-0 left-0
            `}
        >
            {/* Close Button Mobile */}
            <button 
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 md:hidden text-zinc-400 hover:text-white"
            >
                ✕
            </button>

            {/* Brand */}
            <div className="h-24 flex items-center gap-3 px-8">
            <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">🎮</span>
            <span className="text-2xl font-bold tracking-tight text-white neon-text">
                GamesHub
            </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-2 px-4 py-8">
            {NAV_ITEMS.map((item, index) => (
                <button
                key={item.label}
                className="group flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-zinc-400 transition-all duration-300 hover:bg-white/5 hover:text-white hover:shadow-[0_0_20px_rgba(0,243,255,0.1)] hover:scale-105"
                style={{ animationDelay: `${index * 50}ms` }}
                >
                <span className="text-xl group-hover:animate-bounce">{item.icon}</span>
                <span className="font-medium tracking-wide">{item.label}</span>
                </button>
            ))}
            </nav>

            {/* User Profile */}
            <div className="p-4 m-4 glass-panel rounded-xl flex items-center gap-3 bg-gradient-to-r from-white/5 to-transparent">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center font-bold shadow-lg">V</div>
                <div>
                    <div className="text-sm font-bold text-white">Vinaal</div>
                    <div className="text-xs text-zinc-400">Pro Gamer</div>
                </div>
            </div>
        </aside>

        {/* ── Main Content ────────────────────────────────────── */}
        <main className="flex-1 overflow-hidden relative flex flex-col">
            {/* Top Bar Desktop */}
            <div className="hidden md:flex h-24 items-center justify-between px-10">
                <div className="relative w-96 group">
                   <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
                   <input
                        type="text"
                        placeholder="Search for games..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="relative w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-zinc-500 outline-none focus:border-neon-blue/50 transition-all backdrop-blur-md"
                   />
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">🔍</span>
                </div>
                
                <div className="flex gap-6">
                    <button className="relative w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                        🔔
                        <span className="absolute top-2 right-2 w-2 h-2 bg-neon-green rounded-full shadow-[0_0_10px_#0aff68]"></span>
                    </button>
                </div>
            </div>

            {/* Content Scroll */}
            <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-10 custom-scrollbar">
                <div className="mb-10 animate-slide-in">
                    <h1 className="text-4xl md:text-5xl font-bold mb-3">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Welcome to the </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">Arena</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl">
                        Discover the next generation of games. Immerse yourself in the future of gaming.
                    </p>
                </div>

                <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
                    <GameGrid games={filteredGames} />
                </div>
            </div>
        </main>
      </div>
    </div>
  );
}
