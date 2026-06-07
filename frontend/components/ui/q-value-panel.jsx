"use client"

import { motion } from "motion/react"

export default function QValuePanel({ qValues, aiMove }) {
  if (!qValues || qValues.length === 0) {
    return (
      <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6">
        <h3 className="text-white/70 font-semibold text-xs uppercase tracking-[0.2em] mb-4">AI Brain</h3>
        <p className="text-white/50 font-medium text-sm">Make a move to see the AI think...</p>
      </div>
    )
  }

  const maxQ = Math.max(...qValues.map(Math.abs))
  const minQ = Math.min(...qValues)
  const maxQVal = Math.max(...qValues)

  return (
    <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6">
      <h3 className="text-white/70 font-semibold text-xs uppercase tracking-[0.2em] mb-6">AI Brain — Q-Values</h3>

      <div className="flex items-end gap-2 h-40">
        {qValues.map((q, i) => {
          const normalized = maxQ > 0 ? ((q - minQ) / (maxQVal - minQ || 1)) : 0.5
          const height = Math.max(8, normalized * 100)
          const isChosen = i === aiMove

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                className={`w-full rounded-t-md transition-colors ${
                  isChosen
                    ? "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.4)]"
                    : q > 0
                    ? "bg-white/20"
                    : "bg-red-500/20"
                }`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: i * 0.05 }}
              />
              <span className="text-[10px] text-white/70 font-semibold font-mono">{q.toFixed(2)}</span>
              <span className={`text-[10px] font-mono ${isChosen ? "text-yellow-400" : "text-white/50 font-medium"}`}>
                {i + 1}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="flex justify-between text-[10px]">
          <span className="text-white/50 font-medium">Column preference</span>
          {aiMove !== null && aiMove !== undefined && (
            <span className="text-yellow-400/60">
              Best: Col {aiMove + 1} ({qValues[aiMove]?.toFixed(3)})
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
