import React from 'react';
import { useApp, AppModuleView } from '../context/AppContext';
import {
  LayoutDashboard,
  MessageSquareText,
  FileCheck2,
  ScanLine,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const { activeModule, setActiveModule } = useApp();

  const items: { id: AppModuleView; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquareText },
    { id: 'practice', label: 'Practice', icon: FileCheck2 },
    { id: 'scanner', label: 'Scan', icon: ScanLine },
  ];

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0B192C]/95 backdrop-blur-md border-t border-slate-800 pb-safe print:hidden"
    >
      <div className="grid grid-cols-5 h-16">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-teal-400' : ''}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
};
