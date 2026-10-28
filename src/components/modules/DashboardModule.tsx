import React from 'react';
import { useApp } from '../../context/AppContext';
import { CURRICULA_DATA } from '../../data/curriculums';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  Layers,
  FileCheck2,
  ScanLine,
  Flame,
  Award,
} from 'lucide-react';

interface DashboardModuleProps {
  onOpenCurriculumModal: () => void;
  onOpenUpgradeModal: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  onOpenCurriculumModal,
  onOpenUpgradeModal,
}) => {
  const {
    profile,
    curriculum,
    grade,
    subject,
    setSubject,
    setTopic,
    setActiveModule,
    quizAttempts,
    weaknessAnalysis,
    tasks,
    toggleTaskCompleted,
    examDates,
    flashcardDecks,
  } = useApp();

  const currMeta = CURRICULA_DATA[curriculum];

  // Derive next upcoming exam
  const sortedExams = [...examDates].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );
  const nextExam = sortedExams[0];

  // Calculate days remaining
  let daysToNextExam = 0;
  if (nextExam) {
    const diff = new Date(nextExam.examDate).getTime() - Date.now();
    daysToNextExam = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Top weak topic from actual data
  const criticalWeakness = weaknessAnalysis.find(
    (w) => w.trend === 'Critical Weakness' || w.trend === 'Needs Attention'
  );

  const pendingTasks = tasks.filter((t) => !t.completed).slice(0, 3);

  // Overall average score from actual attempts
  const totalEarned = quizAttempts.reduce((acc, q) => acc + q.marksEarned, 0);
  const totalPossible = quizAttempts.reduce((acc, q) => acc + q.totalMarks, 0);
  const overallAvg = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : null;

  return (
    <div className="space-y-6">
      {/* 1. Hero Welcome & Curriculum Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B192C] via-[#1E3E62] to-[#0B192C] border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Target: {currMeta.title} ({grade})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {profile.name}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              ScholarSpark AI is calibrated for your {curriculum} exams. Ready to master your next syllabus topic?
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setActiveModule('tutor')}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5"
              >
                <Brain className="w-4 h-4" /> Start AI Tutor Lesson
              </button>
              <button
                onClick={() => setActiveModule('practice')}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <FileCheck2 className="w-4 h-4 text-teal-400" /> Exam Practice Drills
              </button>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-teal-400">{quizAttempts.length}</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Quizzes Taken</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-2xl font-black text-cyan-300">
                {overallAvg !== null ? `${overallAvg}%` : '—'}
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">Average Score</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center col-span-2 sm:col-span-1">
              <div className="text-2xl font-black text-amber-400">{daysToNextExam}d</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">To Next Exam</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Urgent Weakness Alert (Based on Actual Data) */}
      {criticalWeakness ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/40 border border-rose-800/70 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  Targeted Revision Needed
                </span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono">
                  {criticalWeakness.averageScore}% Accuracy
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                {criticalWeakness.subject}: {criticalWeakness.topic}
              </h3>
              <p className="text-xs text-rose-200/80 mt-1">
                {criticalWeakness.evidence} Tackle this topic now to prevent mark loss.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setSubject(criticalWeakness.subject);
                setTopic(criticalWeakness.topic);
                setActiveModule('tutor');
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Revise with Tutor
            </button>
            <button
              onClick={() => {
                setSubject(criticalWeakness.subject);
                setTopic(criticalWeakness.topic);
                setActiveModule('practice');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-rose-800 text-rose-300 hover:text-white font-semibold text-xs transition-colors"
            >
              5-Question Drill
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            <span>
              {quizAttempts.length === 0
                ? 'No practice quizzes logged yet. Take your first quiz to generate verified weakness analytics.'
                : 'All tested topics are performing within healthy syllabus thresholds.'}
            </span>
          </div>
          <button
            onClick={() => setActiveModule('practice')}
            className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
          >
            Practice now <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 3. Subjects Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {currMeta.title} Subjects
          </h2>
          <button
            onClick={onOpenCurriculumModal}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium"
          >
            Change Curriculum
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {currMeta.subjects.map((sub) => {
            const isCurrent = subject === sub.name;
            return (
              <div
                key={sub.name}
                onClick={() => {
                  setSubject(sub.name);
                  if (sub.topics.length > 0) setTopic(sub.topics[0]);
                  setActiveModule('tutor');
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${
                  isCurrent
                    ? 'bg-slate-800/90 border-teal-500/60 shadow-md ring-1 ring-teal-500/20'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">{sub.name}</h3>
                    {sub.code && (
                      <span className="text-[10px] font-mono text-teal-400 mt-0.5 inline-block">
                        {sub.code}
                      </span>
                    )}
                  </div>
                  <BookOpen className="w-4 h-4 text-teal-400" />
                </div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-1">
                  {sub.topics.length} Syllabus Topics · {sub.topics[0]}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-teal-300 font-medium">
                  <span>Open Tutor</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Bottom Split: Study Tasks & Next Exam Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Tasks */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <h3 className="font-bold text-sm text-white">Daily Study Tasks</h3>
            </div>
            <button
              onClick={() => setActiveModule('planner')}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium"
            >
              Open Planner
            </button>
          </div>

          <div className="space-y-2">
            {pendingTasks.length > 0 ? (
              pendingTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-200"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 mr-2">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => toggleTaskCompleted(t.id)}
                      className="rounded border-slate-700 text-teal-500 focus:ring-teal-400"
                    />
                    <span className={t.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {t.title}
                    </span>
                  </label>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {t.durationMinutes} min
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                All daily tasks completed! Add more in the Study Planner.
              </p>
            )}
          </div>
        </div>

        {/* Upcoming Exam Countdown Preview */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Upcoming Exam Papers</h3>
            </div>
            <button
              onClick={() => setActiveModule('countdown')}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium"
            >
              View All
            </button>
          </div>

          {nextExam ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{nextExam.curriculum} · {nextExam.subject}</span>
                <span className="font-mono text-amber-400 font-bold">{nextExam.targetGrade}</span>
              </div>
              <div className="font-bold text-sm sm:text-base text-white mt-1">
                {nextExam.paperCode}
              </div>
              <div className="text-xs text-slate-300 mt-2">
                Date: {new Date(nextExam.examDate).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
              {nextExam.notes && (
                <p className="text-[11px] text-teal-300/90 mt-1 italic">{nextExam.notes}</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">
              No target exam dates added yet. Click &apos;View All&apos; to set your exam timetable.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
