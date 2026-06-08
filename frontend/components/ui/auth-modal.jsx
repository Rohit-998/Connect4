"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Mail, Lock, User, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function AuthModal({ isOpen, onClose, onAuth }) {
  const [mode, setMode] = useState("login") // "login" | "signup"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        })
        if (signUpError) throw signUpError
        
        // If email confirmation is required, session will be null
        if (!data.session) {
          setSuccessMsg("Account created! Please check your email to verify your account.")
          setMode("login")
          return // Do not close the modal or call onAuth
        }
        
        onAuth(data.session)
        onClose()
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError
        onAuth(data.session)
        onClose()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGitHub = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: window.location.origin + "/play" },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/play" },
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  const handleGuest = () => {
    onAuth(null) // null session = guest
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-neutral-950 border border-white/10 rounded-2xl p-8 relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 font-semibold hover:text-white font-bold transition-colors">
            <X size={18} />
          </button>

          <h2 className="text-white text-xl font-medium mb-1">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-white/70 font-semibold text-sm mb-8">
            {mode === "login" ? "Sign in to save your replays" : "Join to track your games"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 font-medium" />
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 backdrop-blur-md border border-white/10 rounded-lg pl-9 pr-4 py-3 text-white text-sm placeholder:text-white/50 font-medium focus:outline-none focus:border-white/30 transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 font-medium" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-black/50 backdrop-blur-md border border-white/10 rounded-lg pl-9 pr-4 py-3 text-white text-sm placeholder:text-white/50 font-medium focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 font-medium" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-black/50 backdrop-blur-md border border-white/10 rounded-lg pl-9 pr-4 py-3 text-white text-sm placeholder:text-white/50 font-medium focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs">
                {error}
              </motion.p>
            )}

            {successMsg && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 font-medium text-xs text-center pb-2">
                {successMsg}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-medium py-3 rounded-lg text-sm hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "..." : mode === "login" ? "Sign In" : "Sign Up"}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/50 font-medium text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* GitHub OAuth */}
          <button
            onClick={handleGitHub}
            disabled={loading}
            className="w-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 font-medium py-3 rounded-lg text-sm hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          {/* Google OAuth */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full bg-black/50 backdrop-blur-md border border-white/10 text-white/70 font-medium py-3 rounded-lg text-sm hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Guest option */}
          <button
            onClick={handleGuest}
            className="w-full mt-4 py-3 rounded-lg text-sm border border-dashed border-white/10 text-white/90 font-bold hover:text-white font-bold hover:border-white/20 transition-all"
          >
            Skip — play as guest
          </button>

          <div className="mt-4 pt-4 border-t border-white/5">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="w-full text-white/25 text-xs hover:text-white/50 transition-colors"
            >
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
