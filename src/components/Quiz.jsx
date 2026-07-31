import React, { useState } from "react";
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
  HelpCircle
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

  const activeDoc = documents.find(d => d.id === selectedDocumentId);

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
          count: questionCount,
        }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
      }
    } catch (err) {
      console.error("Failed to generate quiz:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMultipleChoiceSelect = (qId, option) => {
    if (answers[qId]) return;
    setAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const submitShortAnswer = (qId) => {
    setRevealedShortAnswers(prev => ({
      ...prev,
      [qId]: true
    }));
  };

  const handleSelfGrade = (qId, grade) => {
    setShortAnswerSelfGrades(prev => ({
      ...prev,
      [qId]: grade
    }));
  };

  const calculateScore = () => {
    let mcTotal = 0;
    let mcCorrect = 0;
    let saTotal = 0;
    let saFull = 0;
    let saPartial = 0;
    let saIncorrect = 0;

    let mcPointsEarned = 0;
    let mcPointsTotal = 0;
    let saPointsEarned = 0;
    let saPointsTotal = 0;

    quizQuestions.forEach(q => {
      const qPoints = q.points || (q.type === "multiple-choice" ? 10 : 15);

      if (q.type === "multiple-choice") {
        mcTotal++;
        mcPointsTotal += qPoints;
        if (answers[q.id] === q.correctAnswer) {
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
          saPointsEarned += Math.round(qPoints * 0.5); // 50% credit for partial score
        } else if (grade === "incorrect") {
          saIncorrect++;
        }
      }
    });

    const totalPoints = mcPointsTotal + saPointsTotal;
    const earnedPoints = mcPointsEarned + saPointsEarned;
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
      documentName: activeDoc?.name || "Document",
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
      <div className="flex-1 p-8 bg-[#080808] flex flex-col justify-center items-center min-h-0 select-none" id="quiz-view">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm border border-zinc-800 bg-[#101010] p-10 rounded-sm shadow-2xl"
        >
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 text-[#00FF66] rounded-sm flex items-center justify-center mx-auto mb-5 shadow-lg">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-white text-lg uppercase tracking-wider">No Active Target</h3>
          <p className="text-xs text-zinc-400 font-mono uppercase mt-2 mb-6 leading-relaxed">
            Activate a target from the dashboard or upload a PDF to synthesize diagnostic quizzes.
          </p>
        </motion.div>
      </div>
    );
  }

  const scores = calculateScore();
  const answeredCount = quizQuestions.length - unansweredCount;

  return (
    <div className="flex-1 p-8 bg-[#080808] overflow-y-auto min-h-0 select-none relative" id="quiz-view">
      {/* Header */}
      <div className="mb-8 border-b border-zinc-800/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2.5">
            <VectorAIIcon className="w-5 h-5 text-[#00FF66]" />
            Practice Quiz & Evaluation
          </h2>
          <p className="text-xs text-[#00FF66] font-mono uppercase mt-1">
            DEPLOYED ON: "{activeDoc?.name}"
          </p>
        </div>

        {quizQuestions.length > 0 && !isGenerating && (
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateQuiz}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#121212] hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-bold uppercase tracking-wider rounded-sm transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Regenerate Quiz</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Generating state */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="py-24 text-center max-w-md mx-auto bg-[#101010] border border-zinc-800 p-10 rounded-sm shadow-2xl"
          id="quiz-loader"
        >
          <Loader2 className="w-12 h-12 text-[#00FF66] animate-spin mx-auto mb-5" />
          <h3 className="font-extrabold text-white text-lg uppercase tracking-wider">Creating {questionCount} Questions</h3>
          <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto font-mono uppercase leading-relaxed">
            Extracting document sections & constructing scored diagnostic questions...
          </p>
        </motion.div>
      )}

      {/* Initial Landing Screen - Question Selector (Up to 20 questions) */}
      {quizQuestions.length === 0 && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 max-w-md mx-auto bg-[#101010] border border-zinc-800/90 p-8 rounded-sm shadow-2xl"
        >
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 text-[#00FF66] rounded-sm flex items-center justify-center mx-auto mb-5 shadow-xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="font-black text-white text-2xl uppercase tracking-wide">Generate Quiz</h3>
          <p className="text-xs text-zinc-400 font-mono uppercase mt-2 mb-8 leading-relaxed">
            Synthesize scored practice questions based on <span className="text-[#00FF66]">"{activeDoc?.name}"</span>.
          </p>

          <div className="space-y-6 bg-[#0A0A0A] border border-zinc-800 p-6 rounded-sm text-left">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-extrabold uppercase text-zinc-300 font-mono flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#00FF66]" />
                  Select Questions Count:
                </span>
                <span className="text-sm font-black text-[#00FF66] font-mono bg-[#00FF66]/10 px-3 py-1 border border-[#00FF66]/30 rounded-sm">
                  {questionCount} Questions
                </span>
              </div>

              {/* Slider for 1 to 20 questions */}
              <input
                type="range"
                min="1"
                max="20"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 5)}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#00FF66]"
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
                    className={`py-2 rounded-sm text-xs font-mono font-bold transition-all border ${
                      questionCount === num
                        ? "bg-[#00FF66] border-[#00FF66] text-black shadow-[0_0_12px_rgba(0,255,102,0.3)]"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-zinc-800/80 pt-4 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span>Point System:</span>
              <span className="text-[#00FF66] font-bold">MC = 10 PTS • SA = 15 PTS</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateQuiz}
              className="w-full py-4 bg-[#00FF66] hover:bg-[#00e55b] text-black font-black text-xs uppercase tracking-wider rounded-sm transition-all shadow-[0_0_20px_rgba(0,255,102,0.25)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Generate {questionCount} Question Quiz</span>
              <VectorAIIcon className="w-4 h-4 text-black" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Live Points Tracker Banner with Submit Button */}
      {quizQuestions.length > 0 && !isGenerating && !showResults && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto mb-6 bg-[#101010] border border-zinc-800 p-4 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl sticky top-0 z-20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] rounded-sm flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">Live Points Score</div>
              <div className="text-lg font-black text-white font-mono flex items-center gap-2">
                <span>{scores.earnedPoints} / {scores.totalPoints} PTS</span>
                <span className="text-xs text-[#00FF66] font-bold">({scores.scorePercent}%)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-zinc-400">
              Progress: <strong className="text-white">{answeredCount}/{quizQuestions.length} Answered</strong>
            </div>

            {/* Always visible Submit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmitClick}
              className="px-5 py-2.5 bg-[#00FF66] hover:bg-[#00e55b] text-black font-extrabold text-xs uppercase tracking-wider rounded-sm shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all cursor-pointer flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-black fill-black" />
              <span>Submit Quiz</span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Confirmation Modal if submitted with unanswered questions */}
      <AnimatePresence>
        {showConfirmSubmitModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#101010] border border-zinc-800 max-w-md w-full p-6 rounded-sm shadow-2xl text-center space-y-4"
            >
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-sm flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="font-extrabold text-white text-lg uppercase tracking-wider">Unanswered Questions Remaining</h3>
              
              <p className="text-xs text-zinc-400 font-mono uppercase leading-relaxed">
                You have <strong className="text-amber-400">{unansweredCount}</strong> unanswered or un-graded question(s) out of {quizQuestions.length}.
                <br />
                Submitting now will calculate your final score based on your current completed answers.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowConfirmSubmitModal(false)}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                >
                  Continue Quiz
                </button>
                <button
                  onClick={handleFinishQuiz}
                  className="flex-1 py-3 bg-[#00FF66] hover:bg-[#00e55b] text-black font-extrabold text-xs uppercase tracking-wider rounded-sm shadow-[0_0_15px_rgba(0,255,102,0.3)] transition-all cursor-pointer"
                >
                  Submit & Calculate Score
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Questions List */}
      {quizQuestions.length > 0 && !isGenerating && !showResults && (
        <div className="max-w-3xl mx-auto space-y-6" id="questions-list">
          {quizQuestions.map((q, index) => {
            const qPoints = q.points || (q.type === "multiple-choice" ? 10 : 15);
            const hasAnsweredMC = !!answers[q.id];
            const isCorrectMC = answers[q.id] === q.correctAnswer;
            const revealedSA = !!revealedShortAnswers[q.id];
            const gradedSA = shortAnswerSelfGrades[q.id];

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#101010] border border-zinc-800/80 rounded-sm p-6 md:p-8 shadow-xl flex flex-col gap-4"
              >
                {/* Badge and question text with Points indicator */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider bg-black text-[#00FF66] border border-[#00FF66]/20 px-2.5 py-1 rounded-sm uppercase">
                    Q{index + 1} of {quizQuestions.length} • {q.type === "multiple-choice" ? "Multiple Choice" : "Written Question (Short Answer)"}
                  </span>
                  
                  {/* Point Badge */}
                  <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-sm uppercase border tracking-wider ${
                    q.type === "multiple-choice"
                      ? hasAnsweredMC
                        ? isCorrectMC
                          ? "bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]"
                          : "bg-red-500/20 border-red-500 text-red-400"
                        : "bg-zinc-900 border-zinc-800 text-amber-400"
                      : revealedSA && gradedSA
                        ? gradedSA === "full" || gradedSA === "correct"
                          ? "bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]"
                          : gradedSA === "partial" || gradedSA === "needs-review"
                          ? "bg-amber-500/20 border-amber-500 text-amber-400"
                          : "bg-red-500/20 border-red-500 text-red-400"
                        : "bg-zinc-900 border-zinc-800 text-amber-400"
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

                <h4 className="font-extrabold text-white text-base uppercase tracking-tight leading-relaxed">
                  {q.question}
                </h4>

                {/* Multiple Choice Answers */}
                {q.type === "multiple-choice" && (
                  <div className="grid grid-cols-1 gap-3 mt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === opt;
                      const isCorrectOption = opt === q.correctAnswer;
                      const shouldHighlightGreen = hasAnsweredMC && isCorrectOption;
                      const shouldHighlightRed = hasAnsweredMC && isSelected && !isCorrectMC;

                      return (
                        <motion.button
                          key={optIdx}
                          whileHover={!hasAnsweredMC ? { x: 3 } : {}}
                          whileTap={!hasAnsweredMC ? { scale: 0.99 } : {}}
                          disabled={hasAnsweredMC}
                          onClick={() => handleMultipleChoiceSelect(q.id, opt)}
                          className={`w-full text-left p-4 rounded-sm border text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                            shouldHighlightGreen
                              ? "bg-[#00FF66] border-[#00FF66] text-black shadow-[0_0_15px_rgba(0,255,102,0.2)]"
                              : shouldHighlightRed
                              ? "bg-red-600 border-red-600 text-white"
                              : isSelected
                              ? "bg-zinc-800 border-white text-white"
                              : hasAnsweredMC
                              ? "bg-[#0A0A0A] border-zinc-800 text-zinc-600 cursor-not-allowed"
                              : "bg-[#0E0E0E] border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-[#141414]"
                          }`}
                        >
                          <span className="font-mono text-xs mr-2 text-zinc-500">
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
                          className="w-full text-xs p-3.5 px-4 border border-zinc-800 rounded-sm focus:outline-none focus:border-[#00FF66] bg-[#0A0A0A] text-white font-mono uppercase placeholder-zinc-600"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => submitShortAnswer(q.id)}
                          disabled={!(shortAnswersText[q.id] || "").trim()}
                          className="self-end inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#00FF66] hover:bg-[#00e55b] disabled:opacity-30 disabled:cursor-not-allowed text-black font-extrabold text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer"
                        >
                          <span>Check Written Answer & Evaluate</span>
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    ) : (
                      <div className="bg-[#0A0A0A] border border-zinc-800 p-5 rounded-sm space-y-4 font-mono uppercase text-xs">
                        <div>
                          <div className="text-[10px] text-zinc-500 font-bold tracking-wider mb-1">YOUR WRITTEN RESPONSE:</div>
                          <div className="text-white italic font-mono bg-black/50 p-3 border border-zinc-800/80 rounded-sm">
                            "{shortAnswersText[q.id]}"
                          </div>
                        </div>
                        
                        <div className="border-t border-zinc-800 pt-4">
                           <span className="text-[10px] font-mono font-bold text-[#00FF66] tracking-widest block mb-1">Answer Key & Grading Criteria:</span>
                           <p className="text-zinc-300 leading-relaxed font-sans normal-case">{q.correctAnswer}</p>
                        </div>

                        {/* Self Grading buttons with Full Points, Partial Points, No Points */}
                        <div className="border-t border-zinc-800 pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] text-zinc-400 font-bold tracking-wider">Select Points Credit:</span>
                            {gradedSA && (
                              <span className="text-[10px] font-bold text-[#00FF66]">
                                Selected: {gradedSA === "full" || gradedSA === "correct" ? "Full Credit (100%)" : gradedSA === "partial" || gradedSA === "needs-review" ? "Partial Credit (50%)" : "No Credit (0%)"}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <button
                              onClick={() => handleSelfGrade(q.id, "full")}
                              className={`py-2.5 px-3 text-[10px] font-bold rounded-sm border transition-all tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                                gradedSA === "full" || gradedSA === "correct"
                                  ? "bg-[#00FF66] border-[#00FF66] text-black shadow-md font-black"
                                  : "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Full Points (+{qPoints} PTS)</span>
                            </button>

                            <button
                              onClick={() => handleSelfGrade(q.id, "partial")}
                              className={`py-2.5 px-3 text-[10px] font-bold rounded-sm border transition-all tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                                gradedSA === "partial" || gradedSA === "needs-review"
                                  ? "bg-amber-500 border-amber-500 text-black shadow-md font-black"
                                  : "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                              }`}
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Partial (+{Math.round(qPoints * 0.5)} PTS)</span>
                            </button>

                            <button
                              onClick={() => handleSelfGrade(q.id, "incorrect")}
                              className={`py-2.5 px-3 text-[10px] font-bold rounded-sm border transition-all tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                                gradedSA === "incorrect"
                                  ? "bg-red-600 border-red-600 text-white shadow-md font-black"
                                  : "bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700"
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>No Points (0 PTS)</span>
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
                    className="bg-[#0A0A0A] p-4 border border-zinc-800 rounded-sm flex items-start gap-3 mt-1 text-[11px] font-mono uppercase"
                  >
                    <BookOpen className="w-4 h-4 text-[#00FF66] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block mb-1 tracking-wider">Explanation & Concept:</span>
                      <p className="text-zinc-400 leading-relaxed font-sans normal-case">{q.explanation}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Bottom Submit Quiz CTA */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center pt-4 pb-12">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleSubmitClick}
              className="px-10 py-5 bg-[#00FF66] hover:bg-[#00e55b] text-black font-black text-sm uppercase tracking-wider rounded-sm shadow-[0_0_25px_rgba(0,255,102,0.4)] transition-all cursor-pointer flex items-center gap-3"
            >
              <Trophy className="w-5 h-5" />
              <span>Submit Quiz & Calculate Final Score</span>
            </motion.button>
            <span className="text-[10px] font-mono text-zinc-500 uppercase mt-2">
              Calculates scores and saves scorecard directly to your Study Hub Dashboard
            </span>
          </motion.div>
        </div>
      )}

      {/* Results Scorecard View */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-lg mx-auto bg-[#101010] border border-zinc-800 rounded-sm p-8 text-center shadow-2xl"
          id="quiz-results"
        >
          <div className="w-20 h-20 bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] rounded-sm flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,255,102,0.2)]">
            <Award className="w-10 h-10" />
          </div>
          
          <h3 className="font-black text-white text-2xl uppercase tracking-tight">Quiz Scorecard</h3>
          <p className="text-xs text-zinc-400 font-mono uppercase mt-1.5 max-w-xs mx-auto">
            Diagnostic performance report for "{activeDoc?.name}".
          </p>

          {/* Total Points Badge */}
          <div className="my-6 p-6 bg-[#0A0A0A] border border-zinc-800 rounded-sm relative overflow-hidden">
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold mb-1">
              Final Earned Score
            </div>
            <div className="text-5xl font-black text-[#00FF66] font-mono tracking-tight my-2">
              {scores.scorePercent}%
            </div>
            <div className="text-xs font-mono font-bold text-zinc-300">
              Total Points: <span className="text-[#00FF66]">{scores.earnedPoints} / {scores.totalPoints} PTS</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-6">
            <div className="bg-[#0A0A0A] border border-zinc-800 p-4 rounded-sm text-center">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase mb-1.5 tracking-wider font-bold">Multiple Choice</span>
              <div className="text-2xl font-black text-[#00FF66] tracking-tight">{scores.mcCorrect} / {scores.mcTotal}</div>
              <span className="text-[10px] font-mono text-zinc-500 block mt-1">{scores.mcPointsEarned} / {scores.mcPointsTotal} PTS</span>
            </div>
            <div className="bg-[#0A0A0A] border border-zinc-800 p-4 rounded-sm text-center">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase mb-1.5 tracking-wider font-bold">Written Questions</span>
              <div className="text-xl font-black text-[#00FF66] tracking-tight">
                {scores.saFull} Full • {scores.saPartial} Partial
              </div>
              <span className="text-[10px] font-mono text-zinc-500 block mt-1">{scores.saPointsEarned} / {scores.saPointsTotal} PTS</span>
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetQuiz}
              className="w-full py-3.5 bg-[#00FF66] hover:bg-[#00e55b] text-black font-extrabold text-xs uppercase tracking-wider rounded-sm transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)] cursor-pointer"
            >
              Retry Same Quiz
            </motion.button>
            
            <button
              onClick={generateQuiz}
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 font-bold text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer"
            >
              Generate New Quiz ({questionCount} Qs)
            </button>

            <button
              onClick={() => setTab("overview")}
              className="w-full py-3 bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>View Scores & Completed Count on Dashboard</span>
              <ArrowRight className="w-4 h-4 text-[#00FF66]" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
