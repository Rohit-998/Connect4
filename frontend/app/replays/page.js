"use client";

import { useState, useEffect } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  PlayCircle,
  Trophy,
  Frown,
  Minus,
  Clock,
} from "lucide-react";
import JigglyNav from "@/components/ui/jiggly-nav";
import { supabase } from "@/lib/supabase";
import { apiGetReplays } from "@/lib/api";

export default function ReplaysPage() {
  const [replays, setReplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (s) {
        setSession(s);
        const data = await apiGetReplays(s.access_token);
        if (data.replays) setReplays(data.replays);
      }
      setLoading(false);
    });
  }, []);

  const getResultIcon = (result) => {
    if (result === "win")
      return <Trophy size={14} className="text-green-400" />;
    if (result === "loss") return <Frown size={14} className="text-red-400" />;
    return <Minus size={14} className="text-white/90 font-bold" />;
  };

  const getResultColor = (result) => {
    if (result === "win") return "text-green-400/80";
    if (result === "loss") return "text-red-400/80";
    return "text-white/90 font-bold";
  };

  return (
    <div className="w-full min-h-screen bg-black relative overflow-hidden">
      <MeshGradient
        className="w-full h-full fixed inset-0 opacity-30"
        colors={["#000000", "#1a1a1a", "#333333", "#ffffff"]}
        speed={0.4}
      />

      <div className="relative z-10 min-h-screen">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <a
            href="/"
            className="flex items-center gap-2 text-white/70 font-semibold hover:text-white font-bold transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Back
          </a>
          <h1 className="text-white/70 font-semibold text-xs uppercase tracking-[0.3em]">
            Your Replays
          </h1>
          <div className="w-16" />
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 py-12">
          {loading ? (
            <div className="text-center text-white/50 font-medium text-sm">Loading...</div>
          ) : !session ? (
            <div className="text-center py-20">
              <p className="text-white/70 font-semibold text-sm mb-4">
                Login to view your replays
              </p>
              <a
                href="/play"
                className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Go to Play
              </a>
            </div>
          ) : replays.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/70 font-semibold text-sm mb-4">
                No replays yet. Play some games first!
              </p>
              <a
                href="/play"
                className="px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Play Now
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              {replays.map((replay, i) => (
                <motion.a
                  key={replay.id}
                  href={`/replay/${replay.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-md border border-white/5 rounded-xl hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {getResultIcon(replay.result)}
                    <div>
                      <span
                        className={`text-sm font-medium capitalize ${getResultColor(replay.result)}`}
                      >
                        {replay.result}
                      </span>
                      <span className="text-white/50 font-medium text-xs ml-3">
                        vs {replay.opponent === "dqn" ? "DQN" : "Alpha-Beta"} ({replay.difficulty})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-white/15 text-xs font-mono">
                      {replay.total_turns} moves
                    </span>
                    <span className="text-white/15 text-xs">
                      {new Date(replay.created_at).toLocaleDateString()}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/70 font-semibold text-xs font-medium group-hover:bg-white/10 group-hover:text-white font-bold transition-all">
                      Watch
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </div>

      <JigglyNav />
    </div>
  );
}
