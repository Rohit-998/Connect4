"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"

const ROWS = 6
const COLS = 7

export default function GameBoard({ board, onColumnClick, disabled, lastAiMove, winningCells }) {
  const [hoverCol, setHoverCol] = useState(null)

  const getCellColor = (cell) => {
    if (cell === 1) return "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
    if (cell === 2) return "bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
    return "bg-white/5"
  }

  const isWinningCell = (r, c) => {
    if (!winningCells) return false
    return winningCells.some(([wr, wc]) => wr === r && wc === c)
  }

  return (
    <div className="relative">
      {/* Column hover indicators */}
      <div className="flex gap-1.5 mb-2">
        {Array.from({ length: COLS }).map((_, col) => (
          <div
            key={col}
            className={`flex-1 h-1.5 rounded-full transition-all duration-200 ${
              hoverCol === col && !disabled ? "bg-red-500/60" : "bg-transparent"
            }`}
          />
        ))}
      </div>

      {/* Board */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-3 inline-block">
        <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {board.map((row, r) =>
            row.map((cell, c) => (
              <motion.button
                key={`${r}-${c}`}
                onClick={() => !disabled && cell === 0 && onColumnClick(c)}
                onMouseEnter={() => setHoverCol(c)}
                onMouseLeave={() => setHoverCol(null)}
                disabled={disabled}
                className={`
                  w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-200 cursor-pointer
                  ${getCellColor(cell)}
                  ${hoverCol === c && cell === 0 && !disabled ? "bg-red-500/20 scale-105" : ""}
                  ${isWinningCell(r, c) ? "ring-2 ring-white animate-pulse" : ""}
                  ${disabled ? "cursor-not-allowed" : "hover:scale-105"}
                `}
                initial={cell !== 0 ? { y: -60, opacity: 0 } : false}
                animate={cell !== 0 ? { y: 0, opacity: 1 } : false}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            ))
          )}
        </div>
      </div>

      {/* AI move indicator */}
      <AnimatePresence>
        {lastAiMove !== null && lastAiMove !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-center text-white/70 font-semibold text-xs tracking-wide"
          >
            AI played column {lastAiMove + 1}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
