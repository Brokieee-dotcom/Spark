import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { requestApi } from '../../services/api';
import {
  FileText,
  Sparkles,
  Bookmark,
  Copy,
  Check,
  Upload,
  AlertCircle,
  HelpCircle,
  ListChecks,
  BookOpen,
} from 'lucide-react';

interface SummaryData {
  summary: string;
  keyTerms: { term: string; definition: string; examRelevance?: string }[];
  revisionPoints: string[];
  practiceQuestions: { question: string; answer: string }[];
}

export const NotesSummarizerModule: React.FC = () => {
  const { curriculum, subject, topic, profile, saveNote } = useApp();

  const [notesText, setNotesText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('File is too large. Please upload a text file under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setNotesText(reader.result as string);
    };
    reader.readAsText(file);
  };

  const handleSummarize = async () => {
    if (!notesText.trim() || notesText.length < 20) {
      setError('Please provide at least 20 characters of notes to summarize.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await requestApi<{ summary: SummaryData }>(
        '/api/notes/summarize',
        {
          text: notesText,
          curriculum,
          subject,
        },
        { isPremium: profile.planTier === 'premium' }
      );

      setSummaryData(res.data.summary);
      setRevealedAnswers({});
    } catch (err: any) {
      console.error('Summarize error:', err);
      setError(err.message || 'Failed to summarize notes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!summaryData) return;
    const textToCopy = `EXECUTIVE SUMMARY:\n${summaryData.summary}\n\nKEY REVISION POINTS:\n${summaryData.revisionPoints.map((p) => `• ${p}`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToMyNotes = () => {
    if (!summaryData) return;
    saveNote({
      title: `${subject}: ${topic} Summary`,
      curriculum,
      subject,
      topic,
      originalNotes: notesText,
      executiveSummary: summaryData.summary,
      keyTerms: summaryData.keyTerms,
      revisionPoints: summaryData.revisionPoints,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">AI Notes Summarizer & Key Terms Extractor</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Turn lengthy textbooks or handwritten lecture notes into high-yield revision summaries and self-check questions.
          </p>
        </div>

        <div className="text-[11px] font-mono text-teal-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          Original Source Material Preserved Alongside Summary
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs text-rose-400 hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Text (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Your Source Study Notes</h3>
              <label className="cursor-pointer text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload .txt / .md</span>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={12}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Paste class notes, definitions, or textbook paragraphs here (e.g. details on respiration or circle geometry)..."
              className="w-full p-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 font-sans"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{notesText.length} characters</span>
              <span>Target: {curriculum} {subject}</span>
            </div>

            <button
              onClick={handleSummarize}
              disabled={loading || notesText.length < 20}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-md shadow-teal-500/20 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing High-Yield Summary...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Summary & Definitions</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Structured Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {summaryData ? (
            <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-6 shadow-xl">
              {/* Actions Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    High-Yield Synthesis
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopySummary}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSaveToMyNotes}
                    className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold border border-teal-500/30 flex items-center gap-1.5 transition-colors"
                  >
                    {saved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                    <span>{saved ? 'Saved!' : 'Save to My Notes'}</span>
                  </button>
                </div>
              </div>

              {/* Executive Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Executive Summary:
                </h4>
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {summaryData.summary}
                </div>
              </div>

              {/* Key Terms & Definitions */}
              {summaryData.keyTerms && summaryData.keyTerms.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Syllabus Terms & Exact Definitions:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {summaryData.keyTerms.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1"
                      >
                        <div className="font-bold text-teal-300">{t.term}</div>
                        <div className="text-slate-300 text-[11px] leading-relaxed">
                          {t.definition}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Revision Points Checklist */}
              {summaryData.revisionPoints && summaryData.revisionPoints.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Core Revision Checklist:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {summaryData.revisionPoints.map((pt, pIdx) => (
                      <li
                        key={pIdx}
                        className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80"
                      >
                        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Diagnostic Self-Check Questions */}
              {summaryData.practiceQuestions && summaryData.practiceQuestions.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Diagnostic Recall Questions:
                  </h4>
                  {summaryData.practiceQuestions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2"
                    >
                      <div className="font-semibold text-white flex items-start gap-2">
                        <span className="text-teal-400 font-mono font-bold">Q{qIdx + 1}:</span>
                        <span>{q.question}</span>
                      </div>

                      {revealedAnswers[qIdx] ? (
                        <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-[11px]">
                          <strong>Answer:</strong> {q.answer}
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setRevealedAnswers((prev) => ({ ...prev, [qIdx]: true }))
                          }
                          className="text-[11px] text-teal-400 hover:text-teal-300 font-semibold"
                        >
                          Show Model Answer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Empty placeholder */
            <div className="h-full min-h-[350px] p-8 rounded-2xl bg-[#0F1E36]/40 border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500">
                <BookOpen className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="font-bold text-base text-white">No Notes Summarized Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Paste your lecture notes, textbook passages, or definitions on the left to extract clear key terms, checklists, and self-test questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
