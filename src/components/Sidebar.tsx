import React from 'react';
import { useApp, AppModuleView } from '../context/AppContext';
import {
  LayoutDashboard,
  MessageSquareText,
  FileCheck2,
  BookOpenCheck,
  ScanLine,
  Mic,
  AlertTriangle,
  Layers,
  CalendarDays,
  Flame,
  FileText,
  LineChart,
  Clock,
  HardDriveDownload,
  Settings,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

interface NavItem {
  id: AppModuleView;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { activeModule, setActiveModule, weaknessAnalysis, tasks } = useApp();

  const weakCount = weaknessAnalysis.filter(
    (w) => w.trend === 'Critical Weakness' || w.trend === 'Needs Attention'
  ).length;

  const pendingTasks = tasks.filter((t) => !t.completed).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquareText, badge: 'Syllabus' },
    { id: 'practice', label: 'Exam Practice', icon: FileCheck2 },
    { id: 'pastpapers', label: 'Past Paper Trainer', icon: BookOpenCheck, badge: 'Verified' },
    { id: 'scanner', label: 'Homework Scanner', icon: ScanLine, badge: 'OCR' },
    { id: 'voice', label: 'Voice Tutor', icon: Mic, badge: 'Audio' },
    {
      id: 'weakness',
      label: 'Weakness Detector',
      icon: AlertTriangle,
      badge: weakCount > 0 ? `${weakCount}` : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    { id: 'flashcards', label: 'Smart Flashcards', icon: Layers },
    {
      id: 'planner',
      label: 'Study Planner',
      icon: CalendarDays,
      badge: pendingTasks > 0 ? `${pendingTasks}` : undefined,
    },
    { id: 'challenge', label: 'Challenge Mode', icon: Flame, badge: 'Timed' },
    { id: 'notes', label: 'Notes Summarizer', icon: FileText },
    { id: 'reports', label: 'Progress Reports', icon: LineChart },
    { id: 'countdown', label: 'Exam Countdown', icon: Clock },
    { id: 'offline', label: 'Offline Revision', icon: HardDriveDownload },
    { id: 'settings', label: 'Settings & Data', icon: Settings },
  ];

  const handleSelect = (id: AppModuleView) => {
    setActiveModule(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 z-30 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] z-30 w-64 bg-[#0B192C] border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Study Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-teal-500/5 text-teal-300 border-l-4 border-teal-400 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-teal-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-400" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Disclaimer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 text-[11px] text-slate-400">
          <div className="flex items-start gap-1.5 leading-tight">
            <span className="text-teal-400 font-bold shrink-0">ℹ</span>
            <span>
              Independent revision aid. Not affiliated with ECZ or Cambridge International.
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
