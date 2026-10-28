import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Crown, Zap, Shield, Sparkles, BookOpen } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { profile, togglePremiumMode, quotaRemaining } = useApp();

  if (!isOpen) return null;

  const isPremium = profile.planTier === 'premium';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-[#0F1E36] border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl text-white overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-6 bg-gradient-to-r from-teal-900/60 to-slate-900 border-b border-slate-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Crown className="w-5 h-5 fill-amber-400 text-amber-400" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              ScholarSpark Freemium
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Unlock Your Full Academic Potential</h2>
          <p className="text-xs text-slate-300 mt-1">
            Tailored specifically for ECZ and Cambridge IGCSE top grades.
          </p>
        </div>

        {/* Plan Comparison */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free Tier Card */}
            <div
              className={`p-4 rounded-xl border ${
                !isPremium
                  ? 'bg-slate-900/90 border-teal-500/60 ring-1 ring-teal-500/30'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Free Starter</span>
                {!isPremium && (
                  <span className="text-[10px] bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded">
                    Active Plan
                  </span>
                )}
              </div>
              <div className="text-2xl font-black mt-2 text-white">
                ZMW 0 <span className="text-xs font-normal text-slate-400">/ forever</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {quotaRemaining} AI questions left today (resets daily).
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-400" /> 25 AI tutor queries / day
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-400" /> Standard exam practice & MCQs
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-400" /> 3 flashcard decks
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-400" /> Offline revision cache
                </li>
              </ul>
            </div>

            {/* Premium Tier Card */}
            <div
              className={`p-4 rounded-xl border relative ${
                isPremium
                  ? 'bg-teal-950/40 border-amber-400/80 ring-1 ring-amber-400/50 shadow-lg'
                  : 'bg-slate-900/70 border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-sm text-amber-300">
                  <Crown className="w-4 h-4 fill-amber-400" /> ScholarSpark Pro
                </div>
                {isPremium && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-semibold px-2 py-0.5 rounded border border-amber-500/40">
                    Active
                  </span>
                )}
              </div>
              <div className="text-2xl font-black mt-2 text-white">
                ZMW 65 <span className="text-xs font-normal text-slate-400">/ month ($3.50)</span>
              </div>
              <p className="text-xs text-amber-200/90 mt-1">
                Zero daily limits + distinction-level tutor.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Unlimited AI Tutor & Voice sessions
                </li>
                <li className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Unlimited Homework Image Scans
                </li>
                <li className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Detailed M-Mark & A-Mark Rubrics
                </li>
                <li className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Automated Weakness Diagnostics
                </li>
                <li className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-amber-400" /> Priority AI reasoning model
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Notice / Testing Toggle */}
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-teal-300">
              <Shield className="w-4 h-4" />
              <span>Transparent Freemium Preview</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              We never collect credit card details without a verified payment processor. In this build preview, you can toggle between Free and Premium immediately to test unlimited queries, homework OCR, and advanced weakness diagnostics.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0B192C] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              togglePremiumMode();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${
              isPremium
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-lg shadow-amber-500/20'
            }`}
          >
            {isPremium ? (
              'Switch Back to Free Plan'
            ) : (
              <>
                <Crown className="w-4 h-4 fill-slate-950" />
                Activate Premium Mode
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
