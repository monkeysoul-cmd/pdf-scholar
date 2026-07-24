import React, { useState } from "react";
import { useAppState } from "../lib/state-context";
import { GraduationCap, Loader2, Lock, User, Key, ArrowRight } from "lucide-react";

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
      setError("Please fill in all fields.");
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
        setMessage(res.message || "Registration successful! Please login.");
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
    <div className="h-screen w-screen overflow-y-auto bg-[#0A0A0A] flex flex-col items-center justify-center py-8 px-6 select-none" id="auth-view">
      <div className="max-w-md w-full bg-[#111] border border-[#222] rounded-xs p-8 md:p-10 shadow-2xl relative overflow-hidden my-auto">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00FF66]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#00FF66]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#0A0A0A] border border-[#222] text-[#00FF66] rounded-xs flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-9 h-9" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase text-white leading-none">
            PDF Scholar <span className="text-[#00FF66]">Hub</span>
          </h1>
          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-2.5">
            Your Private Academic Discussion Partner
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-950/20 text-red-500 border border-red-900/30 rounded-xs p-3.5 text-xs font-mono uppercase text-center leading-relaxed">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 rounded-xs p-3.5 text-xs font-mono uppercase text-center leading-relaxed">
              {message}
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 font-mono uppercase tracking-wider block">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-600">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. ayush_bhati"
                className="w-full bg-black border border-[#222] focus:border-[#00FF66] hover:border-[#333] text-white text-xs px-4 py-3 pl-11 rounded-xs transition-colors outline-none placeholder-zinc-700"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 font-mono uppercase tracking-wider block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-600">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black border border-[#222] focus:border-[#00FF66] hover:border-[#333] text-white text-xs px-4 py-3 pl-11 rounded-xs transition-colors outline-none placeholder-zinc-700"
                required
              />
            </div>
          </div>

          {/* Confirm Password (only for registration) */}
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 font-mono uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-600">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black border border-[#222] focus:border-[#00FF66] hover:border-[#333] text-white text-xs px-4 py-3 pl-11 rounded-xs transition-colors outline-none placeholder-zinc-700"
                  required
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-[#00FF66] hover:bg-[#00e55b] disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-black uppercase tracking-wider rounded-xs transition-all duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 text-black animate-spin" />
                <span>{isLogin ? "Signing In..." : "Signing Up..."}</span>
              </>
            ) : (
              <>
                <span>{isLogin ? "Sign In" : "Register Now"}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        {/* Toggle link */}
        <div className="mt-8 text-center border-t border-[#222] pt-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
            }}
            className="text-[10px] font-black text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
