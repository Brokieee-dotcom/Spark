import React, { useState, Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CurriculumModal } from './components/CurriculumModal';
import { UpgradeModal } from './components/UpgradeModal';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-loaded modules for faster mobile initial load and smaller chunks
const DashboardModule = lazy(() =>
  import('./components/modules/DashboardModule').then((m) => ({ default: m.DashboardModule }))
);
const AITutorModule = lazy(() =>
  import('./components/modules/AITutorModule').then((m) => ({ default: m.AITutorModule }))
);
const ExamPracticeModule = lazy(() =>
  import('./components/modules/ExamPracticeModule').then((m) => ({ default: m.ExamPracticeModule }))
);
const PastPapersModule = lazy(() =>
  import('./components/modules/PastPapersModule').then((m) => ({ default: m.PastPapersModule }))
);
const HomeworkScannerModule = lazy(() =>
  import('./components/modules/HomeworkScannerModule').then((m) => ({ default: m.HomeworkScannerModule }))
);
const VoiceTutorModule = lazy(() =>
  import('./components/modules/VoiceTutorModule').then((m) => ({ default: m.VoiceTutorModule }))
);
const WeaknessDetectorModule = lazy(() =>
  import('./components/modules/WeaknessDetectorModule').then((m) => ({ default: m.WeaknessDetectorModule }))
);
const FlashcardsModule = lazy(() =>
  import('./components/modules/FlashcardsModule').then((m) => ({ default: m.FlashcardsModule }))
);
const StudyPlannerModule = lazy(() =>
  import('./components/modules/StudyPlannerModule').then((m) => ({ default: m.StudyPlannerModule }))
);
const ChallengeModeModule = lazy(() =>
  import('./components/modules/ChallengeModeModule').then((m) => ({ default: m.ChallengeModeModule }))
);
const NotesSummarizerModule = lazy(() =>
  import('./components/modules/NotesSummarizerModule').then((m) => ({ default: m.NotesSummarizerModule }))
);
const ProgressReportsModule = lazy(() =>
  import('./components/modules/ProgressReportsModule').then((m) => ({ default: m.ProgressReportsModule }))
);
const ExamCountdownModule = lazy(() =>
  import('./components/modules/ExamCountdownModule').then((m) => ({ default: m.ExamCountdownModule }))
);
const OfflineRevisionModule = lazy(() =>
  import('./components/modules/OfflineRevisionModule').then((m) => ({ default: m.OfflineRevisionModule }))
);
const SettingsModule = lazy(() =>
  import('./components/modules/SettingsModule').then((m) => ({ default: m.SettingsModule }))
);

const ModuleLoader: React.FC = () => (
  <div className="min-h-[300px] flex items-center justify-center">
    <div className="flex items-center gap-3 text-xs text-slate-400">
      <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      <span>Loading study module...</span>
    </div>
  </div>
);

const MainContent: React.FC = () => {
  const { activeModule } = useApp();

  const [curriculumModalOpen, setCurriculumModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return (
          <DashboardModule
            onOpenCurriculumModal={() => setCurriculumModalOpen(true)}
            onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
          />
        );
      case 'tutor':
        return <AITutorModule />;
      case 'practice':
        return <ExamPracticeModule />;
      case 'pastpapers':
        return <PastPapersModule />;
      case 'scanner':
        return <HomeworkScannerModule />;
      case 'voice':
        return <VoiceTutorModule />;
      case 'weakness':
        return <WeaknessDetectorModule />;
      case 'flashcards':
        return <FlashcardsModule />;
      case 'planner':
        return <StudyPlannerModule />;
      case 'challenge':
        return <ChallengeModeModule />;
      case 'notes':
        return <NotesSummarizerModule />;
      case 'reports':
        return <ProgressReportsModule />;
      case 'countdown':
        return <ExamCountdownModule />;
      case 'offline':
        return <OfflineRevisionModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return (
          <DashboardModule
            onOpenCurriculumModal={() => setCurriculumModalOpen(true)}
            onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#070F1E] text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        onOpenCurriculumModal={() => setCurriculumModalOpen(true)}
        onOpenUpgradeModal={() => setUpgradeModalOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar (desktop fixed, mobile slide-over drawer) */}
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content Pane with safe mobile bottom nav spacing */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
          <ErrorBoundary>
            <Suspense fallback={<ModuleLoader />}>
              {renderActiveModule()}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onOpenMenu={() => setMobileMenuOpen((prev) => !prev)} />

      {/* Global Modals */}
      <CurriculumModal
        isOpen={curriculumModalOpen}
        onClose={() => setCurriculumModalOpen(false)}
      />

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
