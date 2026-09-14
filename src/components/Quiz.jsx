import React, { useState, useEffect, useRef } from "react";
import { useAppState } from "../lib/state-context";
import {
  GraduationCap,
  Loader2,
  Award,
  ChevronRight,
  RotateCcw,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Trophy,
  Sliders,
  ArrowRight,
  Check,
  AlertTriangle,
  Send,
  HelpCircle,
  Sparkles
} from "lucide-react";
import VectorAIIcon from "./VectorAIIcon";
import { motion, AnimatePresence } from "motion/react";

export default function Quiz() {
  const {
    documents,
    selectedDocumentId,
    quizQuestions,
    setQuestions,
    authenticatedFetch,
    saveQuizResult,
    setTab
  } = useAppState();

  const [questionCount, setQuestionCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [answers, setAnswers] = useState({});
  const [revealedShortAnswers, setRevealedShortAnswers] = useState({});
  const [shortAnswersText, setShortAnswersText] = useState({});
  const [shortAnswerSelfGrades, setShortAnswerSelfGrades] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState(false);
  const containerRef = useRef(null);

  const activeDoc = documents.find(d => d.id === selectedDocumentId);

  // Scroll to top when results are shown
  useEffect(() => {
    if (showResults) {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [showResults]);

  const generateQuiz = async () => {
    if (!selectedDocumentId) return;
    setIsGenerating(true);
    setShowResults(false);
    setShowConfirmSubmitModal(false);
    setAnswers({});
    setRevealedShortAnswers({});
    setShortAnswersText({});
    setShortAnswerSelfGrades({});

    try {
      const res = await authenticatedFetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDocumentId,
          count: questionCount
        })
      });

      const data = await res.json();
      if (res.ok && data.questions) {
        setQuestions(data.questions);
      } else {
        alert(data.error || "Failed to generate quiz questions.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to synthesize quiz. Please check server connection.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMultipleChoiceSelect = (qId, optionText) => {
    if (answers[qId]) return; // locked once chosen
    setAnswers(prev => ({ ...prev, [qId]: optionText }));
  };

  const submitShortAnswer = (qId) => {
    if (!shortAnswersText[qId]?.trim()) return;
    setRevealedShortAnswers(prev => ({ ...prev, [qId]: true }));
    if (!shortAnswerSelfGrades[qId]) {
      setShortAnswerSelfGrades(prev => ({ ...prev, [qId]: "full" })); // default to full credit
    }
  };

  const handleSelfGrade = (qId, grade) => {
    setShortAnswerSelfGrades(prev => ({ ...prev, [qId]: grade }));
  };

  const calculateScore = () => {
    if (!quizQuestions || quizQuestions.length === 0) {
      return {
        earnedPoints: 0,
        totalPoints: 0,
        scorePercent: 0,
        mcCorrect: 0,
        mcTotal: 0,
        saFull: 0,
        saPartial: 0,
        saIncorrect: 0,
        saTotal: 0,
        totalCorrect: 0,
        totalQuestions: 0,
        mcPointsEarned: 0,
        mcPointsTotal: 0,
        saPointsEarned: 0,
        saPointsTotal: 0
      };
    }

    let mcCorrect = 0;
    let mcTotal = 0;
    let mcPointsEarned = 0;
    let mcPointsTotal = 0;

    let saFull = 0;
    let saPartial = 0;
    let saIncorrect = 0;
    let saTotal = 0;
    let saPointsEarned = 0;
    let saPointsTotal = 0;

    quizQuestions.forEach(q => {
      const qPoints = q.points || (q.type === "multiple-choice" ? 10 : 15);
      if (q.type === "multiple-choice") {
        mcTotal++;
        mcPointsTotal += qPoints;
        if (answers[q.id]?.trim() === q.correctAnswer?.trim()) {
          mcCorrect++;
          mcPointsEarned += qPoints;
        }
      } else {
        saTotal++;
        saPointsTotal += qPoints;
        const grade = shortAnswerSelfGrades[q.id];
        if (grade === "full" || grade === "correct") {
          saFull++;
          saPointsEarned += qPoints;
        } else if (grade === "partial" || grade === "needs-review") {
          saPartial++;
          saPointsEarned += Math.round(qPoints * 0.5);
        } else if (grade === "incorrect" || grade === "zero") {
          saIncorrect++;
        }
      }
    });

    const earnedPoints = mcPointsEarned + saPointsEarned;
    const totalPoints = mcPointsTotal + saPointsTotal;
    const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    return {
      mcCorrect,
      mcTotal,
      saFull,
      saPartial,
      saIncorrect,
      saTotal,
      mcPointsEarned,
      mcPointsTotal,
      saPointsEarned,
      saPointsTotal,
      earnedPoints,
      totalPoints,
      scorePercent,
      totalCorrect: mcCorrect + saFull,
      totalQuestions: quizQuestions.length
    };
  };

  const unansweredCount = quizQuestions.filter(q => {
    if (q.type === "multiple-choice") {
      return !answers[q.id];
    } else {
      return !shortAnswerSelfGrades[q.id];
    }
  }).length;

  const handleSubmitClick = () => {
    if (unansweredCount > 0) {
      setShowConfirmSubmitModal(true);
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    setShowConfirmSubmitModal(false);
    const scores = calculateScore();
    const result = {
      documentId: selectedDocumentId,
      documentName: activeDoc?.name || "Study Document",
      docName: activeDoc?.name || "Study Document",
      mcCorrect: scores.mcCorrect,
      mcTotal: scores.mcTotal,
      saFull: scores.saFull,
      saPartial: scores.saPartial,
      saIncorrect: scores.saIncorrect,
      saTotal: scores.saTotal,
      totalCorrect: scores.totalCorrect,
      totalQuestions: scores.totalQuestions,
      mcPointsEarned: scores.mcPointsEarned,
      mcPointsTotal: scores.mcPointsTotal,
      saPointsEarned: scores.saPointsEarned,
      saPointsTotal: scores.saPointsTotal,
      earnedPoints: scores.earnedPoints,
      totalPoints: scores.totalPoints,
      scorePercent: scores.scorePercent,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString()
    };

    saveQuizResult(result);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setAnswers({});
    setRevealedShortAnswers({});
    setShortAnswersText({});
    setShortAnswerSelfGrades({});
    setShowResults(false);
    setShowConfirmSubmitModal(false);
  };

  if (!selectedDocumentId) {
    return (
      <div className="flex-1 pt-16 md:pt-0 px-4 sm:px-8 bg-dot-grid flex flex-col justify-center items-center min-h-0 select-none relative z-0" id="quiz-view">
        <div className="ambient-glow ambient-glow-amber w-[400px] h-[400px] animate-float-slow" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm glass-card bg-noise p-10 rounded-2xl relative z-10"
        >
          <div className="w-16 h-16 bg-white/5 border border-white/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <BrainCircuit className="w-8 h-8 drop-shadow-md" />
          </div>
          <h3 className="font-extrabold text-white text-lg uppercase tracking-wider">No Document Selected</h3>
          <p className="text-xs text-zinc-400 font-mono uppercase mt-2 mb-6 leading-relaxed">
            Select a document from the sidebar or upload a PDF to take a practice quiz.
          </p>
        </motion.div>
      </div>
    );
  }

  const scores = calculateScore();
  const answeredCount = quizQuestions.length - unansweredCount;

  return (
    <div 
      ref={containerRef}
      className="flex-1 pt-14 md:pt-6 px-4 sm:px-6 md:px-10 pb-12 bg-dot-grid overflow-y-auto min-h-0 select-text-content relative z-0" 
      id="quiz-view"
    >
      {/* Ambient Glows */}
      <div className="ambient-glow ambient-glow-amber w-[450px] h-[450px] top-[-80px] right-[-80px]" />
      <div className="ambient-glow ambient-glow-green w-[400px] h-[400px] bottom-[10%] left-[-50px]" />
      
      {/* Top Header */}
      <div className="mb-8 border-b border-white/5 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2.5 drop-shadow-sm">
            <VectorAIIcon className="w-5 h-5 text-amber-400" />
            Practice Quiz & Self-Check
          </h2>
          <p className="text-xs text-zinc-400 font-mono uppercase mt-1">
            Studying: <strong className="text-amber-400">"{activeDoc?.name}"</strong>
          </p>
        </div>

        {quizQuestions.length > 0 && !isGenerating && (
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateQuiz}
              className="inline-flex items-center gap-2 px-4 py-2 glass-card hover:bg-white/5 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Regenerate Quiz</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Generating Loader */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-24 text-center max-w-md mx-auto glass-card bg-noise p-10 rounded-2xl relative z-10 shadow-2xl"
          id="quiz-loader"
        >
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          </div>
          <h3 className="font-extrabold text-white text-lg uppercase tracking-wider">Creating {questionCount} Questions</h3>
          <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto font-mono uppercase leading-relaxed">
            Reading your PDF and preparing helpful questions to test your knowledge...
          </p>
        </motion.div>
      )}

      {/* Initial Landing Screen - Question Selector */}
      {quizQuestions.length === 0 && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-10 max-w-md mx-auto glass-card bg-noise p-6 sm:p-8 rounded-2xl relative z-10 shadow-2xl"
        >
          <div className="w-16 h-16 bg-white/5 border border-white/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <GraduationCap className="w-8 h-8 drop-shadow-md" />
          </div>
          <h3 className="font-black text-white text-2xl uppercase tracking-wide">Create Practice Quiz</h3>
          <p className="text-xs text-zinc-400 font-mono uppercase mt-2 mb-6 leading-relaxed">
            Take a scored practice quiz based on <span className="text-amber-400">"{activeDoc?.name}"</span>.
          </p>

          <div className="space-y-6 bg-black/40 border border-white/5 p-6 rounded-xl text-left shadow-inner">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase text-zinc-300 font-mono flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  Question Count:
                </span>
                <span className="text-sm font-black text-amber-400 font-mono bg-amber-400/10 px-3 py-1 border border-amber-400/30 rounded-lg shadow-inner">
                  {questionCount} Qs
                </span>
              </div>

              {/* Slider for 1 to 20 questions */}
              <input
                type="range"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                <span>1 Q</span>
                <span>5 Qs</span>
                <span>10 Qs</span>
                <span>15 Qs</span>
                <span>20 Qs</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block mb-2">
                Quick Presets:
              </span>
              <div className="grid grid-cols-5 gap-2">
                {[3, 5, 10, 15, 20].map(num => (
                  <button
                    key={num}
                    onClick={() => setQuestionCount(num)}
                    className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                      questionCount === num
                        ? "bg-amber-400 border-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateQuiz}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Create Practice Quiz Now</span>
              <Sparkles className="w-4 h-4 text-black" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Live Points Tracker Banner with Submit Button */}
      {quizQuestions.length > 0 && !isGenerating && !showResults && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto mb-6 glass-card bg-noise p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl sticky top-4 z-20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/5 border border-white/10 text-amber-400 rounded-full flex items-center justify-center shadow-inner">
              <Trophy className="w-5 h-5 drop-shadow-md" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Live Points Score</div>
              <div className="text-lg font-black text-white font-mono flex items-center gap-2">
                <span>{scores.earnedPoints} / {scores.totalPoints} PTS</span>
                <span className="text-xs text-amber-400 font-bold">({scores.scorePercent}%)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-zinc-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <strong className="text-white">{answeredCount}</strong> / {quizQuestions.length} Answered
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmitClick}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all cursor-pointer flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-black" />
              <span>Submit Quiz</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Confirmation Modal if submitted with unanswered questions */}
      <AnimatePresence>
        {showConfirmSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-card bg-noise max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-2xl text-center space-y-5"
            >
              <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <h3 className="font-extrabold text-white text-lg uppercase tracking-wider">Unanswered Questions</h3>
              
              <p className="text-xs text-zinc-400 font-mono uppercase leading-relaxed bg-black/40 p-4 rounded-xl border border-white/5">
                You have <strong className="text-red-400">{unansweredCount}</strong> unanswered question(s).
                <br />
                Submitting now calculates your final score based on completed responses.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowConfirmSubmitModal(false)}
                  className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Return to Quiz
                </button>
                <button
                  onClick={handleFinishQuiz}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all cursor-pointer"
                >
                  Submit Anyway
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Active Questions List */}
      {quizQuestions.length > 0 && !isGenerating && !showResults && (
        <div className="max-w-3xl mx-auto space-y-6 relative z-10" id="questions-list">
          {quizQuestions.map((q, index) => {
            const qPoints = q.points || (q.type === "multiple-choice" ? 10 : 15);
            const hasAnsweredMC = !!answers[q.id];
            const isCorrectMC = answers[q.id]?.trim() === q.correctAnswer?.trim();
            const revealedSA = !!revealedShortAnswers[q.id];
            const gradedSA = shortAnswerSelfGrades[q.id];

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card bg-noise rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-5 overflow-hidden relative"
              >
                {/* Accent Top Border */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-300" />
                
                {/* Badge and question text with Points indicator */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider bg-white/5 text-amber-400 border border-white/10 px-3 py-1.5 rounded-full uppercase shadow-inner">
                    Question {index + 1} of {quizQuestions.length}
                  </span>
                  
                  {/* Point Badge */}
                  <span className={`text-[10px] font-mono font-black px-3 py-1.5 rounded-full uppercase border tracking-wider shadow-inner ${
                    q.type === "multiple-choice"
                      ? hasAnsweredMC
                        ? isCorrectMC
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                          : "bg-red-500/20 border-red-500/50 text-red-400"
                        : "bg-white/5 border-white/10 text-zinc-300"
                      : revealedSA && gradedSA
                        ? gradedSA === "full" || gradedSA === "correct"
                          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                          : gradedSA === "partial" || gradedSA === "needs-review"
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                          : "bg-red-500/20 border-red-500/50 text-red-400"
                        : "bg-white/5 border-white/10 text-zinc-300"
                  }`}>
                    {q.type === "multiple-choice" && hasAnsweredMC ? (
                      isCorrectMC ? `+${qPoints} PTS EARNED` : `0 / ${qPoints} PTS`
                    ) : q.type === "short-answer" && revealedSA && gradedSA ? (
                      gradedSA === "full" || gradedSA === "correct"
                        ? `+${qPoints} PTS (FULL CREDIT)`
                        : gradedSA === "partial" || gradedSA === "needs-review"
                        ? `+${Math.round(qPoints * 0.5)} PTS (PARTIAL CREDIT)`
                        : `0 / ${qPoints} PTS (NO CREDIT)`
                    ) : (
                      `WORTH ${qPoints} PTS`
                    )}
                  </span>
                </div>

                <h4 className="font-bold text-white text-base md:text-lg leading-relaxed normal-case">
                  {q.question}
                </h4>

                {/* Multiple Choice Answers */}
                {q.type === "multiple-choice" && (
                  <div className="grid grid-cols-1 gap-3 mt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === opt;
                      const isCorrectOption = opt?.trim() === q.correctAnswer?.trim();
                      const shouldHighlightGreen = hasAnsweredMC && isCorrectOption;
                      const shouldHighlightRed = hasAnsweredMC && isSelected && !isCorrectMC;

                      return (
                        <motion.button
                          key={optIdx}
                          whileHover={!hasAnsweredMC ? { x: 3 } : {}}
                          whileTap={!hasAnsweredMC ? { scale: 0.99 } : {}}
                          disabled={hasAnsweredMC}
                          onClick={() => handleMultipleChoiceSelect(q.id, opt)}
                          className={`w-full text-left p-4 rounded-xl border text-xs font-medium tracking-wide transition-all cursor-pointer ${
                            shouldHighlightGreen
                              ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                              : shouldHighlightRed
                              ? "bg-red-500/20 border-red-500/50 text-red-400"
                              : isSelected
                              ? "bg-amber-400/20 border-amber-400/50 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                              : hasAnsweredMC
                              ? "bg-black/40 border-white/5 text-zinc-600 cursor-not-allowed"
                              : "glass-card border-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/5"
                          }`}
                        >
                          <span className="font-mono text-xs mr-2 opacity-50">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Written Question Input & Scoring */}
                {q.type === "short-answer" && (
                  <div className="space-y-4 mt-1">
                    {!revealedSA ? (
                      <div className="flex flex-col gap-3">
                        <textarea
                          placeholder="Type your detailed written answer here..."
                          value={shortAnswersText[q.id] || ""}
                          onChange={(e) => setShortAnswersText(prev => ({ ...prev, [q.id]: e.target.value }))}
                          rows={3}
                          className="w-full text-xs p-4 border border-white/10 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 bg-black/40 text-white font-sans placeholder-zinc-500 shadow-inner"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => submitShortAnswer(q.id)}
                          disabled={!(shortAnswersText[q.id] || "").trim()}
                          className="self-end inline-flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                        >
                          <span>Check Answer & Compare</span>
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    ) : (
                      <div className="glass-card bg-noise border-l-2 border-l-amber-400 p-6 rounded-xl space-y-5 font-mono uppercase text-xs">
                        <div>
                          <div className="text-[10px] text-amber-400 font-bold tracking-wider mb-2">YOUR WRITTEN RESPONSE:</div>
                          <div className="text-white italic font-mono bg-black/40 p-4 border border-white/5 rounded-xl shadow-inner">
                            "{shortAnswersText[q.id]}"
                          </div>
                        </div>
                        
                        <div className="border-t border-white/10 pt-4">
                           <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-widest block mb-2 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Ideal Model Target Answer:
                           </span>
                           <p className="text-zinc-300 leading-relaxed font-sans normal-case bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 shadow-inner">{q.correctAnswer}</p>
                        </div>

                        {/* Self Grading buttons */}
                        <div className="border-t border-white/10 pt-4">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] text-zinc-400 font-bold tracking-wider flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-amber-400" /> Select Points Credit:
                            </span>
                            {gradedSA && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                                Selected: {gradedSA === "full" || gradedSA === "correct" ? "Full Credit (100%)" : gradedSA === "partial" || gradedSA === "needs-review" ? "Partial Credit (50%)" : "No Credit (0%)"}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <button
                              onClick={() => handleSelfGrade(q.id, "full")}
                              className={`py-3 px-4 text-[10px] font-bold rounded-xl border transition-all tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
                                gradedSA === "full" || gradedSA === "correct"
                                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                  : "glass-card hover:bg-white/5 border-white/10 text-zinc-300"
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Full (+{qPoints})</span>
                            </button>

                            <button
                              onClick={() => handleSelfGrade(q.id, "partial")}
                              className={`py-3 px-4 text-[10px] font-bold rounded-xl border transition-all tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
                                gradedSA === "partial" || gradedSA === "needs-review"
                                  ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                                  : "glass-card hover:bg-white/5 border-white/10 text-zinc-300"
                              }`}
                            >
                              <HelpCircle className="w-4 h-4" />
                              <span>Partial (+{Math.round(qPoints * 0.5)})</span>
                            </button>

                            <button
                              onClick={() => handleSelfGrade(q.id, "incorrect")}
                              className={`py-3 px-4 text-[10px] font-bold rounded-xl border transition-all tracking-wider flex items-center justify-center gap-2 cursor-pointer ${
                                gradedSA === "incorrect"
                                  ? "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                                  : "glass-card hover:bg-white/5 border-white/10 text-zinc-300"
                              }`}
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Zero (0)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation Reveal */}
                {((q.type === "multiple-choice" && hasAnsweredMC) || (q.type === "short-answer" && revealedSA)) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-black/40 p-4 border border-white/5 rounded-xl flex items-start gap-3 mt-1 text-[11px] font-mono uppercase"
                  >
                    <BookOpen className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block mb-1 tracking-wider">Concept Context:</span>
                      <p className="text-zinc-400 leading-relaxed font-sans normal-case">{q.explanation}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center pt-8 pb-12 relative z-10">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmitClick}
              className="px-10 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-sm uppercase tracking-wider rounded-xl shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-all cursor-pointer flex items-center gap-3"
            >
              <Trophy className="w-5 h-5 drop-shadow-sm" />
              <span>Submit Quiz & View Evaluation</span>
            </motion.button>
            <span className="text-[10px] font-mono text-zinc-500 uppercase mt-4 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Calculates diagnostic score and saves to your Study Hub Dashboard
            </span>
          </motion.div>
        </div>
      )}

      {/* Structured Evaluation & Results View */}
      {showResults && (
        <div className="max-w-3xl mx-auto space-y-8 relative z-10 pb-16" id="quiz-results">
          {/* Top Scorecard Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card bg-noise rounded-2xl p-8 md:p-10 text-center shadow-2xl relative overflow-hidden border-t-2 border-t-amber-400"
          >
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
              <Award className="w-10 h-10 drop-shadow-md" />
            </div>
            
            <h3 className="font-black text-white text-2xl md:text-3xl uppercase tracking-tight">Quiz Evaluation Report</h3>
            <p className="text-xs text-zinc-400 font-mono uppercase mt-1.5 max-w-sm mx-auto">
              Diagnostic performance for <strong className="text-amber-400">"{activeDoc?.name}"</strong>
            </p>

            {/* Score & Points Grid */}
            <div className="my-6 p-6 bg-black/40 border border-white/5 rounded-2xl relative overflow-hidden">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold mb-1">
                Final Score Achieved
              </div>
              <div className={`text-5xl md:text-6xl font-black font-mono tracking-tight my-2 ${
                scores.scorePercent >= 80 ? "text-emerald-400" : scores.scorePercent >= 60 ? "text-amber-400" : "text-rose-400"
              }`}>
                {scores.scorePercent}%
              </div>
              <div className="text-xs font-mono font-bold text-zinc-300">
                Points Earned: <span className="text-amber-400 font-black">{scores.earnedPoints} / {scores.totalPoints} PTS</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6">
              <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center shadow-inner">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase mb-1.5 tracking-wider font-bold">Multiple Choice</span>
                <div className="text-2xl font-black text-emerald-400 tracking-tight">{scores.mcCorrect} / {scores.mcTotal}</div>
                <span className="text-[10px] font-mono text-zinc-500 block mt-1">{scores.mcPointsEarned} / {scores.mcPointsTotal} PTS</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center shadow-inner">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase mb-1.5 tracking-wider font-bold">Written Questions</span>
                <div className="text-lg font-black text-amber-400 tracking-tight mt-1">
                  {scores.saFull} Full • {scores.saPartial} Partial
                </div>
                <span className="text-[10px] font-mono text-zinc-500 block mt-1">{scores.saPointsEarned} / {scores.saPointsTotal} PTS</span>
              </div>
            </div>

            {/* Top Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={resetQuiz}
                className="py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(251,191,36,0.25)] cursor-pointer"
              >
                Retry Same Quiz
              </motion.button>
              
              <button
                onClick={generateQuiz}
                className="py-3.5 glass-card hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
              >
                New Quiz ({questionCount} Qs)
              </button>

              <button
                onClick={() => setTab("overview")}
                className="py-3.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Dashboard Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

          {/* Detailed Question Review List */}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2 border-b border-white/5 pb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Detailed Question-by-Question Review
            </h4>

            {quizQuestions.map((q, index) => {
              const qPoints = q.points || (q.type === "multiple-choice" ? 10 : 15);
              const isMC = q.type === "multiple-choice";
              const userMCAns = answers[q.id];
              const isCorrectMC = userMCAns?.trim() === q.correctAnswer?.trim();
              
              const gradedSA = shortAnswerSelfGrades[q.id];
              const isFullSA = gradedSA === "full" || gradedSA === "correct";
              const isPartialSA = gradedSA === "partial" || gradedSA === "needs-review";
              
              const isCorrect = isMC ? isCorrectMC : isFullSA;
              const isPartial = !isMC && isPartialSA;

              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-6 rounded-2xl border-l-4 glass-card bg-noise space-y-4 ${
                    isCorrect ? "border-l-emerald-400" : isPartial ? "border-l-amber-400" : "border-l-rose-500"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isCorrect ? "bg-emerald-500/20 text-emerald-400" : isPartial ? "bg-amber-500/20 text-amber-400" : "bg-rose-500/20 text-rose-400"
                      }`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : isPartial ? <HelpCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      <span className="text-xs font-black uppercase text-zinc-300 font-mono">Question {index + 1}</span>
                    </div>
                    
                    <div className="text-[10px] font-mono font-black uppercase bg-black/40 px-3 py-1.5 rounded-full border border-white/5 text-zinc-300">
                      {isCorrect ? `+${qPoints} PTS` : isPartial ? `+${Math.round(qPoints * 0.5)} PTS` : `0 / ${qPoints} PTS`}
                    </div>
                  </div>
                  
                  <h5 className="font-bold text-white text-base leading-relaxed normal-case">{q.question}</h5>
                  
                  {isMC ? (
                    <div className="space-y-2.5">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userMCAns === opt;
                        const isActualCorrect = q.correctAnswer?.trim() === opt?.trim();
                        
                        let optStyle = "bg-black/30 border-white/5 text-zinc-400";
                        if (isActualCorrect) optStyle = "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.15)]";
                        else if (isSelected && !isActualCorrect) optStyle = "bg-rose-500/15 border-rose-500/50 text-rose-400 font-bold line-through opacity-80";

                        return (
                          <div key={optIdx} className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-sans ${optStyle}`}>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-mono shrink-0 ${
                              isActualCorrect ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" : isSelected ? "border-rose-400 bg-rose-500/20 text-rose-400" : "border-zinc-700 bg-transparent text-zinc-500"
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-xs">
                        <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1.5 font-bold">Your Response:</div>
                        <div className="text-zinc-200 italic font-sans">{shortAnswersText[q.id] || "No response provided."}</div>
                      </div>
                      
                      <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20 text-xs">
                        <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ideal Model Target Answer:
                        </div>
                        <div className="text-zinc-200 font-sans">{q.correctAnswer}</div>
                      </div>
                    </div>
                  )}

                  {/* Context block */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-xs font-sans text-zinc-300 leading-relaxed">
                    <strong className="font-mono text-[10px] uppercase text-amber-400 block mb-1 tracking-wider">Concept Context:</strong>
                    <p className="whitespace-pre-wrap">{q.explanation || "No explanation provided."}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
