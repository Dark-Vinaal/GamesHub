import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

// Game Constants
const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
// Curated list of 5-letter words
const WORD_LIST = [
  "REACT", "VITES", "GAMES", "STYLE", "SMART", "WORLD", "SCORE", "PIXEL", 
  "AUDIO", "DEBUG", "CLOUD", "PROXY", "FETCH", "ASYNC", "AWAIT", "LOGIC"
];

const TARGET_WORD = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

// Helpers
const isLetter = (char: string) => /^[A-Z]$/i.test(char);

export default function WordleClone() {
  const [guesses, setGuesses] = useState<string[]>(Array(MAX_GUESSES).fill(""));
  const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [targetWord, setTargetWord] = useState(TARGET_WORD);

  const [wins, setWins] = useState<number>(() => {
    const saved = localStorage.getItem('wordleWins');
    return saved ? parseInt(saved, 10) : 0;
  });

  const resetGame = () => {
    setTargetWord(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
    setGuesses(Array(MAX_GUESSES).fill(""));
    setCurrentGuessIndex(0);
    setGameOver(false);
    setWon(false);
  };

  // Keyboard Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;

      if (e.key === 'Enter') {
        const currentGuess = guesses[currentGuessIndex];
        if (currentGuess.length === WORD_LENGTH) {
          submitGuess();
        }
      } else if (e.key === 'Backspace') {
        setGuesses(prev => {
          const newGuesses = [...prev];
          newGuesses[currentGuessIndex] = newGuesses[currentGuessIndex].slice(0, -1);
          return newGuesses;
        });
      } else if (isLetter(e.key)) {
        setGuesses(prev => {
          const newGuesses = [...prev];
          const curr = newGuesses[currentGuessIndex];
          if (curr.length < WORD_LENGTH) {
            newGuesses[currentGuessIndex] = curr + e.key.toUpperCase();
          }
          return newGuesses;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guesses, currentGuessIndex, gameOver]);

  // Virtual Keyboard Handler
  const handleKeyClick = (key: string) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      const currentGuess = guesses[currentGuessIndex];
      if (currentGuess.length === WORD_LENGTH) {
        submitGuess();
      }
    } else if (key === 'DELETE') {
      setGuesses(prev => {
        const newGuesses = [...prev];
        newGuesses[currentGuessIndex] = newGuesses[currentGuessIndex].slice(0, -1);
        return newGuesses;
      });
    } else {
      setGuesses(prev => {
        const newGuesses = [...prev];
        const curr = newGuesses[currentGuessIndex];
        if (curr.length < WORD_LENGTH) {
          newGuesses[currentGuessIndex] = curr + key.toUpperCase();
        }
        return newGuesses;
      });
    }
  };

  const submitGuess = () => {
    const currentGuess = guesses[currentGuessIndex];
    
    // Win Condition
    if (currentGuess === targetWord) {
      setWon(true);
      setGameOver(true);
      
      const newWins = wins + 1;
      setWins(newWins);
      localStorage.setItem('wordleWins', newWins.toString());
      
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }});
    } 
    // Loss Condition
    else if (currentGuessIndex === MAX_GUESSES - 1) {
      setGameOver(true);
    } 
    // Next Guess
    else {
      setCurrentGuessIndex(prev => prev + 1);
    }
  };

  // Compute tile colors
  const getTileColor = (guess: string, index: number, isCurrent: boolean) => {
    if (isCurrent || !guess) return "border-zinc-700 bg-zinc-900"; // Empty or typing

    const letter = guess[index];
    const targetLetter = targetWord[index];

    if (letter === targetLetter) {
        return "bg-neon-green border-neon-green text-black font-black shadow-[0_0_15px_rgba(10,255,104,0.3)] animate-flip";
    }

    if (targetWord.includes(letter)) {
        // Need to check for duplicates (basic wordle logic)
        // Count how many times this letter appears in target
        const targetCount = targetWord.split('').filter(l => l === letter).length;
        // Count how many times it was already marked GREEN
        const greenCount = guess.split('').filter((l, i) => l === letter && targetWord[i] === letter).length;
        // Count how many times it comes before this index and is not green
        const yellowCountBefore = guess.split('').slice(0, index).filter((l, i) => l === letter && targetWord[i] !== letter).length;
        
        if (yellowCountBefore + greenCount < targetCount) {
             return "bg-yellow-500 border-yellow-500 text-black font-black shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-flip";
        }
    }

    return "bg-zinc-800 border-zinc-800 text-zinc-400 animate-flip";
  };

  // Keyboard layout
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
  ];

  // Helper to get keyboard key colors
  const getKeyColor = (key: string) => {
      let status = 'bg-zinc-700 hover:bg-zinc-600 text-white';
      // Search all PAST guesses
      for (let i = 0; i < currentGuessIndex; i++) {
          const guess = guesses[i];
          for (let j = 0; j < WORD_LENGTH; j++) {
              if (guess[j] === key) {
                  if (targetWord[j] === key) {
                      return 'bg-neon-green text-black shadow-md'; // Best match wins
                  }
                  if (targetWord.includes(key)) {
                      status = 'bg-yellow-500 text-black'; // Doesn't override green
                  } else if (status === 'bg-zinc-700 hover:bg-zinc-600 text-white') {
                      status = 'bg-zinc-800 text-zinc-500'; // Gray out
                  }
              }
          }
      }
      return status;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto min-h-[80vh]">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8 pb-4 border-b border-white/10">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-400 tracking-widest uppercase">
            Word Guess
        </h1>
        <div className="glass-panel px-4 py-2 rounded-xl text-center min-w-[80px]">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none mb-1">Total Wins</p>
            <p className="text-xl font-black text-white">{wins}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-rows-6 gap-2 mb-8">
        {guesses.map((guess, rIndex) => {
            const isCurrent = rIndex === currentGuessIndex && !gameOver;
            const isFuture = rIndex > currentGuessIndex;
            
            return (
                <div key={rIndex} className="grid grid-cols-5 gap-2">
                    {Array.from({ length: WORD_LENGTH }).map((_, cIndex) => {
                        const letter = guess[cIndex] || "";
                        const bgClass = isFuture ? "border-zinc-800 bg-zinc-900/50" : getTileColor(guess, cIndex, isCurrent);
                        return (
                            <div 
                                key={cIndex}
                                className={`w-12 h-12 md:w-16 md:h-16 border-2 flex items-center justify-center text-2xl md:text-3xl font-bold uppercase transition-all duration-500 ${bgClass}`}
                                style={{ animationDelay: isCurrent ? '0s' : `${cIndex * 100}ms` }}
                            >
                                {letter}
                            </div>
                        )
                    })}
                </div>
            )
        })}
      </div>

      {/* Messages */}
      {gameOver && (
          <div className="mb-6 p-4 glass-panel rounded-xl text-center w-full max-w-sm animate-pop-in border border-white/10">
              {won ? (
                  <h2 className="text-2xl font-black text-neon-green mb-1 uppercase">Genius!</h2>
              ) : (
                  <div>
                      <h2 className="text-2xl font-black text-red-500 mb-1 uppercase">Game Over</h2>
                      <p className="text-zinc-400 mb-2">The word was: <span className="text-white font-bold tracking-widest">{targetWord}</span></p>
                  </div>
              )}
              <button 
                  onClick={resetGame}
                  className="mt-4 px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-full hover:bg-zinc-200 transition-colors w-full"
              >
                  Play Again
              </button>
          </div>
      )}

      {/* Virtual Keyboard */}
      <div className="w-full max-w-md flex flex-col gap-2">
        {rows.map((row, i) => (
            <div key={i} className="flex justify-center gap-1.5 md:gap-2">
                {row.map(key => {
                    const isBig = key === 'ENTER' || key === 'DELETE';
                    return (
                        <button
                            key={key}
                            onClick={() => handleKeyClick(key)}
                            disabled={gameOver}
                            className={`${isBig ? 'px-2 md:px-4 text-xs md:text-sm' : 'flex-1'} h-12 md:h-14 font-bold rounded flex items-center justify-center uppercase transition-colors ${getKeyColor(key)} disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {key === 'DELETE' ? '⌫' : key}
                        </button>
                    )
                })}
            </div>
        ))}
      </div>

    </div>
  );
}
