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
        setMessage(res.message || "Account created. You can now sign in.");
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

  const switchMode = (toLogin) => {
    if (toLogin === isLogin) return;
    playClick();
    setIsLogin(toLogin);
    setError("");
    setMessage("");
  };

  return (
    <div
      className="min-h-screen w-screen bg-[#07080B] flex items-center justify-center p-4 selection:bg-[#00FF66]/20 selection:text-white overflow-y-auto relative"
      id="auth-view"
    >
      {/* Subtle grid texture */}
      <div className="absolute inset-0 bg-tactical-grid opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-noise pointer-events-none" />

      {/* Centered card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* Card shell */}
        <div className="bg-[#0B0D13] border border-white/[0.08] rounded-2xl overflow-hidden relative">
          {/* Specular top line */}
          <div className="specular-highlight" />

          <div className="px-7 pt-8 pb-7 space-y-6">

            {/* Brand header */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.1] flex items-center justify-center text-[#00FF66] shrink-0">
                <PDFScholarLogo className="w-[18px] h-[18px] text-[#00FF66]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white tracking-tight leading-none">
                    PDF Scholar Hub
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#00FF66] bg-[#00FF66]/[0.08] border border-[#00FF66]/20 px-1.5 py-0.5 rounded-full leading-none">
                    <span className="w-1 h-1 rounded-full bg-[#00FF66]" />
                    online
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5 leading-none">
                  Academic document intelligence
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/[0.06]" />

            {/* Mode heading */}
            <div>
              <h1 className="text-lg font-semibold text-white tracking-tight leading-tight">
                {isLogin ? "Welcome back" : "Create an account"}
              </h1>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                {isLogin
                  ? "Sign in to access your indexed library and study sessions."
                  : "Index documents, generate practice quizzes, and retain insights."}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="relative flex p-1 bg-[#07080B] border border-white/[0.07] rounded-xl">
              {/* Sliding pill */}
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 420, damping: 38 }}
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#141720] border border-white/[0.1] rounded-[9px] ${
                  isLogin ? "left-1" : "left-[calc(50%+3px)]"
                }`}
              />
              <button
                type="button"
                onClick={() => switchMode(true)}
                className={`flex-1 relative z-10 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  isLogin ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => switchMode(false)}
                className={`flex-1 relative z-10 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  !isLogin ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                Create account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3" noValidate>

              {/* Feedback banners */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    key="error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.14 }}
                    className="bg-red-500/[0.08] border border-red-500/20 text-red-400 rounded-lg px-3 py-2.5 text-xs leading-relaxed"
                  >
                    {error}
                  </motion.p>
                )}
                {message && (
                  <motion.p
                    key="message"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.14 }}
                    className="bg-[#00FF66]/[0.07] border border-[#00FF66]/20 text-[#00FF66] rounded-lg px-3 py-2.5 text-xs leading-relaxed"
                  >
                    {message}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Username */}
              <div className="space-y-1.5">
                <label
                  className="block text-[11px] font-medium text-zinc-400"
                  htmlFor="auth-username"
                >
                  Username
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600 group-focus-within:text-[#00FF66] transition-colors pointer-events-none">
                    <User className="w-[14px] h-[14px]" />
                  </span>
                  <input
                    id="auth-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    autoComplete="username"
                    className="w-full bg-[#0E1117] border border-white/[0.09] focus:border-[#00FF66]/60 focus:ring-1 focus:ring-[#00FF66]/20 text-white text-xs pl-9 pr-3.5 py-2.5 rounded-lg outline-none placeholder-zinc-600 transition-all font-mono"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="block text-[11px] font-medium text-zinc-400"
                    htmlFor="auth-password"
                  >
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={fillDemoCredentials}
                      className="text-[10px] font-mono text-[#00FF66]/70 hover:text-[#00FF66] transition-colors cursor-pointer"
                      title="Fill demo credentials (scholar / scholar123)"
                    >
                      use demo account
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600 group-focus-within:text-[#00FF66] transition-colors pointer-events-none">
                    <Lock className="w-[14px] h-[14px]" />
                  </span>
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className="w-full bg-[#0E1117] border border-white/[0.09] focus:border-[#00FF66]/60 focus:ring-1 focus:ring-[#00FF66]/20 text-white text-xs pl-9 pr-10 py-2.5 rounded-lg outline-none placeholder-zinc-600 transition-all font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-[14px] h-[14px]" />
                    ) : (
                      <Eye className="w-[14px] h-[14px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm password — register only */}
              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="overflow-hidden space-y-1.5"
                  >
                    <label
                      className="block text-[11px] font-medium text-zinc-400"
                      htmlFor="auth-confirm-password"
                    >
                      Confirm password
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-600 group-focus-within:text-[#00FF66] transition-colors pointer-events-none">
                        <Key className="w-[14px] h-[14px]" />
                      </span>
                      <input
                        id="auth-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        autoComplete="new-password"
                        className="w-full bg-[#0E1117] border border-white/[0.09] focus:border-[#00FF66]/60 focus:ring-1 focus:ring-[#00FF66]/20 text-white text-xs pl-9 pr-10 py-2.5 rounded-lg outline-none placeholder-zinc-600 transition-all font-mono"
                        required={!isLogin}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-[14px] h-[14px]" />
                        ) : (
                          <Eye className="w-[14px] h-[14px]" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full h-10 mt-1 bg-[#00FF66] hover:bg-[#1aff77] disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-black/70" />
                    <span className="text-black/80">
                      {isLogin ? "Signing in…" : "Creating account…"}
                    </span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? "Sign in" : "Create account"}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-black/70" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Demo credentials footer */}
            <div className="border-t border-white/[0.05] pt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="inline-flex items-center gap-2 text-[11px] font-mono text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer group"
              >
                <span>Quick fill demo</span>
                <span className="flex items-center gap-1 text-[10px] bg-white/[0.04] border border-white/[0.08] group-hover:border-white/[0.14] px-1.5 py-0.5 rounded transition-colors">
                  <span className="text-zinc-500">user:</span>
                  <span className="text-zinc-300">scholar</span>
                </span>
              </button>
            </div>

          </div>
        </div>

        {/* Footer stamp */}
        <p className="text-center text-[10px] font-mono text-zinc-700 mt-5">
          PDF Scholar Hub · Academic document intelligence
        </p>
      </motion.div>
    </div>
  );
}
