import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp, AppModuleView } from '../context/AppContext';
import {
  Sparkles,
  Wifi,
  WifiOff,
  Crown,
  Search,
  Menu,
  X,
  GraduationCap,
  BookOpen,
  Compass,
} from 'lucide-react';
import { CURRICULA_DATA } from '../data/curriculums';

interface NavbarProps {
  onOpenCurriculumModal: () => void;
  onOpenUpgradeModal: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const MODULE_SEARCH_ITEMS: { id: AppModuleView; label: string; keywords: string }[] = [
  { id: 'dashboard', label: 'Dashboard', keywords: 'home overview stats' },
  { id: 'tutor', label: 'AI Tutor', keywords: 'chat ask explanation help' },
  { id: 'practice', label: 'Exam Practice', keywords: 'quiz test mcq structured marking' },
  { id: 'pastpapers', label: 'Past Paper Trainer', keywords: 'past paper archive upload' },
  { id: 'scanner', label: 'Homework Scanner', keywords: 'camera ocr photo scan' },
  { id: 'voice', label: 'Voice Tutor', keywords: 'mic speech audio speak' },
  { id: 'weakness', label: 'Weakness Detector', keywords: 'weak topics analytics diagnostic' },
  { id: 'flashcards', label: 'Smart Flashcards', keywords: 'cards recall memorize flip' },
  { id: 'planner', label: 'Study Planner', keywords: 'tasks timetable schedule calendar' },
  { id: 'challenge', label: 'Challenge Mode', keywords: 'timed blitz speed leaderboard' },
  { id: 'notes', label: 'Notes Summarizer', keywords: 'summary key terms definitions' },
  { id: 'reports', label: 'Progress Reports', keywords: 'print pdf export report' },
  { id: 'countdown', label: 'Exam Countdown', keywords: 'exam date days timer' },
  { id: 'offline', label: 'Offline Revision', keywords: 'cache storage download' },
  { id: 'settings', label: 'Settings & Data', keywords: 'profile backup export' },
];

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
    setSubject,
    setTopic,
    profile,
    quotaRemaining,
    quotaLimit,
    isOnline,
    searchQuery,
    setSearchQuery,
    setActiveModule,
  } = useApp();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { modules: [], topics: [] };

    const modules = MODULE_SEARCH_ITEMS.filter(
      (m) => m.label.toLowerCase().includes(q) || m.keywords.toLowerCase().includes(q)
    ).slice(0, 4);

    const currMeta = CURRICULA_DATA[curriculum];
    const topics: { subject: string; topic: string }[] = [];
    for (const sub of currMeta.subjects) {
      for (const t of sub.topics) {
        if (t.toLowerCase().includes(q) || sub.name.toLowerCase().includes(q)) {
          topics.push({ subject: sub.name, topic: t });
        }
      }
    }

    return { modules, topics: topics.slice(0, 6) };
  }, [searchQuery, curriculum]);

  const handleSelectTopic = (subName: string, topicName: string, target: AppModuleView) => {
    setSubject(subName);
    setTopic(topicName);
    setActiveModule(target);
    setSearchQuery('');
    setDropdownOpen(false);
    setMobileSearchOpen(false);
  };

  const handleSelectModule = (id: AppModuleView) => {
    setActiveModule(id);
    setSearchQuery('');
    setDropdownOpen(false);
    setMobileSearchOpen(false);
  };

  const hasResults = searchResults.modules.length > 0 || searchResults.topics.length > 0;

  return (
    <header className="sticky top-0 z-40 bg-[#0B192C] text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile menu toggle + Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setActiveModule('dashboard')}
            className="flex items-center gap-2 cursor-pointer group min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 fill-current" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm sm:text-lg tracking-tight text-white group-hover:text-teal-300 transition-colors truncate">
                  ScholarSpark<span className="text-teal-400">AI</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
                Understand more. Achieve more.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Curriculum Quick Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenCurriculumModal}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm font-medium transition-colors text-slate-200"
            title="Click to switch curriculum, grade, or subject"
          >
            <GraduationCap className="w-4 h-4 text-teal-400 shrink-0" />
            <div className="text-left flex items-center gap-1">
              <span className="font-semibold text-white whitespace-nowrap">
                {curriculum === 'ECZ' ? 'ECZ' : curriculum === 'ZambiaCBC' ? 'Zambia CBC' : 'Cambridge'}
              </span>
              <span className="hidden md:inline text-slate-400 whitespace-nowrap">
                · {grade} · {subject}
              </span>
            </div>
          </button>
        </div>

        {/* Right side: Search, Online, Quota, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0" ref={searchContainerRef}>
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700"
            aria-label="Search syllabus"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Desktop Quick Search */}
          <div className="relative hidden md:block w-52 lg:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              placeholder="Search topics, modules..."
              className="w-full pl-9 pr-7 py-1.5 bg-slate-900/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}

            {/* Desktop Search Results Dropdown */}
            {dropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-[#0F1E36] border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                {hasResults ? (
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                    {searchResults.modules.length > 0 && (
                      <div className="p-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
                          Modules
                        </div>
                        {searchResults.modules.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => handleSelectModule(m.id)}
                            className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-800 text-xs text-white flex items-center gap-2"
                          >
                            <Compass className="w-3.5 h-3.5 text-teal-400" />
                            <span>{m.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.topics.length > 0 && (
                      <div className="p-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 pb-1">
                          {curriculum} Topics
                        </div>
                        {searchResults.topics.map((item, idx) => (
                          <div
                            key={idx}
                            className="px-2.5 py-2 rounded-lg hover:bg-slate-800/70 text-xs space-y-1"
                          >
                            <div className="flex items-center gap-1.5 text-white font-medium">
                              <BookOpen className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                              <span className="truncate">{item.topic}</span>
                            </div>
                            <div className="flex items-center justify-between pl-5">
                              <span className="text-[10px] text-slate-400">{item.subject}</span>
                              <div className="flex gap-2 text-[10px]">
                                <button
                                  onClick={() => handleSelectTopic(item.subject, item.topic, 'tutor')}
                                  className="text-teal-400 hover:underline font-semibold"
                                >
                                  Tutor
                                </button>
                                <button
                                  onClick={() => handleSelectTopic(item.subject, item.topic, 'practice')}
                                  className="text-amber-300 hover:underline font-semibold"
                                >
                                  Quiz
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 text-xs text-slate-400 text-center">
                    No matching {curriculum} topics or modules found.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Network indicator */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
              isOnline
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                : 'bg-amber-950/60 text-amber-300 border border-amber-800/60 animate-pulse'
            }`}
            title={isOnline ? 'Online - Live AI enabled' : 'Offline Mode - Cached notes & flashcards available'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xl:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>

          {/* Freemium Quota badge */}
          <button
            onClick={onOpenUpgradeModal}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg text-teal-300 text-xs transition-colors"
            title="Daily free AI queries remaining"
          >
            <span className="font-semibold">{quotaRemaining}</span>
            <span className="hidden sm:inline text-slate-400">/ {quotaLimit}</span>
            <Crown className="w-3 h-3 text-amber-400 ml-0.5" />
          </button>

          {/* Profile Icon */}
          <button
            onClick={() => setActiveModule('settings')}
            className="hidden sm:flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-colors"
            title="Student Settings & Profile"
          >
            <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-xs">
              {profile.name.charAt(0)}
            </div>
            <span className="hidden lg:inline">{profile.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar Drawer */}
      {mobileSearchOpen && (
        <div className="md:hidden px-3 pb-3 pt-1 bg-[#0B192C] border-t border-slate-800 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${curriculum} topics or tools...`}
              className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {searchQuery.trim().length > 0 && (
            <div className="bg-[#0F1E36] border border-slate-700 rounded-xl max-h-64 overflow-y-auto divide-y divide-slate-800">
              {hasResults ? (
                <>
                  {searchResults.modules.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => handleSelectModule(m.id)}
                      className="w-full text-left px-3 py-2.5 text-xs text-white flex items-center gap-2 hover:bg-slate-800"
                    >
                      <Compass className="w-3.5 h-3.5 text-teal-400" />
                      <span>{m.label}</span>
                    </button>
                  ))}
                  {searchResults.topics.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectTopic(item.subject, item.topic, 'tutor')}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <div className="text-white font-medium truncate">{item.topic}</div>
                        <div className="text-[10px] text-slate-400">{item.subject}</div>
                      </div>
                      <span className="text-[10px] text-teal-400 font-semibold shrink-0">Open Tutor</span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="p-3 text-xs text-slate-400 text-center">No matching topics or modules.</div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
