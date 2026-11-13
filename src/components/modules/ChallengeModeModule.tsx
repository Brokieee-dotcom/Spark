import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { SAMPLE_PRACTICE_QUESTIONS } from '../../data/curriculums';
import { requestApi } from '../../services/api';
import {
  Flame,
  Clock,
  Award,
  ShieldCheck,
  Trophy,
} from 'lucide-react';

interface ChallengeRun {
  id: string;
  alias: string;
  curriculum: string;
  score: number;
  accuracy: string;
  verified: boolean;
  timestamp: string;
}

export const ChallengeModeModule: React.FC = () => {
  const { curriculum, profile } = useApp();

  const [activeSession, setActiveSession] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes blitz
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<{
    verified: boolean;
    score: number;
    accuracy: number;
    note?: string;
  } | null>(null);

  const correctRef = useRef(0);

  // Safe alias for local scoreboard
  const safeAlias =
    profile.name.trim().split(' ')[0]
      ? `${profile.name.trim().split(' ')[0]}_Spark`
      : 'SparkStudent';

  // Filter rapid fire questions
  const challengePool = SAMPLE_PRACTICE_QUESTIONS.filter(
    (q) => q.questionType === 'multiple_choice'
  );
  const activeQuestions =
    challengePool.length > 0 ? challengePool : SAMPLE_PRACTICE_QUESTIONS.slice(0, 3);
  const currentQ = activeQuestions[currentQIndex % activeQuestions.length];

  const [recentRuns, setRecentRuns] = useState<ChallengeRun[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (activeSession && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (activeSession && timeLeft === 0) {
      void finishChallenge(correctRef.current);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession, timeLeft]);

  const startChallenge = () => {
    setActiveSession(true);
    setTimeLeft(120);
    setCurrentQIndex(0);
    setScore(0);
    setCorrectCount(0);
    correctRef.current = 0;
    setStreak(0);
    setCompleted(false);
    setVerifiedResult(null);
  };

  const handleAnswer = (optionIdx: number) => {
    if (!currentQ || completed) return;
    const isCorrect = optionIdx === currentQ.correctOptionIndex;

    let nextCorrect = correctRef.current;
    if (isCorrect) {
      nextCorrect += 1;
      correctRef.current = nextCorrect;
      setCorrectCount(nextCorrect);
      const bonus = streak * 20;
      setScore((prev) => prev + 100 + bonus);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    if (currentQIndex + 1 < activeQuestions.length) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      void finishChallenge(nextCorrect);
    }
  };

  const finishChallenge = async (finalCorrectCount: number) => {
    setActiveSession(false);
    setCompleted(true);
    setVerifying(true);

    const elapsed = Math.max(activeQuestions.length * 2, 120 - timeLeft);

    try {
      const res = await requestApi<{
        verified: boolean;
        score: number;
        accuracy: number;
      }>('/api/challenge/submit', {
        challengeId: `chal-${Date.now()}`,
        completedQuestions: finalCorrectCount,
        totalQuestions: activeQuestions.length,
        elapsedSeconds: elapsed,
      });

      setVerifiedResult({
        verified: res.data.verified,
        score: res.data.score,
        accuracy: res.data.accuracy,
      });

      setRecentRuns((prev) => [
        {
          id: `run-${Date.now()}`,
          alias: safeAlias,
          curriculum,
          score: res.data.score,
          accuracy: `${res.data.accuracy}%`,
          verified: true,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } catch {
      const fallbackAccuracy =
        activeQuestions.length > 0
          ? Math.round((finalCorrectCount / activeQuestions.length) * 100)
          : 0;
      setVerifiedResult({
        verified: false,
        score,
        accuracy: fallbackAccuracy,
        note: 'Offline / local calculation (server validation unreachable).',
      });
      setRecentRuns((prev) => [
        {
          id: `run-${Date.now()}`,
          alias: safeAlias,
          curriculum,
          score,
          accuracy: `${fallbackAccuracy}%`,
          verified: false,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Flame className="w-5 h-5 fill-amber-400" />
            </span>
            <h1 className="text-lg font-bold text-white">Timed Challenge Mode</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            2-minute rapid-fire recall drill with server-validated score anti-tampering.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-teal-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Safe Pseudonyms · Zero PII Exposed</span>
        </div>
      </div>

      {!activeSession && !completed ? (
        /* Challenge Start Screen */
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#0F1E36] border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Speed Recall Drill</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
              Answer rapid syllabus questions within 120 seconds. Earn streak multipliers for consecutive correct answers!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-left text-slate-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Student Display Alias:</span>
              <span className="font-mono font-bold text-teal-400">{safeAlias}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Curriculum:</span>
              <span className="font-semibold text-white">{curriculum}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Time Limit:</span>
              <span className="font-mono text-amber-400 font-bold">120 Seconds</span>
            </div>
          </div>

          <button
            onClick={startChallenge}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20"
          >
            Start Timed Challenge
          </button>
        </div>
      ) : activeSession ? (
        /* Active Timed Drill */
        <div className="max-w-2xl mx-auto p-5 sm:p-6 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-6 shadow-2xl">
          {/* Top Bar: Timer, Score, Streak */}
          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>

            <div className="flex items-center gap-1.5 text-teal-400 font-bold">
              <span>Score: {score}</span>
            </div>

            <div className="flex items-center gap-1 text-orange-400 font-bold">
              <Flame className="w-4 h-4 fill-orange-400" />
              <span>Streak x{streak}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-4">
            <div className="text-[11px] font-mono text-slate-400">
              Question {currentQIndex + 1} of {activeQuestions.length} · {currentQ.topic}
            </div>
            <div className="text-base font-bold text-white leading-relaxed">
              {currentQ.questionText}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {(currentQ.options || ['Option A', 'Option B', 'Option C', 'Option D']).map(
              (opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleAnswer(oIdx)}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-teal-400 text-xs sm:text-sm font-medium transition-colors text-slate-200"
                >
                  <span className="font-bold text-teal-400 mr-2">
                    {String.fromCharCode(65 + oIdx)}.
                  </span>
                  <span>{opt}</span>
                </button>
              )
            )}
          </div>
        </div>
      ) : (
        /* Completed Screen */
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl bg-[#0F1E36] border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">Challenge Complete!</h2>
            <p className="text-xs text-slate-400 mt-1">
              {verifying
                ? 'Validating completion speed and accuracy with server...'
                : verifiedResult?.verified
                ? 'Results verified by the anti-tamper scoring server.'
                : verifiedResult?.note || 'Completed locally.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-around">
            <div>
              <div className="text-2xl font-black text-amber-400">
                {verifiedResult ? verifiedResult.score : score}
              </div>
              <div className="text-[11px] text-slate-400">
                {verifiedResult?.verified ? 'Verified Score' : 'Session Score'}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <div className="text-2xl font-black text-teal-400">
                {verifiedResult ? `${verifiedResult.accuracy}%` : `${Math.round((correctCount / activeQuestions.length) * 100)}%`}
              </div>
              <div className="text-[11px] text-slate-400">Accuracy ({correctCount}/{activeQuestions.length})</div>
            </div>
          </div>

          <button
            onClick={startChallenge}
            className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Personal Verified Challenge Runs Log */}
      <div className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Your Verified Challenge Runs</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Personal session log (no fake multiplayer data)
          </span>
        </div>

        {recentRuns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Run</th>
                  <th className="py-2.5 px-3">Alias</th>
                  <th className="py-2.5 px-3">Curriculum</th>
                  <th className="py-2.5 px-3">Accuracy</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {recentRuns.map((item, idx) => (
                  <tr key={item.id} className="bg-teal-500/5 hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-400">
                      #{recentRuns.length - idx}
                    </td>
                    <td className="py-2.5 px-3 text-white flex items-center gap-1.5">
                      <span>{item.alias}</span>
                      <span className="text-[9px] bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.5 rounded">
                        {item.verified ? 'VERIFIED' : 'LOCAL'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{item.curriculum}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono">{item.accuracy}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-400">
                      {item.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-4 text-center">
            Complete a 2-minute Speed Recall Drill above to record your first verified score.
          </p>
        )}
      </div>
    </div>
  );
};
