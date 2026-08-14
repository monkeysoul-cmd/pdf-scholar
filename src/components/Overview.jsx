import React, { useState, useEffect } from "react";
import { useAppState } from "../lib/state-context";
import {
  BookOpen,
  FileText,
  Database,
  Calculator,
  Trophy,
  BrainCircuit,
  Award,
  ChevronRight,
  TrendingUp,
  Target,
  CheckCircle2,
  X,
  Plus
} from "lucide-react";
import VectorAIIcon from "./VectorAIIcon";
import { motion, AnimatePresence } from "motion/react";

export default function Overview() {
  const { documents, setTab } = useAppState();
  const [activeModal, setActiveModal] = useState(null);
  
  const [animatedStats, setAnimatedStats] = useState({
    docs: 0,
    pages: 0,
    chunks: 0,
    scores: 0
  });

  const totalDocuments = documents.length;
  const totalPages = documents.reduce((acc, doc) => acc + (doc.pageCount || 0), 0);
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunkCount || 0), 0);

  const allScores = documents.flatMap(d => d.quizHistory || []);
  const averageScore = allScores.length > 0 
    ? Math.round(allScores.reduce((acc, s) => acc + s.scorePercent, 0) / allScores.length)
    : 0;
  
  const quizzesTaken = allScores.length;

  useEffect(() => {
    const duration = 1000; 
    const steps = 30;
    const interval = duration / steps;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      
      setAnimatedStats({
        docs: Math.round(totalDocuments * easeOutQuad),
        pages: Math.round(totalPages * easeOutQuad),
        chunks: Math.round(totalChunks * easeOutQuad),
        scores: Math.round(averageScore * easeOutQuad)
      });
      
      if (currentStep >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [totalDocuments, totalPages, totalChunks, averageScore]);

  const getScoreGrade = (percent) => {
    if (percent >= 90) return { label: "S Rank", color: "text-[#00FF66]", border: "border-[#00FF66]/30", bg: "bg-[#00FF66]/10", shadow: "shadow-[0_0_15px_rgba(0,255,102,0.2)]" };
    if (percent >= 80) return { label: "A Rank", color: "text-emerald-400", border: "border-emerald-400/30", bg: "bg-emerald-400/10", shadow: "shadow-[0_0_15px_rgba(52,211,153,0.2)]" };
    if (percent >= 70) return { label: "B Rank", color: "text-yellow-400", border: "border-yellow-400/30", bg: "bg-yellow-400/10", shadow: "shadow-[0_0_15px_rgba(250,204,21,0.2)]" };
    if (percent >= 60) return { label: "C Rank", color: "text-orange-400", border: "border-orange-400/30", bg: "bg-orange-400/10", shadow: "shadow-[0_0_15px_rgba(251,146,60,0.2)]" };
    return { label: "F Rank", color: "text-red-400", border: "border-red-400/30", bg: "bg-red-400/10", shadow: "shadow-[0_0_15px_rgba(248,113,113,0.2)]" };
  };

  const getScoreBadge = (percent) => {
    if (percent >= 90) return { label: "Excellent", color: "text-[#00FF66]", bg: "bg-[#00FF66]/10", border: "border-[#00FF66]/20" };
    if (percent >= 70) return { label: "Good", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" };
    return { label: "Needs Review", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" };
  };

  const overallGrade = getScoreGrade(averageScore);

  const primaryStats = [
    {
      id: "docs",
      label: "Indexed Documents",
      value: animatedStats.docs,
      icon: BookOpen,
      subtitle: "Total PDFs uploaded",
      badge: "+2 this week",
      color: "from-[#00FF66]/40",
      accent: "bg-[#00FF66]",
      glow: "group-hover:shadow-[0_0_30px_rgba(0,255,102,0.15)]",
      iconColor: "text-[#00FF66]"
    },
    {
      id: "pages",
      label: "Pages Processed",
      value: animatedStats.pages,
      icon: FileText,
      subtitle: "Extracted for analysis",
      badge: "High Volume",
      color: "from-emerald-500/40",
      accent: "bg-emerald-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
      iconColor: "text-emerald-400"
    },
    {
      id: "chunks",
      label: "Vector Chunks",
      value: animatedStats.chunks,
      icon: Database,
      subtitle: "Semantic DB entries",
      badge: "Ready for RAG",
      color: "from-purple-500/40",
      accent: "bg-purple-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
      iconColor: "text-purple-400"
    }
  ];

  const secondaryStats = [
    {
      id: "average",
      label: "Average Quiz Score",
      value: `${animatedStats.scores}%`,
      icon: TrendingUp,
      subtitle: "Across all subjects",
      badge: "Analytics",
      isGrade: true,
      color: "from-amber-500/40",
      accent: "bg-amber-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
      iconColor: "text-amber-400"
    },
    {
      id: "quizzes",
      label: "Quizzes Completed",
      value: quizzesTaken,
      icon: Target,
      subtitle: "Total practice runs",
      badge: "Milestone",
      color: "from-emerald-400/40",
      accent: "bg-emerald-400",
      glow: "group-hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]",
      iconColor: "text-emerald-400"
    },
    {
      id: "points",
      label: "Total Knowledge Points",
      value: allScores.reduce((acc, s) => acc + (s.earnedPoints || 0), 0),
      icon: Trophy,
      subtitle: "Lifetime earned",
      badge: "Ranked",
      color: "from-rose-500/40",
      accent: "bg-rose-500",
      glow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]",
      iconColor: "text-rose-400"
    }
  ];

  // Flatten and sort recent quizzes
  const quizScores = documents
    .filter(doc => doc.quizHistory && doc.quizHistory.length > 0)
    .flatMap(doc => doc.quizHistory.map(history => ({
      ...history,
      docName: doc.name
    })))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6); // show latest 6

  const renderModalContent = (id) => {
    switch (id) {
      case "docs":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#00FF66]" /> Document Breakdown
            </h3>
            <p className="text-xs text-zinc-400 font-mono mb-4">You have {totalDocuments} indexed documents.</p>
            <div className="grid grid-cols-1 gap-3">
              {documents.map((doc, idx) => (
                <div key={idx} className="bg-zinc-900/50 p-3 rounded-sm border border-zinc-800 flex justify-between items-center hover:border-zinc-700 transition-colors">
                  <div className="font-mono text-xs text-white truncate pr-4">{doc.name}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{new Date(doc.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
              {documents.length === 0 && <div className="text-zinc-500 text-xs italic">No documents uploaded yet.</div>}
            </div>
          </div>
        );
      case "pages":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase text-white mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" /> Pages Analysis
            </h3>
            <div className="flex-1 flex items-end gap-1 md:gap-2 justify-between">
              {[60, 80, 40, 90, 70, 50, 85].map((val, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${val}%` }}
                  transition={{ delay: i * 0.05 + 0.5, type: "spring" }}
                  className="w-full max-w-[40px] bg-white/5 rounded-t-sm relative group overflow-hidden"
                >
                  <div 
                    className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-900/50 to-emerald-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity" 
                    style={{ height: `${val}%` }} 
                  />
                </motion.div>
              ))}
            </div>
          </div>
        );
      case "chunks":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase text-white mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" /> Vector Density Map
            </h3>
            <div className="grid grid-cols-6 gap-1 p-2 bg-zinc-900/50 rounded-sm border border-zinc-800">
              {/* Dummy heatmap */}
              {Array.from({length: 24}).map((_, i) => {
                const intensity = Math.random();
                return (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    key={i} 
                    className="h-10 rounded-sm"
                    style={{ backgroundColor: `rgba(251, 191, 36, ${intensity * 0.8 + 0.1})` }}
                  ></motion.div>
                )
              })}
            </div>
            <p className="text-xs text-zinc-400 font-mono text-center mt-4 uppercase">Semantic Clustering Heatmap</p>
          </div>
        );
      case "average":
      case "quizzes":
      case "points":
        return (
          <div className="space-y-4 text-center py-8">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-pulse-glow" />
            <h3 className="text-xl font-black uppercase text-white">Performance Metrics</h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              You have completed {quizzesTaken} quizzes with an average score of {averageScore}%.
              Keep practicing to improve your Vector RAG knowledge extraction!
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="flex-1 pt-16 md:pt-8 px-4 sm:px-6 md:px-12 pb-8 md:pb-12 overflow-y-auto min-h-0 flex flex-col bg-dot-grid text-white select-none relative z-0"
      id="overview-view"
    >
      {/* Ambient background glows for the dashboard */}
      <div className="ambient-glow ambient-glow-green w-[500px] h-[500px] top-[-100px] right-[-100px] animate-pulse-glow" />
      <div className="ambient-glow ambient-glow-purple w-[300px] h-[300px] bottom-[20%] left-[-50px] opacity-10" />

      {/* Upper Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6 mb-8 relative z-10"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400">
              <span className="text-[#00FF66] font-bold">PDF</span> Scholar Engine
            </span>
            <span className="bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 text-[9px] font-black px-2.5 py-0.5 rounded-sm uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-none bg-[#00FF66] animate-pulse" />
              Vector AI Ready
            </span>
          </div>
          <h2 className="text-xs font-mono tracking-wider uppercase text-zinc-400">Study Hub Dashboard</h2>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTab("upload")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00FF66] to-[#00e55b] hover:from-[#00e55b] hover:to-[#00cc55] text-black text-xs font-extrabold uppercase tracking-wider rounded-sm transition-all shadow-[0_0_15px_rgba(0,255,102,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Upload PDF</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Heading */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 relative z-10"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none uppercase text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          Study Hub <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 via-zinc-400 to-zinc-600">
            Dashboard
          </span>
        </h1>
      </motion.section>

      {/* Grid of Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 sm:space-y-5 mb-10 relative z-10"
      >
        {/* Row 1: Primary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {primaryStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={`primary-${stat.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setActiveModal(stat.id)}
                className={`glass-card p-6 md:p-8 rounded-2xl relative group overflow-hidden shadow-xl transition-all hover:scale-[1.02] hover:border-dotted hover:border-[#00FF66] cursor-pointer ${stat.glow}`}
              >
                {/* Colored Top Accent Bar */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} to-transparent`} />
                
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                    {stat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {stat.badge && (
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider border ${stat.iconColor.replace('text-', 'text-').replace('text-', 'bg-').replace('text-', 'border-').replace('400', '400/10').replace('400', '400/20')} bg-white/5 border-white/10 text-zinc-300`}>
                        {stat.badge}
                      </span>
                    )}
                    <div className={`w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center ${stat.iconColor} group-hover:bg-white/10 transition-colors shadow-inner`}>
                      <Icon className="w-4 h-4 drop-shadow-[0_0_8px_currentColor]" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white leading-none drop-shadow-md">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-wider flex items-center justify-between">
                    <span>{stat.subtitle}</span>
                    <span className={`${stat.iconColor} font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5`}>
                      View Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Row 2: Secondary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {secondaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={`secondary-${stat.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setActiveModal(stat.id)}
                className={`glass-card p-6 md:p-8 rounded-2xl relative group overflow-hidden shadow-xl transition-all hover:scale-[1.02] hover:border-dotted hover:border-[#00FF66] cursor-pointer ${stat.glow}`}
              >
                {/* Colored Top Accent Bar */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} to-transparent`} />
                
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                    {stat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {stat.badge && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider border bg-white/5 border-white/10 text-zinc-300">
                        {stat.badge}
                      </span>
                    )}
                    <div className={`w-8 h-8 rounded-md bg-white/5 border border-white/10 flex items-center justify-center ${stat.iconColor} group-hover:bg-white/10 transition-colors shadow-inner`}>
                      <Icon className="w-4 h-4 drop-shadow-[0_0_8px_currentColor]" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  {stat.isGrade ? (
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-lg md:text-xl font-black uppercase tracking-wide border ${overallGrade.bg} ${overallGrade.border} ${overallGrade.color} ${overallGrade.shadow}`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse drop-shadow-[0_0_5px_currentColor]" />
                        {stat.value}
                      </span>
                    </div>
                  ) : (
                    <div className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none drop-shadow-md">
                      {stat.value}
                    </div>
                  )}
                  <div className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-wider flex items-center justify-between">
                    <span>{stat.subtitle}</span>
                    <span className={`${stat.iconColor} font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5`}>
                      View Data <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Analytics Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 relative z-10 flex-1 flex flex-col min-h-0"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <Calculator className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-200">Recent Quiz Analytics</h2>
        </div>

        {quizScores.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {quizScores.map((item) => {
              const badge = getScoreBadge(item.scorePercent);
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className={`glass-card bg-noise rounded-lg p-5 flex flex-col justify-between border-l-2 ${badge.border.replace('border-', 'border-l-')}`}
                >
                  <div className="flex items-start justify-between mb-3 relative z-10">
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-black uppercase text-white truncate drop-shadow-sm mb-1" title={item.docName}>
                        {item.docName}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400">
                        {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-wider border ${badge.bg} ${badge.border} ${badge.color}`}>
                      {badge.label}
                    </div>
                  </div>
                  
                  <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Score</span>
                      <span className={`text-xl font-black ${badge.color} drop-shadow-[0_0_8px_currentColor]`}>{item.scorePercent}%</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Points Earned</span>
                      <span className="text-sm font-bold text-white font-mono bg-white/5 px-2 py-0.5 rounded-sm border border-white/10">
                        {item.earnedPoints} / {item.totalPoints}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card bg-noise rounded-lg p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="font-extrabold text-white text-base uppercase tracking-wider mb-2">No Quiz Data Yet</h3>
            <p className="text-xs text-zinc-400 font-mono max-w-sm leading-relaxed mb-6">
              Generate a practice quiz from any indexed document to start tracking your knowledge retention scores.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab("quiz")}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-sm"
            >
              Start First Quiz
            </motion.button>
          </div>
        )}
      </motion.section>

      {/* Stepper Process Footer */}
      <section className="mt-auto border-t border-white/5 pt-6 relative z-10 pb-2">
        <div className="stepper grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="step relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-zinc-700 to-zinc-800" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00FF66] to-[#00FF66]/20 shadow-[0_0_8px_rgba(0,255,102,0.5)]" />
            <div className="pt-3">
              <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(0,255,102,0.3)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" />
                1. Upload PDF
              </div>
            </div>
          </div>
          <div className="step relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-zinc-700 to-zinc-800" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00FF66] to-[#00FF66]/20 shadow-[0_0_8px_rgba(0,255,102,0.5)]" />
            <div className="pt-3">
              <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(0,255,102,0.3)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" />
                2. Chunking
              </div>
            </div>
          </div>
          <div className="step relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-zinc-700 to-zinc-800" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00FF66] to-[#00FF66]/20 shadow-[0_0_8px_rgba(0,255,102,0.5)]" />
            <div className="pt-3">
              <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(0,255,102,0.3)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" />
                3. Vector Embedding
              </div>
            </div>
          </div>
          <div className="step relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-zinc-700 to-zinc-800" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00FF66] animate-pulse-glow" />
            <div className="pt-3">
              <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(0,255,102,0.5)]">
                <BrainCircuit className="w-3.5 h-3.5 text-[#00FF66]" />
                4. Ready to Study
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Modal using glass card */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card bg-noise rounded-t-xl sm:rounded-xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto p-5 sm:p-8 relative text-white flex flex-col gap-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white rounded-full transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>
              
              {renderModalContent(activeModal)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
