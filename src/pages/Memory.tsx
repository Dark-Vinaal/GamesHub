import { Link } from 'react-router-dom';
import MemoryMatch from '../games/MemoryMatch';

export default function Memory() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative font-sans flex flex-col items-center py-10">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-neon-purple/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-neon-green/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full px-6 flex justify-between items-center mb-8 z-10 max-w-5xl">
        <Link to="/" className="p-3 rounded-full glass-panel hover:bg-white/10 transition-colors group">
          <span className="text-xl group-hover:-translate-x-1 transition-transform inline-block">←</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-pink-500 drop-shadow-[0_0_10px_rgba(188,19,254,0.3)] uppercase">
          Memory Match
        </h1>
        <div className="w-10" />
      </div>

      <div className="w-full z-10 px-4">
        <MemoryMatch />
      </div>
    </div>
  );
}
