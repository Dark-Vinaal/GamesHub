import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RockIcon, PaperIcon, ScissorIcon } from '../components/Icons';

const OPTIONS = [
  { id: 'rock', component: <RockIcon />, beats: 'scissor', color: 'text-neon-blue' },
  { id: 'paper', component: <PaperIcon />, beats: 'rock', color: 'text-neon-purple' },
  { id: 'scissor', component: <ScissorIcon />, beats: 'paper', color: 'text-neon-green' },
];

export default function RockPaperScissors() {
  const [userChoice, setUserChoice] = useState<string | null>(null);
  const [computerChoice, setComputerChoice] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [score, setScore] = useState({ user: 0, computer: 0 });
  const [isAnimating, setIsAnimating] = useState(false);

  const handlePlay = (choiceId: string) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setUserChoice(choiceId);
    setComputerChoice(null);
    setResult(null);

    // Simulate thinking/animation
    setTimeout(() => {
      const randomOption = OPTIONS[Math.floor(Math.random() * OPTIONS.length)];
      setComputerChoice(randomOption.id);

      const userOption = OPTIONS.find(o => o.id === choiceId)!;
      
      let gameResult = '';
      if (choiceId === randomOption.id) {
        gameResult = 'Draw!';
      } else if (userOption.beats === randomOption.id) {
        gameResult = 'VICTORY';
        setScore(s => ({ ...s, user: s.user + 1 }));
      } else {
        gameResult = 'DEFEAT';
        setScore(s => ({ ...s, computer: s.computer + 1 }));
      }
      
      setResult(gameResult);
      setIsAnimating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden relative font-sans selection:bg-neon-blue selection:text-black flex flex-col items-center py-10">
      
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse-glow pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[150px] animate-pulse-glow pointer-events-none" />

      {/* Nav */}
      <div className="w-full px-6 flex justify-between items-center mb-12 z-10 max-w-5xl">
        <Link to="/" className="p-3 rounded-full glass-panel hover:bg-white/10 transition-colors group">
          <span className="text-xl group-hover:-translate-x-1 transition-transform inline-block">←</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-wider neon-text text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">
          R.P.S. ARENA
        </h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Score Board */}
      <div className="glass-panel px-12 py-6 rounded-2xl flex gap-12 items-center mb-16 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 to-neon-purple/5" />
        <div className="text-center relative">
          <div className="text-xs text-zinc-400 font-bold tracking-widest mb-1">PLAYER</div>
          <div className="text-4xl font-bold text-neon-blue drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">{score.user}</div>
        </div>
        <div className="text-2xl font-bold text-zinc-600">vs</div>
        <div className="text-center relative">
          <div className="text-xs text-zinc-400 font-bold tracking-widest mb-1">CPU</div>
          <div className="text-4xl font-bold text-neon-purple drop-shadow-[0_0_10px_rgba(188,19,254,0.5)]">{score.computer}</div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative mb-20 h-64 w-full max-w-4xl flex items-center justify-center gap-8 md:gap-32 z-10">
        {/* User Hand */}
        <div className={`transition-all duration-500 transform ${isAnimating ? 'animate-bounce' : ''} relative w-40 h-40`}>
          <div className={`w-full h-full filter drop-shadow-[0_0_30px_rgba(0,243,255,0.3)] transition-all duration-300 ${
              result === 'VICTORY' ? 'scale-125 drop-shadow-[0_0_50px_rgba(0,243,255,0.8)]' : ''
          }`}>
            {userChoice 
              ? OPTIONS.find(o => o.id === userChoice)?.component 
              : <div className="w-full h-full border-4 border-dashed border-white/20 rounded-full animate-pulse" />}
          </div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-neon-blue font-bold tracking-widest text-sm opacity-50">YOU</div>
        </div>

        {/* VS / Result */}
        <div className="text-center w-64 h-24 flex items-center justify-center pointer-events-none">
          {result ? (
            <div className={`text-4xl md:text-5xl font-black tracking-tighter animate-in zoom-in duration-300 ${
              result === 'VICTORY' ? 'text-neon-green drop-shadow-[0_0_20px_rgba(10,255,104,0.8)]' : 
              result === 'DEFEAT' ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 
              'text-zinc-400'
            }`}>
              {result}
            </div>
          ) : (
            <span className="text-zinc-600 font-black text-2xl tracking-widest opacity-20">VS</span>
          )}
        </div>

        {/* Computer Hand */}
        <div className={`transition-all duration-500 transform ${isAnimating ? 'animate-bounce' : ''} relative w-40 h-40`}>
          <div className={`w-full h-full scale-x-[-1] filter drop-shadow-[0_0_30px_rgba(188,19,254,0.3)] transition-all duration-300 ${
              result === 'DEFEAT' ? 'scale-125 drop-shadow-[0_0_50px_rgba(188,19,254,0.8)]' : ''
          }`}>
             {computerChoice 
              ? OPTIONS.find(o => o.id === computerChoice)?.component 
              : <div className="w-full h-full border-4 border-dashed border-white/20 rounded-full animate-pulse" />}
          </div>
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-neon-purple font-bold tracking-widest text-sm opacity-50">CPU</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-6 z-10">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handlePlay(opt.id)}
            disabled={isAnimating}
            className="group relative w-24 h-24 md:w-32 md:h-32 rounded-2xl glass-card flex flex-col items-center justify-center gap-2 hover:-translate-y-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 p-4"
          >
            <div className={`w-full h-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                {opt.component}
            </div>
            <div className="absolute inset-0 border-2 border-transparent rounded-2xl group-hover:border-neon-blue/30 transition-colors" />
            <div className="absolute -bottom-6 text-xs font-bold tracking-widest text-zinc-500 group-hover:text-white uppercase transition-colors">
              {opt.id}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
