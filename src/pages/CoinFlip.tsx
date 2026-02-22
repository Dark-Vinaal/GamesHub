import { useState } from "react";
import { Link } from "react-router-dom";

export default function CoinFlip() {
  const [result, setResult] = useState<"Heads" | "Tails" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [streak, setStreak] = useState(0);
  const [prediction, setPrediction] = useState<"Heads" | "Tails" | null>(null);

  const flipCoin = () => {
    if (isFlipping || !prediction) return;
    setIsFlipping(true);

    setTimeout(() => {
      const outcome = Math.random() > 0.5 ? "Heads" : "Tails";
      setResult(outcome);
      
      if (outcome === prediction) {
        setStreak(s => s + 1);
      } else {
        setStreak(0);
      }
      
      setIsFlipping(false);
    }, 2000); // 2 seconds flip
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 relative font-sans">
       {/* Background Glows */}
       <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" />

      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="p-3 rounded-full glass-panel hover:bg-white/10 transition-colors group block">
          <span className="text-xl text-white group-hover:-translate-x-1 transition-transform inline-block">←</span>
        </Link>
      </div>

      <div className="glass-panel px-6 py-2 rounded-full mb-12 flex items-center gap-3 border-yellow-500/20">
        <span className="text-zinc-400 text-xs font-bold uppercase">Win Streak</span>
        <span className="text-2xl font-bold text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">{streak}</span>
      </div>

      {/* Coin Animation Container */}
      <div className="mb-16 perspective-1000">
        <div className={`w-56 h-56 rounded-full relative transform-style-3d transition-all duration-700
            ${isFlipping ? "animate-[flip_0.5s_linear_infinite]" : ""}
        `}>
             {/* Front (Heads) */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 flex items-center justify-center backface-hidden shadow-[0_0_50px_rgba(234,179,8,0.4)] border-4 border-yellow-400/50
                 ${!isFlipping && result === 'Tails' ? 'hidden' : ''}
            `}>
                <div className="w-48 h-48 rounded-full border-2 border-yellow-200/30 flex items-center justify-center">
                    <span className="text-6xl font-bold text-yellow-900 drop-shadow-sm">H</span>
                </div>
            </div>

            {/* Back (Tails) - rotated 180 */}
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-yellow-600 via-yellow-800 to-yellow-900 flex items-center justify-center backface-hidden shadow-[0_0_50px_rgba(234,179,8,0.4)] border-4 border-yellow-500/50
                 ${!isFlipping && result === 'Heads' ? 'hidden' : ''}
            `} style={{ transform: 'rotateY(180deg)' }}>
                <div className="w-48 h-48 rounded-full border-2 border-yellow-200/30 flex items-center justify-center">
                    <span className="text-6xl font-bold text-yellow-200 drop-shadow-sm">T</span>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 items-center w-full max-w-sm">
        {!isFlipping && (
          <div className="flex p-1 bg-white/5 rounded-2xl w-full">
             {(['Heads', 'Tails'] as const).map((side) => (
                <button
                    key={side}
                    onClick={() => setPrediction(side)}
                    className={`flex-1 py-4 rounded-xl text-sm font-bold tracking-widest transition-all ${
                        prediction === side 
                        ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.4)]' 
                        : 'text-zinc-500 hover:text-white'
                    }`}
                >
                    {side.toUpperCase()}
                </button>
             ))}
          </div>
        )}

        <button
            onClick={flipCoin}
            disabled={!prediction || isFlipping}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-600 to-yellow-400 text-black font-black tracking-widest text-lg hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale shadow-[0_0_30px_rgba(234,179,8,0.3)]"
        >
            {isFlipping ? "FLIPPING..." : "FLIP COIN"}
        </button>
      </div>
    </div>
  );
}
