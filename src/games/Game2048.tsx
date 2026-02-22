import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

type Board = number[][];
type Position = { r: number, c: number };

// CSS colors based on tile value
const TILE_COLORS: Record<number, string> = {
  2: 'bg-zinc-800 text-zinc-300',
  4: 'bg-zinc-700 text-white',
  8: 'bg-[#f59e0b] text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]',
  16: 'bg-[#f97316] text-white shadow-[0_0_15px_rgba(249,115,22,0.5)]',
  32: 'bg-[#ef4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]',
  64: 'bg-[#dc2626] text-white shadow-[0_0_20px_rgba(220,38,38,0.6)]',
  128: 'bg-[#eab308] text-white shadow-[0_0_20px_rgba(234,179,8,0.6)]',
  256: 'bg-[#fbbf24] text-black shadow-[0_0_25px_rgba(251,191,36,0.7)]',
  512: 'bg-[#fcd34d] text-black shadow-[0_0_30px_rgba(252,211,77,0.8)]',
  1024: 'bg-neon-green text-black shadow-[0_0_35px_rgba(10,255,104,0.9)]',
  2048: 'bg-neon-blue text-black shadow-[0_0_40px_rgba(0,243,255,1)] shadow-[inset_0_0_20px_rgba(255,255,255,0.8)]',
};

