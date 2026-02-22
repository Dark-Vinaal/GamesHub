import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

type Player = "X" | "O" | null;

export default function TicTacToe() {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true); // User is X
  const [winner, setWinner] = useState<Player | "Draw">(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  const checkWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6],            // diags
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || isAiThinking || !isXNext) return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsXNext(false);
  };

  // AI Turn
  useEffect(() => {
    const w = checkWinner(board);
    if (w) {
      setWinner(w.winner);
      setWinningLine(w.line);
      return;
    }
    if (!board.includes(null)) {
      setWinner("Draw");
      return;
    }

    if (!isXNext && !winner) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const aiMove = getAiMove(board);
        if (aiMove !== -1) {
          const newBoard = [...board];
          newBoard[aiMove] = "O";
          setBoard(newBoard);
          setIsXNext(true);
        }
        setIsAiThinking(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [board, isXNext, winner]);

  // AI Logic
  const getAiMove = (currentBoard: Player[]): number => {
    const emptyIndices = currentBoard.map((v, i) => (v === null ? i : -1)).filter((i) => i !== -1);
    // 1. Try to win
    for (let i of emptyIndices) {
      let testBoard = [...currentBoard];
      testBoard[i] = "O";
      const w = checkWinner(testBoard);
      if (w && w.winner === "O") return i;
    }
    // 2. Try to block
    for (let i of emptyIndices) {
      let testBoard = [...currentBoard];
      testBoard[i] = "X";
      const w = checkWinner(testBoard);
      if (w && w.winner === "X") return i;
    }
    // 3. Take center
    if (currentBoard[4] === null) return 4;
    // 4. Take corner
    const corners = [0, 2, 6, 8].filter(i => currentBoard[i] === null);
    if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
    // 5. Random
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] relative flex flex-col items-center justify-center p-4">
       {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-glow" />
      </div>

      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="p-3 rounded-full glass-panel hover:bg-white/10 transition-colors group block">
          <span className="text-xl text-white group-hover:-translate-x-1 transition-transform inline-block">←</span>
        </Link>
      </div>

      <h1 className="text-5xl font-bold mb-12 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent neon-text tracking-wider">
        TIC TAC TOE
      </h1>

      <div className="relative mb-8">
        {/* The Grid Container */}
        <div className="grid grid-cols-3 gap-4 p-4 glass-panel rounded-3xl relative z-10">
          {board.map((cell, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              disabled={!!cell || !!winner || isAiThinking}
              className={`
                w-24 h-24 md:w-32 md:h-32 rounded-2xl flex items-center justify-center text-6xl md:text-7xl font-bold transition-all duration-300
                ${cell === "X" ? "text-neon-blue drop-shadow-[0_0_15px_rgba(0,243,255,0.8)]" : 
                  cell === "O" ? "text-neon-purple drop-shadow-[0_0_15px_rgba(188,19,254,0.8)]" : 
                  "hover:bg-white/5"}
                ${winningLine?.includes(i) ? 'bg-white/10' : ''}
              `}
            >
              <span className={`transform transition-all duration-300 ${cell ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
                {cell}
              </span>
            </button>
          ))}
          
          {/* Grid Lines (Visual Decoration) */}
          <div className="absolute inset-4 pointer-events-none rounded-2xl border border-white/5" />
        </div>
      </div>

      {/* Info / Status */}
      <div className="h-12 flex items-center justify-center">
        {winner ? (
            <div className="text-center animate-in zoom-in fade-in duration-300">
                <div className="text-2xl font-bold text-white mb-4">
                    {winner === "Draw" ? "GRID LOCKED - DRAW" : <span className="neon-text">{winner} WINS THE MATCH</span>}
                </div>
                <button
                    onClick={resetGame}
                    className="px-8 py-2 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-bold tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(188,19,254,0.4)]"
                >
                    REMATCH
                </button>
            </div>
        ) : (
            <div className="text-zinc-400 font-mono tracking-widest animate-pulse">
                {isXNext ? "PLAYER TURN (X)" : "NEURAL NET THINKING..."}
            </div>
        )}
      </div>
    </div>
  );
}
