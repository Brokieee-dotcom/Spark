import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { requestApi } from '../../services/api';
import { Clock, Plus, Trash2, Globe, Search, ExternalLink, AlertCircle } from 'lucide-react';

interface GroundingSource {
  title: string;
  uri: string;
}

export const ExamCountdownModule: React.FC = () => {
  const { examDates, addExamDate, deleteExamDate, curriculum, grade, subject, setQuotaInfo, quotaLimit } = useApp();

  const isForm1To3 = curriculum === 'ZambiaCBC' && /^Form [123]\b/.test(grade);

  const [searchQuery, setSearchQuery] = useState(
    isForm1To3
      ? `Zambia CBC ${grade} school-based assessment calendar`
      : `${curriculum} Grade 12 & IGCSE 2026 exam timetable dates`
  );
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchAnswer, setSearchAnswer] = useState<string | null>(null);
  const [searchSources, setSearchSources] = useState<GroundingSource[]>([]);

  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showAddModal, setShowAddModal] = useState(false);

  // New exam / assessment form
  const [newSubject, setNewSubject] = useState(subject);
  const [newPaperCode, setNewPaperCode] = useState(isForm1To3 ? 'Term 1 Assessment Test' : 'Paper 1');
  const [newTerm, setNewTerm] = useState<'Term 1' | 'Term 2'>('Term 1');
  const [newExamDate, setNewExamDate] = useState(isForm1To3 ? '2027-03-19T08:30' : '2026-11-15T09:00');
  const [newTargetGrade, setNewTargetGrade] = useState(isForm1To3 ? 'Term 1 Mastery' : 'Distinction (1)');
  const [newNotes, setNewNotes] = useState('');

  // Keep search and modal defaults aligned when switching between Form 1-3 and exam grades
  useEffect(() => {
    setNewSubject(subject);
    if (isForm1To3) {
      setSearchQuery(`Zambia CBC ${grade} Term 1 and Term 2 assessment calendar`);
      setNewPaperCode('Term 1 Assessment Test');
      setNewExamDate('2027-03-19T08:30');
      setNewTargetGrade('Term 1 Mastery');
    } else {
      setSearchQuery(`${curriculum} ${grade} exam timetable dates`);
      setNewPaperCode('Paper 1');
      setNewExamDate('2026-11-15T09:00');
      setNewTargetGrade('Distinction (1)');
    }
  }, [curriculum, grade, subject, isForm1To3]);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const visibleCountdowns = examDates.filter((item) => {
    if (isForm1To3) {
      return item.assessmentKind === 'term_assessment' && (item.term === 'Term 1' || item.term === 'Term 2');
    }
    return item.assessmentKind !== 'term_assessment';
  });

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
      paperCode: isForm1To3 ? `${newTerm} · ${newPaperCode}` : newPaperCode,
      examDate: newExamDate,
      targetGrade: newTargetGrade,
      notes: newNotes,
      assessmentKind: isForm1To3 ? 'term_assessment' : 'final_exam',
      ...(isForm1To3 ? { term: newTerm } : {}),
    });

    setShowAddModal(false);
    setNewNotes('');
  };

  const handleSearchExamUpdates = async (customQuery?: string) => {
    const q = (customQuery ?? searchQuery).trim();
    if (q.length < 4 || searching) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await requestApi<{
        answer: string;
        groundingSources?: GroundingSource[];
      }>('/api/search/syllabus', {
        query: q,
        curriculum,
        subject,
      });
      if (res.quotaRemaining !== undefined) {
        setQuotaInfo(res.quotaRemaining, res.quotaLimit ?? quotaLimit);
      }
      setSearchAnswer(res.data.answer);
      setSearchSources(Array.isArray(res.data.groundingSources) ? res.data.groundingSources : []);
    } catch (err: any) {
      setSearchError(err?.message || 'Unable to verify exam updates online right now.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">
              {isForm1To3 ? 'Term 1 & Term 2 Assessment Test Counter' : 'Target Exam Countdown'}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isForm1To3
              ? `${grade} tracks assessment tests for the first two terms of the year (no final exam day counter).`
              : 'Real-time second-by-second countdown to keep your revision focused.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{isForm1To3 ? 'Add Assessment Test' : 'Add Target Exam'}</span>
        </button>
      </div>

      {/* Live Web Search for Exam Dates & Syllabus Circulars */}
      <div className="p-5 rounded-xl bg-[#0F1E36] border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">
              Verify Live Exam Timetables &amp; Syllabus Updates (Google Search)
            </h2>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                const q = isForm1To3
                  ? `Zambia CBC ${grade} Term 1 Term 2 assessment test school calendar`
                  : `${curriculum} ${new Date().getFullYear()} official examination timetable dates`;
                setSearchQuery(q);
                handleSearchExamUpdates(q);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-sky-300"
            >
              {isForm1To3 ? 'Term 1 & 2 Calendar' : `${curriculum} Exam Dates`}
            </button>
            <button
              type="button"
              onClick={() => {
                const q = `${curriculum} ${subject} syllabus updates and exam structure`;
                setSearchQuery(q);
                handleSearchExamUpdates(q);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-teal-300"
            >
              {subject} Syllabus Check
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchExamUpdates();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search live ${curriculum} dates or syllabus updates...`}
            className="flex-1 min-w-0 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={searching || searchQuery.trim().length < 4}
            className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{searching ? 'Searching...' : 'Search Web'}</span>
          </button>
        </form>

        {searchError && (
          <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {searchAnswer && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs text-slate-200 leading-relaxed">
            <div className="whitespace-pre-wrap">{searchAnswer}</div>
            {searchSources.length > 0 && (
              <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
                {searchSources.map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-sky-400 text-[11px] text-sky-300"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[240px]">{src.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Countdown Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleCountdowns.map((exam) => {
          const rem = calculateTimeRemaining(exam.examDate);

          return (
            <div
              key={exam.id}
              className="p-5 rounded-xl bg-[#0F1E36] border border-slate-800 hover:border-slate-700 transition-colors space-y-4 relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-teal-400 border border-slate-800 font-bold">
                      {exam.term ? `${exam.term} · ` : `${exam.curriculum} · `}{exam.subject}
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
                  title={isForm1To3 ? 'Remove assessment date' : 'Remove exam date'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Ticker Display */}
              {!rem.expired ? (
                <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-xl bg-slate-950/70 border border-slate-800">
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
                  {isForm1To3 ? 'Assessment Date Has Passed' : 'Exam Date Has Passed'}
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

      {/* Add Exam / Term Assessment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
          <div className="bg-[#0F1E36] border border-slate-700 w-full max-w-md rounded-xl text-white overflow-hidden">
            <div className="px-6 py-4 bg-[#0B192C] border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {isForm1To3 ? 'Add Term 1 or Term 2 Assessment Test' : 'Add Target Exam Date'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExam} className="p-6 space-y-4">
              {isForm1To3 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    School Term (First Two Terms Only):
                  </label>
                  <select
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value as 'Term 1' | 'Term 2')}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="Term 1">Term 1 Assessment Test</option>
                    <option value="Term 2">Term 2 Assessment Test</option>
                  </select>
                </div>
              )}

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
                  {isForm1To3 ? 'Assessment Title / Description:' : 'Paper Code / Description:'}
                </label>
                <input
                  type="text"
                  required
                  value={newPaperCode}
                  onChange={(e) => setNewPaperCode(e.target.value)}
                  placeholder={isForm1To3 ? 'e.g. Mid-Term Practical & Written Test' : 'e.g. Paper 1 Non-Calculator (4024/1)'}
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
                  {isForm1To3 ? 'Target Score / Goal:' : 'Target Grade Goal:'}
                </label>
                <input
                  type="text"
                  value={newTargetGrade}
                  onChange={(e) => setNewTargetGrade(e.target.value)}
                  placeholder={isForm1To3 ? 'e.g. 85%+ Competence Mastery' : 'e.g. Distinction (1) or A*'}
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
                  placeholder="e.g. Revise competence rubric and practical worksheets"
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
                  {isForm1To3 ? 'Save Assessment Date' : 'Save Exam Date'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
