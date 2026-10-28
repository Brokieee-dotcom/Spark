import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CurriculumType,
  ExplanationDifficulty,
  LocalLanguageAid,
  QuizAttempt,
  FlashcardDeck,
  StudyTask,
  ExamCountdownItem,
  SavedNote,
  WeaknessTopicAnalysis,
  StudentProfile,
} from '../types';
import { CURRICULA_DATA, STARTER_FLASHCARD_DECKS, DEFAULT_EXAM_DATES } from '../data/curriculums';

export type AppModuleView =
  | 'dashboard'
  | 'tutor'
  | 'practice'
  | 'pastpapers'
  | 'scanner'
  | 'voice'
  | 'flashcards'
  | 'weakness'
  | 'planner'
  | 'challenge'
  | 'notes'
  | 'reports'
  | 'countdown'
  | 'offline'
  | 'settings';

interface AppContextType {
  activeModule: AppModuleView;
  setActiveModule: (mod: AppModuleView) => void;
  curriculum: CurriculumType;
  setCurriculum: (cur: CurriculumType) => void;
  grade: string;
  setGrade: (grade: string) => void;
  subject: string;
  setSubject: (sub: string) => void;
  topic: string;
  setTopic: (topic: string) => void;
  difficulty: ExplanationDifficulty;
  setDifficulty: (diff: ExplanationDifficulty) => void;
  simpleLanguageMode: boolean;
  setSimpleLanguageMode: (val: boolean) => void;
  localLanguage: LocalLanguageAid;
  setLocalLanguage: (lang: LocalLanguageAid) => void;
  
  // Profile & Freemium
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  quotaRemaining: number;
  quotaLimit: number;
  setQuotaInfo: (rem: number, limit: number) => void;
  togglePremiumMode: () => void;
  
