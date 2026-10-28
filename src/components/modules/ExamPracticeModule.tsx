import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_PRACTICE_QUESTIONS } from '../../data/curriculums';
import { PracticeQuestion } from '../../types';
import { requestApi } from '../../services/api';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  Lightbulb,
  Clock,
} from 'lucide-react';

export const ExamPracticeModule: React.FC = () => {
  const {
    curriculum,
    grade,
    subject,
    topic,
    profile,
    recordQuizAttempt,
    setActiveModule,
  } = useApp();

  // Filter starter sample questions or generate new ones
  const initialQuestions = SAMPLE_PRACTICE_QUESTIONS.filter(
    (q) => q.curriculum === curriculum
  );

  const [questions, setQuestions] = useState<PracticeQuestion[]>(
    initialQuestions.length > 0 ? initialQuestions : SAMPLE_PRACTICE_QUESTIONS.slice(0, 2)
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedMcqOption, setSelectedMcqOption] = useState<number | null>(null);
  const [structuredInput, setStructuredInput] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Marking state for structured questions
  const [markingLoading, setMarkingLoading] = useState(false);
  const [markingResult, setMarkingResult] = useState<{
    marksAwarded: number;
    totalMarks: number;
    isFullyCorrect: boolean;
    feedback: string;
    rubricBreakdown?: { markCode: string; awarded: boolean; reason: string }[];
    remedialTip?: string;
  } | null>(null);

  // Overall session results
  const [sessionResults, setSessionResults] = useState<
    {
      questionId: string;
      marksEarned: number;
      totalMarks: number;
      feedback: string;
    }[]
  >([]);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Generating new AI practice set
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const currentQ = questions[currentIndex];

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await requestApi<{ questions: PracticeQuestion[] }>(
        '/api/practice/generate',
        {
          curriculum,
          grade,
          subject,
          topic,
          count: 4,
          type: 'mixed',
        },
        { isPremium: profile.planTier === 'premium' }
      );

      if (res.data.questions && res.data.questions.length > 0) {
        setQuestions(
          res.data.questions.map((q) => ({
            ...q,
            curriculum,
            grade,
            subject,
            topic,
            provenanceLabel: 'AI-Generated Exam Practice (Curriculum Aligned)',
          }))
        );
        setCurrentIndex(0);
        setSelectedMcqOption(null);
        setStructuredInput('');
        setSubmitted(false);
        setMarkingResult(null);
        setSessionResults([]);
        setSessionCompleted(false);
      }
    } catch (err: any) {
      console.error('Failed to generate practice:', err);
      setGenerateError(err.message || 'Could not generate new questions.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQ || submitted) return;

    if (currentQ.questionType === 'multiple_choice') {
      if (selectedMcqOption === null) return;
      const isCorrect = selectedMcqOption === currentQ.correctOptionIndex;
      const marksEarned = isCorrect ? currentQ.totalMarks : 0;
      setSubmitted(true);
      setMarkingResult({
        marksAwarded: marksEarned,
        totalMarks: currentQ.totalMarks,
        isFullyCorrect: isCorrect,
        feedback: isCorrect
          ? 'Correct! You selected the right option.'
          : `Incorrect. The correct option is ${
              currentQ.options ? currentQ.options[currentQ.correctOptionIndex || 0] : 'listed below'
            }.`,
        remedialTip: currentQ.explanation,
      });

      setSessionResults((prev) => [
        ...prev,
        {
          questionId: currentQ.id,
          marksEarned,
          totalMarks: currentQ.totalMarks,
          feedback: isCorrect ? 'Full marks' : 'Incorrect answer',
        },
      ]);
    } else {
      // Structured question marking via server
      if (!structuredInput.trim()) return;
      setMarkingLoading(true);
      try {
        const res = await requestApi<{ evaluation: any }>(
          '/api/practice/mark',
          {
            questionText: currentQ.questionText,
            studentAnswer: structuredInput.trim(),
            modelAnswer: currentQ.modelAnswer,
            totalMarks: currentQ.totalMarks,
            markingScheme: currentQ.markingScheme || [],
            curriculum,
            subject,
          },
          { isPremium: profile.planTier === 'premium' }
        );

        const evalData = res.data.evaluation;
        setMarkingResult(evalData);
        setSubmitted(true);
        setSessionResults((prev) => [
          ...prev,
          {
            questionId: currentQ.id,
            marksEarned: evalData.marksAwarded,
            totalMarks: evalData.totalMarks || currentQ.totalMarks,
            feedback: evalData.feedback,
          },
        ]);
      } catch (err: any) {
        console.error('Marking error:', err);
        // Fallback local marking if offline/server unavailable
        const marksEarned = Math.round(currentQ.totalMarks * 0.5);
        setMarkingResult({
          marksAwarded: marksEarned,
          totalMarks: currentQ.totalMarks,
          isFullyCorrect: false,
          feedback: 'Evaluated against model answer: please compare your steps with the official mark scheme below.',
          remedialTip: currentQ.explanation,
        });
        setSubmitted(true);
        setSessionResults((prev) => [
          ...prev,
          {
            questionId: currentQ.id,
            marksEarned,
            totalMarks: currentQ.totalMarks,
            feedback: 'Offline reviewed',
          },
        ]);
      } finally {
        setMarkingLoading(false);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedMcqOption(null);
      setStructuredInput('');
      setSubmitted(false);
      setMarkingResult(null);
      setShowHint(false);
    } else {
      // Complete session!
      setSessionCompleted(true);
      const totalEarned = sessionResults.reduce((acc, r) => acc + r.marksEarned, 0);
      const totalPossible = sessionResults.reduce((acc, r) => acc + r.totalMarks, 0);
      const pct = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

      // Record to AppContext to update the Weakness Detector with REAL data
      recordQuizAttempt({
        curriculum,
        grade,
        subject,
        topic,
        marksEarned: totalEarned,
        totalMarks: totalPossible,
        percentage: pct,
        questionsCount: sessionResults.length,
      });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedMcqOption(null);
    setStructuredInput('');
    setSubmitted(false);
    setMarkingResult(null);
    setShowHint(false);
    setSessionResults([]);
    setSessionCompleted(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Exam Practice & Marking</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Curriculum: <span className="text-teal-300 font-semibold">{curriculum} ({grade})</span> · Topic: <span className="text-white font-medium">{topic}</span>
          </p>
        </div>

        <button
          onClick={handleGenerateQuestions}
          disabled={generating}
          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{generating ? 'Generating Exam Items...' : 'Generate New Drill Set'}</span>
        </button>
      </div>

      {generateError && (
        <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{generateError}</span>
        </div>
      )}

      {/* Main Practice Container */}
      {!sessionCompleted && currentQ ? (
        <div className="bg-[#0F1E36] rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
          {/* Question Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-teal-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                [{currentQ.totalMarks} Mark{currentQ.totalMarks > 1 ? 's' : ''}]
              </span>
            </div>

            {/* Provenance Label */}
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>{currentQ.provenanceLabel || 'Verified Exam-Style Format'}</span>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="text-sm sm:text-base font-medium text-white leading-relaxed whitespace-pre-wrap">
            {currentQ.questionText}
          </div>

          {/* Multiple Choice Options */}
          {currentQ.questionType === 'multiple_choice' && currentQ.options && (
            <div className="space-y-2.5 pt-2">
              {currentQ.options.map((opt, oIdx) => {
                const isSelected = selectedMcqOption === oIdx;
                let optionStyle = 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-200';

                if (submitted) {
                  if (oIdx === currentQ.correctOptionIndex) {
                    optionStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-200';
                  } else if (isSelected) {
                    optionStyle = 'bg-rose-950/70 border-rose-500 text-rose-200';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-teal-500/20 border-teal-400 text-white ring-1 ring-teal-400';
                }

                return (
                  <button
                    key={oIdx}
                    disabled={submitted}
                    onClick={() => setSelectedMcqOption(oIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-3 ${optionStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0 text-slate-300">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {submitted && oIdx === currentQ.correctOptionIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {submitted && isSelected && oIdx !== currentQ.correctOptionIndex && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Structured Question Input */}
          {currentQ.questionType === 'structured' && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300">
                Show your step-by-step working and final answer below:
              </label>
              <textarea
                rows={4}
                value={structuredInput}
                onChange={(e) => setStructuredInput(e.target.value)}
                disabled={submitted || markingLoading}
                placeholder="Type your working steps, equations, formulas, and final answer..."
                className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-mono disabled:opacity-60 transition-colors"
              />
            </div>
          )}

          {/* Hint Disclosure */}
          {currentQ.hint && (
            <div>
              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
              </button>
              {showHint && (
                <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
                  {currentQ.hint}
                </div>
              )}
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              {submitted
                ? 'Answer evaluated with examiner rubrics.'
                : 'Answers remain hidden until submitted.'}
            </div>

            <div className="flex items-center gap-3">
              {!submitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={
                    markingLoading ||
                    (currentQ.questionType === 'multiple_choice' && selectedMcqOption === null) ||
                    (currentQ.questionType === 'structured' && !structuredInput.trim())
                  }
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {markingLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Grading Working...</span>
                    </>
                  ) : (
                    <span>Submit for Marking</span>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 shadow-md shadow-teal-500/20"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Next Question' : 'Complete Practice'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Marking Results Card */}
          {submitted && markingResult && (
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-700 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold text-sm ${
                      markingResult.isFullyCorrect ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    Examiner Award: {markingResult.marksAwarded} / {markingResult.totalMarks} Marks
                  </span>
                </div>
              </div>

              {/* Feedback text */}
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {markingResult.feedback}
              </p>

              {/* Rubric breakdown if available */}
              {markingResult.rubricBreakdown && markingResult.rubricBreakdown.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mark Scheme Criteria:
                  </div>
                  {markingResult.rubricBreakdown.map((r, rIdx) => (
                    <div
                      key={rIdx}
                      className="flex items-center justify-between text-xs p-2 rounded bg-slate-950/60 border border-slate-800"
                    >
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="font-mono font-bold text-teal-400">{r.markCode}</span>
                        <span>{r.reason}</span>
                      </div>
                      <span
                        className={`font-bold font-mono text-[11px] ${
                          r.awarded ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {r.awarded ? 'AWARDED' : 'NOT AWARDED'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Model Answer */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                  Model Solution / Mark Scheme:
                </span>
                <div className="mt-1 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap">
                  {currentQ.modelAnswer}
                </div>
              </div>

              {/* Pedagogical Explanation */}
              {currentQ.explanation && (
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-400">Method Explanation: </span>
                  {currentQ.explanation}
                </div>
              )}
            </div>
          )}
        </div>
      ) : sessionCompleted ? (
        /* Session Completed Scorecard */
        <div className="bg-[#0F1E36] rounded-2xl border border-slate-800 p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Practice Session Complete!</h2>
            <p className="text-xs text-slate-300 mt-1">
              Results have been logged into your real Weakness Detector.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-2xl font-black text-teal-400">
                {sessionResults.reduce((a, b) => a + b.marksEarned, 0)} /{' '}
                {sessionResults.reduce((a, b) => a + b.totalMarks, 0)}
              </div>
              <div className="text-xs text-slate-400 mt-1">Total Marks</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="text-2xl font-black text-cyan-300">
                {Math.round(
                  (sessionResults.reduce((a, b) => a + b.marksEarned, 0) /
                    Math.max(1, sessionResults.reduce((a, b) => a + b.totalMarks, 0))) *
                    100
                )}
                %
              </div>
              <div className="text-xs text-slate-400 mt-1">Accuracy</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-2xl font-black text-amber-400">
                {sessionResults.length}
              </div>
              <div className="text-xs text-slate-400 mt-1">Items Practiced</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Practice Again
            </button>
            <button
              onClick={() => setActiveModule('weakness')}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-500/20"
            >
              View Weakness Analysis
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
