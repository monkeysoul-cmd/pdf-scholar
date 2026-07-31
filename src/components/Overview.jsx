import React, { useState } from "react";
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
  MessageSquare,
  HelpCircle,
  X,
  BarChart2,
  Activity,
  ChevronRight,
  BookOpen,
  Zap,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Overview() {
  const {
    documents,
    selectedDocumentId,
    selectDocument,
    deleteDocument,
    setTab,
    quizScores = [],
    chatHistory = {}
  } = useAppState();

  const [activeModal, setActiveModal] = useState(null);

  const totalChunks = documents.reduce((acc, d) => acc + (d.chunkCount || 0), 0);
  const totalPages = documents.reduce((acc, d) => acc + (d.pageCount || 0), 0);
  const totalQuizzes = quizScores.length;

  const avgScore =
    totalQuizzes > 0
      ? Math.round(quizScores.reduce((acc, q) => acc + q.scorePercent, 0) / totalQuizzes)
      : 0;

  // Questions answered breakdown
  const totalQuestionsAnswered = quizScores.reduce((acc, q) => {
    if (q.totalQuestions) return acc + q.totalQuestions;
    return acc + (q.mcTotal || 0) + (q.saTotal || 0);
  }, 0);
  const totalMcAnswered = quizScores.reduce((acc, q) => acc + (q.mcTotal || 0), 0);
  const totalSaAnswered = quizScores.reduce((acc, q) => acc + (q.saTotal || 0), 0);

  // Calculate Academic Grading based on test scores and questions answered
  const getOverallGrade = () => {
    if (totalQuizzes === 0) {
      return { grade: "N/A", label: "NO TESTS TAKEN", color: "text-zinc-500", badge: "NO DATA" };
    }
    if (avgScore >= 90) {
      return { grade: "GRADE A+", label: "MASTERY EXCELLENT", color: "text-[#00FF66]", badge: "TOP TIER" };
    }
    if (avgScore >= 80) {
      return { grade: "GRADE A", label: "EXCELLENT PERFORMANCE", color: "text-[#00FF66]", badge: "EXCELLENT" };
    }
    if (avgScore >= 70) {
      return { grade: "GRADE B", label: "GOOD STANDING", color: "text-[#00FF66]", badge: "GOOD" };
    }
    if (avgScore >= 60) {
      return { grade: "GRADE C", label: "SATISFACTORY", color: "text-amber-400", badge: "PASSED" };
    }
    return { grade: "GRADE F", label: "NEEDS STUDY", color: "text-red-400", badge: "NEEDS PRACTICE" };
  };
  const overallGrade = getOverallGrade();

  // Chat history metrics
  const chatEntries = Object.entries(chatHistory || {});
  const totalChatMessages = chatEntries.reduce((acc, [_, msgs]) => acc + (msgs?.length || 0), 0);
  const userMessageCount = chatEntries.reduce(
    (acc, [_, msgs]) => acc + (msgs?.filter((m) => m.role === "user").length || 0),
    0
  );
  const aiMessageCount = chatEntries.reduce(
    (acc, [_, msgs]) => acc + (msgs?.filter((m) => m.role === "assistant" || m.role === "ai").length || 0),
    0
  );
  const docChatCount = chatEntries.filter(([_, msgs]) => msgs && msgs.length > 0).length;

  // Primary Row Stat Cards (Top 3)
  const primaryStats = [
    {
      id: "chunks",
      label: "Total Reading Segments",
      value: totalChunks,
      icon: Layers,
      subtitle: "Indexed vector sections",
      badge: "SEGMENT GRAPH",
      badgeGreen: true
    },
    {
      id: "avg-scores",
      label: "Grading & Performance",
      value: overallGrade.grade,
      icon: Award,
      subtitle: totalQuizzes > 0 ? `${avgScore}% Avg Score • ${totalQuestionsAnswered} Qs Solved` : "No tests taken",
      badge: "GRADING GRAPH",
      badgeGreen: true
    },
    {
      id: "quizzes",
      label: "Quizzes Completed",
      value: `${totalQuizzes}`,
      icon: GraduationCap,
      subtitle: "Total test assessments",
      badge: "TEST HEATMAP",
      badgeGreen: true
    }
  ];

  // Secondary Row Stat Cards (The 3 tiles below top 3)
  const secondaryStats = [
    {
      id: "avg-scores",
      label: "Grading Based on Test Scores",
      value: overallGrade.grade,
      icon: TrendingUp,
      subtitle: `${avgScore}% Score • ${totalQuestionsAnswered} Solved Qs`,
      badge: overallGrade.badge,
      badgeGreen: true
    },
    {
      id: "questions",
      label: "Questions Answered",
      value: `${totalQuestionsAnswered}`,
      icon: CheckCircle2,
      subtitle: `${totalMcAnswered} MC • ${totalSaAnswered} Written solved`,
      badge: "QUESTION GRAPH",
      badgeGreen: true
    },
    {
      id: "chat-history",
      label: "Chat History Interactions",
      value: `${totalChatMessages}`,
      icon: MessageSquare,
      subtitle: `${docChatCount} Document chat session${docChatCount === 1 ? "" : "s"}`,
      badge: "PAST CHAT LOGS",
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

  // Helper to render modal content for graph / heatmap view
  const renderModalContent = (modalId) => {
    switch (modalId) {
      case "avg-scores": {
        const sortedScores = quizScores.slice().reverse();
        const maxScoreVal = Math.max(...quizScores.map((q) => q.scorePercent), 0);

        // Prepare SVG line graph data points
        const graphWidth = 500;
        const graphHeight = 140;
        const points = sortedScores.map((q, i) => {
          const x = sortedScores.length > 1 ? (i / (sortedScores.length - 1)) * (graphWidth - 40) + 20 : graphWidth / 2;
          const y = graphHeight - 20 - (q.scorePercent / 100) * (graphHeight - 40);
          return { x, y, score: q.scorePercent, doc: q.documentName, date: q.timestamp };
        });

        const pathD =
          points.length > 0
            ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
            : "";
        const areaD =
          points.length > 0
            ? `${pathD} L ${points[points.length - 1].x} ${graphHeight - 10} L ${points[0].x} ${graphHeight - 10} Z`
            : "";

        // Build 28-cell heatmap array (4 rows x 7 cols)
        const heatmapCells = Array.from({ length: 28 }).map((_, idx) => {
          const item = sortedScores[idx];
          if (!item) return { status: "empty" };
          if (item.scorePercent >= 80) return { status: "high", score: item.scorePercent, doc: item.documentName };
          if (item.scorePercent >= 60) return { status: "mid", score: item.scorePercent, doc: item.documentName };
          return { status: "low", score: item.scorePercent, doc: item.documentName };
        });

        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg uppercase text-white tracking-wide">
                    Grading Based on Test Scores & Questions Answered
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Overall student academic grading computed from test scores and total questions answered.
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Grade & Performance Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#141414] p-3.5 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Academic Grade</span>
                <span className={`text-xl font-black ${overallGrade.color}`}>{overallGrade.grade}</span>
                <span className="text-[9px] text-zinc-400 block mt-0.5 font-bold uppercase">{overallGrade.label}</span>
              </div>
              <div className="bg-[#141414] p-3.5 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Average Score</span>
                <span className="text-xl font-black text-[#00FF66]">{avgScore}%</span>
                <span className="text-[9px] text-zinc-400 block mt-0.5 font-bold uppercase">Peak: {maxScoreVal}%</span>
              </div>
              <div className="bg-[#141414] p-3.5 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Questions Solved</span>
                <span className="text-xl font-black text-white">{totalQuestionsAnswered}</span>
                <span className="text-[9px] text-zinc-400 block mt-0.5 font-bold uppercase">{totalMcAnswered} MC • {totalSaAnswered} SA</span>
              </div>
              <div className="bg-[#141414] p-3.5 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Tests Attempted</span>
                <span className="text-xl font-black text-white">{totalQuizzes}</span>
                <span className="text-[9px] text-zinc-400 block mt-0.5 font-bold uppercase">Assessed</span>
              </div>
            </div>

            {/* Grading System Criteria Box */}
            <div className="bg-[#0B0B0B] p-4 rounded-sm border border-zinc-800 font-mono text-xs">
              <span className="text-[10px] font-extrabold uppercase text-zinc-400 block mb-2 tracking-wider">
                Academic Grading Scale Breakdown:
              </span>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-[10px]">
                <div className={`p-2 rounded-sm border ${avgScore >= 90 ? "bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]" : "bg-zinc-900/60 border-zinc-800 text-zinc-500"}`}>
                  <strong className="block text-white">Grade A+ (90-100%)</strong>
                  <span>Mastery Level</span>
                </div>
                <div className={`p-2 rounded-sm border ${avgScore >= 80 && avgScore < 90 ? "bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]" : "bg-zinc-900/60 border-zinc-800 text-zinc-500"}`}>
                  <strong className="block text-white">Grade A (80-89%)</strong>
                  <span>Excellent</span>
                </div>
                <div className={`p-2 rounded-sm border ${avgScore >= 70 && avgScore < 80 ? "bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]" : "bg-zinc-900/60 border-zinc-800 text-zinc-500"}`}>
                  <strong className="block text-white">Grade B (70-79%)</strong>
                  <span>Good Standing</span>
                </div>
                <div className={`p-2 rounded-sm border ${avgScore >= 60 && avgScore < 70 ? "bg-amber-500/20 border-amber-500 text-amber-400" : "bg-zinc-900/60 border-zinc-800 text-zinc-500"}`}>
                  <strong className="block text-white">Grade C (60-69%)</strong>
                  <span>Satisfactory</span>
                </div>
                <div className={`p-2 rounded-sm border ${avgScore < 60 && totalQuizzes > 0 ? "bg-red-500/20 border-red-500 text-red-400" : "bg-zinc-900/60 border-zinc-800 text-zinc-500"}`}>
                  <strong className="block text-white">Grade F (&lt;60%)</strong>
                  <span>Needs Practice</span>
                </div>
              </div>
            </div>

            {/* Progress SVG Line Graph */}
            <div className="bg-[#0B0B0B] p-5 rounded-sm border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-extrabold uppercase text-zinc-300 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#00FF66]" />
                  Score Performance Trend Line Graph
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase">
                  {quizScores.length} Data Points
                </span>
              </div>

              {points.length > 0 ? (
                <div className="w-full overflow-x-auto">
                  <svg className="w-full h-44" viewBox={`0 0 ${graphWidth} ${graphHeight}`}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00FF66" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#00FF66" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Threshold Grid Lines */}
                    <line x1="0" y1="28" x2={graphWidth} y2="28" stroke="#00FF66" strokeOpacity="0.2" strokeDasharray="4 4" />
                    <line x1="0" y1="68" x2={graphWidth} y2="68" stroke="#ffffff" strokeOpacity="0.1" strokeDasharray="3 3" />
                    <line x1="0" y1="120" x2={graphWidth} y2="120" stroke="#ffffff" strokeOpacity="0.05" />

                    {/* Area Fill */}
                    {points.length > 1 && <path d={areaD} fill="url(#scoreGrad)" />}

                    {/* Path Line */}
                    {points.length > 1 && (
                      <path d={pathD} fill="none" stroke="#00FF66" strokeWidth="2.5" strokeLinecap="round" />
                    )}

                    {/* Data Circles */}
                    {points.map((p, i) => (
                      <g key={i} className="group/pt cursor-pointer">
                        <circle cx={p.x} cy={p.y} r="5" fill="#080808" stroke="#00FF66" strokeWidth="2.5" />
                        <circle cx={p.x} cy={p.y} r="8" fill="#00FF66" fillOpacity="0.2" className="animate-ping" />
                        <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#00FF66" fontSize="10" fontWeight="bold">
                          {p.score}%
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 font-mono text-xs uppercase">
                  No quiz scores logged yet. Complete a quiz to view performance graphs.
                </div>
              )}
            </div>

            {/* Performance Activity Heatmap */}
            <div className="bg-[#0B0B0B] p-5 rounded-sm border border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-extrabold uppercase text-zinc-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00FF66]" />
                  Diagnostic Score Intensity Heatmap
                </span>
                <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-400">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#00FF66] rounded-xs" /> 80%+</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-400 rounded-xs" /> 60-79%</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-500 rounded-xs" /> &lt;60%</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {heatmapCells.map((cell, i) => (
                  <div
                    key={i}
                    title={cell.doc ? `${cell.doc}: ${cell.score}%` : `Slot #${i + 1}`}
                    className={`h-10 rounded-sm border flex items-center justify-center font-mono text-[10px] font-bold transition-all ${
                      cell.status === "high"
                        ? "bg-[#00FF66]/20 border-[#00FF66]/50 text-[#00FF66] shadow-[0_0_8px_rgba(0,255,102,0.2)]"
                        : cell.status === "mid"
                        ? "bg-amber-400/20 border-amber-400/50 text-amber-400"
                        : cell.status === "low"
                        ? "bg-red-500/20 border-red-500/50 text-red-400"
                        : "bg-zinc-900/60 border-zinc-800/40 text-zinc-700"
                    }`}
                  >
                    {cell.score ? `${cell.score}%` : ""}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      case "questions": {
        const sortedScores = quizScores.slice().reverse();
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg uppercase text-white tracking-wide">
                    Questions Answered Analytics
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Breakdown of Multiple Choice and Written questions answered across practice quizzes.
                  </p>
                </div>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Total Solved</span>
                <span className="text-xl font-black text-[#00FF66]">{totalQuestionsAnswered}</span>
              </div>
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Multiple Choice</span>
                <span className="text-xl font-black text-white">{totalMcAnswered}</span>
              </div>
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Written Questions</span>
                <span className="text-xl font-black text-white">{totalSaAnswered}</span>
              </div>
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Accuracy Rate</span>
                <span className="text-xl font-black text-[#00FF66]">{totalQuizzes > 0 ? `${avgScore}%` : "0%"}</span>
              </div>
            </div>

            {/* Questions Breakdown Bar Chart */}
            <div className="bg-[#0B0B0B] p-5 rounded-sm border border-zinc-800">
              <span className="text-xs font-mono font-extrabold uppercase text-zinc-300 block mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#00FF66]" />
                Questions Solved Breakdown Per Test Attempt
              </span>

              {sortedScores.length > 0 ? (
                <div className="space-y-3 font-mono text-xs">
                  {sortedScores.map((item, idx) => {
                    const mc = item.mcTotal || 0;
                    const sa = item.saTotal || 0;
                    const total = mc + sa || 1;
                    const mcWidth = Math.round((mc / total) * 100);
                    const saWidth = Math.round((sa / total) * 100);

                    return (
                      <div key={item.id || idx} className="bg-[#141414] p-3 rounded-sm border border-zinc-800/80">
                        <div className="flex items-center justify-between mb-1.5 text-[11px]">
                          <span className="font-bold text-zinc-200 truncate max-w-[200px]" title={item.documentName}>
                            {item.documentName}
                          </span>
                          <span className="text-zinc-400">
                            {item.totalQuestions || total} Questions ({item.scorePercent}%)
                          </span>
                        </div>
                        <div className="h-3 w-full bg-zinc-900 rounded-xs overflow-hidden flex">
                          <div
                            style={{ width: `${mcWidth}%` }}
                            className="bg-[#00FF66] h-full"
                            title={`MC: ${mc}`}
                          />
                          <div
                            style={{ width: `${saWidth}%` }}
                            className="bg-cyan-400 h-full"
                            title={`Written: ${sa}`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-zinc-500 mt-1">
                          <span>MC: <strong className="text-[#00FF66]">{item.mcCorrect}/{mc}</strong></span>
                          <span>Written: <strong className="text-cyan-400">{item.saFull !== undefined ? item.saFull : item.saCorrect}/{sa}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 font-mono text-xs uppercase">
                  No question logs recorded yet. Take a quiz to record stats.
                </div>
              )}
            </div>

            {/* Questions Solving Frequency Heatmap Grid */}
            <div className="bg-[#0B0B0B] p-5 rounded-sm border border-zinc-800">
              <span className="text-xs font-mono font-extrabold uppercase text-zinc-300 block mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00FF66]" />
                Questions Solved Activity Heatmap
              </span>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }).map((_, i) => {
                  const item = sortedScores[i];
                  const qCount = item ? item.totalQuestions || (item.mcTotal + item.saTotal) : 0;
                  return (
                    <div
                      key={i}
                      title={item ? `${item.documentName}: ${qCount} Questions` : `Empty Slot ${i + 1}`}
                      className={`h-10 rounded-sm border flex items-center justify-center font-mono text-[10px] font-bold ${
                        qCount > 8
                          ? "bg-[#00FF66]/30 border-[#00FF66] text-[#00FF66]"
                          : qCount > 0
                          ? "bg-[#00FF66]/15 border-[#00FF66]/40 text-[#00FF66]"
                          : "bg-zinc-900/60 border-zinc-800/40 text-zinc-700"
                      }`}
                    >
                      {qCount > 0 ? `${qCount} Qs` : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case "chat-history": {
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg uppercase text-white tracking-wide">
                    Chat History & Past Conversation Logs
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    View past chat history, message analytics, and Q&A interactions obtained from Chat with PDF.
                  </p>
                </div>
              </div>
            </div>

            {/* Stat Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Total Messages</span>
                <span className="text-xl font-black text-[#00FF66]">{totalChatMessages}</span>
              </div>
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">User Queries</span>
                <span className="text-xl font-black text-white">{userMessageCount}</span>
              </div>
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">AI Responses</span>
                <span className="text-xl font-black text-white">{aiMessageCount}</span>
              </div>
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Active Doc Chats</span>
                <span className="text-xl font-black text-[#00FF66]">{docChatCount}</span>
              </div>
            </div>

            {/* Past Chat Conversation History Logs Viewer */}
            <div className="bg-[#0B0B0B] p-5 rounded-sm border border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-extrabold uppercase text-zinc-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#00FF66]" />
                  Past Chat History Logs Obtained from Chat with PDF
                </span>
                <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
                  {totalChatMessages} MESSAGES LOGGED
                </span>
              </div>

              {chatEntries.length > 0 && totalChatMessages > 0 ? (
                <div className="space-y-6 max-h-[380px] overflow-y-auto pr-2 font-mono text-xs">
                  {chatEntries.map(([docId, msgs]) => {
                    if (!msgs || msgs.length === 0) return null;
                    const doc = documents.find((d) => d.id === docId);
                    const docName = doc ? doc.name : `Document #${docId.slice(0, 8)}`;

                    return (
                      <div key={docId} className="bg-[#141414] p-4 rounded-sm border border-zinc-800 flex flex-col gap-3">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-[#00FF66] shrink-0" />
                            <span className="font-extrabold text-white uppercase truncate text-xs" title={docName}>
                              {docName}
                            </span>
                            <span className="text-[9px] bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 px-2 py-0.5 rounded-sm font-bold">
                              {msgs.length} MSGS
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              selectDocument(docId);
                              setActiveModal(null);
                              setTab("chat");
                            }}
                            className="px-3 py-1 bg-zinc-900 hover:bg-[#00FF66] text-zinc-300 hover:text-black text-[10px] font-bold uppercase tracking-wider rounded-sm border border-zinc-800 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <span>Continue Chat</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Conversation Messages */}
                        <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                          {msgs.map((m) => {
                            const isUserMsg = m.role === "user";
                            return (
                              <div
                                key={m.id || Math.random()}
                                className={`p-3 rounded-sm border text-[11px] leading-relaxed ${
                                  isUserMsg
                                    ? "bg-[#090909] border-zinc-800 text-zinc-200"
                                    : "bg-[#0F1D15] border-[#00FF66]/20 text-zinc-100"
                                }`}
                              >
                                <div className="flex items-center justify-between text-[9px] text-zinc-500 uppercase mb-1 font-bold">
                                  <span className={isUserMsg ? "text-zinc-400" : "text-[#00FF66]"}>
                                    {isUserMsg ? "User Question:" : "PDF Scholar AI Answer:"}
                                  </span>
                                  <span>{m.timestamp || ""}</span>
                                </div>
                                <p className="whitespace-pre-wrap">{m.text}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 font-mono text-xs uppercase border border-dashed border-zinc-800 rounded-sm">
                  No past chat history logs found. Select a PDF document and open chat to start a conversation!
                </div>
              )}
            </div>

            {/* Chat Document Distribution */}
            <div className="bg-[#0B0B0B] p-5 rounded-sm border border-zinc-800">
              <span className="text-xs font-mono font-extrabold uppercase text-zinc-300 block mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#00FF66]" />
                Chat Messages Volume per Document
              </span>

              {chatEntries.length > 0 ? (
                <div className="space-y-3 font-mono text-xs">
                  {chatEntries.map(([docId, msgs]) => {
                    const doc = documents.find((d) => d.id === docId);
                    const docName = doc ? doc.name : `Document #${docId.slice(0, 6)}`;
                    const msgLen = msgs?.length || 0;
                    const maxMsgs = Math.max(...chatEntries.map(([_, m]) => m?.length || 0), 1);
                    const widthPct = Math.round((msgLen / maxMsgs) * 100);

                    return (
                      <div key={docId} className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-zinc-200 truncate max-w-[240px]" title={docName}>
                            {docName}
                          </span>
                          <span className="text-[#00FF66] font-extrabold">{msgLen} Messages</span>
                        </div>
                        <div className="h-2.5 w-full bg-zinc-900 rounded-xs overflow-hidden">
                          <div style={{ width: `${widthPct}%` }} className="bg-[#00FF66] h-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 font-mono text-xs uppercase">
                  No active chat history records yet. Start chatting with a PDF document!
                </div>
              )}
            </div>
          </div>
        );
      }

      case "chunks": {
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg uppercase text-white tracking-wide">
                    Reading Segments & Vector Index
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Distribution of indexed document sections and pages across study materials.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono">
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Total Chunks</span>
                <span className="text-xl font-black text-[#00FF66]">{totalChunks}</span>
              </div>
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Total Pages</span>
                <span className="text-xl font-black text-white">{totalPages}</span>
              </div>
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Documents</span>
                <span className="text-xl font-black text-white">{documents.length}</span>
              </div>
            </div>

            <div className="bg-[#0B0B0B] p-5 rounded-sm border border-zinc-800">
              <span className="text-xs font-mono font-extrabold uppercase text-zinc-300 block mb-4 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#00FF66]" />
                Vector Chunks per Document
              </span>
              <div className="space-y-3 font-mono text-xs">
                {documents.map((doc) => {
                  const maxChunks = Math.max(...documents.map((d) => d.chunkCount || 0), 1);
                  const widthPct = Math.round(((doc.chunkCount || 0) / maxChunks) * 100);
                  return (
                    <div key={doc.id} className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-zinc-200 truncate max-w-[240px]" title={doc.name}>
                          {doc.name}
                        </span>
                        <span className="text-[#00FF66] font-bold">{doc.chunkCount} Chunks</span>
                      </div>
                      <div className="h-2.5 w-full bg-zinc-900 rounded-xs overflow-hidden">
                        <div style={{ width: `${widthPct}%` }} className="bg-[#00FF66] h-full" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case "quizzes": {
        return (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[#00FF66]/10 border border-[#00FF66]/30 flex items-center justify-center text-[#00FF66]">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg uppercase text-white tracking-wide">
                    Quiz Assessments & Attempt History
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    Log of completed test assessments and practice quiz frequency.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Quizzes Completed</span>
                <span className="text-xl font-black text-[#00FF66]">{totalQuizzes}</span>
              </div>
              <div className="bg-[#141414] p-3 rounded-sm border border-zinc-800">
                <span className="text-[9px] text-zinc-500 uppercase font-bold block">Average Score</span>
                <span className="text-xl font-black text-white">{avgScore}%</span>
              </div>
            </div>

            <div className="bg-[#0B0B0B] p-5 rounded-sm border border-zinc-800">
              <span className="text-xs font-mono font-extrabold uppercase text-zinc-300 block mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00FF66]" />
                Attempt Frequency & Recent Results
              </span>
              <div className="space-y-3 font-mono text-xs">
                {quizScores.map((scoreItem) => (
                  <div key={scoreItem.id} className="bg-[#141414] p-3 rounded-sm border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-200 block text-xs" title={scoreItem.documentName}>
                        {scoreItem.documentName}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(scoreItem.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-sm font-black text-[#00FF66] bg-[#00FF66]/10 border border-[#00FF66]/30 px-3 py-1 rounded-sm">
                      {scoreItem.scorePercent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
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

      {/* Grid of Stats Cards: 3 Top Tiles + 3 Clickable Tiles Below */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-5 mb-10 relative z-10"
      >
        {/* Row 1: Primary 3 Clickable Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {primaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={`primary-${stat.id}`}
                whileHover={{ y: -3, borderColor: "#00FF66" }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveModal(stat.id)}
                className="bg-[#101010] p-6 rounded-sm border border-zinc-800/80 flex flex-col justify-between shadow-xl relative overflow-hidden group transition-all h-36 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                    {stat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {stat.badge && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider border bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30">
                        {stat.badge}
                      </span>
                    )}
                    <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-[#00FF66] group-hover:border-[#00FF66]/40 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-wider flex items-center justify-between">
                    <span>{stat.subtitle}</span>
                    <span className="text-[#00FF66] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      View Graph <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Row 2: Added 3 Requested Clickable Tiles Below Three Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {secondaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={`secondary-${stat.id}`}
                whileHover={{ y: -3, borderColor: "#00FF66" }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setActiveModal(stat.id)}
                className="bg-[#101010] p-6 rounded-sm border border-zinc-800/80 flex flex-col justify-between shadow-xl relative overflow-hidden group transition-all h-36 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-zinc-400 tracking-wider">
                    {stat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {stat.badge && (
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider border bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30">
                        {stat.badge}
                      </span>
                    )}
                    <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-[#00FF66] group-hover:border-[#00FF66]/40 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-2xl md:text-3xl font-black tracking-tight text-white leading-none">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-wider flex items-center justify-between truncate">
                    <span className="truncate">{stat.subtitle}</span>
                    <span className="text-[#00FF66] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0 ml-2">
                      View Graph <ChevronRight className="w-3 h-3" />
                    </span>
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

      {/* Interactive Analytics Graph & Heatmap Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#101010] border border-zinc-800 rounded-sm w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative text-white flex flex-col gap-6"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-sm transition-colors cursor-pointer"
                title="Close Window"
              >
                <X className="w-5 h-5" />
              </button>

              {renderModalContent(activeModal)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
