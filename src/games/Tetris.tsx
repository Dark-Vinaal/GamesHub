import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';

// ── Types & Constants ──────────────────────────────────────
type Grid = number[][];
type Piece = { shape: number[][]; color: number; x: number; y: number };

const ROWS = 20;
const COLS = 10;

// Colors matching the neon aesthetic
const COLORS = [
  'transparent',
  'bg-cyan-400 shadow-[0_0_10px_#22d3ee]',   // I
  'bg-blue-500 shadow-[0_0_10px_#3b82f6]',   // J
  'bg-orange-500 shadow-[0_0_10px_#f97316]', // L
  'bg-yellow-400 shadow-[0_0_10px_#facc15]', // O
  'bg-green-400 shadow-[0_0_10px_#4ade80]',  // S
  'bg-purple-500 shadow-[0_0_10px_#a855f7]', // T
  'bg-red-500 shadow-[0_0_10px_#ef4444]',    // Z
];

const SHAPES = [
  [],
  [[1, 1, 1, 1]], // I
  [[2, 0, 0], [2, 2, 2]], // J
  [[0, 0, 3], [3, 3, 3]], // L
  [[4, 4], [4, 4]], // O
  [[0, 5, 5], [5, 5, 0]], // S
  [[0, 6, 0], [6, 6, 6]], // T
  [[7, 7, 0], [0, 7, 7]]  // Z
];

