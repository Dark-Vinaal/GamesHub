import { useState, useEffect } from 'react';
import { Ghost, Gamepad2, Brain, Skull, Sparkles, Rocket, Zap, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

// 8 pairs of icons
const ICONS = [Ghost, Gamepad2, Brain, Skull, Sparkles, Rocket, Zap, Target];

interface Card {
  id: number;
  iconId: number;
  isFlipped: boolean;
  isMatched: boolean;
  IconComponent: React.ElementType;
}

export default function MemoryMatch() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [bestScore, setBestScore] = useState<number>(() => {
    const saved = localStorage.getItem('memoryBestScore');
    return saved ? parseInt(saved, 10) : 0; // 0 means no best score yet
  });

  // Initialize Game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Create pairs
    const initialCards: Card[] = [];
    ICONS.forEach((Icon, index) => {
      // Need 2 of each
      initialCards.push({ id: index * 2, iconId: index, isFlipped: false, isMatched: false, IconComponent: Icon });
      initialCards.push({ id: index * 2 + 1, iconId: index, isFlipped: false, isMatched: false, IconComponent: Icon });
    });

    // Shuffle
    const shuffled = initialCards.sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setGameOver(false);
    setIsLocked(false);
  };

  const handleCardClick = (index: number) => {
    // Prevent clicking if locked, already flipped, or matched
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    // Flip the clicked card
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    // If two cards are flipped, check for match
    if (newFlipped.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);

      const [firstIndex, secondIndex] = newFlipped;
      if (cards[firstIndex].iconId === cards[secondIndex].iconId) {
        // Match!
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setIsLocked(false);
          setMatches(m => m + 1);
        }, 500);
      } else {
        // No match, unflip after delay
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  // Check Game Over
  useEffect(() => {
    if (matches === 8 && cards.length > 0) {
      setGameOver(true);
      if (bestScore === 0 || moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem('memoryBestScore', moves.toString());
      }
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#00f3ff', '#bc13fe', '#0aff68', '#fef08a']
      });
    }
  }, [matches, moves, bestScore, cards.length]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto">
        
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-8 glass-panel px-6 py-4 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-transparent" />
        <div className="text-center">
            <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Moves</p>
            <p className="text-3xl font-black text-white drop-shadow-md">{moves}</p>
        </div>
        <div className="text-center">
            <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase mb-1">Pairs</p>
            <div className="flex gap-1 justify-center">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-full ${i < matches ? 'bg-neon-green shadow-[0_0_8px_#0aff68]' : 'bg-zinc-800'}`} />
                ))}
            </div>
        </div>
        <div className="text-center">
            <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Best (Lowest)</p>
            <p className="text-2xl font-black text-neon-purple drop-shadow-[0_0_8px_rgba(188,19,254,0.5)]">
               {bestScore === 0 ? '-' : bestScore}
            </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full aspect-square relative z-10">
        {cards.map((card, index) => {
          const Icon = card.IconComponent;
          return (
            <div
              key={`${card.id}-${index}`}
              onClick={() => handleCardClick(index)}
              style={{ perspective: '1000px' }}
              className="relative w-full h-full cursor-pointer group"
            >
              <div 
                className={`w-full h-full transition-all duration-500 rounded-xl relative ${card.isFlipped || card.isMatched ? 'transform rotate-y-180' : 'group-hover:-translate-y-1 group-hover:shadow-[0_0_15px_rgba(0,243,255,0.2)]'}`}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Back of card (visible when unflipped) */}
                <div 
                    className="absolute inset-0 bg-zinc-800 border border-white/10 rounded-xl flex items-center justify-center backface-hidden shadow-lg overflow-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    {/* Pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,currentColor_2px,transparent_2px)] [background-size:16px_16px] text-neon-blue" />
                    <div className="w-8 h-8 rounded-full border-2 border-zinc-600/50 flex items-center justify-center opacity-50">
                        <div className="w-2 h-2 rounded-full bg-zinc-600/50" />
                    </div>
                </div>

                {/* Front of card (visible when flipped) */}
                <div 
                    className={`absolute inset-0 rounded-xl flex items-center justify-center backface-hidden shadow-xl
                      ${card.isMatched 
                        ? 'bg-neon-purple/20 border-2 border-neon-purple shadow-[0_0_20px_rgba(188,19,254,0.3)]' 
                        : 'bg-zinc-700 border border-zinc-500'}`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <Icon size={40} className={`transform transition-transform ${card.isMatched ? 'scale-110 text-neon-purple animate-pulse' : 'text-white'}`} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          );
        })}

        {/* Game Over Overlay */}
        {gameOver && (
            <div className="absolute inset-[-10px] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-2xl animate-fade-in border border-white/10">
                <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="text-neon-green" size={40} />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-cyan-400 mb-2 drop-shadow-lg tracking-tighter uppercase">Board Cleared</h2>
                <p className="text-zinc-300 mb-8 font-medium">Completed in <span className="text-white font-bold">{moves}</span> moves</p>
                <button 
                    onClick={initializeGame}
                    className="px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-full hover:bg-neon-purple hover:text-white hover:shadow-[0_0_20px_#bc13fe] transition-all transform hover:scale-105"
                >
                    Play Again
                </button>
            </div>
        )}
      </div>

    </div>
  );
}
