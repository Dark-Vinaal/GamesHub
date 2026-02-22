import { Link } from 'react-router-dom';
import Game2048 from '../games/Game2048';

export default function Game2048Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative font-sans flex flex-col items-center py-10 selection:bg-neon-blue selection:text-black">
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-yellow-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full px-6 flex items-center mb-4 z-10 max-w-xl self-center">
        <Link to="/" className="p-3 rounded-full glass-panel hover:bg-white/10 transition-colors group absolute left-6 md:left-auto md:relative">
          <span className="text-xl group-hover:-translate-x-1 transition-transform inline-block">←</span>
        </Link>
      </div>

      <div className="w-full z-10 px-4">
        <Game2048 />
      </div>
    </div>
  );
}
