import React, { useState } from "react";
import { useAppState } from "../lib/state-context";
import { Loader2, Lock, User, Key, ArrowRight } from "lucide-react";
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

  return (
    <div className="min-h-screen w-screen overflow-y-auto bg-[#07080B] flex flex-col items-center justify-center p-4 md:p-8 select-text-content relative" id="auth-view">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[400px] w-full bg-[#0B0D13] border border-white/[0.08] rounded-xl p-7 sm:p-8 relative z-10 my-auto shadow-xl"
      >
        {/* Brand Identity */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#00FF66] mb-3">
            <PDFScholarLogo className="w-6 h-6 text-[#00FF66]" />
          </div>

          <h1 className="text-xl font-semibold text-white tracking-tight">
            PDF Scholar Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Academic research and study assistant
          </p>
        </div>

        {/* Form Container */}
        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? "login" : "signup"}
            initial={{ opacity: 0, x: isLogin ? -4 : 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 4 : -4 }}
            transition={{ duration: 0.15 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Error Notification */}
            {error && (
              <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg p-3 text-xs leading-relaxed text-center">
                {error}
              </div>
            )}

            {/* Success Notification */}
            {message && (
              <div className="bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 rounded-lg p-3 text-xs leading-relaxed text-center">
                {message}
              </div>
            )}

            {/* Form Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
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
                    placeholder="Enter your username"
                    className="w-full bg-black/40 border border-white/10 focus:border-[#00FF66]/60 text-white text-xs sm:text-sm px-4 py-2.5 pl-10 rounded-lg outline-none placeholder-zinc-600 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
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
                    placeholder="Enter your password"
                    className="w-full bg-black/40 border border-white/10 focus:border-[#00FF66]/60 text-white text-xs sm:text-sm px-4 py-2.5 pl-10 rounded-lg outline-none placeholder-zinc-600 transition-colors"
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
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Confirm password
                    </label>
                    <div className="relative group">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 group-focus-within:text-[#00FF66] transition-colors">
                        <Key className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="w-full bg-black/40 border border-white/10 focus:border-[#00FF66]/60 text-white text-xs sm:text-sm px-4 py-2.5 pl-10 rounded-lg outline-none placeholder-zinc-600 transition-colors"
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00FF66] hover:bg-[#1aff75] disabled:opacity-50 text-black text-xs font-semibold rounded-lg transition-colors mt-5 cursor-pointer"
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
            </button>
          </motion.form>
        </AnimatePresence>

        {/* Toggle Mode Footer */}
        <div className="mt-6 text-center border-t border-white/[0.08] pt-4">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
            }}
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            {isLogin ? (
              <span>
                Don't have an account? <strong className="text-[#00FF66] font-medium hover:underline">Create one</strong>
              </span>
            ) : (
              <span>
                Already have an account? <strong className="text-[#00FF66] font-medium hover:underline">Sign in</strong>
              </span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
