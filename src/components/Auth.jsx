import React, { useState } from "react";
import { useAppState } from "../lib/state-context";
import { Loader2, Lock, User, Key, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import VectorAIIcon from "./VectorAIIcon";
import PDFScholarLogo from "./PDFScholarLogo";
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
    <div className="min-h-screen w-screen overflow-y-auto bg-dot-grid flex flex-col items-center justify-center p-4 md:p-8 select-none relative" id="auth-view">
      {/* Matching Dashboard Cyber Ambient Gradient Glows */}
      <div className="ambient-glow ambient-glow-green w-[400px] h-[400px] sm:w-[550px] sm:h-[550px] top-[-80px] left-[-80px] sm:top-[10%] sm:left-[15%] animate-float-slow" />
      <div className="ambient-glow ambient-glow-cyan w-[350px] h-[350px] sm:w-[480px] sm:h-[480px] bottom-[-80px] right-[-80px] sm:bottom-[10%] sm:right-[15%] animate-pulse-glow opacity-20" />
      <div className="ambient-glow ambient-glow-amber w-[300px] h-[300px] top-[40%] right-[10%] opacity-15" />

      {/* Main Glassmorphism Auth Card - Slightly Taller Vertical Silhouette & Sleek Curves */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[430px] w-full glass-card bg-noise rounded-2xl p-7 sm:p-9 py-9 sm:py-11 relative z-10 my-auto overflow-hidden shadow-2xl border border-white/10"
      >
        {/* Top border accent */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#00FF66] to-transparent shadow-[0_0_15px_rgba(0,255,102,0.6)]" />

        {/* Feature Badges */}
        <div className="flex items-center justify-center gap-2 mb-7">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-[10px] font-mono font-medium uppercase tracking-wider shadow-inner">
            <VectorAIIcon className="w-3 h-3 text-[#00FF66] drop-shadow-[0_0_5px_currentColor]" /> Vector Academic RAG
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80 text-[10px] font-mono font-medium uppercase tracking-wider shadow-inner">
            <ShieldCheck className="w-3 h-3 text-[#00FF66] drop-shadow-[0_0_5px_currentColor]" /> Secured
          </span>
        </div>

        {/* Brand Header with Matching Gradient Fade */}
        <div className="text-center mb-8 flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00FF66] mb-4 shadow-inner"
          >
            <PDFScholarLogo className="w-8 h-8 text-[#00FF66] drop-shadow-[0_0_12px_currentColor]" />
          </motion.div>
          
          <h1 className="flex items-center justify-center gap-2 font-black text-2xl sm:text-3xl tracking-tight leading-none">
            <span className="text-[#00FF66] drop-shadow-[0_0_15px_rgba(0,255,102,0.4)]">PDF</span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
              Scholar Hub
            </span>
          </h1>
          <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider mt-3 bg-white/5 inline-block px-3.5 py-1 rounded-full border border-white/5">
            Your AI Research Companion
          </p>
        </div>

        {/* Form Container with Comfortable Vertical Rhythm */}
        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Error Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl p-3.5 text-xs font-mono uppercase text-center leading-relaxed backdrop-blur-sm"
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

            {/* Form Inputs with Sleek Curves */}
            <div className="space-y-3.5">
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500 group-focus-within:text-[#00FF66] transition-colors">
                  <User className="w-4 h-4 drop-shadow-sm" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username (e.g. ayush_scholar)"
                  className="w-full bg-black/50 border border-white/10 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 hover:border-white/20 text-white text-xs sm:text-sm px-4 py-3.5 pl-12 rounded-xl transition-all outline-none placeholder-zinc-500 font-mono shadow-inner"
                  required
                />
              </div>

              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500 group-focus-within:text-[#00FF66] transition-colors">
                  <Lock className="w-4 h-4 drop-shadow-sm" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-black/50 border border-white/10 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 hover:border-white/20 text-white text-xs sm:text-sm px-4 py-3.5 pl-12 rounded-xl transition-all outline-none placeholder-zinc-500 font-mono shadow-inner"
                  required
                />
              </div>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative group overflow-hidden"
                  >
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-zinc-500 group-focus-within:text-[#00FF66] transition-colors">
                      <Key className="w-4 h-4 drop-shadow-sm" />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full bg-black/50 border border-white/10 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 hover:border-white/20 text-white text-xs sm:text-sm px-4 py-3.5 pl-12 rounded-xl transition-all outline-none placeholder-zinc-500 font-mono shadow-inner"
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Subtle Curved Cyber Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-4 bg-gradient-to-r from-[#00FF66] to-[#00E55B] hover:from-[#00E55B] hover:to-[#00CC55] disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,102,0.35)] mt-6 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 text-black animate-spin" />
                  <span>{isLogin ? "Authenticating..." : "Creating Scholar..."}</span>
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
        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
            }}
            className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#00FF66] drop-shadow-[0_0_5px_currentColor]" />
            {isLogin ? <span>New to <strong className="text-[#00FF66]">PDF</strong> Scholar? Create account</span> : <span>Already have an account? Sign In</span>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
