import { useState } from "react";
import { Link } from "react-router-dom";

export default function DiceRoll() {
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<number[]>([]);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);

    // Animate
    setTimeout(() => {
      const newValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(newValue);
      setHistory((prev) => [newValue, ...prev].slice(0, 10)); // Keep last 10
      setIsRolling(false);
    }, 1000);
  };

  // 3D rotations for dice faces
  const getRotation = (val: number) => {
      switch(val) {
          case 1: return 'rotateX(0deg) rotateY(0deg)';
          case 2: return 'rotateX(-90deg) rotateY(0deg)';
          case 3: return 'rotateX(0deg) rotateY(-90deg)';
          case 4: return 'rotateX(0deg) rotateY(90deg)';
          case 5: return 'rotateX(90deg) rotateY(0deg)';
          case 6: return 'rotateX(180deg) rotateY(0deg)';
          default: return 'rotateX(0deg) rotateY(0deg)';
      }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative overflow-hidden">
       {/* Background Glows */}
       <div className="absolute top-[-50%] left-[-50%] w-[100%] h-[100%] bg-neon-green/5 rounded-full blur-[150px] animate-pulse-glow pointer-events-none" />

      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="p-3 rounded-full glass-panel hover:bg-white/10 transition-colors group block">
          <span className="text-xl text-white group-hover:-translate-x-1 transition-transform inline-block">←</span>
        </Link>
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-20 text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500 neon-text">
        LUCKY ROLL
      </h1>

      <div className="perspective-1000 mb-24 relative group">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-neon-blue/20 blur-3xl rounded-full" />
        <div
          className="w-32 h-32 relative transform-style-3d transition-transform duration-1000 ease-out"
          style={{ transform: isRolling ? `rotateX(${Math.random() * 720}deg) rotateY(${Math.random() * 720}deg)` : getRotation(diceValue) }}
        >
            {/* Cube Faces */}
            {[1, 2, 3, 4, 5, 6].map((num) => {
                let transform = '';
                if(num===1) transform = 'translateZ(64px)';
                if(num===6) transform = 'rotateX(180deg) translateZ(64px)';
                if(num===2) transform = 'rotateX(90deg) translateZ(64px)';
                if(num===5) transform = 'rotateX(-90deg) translateZ(64px)';
                if(num===3) transform = 'rotateY(90deg) translateZ(64px)';
                if(num===4) transform = 'rotateY(-90deg) translateZ(64px)';

                return (
                    <div 
                        key={num}
                        className="absolute w-32 h-32 bg-zinc-900 border-2 border-neon-blue/50 rounded-xl flex items-center justify-center backface-hidden shadow-[inset_0_0_20px_rgba(0,243,255,0.2)]"
                        style={{ transform }}
                    > 
                         <div className="text-6xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">{num}</div>
                    </div>
                )
            })}
        </div>
      </div>

      <button
        onClick={rollDice}
        disabled={isRolling}
        className="relative group px-12 py-4 rounded-full bg-transparent overflow-hidden border border-neon-blue/30 hover:border-neon-blue transition-colors disabled:opacity-50"
      >
        <div className="absolute inset-0 bg-neon-blue/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <span className="relative text-xl font-bold tracking-widest text-white">
            {isRolling ? "ROLLING..." : "ROLL DICE"}
        </span>
      </button>

      {/* History */}
      <div className="mt-16 glass-panel px-6 py-4 rounded-full flex gap-4 items-center">
        <span className="text-xs font-bold text-zinc-500 uppercase">History</span>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex gap-2">
            {history.map((val, i) => (
            <div key={i} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-sm font-bold text-zinc-300 animate-in fade-in slide-in-from-right-4">
                {val}
            </div>
            ))}
        </div>
      </div>
    </div>
  );
}
