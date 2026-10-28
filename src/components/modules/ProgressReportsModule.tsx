import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LineChart,
  Printer,
  Download,
  Award,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const ProgressReportsModule: React.FC = () => {
  const { profile, curriculum, grade, quizAttempts, weaknessAnalysis, tasks, flashcardDecks, exportDataJson } = useApp();

  const totalEarned = quizAttempts.reduce((acc, q) => acc + q.marksEarned, 0);
  const totalPossible = quizAttempts.reduce((acc, q) => acc + q.totalMarks, 0);
  const overallAvg = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const totalStudiedMinutes = tasks.reduce(
    (acc, t) => acc + (t.completed ? t.durationMinutes : 0),
    0
  );

  const totalFlashcards = flashcardDecks.reduce((acc, d) => acc + d.cards.length, 0);
  const knownCards = flashcardDecks.reduce(
    (acc, d) => acc + d.cards.filter((c) => c.status === 'known').length,
    0
  );

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleExportJson = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScholarSpark_Report_${profile.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner (hidden in print) */}
      <div className="print:hidden p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <LineChart className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Academic Progress Report</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Student-controlled diagnostic report. Preview, print to PDF, or export data securely.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-md shadow-teal-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="p-8 sm:p-10 rounded-2xl bg-[#0F1E36] border border-slate-800 text-white space-y-8 shadow-2xl print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        {/* Report Header */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xl sm:text-2xl font-black text-white print:text-slate-900 tracking-tight">
              ScholarSpark <span className="text-teal-400 print:text-teal-700">AI</span> Academic Report
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
              Student: <strong className="text-white print:text-black">{profile.name}</strong> · Target: <strong>{curriculum} ({grade})</strong>
            </p>
            {profile.schoolOrCenter && (
              <p className="text-[11px] text-slate-500 print:text-slate-600">
                School/Center: {profile.schoolOrCenter}
              </p>
            )}
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600 font-mono">
            <div>Generated: {new Date().toLocaleDateString('en-GB')}</div>
            <div className="text-teal-400 print:text-teal-700 font-bold mt-0.5">Verified Student Audit</div>
          </div>
        </div>

        {/* Diagnostic Limitation Notice */}
        {quizAttempts.length < 3 && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 print:text-amber-800 text-xs">
            <strong>Audit Note:</strong> You have logged {quizAttempts.length} practice attempt{quizAttempts.length === 1 ? '' : 's'}. Topic trends become statistically robust with 3 or more logged attempts across different syllabus units.
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-center">
            <div className="text-2xl font-black text-teal-400 print:text-teal-700">{overallAvg}%</div>
            <div className="text-xs text-slate-400 print:text-slate-600 mt-1">Average Score</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-center">
            <div className="text-2xl font-black text-white print:text-black">{quizAttempts.length}</div>
            <div className="text-xs text-slate-400 print:text-slate-600 mt-1">Practice Drills</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-center">
            <div className="text-2xl font-black text-cyan-300 print:text-cyan-700">{totalStudiedMinutes}m</div>
            <div className="text-xs text-slate-400 print:text-slate-600 mt-1">Study Logged</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-center">
            <div className="text-2xl font-black text-amber-400 print:text-amber-700">{knownCards}</div>
            <div className="text-xs text-slate-400 print:text-slate-600 mt-1">Cards Mastered</div>
          </div>
        </div>

        {/* Topic Mastery Breakdown */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 print:text-slate-700">
            Syllabus Topic Breakdown
          </h3>

          {weaknessAnalysis.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 print:border-slate-300 text-[11px] text-slate-400 print:text-slate-600 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Subject & Topic</th>
                    <th className="py-2.5 px-3">Audit Evidence</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                  {weaknessAnalysis.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 print:hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-white print:text-black">{item.topic}</div>
                        <div className="text-[10px] text-slate-400 print:text-slate-600">{item.subject}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 print:text-slate-700">{item.evidence}</td>
                      <td className="py-2.5 px-3 font-semibold text-[11px]">
                        <span
                          className={
                            item.trend === 'Mastered'
                              ? 'text-emerald-400 print:text-emerald-700'
                              : item.trend === 'Improving'
                              ? 'text-cyan-400 print:text-cyan-700'
                              : 'text-rose-400 print:text-rose-700'
                          }
                        >
                          {item.trend}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">
                        {item.averageScore}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No topic attempts logged yet. Take quizzes in the Exam Practice module to build your topic mastery record.
            </p>
          )}
        </div>

        {/* Recommended Action Plan */}
        <div className="p-5 rounded-xl bg-slate-900/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 space-y-2">
          <h4 className="font-bold text-xs uppercase tracking-wider text-teal-400 print:text-teal-800">
            Recommended Remedial Action Plan:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 print:text-slate-800 leading-relaxed">
            {weaknessAnalysis.some((w) => w.trend === 'Critical Weakness') ? (
              <li>
                Prioritize urgent practice on critical weakness topics before advancing to full-length timed mock papers.
              </li>
            ) : (
              <li>Maintain regular 30-minute recall drills using the Smart Flashcards module.</li>
            )}
            <li>Practice past papers under strict exam timed conditions with non-calculator papers where applicable.</li>
            <li>Review formula sheets and definitions weekly in the Notes Summarizer.</li>
          </ul>
        </div>

        {/* Footer Notice */}
        <div className="pt-4 border-t border-slate-800 print:border-slate-300 text-[11px] text-slate-500 print:text-slate-600 flex items-center justify-between">
          <span>ScholarSpark AI · Understand more. Achieve more.</span>
          <span>Independent Revision Platform</span>
        </div>
      </div>
    </div>
  );
};
