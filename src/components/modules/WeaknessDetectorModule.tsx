import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  TrendingUp,
  Brain,
  FileCheck2,
  Layers,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const WeaknessDetectorModule: React.FC = () => {
  const {
    weaknessAnalysis,
    quizAttempts,
    setSubject,
    setTopic,
    setActiveModule,
    curriculum,
  } = useApp();

  const handleAction = (
    action: 'tutor' | 'practice' | 'flashcards',
    subjectName: string,
    topicName: string
  ) => {
    setSubject(subjectName);
    setTopic(topicName);
    setActiveModule(action);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Weakness Detector & Remedial Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Data-backed topic diagnostic derived exclusively from your actual practice attempts.
          </p>
        </div>

        <div className="text-[11px] font-mono text-teal-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          Zero Hallucinated Metrics · Multi-Attempt Evidence Required
        </div>
      </div>

      {/* Main Analysis Cards */}
      {weaknessAnalysis.length > 0 ? (
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Detected Performance by Topic ({weaknessAnalysis.length} Tracked Topic{weaknessAnalysis.length > 1 ? 's' : ''})
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weaknessAnalysis.map((item, idx) => {
              let badgeColor = 'bg-slate-800 text-slate-300';
              let borderColor = 'border-slate-800';

              if (item.trend === 'Critical Weakness') {
                badgeColor = 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
                borderColor = 'border-rose-900/60 bg-rose-950/20';
              } else if (item.trend === 'Needs Attention') {
                badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
                borderColor = 'border-amber-900/50 bg-amber-950/15';
              } else if (item.trend === 'Improving') {
                badgeColor = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
                borderColor = 'border-cyan-900/50 bg-cyan-950/15';
              } else if (item.trend === 'Mastered') {
                badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
                borderColor = 'border-emerald-900/50 bg-emerald-950/15';
              }

              return (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl border transition-all space-y-4 ${borderColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        {item.subject}
                      </span>
                      <h3 className="font-bold text-base text-white mt-0.5">{item.topic}</h3>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {item.trend}
                      </span>
                      <div className="text-lg font-black text-white mt-1">
                        {item.averageScore}%
                      </div>
                    </div>
                  </div>

                  {/* Evidence Statement */}
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                    <span className="font-semibold text-teal-400">Audit Evidence: </span>
                    {item.evidence}
                  </div>

                  {/* 1-Click Action Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleAction('tutor', item.subject, item.topic)}
                      className="px-3 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-semibold text-xs border border-teal-500/30 transition-colors flex items-center gap-1.5"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      <span>Revise Topic with Tutor</span>
                    </button>

                    <button
                      onClick={() => handleAction('practice', item.subject, item.topic)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>5-Question Drill</span>
                    </button>

                    <button
                      onClick={() => handleAction('flashcards', item.subject, item.topic)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Flashcards</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 rounded-2xl bg-[#0F1E36] border border-slate-800 text-center space-y-4 max-w-xl mx-auto shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">No Attempt Data Logged Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              ScholarSpark never invents or fabricates fake student grades. Take practice questions in the Exam Practice module or complete a mock paper to build your authentic Weakness Profile.
            </p>
          </div>
          <button
            onClick={() => setActiveModule('practice')}
            className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-500/20"
          >
            Start Diagnostic Practice Drill
          </button>
        </div>
      )}

      {/* Quiz Attempt History Log */}
      {quizAttempts.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Verified Quiz History ({quizAttempts.length})</h3>
            <span className="text-[11px] text-slate-400">Stored locally in your secure profile</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Curriculum</th>
                  <th className="py-2.5 px-3">Subject & Topic</th>
                  <th className="py-2.5 px-3 text-right">Marks Earned</th>
                  <th className="py-2.5 px-3 text-right">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {quizAttempts.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {new Date(att.date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-teal-400 font-mono text-[10px]">
                        {att.curriculum} {att.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-white font-semibold">{att.topic}</div>
                      <div className="text-[10px] text-slate-500">{att.subject}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {att.marksEarned} / {att.totalMarks}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                          att.percentage >= 75
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : att.percentage >= 50
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {att.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
