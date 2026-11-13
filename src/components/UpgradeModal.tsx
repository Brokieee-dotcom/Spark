import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, Crown, Shield, Lock } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const { quotaRemaining, quotaLimit } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#0F1E36] border border-slate-700 w-full max-w-xl rounded-2xl shadow-2xl text-white overflow-hidden my-auto">
        {/* Header */}
        <div className="relative px-6 py-6 bg-gradient-to-r from-teal-900/60 to-slate-900 border-b border-slate-800">
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Crown className="w-5 h-5 fill-amber-400 text-amber-400" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
              ScholarSpark Freemium Plans
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">Plans & Daily AI Allowance</h2>
          <p className="text-xs text-slate-300 mt-1">
            Tailored for ECZ and Cambridge IGCSE revision with server-enforced fair limits.
          </p>
        </div>

        {/* Plan Comparison */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Free Tier Card */}
            <div className="p-4 rounded-xl border bg-slate-900/90 border-teal-500/60 ring-1 ring-teal-500/30">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">Free Starter</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-semibold px-2 py-0.5 rounded">
                  Active Plan
                </span>
              </div>
              <div className="text-2xl font-black mt-2 text-white">
                ZMW 0 <span className="text-xs font-normal text-slate-400">/ forever</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {quotaRemaining} / {quotaLimit} AI requests left today (resets every 24h).
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" /> {quotaLimit} AI tutor & practice queries / day
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Exam Practice & M/A marking
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Smart Flashcards & Notes Summarizer
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Offline revision cache
                </li>
              </ul>
            </div>

            {/* Premium Tier Card */}
            <div className="p-4 rounded-xl border relative bg-slate-900/70 border-amber-500/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-sm text-amber-300">
                  <Crown className="w-4 h-4 fill-amber-400" /> ScholarSpark Pro
                </div>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Subscription Required
                </span>
              </div>
              <div className="text-2xl font-black mt-2 text-white">
                ZMW 65 <span className="text-xs font-normal text-slate-400">/ month ($3.50)</span>
              </div>
              <p className="text-xs text-amber-200/90 mt-1">
                Expanded limits & priority diagnostics.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-200">
                <li className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Expanded AI Tutor & Voice sessions
                </li>
                <li className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Higher daily Homework Scans
                </li>
                <li className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Multi-subject Weakness Diagnostics
                </li>
                <li className="flex items-center gap-1.5 font-medium">
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" /> Unlimited cloud-synced flashcard decks
                </li>
              </ul>
            </div>
          </div>

          {/* Transparent Payment Notice */}
          <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-teal-300">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Billing & Entitlement Verification</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Paid subscriptions require a configured server-side payment provider (such as Stripe or Mobile Money webhooks) and authenticated subscription verification. Plan limits are strictly enforced on the backend server.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0B192C] border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Free tier resets automatically every 24 hours.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors"
          >
            Continue on Free Plan
          </button>
        </div>
      </div>
    </div>
  );
};
