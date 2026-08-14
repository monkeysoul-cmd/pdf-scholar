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
  Plus,
  Activity,
  BarChart3,
  Sparkles,
  Zap,
  Clock,
  Layers
} from "lucide-react";
import VectorAIIcon from "./VectorAIIcon";
import { motion, AnimatePresence } from "motion/react";

export default function Overview() {
  const { documents = [], quizScores = [], setTab } = useAppState();
  const [activeModal, setActiveModal] = useState(null);
  const [selectedHeatmapCell, setSelectedHeatmapCell] = useState(null);
  
  const totalDocuments = documents.length;
  const totalPages = documents.reduce((acc, doc) => acc + (doc.pageCount || 0), 0);
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunkCount || 0), 0);

  // Combine state quiz scores and document quiz histories
  const allQuizRecords = [
    ...(quizScores || []),
    ...documents.flatMap(d => (d.quizHistory || []).map(qh => ({
      ...qh,
      documentName: d.name,
      docName: d.name
    })))
  ];

  // Deduplicate by ID / timestamp
  const uniqueQuizzes = Array.from(
    new Map(allQuizRecords.map(item => [item.id || item.timestamp || JSON.stringify(item), item])).values()
  ).sort((a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0));

  const quizzesTaken = uniqueQuizzes.length;
  const averageScore = quizzesTaken > 0
    ? Math.round(uniqueQuizzes.reduce((acc, s) => acc + (Number(s.scorePercent) || 0), 0) / quizzesTaken)
    : 0;
  const totalPointsEarned = uniqueQuizzes.reduce((acc, s) => acc + (Number(s.earnedPoints) || 0), 0);

  const [animatedStats, setAnimatedStats] = useState({
    docs: totalDocuments,
    pages: totalPages,
    chunks: totalChunks,
    scores: averageScore,
    quizzes: quizzesTaken,
    points: totalPointsEarned
  });

  useEffect(() => {
    const duration = 800; 
    const steps = 24;
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
        scores: Math.round(averageScore * easeOutQuad),
        quizzes: Math.round(quizzesTaken * easeOutQuad),
        points: Math.round(totalPointsEarned * easeOutQuad)
      });
      
      if (currentStep >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [totalDocuments, totalPages, totalChunks, averageScore, quizzesTaken, totalPointsEarned]);

  const getScoreGrade = (percent) => {
    if (percent >= 90) return { label: "S Rank", color: "text-[#00FF66]", border: "border-[#00FF66]/40", bg: "bg-[#00FF66]/10", shadow: "shadow-[0_0_15px_rgba(0,255,102,0.3)]" };
    if (percent >= 80) return { label: "A Rank", color: "text-[#00E5FF]", border: "border-[#00E5FF]/40", bg: "bg-[#00E5FF]/10", shadow: "shadow-[0_0_15px_rgba(0,229,255,0.25)]" };
    if (percent >= 70) return { label: "B Rank", color: "text-[#FFB800]", border: "border-[#FFB800]/40", bg: "bg-[#FFB800]/10", shadow: "shadow-[0_0_15px_rgba(255,184,0,0.25)]" };
    if (percent >= 60) return { label: "C Rank", color: "text-amber-500", border: "border-amber-500/40", bg: "bg-amber-500/10", shadow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]" };
    return { label: "Needs Practice", color: "text-rose-400", border: "border-rose-400/40", bg: "bg-rose-400/10", shadow: "shadow-[0_0_15px_rgba(244,63,94,0.2)]" };
  };

  const getScoreBadge = (percent) => {
    if (percent >= 90) return { label: "Mastery", color: "text-[#00FF66]", bg: "bg-[#00FF66]/10", border: "border-[#00FF66]/30" };
    if (percent >= 70) return { label: "Proficient", color: "text-[#00E5FF]", bg: "bg-[#00E5FF]/10", border: "border-[#00E5FF]/30" };
    return { label: "Review", color: "text-[#FFB800]", bg: "bg-[#FFB800]/10", border: "border-[#FFB800]/30" };
  };

  const overallGrade = getScoreGrade(averageScore);

  const primaryStats = [
    {
      id: "docs",
      label: "Indexed Documents",
      value: animatedStats.docs,
      icon: BookOpen,
      subtitle: "Total PDFs uploaded",
      badge: `${totalDocuments} Active`,
      color: "from-[#00FF66]/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(0,255,102,0.2)]",
      iconColor: "text-[#00FF66]"
    },
    {
      id: "pages",
      label: "Pages Processed",
      value: animatedStats.pages,
      icon: FileText,
      subtitle: "Extracted for analysis",
      badge: "Deep Parsed",
      color: "from-[#00E5FF]/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(0,229,255,0.2)]",
      iconColor: "text-[#00E5FF]"
    },
    {
      id: "chunks",
      label: "Vector Chunks",
      value: animatedStats.chunks,
      icon: Database,
      subtitle: "Semantic embeddings",
      badge: "RAG Indexed",
      color: "from-[#FFB800]/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(255,184,0,0.2)]",
      iconColor: "text-[#FFB800]"
    }
  ];

  const secondaryStats = [
    {
      id: "average",
      label: "Average Quiz Score",
      value: `${animatedStats.scores}%`,
      icon: TrendingUp,
      subtitle: "Retention diagnostic rate",
      badge: overallGrade.label,
      isGrade: true,
      color: "from-[#00FF66]/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(0,255,102,0.2)]",
      iconColor: "text-[#00FF66]"
    },
    {
      id: "quizzes",
      label: "Quizzes Completed",
      value: animatedStats.quizzes,
      icon: Target,
      subtitle: "Practice test sessions",
      badge: quizzesTaken > 0 ? `${quizzesTaken} Runs` : "Ready",
      color: "from-[#00E5FF]/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(0,229,255,0.2)]",
      iconColor: "text-[#00E5FF]"
    },
    {
      id: "points",
      label: "Knowledge Points",
      value: animatedStats.points,
      icon: Trophy,
      subtitle: "Lifetime earned points",
      badge: "Scored",
      color: "from-[#FFB800]/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(255,184,0,0.2)]",
      iconColor: "text-[#FFB800]"
    }
  ];

  // Distribution calculations for chart
  const pageBars = [
    { day: "Mon", pages: Math.max(1, Math.round(totalPages * 0.15)), height: 45 },
    { day: "Tue", pages: Math.max(2, Math.round(totalPages * 0.25)), height: 75 },
    { day: "Wed", pages: Math.max(1, Math.round(totalPages * 0.18)), height: 55 },
    { day: "Thu", pages: Math.max(3, Math.round(totalPages * 0.35)), height: 90 },
    { day: "Fri", pages: Math.max(2, Math.round(totalPages * 0.22)), height: 65 },
    { day: "Sat", pages: Math.max(3, Math.round(totalPages * 0.30)), height: 85 },
    { day: "Sun", pages: Math.max(1, Math.round(totalPages * 0.12)), height: 40 },
  ];

  const renderModalContent = (id) => {
    switch (id) {
      case "docs":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#00FF66]" /> Document Breakdown
            </h3>
            <p className="text-xs text-zinc-400 font-mono mb-4">You have {totalDocuments} active indexed document(s).</p>
            <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-1">
              {documents.map((doc, idx) => (
                <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center hover:border-[#00FF66]/40 transition-colors">
                  <div className="min-w-0 pr-4">
                    <div className="font-bold text-xs text-white truncate">{doc.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{doc.pageCount || 1} Pages • {doc.chunkCount || 0} Chunks</div>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">{new Date(doc.createdAt || Date.now()).toLocaleDateString()}</div>
                </div>
              ))}
              {documents.length === 0 && <div className="text-zinc-500 text-xs italic py-4 text-center">No documents uploaded yet.</div>}
            </div>
          </div>
        );
      case "pages":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase text-white mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#00E5FF]" /> Pages Ingestion Throughput
            </h3>
            <p className="text-xs text-zinc-400 font-mono">Total {totalPages} page(s) processed and analyzed into vector embeddings.</p>
            <div className="h-44 w-full bg-black/40 border border-white/5 rounded-xl flex items-end justify-around p-4 gap-2">
              {pageBars.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div 
                    className="w-full max-w-[28px] bg-gradient-to-t from-[#00E5FF]/40 to-[#00E5FF] rounded-t-sm shadow-[0_0_10px_rgba(0,229,255,0.3)] transition-all"
                    style={{ height: `${item.height}%` }}
                  />
                  <span className="text-[9px] font-mono text-zinc-400 font-bold">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case "chunks":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase text-white mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#FFB800]" /> Vector Density Matrix
            </h3>
            <p className="text-xs text-zinc-400 font-mono">Semantic distribution across {totalChunks} document chunks.</p>
            <div className="grid grid-cols-6 gap-2 p-3 bg-black/40 rounded-xl border border-white/5">
              {Array.from({ length: 24 }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-10 rounded-lg flex items-center justify-center font-mono text-[9px] font-bold border border-[#00FF66]/20 bg-[#00FF66]/10 text-white"
                >
                  V{i + 1}
                </div>
              ))}
            </div>
          </div>
        );
      case "average":
      case "quizzes":
      case "points":
        return (
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] rounded-full flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(0,255,102,0.3)]">
              <Trophy className="w-8 h-8 drop-shadow-md" />
            </div>
            <h3 className="text-xl font-black uppercase text-white tracking-tight">Performance Summary</h3>
            <p className="text-xs text-zinc-300 max-w-md mx-auto font-mono leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5">
              You have completed <strong className="text-[#00FF66] font-bold">{quizzesTaken}</strong> quiz session(s) with an overall score average of <strong className="text-[#00FF66] font-bold">{averageScore}%</strong> and <strong className="text-[#FFB800] font-bold">{totalPointsEarned}</strong> points earned!
            </p>
            <div className="pt-2">
              <button
                onClick={() => { setActiveModal(null); setTab("quiz"); }}
                className="px-6 py-3 bg-gradient-to-r from-[#00FF66] to-[#00E55B] hover:from-[#00E55B] hover:to-[#00CC55] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(0,255,102,0.35)] cursor-pointer"
              >
                Launch Diagnostic Quiz
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="flex-1 pt-14 md:pt-6 px-4 sm:px-6 md:px-10 pb-12 overflow-y-auto min-h-0 flex flex-col bg-dot-grid text-white select-none relative z-0"
      id="overview-view"
    >
      {/* Dynamic Cyber Ambient Glows */}
      <div className="ambient-glow ambient-glow-green w-[550px] h-[550px] top-[-100px] right-[-100px] animate-pulse-glow" />
      <div className="ambient-glow ambient-glow-cyan w-[400px] h-[400px] bottom-[20%] left-[-80px] opacity-15" />

      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6 mb-8 relative z-10"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2.5 drop-shadow-md">
              <span className="text-[#00FF66] drop-shadow-[0_0_12px_rgba(0,255,102,0.4)]">PDF</span> Scholar Hub
            </h1>
            <span className="bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,255,102,0.2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
              Vector Engine Active
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono uppercase mt-1">
            Real-time Knowledge Base Analytics & Diagnostic Learning Center
          </p>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTab("upload")}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00FF66] to-[#00E55B] hover:from-[#00E55B] hover:to-[#00CC55] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,102,0.35)] cursor-pointer"
            id="overview-upload-cta"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Upload New PDF</span>
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Tiles (Primary & Secondary 6-Grid) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 mb-8 relative z-10"
      >
        {/* Row 1: Primary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {primaryStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={() => setActiveModal(stat.id)}
                className={`glass-card p-5 sm:p-6 rounded-2xl relative group overflow-hidden shadow-xl transition-all hover:scale-[1.01] hover:border-dotted hover:border-[#00FF66] cursor-pointer ${stat.glow}`}
              >
                {/* Accent Top Bar */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} to-transparent`} />
                
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                    {stat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {stat.badge && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-300">
                        {stat.badge}
                      </span>
                    )}
                    <div className={`w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.iconColor} group-hover:bg-white/10 transition-colors shadow-inner`}>
                      <Icon className="w-4 h-4 drop-shadow-[0_0_8px_currentColor]" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none drop-shadow-md">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-2 uppercase tracking-wider flex items-center justify-between">
                    <span>{stat.subtitle}</span>
                    <span className={`${stat.iconColor} font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5`}>
                      Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Row 2: Secondary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {secondaryStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={`secondary-${stat.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 3) * 0.08 }}
                onClick={() => setActiveModal(stat.id)}
                className={`glass-card p-5 sm:p-6 rounded-2xl relative group overflow-hidden shadow-xl transition-all hover:scale-[1.01] hover:border-dotted hover:border-[#00FF66] cursor-pointer ${stat.glow}`}
              >
                {/* Accent Top Bar */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} to-transparent`} />
                
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                    {stat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {stat.badge && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-300">
                        {stat.badge}
                      </span>
                    )}
                    <div className={`w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.iconColor} group-hover:bg-white/10 transition-colors shadow-inner`}>
                      <Icon className="w-4 h-4 drop-shadow-[0_0_8px_currentColor]" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  {stat.isGrade ? (
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-lg md:text-xl font-black uppercase tracking-wide border ${overallGrade.bg} ${overallGrade.border} ${overallGrade.color} ${overallGrade.shadow}`}>
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse drop-shadow-[0_0_5px_currentColor]" />
                        {stat.value}
                      </span>
                    </div>
                  ) : (
                    <div className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none drop-shadow-md">
                      {stat.value}
                    </div>
                  )}
                  <div className="text-[10px] font-mono text-zinc-400 mt-2 uppercase tracking-wider flex items-center justify-between">
                    <span>{stat.subtitle}</span>
                    <span className={`${stat.iconColor} font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5`}>
                      Analytics <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Main Graphs & Visualizations: 2-Column High-Tech Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8 relative z-10">
        {/* Left Column: Interactive Vector Density Heatmap (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7 glass-card bg-noise rounded-2xl p-5 sm:p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00FF66]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Semantic Vector & Knowledge Heatmap</h3>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
                <span>Sparse</span>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00FF66]/10 border border-[#00FF66]/20" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00FF66]/30 border border-[#00FF66]/40" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00FF66]/60 border border-[#00FF66]/70" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00FF66] border border-white" />
                </div>
                <span>Dense</span>
              </div>
            </div>

            {/* 24 Heatmap Matrix Cells */}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 mb-4">
              {Array.from({ length: 24 }).map((_, i) => {
                const hasActivity = i < uniqueQuizzes.length || (totalChunks > 0 && i < totalChunks);
                const scoreForSlot = uniqueQuizzes[i % (uniqueQuizzes.length || 1)]?.scorePercent || (hasActivity ? 82 : 20);
                const intensity = hasActivity ? Math.min(1, Math.max(0.2, scoreForSlot / 100)) : 0.08;
                const isSelected = selectedHeatmapCell === i;
                
                return (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.06, y: -2 }}
                    onClick={() => setSelectedHeatmapCell(isSelected ? null : i)}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center p-1 border cursor-pointer relative group transition-all ${
                      isSelected ? "ring-2 ring-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.4)]" : "border-white/5"
                    }`}
                    style={{
                      backgroundColor: hasActivity ? `rgba(0, 255, 102, ${intensity})` : 'rgba(255, 255, 255, 0.03)',
                      borderColor: hasActivity ? `rgba(0, 255, 102, ${intensity * 0.9})` : 'rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <span className={`text-[9px] font-mono font-black ${intensity > 0.4 ? "text-black" : "text-zinc-300"}`}>
                      {hasActivity ? `${Math.round(intensity * 100)}%` : `—`}
                    </span>
                    <span className={`text-[7px] font-mono uppercase font-bold ${intensity > 0.4 ? "text-black/70" : "text-zinc-500"}`}>
                      V{i + 1}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#00FF66]" />
              {totalChunks} Active Vector Nodes
            </span>
            <span className="text-zinc-500 uppercase">High-Dimensional RAG Clustering</span>
          </div>
        </motion.div>

        {/* Right Column: Ingestion Throughput & Activity Bar Chart (5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-5 glass-card bg-noise rounded-2xl p-5 sm:p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-5 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00E5FF]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Pages Ingestion Volume</h3>
              </div>
              <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2 py-0.5 rounded-full font-bold">
                {totalPages} Total Pgs
              </span>
            </div>

            {/* Glowing Bar Chart */}
            <div className="h-36 w-full flex items-end justify-between gap-2 px-1 pb-2">
              {pageBars.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                  <div className="text-[9px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    {item.pages}p
                  </div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${item.height}%` }}
                    transition={{ delay: i * 0.05 + 0.3, type: "spring", stiffness: 150 }}
                    className="w-full max-w-[28px] bg-gradient-to-t from-[#00E5FF]/20 via-[#00E5FF]/60 to-[#00E5FF] rounded-t-lg shadow-[0_0_12px_rgba(0,229,255,0.35)] group-hover:brightness-125 transition-all"
                  />
                  <span className="text-[10px] font-mono text-zinc-400 font-bold group-hover:text-white transition-colors">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono text-zinc-400">
            <span>Throughput: Real-time</span>
            <span className="text-[#00E5FF] font-bold">Chunk Embeddings Synced</span>
          </div>
        </motion.div>
      </div>

      {/* Recent Quiz Performance Cards */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8 relative z-10 flex-1 flex flex-col min-h-0"
      >
        <div className="flex items-center justify-between gap-2.5 mb-5">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-[#00FF66]" />
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-200">Recent Diagnostic Quiz Performance</h2>
          </div>
          {uniqueQuizzes.length > 0 && (
            <button
              onClick={() => setTab("quiz")}
              className="text-[10px] font-mono text-[#00FF66] hover:text-[#00E55B] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
            >
              Launch New Quiz <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {uniqueQuizzes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {uniqueQuizzes.slice(0, 6).map((item, idx) => {
              const badge = getScoreBadge(item.scorePercent || 0);
              const dateStr = item.timestamp || item.date;
              const titleStr = item.documentName || item.docName || "Diagnostic Session";
              
              return (
                <motion.div
                  key={item.id || idx}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className={`glass-card bg-noise rounded-2xl p-5 sm:p-6 flex flex-col justify-between border-l-4 ${badge.border.replace('border-', 'border-l-')} transition-all hover:border-dotted hover:border-[#00FF66]`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black uppercase text-white truncate drop-shadow-sm mb-1" title={titleStr}>
                        {titleStr}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{dateStr ? `${new Date(dateStr).toLocaleDateString()} • ${new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Recent"}</span>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider border shrink-0 ${badge.bg} ${badge.border} ${badge.color}`}>
                      {badge.label}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Score</span>
                      <span className={`text-2xl font-black font-mono ${badge.color} drop-shadow-[0_0_8px_currentColor]`}>
                        {item.scorePercent || 0}%
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider mb-0.5">Points Earned</span>
                      <span className="text-xs font-bold text-white font-mono bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                        {item.earnedPoints || 0} / {item.totalPoints || 100} PTS
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="glass-card bg-noise rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,102,0.2)]">
              <Award className="w-8 h-8 drop-shadow-sm" />
            </div>
            <h3 className="font-black text-white text-lg uppercase tracking-wider mb-2">No Quiz Data Yet</h3>
            <p className="text-xs text-zinc-400 font-mono max-w-md leading-relaxed mb-6">
              Generate an interactive practice quiz from any indexed document to start tracking your knowledge retention scores in real-time.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setTab("quiz")}
              className="px-6 py-3.5 bg-gradient-to-r from-[#00FF66] to-[#00E55B] hover:from-[#00E55B] hover:to-[#00CC55] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,102,0.35)] cursor-pointer flex items-center gap-2"
            >
              <BrainCircuit className="w-4 h-4 text-black" />
              <span>Launch First Quiz</span>
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
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00FF66] animate-pulse-glow shadow-[0_0_12px_rgba(0,255,102,0.6)]" />
            <div className="pt-3">
              <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(0,255,102,0.3)]">
                <BrainCircuit className="w-3.5 h-3.5 text-[#00FF66]" />
                4. Ready to Study
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Drill-down Modal */}
      <AnimatePresence>
        {activeModal && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card bg-noise rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative text-white flex flex-col gap-6 shadow-2xl border-t-2 border-t-[#00FF66]"
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white rounded-full transition-all z-10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              
              {renderModalContent(activeModal)}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
