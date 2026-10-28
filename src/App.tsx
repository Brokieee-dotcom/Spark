import React, { useState } from 'react';
import { AppProvider, useApp, AppModuleView } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { CurriculumModal } from './components/CurriculumModal';
import { UpgradeModal } from './components/UpgradeModal';

// Modules
import { DashboardModule } from './components/modules/DashboardModule';
import { AITutorModule } from './components/modules/AITutorModule';
import { ExamPracticeModule } from './components/modules/ExamPracticeModule';
import { PastPapersModule } from './components/modules/PastPapersModule';
import { HomeworkScannerModule } from './components/modules/HomeworkScannerModule';
import { VoiceTutorModule } from './components/modules/VoiceTutorModule';
import { WeaknessDetectorModule } from './components/modules/WeaknessDetectorModule';
import { FlashcardsModule } from './components/modules/FlashcardsModule';
import { StudyPlannerModule } from './components/modules/StudyPlannerModule';
import { ChallengeModeModule } from './components/modules/ChallengeModeModule';
import { NotesSummarizerModule } from './components/modules/NotesSummarizerModule';
import { ProgressReportsModule } from './components/modules/ProgressReportsModule';
import { ExamCountdownModule } from './components/modules/ExamCountdownModule';
import { OfflineRevisionModule } from './components/modules/OfflineRevisionModule';
import { SettingsModule } from './components/modules/SettingsModule';

const MainContent: React.FC = () => {
  const { activeModule, searchQuery, setActiveModule, setSubject, setTopic } = useApp();

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
        {/* Sidebar */}
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content Pane */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveModule()}
        </main>
      </div>

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
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