const createEmptyGrid = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// ── Tetris Component ───────────────────────────────────────
export default function Tetris() {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [piece, setPiece] = useState<Piece | null>(null);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(true); // Start paused
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('tetrisHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Calculate speed based on lines cleared (level up every 10 lines)
  const dropTime = Math.max(100, 800 - Math.floor(lines / 10) * 100);

  // Random Piece Generator
  const spawnPiece = useCallback(() => {
    const type = Math.floor(Math.random() * 7) + 1;
    const shape = SHAPES[type];
    const newPiece = {
      shape,
      color: type,
      x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2),
      y: 0
    };
    
    // Check if spawn is blocked (Game Over)
    if (checkCollision(newPiece, grid)) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('tetrisHighScore', score.toString());
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }});
      }
    } else {
      setPiece(newPiece);
    }
  }, [grid, score, highScore]);

  // Initialization
  useEffect(() => {
    if (!piece && !gameOver && !isPaused) spawnPiece();
  }, [piece, gameOver, isPaused, spawnPiece]);

  // Game Loop
  useEffect(() => {
    if (gameOver || isPaused) return;
    const interval = setInterval(drop, dropTime);
    return () => clearInterval(interval);
  }, [piece, gameOver, isPaused, dropTime]); // eslint-disable-line

  // Collision Detection
  const checkCollision = (p: Piece, g: Grid): boolean => {
    for (let y = 0; y < p.shape.length; y++) {
      for (let x = 0; x < p.shape[y].length; x++) {
        if (p.shape[y][x] !== 0) {
          const newY = p.y + y;
          const newX = p.x + x;
          if (
            newY >= ROWS ||         // Hit bottom
            newX < 0 || newX >= COLS || // Hit side walls
            (newY >= 0 && g[newY][newX] !== 0) // Hit existing block
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Movement Functions
  const move = (dx: number) => {
    if (!piece || gameOver || isPaused) return;
    const newPiece = { ...piece, x: piece.x + dx };
    if (!checkCollision(newPiece, grid)) {
      setPiece(newPiece);
    }
  };

  const rotate = () => {
    if (!piece || gameOver || isPaused) return;
    const rotatedShape = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    const newPiece = { ...piece, shape: rotatedShape };
    
    // Basic wall kick (try pushing it left/right to fit)
    let offset = 0;
    while (checkCollision({ ...newPiece, x: newPiece.x + offset }, grid)) {
      offset = offset > 0 ? -offset : -offset + 1; // Try +1, -1, +2, -2...
      if (Math.abs(offset) > newPiece.shape[0].length) return; // Can't fit
    }
    newPiece.x += offset;
    setPiece(newPiece);
  };

  const drop = () => {
    if (!piece || gameOver || isPaused) return;
    const newPiece = { ...piece, y: piece.y + 1 };
    
    if (checkCollision(newPiece, grid)) {
      lockPiece();
    } else {
      setPiece(newPiece);
    }
  };

  const hardDrop = () => {
    if (!piece || gameOver || isPaused) return;
    let newY = piece.y;
    while (!checkCollision({ ...piece, y: newY + 1 }, grid)) {
      newY += 1;
    }
    setPiece(p => ({ ...p!, y: newY }));
    // We defer locking to next render to allow slide, or lock immediately.
    // In strict tetris, hard drop locks immediately:
    setPiece(p => { lockPiece(p!); return null; }); // Force lock synchronous
  };

  const lockPiece = (p = piece) => {
    if (!p) return;
    const newGrid = grid.map(row => [...row]);
    p.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0 && p.y + y >= 0) {
          newGrid[p.y + y][p.x + x] = p.color;
        }
      });
    });

    clearLines(newGrid);
    setPiece(null); // Triggers next spawn via effect
  };

  const clearLines = (newGrid: Grid) => {
    let linesCleared = 0;
    const filteredGrid = newGrid.filter(row => {
      const isFull = row.every(cell => cell !== 0);
      if (isFull) linesCleared++;
      return !isFull;
    });

    if (linesCleared > 0) {
      const newRows = Array.from({ length: linesCleared }, () => Array(COLS).fill(0));
      setGrid([...newRows, ...filteredGrid]);
      
      const lineScores = [0, 100, 300, 500, 800];
      const level = Math.floor(lines / 10) + 1;
      setScore(s => s + lineScores[linesCleared] * level);
      setLines(l => l + linesCleared);
    } else {
      setGrid(newGrid);
    }
  };

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'p' || e.key === 'P') {
          setIsPaused(prev => !prev);
          return;
      }

      if (gameOver || isPaused) return;

      switch (e.key) {
        case 'ArrowLeft': move(-1); break;
        case 'ArrowRight': move(1); break;
        case 'ArrowDown': drop(); break;
        case 'ArrowUp': rotate(); break; // Some prefer up to rotate
        case ' ': hardDrop(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Calculate Ghost Piece
  let ghostY = piece?.y || 0;
  if (piece && !isPaused && !gameOver) {
    while (!checkCollision({ ...piece, y: ghostY + 1 }, grid)) {
      ghostY++;
    }
  }

  // Render Grid merging placed blocks + current piece + ghost piece
  const displayGrid = grid.map(row => [...row]);
  if (piece && !gameOver) {
    // Draw ghost
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0 && ghostY + y >= 0 && ghostY + y < ROWS) {
           if (displayGrid[ghostY + y][piece.x + x] === 0) {
               displayGrid[ghostY + y][piece.x + x] = -piece.color; // Negative denotes ghost
           }
        }
      });
    });

    // Draw active
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0 && piece.y + y >= 0) {
          displayGrid[piece.y + y][piece.x + x] = piece.color;
        }
      });
    });
  }

  // Reset
  const resetGame = () => {
    setGrid(createEmptyGrid());
    setScore(0);
    setLines(0);
    setGameOver(false);
    setPiece(null);
    setIsPaused(false);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-4xl mx-auto">
      
      {/* Left Panel: Stats */}
      <div className="flex flex-col gap-4 w-full md:w-48 order-2 md:order-1">
        <div className="glass-panel p-4 rounded-xl text-center">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Score</p>
            <p className="text-3xl font-black text-neon-blue drop-shadow-md">{score}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Lines</p>
            <p className="text-2xl font-black text-neon-green drop-shadow-md">{lines}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Level</p>
            <p className="text-2xl font-black text-white">{Math.floor(lines / 10) + 1}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">High Score</p>
            <p className="text-2xl font-black text-neon-purple drop-shadow-md">{highScore}</p>
        </div>
        
        <div className="hidden md:block glass-panel p-4 rounded-xl mt-auto">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mb-2 border-b border-white/10 pb-2">Controls</p>
            <ul className="text-sm text-zinc-300 space-y-1">
                <li><kbd className="bg-white/10 px-1 rounded">↑</kbd> Rotate</li>
                <li><kbd className="bg-white/10 px-1 rounded">←</kbd> <kbd className="bg-white/10 px-1 rounded">→</kbd> Move</li>
                <li><kbd className="bg-white/10 px-1 rounded">↓</kbd> Soft Drop</li>
                <li><kbd className="bg-white/10 px-2 rounded">Space</kbd> Hard Drop</li>
                <li><kbd className="bg-white/10 px-2 rounded">P</kbd> Pause</li>
            </ul>
        </div>
      </div>

      {/* Center Panel: Game Board */}
      <div className="relative aspect-[1/2] h-[60vh] md:h-[80vh] bg-zinc-950 rounded-xl border-4 border-zinc-800 shadow-2xl overflow-hidden order-1 md:order-2">
        <div 
          className="absolute inset-0 grid grid-cols-10 grid-rows-20"
        >
          {displayGrid.map((row, y) => row.map((val, x) => (
            <div 
              key={`${y}-${x}`}
              className={`border border-white/5 box-border scale-[1.02] ${
                 val > 0 ? COLORS[val] : 
                 val < 0 ? `bg-white/10 border-2 border-white/30 backdrop-blur-sm` // Ghost piece
                 : 'bg-transparent'
              }`}
            />
          )))}
        </div>

        {/* Overlays */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20 animate-fade-in p-6 text-center">
            <h2 className="text-4xl font-black text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] uppercase">Game Over</h2>
            <button 
              onClick={resetGame}
              className="mt-6 px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-full hover:bg-neon-blue transition-all"
            >
              Play Again
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <button 
              onClick={() => setIsPaused(false)}
              className="px-10 py-4 bg-neon-blue text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(0,243,255,0.6)] hover:bg-white transition-all transform hover:scale-105"
            >
              {score > 0 ? 'Resume' : 'Start'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Controls (Visible only on small screens) */}
      <div className="grid grid-cols-3 gap-2 md:hidden order-3 w-full max-w-xs">
          <div />
          <button onClick={rotate} className="h-14 bg-zinc-800 rounded-xl text-white text-xl active:bg-zinc-700">↻</button>
          <div />
          <button onClick={() => move(-1)} className="h-14 bg-zinc-800 rounded-xl text-white text-xl active:bg-zinc-700">←</button>
          <button onClick={drop} className="h-14 bg-zinc-800 rounded-xl text-white text-xl active:bg-zinc-700">↓</button>
          <button onClick={() => move(1)} className="h-14 bg-zinc-800 rounded-xl text-white text-xl active:bg-zinc-700">→</button>
          <button onClick={hardDrop} className="col-span-3 h-14 bg-zinc-700 rounded-xl text-white font-bold uppercase tracking-widest active:bg-neon-blue active:text-black">Hard Drop</button>
      </div>

    </div>
  );
}
