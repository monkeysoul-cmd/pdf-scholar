import React, { useState } from "react";
import { useAppState } from "../lib/state-context";
import { Loader2, Lock, User, Key, ArrowRight, ShieldCheck, Terminal, Cpu } from "lucide-react";
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
        setMessage(res.message || "Account registered successfully. Please authenticate.");
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-tactical-grid flex flex-col items-center justify-center p-4 md:p-8 select-text-content relative" id="auth-view">
      {/* High-Precision Hardware Terminal Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[440px] w-full terminal-panel hud-bracket hud-bracket-accent laser-top bg-noise rounded-xl p-7 sm:p-9 relative z-10 my-auto shadow-2xl"
      >
        {/* Top Hardware Telemetry Header */}
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="status-led-green" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
              TERMINAL // {isLogin ? "AUTH_GATEWAY" : "KEY_GEN"}
            </span>
          </div>
          <span className="terminal-badge terminal-badge-green">
            SYS // ONLINE
          </span>
        </div>

        {/* Brand Identity */}
        <div className="text-center mb-7 flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-14 h-14 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#00FF66] mb-3.5 shadow-inner"
          >
            <PDFScholarLogo className="w-7 h-7 text-[#00FF66] drop-shadow-[0_0_8px_currentColor]" />
          </motion.div>
          
          <h1 className="flex items-center justify-center gap-2 font-black text-2xl tracking-tight leading-none">
            <span className="text-[#00FF66]">PDF</span>
            <span className="text-white">
              Scholar Hub
            </span>
          </h1>
          <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mt-2">
            NEURAL RAG RESEARCH TERMINAL
          </p>
        </div>

        {/* Form Container */}
        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, x: isLogin ? -6 : 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 6 : -6 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Error Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg p-3 text-xs font-mono normal-case text-center leading-relaxed"
              >
                ERR // {error}
              </motion.div>
            )}

            {/* Success Notification */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 rounded-lg p-3 text-xs font-mono normal-case text-center leading-relaxed"
              >
                OK // {message}
              </motion.div>
            )}

            {/* Form Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  OPERATOR // USERNAME
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
                    className="w-full bg-black/60 border border-white/10 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 hover:border-white/20 text-white text-xs sm:text-sm px-4 py-3 pl-11 rounded-lg transition-all outline-none placeholder-zinc-600 font-mono shadow-inner"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  SECURITY // PASSWORD
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-[#00FF66] transition-colors">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/60 border border-white/10 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 hover:border-white/20 text-white text-xs sm:text-sm px-4 py-3 pl-11 rounded-lg transition-all outline-none placeholder-zinc-600 font-mono shadow-inner"
                    required
                  />
                </div>
              </div>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden"
                  >
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                      VERIFY // CONFIRM_PASSWORD
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-[#00FF66] transition-colors">
                        <Key className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-black/60 border border-white/10 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 hover:border-white/20 text-white text-xs sm:text-sm px-4 py-3 pl-11 rounded-lg transition-all outline-none placeholder-zinc-600 font-mono shadow-inner"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tactical High-Contrast Action Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#00FF66] hover:bg-[#1aff75] disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] mt-6 cursor-pointer font-mono"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 text-black animate-spin" />
                  <span>{isLogin ? "AUTHENTICATING..." : "GENERATING CREDS..."}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "[ INITIALIZE SESSION ]" : "[ REGISTER OPERATOR ]"}</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </motion.button>
          </motion.form>
        </AnimatePresence>

        {/* Toggle Mode Footer */}
        <div className="mt-7 text-center border-t border-white/[0.08] pt-5">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
            }}
            className="text-xs font-mono text-zinc-400 hover:text-[#00FF66] uppercase tracking-wider transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#00FF66]" />
            {isLogin ? (
              <span>NEW OPERATOR? <strong className="text-[#00FF66] underline">CREATE ACCESS KEY</strong></span>
            ) : (
              <span>EXISTING OPERATOR? <strong className="text-[#00FF66] underline">SIGN IN</strong></span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
