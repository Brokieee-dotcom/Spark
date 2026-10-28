import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  User,
  Shield,
  Download,
  Upload,
  Crown,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const {
    profile,
    updateProfile,
    curriculum,
    setCurriculum,
    togglePremiumMode,
    clearAllLocalData,
    exportDataJson,
    importDataJson,
    quotaRemaining,
  } = useApp();

  const [name, setName] = useState(profile.name);
  const [school, setSchool] = useState(profile.schoolOrCenter || '');
  const [examYear, setExamYear] = useState(profile.targetExamYear);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      schoolOrCenter: school.trim(),
      targetExamYear: examYear,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDataJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScholarSpark_Backup_${name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const success = importDataJson(reader.result as string);
      if (success) {
        setImportStatus('Backup data restored successfully!');
      } else {
        setImportStatus('Invalid JSON backup file.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#0B192C] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-500/20 text-teal-400">
              <Settings className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-white">Student Profile & Settings</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your student identity, data backups, and subscription tier.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Profile Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <User className="w-4 h-4 text-teal-400" /> Student Profile Information
              </h3>
              {savedSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Student Full Name:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  School or Examination Center:
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. David Kaunda Technical, Kabulonga Boys, or International School"
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Exam Year:
                  </label>
                  <select
                    value={examYear}
                    onChange={(e) => setExamYear(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="2026">2026 Sitting</option>
                    <option value="2027">2027 Sitting</option>
                    <option value="2028">2028 Sitting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Board:
                  </label>
                  <select
                    value={curriculum}
                    onChange={(e) => setCurriculum(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="ECZ">ECZ (Examinations Council of Zambia)</option>
                    <option value="Cambridge">Cambridge IGCSE / International</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-teal-500/20"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Data Ownership & Security Card */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="font-bold text-white flex items-center gap-1.5 text-teal-400">
              <Shield className="w-4 h-4" /> Privacy & Local-First Security Architecture
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ScholarSpark AI is architected with privacy-by-design. Your practice attempts, flashcard ratings, and notes are stored locally in your browser with zero password exposure. No student personal information or homework images are sold or permanently retained on cloud servers.
            </p>
          </div>
        </div>

        {/* Right: Plan Status & Backups (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Plan Status */}
          <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" /> Plan & Usage
            </h3>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Tier:</span>
                <span
                  className={`font-mono font-bold uppercase px-2 py-0.5 rounded text-[10px] ${
                    profile.planTier === 'premium'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-teal-500/20 text-teal-300'
                  }`}
                >
                  {profile.planTier}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Daily Free AI Queries Left:</span>
                <span className="font-mono font-bold text-white">
                  {profile.planTier === 'premium' ? 'Unlimited' : `${quotaRemaining} / 25`}
                </span>
              </div>
            </div>

            <button
              onClick={togglePremiumMode}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-teal-300 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>
                Toggle Plan Mode ({profile.planTier === 'premium' ? 'Switch to Free' : 'Test Premium'})
              </span>
            </button>
          </div>

          {/* Backup & Data Export */}
          <div className="p-6 rounded-2xl bg-[#0F1E36] border border-slate-800 space-y-4 shadow-xl">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-teal-400" /> Data Backup & Migration
            </h3>

            {importStatus && (
              <div className="p-2.5 bg-teal-500/10 border border-teal-500/30 text-teal-300 rounded-lg text-xs">
                {importStatus}
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleExportBackup}
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Full Data Backup (JSON)</span>
              </button>

              <label className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4 text-teal-400" />
                <span>Import Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
