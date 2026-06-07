"use client";

import { useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { motion } from "motion/react";
import { ArrowLeft, Play, Trophy, Frown, Minus, Zap, Brain } from "lucide-react";
import GameBoard from "@/components/ui/game-board";
import JigglyNav from "@/components/ui/jiggly-nav";
import { apiAIvsAI } from "@/lib/api";

const EMPTY_BOARD = Array(6)
  .fill(null)
  .map(() => Array(7).fill(0));

export default function AIvsAIPage() {
  const [difficulty, setDifficulty] = useState("hard");
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [moves, setMoves] = useState([]);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isReplaying, setIsReplaying] = useState(false);
  const [allMoves, setAllMoves] = useState([]);
  const [finalBoard, setFinalBoard] = useState(null);

  const runBattle = async () => {
    setLoading(true);
    setBoard(EMPTY_BOARD);
    setMoves([]);
    setWinner(null);
    setGameStarted(false);
    setCurrentMoveIndex(0);
    setIsReplaying(false);

    try {
      const data = await apiAIvsAI(difficulty);
      setAllMoves(data.moves);
      setFinalBoard(data.board);
      setWinner(data.winner);
      setGameStarted(true);
      setIsReplaying(true);

      // Replay moves one by one with animation
      let currentBoard = Array(6).fill(null).map(() => Array(7).fill(0));
      for (let i = 0; i < data.moves.length; i++) {
        await new Promise((r) => setTimeout(r, 400));
        const move = data.moves[i];
        currentBoard = currentBoard.map((row) => [...row]);
        currentBoard[move.row][move.col] = move.player === "dqn" ? 1 : 2;
        setBoard(currentBoard.map((row) => [...row]));
        setMoves(data.moves.slice(0, i + 1));
        setCurrentMoveIndex(i + 1);
      }
      setIsReplaying(false);
    } catch (err) {
      console.error("AI vs AI error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getResultDisplay = () => {
    if (!winner) return null;
    if (winner === "dqn")
      return { text: "DQN (RL) Wins!", icon: <Zap size={20} />, color: "text-yellow-400" };
    if (winner === "alphabeta")
      return { text: "Alpha-Beta Wins!", icon: <Brain size={20} />, color: "text-emerald-400" };
    return { text: "Draw!", icon: <Minus size={20} />, color: "text-white/60" };
  };

  const result = getResultDisplay();

  return (
    <div className="w-full min-h-screen bg-black relative overflow-hidden">
      <MeshGradient
        className="w-full h-full fixed inset-0 opacity-30"
        colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
        speed={0.4}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <a
            href="/"
            className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </a>

          <div className="flex items-center gap-3">
            <div className="flex bg-white/5 rounded-full p-0.5">
              {["easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  disabled={isReplaying}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    difficulty === d
                      ? "bg-white text-black"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Board */}
            <div className="flex flex-col items-center gap-4">
              <GameBoard
                board={board}
                onColumnClick={() => {}}
                aiMove={null}
                gameOver={!!winner && !isReplaying}
              />

              {/* Result / Controls */}
              <div className="flex items-center gap-4">
                {winner && !isReplaying && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 ${result.color} text-sm font-medium`}
                  >
                    {result.icon}
                    {result.text}
                  </motion.div>
                )}

                {isReplaying && (
                  <div className="flex items-center gap-2 text-white/40 text-sm">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap size={14} />
                    </motion.div>
                    Replaying... move {currentMoveIndex}/{allMoves.length}
                  </div>
                )}

                <button
                  onClick={runBattle}
                  disabled={loading || isReplaying}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-sm transition-all disabled:opacity-30"
                >
                  <Play size={14} />
                  {gameStarted ? "Rematch" : "Start Battle"}
                </button>
              </div>
            </div>

            {/* Right Panel - Info */}
            <div className="flex flex-col gap-4 w-80">
              {/* VS Card */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <h2 className="text-white/60 text-xs font-medium tracking-widest mb-4">
                  AI VS AI
                </h2>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-2">
                      <Zap size={18} className="text-yellow-400" />
                    </div>
                    <div className="text-white text-sm font-medium">DQN</div>
                    <div className="text-white/30 text-xs">Reinforcement Learning</div>
                    <div className="text-yellow-400/60 text-xs mt-1">Player 1</div>
                  </div>
                  <div className="text-white/20 text-lg font-bold">VS</div>
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                      <Brain size={18} className="text-emerald-400" />
                    </div>
                    <div className="text-white text-sm font-medium">Alpha-Beta</div>
                    <div className="text-white/30 text-xs">Game Tree Search</div>
                    <div className="text-emerald-400/60 text-xs mt-1">Player 2</div>
                  </div>
                </div>
              </div>

              {/* Move Log */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 max-h-64 overflow-y-auto scrollbar-hide">
                <h2 className="text-white/60 text-xs font-medium tracking-widest mb-3">
                  MOVE LOG
                </h2>
                {moves.length === 0 ? (
                  <p className="text-white/20 text-xs">
                    Click &quot;Start Battle&quot; to watch DQN vs Alpha-Beta
                  </p>
                ) : (
                  <div className="space-y-1">
                    {moves.map((m, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-white/20">{m.turn}.</span>
                        <span
                          className={
                            m.player === "dqn"
                              ? "text-yellow-400"
                              : "text-emerald-400"
                          }
                        >
                          {m.player === "dqn" ? "DQN" : "α-β"}
                        </span>
                        <span className="text-white/40">col {m.col + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <JigglyNav />
    </div>
  );
}
