import { Link } from 'react-router-dom';
import Breakout from '../games/Breakout';

export default function BreakoutHome() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative font-sans flex flex-col items-center py-10 selection:bg-neon-blue selection:text-black">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-cyan-400/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full px-6 flex items-center mb-8 z-10 max-w-4xl self-center relative">
        <Link to="/" className="p-3 rounded-full glass-panel hover:bg-white/10 transition-colors group absolute left-6 md:left-0 md:relative z-20">
          <span className="text-xl group-hover:-translate-x-1 transition-transform inline-block">←</span>
        </Link>
      </div>

      <div className="w-full z-10 px-4">
        <Breakout />
      </div>
    </div>
  );
}
