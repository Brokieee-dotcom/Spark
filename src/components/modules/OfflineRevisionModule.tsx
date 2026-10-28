import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HardDriveDownload,
  Wifi,
  WifiOff,
  Layers,
  FileText,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const OfflineRevisionModule: React.FC = () => {
  const { isOnline, flashcardDecks, savedNotes, clearAllLocalData, setActiveModule } = useApp();

  const [clearSuccess, setClearSuccess] = useState(false);

  // Estimate storage usage
  const estimateStorageKB = () => {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += (localStorage[key].length * 2);
        }
      }
      return Math.round(total / 1024);
    } catch {
      return 120;
    }
  };

  const handleClearCache = () => {
    if (window.confirm('Clear all offline cached decks, notes, and quiz history?')) {
      clearAllLocalData();
      setClearSuccess(true);
      setTimeout(() => setClearSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <HardDriveDownload className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Offline Revision & Local Storage Hub</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access your saved revision notes, flashcard decks, and exam blueprints without internet.
          </p>
        </div>

        {/* Network Status Badge */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
            isOnline
              ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
              : 'bg-amber-950/60 border-amber-800/80 text-amber-300'
          }`}
        >
          {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-amber-400" />}
          <span>{isOnline ? 'Online - Live AI Active' : 'Offline Mode (Local Storage)'}</span>
        </div>
      </div>

      {/* Honest Offline Policy Notice */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 font-bold text-teal-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Transparent Offline Capabilities</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Generating new AI explanations, multimodal OCR scans, or new quiz sets requires an active internet connection to communicate with Gemini models. However, <strong>all previously saved notes, flashcard decks, and practice history remain 100% available offline</strong> without consuming any mobile data.
        </p>
      </div>

      {/* Storage Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Offline Decks</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">{flashcardDecks.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Available for active recall offline</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Saved Summaries</span>
            <FileText className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">{savedNotes.length}</div>
          <p className="text-[11px] text-slate-400 mt-1">Class notes & key term definitions</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Cache Size</span>
            <HardDriveDownload className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {estimateStorageKB()} KB
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Safe client storage</p>
        </div>
      </div>

      {/* Cached Notes List */}
      <div className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-white">Cached Revision Notes ({savedNotes.length})</h3>
          <button
            onClick={() => setActiveModule('notes')}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium"
          >
            Create New Note
          </button>
        </div>

        {savedNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {savedNotes.map((note) => (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{note.title}</h4>
                  <span className="text-[10px] font-mono text-teal-400 px-2 py-0.5 rounded bg-slate-950">
                    {note.curriculum}
                  </span>
                </div>
                <p className="text-slate-300 line-clamp-2 leading-relaxed">
                  {note.executiveSummary}
                </p>
                <div className="text-[10px] text-slate-500 pt-1">
                  Saved: {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-3 text-center">
            No notes saved to offline storage yet. Summaries created in Notes Summarizer or Homework Scanner can be saved here.
          </p>
        )}
      </div>

      {/* Storage Management */}
      <div className="p-5 rounded-2xl bg-[#0F1E36] border border-slate-800 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-white">Clear Offline Storage</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Reset all local quiz history, cached decks, and planner tasks.
          </p>
        </div>

        <button
          onClick={handleClearCache}
          className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-950 text-rose-300 border border-rose-900 text-xs font-semibold transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{clearSuccess ? 'Cache Cleared!' : 'Clear Cache'}</span>
        </button>
      </div>
    </div>
  );
};
