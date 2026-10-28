import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ExamCountdownItem } from '../../types';
import { Clock, Plus, Trash2, Calendar, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

export const ExamCountdownModule: React.FC = () => {
  const { examDates, addExamDate, deleteExamDate, curriculum, subject } = useApp();

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showAddModal, setShowAddModal] = useState(false);

  // New exam form
  const [newSubject, setNewSubject] = useState(subject);
  const [newPaperCode, setNewPaperCode] = useState('Paper 1');
  const [newExamDate, setNewExamDate] = useState('2026-11-15T09:00');
  const [newTargetGrade, setNewTargetGrade] = useState('Distinction (1)');
  const [newNotes, setNewNotes] = useState('');

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateTimeRemaining = (targetIso: string) => {
    const diff = new Date(targetIso).getTime() - currentTime;
    if (diff <= 0) {
      return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { expired: false, days, hours, minutes, seconds };
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newPaperCode.trim() || !newExamDate) return;

    addExamDate({
      curriculum,
      subject: newSubject,
      paperCode: newPaperCode,
      examDate: newExamDate,
      targetGrade: newTargetGrade,
      notes: newNotes,
    });

    setShowAddModal(false);
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Target Exam Countdown</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time second-by-second countdown to keep your revision urgency focused.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Target Exam</span>
        </button>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {examDates.map((exam) => {
          const rem = calculateTimeRemaining(exam.examDate);

          return (
            <div
              key={exam.id}
              className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-teal-400 border border-slate-800 font-bold">
                      {exam.curriculum} · {exam.subject}
                    </span>
                    {exam.targetGrade && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        Target: {exam.targetGrade}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-white mt-1.5">{exam.paperCode}</h3>
                </div>

                <button
                  onClick={() => deleteExamDate(exam.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove exam date"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Ticker Display */}
              {!rem.expired ? (
                <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="p-2">
                    <div className="text-2xl font-black text-amber-400 font-mono">{rem.days}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Days</div>
                  </div>
                  <div className="p-2">
                    <div className="text-2xl font-black text-white font-mono">{rem.hours}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Hours</div>
                  </div>
                  <div className="p-2">
                    <div className="text-2xl font-black text-white font-mono">{rem.minutes}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Mins</div>
                  </div>
                  <div className="p-2">
                    <div className="text-2xl font-black text-teal-400 font-mono">{rem.seconds}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Secs</div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-900 rounded-xl text-center text-xs text-rose-400 font-bold">
                  Exam Date Has Passed
                </div>
              )}

              {/* Date & Notes */}
              <div className="text-xs text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-500 font-medium">Scheduled Date: </span>
                  {new Date(exam.examDate).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {exam.notes && (
                  <p className="text-[11px] text-teal-300/80 italic">{exam.notes}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-[#0F1E36] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl text-white overflow-hidden">
            <div className="px-6 py-4 bg-[#0B192C] border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Add Target Exam Date</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject:</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Paper Code / Description:
                </label>
                <input
                  type="text"
                  required
                  value={newPaperCode}
                  onChange={(e) => setNewPaperCode(e.target.value)}
                  placeholder="e.g. Paper 1 Non-Calculator (4024/1) or 0580/22"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Date and Time:
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newExamDate}
                  onChange={(e) => setNewExamDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Grade Goal:
                </label>
                <input
                  type="text"
                  value={newTargetGrade}
                  onChange={(e) => setNewTargetGrade(e.target.value)}
                  placeholder="e.g. Distinction (1) or A*"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Study Notes / Reminders:
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Bring mathematical instruments and geometric set"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  Save Exam Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
