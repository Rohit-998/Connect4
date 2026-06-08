"use client";

import { useState, useEffect, useCallback } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, RotateCcw, Trophy, Frown, Minus, Lock } from "lucide-react";
import GameBoard from "@/components/ui/game-board";
import QValuePanel from "@/components/ui/q-value-panel";
import AuthModal from "@/components/ui/auth-modal";
import JigglyNav from "@/components/ui/jiggly-nav";
import { apiNewGame, apiMakeMove, apiGetGame, apiSaveReplay } from "@/lib/api";
import { supabase } from "@/lib/supabase";

const EMPTY_BOARD = Array(6)
  .fill(null)
  .map(() => Array(7).fill(0));

export default function PlayPage() {
  const [session, setSession] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [difficulty, setDifficulty] = useState("medium");
  const [opponent, setOpponent] = useState("alphabeta");
  const [gameId, setGameId] = useState(null);
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [qValues, setQValues] = useState([]);
  const [aiMove, setAiMove] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [moves, setMoves] = useState([]);
  const [replaySaved, setReplaySaved] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        setShowAuth(false);
      }
    });
  }, []);

  const handleAuth = (s) => {
    if (s) {
      setSession(s);
      setIsGuest(false);
    } else {
      setIsGuest(true);
    }
    setShowAuth(false);
  };

  const startGame = async () => {
    const token = session?.access_token || null;
    const data = await apiNewGame(difficulty, opponent, token);
    setGameId(data.game_id);
    setBoard(data.board);
    setQValues([]);
    setAiMove(null);
    setGameOver(false);
    setWinner(null);
    setMoves([]);
    setReplaySaved(false);
  };

  const handleColumnClick = async (col) => {
    if (gameOver || thinking || !gameId) return;
    setThinking(true);

    // Optimistic update: show human piece immediately
    const optimisticBoard = board.map((row) => [...row]);
    for (let r = 5; r >= 0; r--) {
      if (optimisticBoard[r][col] === 0) {
        optimisticBoard[r][col] = 1;
        break;
      }
    }
    setBoard(optimisticBoard);

    try {
      const token = session?.access_token || null;
      const data = await apiMakeMove(gameId, col, token);

      if (data.error) {
        console.error(data.error);
        setThinking(false);
        return;
      }

      setBoard(data.board);
      setAiMove(data.ai_move);
      setGameOver(data.game_over);
      setWinner(data.winner);

      // Fetch Q-values after move
      if (!data.game_over && data.ai_move !== null) {
        const gameData = await apiGetGame(gameId);
        if (gameData.q_values) setQValues(gameData.q_values);
        if (gameData.moves) setMoves(gameData.moves);
      }

      // Auto-save replay if game over and logged in
      if (data.game_over && session && !isGuest) {
        const result =
          data.winner === 1 ? "win" : data.winner === 2 ? "loss" : "draw";
        await apiSaveReplay(gameId, result, session.access_token);
        setReplaySaved(true);
      }

      // Save to localStorage for guests
      if (data.game_over && isGuest) {
        const guestReplays = JSON.parse(
          localStorage.getItem("guest_replays") || "[]",
        );
        guestReplays.push({
          difficulty,
          result:
            data.winner === 1 ? "win" : data.winner === 2 ? "loss" : "draw",
          moves,
          date: new Date().toISOString(),
        });
        localStorage.setItem("guest_replays", JSON.stringify(guestReplays));
      }
    } catch (err) {
      console.error("Move error:", err);
    } finally {
      setThinking(false);
    }
  };

  const getResultMessage = () => {
    if (winner === 1)
      return {
        text: "You Win!",
        icon: <Trophy size={20} />,
        color: "text-green-400",
      };
    if (winner === 2)
      return {
        text: "AI Wins!",
        icon: <Frown size={20} />,
        color: "text-red-400",
      };
    return { text: "Draw!", icon: <Minus size={20} />, color: "text-white font-bold" };
  };

  if (showAuth) {
    return (
      <div className="w-full min-h-screen bg-black relative overflow-hidden flex items-center justify-center">
        <MeshGradient
          className="w-full h-full fixed inset-0 opacity-40"
          colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
          speed={0.6}
        />
        <AuthModal isOpen={true} onClose={() => {}} onAuth={handleAuth} />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-black relative overflow-hidden">
      {/* Background */}
      <MeshGradient
        className="w-full h-full fixed inset-0 opacity-30"
        colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
        speed={0.4}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-white/70 font-semibold hover:text-white font-bold transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </a>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Difficulty selector */}
            <div className="flex bg-black/50 backdrop-blur-md rounded-full p-0.5">
              {["easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDifficulty(d);
                    setGameId(null);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    difficulty === d
                      ? "bg-white text-black"
                      : "text-white/70 font-semibold hover:text-white font-bold"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Opponent selector */}
            <div className="flex bg-black/50 backdrop-blur-md rounded-full p-0.5">
              {["alphabeta", "dqn"].map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    setOpponent(o);
                    setGameId(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    opponent === o
                      ? "bg-emerald-500/80 text-white"
                      : "text-white/70 font-semibold hover:text-white font-bold"
                  }`}
                >
                  {o === "alphabeta" ? "α-β" : "RL"}
                </button>
              ))}
            </div>

            {/* User status */}
            <div className="flex items-center gap-3">
              <span className="text-white/50 font-medium text-xs">
                {isGuest ? "Guest" : session?.user?.user_metadata?.user_name || session?.user?.email?.split("@")[0]}
              </span>
              {!isGuest && session && (
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setSession(null);
                    setShowAuth(true);
                    setGameId(null);
                  }}
                  className="px-3 py-1 bg-red-500/10 text-red-400 font-medium rounded-full text-[10px] hover:bg-red-500/20 transition-colors uppercase tracking-wider border border-red-500/20"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left - Board */}
            <div className="flex flex-col items-center gap-4">
              {!gameId ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-8"
                >
                  <div>
                    <h1 className="text-3xl font-bold text-white text-center">
                      Ready to play?
                    </h1>
                    <p className="text-white/70 font-semibold text-sm mt-2 text-center">
                      {opponent === "alphabeta" ? "Alpha-Beta" : "DQN (RL)"} •{" "}
                      <span className="text-white font-bold capitalize">
                        {difficulty}
                      </span>
                      {opponent === "alphabeta" && difficulty === "easy" && " — depth 2"}
                      {opponent === "alphabeta" && difficulty === "medium" && " — depth 4"}
                      {opponent === "alphabeta" && difficulty === "hard" && " — depth 6"}
                      {opponent === "dqn" && difficulty === "easy" && " — 57% win rate"}
                      {opponent === "dqn" && difficulty === "medium" && " — 73% win rate"}
                      {opponent === "dqn" && difficulty === "hard" && " — 89% win rate"}
                    </p>
                  </div>

                  <GameBoard
                    board={EMPTY_BOARD}
                    onColumnClick={() => {}}
                    disabled={true}
                  />

                  <motion.button
                    onClick={startGame}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-10 py-3 bg-white text-black font-semibold rounded-full text-sm hover:bg-white/90 transition-colors"
                  >
                    Start Game
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  <GameBoard
                    board={board}
                    onColumnClick={handleColumnClick}
                    disabled={gameOver || thinking}
                    lastAiMove={aiMove}
                  />

                  {/* Status */}
                  <div className="flex items-center gap-4">
                    {thinking && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/70 font-semibold text-xs flex items-center gap-2"
                      >
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            repeat: Infinity,
                            duration: 1,
                            ease: "linear",
                          }}
                          className="inline-block w-3 h-3 border border-white/30 border-t-white rounded-full"
                        />
                        AI thinking...
                      </motion.span>
                    )}

                    {gameOver && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4"
                      >
                        <span
                          className={`flex items-center gap-2 text-sm font-medium ${getResultMessage().color}`}
                        >
                          {getResultMessage().icon}
                          {getResultMessage().text}
                        </span>

                        <button
                          onClick={startGame}
                          className="flex items-center gap-1.5 text-white/70 font-semibold hover:text-white font-bold text-xs transition-colors"
                        >
                          <RotateCcw size={12} /> New Game
                        </button>

                        {replaySaved && (
                          <a
                            href="/replays"
                            className="flex items-center gap-1.5 text-emerald-400/60 hover:text-emerald-400 text-xs transition-colors"
                          >
                            Watch Replay →
                          </a>
                        )}
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right - AI Brain Panel */}
            <div className="w-full lg:w-72 space-y-4">
              <QValuePanel qValues={qValues} aiMove={aiMove} />

              {/* Move log */}
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-h-48 overflow-y-auto">
                <h3 className="text-white/70 font-semibold text-xs uppercase tracking-[0.2em] mb-4">
                  Move Log
                </h3>
                {moves.length === 0 ? (
                  <p className="text-white/50 font-medium text-sm">No moves yet</p>
                ) : (
                  <div className="space-y-1">
                    {moves.map((m, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-[11px] font-mono"
                      >
                        <span className="text-white/50 font-medium">{m.turn}.</span>
                        <span
                          className={
                            m.player === "human"
                              ? "text-red-400/60"
                              : "text-yellow-400/60"
                          }
                        >
                          {m.player}
                        </span>
                        <span className="text-white/50 font-medium">col {m.col + 1}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Replay button */}
              <div className="relative group">
                <a
                  href={isGuest ? undefined : "/replays"}
                  className={`w-full py-3 rounded-xl text-sm border transition-all block text-center ${
                    isGuest
                      ? "border-white/5 text-white/15 cursor-not-allowed pointer-events-none"
                      : "border-white/10 text-white/90 font-bold hover:text-white font-bold hover:border-white/20"
                  }`}
                >
                  {isGuest && <Lock size={12} className="inline mr-2" />}
                  View Replays
                </a>
                {isGuest && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white/50 text-[10px] px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">
                    Login to view replays
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
