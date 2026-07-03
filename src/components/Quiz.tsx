import React, { useState } from "react";
import { useAppState } from "../lib/state-context";
import { QuizQuestion } from "../types";
import {
  BrainCircuit,
  Loader2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronRight,
  RotateCcw,
  BookOpen
} from "lucide-react";

export default function Quiz() {
  const { documents, selectedDocumentId, quizQuestions, setQuestions } = useAppState();
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({});
  const [revealedShortAnswers, setRevealedShortAnswers] = useState<{ [qId: string]: boolean }>({});
  const [shortAnswersText, setShortAnswersText] = useState<{ [qId: string]: string }>({});
  const [shortAnswerSelfGrades, setShortAnswerSelfGrades] = useState<{ [qId: string]: "correct" | "needs-review" }>({});
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
      const res = await fetch("/api/quiz", {
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

  const handleMultipleChoiceSelect = (qId: string, option: string) => {
    if (answers[qId]) return; // Answer already selected
    setAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const submitShortAnswer = (qId: string) => {
    setRevealedShortAnswers(prev => ({
      ...prev,
      [qId]: true
    }));
  };

  const handleSelfGrade = (qId: string, grade: "correct" | "needs-review") => {
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
      <div className="flex-1 p-8 bg-[#0A0A0A] flex flex-col justify-center items-center" id="quiz-view">
        <div className="text-center max-w-sm border border-[#222] bg-[#111] p-10 rounded-xs shadow-2xl">
          <BrainCircuit className="w-12 h-12 text-[#00FF66] mx-auto mb-4" />
          <h3 className="font-black text-white text-base uppercase tracking-wider">No Active Target</h3>
          <p className="text-[11px] text-zinc-500 font-mono uppercase mt-2 mb-6">
            Activate a target from the dashboard or deploy a new PDF to synthesize diagnostic courseware.
          </p>
        </div>
      </div>
    );
  }

  const { mcCorrect, mcTotal, saCorrect, saTotal } = calculateScore();
  const allMCAnswered = quizQuestions.filter(q => q.type === "multiple-choice").every(q => !!answers[q.id]);
  const allSAAnswered = quizQuestions.filter(q => q.type === "short-answer").every(q => !!revealedShortAnswers[q.id] && !!shortAnswerSelfGrades[q.id]);
  const showCompleteBtn = quizQuestions.length > 0 && allMCAnswered && allSAAnswered && !showResults;

  return (
    <div className="flex-1 p-8 bg-[#0A0A0A] overflow-y-auto" id="quiz-view">
      {/* Header */}
      <div className="mb-8 border-b border-[#222] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">Adaptive Quiz Generator</h2>
          <p className="text-[11px] text-[#00FF66] font-mono uppercase mt-1">
            DEPLOYED ON: "{activeDoc?.name}"
          </p>
        </div>

        {/* Configurations */}
        {quizQuestions.length === 0 && !isGenerating && (
          <div className="flex flex-wrap items-center gap-3 bg-[#111] p-3 border border-[#222] rounded-xs">
            <span className="text-[10px] font-black text-zinc-400 font-mono uppercase tracking-wider">QUANTITY:</span>
            <div className="flex gap-1 bg-black p-1 rounded-xs border border-[#222]">
              {[3, 5, 8].map(num => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`px-3 py-1 text-[10px] font-black rounded-xs transition-all uppercase tracking-wider ${
                    questionCount === num
                      ? "bg-[#00FF66] text-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={generateQuiz}
              className="px-4 py-1.5 bg-[#00FF66] hover:bg-[#00e55b] text-black font-black text-[10px] uppercase tracking-wider rounded-xs transition-colors"
            >
              Generate
            </button>
          </div>
        )}

        {quizQuestions.length > 0 && !isGenerating && (
          <button
            onClick={generateQuiz}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-transparent hover:bg-[#111] text-white border border-[#222] text-[10px] font-black uppercase tracking-wider rounded-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerate Quiz</span>
          </button>
        )}
      </div>

      {/* Generating state */}
      {isGenerating && (
        <div className="py-24 text-center max-w-md mx-auto bg-[#111] border border-[#222] p-10 rounded-xs shadow-2xl" id="quiz-loader">
          <Loader2 className="w-12 h-12 text-[#00FF66] animate-spin mx-auto mb-5" />
          <h3 className="font-black text-white text-base uppercase tracking-wider">Synthesizing Courseware</h3>
          <p className="text-[10px] text-zinc-500 mt-2 max-w-xs mx-auto font-mono uppercase leading-relaxed">
            Reading indexed vector matrices to construct custom diagnostic questions.
          </p>
        </div>
      )}

      {/* Initial Landing Screen */}
      {quizQuestions.length === 0 && !isGenerating && (
        <div className="text-center py-20 max-w-sm mx-auto">
          <div className="w-16 h-16 bg-[#111] border border-[#222] text-[#00FF66] rounded-xs flex items-center justify-center mx-auto mb-5 shadow-lg">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <h3 className="font-black text-white text-lg uppercase tracking-wide">Generate Quiz</h3>
          <p className="text-[11px] text-zinc-500 font-mono uppercase mt-2 mb-8 leading-relaxed">
            Gemini will parse key passages from <span className="text-[#00FF66]">"{activeDoc?.name}"</span> and draft structured diagnostic questions.
          </p>
          <div className="flex items-center justify-center gap-3 bg-[#111] border border-[#222] p-3 rounded-xs shadow-2xl">
            <span className="text-[10px] font-black text-zinc-500 font-mono uppercase">Select:</span>
            <div className="flex gap-1 bg-black p-1 rounded-xs border border-[#222]">
              {[3, 5, 8].map(num => (
                <button
                  key={num}
                  onClick={() => setQuestionCount(num)}
                  className={`w-8 h-8 rounded-xs flex items-center justify-center text-[10px] font-black transition-all ${
                    questionCount === num ? "bg-[#00FF66] text-black" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <button
              onClick={generateQuiz}
              className="ml-2 px-4 py-2 bg-[#00FF66] hover:bg-[#00e55b] text-black font-black text-[10px] uppercase tracking-wider rounded-xs transition-colors"
            >
              Generate Now
            </button>
          </div>
        </div>
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
              <div
                key={q.id}
                className="bg-[#111] border border-[#222] rounded-xs p-6 shadow-2xl flex flex-col gap-4"
              >
                {/* Badge and question text */}
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black font-mono tracking-widest bg-black text-[#00FF66] border border-[#00FF66]/20 px-2 py-0.5 rounded-xs uppercase">
                    Q{index + 1} • {q.type === "multiple-choice" ? "Multiple Choice" : "Short Answer"}
                  </span>
                </div>
                <h4 className="font-black text-white text-base uppercase tracking-tight">{q.question}</h4>

                {/* Multiple Choice Answers */}
                {q.type === "multiple-choice" && (
                  <div className="grid grid-cols-1 gap-3 mt-1">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = answers[q.id] === opt;
                      const isCorrectOption = opt === q.correctAnswer;
                      const shouldHighlightGreen = hasAnsweredMC && isCorrectOption;
                      const shouldHighlightRed = hasAnsweredMC && isSelected && !isCorrectMC;

                      return (
                        <button
                          key={optIdx}
                          disabled={hasAnsweredMC}
                          onClick={() => handleMultipleChoiceSelect(q.id, opt)}
                          className={`w-full text-left p-3.5 rounded-xs border text-xs font-black uppercase tracking-wider transition-all ${
                            shouldHighlightGreen
                              ? "bg-[#00FF66] border-[#00FF66] text-black"
                              : shouldHighlightRed
                              ? "bg-red-600 border-red-600 text-white"
                              : isSelected
                              ? "bg-[#111] border-white text-white"
                              : hasAnsweredMC
                              ? "bg-black border-[#222] text-zinc-600 cursor-not-allowed"
                              : "bg-black border-[#222] text-zinc-300 hover:border-white hover:bg-[#111]"
                          }`}
                        >
                          <span className="font-mono text-xs mr-2 text-zinc-500">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </button>
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
                          placeholder="Draft your analysis response..."
                          value={shortAnswersText[q.id] || ""}
                          onChange={(e) => setShortAnswersText(prev => ({ ...prev, [q.id]: e.target.value }))}
                          rows={3}
                          className="w-full text-xs p-3.5 border border-[#222] rounded-xs focus:outline-hidden focus:border-[#00FF66] bg-black text-white focus:bg-black transition-all font-mono uppercase"
                        />
                        <button
                          onClick={() => submitShortAnswer(q.id)}
                          disabled={!(shortAnswersText[q.id] || "").trim()}
                          className="self-end inline-flex items-center gap-1.5 px-4 py-2 bg-[#00FF66] hover:bg-[#00e55b] disabled:opacity-30 disabled:cursor-not-allowed text-black font-black text-[10px] uppercase tracking-wider rounded-xs transition-colors"
                        >
                          <span>Reveal Answer Criteria</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="bg-black border border-[#222] p-5 rounded-xs space-y-4 font-mono uppercase text-xs">
                        <div>
                          <div className="text-[10px] text-zinc-500 font-bold tracking-wider">YOUR RESPONSE:</div>
                          <div className="text-white italic mt-1 font-mono">"{shortAnswersText[q.id]}"</div>
                        </div>
                        
                        <div className="border-t border-[#222] pt-4">
                          <span className="text-[10px] font-black text-[#00FF66] tracking-widest block mb-1">Grading Key Points:</span>
                          <p className="text-zinc-300 leading-relaxed font-sans normal-case">{q.correctAnswer}</p>
                        </div>

                        {/* Self Grading buttons */}
                        <div className="border-t border-[#222] pt-4 flex flex-wrap items-center justify-between gap-3">
                          <span className="text-[10px] text-zinc-500 font-black tracking-wider">Self-Grade this answer:</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSelfGrade(q.id, "correct")}
                              className={`px-3 py-1.5 text-[9px] font-black rounded-xs border transition-all tracking-wider ${
                                gradedSA === "correct"
                                  ? "bg-[#00FF66] border-[#00FF66] text-black"
                                  : "bg-transparent border-[#222] text-zinc-400 hover:text-white"
                              }`}
                            >
                              I hit the key points
                            </button>
                            <button
                              onClick={() => handleSelfGrade(q.id, "needs-review")}
                              className={`px-3 py-1.5 text-[9px] font-black rounded-xs border transition-all tracking-wider ${
                                gradedSA === "needs-review"
                                  ? "bg-amber-500 border-amber-500 text-black"
                                  : "bg-transparent border-[#222] text-zinc-400 hover:text-white"
                              }`}
                            >
                              Needs review
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation Reveal */}
                {((q.type === "multiple-choice" && hasAnsweredMC) || (q.type === "short-answer" && revealedSA)) && (
                  <div className="bg-black p-4 border border-[#222] rounded-xs flex items-start gap-3 mt-1 text-[11px] font-mono uppercase">
                    <BookOpen className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black text-white block mb-1 tracking-wider">Explanation & Context:</span>
                      <p className="text-zinc-400 leading-relaxed font-sans normal-case">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Complete quiz CTA */}
          {showCompleteBtn && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setShowResults(true)}
                className="px-6 py-3 bg-[#00FF66] hover:bg-[#00e55b] text-black font-black text-xs uppercase tracking-wider rounded-xs shadow-lg transition-all"
              >
                Submit and View Report
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results View */}
      {showResults && (
        <div className="max-w-md mx-auto bg-[#111] border border-[#222] rounded-xs p-8 text-center shadow-2xl" id="quiz-results">
          <div className="w-20 h-20 bg-[#00FF66]/10 border border-[#00FF66]/20 text-[#00FF66] rounded-xs flex items-center justify-center mx-auto mb-6 shadow-md">
            <Award className="w-10 h-10" />
          </div>
          <h3 className="font-black text-white text-xl uppercase tracking-wide">Diagnostic Scorecard</h3>
          <p className="text-[10px] text-zinc-500 font-mono uppercase mt-1.5 max-w-xs mx-auto">
            You've completed the quiz generated for "{activeDoc?.name}".
          </p>

          <div className="grid grid-cols-2 gap-4 my-8">
            <div className="bg-black border border-[#222] p-4 rounded-xs text-center">
              <span className="text-[9px] font-mono text-zinc-500 block uppercase mb-1.5 tracking-wider">Multiple Choice</span>
              <span className="text-2xl font-black text-[#00FF66] tracking-tight">{mcCorrect} / {mcTotal}</span>
            </div>
            <div className="bg-black border border-[#222] p-4 rounded-xs text-center">
              <span className="text-[9px] font-mono text-zinc-500 block uppercase mb-1.5 tracking-wider">Short Answer Passed</span>
              <span className="text-2xl font-black text-[#00FF66] tracking-tight">{saCorrect} / {saTotal}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={resetQuiz}
              className="w-full py-3 bg-[#00FF66] hover:bg-[#00e55b] text-black font-black text-xs uppercase tracking-wider rounded-xs transition-colors"
            >
              Retry Same Quiz
            </button>
            <button
              onClick={generateQuiz}
              className="w-full py-3 bg-transparent hover:bg-black text-white border border-[#222] font-black text-xs uppercase tracking-wider rounded-xs transition-colors"
            >
              Generate New Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
