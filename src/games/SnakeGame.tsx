import { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

type Point = { x: number; y: number };
enum Direction { UP, DOWN, LEFT, RIGHT }

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = Direction.UP;
const BASE_SPEED = 150;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const directionRef = useRef(direction);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Ensure food doesn't spawn on snake
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault(); // Prevent scrolling
      }

      if (e.key === ' ' && !gameOver) {
        setIsPaused(p => !p);
        return;
      }

      if (isPaused || gameOver) return;

      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
          if (currentDir !== Direction.DOWN) directionRef.current = Direction.UP;
          break;
        case 'ArrowDown':
          if (currentDir !== Direction.UP) directionRef.current = Direction.DOWN;
          break;
        case 'ArrowLeft':
          if (currentDir !== Direction.RIGHT) directionRef.current = Direction.LEFT;
          break;
        case 'ArrowRight':
          if (currentDir !== Direction.LEFT) directionRef.current = Direction.RIGHT;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, gameOver]);

  // Touch controls
  const handleTouch = (dir: Direction) => {
    if (isPaused || gameOver) return;
    const currentDir = directionRef.current;
    if (dir === Direction.UP && currentDir !== Direction.DOWN) directionRef.current = Direction.UP;
    if (dir === Direction.DOWN && currentDir !== Direction.UP) directionRef.current = Direction.DOWN;
    if (dir === Direction.LEFT && currentDir !== Direction.RIGHT) directionRef.current = Direction.LEFT;
    if (dir === Direction.RIGHT && currentDir !== Direction.LEFT) directionRef.current = Direction.RIGHT;
  };

  useEffect(() => {
    if (isPaused || gameOver) return;

    const speed = Math.max(50, BASE_SPEED - Math.floor(score / 5) * 10);

    const moveSnake = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { ...head };
        const currentDir = directionRef.current;

        switch (currentDir) {
          case Direction.UP:
            newHead.y -= 1;
            break;
          case Direction.DOWN:
            newHead.y += 1;
            break;
          case Direction.LEFT:
            newHead.x -= 1;
            break;
          case Direction.RIGHT:
            newHead.x += 1;
            break;
        }

        // Check Wall Collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          handleGameOver();
          return prevSnake;
        }

        // Check Self Collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          handleGameOver();
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check Food Collision
        if (newHead.x === food.x && newHead.y === food.y) {
          const newScore = score + 10;
          setScore(newScore);
          setFood(generateFood(newSnake));
          // Don't pop tail -> snake grows
          if (newScore > highScore) {
             setHighScore(newScore);
             localStorage.setItem('snakeHighScore', newScore.toString());
          }
        } else {
          newSnake.pop(); // Remove tail if no food eaten
        }

        setDirection(currentDir);
        return newSnake;
      });
    }, speed);

    return () => clearInterval(moveSnake);
  }, [isPaused, gameOver, food, score, highScore, generateFood]);

  const handleGameOver = () => {
    setGameOver(true);
    if (score > highScore) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00f3ff', '#bc13fe']
      });
    }
  };

  // Render Grid
  const gridCells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const isSnake = snake.some(segment => segment.x === col && segment.y === row);
      const isHead = snake[0].x === col && snake[0].y === row;
      const isFood = food.x === col && food.y === row;

      gridCells.push(
        <div
          key={`${row}-${col}`}
          className={`w-full h-full rounded-sm ${
            isHead ? 'bg-neon-blue shadow-[0_0_10px_#00f3ff] z-10' :
            isSnake ? 'bg-cyan-500/80 shadow-[0_0_5px_rgba(0,243,255,0.5)]' :
            isFood ? 'bg-neon-green shadow-[0_0_10px_#0aff68] animate-pulse rounded-full scale-75' :
            'bg-zinc-800/30'
          }`}
        />
      );
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto">
      
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-6 glass-panel px-6 py-4 rounded-xl">
        <div className="text-center">
            <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">Score</p>
            <p className="text-2xl font-black text-neon-blue drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">{score}</p>
        </div>
        <div className="text-center">
            <p className="text-xs text-zinc-400 font-bold tracking-widest uppercase">High Score</p>
            <p className="text-2xl font-black text-neon-purple drop-shadow-[0_0_8px_rgba(188,19,254,0.5)]">{highScore}</p>
        </div>
      </div>

      {/* Game Board container */}
      <div className="relative w-full aspect-square bg-zinc-900/60 rounded-xl border-2 border-white/10 overflow-hidden shadow-2xl backdrop-blur-sm">
        
        <div 
            className="absolute inset-0 grid gap-[1px] p-[1px]" 
            style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${GRID_SIZE}, minmax(0, 1fr))`
            }}
        >
          {gridCells}
        </div>

        {/* Overlays */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-black text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] tracking-tighter uppercase">Game Over</h2>
            <p className="text-zinc-300 mb-8 font-medium">Final Score: <span className="text-neon-blue font-bold">{score}</span></p>
            <button 
              onClick={resetGame}
              className="px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-full hover:bg-neon-blue hover:shadow-[0_0_20px_#00f3ff] transition-all transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        )}

        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <button 
              onClick={() => setIsPaused(false)}
              className="px-10 py-4 bg-neon-blue text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_30px_rgba(0,243,255,0.6)] hover:bg-white hover:shadow-[0_0_40px_rgba(255,255,255,0.8)] transition-all transform hover:scale-105"
            >
              {snake.length > 3 ? 'Resume' : 'Start Game'}
            </button>
            <p className="text-zinc-400 mt-6 text-sm font-medium">Use arrow keys to move</p>
            <p className="text-zinc-500 text-xs mt-1">Spacebar to pause</p>
          </div>
        )}
      </div>

      {/* Mobile D-Pad Control */}
      <div className="mt-8 grid grid-cols-3 gap-2 md:hidden">
          <div />
          <button onClick={() => handleTouch(Direction.UP)} className="w-16 h-16 bg-zinc-800/80 rounded-xl flex items-center justify-center text-white active:bg-neon-blue/40 border border-white/5 shadow-lg active:scale-95 transition-all text-2xl">↑</button>
          <div />
          <button onClick={() => handleTouch(Direction.LEFT)} className="w-16 h-16 bg-zinc-800/80 rounded-xl flex items-center justify-center text-white active:bg-neon-blue/40 border border-white/5 shadow-lg active:scale-95 transition-all text-2xl">←</button>
          <button onClick={() => handleTouch(Direction.DOWN)} className="w-16 h-16 bg-zinc-800/80 rounded-xl flex items-center justify-center text-white active:bg-neon-blue/40 border border-white/5 shadow-lg active:scale-95 transition-all text-2xl">↓</button>
          <button onClick={() => handleTouch(Direction.RIGHT)} className="w-16 h-16 bg-zinc-800/80 rounded-xl flex items-center justify-center text-white active:bg-neon-blue/40 border border-white/5 shadow-lg active:scale-95 transition-all text-2xl">→</button>
      </div>

    </div>
  );
}
