import React from "react";
import { useAppState } from "../lib/state-context";
import {
  FileText,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  Plus,
  Sparkles,
  Award,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Zap,
  Target
} from "lucide-react";
import { motion } from "motion/react";

export default function Overview() {
  const {
    documents,
    selectedDocumentId,
    selectDocument,
    deleteDocument,
    setTab,
    quizScores = []
  } = useAppState();

  const totalChunks = documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0);
  const totalPages = documents.reduce((acc, d) => acc + (d.pageCount || 0), 0);

  const selectedDoc = documents.find((d) => d.id === selectedDocumentId);

  // Compute quiz stats
  const totalQuizzes = quizScores.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(quizScores.reduce((acc, q) => acc + q.scorePercent, 0) / totalQuizzes)
      : 0;

  // Primary Row Stat Cards (Top 3)
  const primaryStats = [
    {
      label: "Total Reading Segments",
      value: totalChunks,
      icon: Layers,
      subtitle: "Indexed vector sections",
      accent: "#00FF66"
    },
    {
      label: "Average Quiz Score",
      value: totalQuizzes > 0 ? `${avgScore}%` : "N/A",
      icon: Award,
      subtitle: totalQuizzes > 0 ? "Based on diagnostic attempts" : "No quizzes taken",
      accent: avgScore >= 80 ? "#00FF66" : avgScore >= 60 ? "#fbbf24" : "#f87171"
    },
    {
      label: "Quizzes Completed",
      value: `${totalQuizzes}`,
      icon: GraduationCap,
      subtitle: "Total test assessments",
      accent: "#00FF66"
    }
  ];

  // Secondary Row Stat Cards (Added 3 tiles below top 3)
  const secondaryStats = [
    {
      label: "Active Study Target",
      value: selectedDoc ? selectedDoc.name : "None Selected",
      isTruncate: true,
      icon: Target,
      subtitle: selectedDoc
        ? `${selectedDoc.pageCount} Pages • ${selectedDoc.chunkCount} Chunks`
        : "Select a document below",
      badge: selectedDoc ? "ACTIVE TARGET" : "IDLE",
      badgeGreen: !!selectedDoc
    },
    {
      label: "Ingested Study Library",
      value: `${documents.length} File${documents.length === 1 ? "" : "s"}`,
      icon: BookOpen,
      subtitle: `${totalPages} Total pages indexed`,
      badge: `${totalPages} PAGES`,
      badgeGreen: true
    },
    {
      label: "AI Vector Engine",
      value: "100% READY",
      icon: Zap,
      subtitle: "RAG Semantic Retrieval Active",
      badge: "ONLINE",
      badgeGreen: true
    }
  ];

  const getScoreBadge = (score) => {
    if (score === 100)
      return { label: "PERFECT", bg: "bg-[#00FF66]/10", border: "border-[#00FF66]/30", text: "text-[#00FF66]" };
    if (score >= 80)
      return { label: "EXCELLENT", bg: "bg-[#00FF66]/10", border: "border-[#00FF66]/30", text: "text-[#00FF66]" };
    if (score >= 60)
      return { label: "PASSED", bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" };
    return { label: "NEEDS STUDY", bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" };
  };

  return (
    <div
      className="flex-1 p-8 md:p-12 overflow-y-auto min-h-0 flex flex-col bg-[#080808] text-white select-none relative"
      id="overview-view"
    >
      {/* Upper Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800/80 pb-6 mb-8 relative z-10"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400">PDF Scholar Engine</span>
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
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00FF66] hover:bg-[#00e55b] text-black text-xs font-extrabold uppercase tracking-wider rounded-sm transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)] cursor-pointer"
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
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase text-white">
          Study Hub <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-600">
            Dashboard
          </span>
        </h1>
      </motion.section>

      {/* Grid of Stats Cards: 3 Top Tiles + 3 Added Tiles Below */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-5 mb-10 relative z-10"
      >
        {/* Row 1: Primary 3 Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {primaryStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={`primary-${i}`}
                whileHover={{ y: -2, borderColor: "#00FF66" }}
                className="bg-[#101010] p-6 rounded-sm border border-zinc-800/80 flex flex-col justify-between shadow-xl relative overflow-hidden group transition-all h-36"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                    {stat.label}
                  </span>
                  <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-[#00FF66] group-hover:border-[#00FF66]/40 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div>
                  <div className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-wider">
                    {stat.subtitle}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Row 2: Added 3 Tiles Below Three Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {secondaryStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={`secondary-${i}`}
                whileHover={{ y: -2, borderColor: "#00FF66" }}
                className="bg-[#101010] p-6 rounded-sm border border-zinc-800/80 flex flex-col justify-between shadow-xl relative overflow-hidden group transition-all h-36"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                    {stat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {stat.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider border ${
                          stat.badgeGreen
                            ? "bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800"
                        }`}
                      >
                        {stat.badge}
                      </span>
                    )}
                    <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-[#00FF66] group-hover:border-[#00FF66]/40 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    className={`text-xl md:text-2xl font-black tracking-tight text-white leading-none ${
                      stat.isTruncate ? "truncate" : ""
                    }`}
                    title={typeof stat.value === "string" ? stat.value : undefined}
                  >
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-wider truncate">
                    {stat.subtitle}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Quiz Test Scores & Performance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-[#101010] border border-zinc-800/80 rounded-sm mb-10 overflow-hidden shadow-2xl relative z-10"
      >
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between bg-[#141414]/50">
          <div>
            <h3 className="font-extrabold text-white text-base uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00FF66]" />
              PDF Quiz Test Scores
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1 uppercase font-mono">
              Diagnostic quiz test performance history across study materials.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-zinc-900 text-[#00FF66] px-3 py-1.5 rounded-sm border border-zinc-800 uppercase">
            {totalQuizzes} QUIZZES LOGGED
          </span>
        </div>

        {quizScores.length > 0 ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizScores.map((item) => {
              const badge = getScoreBadge(item.scorePercent);
              return (
                <div
                  key={item.id}
                  className="bg-[#0B0B0B] border border-zinc-800 hover:border-zinc-700 p-5 rounded-sm flex flex-col justify-between gap-4 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-sm uppercase border ${badge.bg} ${badge.border} ${badge.text}`}
                      >
                        {badge.label} • {item.scorePercent}%
                      </span>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase">
                        {new Date(item.timestamp).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric"
                        })}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs uppercase text-zinc-200 truncate" title={item.documentName}>
                      {item.documentName}
                    </h4>
                  </div>

                  <div className="bg-[#121212] p-3 rounded-sm border border-zinc-800/60 font-mono text-[10px] flex items-center justify-between gap-1">
                    <span className="text-zinc-400">
                      MC: <strong className="text-white">{item.mcCorrect}/{item.mcTotal}</strong>
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400" title="Written Questions Credit">
                      Written:{" "}
                      <strong className="text-white">
                        {item.saFull !== undefined
                          ? `${item.saFull} Full${item.saPartial ? `, ${item.saPartial} Part` : ""}`
                          : `${item.saCorrect}/${item.saTotal}`}
                      </strong>
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-[#00FF66] font-bold">
                      {item.earnedPoints !== undefined
                        ? `${item.earnedPoints}/${item.totalPoints} PTS`
                        : `${item.totalCorrect}/${item.totalQuestions}`}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (item.documentId) selectDocument(item.documentId);
                      setTab("quiz");
                    }}
                    className="w-full py-2 bg-zinc-900 hover:bg-[#00FF66] text-zinc-300 hover:text-black text-[10px] font-bold uppercase tracking-wider rounded-sm border border-zinc-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Retake Quiz</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center p-6">
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 text-[#00FF66] rounded-sm flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">No Quiz Scores Recorded</h4>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto mt-1 mb-5 uppercase font-mono">
              Take an AI diagnostic practice quiz on your active PDF to view test scores here.
            </p>
            {documents.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setTab("quiz")}
                className="px-5 py-2.5 bg-[#00FF66] hover:bg-[#00e55b] text-black text-xs font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer"
              >
                Start Practice Quiz
              </motion.button>
            )}
          </div>
        )}
      </motion.div>

      {/* Ingested Documents Grid (Boxy Design) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[#101010] border border-zinc-800/80 rounded-sm mb-10 overflow-hidden shadow-2xl relative z-10"
      >
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between bg-[#141414]/50">
          <div>
            <h3 className="font-extrabold text-white text-base uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00FF66]" />
              My Study Materials
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1 uppercase font-mono">
              Select a document to initiate interactive AI study sessions.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold bg-zinc-900 text-[#00FF66] px-3 py-1.5 rounded-sm border border-zinc-800 uppercase">
            {documents.length} DOCUMENTS LOADED
          </span>
        </div>

        {documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#141414]/80 text-zinc-400 font-extrabold text-[10px] tracking-wider uppercase border-b border-zinc-800">
                  <th className="py-4 px-6">Document Name</th>
                  <th className="py-4 px-6">Uploaded At</th>
                  <th className="py-4 px-6 text-center">Reading Details</th>
                  <th className="py-4 px-6">Latest Quiz Score</th>
                  <th className="py-4 px-6 text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {documents.map((doc) => {
                  const isSelected = doc.id === selectedDocumentId;
                  const docScores = quizScores.filter((s) => s.documentId === doc.id);
                  const latestScore = docScores.length > 0 ? docScores[0] : null;

                  return (
                    <motion.tr
                      key={doc.id}
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.02)" }}
                      className={`transition-colors ${isSelected ? "bg-[#00FF66]/5" : ""}`}
                    >
                      {/* Doc name & active label */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3 max-w-md">
                          <div
                            className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30"
                                : "bg-zinc-900 text-zinc-500"
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span
                              className={`font-bold uppercase tracking-wide truncate block text-xs ${
                                isSelected ? "text-[#00FF66]" : "text-zinc-200"
                              }`}
                              title={doc.name}
                            >
                              {doc.name}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-mono font-bold text-[#00FF66] tracking-wider uppercase bg-[#00FF66]/10 px-2 py-0.5 rounded-sm border border-[#00FF66]/20">
                                ACTIVE TARGET
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-zinc-400 font-mono text-xs">
                        {new Date(doc.uploadedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>

                      {/* page Count / Chunks */}
                      <td className="py-4 px-6 text-center font-mono text-xs">
                        <span className="font-bold text-white">{doc.pageCount}</span>
                        <span className="text-zinc-400 text-[10px]"> PAGES</span>
                        <span className="mx-2 text-zinc-400 font-black">•</span>
                        <span className="font-bold text-[#00FF66]">{doc.chunkCount}</span>
                        <span className="text-zinc-400 text-[10px]"> SECTIONS</span>
                      </td>

                      {/* Latest Quiz Score */}
                      <td className="py-4 px-6 font-mono uppercase text-xs">
                        {latestScore ? (
                          <span className="inline-flex items-center gap-1.5 bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 px-2.5 py-1 rounded-sm font-bold text-[10px]">
                            {latestScore.scorePercent}% (
                            {latestScore.earnedPoints !== undefined
                              ? `${latestScore.earnedPoints}/${latestScore.totalPoints} PTS`
                              : `${latestScore.totalCorrect}/${latestScore.totalQuestions}`}
                            )
                          </span>
                        ) : (
                          <span className="text-zinc-500 text-[10px]">No Quiz Taken</span>
                        )}
                      </td>

                      {/* actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {isSelected ? (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setTab("chat")}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00FF66] hover:bg-[#00e55b] text-black text-[10px] font-extrabold uppercase tracking-wide rounded-sm transition-all shadow-[0_0_12px_rgba(0,255,102,0.2)] cursor-pointer"
                            >
                              <span>Open Chat</span>
                              <ArrowRight className="w-3 h-3" />
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => selectDocument(doc.id)}
                              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 hover:text-white text-[10px] font-extrabold uppercase tracking-wide rounded-sm transition-colors cursor-pointer"
                            >
                              Open
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.1, color: "#ef4444" }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteDocument(doc.id)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete Target"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-14 h-14 bg-zinc-900 border border-zinc-800 text-[#00FF66] rounded-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FileText className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-white text-base uppercase tracking-wider">No Study Materials Yet</h4>
            <p className="text-zinc-400 text-xs max-w-sm mx-auto mt-1 mb-6 uppercase font-mono">
              Upload textbook chapters, research papers, or notes to get started.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTab("upload")}
              className="px-6 py-3 bg-[#00FF66] hover:bg-[#00e55b] text-black text-xs font-black uppercase tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(0,255,102,0.25)] cursor-pointer"
            >
              Upload PDF File
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Stepper Process Footer with Green "4. Ready to Study" */}
      <section className="mt-auto border-t border-zinc-800/80 pt-8 relative z-10">
        <div className="stepper grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="step border-t-2 border-[#00FF66] pt-3">
            <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" />
              1. Read Document
            </div>
          </div>
          <div className="step border-t-2 border-[#00FF66] pt-3">
            <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" />
              2. Process Sections
            </div>
          </div>
          <div className="step border-t-2 border-[#00FF66] pt-3">
            <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00FF66]" />
              3. Vector Analysis
            </div>
          </div>
          <div className="step border-t-2 border-[#00FF66] pt-3">
            <div className="step-label text-[10px] font-mono font-bold text-[#00FF66] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-none bg-[#00FF66] animate-pulse shadow-[0_0_8px_#00FF66]" />
              4. Ready to Study
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
