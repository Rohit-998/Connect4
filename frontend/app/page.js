"use client"

import { useState } from "react"
import { MeshGradient } from "@paper-design/shaders-react"
import { motion } from "motion/react"
import JigglyNav from "@/components/ui/jiggly-nav"

export default function Home() {
  const [speed] = useState(0.6)

  return (
    <div className="w-full min-h-screen bg-black relative overflow-hidden">
      <MeshGradient
        className="w-full h-full fixed inset-0 opacity-40"
        colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
        speed={speed}
      />

      <div className="relative z-10">

        {/* ─── HERO ─── */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <h1 className="text-7xl md:text-[9rem] font-bold text-white tracking-tighter leading-[0.85]">
              Connect
              <br />
              Four
            </h1>

            <p className="mt-8 text-white/90 font-bold text-base md:text-lg max-w-lg mx-auto leading-relaxed font-medium">
              Two AI engines built from scratch.{" "}
              <span className="text-yellow-400/60">Deep Q-Network</span> meets{" "}
              <span className="text-emerald-400/60">Alpha-Beta Pruning</span>.
              Play against them or watch them fight each other.
            </p>

            <div className="mt-12 flex gap-3 items-center justify-center">
              <motion.a
                href="/play"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 bg-white text-black font-medium rounded-full text-sm"
              >
                Play
              </motion.a>
              <motion.a
                href="/ai-battle"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-3.5 bg-white/[0.06] text-white font-bold font-medium rounded-full text-sm hover:bg-white/[0.1] transition-colors"
              >
                AI vs AI
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-12"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </motion.div>
        </section>

        {/* ─── THE TWO ENGINES ─── */}
        <section className="px-6 py-32">
          <div className="max-w-5xl mx-auto">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-white/50 font-medium text-[11px] uppercase tracking-[0.4em] mb-16"
            >
              Two engines, one board
            </motion.p>

            {/* DQN */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              <div className="flex items-baseline gap-4 mb-4">
                <h3 className="text-white text-3xl md:text-5xl font-bold tracking-tight">DQN</h3>
                <span className="text-yellow-500/40 text-sm font-mono">reinforcement learning</span>
              </div>
              <p className="text-white/35 text-base leading-relaxed max-w-2xl font-medium">
                A Convolutional Neural Network trained through 10,000 self-play episodes.
                It learned patterns from experience — not programmed rules. Sometimes brilliant,
                sometimes blind. Uses a safety layer to block obvious threats it might miss.
              </p>
              <div className="mt-6 flex gap-6 text-xs text-white/50 font-medium font-mono">
                <span>easy · ep8000</span>
                <span>medium · ep6000</span>
                <span>hard · ep2000</span>
              </div>
            </motion.div>

            {/* Alpha-Beta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-baseline gap-4 mb-4">
                <h3 className="text-white text-3xl md:text-5xl font-bold tracking-tight">Alpha-Beta</h3>
                <span className="text-emerald-500/40 text-sm font-mono">game tree search</span>
              </div>
              <p className="text-white/35 text-base leading-relaxed max-w-2xl font-medium">
                Hand-crafted minimax with alpha-beta pruning. Searches up to 6 moves ahead,
                evaluates center control, threats, and blocking. Deterministic —
                given the same board, it always finds the mathematically best move. No luck.
              </p>
              <div className="mt-6 flex gap-6 text-xs text-white/50 font-medium font-mono">
                <span>easy · depth 2</span>
                <span>medium · depth 4</span>
                <span>hard · depth 6</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="px-6 py-32 border-t border-white/[0.03]">
          <div className="max-w-5xl mx-auto">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-white/50 font-medium text-[11px] uppercase tracking-[0.4em] mb-16"
            >
              What you get
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
              {[
                {
                  title: "AI vs AI Battle",
                  desc: "DQN vs Alpha-Beta, head to head. Random openings, full-strength mid-game. Every battle is different.",
                },
                {
                  title: "Live Q-Values",
                  desc: "Watch the AI think. Column-by-column scores update in real-time as the board changes.",
                },
                {
                  title: "Game Replays",
                  desc: "Every game saved automatically. Watch it back move by move. Works with GitHub and Google login.",
                },
                {
                  title: "OAuth Login",
                  desc: "One-click sign in with GitHub or Google. Replays sync across devices. Or play as guest.",
                },
                {
                  title: "Heuristic Scoring",
                  desc: "Center control, 2-in-a-row, 3-in-a-row, blocking — all hand-tuned scoring. No black box.",
                },
                {
                  title: "Open Source",
                  desc: "Every line on GitHub. The DQN training, the minimax, the frontend. Built from scratch.",
                },
              ].map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <h4 className="text-white/70 text-sm font-medium mb-2">{f.title}</h4>
                  <p className="text-white/25 text-sm font-medium leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="px-6 py-32 border-t border-white/[0.03]">
          <div className="max-w-5xl mx-auto">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-white/50 font-medium text-[11px] uppercase tracking-[0.4em] mb-16"
            >
              How it works
            </motion.p>

            <div className="flex flex-col md:flex-row gap-12 md:gap-20">
              {[
                { n: "01", title: "Pick your opponent", desc: "DQN or Alpha-Beta. Easy, Medium, or Hard." },
                { n: "02", title: "Drop your piece", desc: "Click a column. Your disc drops instantly. AI responds." },
                { n: "03", title: "Win or learn", desc: "Replay saved automatically. Watch it back or try again." },
              ].map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex-1"
                >
                  <span className="text-white/30 text-6xl font-bold font-mono block leading-none mb-4">{step.n}</span>
                  <h4 className="text-white/90 text-sm font-medium mb-2">{step.title}</h4>
                  <p className="text-white/60 text-sm font-medium">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── NUMBERS ─── */}
        <section className="px-6 py-24 border-t border-white/[0.03]">
          <div className="max-w-5xl mx-auto flex flex-wrap justify-between gap-12">
            {[
              { n: "2", l: "AI engines" },
              { n: "10K", l: "training episodes" },
              { n: "6", l: "max search depth" },
              { n: "3", l: "difficulty levels" },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="text-white text-3xl md:text-4xl font-bold font-mono">{s.n}</span>
                <span className="text-white/50 font-medium text-xs ml-3">{s.l}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── STACK + FOOTER ─── */}
        <footer className="px-6 py-12 border-t border-white/[0.03]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-white/15 text-xs font-medium">
              TensorFlow · NumPy · FastAPI · Next.js · Tailwind · Supabase · Framer Motion
            </p>
            <a
              href="https://github.com/Rohit-998/Connect4"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/15 text-xs hover:text-white/90 font-bold transition-colors"
            >
              source ↗
            </a>
          </div>
        </footer>
      </div>

      <JigglyNav />
    </div>
  )
}
