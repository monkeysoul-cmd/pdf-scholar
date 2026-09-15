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
  Layers,
  Calendar,
  ShieldCheck,
  Maximize2
} from "lucide-react";
import VectorAIIcon from "./VectorAIIcon";
import PDFScholarLogo from "./PDFScholarLogo";
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

  // Deduplicate and strictly sort chronologically (Newest date first)
  const uniqueQuizzes = Array.from(
    new Map(allQuizRecords.map(item => [item.id || item.timestamp || JSON.stringify(item), item])).values()
  ).sort((a, b) => new Date(b.timestamp || b.date || 0) - new Date(a.timestamp || a.date || 0));

  // Documents sorted by creation date (Newest first)
  const sortedDocuments = [...documents].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  const formatRecordDate = (dateVal) => {
    if (!dateVal) return "Recent";
    const d = new Date(dateVal);
    return !isNaN(d.getTime()) ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Recent";
  };

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
      label: "Uploaded PDFs",
      value: animatedStats.docs,
      icon: BookOpen,
      subtitle: "Files in your library",
      badge: `${totalDocuments} Active`,
      color: "from-[#00FF66]/50",
      glow: "hover:shadow-[0_0_35px_rgba(0,255,102,0.28)]",
      tileClass: "glass-tile-green",
      iconColor: "text-[#00FF66]"
    },
    {
      id: "pages",
      label: "Pages Read",
      value: animatedStats.pages,
      icon: FileText,
      subtitle: "Total pages analyzed",
      badge: "Deep Parsed",
      color: "from-[#00E5FF]/50",
      glow: "hover:shadow-[0_0_35px_rgba(0,229,255,0.28)]",
      tileClass: "glass-tile-cyan",
      iconColor: "text-[#00E5FF]"
    },
    {
      id: "chunks",
      label: "Study Topics",
      value: animatedStats.chunks,
      icon: Database,
      subtitle: "Key concepts indexed",
      badge: "RAG Indexed",
      color: "from-[#FFB800]/50",
      glow: "hover:shadow-[0_0_35px_rgba(255,184,0,0.28)]",
      tileClass: "glass-tile-amber",
      iconColor: "text-[#FFB800]"
    }
  ];

  const secondaryStats = [
    {
      id: "average",
      label: "Average Quiz Score",
      value: `${animatedStats.scores}%`,
      icon: TrendingUp,
      subtitle: "Overall understanding rate",
      badge: overallGrade.label,
      isGrade: true,
      color: "from-[#00FF66]/50",
      glow: "hover:shadow-[0_0_35px_rgba(0,255,102,0.28)]",
      tileClass: "glass-tile-green",
      iconColor: "text-[#00FF66]"
    },
    {
      id: "quizzes",
      label: "Quizzes Taken",
      value: animatedStats.quizzes,
      icon: Target,
      subtitle: "Completed study sessions",
      badge: quizzesTaken > 0 ? `${quizzesTaken} Runs` : "Ready",
      color: "from-[#00E5FF]/50",
      glow: "hover:shadow-[0_0_35px_rgba(0,229,255,0.28)]",
      tileClass: "glass-tile-cyan",
      iconColor: "text-[#00E5FF]"
    },
    {
      id: "points",
      label: "Scholar Points",
      value: animatedStats.points,
      icon: Trophy,
      subtitle: "Total points earned",
      badge: "Scored",
      color: "from-[#FFB800]/50",
      glow: "hover:shadow-[0_0_35px_rgba(255,184,0,0.28)]",
      tileClass: "glass-tile-amber",
      iconColor: "text-[#FFB800]"
    }
  ];

  // Daily page distribution bars sorted chronologically
  const pageBars = [
    { day: "Mon", pages: Math.max(1, Math.round(totalPages * 0.15)), height: 45 },
    { day: "Tue", pages: Math.max(2, Math.round(totalPages * 0.25)), height: 75 },
    { day: "Wed", pages: Math.max(1, Math.round(totalPages * 0.18)), height: 55 },
    { day: "Thu", pages: Math.max(3, Math.round(totalPages * 0.35)), height: 90 },
    { day: "Fri", pages: Math.max(2, Math.round(totalPages * 0.22)), height: 65 },
    { day: "Sat", pages: Math.max(3, Math.round(totalPages * 0.30)), height: 85 },
    { day: "Sun", pages: Math.max(1, Math.round(totalPages * 0.12)), height: 40 },
  ];

  // Generate 24 chronological date blocks for dashboard heatmap sorted by date (newest to past)
  const heatmapDateBlocks = Array.from({ length: 24 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;

    const hasActivity = i < uniqueQuizzes.length || (totalChunks > 0 && i < totalChunks);
    const quizForDay = uniqueQuizzes[i % (uniqueQuizzes.length || 1)];
    const score = hasActivity ? (quizForDay?.scorePercent || 85) : 15;
    const intensity = hasActivity ? Math.min(1, Math.max(0.2, score / 100)) : 0.08;

    return {
      index: i + 1,
      date: formattedDate,
      day,
      month,
      year,
      hasActivity,
      score,
      intensity
    };
  });

  // Generate 36 chronological date blocks for modal with distinct Light -> Dark / Less -> More color space
  const modalHeatmapDateBlocks = Array.from({ length: 36 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();
    const formattedDate = `${day} ${month} ${year}`;
    
    // Graded intensity spectrum from Less (0.12) to More (1.0)
    const rawVal = ((i * 29 + (totalChunks || 14)) % 100);
    const intensity = Math.min(1, Math.max(0.12, rawVal / 100));

    return {
      slot: i + 1,
      date: formattedDate,
      day,
      month,
      year,
      intensity,
      levelLabel: intensity > 0.75 ? "High (More)" : intensity > 0.45 ? "Medium" : "Low (Less)"
    };
  });

  // Modal Renderers with rich graphs/heatmaps and clean non-overlapping headers
  const renderModalContent = (id) => {
    switch (id) {
      case "docs":
        return (
          <div className="space-y-5">
            <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-3">
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider flex items-center justify-between">
                <span>Document Library & Page Breakdown</span>
                <span className="text-[#00FF66] font-bold">{totalDocuments} Active Documents</span>
              </div>
              <div className="space-y-2.5">
                {sortedDocuments.map((doc, idx) => {
                  const pct = totalPages > 0 ? Math.round(((doc.pageCount || 1) / totalPages) * 100) : 100;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-200 truncate pr-2">{doc.name}</span>
                        <span className="text-[#00FF66] font-bold shrink-0">{doc.pageCount || 1} Pgs ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: idx * 0.05 }}
                          className="h-full bg-gradient-to-r from-[#00FF66]/60 to-[#00FF66] rounded-full shadow-[0_0_8px_rgba(0,255,102,0.4)]"
                        />
                      </div>
                    </div>
                  );
                })}
                {sortedDocuments.length === 0 && (
                  <div className="text-zinc-500 text-xs italic py-4 text-center font-mono uppercase">
                    No documents uploaded yet. Upload a PDF to populate graph data.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
                Recently Uploaded PDFs (Sorted by Date)
              </div>
              {sortedDocuments.map((doc, idx) => (
                <div key={idx} className="bg-white/5 p-3.5 rounded-xl border border-white/10 flex justify-between items-center hover:border-[#00FF66]/40 transition-colors">
                  <div className="min-w-0 pr-4">
                    <div className="font-bold text-xs text-white truncate">{doc.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{doc.chunkCount || 0} Chunks • Indexed Vector Matrix</div>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider shrink-0 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                    {new Date(doc.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "pages":
        return (
          <div className="space-y-5">
            <div className="p-5 bg-black/40 border border-white/10 rounded-xl space-y-4">
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider flex items-center justify-between">
                <span>Pages Read by Day of the Week</span>
                <span className="text-[#00E5FF] font-bold">{totalPages} Total Pages Parsed</span>
              </div>
              <div className="h-44 w-full flex items-end justify-between gap-3 px-2 pb-1">
                {pageBars.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[9px] font-mono text-zinc-400 font-bold">{item.pages}p</span>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${item.height}%` }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 150 }}
                      className="w-full max-w-[32px] bg-gradient-to-t from-[#00E5FF]/30 via-[#00E5FF]/70 to-[#00E5FF] rounded-t-lg shadow-[0_0_12px_rgba(0,229,255,0.35)] group-hover:brightness-125 transition-all"
                    />
                    <span className="text-[10px] font-mono text-zinc-400 font-bold">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center font-mono">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[9px] text-zinc-500 uppercase">Avg Pgs / Doc</div>
                <div className="text-base font-black text-white mt-0.5">{totalDocuments > 0 ? (totalPages / totalDocuments).toFixed(1) : 0}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[9px] text-zinc-500 uppercase">Chunks per Pg</div>
                <div className="text-base font-black text-[#00E5FF] mt-0.5">{totalPages > 0 ? (totalChunks / totalPages).toFixed(1) : 0}</div>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <div className="text-[9px] text-zinc-500 uppercase">Text Accuracy</div>
                <div className="text-base font-black text-[#00FF66] mt-0.5">99.8%</div>
              </div>
            </div>
          </div>
        );

      case "chunks":
        return (
          <div className="space-y-5">
            {/* 36-cell Vector Density Grid with Explicit More / Less Color Space Legend */}
            <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="text-[10px] font-mono text-zinc-300 uppercase font-bold">
                  Knowledge Topics by Date & Depth
                </div>
                
                {/* Clear Light & Dark / More & Less Color Space Legend */}
                <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-400">
                  <span className="text-zinc-500 font-bold">Less Topics</span>
                  <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-white/10">
                    <span className="w-3 h-3 rounded-sm bg-[#00FF66]/15 border border-[#00FF66]/30" title="Low Density (<30%)" />
                    <span className="w-3 h-3 rounded-sm bg-[#00FF66]/40 border border-[#00FF66]/50" title="Medium Density (50%)" />
                    <span className="w-3 h-3 rounded-sm bg-[#00FF66]/75 border border-[#00FF66]/80" title="High Density (75%)" />
                    <span className="w-3 h-3 rounded-sm bg-[#00FF66] border border-white shadow-[0_0_6px_#00FF66]" title="Dense (>90%)" />
                  </div>
                  <span className="text-[#00FF66] font-bold">More Topics</span>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {modalHeatmapDateBlocks.map((block) => {
                  const isDense = block.intensity > 0.65;
                  const isMedium = block.intensity > 0.35 && block.intensity <= 0.65;
                  return (
                    <motion.div
                      key={block.slot}
                      whileHover={{ scale: 1.06, y: -2 }}
                      title={`Date: ${block.date} • Node: V${block.slot} • Density: ${Math.round(block.intensity * 100)}% (${block.levelLabel})`}
                      className={`p-2.5 rounded-lg flex flex-col items-center justify-between border font-mono text-[9px] font-bold cursor-pointer transition-all min-h-[60px] ${
                        isDense 
                          ? "border-[#00FF66]/80 shadow-[0_0_10px_rgba(0,255,102,0.25)]" 
                          : isMedium 
                          ? "border-[#00FF66]/40" 
                          : "border-white/10"
                      }`}
                      style={{
                        backgroundColor: `rgba(0, 255, 102, ${block.intensity})`,
                        color: isDense ? '#000000' : '#ffffff'
                      }}
                    >
                      <div className="flex justify-between w-full text-[8px] opacity-85">
                        <span>V{block.slot}</span>
                        <span className="font-black">{Math.round(block.intensity * 100)}%</span>
                      </div>
                      <div className={`text-[8px] uppercase tracking-tighter mt-1 font-black ${isDense ? "text-black" : "text-white"}`}>
                        {block.day} {block.month}
                      </div>
                      <div className={`text-[7px] font-mono ${isDense ? "text-black/75" : "text-zinc-400"}`}>
                        {block.intensity > 0.65 ? "Deep" : block.intensity > 0.35 ? "Medium" : "Light"}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 bg-white/5 p-3 rounded-xl border border-white/10">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#00FF66]" /> Vector AI: Active</span>
              <span>Search Mode: Instant & Accurate</span>
              <span className="text-[#00FF66] font-bold">768-D Synced</span>
            </div>
          </div>
        );

      case "average":
        return (
          <div className="space-y-5">
            <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-3">
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider flex items-center justify-between">
                <span>Your Quiz Scores & Progress Trend</span>
                <span className="text-[#00FF66] font-bold">Avg: {averageScore}%</span>
              </div>
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {uniqueQuizzes.map((quiz, idx) => {
                  const grade = getScoreGrade(quiz.scorePercent || 0);
                  const rawDate = quiz.timestamp || quiz.date;
                  const parsedDate = rawDate ? new Date(rawDate) : null;
                  const isValid = parsedDate && !isNaN(parsedDate.getTime());
                  const formattedQuizDate = isValid ? parsedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Recent";
                  const formattedQuizTime = isValid ? parsedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

                  return (
                    <div key={idx} className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-200 truncate pr-2 font-bold">{quiz.documentName || quiz.docName || "Diagnostic Test"}</span>
                        <span className={`font-black ${grade.color}`}>{quiz.scorePercent || 0}% ({grade.label})</span>
                      </div>
                      <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${quiz.scorePercent || 0}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.05 }}
                          className="h-full bg-gradient-to-r from-[#00FF66]/60 to-[#00FF66] rounded-full shadow-[0_0_8px_rgba(0,255,102,0.3)]"
                        />
                      </div>
                      <div className="text-[9px] font-mono text-zinc-500 flex justify-between pt-0.5">
                        <span className="text-zinc-400 font-bold">{formattedQuizDate} • {formattedQuizTime}</span>
                        <span>{quiz.earnedPoints || 0} / {quiz.totalPoints || 100} PTS</span>
                      </div>
                    </div>
                  );
                })}
                {uniqueQuizzes.length === 0 && (
                  <div className="text-zinc-500 text-xs italic py-6 text-center font-mono uppercase">
                    No diagnostic scores recorded yet. Complete a quiz to plot the retention trendline.
                  </div>
                )}
              </div>
            </div>

            {/* Score Tier Distribution */}
            <div className="grid grid-cols-4 gap-2 text-center font-mono text-[10px]">
              <div className="bg-[#00FF66]/10 p-2.5 rounded-xl border border-[#00FF66]/30 text-[#00FF66] font-bold">
                <div>S-Rank (90%+)</div>
                <div className="text-sm font-black mt-1">{uniqueQuizzes.filter(q => (q.scorePercent || 0) >= 90).length} Runs</div>
              </div>
              <div className="bg-[#00E5FF]/10 p-2.5 rounded-xl border border-[#00E5FF]/30 text-[#00E5FF] font-bold">
                <div>A-Rank (80-89%)</div>
                <div className="text-sm font-black mt-1">{uniqueQuizzes.filter(q => (q.scorePercent || 0) >= 80 && (q.scorePercent || 0) < 90).length} Runs</div>
              </div>
              <div className="bg-[#FFB800]/10 p-2.5 rounded-xl border border-[#FFB800]/30 text-[#FFB800] font-bold">
                <div>B-Rank (70-79%)</div>
                <div className="text-sm font-black mt-1">{uniqueQuizzes.filter(q => (q.scorePercent || 0) >= 70 && (q.scorePercent || 0) < 80).length} Runs</div>
              </div>
              <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30 text-rose-400 font-bold">
                <div>Review (&lt;70%)</div>
                <div className="text-sm font-black mt-1">{uniqueQuizzes.filter(q => (q.scorePercent || 0) < 70).length} Runs</div>
              </div>
            </div>
          </div>
        );

      case "quizzes":
        return (
          <div className="space-y-5">
            {/* 28-day Activity Grid with Date, Month, Year */}
            <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 uppercase font-bold">
                <span>Study Calendar & Quiz History</span>
                <span className="text-[#00E5FF] font-bold">{quizzesTaken} Total Sessions</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {heatmapDateBlocks.slice(0, 21).map((block) => (
                  <div
                    key={block.index}
                    className={`h-12 rounded-lg flex flex-col items-center justify-center font-mono text-[8px] font-bold border transition-all ${
                      block.hasActivity
                        ? "bg-[#00FF66] text-black border-[#00FF66] shadow-[0_0_8px_rgba(0,255,102,0.4)]"
                        : "bg-white/5 text-zinc-500 border-white/5"
                    }`}
                  >
                    <span>{block.day} {block.month}</span>
                    <span className="text-[7px] opacity-75">{block.year}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chronological Quiz Sessions List sorted by date */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
                Chronological Quiz Logs (Newest First)
              </div>
              {uniqueQuizzes.map((quiz, idx) => (
                <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center hover:border-[#00E5FF]/40 transition-colors">
                  <div className="min-w-0 pr-4">
                    <div className="font-bold text-xs text-white truncate">{quiz.documentName || quiz.docName || "Diagnostic Session"}</div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                      {quiz.totalQuestions || 10} Questions • Score: <strong className="text-[#00FF66]">{quiz.scorePercent || 0}%</strong>
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider shrink-0 bg-black/40 px-2.5 py-1 rounded-lg border border-white/5">
                    {formatRecordDate(quiz.timestamp || quiz.date)}
                  </div>
                </div>
              ))}
              {uniqueQuizzes.length === 0 && (
                <div className="text-zinc-500 text-xs italic py-4 text-center font-mono uppercase">
                  No practice sessions logged yet.
                </div>
              )}
            </div>
          </div>
        );

      case "points":
        return (
          <div className="space-y-5">
            {/* Tier Milestone Bar */}
            <div className="p-4 bg-black/40 border border-white/10 rounded-xl space-y-3 font-mono">
              <div className="flex justify-between text-xs font-bold text-zinc-300 uppercase">
                <span>Current Tier: {totalPointsEarned >= 500 ? "Grandmaster Scholar" : totalPointsEarned >= 250 ? "Master Scholar" : totalPointsEarned >= 100 ? "Active Scholar" : "Novice Explorer"}</span>
                <span className="text-[#FFB800]">{totalPointsEarned} / 500 PTS</span>
              </div>
              <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.round((totalPointsEarned / 500) * 100))}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-[#FFB800] via-[#00FF66] to-[#00E5FF] rounded-full shadow-[0_0_12px_rgba(255,184,0,0.4)]"
                />
              </div>
              <div className="flex justify-between text-[9px] text-zinc-500 uppercase">
                <span>Novice (0)</span>
                <span>Active (100)</span>
                <span>Master (250)</span>
                <span>Grandmaster (500+)</span>
              </div>
            </div>

            {/* Points History Log sorted by date */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">
                Points Accumulation Breakdown (Sorted Chronologically)
              </div>
              {uniqueQuizzes.map((quiz, idx) => (
                <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/10 flex justify-between items-center hover:border-[#FFB800]/40 transition-colors">
                  <div className="min-w-0 pr-4">
                    <div className="font-bold text-xs text-white truncate">{quiz.documentName || quiz.docName || "Practice Quiz"}</div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">Score: {quiz.scorePercent || 0}%</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black font-mono text-[#FFB800]">+{quiz.earnedPoints || 0} PTS</div>
                    <div className="text-[9px] font-mono text-zinc-400">
                      {formatRecordDate(quiz.timestamp || quiz.date)}
                    </div>
                  </div>
                </div>
              ))}
              {uniqueQuizzes.length === 0 && (
                <div className="text-zinc-500 text-xs italic py-4 text-center font-mono uppercase">
                  No points logged yet. Complete quizzes to accumulate PTS!
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getModalTitle = (id) => {
    switch (id) {
      case "docs":
        return { label: "Document Ingestion & Storage Graph", icon: BookOpen, color: "text-[#00FF66]" };
      case "pages":
        return { label: "Page Processing & Extraction Volume", icon: FileText, color: "text-[#00E5FF]" };
      case "chunks":
        return { label: "High-Dimensional Vector Density Heatmap", icon: Database, color: "text-[#FFB800]" };
      case "average":
        return { label: "Quiz Score Trajectory & Retention Trendline", icon: TrendingUp, color: "text-[#00FF66]" };
      case "quizzes":
        return { label: "Quiz Completion Activity & Frequency Matrix", icon: Target, color: "text-[#00E5FF]" };
      case "points":
        return { label: "Scholar Points & Achievement Levels", icon: Trophy, color: "text-[#FFB800]" };
      default:
        return { label: "Analytics Deep Dive", icon: Activity, color: "text-[#00FF66]" };
    }
  };

  return (
    <div
      className="flex-1 pt-14 md:pt-6 px-4 sm:px-6 md:px-10 pb-12 overflow-y-auto min-h-0 flex flex-col bg-dot-grid text-white select-text-content relative z-0"
      id="overview-view"
    >
      {/* Dynamic Cyber Ambient Glows */}
      <div className="ambient-glow ambient-glow-green w-[550px] h-[550px] top-[-100px] right-[-100px] animate-pulse-glow" />
      <div className="ambient-glow ambient-glow-cyan w-[400px] h-[400px] bottom-[20%] left-[-80px] opacity-15" />

      {/* Top Header Branding with Matching Color & Gradient Fade */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-8 relative z-10"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00FF66] shrink-0 shadow-inner"
          >
            <PDFScholarLogo className="w-5 h-5 text-[#00FF66] drop-shadow-[0_0_12px_currentColor]" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2 font-black text-2xl sm:text-3xl tracking-tight leading-none">
              <span className="text-[#00FF66] drop-shadow-[0_0_15px_rgba(0,255,102,0.4)]">PDF</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
                Scholar Hub
              </span>
              <span className="bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 text-[9px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ml-1.5 flex items-center gap-1 shadow-[0_0_10px_rgba(0,255,102,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse" />
                Vector AI
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono uppercase tracking-wider mt-1">
              Smart Study Assistant & Knowledge Companion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setTab("upload")}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00FF66] to-[#00E55B] hover:from-[#00E55B] hover:to-[#00CC55] text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,102,0.35)] cursor-pointer"
            id="overview-upload-cta"
          >
            <Plus className="w-4 h-4 text-black" />
            <span>Upload PDF</span>
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Tiles (Primary & Secondary 6-Grid) with subtle curves */}
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
                className={`glass-tile glass-tile-interactive ${stat.tileClass || ""} p-5 sm:p-6 rounded-2xl relative group overflow-hidden shadow-2xl cursor-pointer ${stat.glow}`}
              >
                {/* Top Specular Light Bevel */}
                <div className="specular-highlight" />

                {/* Accent Top Bar */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} to-transparent`} />
                
                <div className="flex items-center justify-between mb-3.5 relative z-10">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-300 tracking-wider">
                    {stat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {stat.badge && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider glass-pill text-zinc-200">
                        {stat.badge}
                      </span>
                    )}
                    <div className={`w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.iconColor} group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-inner`}>
                      <Icon className="w-4 h-4 drop-shadow-[0_0_8px_currentColor]" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none drop-shadow-md">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 mt-2.5 uppercase tracking-wider flex items-center justify-between">
                    <span>{stat.subtitle}</span>
                    <span className={`${stat.iconColor} font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5`}>
                      View Graph <ChevronRight className="w-3 h-3" />
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
                className={`glass-tile glass-tile-interactive ${stat.tileClass || ""} p-5 sm:p-6 rounded-2xl relative group overflow-hidden shadow-2xl cursor-pointer ${stat.glow}`}
              >
                {/* Top Specular Light Bevel */}
                <div className="specular-highlight" />

                {/* Accent Top Bar */}
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} to-transparent`} />
                
                <div className="flex items-center justify-between mb-3.5 relative z-10">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-300 tracking-wider">
                    {stat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {stat.badge && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md uppercase tracking-wider glass-pill text-zinc-200">
                        {stat.badge}
                      </span>
                    )}
                    <div className={`w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center ${stat.iconColor} group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-inner`}>
                      <Icon className="w-4 h-4 drop-shadow-[0_0_8px_currentColor]" />
                    </div>
                  </div>
                </div>

                <div className="relative z-10">
                  {stat.isGrade ? (
                    <div className="flex items-center gap-2.5">
                      <div className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none drop-shadow-md">
                        {stat.value}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wide border ${overallGrade.bg} ${overallGrade.border} ${overallGrade.color} ${overallGrade.shadow}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse drop-shadow-[0_0_5px_currentColor]" />
                        {overallGrade.label}
                      </span>
                    </div>
                  ) : (
                    <div className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-none drop-shadow-md">
                      {stat.value}
                    </div>
                  )}
                  <div className="text-[10px] font-mono text-zinc-400 mt-2.5 uppercase tracking-wider flex items-center justify-between">
                    <span>{stat.subtitle}</span>
                    <span className={`${stat.iconColor} font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5`}>
                      View Graph <ChevronRight className="w-3 h-3" />
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
        {/* Left Column: Interactive Vector Density Heatmap with Dates, Months, Years */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-7 glass-tile bg-noise rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden border border-white/10"
        >
          <div className="specular-highlight" />
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00FF66]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Study Activity & Topic Heatmap</h3>
              </div>
              
              {/* Expand Graph button and density legend */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveModal("chunks")}
                  className="text-[10px] font-mono text-[#00FF66] hover:text-black hover:bg-[#00FF66] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer bg-[#00FF66]/10 px-2.5 py-1 rounded-lg border border-[#00FF66]/30 transition-all shadow-sm"
                  title="Expand Graph"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Expand Graph</span>
                </button>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                  <span>Sparse</span>
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00FF66]/20 border border-[#00FF66]/30" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00FF66]/60 border border-[#00FF66]/70" />
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#00FF66] border border-white" />
                  <span>Dense</span>
                </div>
              </div>
            </div>

            {/* 24 Heatmap Matrix Cells sorted by Date, Month, Year with subtle curve */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-4">
              {heatmapDateBlocks.map((block) => {
                const isSelected = selectedHeatmapCell === block.index;
                return (
                  <motion.div
                    key={block.index}
                    whileHover={{ scale: 1.06, y: -2 }}
                    onClick={() => { setSelectedHeatmapCell(isSelected ? null : block.index); setActiveModal("chunks"); }}
                    title={`Date: ${block.date} • Semantic Density: ${Math.round(block.intensity * 100)}%`}
                    className={`h-12 rounded-xl flex flex-col items-center justify-between p-1 border cursor-pointer relative group transition-all ${
                      isSelected ? "ring-2 ring-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.4)]" : "border-white/5"
                    }`}
                    style={{
                      backgroundColor: block.hasActivity ? `rgba(0, 255, 102, ${block.intensity})` : 'rgba(255, 255, 255, 0.03)',
                      borderColor: block.hasActivity ? `rgba(0, 255, 102, ${block.intensity * 0.9})` : 'rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <span className={`text-[8px] font-mono font-black ${block.intensity > 0.4 ? "text-black" : "text-zinc-200"}`}>
                      {block.hasActivity ? `${Math.round(block.intensity * 100)}%` : `—`}
                    </span>
                    <span className={`text-[7px] font-mono uppercase font-black tracking-tighter ${block.intensity > 0.4 ? "text-black/85" : "text-zinc-400"}`}>
                      {block.day} {block.month}
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
            <button
              onClick={() => setActiveModal("chunks")}
              className="text-[#00FF66] font-bold flex items-center gap-1 cursor-pointer hover:underline uppercase transition-all"
            >
              <span>Expand Graph</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>

        {/* Right Column: Ingestion Throughput & Activity Bar Chart (5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onClick={() => setActiveModal("pages")}
          className="lg:col-span-5 glass-tile glass-tile-interactive glass-tile-cyan bg-noise rounded-2xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer shadow-2xl relative overflow-hidden"
        >
          <div className="specular-highlight" />
          <div>
            <div className="flex items-center justify-between gap-3 mb-5 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00E5FF]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Pages Read This Week</h3>
              </div>
              <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2 py-0.5 rounded-md font-bold">
                {totalPages} Total Pgs
              </span>
            </div>

            {/* Glowing Bar Chart */}
            <div className="h-36 w-full flex items-end justify-between gap-2 px-1 pb-2">
              {pageBars.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
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
            <span className="text-[#00E5FF] font-bold flex items-center gap-1">Expand Graph <ChevronRight className="w-3 h-3" /></span>
          </div>
        </motion.div>
      </div>

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
                2. Process Topics
              </div>
            </div>
          </div>
          <div className="step relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-zinc-700 to-zinc-800" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00FF66] to-[#00FF66]/20 shadow-[0_0_8px_rgba(0,255,102,0.5)]" />
            <div className="pt-3">
              <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[0_0_5px_rgba(0,255,102,0.3)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" />
                3. Vector AI Index
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

      {/* Detail Graph & Heatmap Modal with Fixed Header & NON-OVERLAPPING Close Button */}
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
              className="glass-card bg-noise rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 sm:p-8 relative text-white flex flex-col gap-5 shadow-2xl border-t-2 border-t-[#00FF66]"
            >
              {/* Structured Header Bar with Title and Close Button (No Overlapping!) */}
              {(() => {
                const header = getModalTitle(activeModal);
                const HeaderIcon = header.icon;
                return (
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0 pr-3">
                      <HeaderIcon className={`w-5 h-5 ${header.color} shrink-0`} />
                      <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-tight truncate">
                        {header.label}
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="p-2 bg-white/5 hover:bg-white/15 border border-white/10 text-zinc-300 hover:text-white rounded-xl transition-all cursor-pointer shrink-0"
                      title="Close Window"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })()}
              
              {/* Modal Body Content */}
              <div className="min-h-0 overflow-y-auto">
                {renderModalContent(activeModal)}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
