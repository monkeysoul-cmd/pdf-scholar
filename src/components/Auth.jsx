import React, { useState } from "react";
import { useAppState } from "../lib/state-context";
import { GraduationCap, Loader2, Lock, User, Key, ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Auth() {
  const { login, register } = useAppState();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!username.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        const res = await register(username, password);
        setMessage(res.message || "Registration successful! Please sign in.");
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-[#070707] flex flex-col items-center justify-center p-4 md:p-8 select-none relative" id="auth-view">
      {/* Dynamic Animated Ambient Lights */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.15, 0.35, 0.15],
          x: [-20, 20, -20],
          y: [-20, 20, -20],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#00FF66]/10 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.3, 0.1],
          x: [20, -20, 20],
          y: [20, -20, 20],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none"
      />

      {/* Subtle Background Mesh Grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40"
      />

      {/* Main Glassmorphism Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full bg-[#0F0F0F]/90 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl p-8 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 my-auto overflow-hidden"
      >
        {/* Glow border highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00FF66]/50 to-transparent" />

        {/* Feature Badges */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#00FF66]/10 border border-[#00FF66]/20 text-[#00FF66] text-[10px] font-mono font-medium uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> AI Academic RAG
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 text-[10px] font-mono font-medium uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Vector Secured
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 bg-[#161616] border border-zinc-800 text-[#00FF66] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl relative group"
          >
            <div className="absolute inset-0 bg-[#00FF66]/10 rounded-2xl blur-md group-hover:bg-[#00FF66]/20 transition-all" />
            <GraduationCap className="w-9 h-9 relative z-10" />
          </motion.div>
          
          <h1 className="text-3xl font-black tracking-tight text-white leading-none">
            PDF Scholar <span className="text-[#00FF66] drop-shadow-[0_0_15px_rgba(0,255,102,0.4)]">Hub</span>
          </h1>
          <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider mt-2.5">
            Your AI Research Companion
          </p>
        </div>

        {/* Form Container with Animated Tab Switch */}
        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.25 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* Error Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-950/40 text-red-400 border border-red-800/40 rounded-xl p-3.5 text-xs font-mono uppercase text-center leading-relaxed backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Success Notification */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 rounded-xl p-3.5 text-xs font-mono uppercase text-center leading-relaxed backdrop-blur-sm"
              >
                {message}
              </motion.div>
            )}

            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 font-mono uppercase tracking-wider block">
                Username
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-[#00FF66] transition-colors">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. ayush_scholar"
                  className="w-full bg-[#141414] border border-zinc-800 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 hover:border-zinc-700 text-white text-xs px-4 py-3.5 pl-11 rounded-xl transition-all outline-none placeholder-zinc-600 font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 font-mono uppercase tracking-wider block">
                Password
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-[#00FF66] transition-colors">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#141414] border border-zinc-800 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 hover:border-zinc-700 text-white text-xs px-4 py-3.5 pl-11 rounded-xl transition-all outline-none placeholder-zinc-600 font-medium"
                  required
                />
              </div>
            </div>

            {/* Confirm Password (only for registration) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-1.5"
              >
                <label className="text-[11px] font-bold text-zinc-300 font-mono uppercase tracking-wider block">
                  Confirm Password
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-[#00FF66] transition-colors">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#141414] border border-zinc-800 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 hover:border-zinc-700 text-white text-xs px-4 py-3.5 pl-11 rounded-xl transition-all outline-none placeholder-zinc-600 font-medium"
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-4 bg-[#00FF66] hover:bg-[#00e55b] disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,102,0.2)] hover:shadow-[0_0_25px_rgba(0,255,102,0.4)] mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 text-black animate-spin" />
                  <span>{isLogin ? "Signing In..." : "Creating Account..."}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign In to Hub" : "Create Scholar Account"}</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </motion.button>
          </motion.form>
        </AnimatePresence>

        {/* Toggle Mode Footer */}
        <div className="mt-8 text-center border-t border-zinc-800/80 pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
            }}
            className="text-xs font-bold text-zinc-400 hover:text-[#00FF66] uppercase tracking-wider transition-colors inline-flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-[#00FF66]" />
            {isLogin ? "New to PDF Scholar? Create an account" : "Already have an account? Sign In"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
