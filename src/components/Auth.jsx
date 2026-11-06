import React, { useState } from "react";
import { useAppState } from "../lib/state-context";
import {
  Loader2,
  Lock,
  User,
  Key,
  ArrowRight,
  Eye,
  EyeOff,
  BookOpen,
  Layers,
  Database,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Search
} from "lucide-react";
import PDFScholarLogo from "./PDFScholarLogo";
import { motion, AnimatePresence } from "motion/react";
import { playClick } from "../lib/sound-effects";

export default function Auth() {
  const { login, register } = useAppState();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    playClick();
    setLoading(true);
    try {
      if (isLogin) {
        await login(cleanUsername, password);
      } else {
        const res = await register(cleanUsername, password);
        setMessage(res.message || "Account created successfully. Please sign in.");
        setIsLogin(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    playClick();
    setUsername("scholar");
    setPassword("scholar123");
    if (!isLogin) setConfirmPassword("scholar123");
    setError("");
  };

  return (
    <div className="min-h-screen w-screen bg-[#07080B] text-zinc-100 flex flex-col lg:grid lg:grid-cols-12 overflow-y-auto selection:bg-[#00FF66]/20 selection:text-white" id="auth-view">
      
      {/* Left Column: Authentic Product Showcase & Academic Inspector (Hidden on small mobile, 7 cols on lg) */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-8 xl:p-12 border-r border-white/[0.08] relative overflow-hidden bg-noise">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 bg-tactical-grid opacity-50 pointer-events-none" />

        {/* Top: Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#00FF66] shadow-inner">
              <PDFScholarLogo className="w-5 h-5 text-[#00FF66]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-white tracking-tight">PDF Scholar Hub</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20">
                  v2.4
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">Academic document intelligence & study platform</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-white/[0.03] border border-white/[0.06] px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66]" />
            <span>Hybrid search ready</span>
          </div>
        </div>

        {/* Center: Tangible Product Artifact (Real Academic Paper Inspector) */}
        <div className="relative z-10 my-8 max-w-xl w-full">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-[#00FF66]" />
            <span>Live Document Inspector Preview</span>
          </div>

          {/* Inspector Card */}
          <div className="bg-[#0B0D13] border border-white/[0.1] rounded-xl p-5 shadow-2xl relative overflow-hidden space-y-4">
            {/* Top Specular Line */}
            <div className="specular-highlight" />

            {/* Document Header Bar */}
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#00FF66] shrink-0 font-mono text-[10px] font-bold">
                  PDF
                </span>
                <span className="font-medium text-zinc-200 truncate">Attention_Is_All_You_Need.pdf</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 shrink-0 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded">
                Page 3 of 15
              </span>
            </div>

            {/* Simulated Query & Vector Retrieval Pill */}
            <div className="bg-black/40 border border-white/[0.06] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400 font-mono flex items-center gap-1.5">
                  <Search className="w-3 h-3 text-[#00FF66]" />
                  <span>User query: "How does multi-head attention work?"</span>
                </span>
                <span className="text-[10px] font-mono text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/20 px-1.5 py-0.5 rounded">
                  Match: 99.8%
                </span>
              </div>

              {/* Excerpt Highlight */}
              <div className="text-xs text-zinc-300 font-sans leading-relaxed border-l-2 border-[#00FF66] pl-2.5 py-0.5 bg-[#00FF66]/[0.03]">
                "...Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this..."
              </div>
            </div>

            {/* Grounded AI Answer Sample */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400">
                <span className="flex items-center gap-1 text-[#00FF66]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Grounded Citation [Source 1]</span>
                </span>
                <span>Retrieval: 1ms // Hybrid Vector + BM25</span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Multi-head attention computes attention in parallel across multiple linear projections of queries, keys, and values, enabling the model to capture diverse contextual relationships without averaging loss.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Three Pillar Highlights */}
        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-6">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-white">
              <Layers className="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Page-Aware</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Attributions map directly to exact page numbers for instant auditability.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-white">
              <Database className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Hybrid Search</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Combines dense 768-D vector embeddings with sparse BM25 lexical ranking.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-white">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFB800]" />
              <span>Diagnostic Quiz</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Self-grading multiple choice & short-answer quizzes with retention metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column: Clean, Modern Auth Form (5 cols on lg, full on mobile) */}
      <div className="flex-1 lg:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 relative bg-[#08090C]">
        
        {/* Mobile Header Branding (Visible only on small screens) */}
        <div className="lg:hidden w-full max-w-sm mb-6 text-center flex flex-col items-center">
          <div className="w-11 h-11 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#00FF66] mb-2.5">
            <PDFScholarLogo className="w-5 h-5 text-[#00FF66]" />
          </div>
          <h1 className="text-lg font-semibold text-white tracking-tight">PDF Scholar Hub</h1>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">Academic document intelligence</p>
        </div>

        <div className="w-full max-w-sm space-y-6">
          
          {/* Segmented Tab Switcher */}
          <div className="p-1 bg-[#0E1117] border border-white/[0.08] rounded-xl flex items-center relative">
            <button
              type="button"
              onClick={() => {
                playClick();
                setIsLogin(true);
                setError("");
                setMessage("");
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors relative z-10 cursor-pointer ${
                isLogin ? "text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                playClick();
                setIsLogin(false);
                setError("");
                setMessage("");
              }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors relative z-10 cursor-pointer ${
                !isLogin ? "text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Create Account
            </button>

            {/* Sliding Pill Indicator */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/[0.08] border border-white/10 rounded-lg shadow-sm ${
                isLogin ? "left-1" : "left-[calc(50%+2px)]"
              }`}
            />
          </div>

          {/* Form Context Header */}
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">
              {isLogin ? "Welcome back" : "Create your scholar account"}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {isLogin
                ? "Sign in to access your indexed library and study sessions"
                : "Index documents, generate practice quizzes, and retain insights"}
            </p>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Feedback Banners */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-xs leading-relaxed"
                >
                  {error}
                </motion.div>
              )}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="bg-[#00FF66]/10 border border-[#00FF66]/20 text-[#00FF66] rounded-lg p-3 text-xs leading-relaxed"
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Username Input */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5" htmlFor="auth-username">
                Username
              </label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-[#00FF66] transition-colors pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full bg-[#0E1117] border border-white/10 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 text-white text-xs px-3.5 py-2.5 pl-10 rounded-lg outline-none placeholder-zinc-500 transition-colors font-mono"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-300" htmlFor="auth-password">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="text-[11px] font-mono text-[#00FF66] hover:underline cursor-pointer"
                    title="Fill demo credentials (scholar / scholar123)"
                  >
                    Use demo account
                  </button>
                )}
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-[#00FF66] transition-colors pointer-events-none">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full bg-[#0E1117] border border-white/10 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 text-white text-xs px-3.5 py-2.5 pl-10 pr-10 rounded-lg outline-none placeholder-zinc-500 transition-colors font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Registration Only) */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="block text-xs font-medium text-zinc-300" htmlFor="auth-confirm-password">
                    Confirm password
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-[#00FF66] transition-colors pointer-events-none">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className="w-full bg-[#0E1117] border border-white/10 focus:border-[#00FF66] focus:ring-1 focus:ring-[#00FF66]/30 text-white text-xs px-3.5 py-2.5 pl-10 pr-10 rounded-lg outline-none placeholder-zinc-500 transition-colors font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      title={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 bg-[#00FF66] hover:bg-[#1aff75] disabled:opacity-50 text-black font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign in" : "Create account"}</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </motion.button>
          </form>

          {/* Quick Demo Assist */}
          <div className="pt-2 border-t border-white/[0.06] text-center">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <span>Quick fill demo credentials</span>
              <kbd className="text-[10px] bg-white/[0.04] border border-white/10 px-1.5 py-0.5 rounded text-zinc-400">scholar</kbd>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