  // Quiz Attempts & Weakness
  quizAttempts: QuizAttempt[];
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'date'>) => void;
  weaknessAnalysis: WeaknessTopicAnalysis[];
  
  // Flashcards
  flashcardDecks: FlashcardDeck[];
  saveDeck: (deck: FlashcardDeck) => void;
  deleteDeck: (deckId: string) => void;
  updateCardStatus: (deckId: string, cardId: string, status: 'known' | 'needs_practice') => void;
  
  // Study Planner
  tasks: StudyTask[];
  addTask: (task: Omit<StudyTask, 'id'>) => void;
  toggleTaskCompleted: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  setAllTasks: (tasks: StudyTask[]) => void;
  
  // Notes
  savedNotes: SavedNote[];
  saveNote: (note: Omit<SavedNote, 'id' | 'createdAt'>) => void;
  deleteNote: (id: string) => void;
  
  // Exam Countdown
  examDates: ExamCountdownItem[];
  addExamDate: (item: Omit<ExamCountdownItem, 'id'>) => void;
  deleteExamDate: (id: string) => void;
  
  // Offline & Storage
  isOnline: boolean;
  clearAllLocalData: () => void;
  exportDataJson: () => string;
  importDataJson: (json: string) => boolean;

  // Search / quick navigation
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'scholarspark_state_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<AppModuleView>('dashboard');
  const [curriculum, setCurriculumState] = useState<CurriculumType>('ECZ');
  const [grade, setGrade] = useState<string>('Grade 12');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [topic, setTopic] = useState<string>('Matrices & Determinants');
  const [difficulty, setDifficulty] = useState<ExplanationDifficulty>('standard');
  const [simpleLanguageMode, setSimpleLanguageMode] = useState<boolean>(false);
  const [localLanguage, setLocalLanguage] = useState<LocalLanguageAid>('none');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [profile, setProfile] = useState<StudentProfile>({
    name: 'Mukuka Banda',
    curriculum: 'ECZ',
    grade: 'Grade 12',
    targetExamYear: '2026',
    schoolOrCenter: 'Lusaka High Examination Center',
    dailyGoalMinutes: 45,
    planTier: 'free',
    isGuest: false,
  });

  const [quotaRemaining, setQuotaRemaining] = useState<number>(25);
  const [quotaLimit] = useState<number>(25);

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>(STARTER_FLASHCARD_DECKS);
  
  const [tasks, setTasks] = useState<StudyTask[]>([
    {
      id: 't-1',
      title: 'Revise Earth Geometry Latitude & Longitude formula',
      subject: 'Mathematics',
      topic: 'Earth Geometry',
      date: new Date().toISOString().split('T')[0],
      durationMinutes: 30,
      priority: 'high',
      completed: false,
    },
    {
      id: 't-2',
      title: 'Practice 5 Ohm’s Law calculation questions',
      subject: 'Science (Physics & Chemistry)',
      topic: 'Physics: Current Electricity & Ohm’s Law',
      date: new Date().toISOString().split('T')[0],
      durationMinutes: 25,
      priority: 'medium',
      completed: true,
    },
    {
      id: 't-3',
      title: 'Flashcard Review: Chemistry Atomic Structure & Bonding',
      subject: 'Science (Physics & Chemistry)',
      topic: 'Chemistry: Particulate Nature & Mole Concept',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      durationMinutes: 20,
      priority: 'low',
      completed: false,
    },
  ]);

  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [examDates, setExamDates] = useState<ExamCountdownItem[]>(DEFAULT_EXAM_DATES);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Load from LocalStorage on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.curriculum) setCurriculumState(parsed.curriculum);
        if (parsed.grade) setGrade(parsed.grade);
        if (parsed.subject) setSubject(parsed.subject);
        if (parsed.topic) setTopic(parsed.topic);
        if (parsed.difficulty) setDifficulty(parsed.difficulty);
        if (parsed.quizAttempts) setQuizAttempts(parsed.quizAttempts);
        if (parsed.flashcardDecks && parsed.flashcardDecks.length > 0) setFlashcardDecks(parsed.flashcardDecks);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.savedNotes) setSavedNotes(parsed.savedNotes);
        if (parsed.examDates) setExamDates(parsed.examDates);
      }
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to LocalStorage on updates
  useEffect(() => {
    try {
      const payload = {
        profile,
        curriculum,
        grade,
        subject,
        topic,
        difficulty,
        quizAttempts,
        flashcardDecks,
        tasks,
        savedNotes,
        examDates,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not persist to localStorage:', e);
    }
  }, [profile, curriculum, grade, subject, topic, difficulty, quizAttempts, flashcardDecks, tasks, savedNotes, examDates]);

  const setCurriculum = (newCur: CurriculumType) => {
    setCurriculumState(newCur);
    const meta = CURRICULA_DATA[newCur];
    if (meta && meta.subjects.length > 0) {
      setGrade(meta.grades[0] || 'Grade 12');
      setSubject(meta.subjects[0].name);
      setTopic(meta.subjects[0].topics[0] || 'General');
    }
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const togglePremiumMode = () => {
    setProfile((prev) => ({
      ...prev,
      planTier: prev.planTier === 'free' ? 'premium' : 'free',
    }));
  };

  const setQuotaInfo = (rem: number, _limit: number) => {
    setQuotaRemaining(rem);
  };

  const recordQuizAttempt = (attempt: Omit<QuizAttempt, 'id' | 'date'>) => {
    const newAttempt: QuizAttempt = {
      ...attempt,
      id: 'attempt-' + Date.now(),
      date: new Date().toISOString(),
    };
    setQuizAttempts((prev) => [newAttempt, ...prev]);
  };

  // Derive genuine Weakness Analysis from real attempts across attempts
  const weaknessAnalysis: WeaknessTopicAnalysis[] = React.useMemo(() => {
    if (quizAttempts.length === 0) {
      return [];
    }

    const topicGroups: Record<string, { subject: string; earned: number; total: number; count: number; lastDate: string }> = {};

    for (const attempt of quizAttempts) {
      const key = `${attempt.subject}:::${attempt.topic}`;
      if (!topicGroups[key]) {
        topicGroups[key] = {
          subject: attempt.subject,
          earned: 0,
          total: 0,
          count: 0,
          lastDate: attempt.date,
        };
      }
      topicGroups[key].earned += attempt.marksEarned;
      topicGroups[key].total += attempt.totalMarks;
      topicGroups[key].count += 1;
      if (new Date(attempt.date) > new Date(topicGroups[key].lastDate)) {
        topicGroups[key].lastDate = attempt.date;
      }
    }

    return Object.entries(topicGroups).map(([key, data]) => {
      const topicName = key.split(':::')[1];
      const avg = data.total > 0 ? Math.round((data.earned / data.total) * 100) : 0;
      let trend: WeaknessTopicAnalysis['trend'] = 'Needs Attention';
      if (avg >= 80) trend = 'Mastered';
      else if (avg >= 60) trend = 'Improving';
      else if (avg < 45) trend = 'Critical Weakness';

      return {
        topic: topicName,
        subject: data.subject,
        attemptsCount: data.count,
        averageScore: avg,
        trend,
        evidence: `Based on ${data.count} practice attempt${data.count > 1 ? 's' : ''} (${data.earned}/${data.total} marks earned, ${avg}%).`,
        lastTestedDate: data.lastDate,
      };
    }).sort((a, b) => a.averageScore - b.averageScore); // Weakest first!
  }, [quizAttempts]);

  const saveDeck = (deck: FlashcardDeck) => {
    setFlashcardDecks((prev) => {
      const existing = prev.findIndex((d) => d.id === deck.id);
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = deck;
        return copy;
      }
      return [deck, ...prev];
    });
  };

  const deleteDeck = (deckId: string) => {
    setFlashcardDecks((prev) => prev.filter((d) => d.id !== deckId));
  };

  const updateCardStatus = (deckId: string, cardId: string, status: 'known' | 'needs_practice') => {
    setFlashcardDecks((prev) =>
      prev.map((deck) => {
        if (deck.id !== deckId) return deck;
        return {
          ...deck,
          cards: deck.cards.map((c) =>
            c.id === cardId
              ? { ...c, status, lastReviewed: new Date().toISOString() }
              : c
          ),
        };
      })
    );
  };

  const addTask = (task: Omit<StudyTask, 'id'>) => {
    const newTask: StudyTask = { ...task, id: 'task-' + Date.now() };
    setTasks((prev) => [newTask, ...prev]);
  };

  const toggleTaskCompleted = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const setAllTasks = (newTasks: StudyTask[]) => {
    setTasks(newTasks);
  };

  const saveNote = (note: Omit<SavedNote, 'id' | 'createdAt'>) => {
    const newNote: SavedNote = {
      ...note,
      id: 'note-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setSavedNotes((prev) => [newNote, ...prev]);
  };

  const deleteNote = (id: string) => {
    setSavedNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const addExamDate = (item: Omit<ExamCountdownItem, 'id'>) => {
    const newExam: ExamCountdownItem = { ...item, id: 'exam-' + Date.now() };
    setExamDates((prev) => [...prev, newExam]);
  };

  const deleteExamDate = (id: string) => {
    setExamDates((prev) => prev.filter((e) => e.id !== id));
  };

  const clearAllLocalData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setQuizAttempts([]);
    setFlashcardDecks(STARTER_FLASHCARD_DECKS);
    setTasks([]);
    setSavedNotes([]);
    setExamDates(DEFAULT_EXAM_DATES);
  };

  const exportDataJson = () => {
    const data = {
      profile,
      curriculum,
      quizAttempts,
      flashcardDecks,
      tasks,
      savedNotes,
      examDates,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  const importDataJson = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.curriculum) setCurriculumState(parsed.curriculum);
      if (parsed.quizAttempts) setQuizAttempts(parsed.quizAttempts);
      if (parsed.flashcardDecks) setFlashcardDecks(parsed.flashcardDecks);
      if (parsed.tasks) setTasks(parsed.tasks);
      if (parsed.savedNotes) setSavedNotes(parsed.savedNotes);
      if (parsed.examDates) setExamDates(parsed.examDates);
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        curriculum,
        setCurriculum,
        grade,
        setGrade,
        subject,
        setSubject,
        topic,
        setTopic,
        difficulty,
        setDifficulty,
        simpleLanguageMode,
        setSimpleLanguageMode,
        localLanguage,
        setLocalLanguage,
        profile,
        updateProfile,
        quotaRemaining,
        quotaLimit,
        setQuotaInfo,
        togglePremiumMode,
        quizAttempts,
        recordQuizAttempt,
        weaknessAnalysis,
        flashcardDecks,
        saveDeck,
        deleteDeck,
        updateCardStatus,
        tasks,
        addTask,
        toggleTaskCompleted,
        deleteTask,
        setAllTasks,
        savedNotes,
        saveNote,
        deleteNote,
        examDates,
        addExamDate,
        deleteExamDate,
        isOnline,
        clearAllLocalData,
        exportDataJson,
        importDataJson,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
