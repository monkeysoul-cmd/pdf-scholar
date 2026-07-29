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
  Sparkles,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Quiz() {
  const { documents, selectedDocumentId, quizQuestions, setQuestions, authenticatedFetch, saveQuizResult } = useAppState();
  const [questionCount, setQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [answers, setAnswers] = useState({});
  const [revealedShortAnswers, setRevealedShortAnswers] = useState({});
  const [shortAnswersText, setShortAnswersText] = useState({});
  const [shortAnswerSelfGrades, setShortAnswerSelfGrades] = useState({});
  const [showResults, setShowResults] = useState(false);

  const activeDoc = documents.find(d => d.id === selectedDocumentId);

  const generateQuiz = async () => {
    if (!selectedDocumentId) return;
    setIsGenerating(true);
    setShowResults(false);
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
    let saCorrect = 0;
    let saTotal = 0;

    quizQuestions.forEach(q => {
      if (q.type === "multiple-choice") {
        mcTotal++;
        if (answers[q.id] === q.correctAnswer) {
          mcCorrect++;
        }
      } else {
        saTotal++;
        if (shortAnswerSelfGrades[q.id] === "correct") {
          saCorrect++;
        }
      }
    });

    return { mcCorrect, mcTotal, saCorrect, saTotal };
  };

  const resetQuiz = () => {
    setAnswers({});
    setRevealedShortAnswers({});
    setShortAnswersText({});
    setShortAnswerSelfGrades({});
    setShowResults(false);
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

  const { mcCorrect, mcTotal, saCorrect, saTotal } = calculateScore();
  const allMCAnswered = quizQuestions.filter(q => q.type === "multiple-choice").every(q => !!answers[q.id]);
  const allSAAnswered = quizQuestions.filter(q => q.type === "short-answer").every(q => !!revealedShortAnswers[q.id] && !!shortAnswerSelfGrades[q.id]);
  const showCompleteBtn = quizQuestions.length > 0 && allMCAnswered && allSAAnswered && !showResults;

  return (
    <div className="flex-1 p-8 bg-[#080808] overflow-y-auto min-h-0 select-none relative" id="quiz-view">
      {/* Header */}
      <div className="mb-8 border-b border-zinc-800/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#00FF66]" />
            Practice Quiz
          </h2>
          <p className="text-xs text-[#00FF66] font-mono uppercase mt-1">
            DEPLOYED ON: "{activeDoc?.name}"
          </p>
        </div>

        {/* Configurations Header Button */}
        {quizQuestions.length > 0 && !isGenerating && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateQuiz}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#121212] hover:bg-zinc-800 text-white border border-zinc-700 text-xs font-bold uppercase tracking-wider rounded-sm transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerate Quiz</span>
          </motion.button>
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
          <h3 className="font-extrabold text-white text-lg uppercase tracking-wider">Creating Your Quiz</h3>
          <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto font-mono uppercase leading-relaxed">
            Reading document sections to synthesize practice questions...
          </p>
        </motion.div>
      )}

      {/* Initial Landing Screen */}
      {quizQuestions.length === 0 && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 max-w-sm mx-auto"
        >
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 text-[#00FF66] rounded-sm flex items-center justify-center mx-auto mb-5 shadow-xl">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h3 className="font-black text-white text-xl uppercase tracking-wide">Generate Quiz</h3>
          <p className="text-xs text-zinc-400 font-mono uppercase mt-2 mb-8 leading-relaxed">
            Synthesize interactive diagnostic questions based on <span className="text-[#00FF66]">"{activeDoc?.name}"</span>.
          </p>
          <div className="flex items-center justify-center gap-3 bg-[#121212] border border-zinc-800 p-3.5 rounded-sm shadow-xl">
            <span className="text-[10px] font-bold text-zinc-400 font-mono uppercase">Questions:</span>
            <div className="flex gap-1 bg-black p-1 rounded-sm border border-zinc-800">
              {[3, 5, 8].map(num => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold transition-all ${
                    questionCount === num ? "bg-[#00FF66] text-black shadow-md" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={generateQuiz}
              className="ml-2 px-4 py-2 bg-[#00FF66] hover:bg-[#00e55b] text-black font-extrabold text-xs uppercase tracking-wider rounded-sm transition-all shadow-[0_0_12px_rgba(0,255,102,0.2)]"
            >
              Generate Now
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Questions List */}
      {quizQuestions.length > 0 && !isGenerating && !showResults && (
        <div className="max-w-3xl mx-auto space-y-6" id="questions-list">
          {quizQuestions.map((q, index) => {
            const hasAnsweredMC = !!answers[q.id];
            const isCorrectMC = answers[q.id] === q.correctAnswer;
            const revealedSA = !!revealedShortAnswers[q.id];
            const gradedSA = shortAnswerSelfGrades[q.id];

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#101010] border border-zinc-800/80 rounded-sm p-6 md:p-8 shadow-xl flex flex-col gap-4"
              >
                {/* Badge and question text */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider bg-black text-[#00FF66] border border-[#00FF66]/20 px-2.5 py-1 rounded-sm uppercase">
                    Q{index + 1} • {q.type === "multiple-choice" ? "Multiple Choice" : "Short Answer"}
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-base uppercase tracking-tight">{q.question}</h4>

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
                          className={`w-full text-left p-4 rounded-sm border text-xs font-bold uppercase tracking-wide transition-all ${
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

                {/* Short Answer Input */}
                {q.type === "short-answer" && (
                  <div className="space-y-4 mt-1">
                    {!revealedSA ? (
                      <div className="flex flex-col gap-3">
                        <textarea
                          placeholder="Type your answer analysis here..."
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
                          className="self-end inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#00FF66] hover:bg-[#00e55b] disabled:opacity-30 disabled:cursor-not-allowed text-black font-extrabold text-xs uppercase tracking-wider rounded-sm transition-all"
                        >
                          <span>Check Answer</span>
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    ) : (
                      <div className="bg-[#0A0A0A] border border-zinc-800 p-5 rounded-sm space-y-4 font-mono uppercase text-xs">
                        <div>
                          <div className="text-[10px] text-zinc-500 font-bold tracking-wider">YOUR RESPONSE:</div>
                          <div className="text-white italic mt-1 font-mono">"{shortAnswersText[q.id]}"</div>
                        </div>
                        
                        <div className="border-t border-zinc-800 pt-4">
                           <span className="text-[10px] font-mono font-bold text-[#00FF66] tracking-widest block mb-1">Answer Key:</span>
                           <p className="text-zinc-300 leading-relaxed font-sans normal-case">{q.correctAnswer}</p>
                        </div>

                        {/* Self Grading buttons */}
                        <div className="border-t border-zinc-800 pt-4 flex flex-wrap items-center justify-between gap-3">
                           <span className="text-[10px] text-zinc-400 font-bold tracking-wider">Self Grade:</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSelfGrade(q.id, "correct")}
                              className={`px-3 py-1.5 text-[10px] font-bold rounded-sm border transition-all tracking-wider ${
                                gradedSA === "correct"
                                  ? "bg-[#00FF66] border-[#00FF66] text-black"
                                  : "bg-transparent border-zinc-800 text-zinc-400 hover:text-white"
                              }`}
                            >
                               My answer is correct
                            </button>
                            <button
                              onClick={() => handleSelfGrade(q.id, "needs-review")}
                              className={`px-3 py-1.5 text-[10px] font-bold rounded-sm border transition-all tracking-wider ${
                                gradedSA === "needs-review"
                                  ? "bg-amber-500 border-amber-500 text-black"
                                  : "bg-transparent border-zinc-800 text-zinc-400 hover:text-white"
                              }`}
                            >
                               Needs more study
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
                      <span className="font-bold text-white block mb-1 tracking-wider">Explanation:</span>
                      <p className="text-zinc-400 leading-relaxed font-sans normal-case">{q.explanation}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}

          {/* Complete quiz CTA */}
          {showCompleteBtn && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center pt-4">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleFinishQuiz}
                className="px-8 py-4 bg-[#00FF66] hover:bg-[#00e55b] text-black font-black text-xs uppercase tracking-wider rounded-sm shadow-[0_0_25px_rgba(0,255,102,0.3)] transition-all"
              >
                Finish and View Scorecard
              </motion.button>
            </motion.div>
          )}
        </div>
      )}

      {/* Results Scorecard View */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md mx-auto bg-[#101010] border border-zinc-800 rounded-sm p-8 text-center shadow-2xl"
          id="quiz-results"
        >
          <div className="w-20 h-20 bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] rounded-sm flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,255,102,0.2)]">
            <Award className="w-10 h-10" />
          </div>
          <h3 className="font-black text-white text-2xl uppercase tracking-tight">Quiz Scorecard</h3>
          <p className="text-xs text-zinc-400 font-mono uppercase mt-1.5 max-w-xs mx-auto">
            Assessment summary for "{activeDoc?.name}".
          </p>

          <div className="grid grid-cols-2 gap-4 my-8">
            <div className="bg-[#0A0A0A] border border-zinc-800 p-4 rounded-sm text-center">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase mb-1.5 tracking-wider">Multiple Choice</span>
              <span className="text-3xl font-black text-[#00FF66] tracking-tight">{mcCorrect} / {mcTotal}</span>
            </div>
            <div className="bg-[#0A0A0A] border border-zinc-800 p-4 rounded-sm text-center">
              <span className="text-[10px] font-mono text-zinc-400 block uppercase mb-1.5 tracking-wider">Short Answer</span>
              <span className="text-3xl font-black text-[#00FF66] tracking-tight">{saCorrect} / {saTotal}</span>
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetQuiz}
              className="w-full py-3.5 bg-[#00FF66] hover:bg-[#00e55b] text-black font-extrabold text-xs uppercase tracking-wider rounded-sm transition-all shadow-[0_0_15px_rgba(0,255,102,0.2)]"
            >
              Retry Same Quiz
            </motion.button>
            <button
              onClick={generateQuiz}
              className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 font-bold text-xs uppercase tracking-wider rounded-sm transition-all"
            >
              Generate New Quiz
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
