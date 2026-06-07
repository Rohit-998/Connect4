"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "next/navigation"
import { MeshGradient } from "@paper-design/shaders-react"
import { motion } from "motion/react"
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, RotateCcw } from "lucide-react"
import GameBoard from "@/components/ui/game-board"
import JigglyNav from "@/components/ui/jiggly-nav"
import { supabase } from "@/lib/supabase"
import { apiGetReplay } from "@/lib/api"

const EMPTY_BOARD = Array(6).fill(null).map(() => Array(7).fill(0))
const SPEED_OPTIONS = [
  { label: "1x", value: 1000 },
  { label: "1.25x", value: 800 },
  { label: "1.5x", value: 667 },
  { label: "2x", value: 500 },
]

export default function ReplayViewerPage() {
  const params = useParams()
  const [replay, setReplay] = useState(null)
  const [loading, setLoading] = useState(true)
  const [board, setBoard] = useState(EMPTY_BOARD)
  const [currentTurn, setCurrentTurn] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)
  const timerRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (s && params.id) {
        const data = await apiGetReplay(params.id, s.access_token)
        if (data.replay) setReplay(data.replay)
      }
      setLoading(false)
    })
  }, [params.id])

  const buildBoardAtTurn = useCallback((turnIndex) => {
    if (!replay) return EMPTY_BOARD
    const newBoard = Array(6).fill(null).map(() => Array(7).fill(0))
    
    for (let i = 0; i < turnIndex; i++) {
      const move = replay.moves[i]
      const player = move.player === "human" ? 1 : 2
      newBoard[move.row][move.col] = player
    }
    
    return newBoard
  }, [replay])

  useEffect(() => {
    setBoard(buildBoardAtTurn(currentTurn))
  }, [currentTurn, buildBoardAtTurn])

  // Playback logic
  useEffect(() => {
    if (isPlaying && replay) {
      timerRef.current = setInterval(() => {
        setCurrentTurn((prev) => {
          if (prev >= replay.moves.length) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, speed)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, speed, replay])

  const togglePlay = () => {
    if (currentTurn >= (replay?.moves?.length || 0)) {
      setCurrentTurn(0)
    }
    setIsPlaying(!isPlaying)
  }

  const stepForward = () => {
    setIsPlaying(false)
    if (replay && currentTurn < replay.moves.length) {
      setCurrentTurn(currentTurn + 1)
    }
  }

  const stepBack = () => {
    setIsPlaying(false)
    if (currentTurn > 0) {
      setCurrentTurn(currentTurn - 1)
    }
  }

  const reset = () => {
    setIsPlaying(false)
    setCurrentTurn(0)
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <span className="text-white/50 font-medium text-sm">Loading replay...</span>
      </div>
    )
  }

  if (!replay) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <span className="text-white/70 font-semibold text-sm">Replay not found</span>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-black relative overflow-hidden">
      <MeshGradient
        className="w-full h-full fixed inset-0 opacity-30"
        colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
        speed={0.3}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <a href="/replays" className="flex items-center gap-2 text-white/70 font-semibold hover:text-white font-bold transition-colors text-sm">
            <ArrowLeft size={16} /> Replays
          </a>
          <div className="text-white/50 font-medium text-xs">
            <span className="capitalize">{replay.result}</span>
            <span className="text-white/10 mx-2">·</span>
            <span>vs DQN ({replay.difficulty})</span>
            <span className="text-white/10 mx-2">·</span>
            <span>{replay.moves.length} moves</span>
          </div>
          <div className="w-16" />
        </div>

        {/* Board */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">
          <GameBoard board={board} onColumnClick={() => {}} disabled={true} />

          {/* Playback Controls */}
          <div className="flex flex-col items-center gap-4">
            {/* Transport */}
            <div className="flex items-center gap-3">
              <button onClick={reset} className="text-white/50 font-medium hover:text-white/50 transition-colors">
                <RotateCcw size={16} />
              </button>
              <button onClick={stepBack} className="text-white/50 font-medium hover:text-white/50 transition-colors">
                <SkipBack size={18} />
              </button>
              <motion.button
                onClick={togglePlay}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold hover:bg-white/15 transition-colors"
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </motion.button>
              <button onClick={stepForward} className="text-white/50 font-medium hover:text-white/50 transition-colors">
                <SkipForward size={18} />
              </button>
            </div>

            {/* Progress bar */}
            <div className="w-80 flex items-center gap-3">
              <span className="text-white/50 font-medium text-[10px] font-mono w-6 text-right">{currentTurn}</span>
              <div className="flex-1 h-1 bg-black/50 backdrop-blur-md rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/30 rounded-full"
                  animate={{ width: `${(currentTurn / (replay.moves.length || 1)) * 100}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <span className="text-white/50 font-medium text-[10px] font-mono w-6">{replay.moves.length}</span>
            </div>

            {/* Speed selector */}
            <div className="flex bg-black/50 backdrop-blur-md rounded-full p-0.5">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setSpeed(opt.value)}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all ${
                    speed === opt.value
                      ? "bg-white text-black"
                      : "text-white/70 font-semibold hover:text-white font-bold"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Move list */}
          <div className="w-80 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 max-h-32 overflow-y-auto">
            <div className="space-y-0.5">
              {replay.moves.map((m, i) => (
                <div
                  key={i}
                  className={`flex justify-between text-[10px] font-mono px-2 py-0.5 rounded ${
                    i < currentTurn ? "opacity-100" : "opacity-20"
                  } ${i === currentTurn - 1 ? "bg-black/50 backdrop-blur-md" : ""}`}
                >
                  <span className="text-white/70 font-semibold">{m.turn}.</span>
                  <span className={m.player === "human" ? "text-red-400/60" : "text-yellow-400/60"}>
                    {m.player}
                  </span>
                  <span className="text-white/50 font-medium">col {m.col + 1}, row {m.row + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <JigglyNav />
    </div>
  )
}
