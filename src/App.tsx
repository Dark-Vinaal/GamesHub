import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import RockPaperScissors from "./pages/RockPaperScissors";
import TicTacToe from "./pages/TicTacToe";
import DiceRoll from "./pages/DiceRoll";
import CoinFlip from "./pages/CoinFlip";
import Snake from "./pages/Snake";
import Memory from "./pages/Memory";
import TetrisHome from "./pages/TetrisHome";
import Game2048Home from "./pages/Game2048Home";
import BreakoutHome from "./pages/BreakoutHome";
import Wordle from "./pages/Wordle";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/game/rps" element={<RockPaperScissors />} />
        <Route path="/game/ttt" element={<TicTacToe />} />
        <Route path="/game/dice" element={<DiceRoll />} />
        <Route path="/game/coin" element={<CoinFlip />} />
        <Route path="/game/snake" element={<Snake />} />
        <Route path="/game/memory" element={<Memory />} />
        <Route path="/game/tetris" element={<TetrisHome />} />
        <Route path="/game/2048" element={<Game2048Home />} />
        <Route path="/game/breakout" element={<BreakoutHome />} />
        <Route path="/game/wordle" element={<Wordle />} />
      </Routes>
    </BrowserRouter>
  );
}
