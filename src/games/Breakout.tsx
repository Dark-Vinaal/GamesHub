import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';

// Game Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROW_COUNT = 5;
const BRICK_COLUMN_COUNT = 9;
const BRICK_WIDTH = 75;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 10;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 20;

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']; // Red, Orange, Yellow, Green, Blue

export default function Breakout() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [highScore, setHighScore] = useState<number>(() => {
    const saved = localStorage.getItem('breakoutHighScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  
  // Need a ref for game active state to prevent updates after unmount / during pause
  const isActiveRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Game State Mutable Variables (kept in closure for performance)
    let bX = canvas.width / 2;
    let bY = canvas.height - 30;
    let dx = 4 * (Math.random() > 0.5 ? 1 : -1);
    let dy = -4;
    let paddleX = (canvas.width - PADDLE_WIDTH) / 2;
    
    let rightPressed = false;
    let leftPressed = false;
    
    let currentScore = 0;
    let currentLives = 3;
    let currentLevel = 1;
    let isGameOver = false;

    // Initialize Bricks
    let bricks: { x: number, y: number, status: number, color: string }[][] = [];
    const initBricks = () => {
        bricks = [];
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            bricks[c] = [];
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1, color: COLORS[r % COLORS.length] };
            }
        }
    };
    initBricks();

    // Event Listeners
    const keyDownHandler = (e: KeyboardEvent) => {
        if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = true;
        else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = true;
    };
    const keyUpHandler = (e: KeyboardEvent) => {
        if (e.key === 'Right' || e.key === 'ArrowRight') rightPressed = false;
        else if (e.key === 'Left' || e.key === 'ArrowLeft') leftPressed = false;
    };
    const mouseMoveHandler = (e: MouseEvent) => {
        const relativeX = e.clientX - canvas.getBoundingClientRect().left;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - PADDLE_WIDTH / 2;
        }
    };
    const touchMoveHandler = (e: TouchEvent) => {
        const relativeX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - PADDLE_WIDTH / 2;
        }
    };

    window.addEventListener('keydown', keyDownHandler, false);
    window.addEventListener('keyup', keyUpHandler, false);
    canvas.addEventListener('mousemove', mouseMoveHandler, false);
    // Add non-passive event listener for touch to prevent scrolling
    canvas.addEventListener('touchmove', touchMoveHandler, { passive: false });
    
    // Prevent default touch sliding 
    const preventScroll = (e: TouchEvent) => {
        if (e.target === canvas) e.preventDefault();
    };
    document.body.addEventListener('touchmove', preventScroll, { passive: false });

    // Drawing Functions
    const drawBall = () => {
        ctx.beginPath();
        ctx.arc(bX, bY, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#00f3ff'; // neon blue
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f3ff';
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    };

    const drawPaddle = () => {
        ctx.beginPath();
        ctx.roundRect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT, 5);
        ctx.fillStyle = '#bc13fe'; // neon purple
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#bc13fe';
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
    };

    const drawBricks = () => {
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                if (bricks[c][r].status === 1) {
                    const brickX = c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT;
                    const brickY = r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.roundRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT, 4);
                    ctx.fillStyle = bricks[c][r].color;
                    ctx.shadowBlur = 5;
                    ctx.shadowColor = bricks[c][r].color;
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
                    ctx.stroke();
                    ctx.closePath();
                    ctx.shadowBlur = 0;
                }
            }
        }
    };

    const collisionDetection = () => {
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                const b = bricks[c][r];
                if (b.status === 1) {
                    if (
                        bX > b.x && 
                        bX < b.x + BRICK_WIDTH && 
                        bY > b.y && 
                        bY < b.y + BRICK_HEIGHT
                    ) {
                        dy = -dy;
                        b.status = 0;
                        currentScore += 10;
                        setScore(currentScore);
                        
                        // Check if level clear
                        const allCleared = bricks.every(col => col.every(brick => brick.status === 0));
                        if (allCleared) {
                            currentLevel++;
                            initBricks();
                            // Increase speed
                            dx *= 1.2;
                            dy = -Math.abs(dy) * 1.2;
                            bX = canvas.width / 2;
                            bY = canvas.height - 30;
                            paddleX = (canvas.width - PADDLE_WIDTH) / 2;
                        }
                    }
                }
            }
        }
    };

    // Main Game Loop
    let animationId: number;
    const draw = () => {
        if (!isActiveRef.current || isGameOver) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear background
        
        // Draw grid lines background
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for(let i=0; i<canvas.width; i+=40) { ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); }
        for(let j=0; j<canvas.height; j+=40) { ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); }
        ctx.stroke();

        drawBricks();
        drawBall();
        drawPaddle();
        collisionDetection();

        // Bounce off walls
        if (bX + dx > canvas.width - BALL_RADIUS || bX + dx < BALL_RADIUS) dx = -dx;
        if (bY + dy < BALL_RADIUS) dy = -dy;
        else if (bY + dy > canvas.height - BALL_RADIUS) {
            // Check Paddle Collision
            if (bX > paddleX && bX < paddleX + PADDLE_WIDTH) {
                // Change angle based on where it hit the paddle
                let hitPoint = bX - (paddleX + PADDLE_WIDTH / 2);
                let normalizedHit = hitPoint / (PADDLE_WIDTH / 2); // -1 to 1
                let angle = normalizedHit * (Math.PI / 3); // Max 60 degree bounce
                
                let speed = Math.sqrt(dx * dx + dy * dy);
                dx = speed * Math.sin(angle);
                dy = -speed * Math.cos(angle);
            } else {
                currentLives--;
                setLives(currentLives);
                if (currentLives === 0) {
                    isGameOver = true;
                    setGameOver(true);
                    if (currentScore > highScore) {
                        setHighScore(currentScore);
                        localStorage.setItem('breakoutHighScore', currentScore.toString());
                        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                    }
                } else {
                    // Reset ball position
                    bX = canvas.width / 2;
                    bY = canvas.height - 30;
                    dx = 4 * (Math.random() > 0.5 ? 1 : -1);
                    dy = -4;
                    paddleX = (canvas.width - PADDLE_WIDTH) / 2;
                }
            }
        }

        // Move Paddle
        if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) paddleX += 7;
        else if (leftPressed && paddleX > 0) paddleX -= 7;

        bX += dx;
        bY += dy;

        if (!isGameOver) {
           animationId = requestAnimationFrame(draw);
        }
    };

    isActiveRef.current = true;
    draw();

    return () => {
        isActiveRef.current = false;
        cancelAnimationFrame(animationId);
        window.removeEventListener('keydown', keyDownHandler, false);
        window.removeEventListener('keyup', keyUpHandler, false);
        canvas.removeEventListener('mousemove', mouseMoveHandler, false);
        canvas.removeEventListener('touchmove', touchMoveHandler, false);
        document.body.removeEventListener('touchmove', preventScroll);
    };
  }, [gameOver, gameWon, highScore]); // Dependencies control recreation

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4">
      
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-6 max-w-[800px]">
        <div>
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                Breakout
            </h1>
        </div>
        <div className="flex gap-4">
            <div className="glass-panel px-4 py-2 rounded-xl text-center min-w-[80px]">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-1">Score</p>
                <p className="text-xl font-black text-white">{score}</p>
            </div>
            <div className="glass-panel px-4 py-2 rounded-xl text-center min-w-[80px]">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-1">Lives</p>
                <div className="flex gap-1 justify-center items-center h-7 text-red-500 text-lg">
                    {'❤️'.repeat(lives)}
                </div>
            </div>
            <div className="hidden sm:block glass-panel px-4 py-2 rounded-xl text-center min-w-[80px]">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-1">Best</p>
                <p className="text-xl font-black text-neon-purple">{highScore}</p>
            </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="relative w-full max-w-[800px] aspect-[4/3] bg-zinc-950 rounded-2xl border-4 border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex justify-center items-center">
        
        <canvas 
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-transparent w-full h-full object-contain touch-none"
        />

        {/* Overlays */}
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-20 animate-fade-in border border-red-500/30 rounded-xl">
            <h2 className="text-5xl font-black text-red-500 mb-6 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] tracking-tighter uppercase relative">
                Game Over!
            </h2>
            <p className="text-zinc-300 mb-8 font-medium text-xl">Final Score: <span className="text-white font-bold">{score}</span></p>
            <button 
              onClick={() => { setGameOver(false); setScore(0); setLives(3); }}
              className="px-10 py-4 bg-white text-black font-black uppercase tracking-wider rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.5)]"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <p className="mt-8 text-zinc-500 text-sm text-center">
          <strong>Controls:</strong> Arrow keys left/right (⌨️), or slide finger/mouse on the game board (👆).
      </p>

    </div>
  );
}
