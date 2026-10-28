import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  BookOpen,
  Wifi,
  WifiOff,
  Crown,
  Search,
  Menu,
  X,
  User,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { CURRICULA_DATA } from '../data/curriculums';

interface NavbarProps {
  onOpenCurriculumModal: () => void;
  onOpenUpgradeModal: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCurriculumModal,
  onOpenUpgradeModal,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const {
    curriculum,
    grade,
    subject,
    profile,
    quotaRemaining,
    isOnline,
    searchQuery,
    setSearchQuery,
    setActiveModule,
  } = useApp();

  const [showSearchInput, setShowSearchInput] = useState(false);

  const currMeta = CURRICULA_DATA[curriculum];

  return (
    <header className="sticky top-0 z-40 bg-[#0B192C] text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile menu toggle + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setActiveModule('dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-teal-300 transition-colors">
                  ScholarSpark<span className="text-teal-400">AI</span>
                </span>
              </div>
              <p className="text-[10px] text-teal-200/80 -mt-0.5 hidden sm:block tracking-wide">
                Understand more. Achieve more.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Curriculum Quick Switcher Badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCurriculumModal}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs sm:text-sm font-medium transition-colors text-slate-200"
            title="Click to switch curriculum or subject"
          >
            <GraduationCap className="w-4 h-4 text-teal-400 shrink-0" />
            <div className="text-left flex items-center gap-1">
              <span className="font-semibold text-white">
                {curriculum === 'ECZ' ? 'ECZ Zambia' : 'Cambridge IGCSE'}
              </span>
              <span className="hidden md:inline text-slate-400">· {grade} · {subject}</span>
            </div>
            <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ml-1">
              Switch
            </span>
          </button>
        </div>

        {/* Right side: Search, Online, Quota, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick search */}
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search syllabus, formulas..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Network indicator */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
              isOnline
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                : 'bg-amber-950/60 text-amber-300 border border-amber-800/60 animate-pulse'
            }`}
            title={isOnline ? 'Online - Live Gemini AI enabled' : 'Offline Mode - Browsing cached revision notes & flashcards'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Freemium Quota badge */}
          {profile.planTier === 'premium' ? (
            <div
              onClick={onOpenUpgradeModal}
              className="cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-300 text-xs font-semibold hover:bg-amber-500/30 transition-colors"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">Premium</span>
            </div>
          ) : (
            <button
              onClick={onOpenUpgradeModal}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg text-teal-300 text-xs transition-colors"
              title="Daily free queries remaining"
            >
              <span className="font-semibold">{quotaRemaining}</span>
              <span className="hidden sm:inline text-slate-400">/ 25 AI free</span>
              <Crown className="w-3 h-3 text-amber-400 ml-0.5" />
            </button>
          )}

          {/* Profile Icon */}
          <button
            onClick={() => setActiveModule('settings')}
            className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
            title="Student Settings & Profile"
          >
            <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
              {profile.name.charAt(0)}
            </div>
            <span className="hidden lg:inline">{profile.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