export default function Game2048() {
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [hasContinued, setHasContinued] = useState(false);
  
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('game2048HighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Initialize Game
  useEffect(() => {
    initialize();
  }, []);

  const initialize = () => {
    let newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    newBoard = addRandomTile(addRandomTile(newBoard));
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setHasContinued(false);
  };

  const getEmptyTiles = (b: Board): Position[] => {
    const empty: Position[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) empty.push({ r, c });
      }
    }
    return empty;
  };

  const addRandomTile = (b: Board): Board => {
    const empty = getEmptyTiles(b);
    if (empty.length === 0) return b;
    
    const randomPos = empty[Math.floor(Math.random() * empty.length)];
    const newBoard = b.map(row => [...row]);
    newBoard[randomPos.r][randomPos.c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  // Logic to slide and merge an array (e.g. a row or column)
  const slideAndMerge = (line: number[]): { newLine: number[], scoreGained: number } => {
    // 1. Remove zeros
    let nonZero = line.filter(val => val !== 0);
    let scoreGained = 0;
    
    // 2. Merge adjacent equals
    for (let i = 0; i < nonZero.length - 1; i++) {
      if (nonZero[i] === nonZero[i + 1]) {
        nonZero[i] *= 2;
        scoreGained += nonZero[i];
        nonZero.splice(i + 1, 1);
      }
    }
    
    // 3. Pad with zeros
    while (nonZero.length < 4) {
      nonZero.push(0);
    }
    
    return { newLine: nonZero, scoreGained };
  };

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver || (won && !hasContinued)) return;

    let hasChanged = false;
    let newBoard = board.map(row => [...row]);
    let totalScoreGained = 0;

    if (direction === 'LEFT' || direction === 'RIGHT') {
      for (let r = 0; r < 4; r++) {
        let row = newBoard[r];
        if (direction === 'RIGHT') row = row.reverse();
        
        const { newLine, scoreGained } = slideAndMerge(row);
        
        if (direction === 'RIGHT') newLine.reverse();
        
        // Check if anything changed
        if (newBoard[r].join(',') !== newLine.join(',')) hasChanged = true;
        
        newBoard[r] = newLine;
        totalScoreGained += scoreGained;
      }
    } else {
      // UP or DOWN
      for (let c = 0; c < 4; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        if (direction === 'DOWN') col = col.reverse();
        
        const { newLine, scoreGained } = slideAndMerge(col);
        
        if (direction === 'DOWN') newLine.reverse();
        
        // Check change
        const oldCol = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        if (oldCol.join(',') !== newLine.join(',')) hasChanged = true;

        for (let r = 0; r < 4; r++) {
          newBoard[r][c] = newLine[r];
        }
        totalScoreGained += scoreGained;
      }
    }

    if (hasChanged) {
      newBoard = addRandomTile(newBoard);
      setBoard(newBoard);
      
      const newScore = score + totalScoreGained;
      setScore(newScore);
      
      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('game2048HighScore', newScore.toString());
      }

      checkGameState(newBoard);
    }
  }, [board, gameOver, won, hasContinued, score, highScore]);

  const checkGameState = (b: Board) => {
    // Check Win (2048)
    if (!won && !hasContinued) {
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (b[r][c] === 2048) {
            setWon(true);
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ['#00f3ff', '#bc13fe']});
            return;
          }
        }
      }
    }

    // Check Loss (No empty tiles AND no adjacent equals)
    if (getEmptyTiles(b).length === 0) {
      let canMove = false;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          const val = b[r][c];
          if (
            (r < 3 && b[r+1][c] === val) ||
            (c < 3 && b[r][c+1] === val)
          ) {
            canMove = true;
            break;
          }
        }
        if (canMove) break;
      }
      if (!canMove) {
        setGameOver(true);
      }
    }
  };

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp': move('UP'); break;
        case 'ArrowDown': move('DOWN'); break;
        case 'ArrowLeft': move('LEFT'); break;
        case 'ArrowRight': move('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch Swipe Handlers (simple implementation)
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
      if (!touchStart) return;
      const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
      
      const dx = touchEnd.x - touchStart.x;
      const dy = touchEnd.y - touchStart.y;
      
      if (Math.abs(dx) > Math.abs(dy)) {
          if (Math.abs(dx) > 30) move(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
          if (Math.abs(dy) > 30) move(dy > 0 ? 'DOWN' : 'UP');
      }
      setTouchStart(null);
  };


  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
      
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-6">
        <div>
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple tracking-tighter">
                2048
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Join the numbers!</p>
        </div>
        <div className="flex gap-4">
            <div className="glass-panel px-4 py-2 rounded-xl text-center min-w-[80px]">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-1">Score</p>
                <p className="text-xl font-black text-white">{score}</p>
            </div>
            <div className="glass-panel px-4 py-2 rounded-xl text-center min-w-[80px]">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-1">Best</p>
                <p className="text-xl font-black text-white">{highScore}</p>
            </div>
        </div>
      </div>

      <div className="w-full flex justify-end mb-4">
          <button 
             onClick={initialize}
             className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-colors border border-white/10"
          >
              New Game
          </button>
      </div>

      {/* Game Board */}
      <div 
        className="relative w-full aspect-square bg-zinc-900 rounded-2xl p-3 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-3 p-3 z-0">
            {/* Background Cells */}
            {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="bg-zinc-800/50 rounded-xl w-full h-full" />
            ))}
        </div>

        {/* Foreground Active Cells */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-3 p-3 z-10">
            {board.map((row, r) => 
                row.map((val, c) => (
                    <div key={`${r}-${c}`} className="relative w-full h-full flex items-center justify-center pointer-events-none">
                        {val > 0 && (
                            <div className={`absolute inset-0 flex items-center justify-center rounded-xl font-black ${val > 1000 ? 'text-3xl' : val > 100 ? 'text-4xl' : 'text-5xl'} transition-all duration-150 transform scale-100 animate-pop-in ${TILE_COLORS[val] || 'bg-white text-black'}`}>
                                {val}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>

        {/* Overlays */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-2xl animate-fade-in">
            <h2 className="text-5xl font-black text-white mb-6 drop-shadow-lg tracking-tighter uppercase relative">
                <span className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 blur-lg opacity-50"></span>
                <span className="relative">Game Over!</span>
            </h2>
            <button 
              onClick={initialize}
              className="px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {won && !hasContinued && (
          <div className="absolute inset-0 bg-neon-blue/20 backdrop-blur-md flex flex-col items-center justify-center z-20 rounded-2xl animate-fade-in border border-neon-blue/50">
             <h2 className="text-6xl font-black text-white mb-2 drop-shadow-[0_0_20px_rgba(0,243,255,1)]">2048!</h2>
            <p className="text-zinc-200 mb-8 font-bold text-lg">You reached the legendary tile!</p>
            <div className="flex gap-4">
                <button 
                onClick={() => setHasContinued(true)}
                className="px-6 py-3 bg-neon-blue text-black font-bold uppercase tracking-wider rounded-xl hover:bg-white transition-colors shadow-[0_0_20px_rgba(0,243,255,0.6)]"
                >
                Keep Going
                </button>
            </div>
          </div>
        )}
      </div>

      <p className="mt-8 text-zinc-500 text-sm text-center">
          <strong>How to play:</strong> Use your <strong className="text-zinc-300">arrow keys</strong> or <strong className="text-zinc-300">swipe</strong> to move the tiles. Tiles with the same number merge into one when they touch. Add them up to reach <strong>2048!</strong>
      </p>

    </div>
  );
}
