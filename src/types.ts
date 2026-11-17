export type CurriculumType = 'ECZ' | 'ZambiaCBC' | 'Cambridge';

export type ECZGrade = 'Grade 7' | 'Grade 9' | 'Grade 12' | 'GCE';
export type ZambiaCBCGrade =
  | 'Form 1 (O-Level)'
  | 'Form 2 (O-Level)'
  | 'Form 3 (O-Level)'
  | 'Form 4 (O-Level)'
  | 'Form 5 (A-Level)'
  | 'Form 6 (A-Level)';
export type CambridgeGrade = 'IGCSE Core' | 'IGCSE Extended' | 'Cambridge O-Level' | 'Cambridge AS/A-Level';

export type ExplanationDifficulty = 'simple' | 'standard' | 'advanced';
export type LocalLanguageAid = 'none' | 'bemba' | 'nyanja' | 'tonga';

export interface SubjectTopic {
  id: string;
  name: string;
  curriculum: CurriculumType;
  subject: string;
  grade: string;
  coreObjectives: string[];
  difficulty: 'Foundation' | 'Core' | 'Extended' | 'Advanced';
}

export interface QuestionRubric {
  markType: string; // e.g. M1 (Method), A1 (Accuracy), B1 (Independent)
  criterion: string;
}

export interface PracticeQuestion {
  id: string;
  curriculum: CurriculumType;
  grade: string;
  subject: string;
  topic: string;
  questionType: 'multiple_choice' | 'structured';
  totalMarks: number;
  questionText: string;
  options?: string[]; // 4 options for MCQ
  correctOptionIndex?: number;
  modelAnswer: string;
  markingScheme?: QuestionRubric[];
  explanation: string;
  hint?: string;
  isVerifiedPastPaper?: boolean;
  provenanceLabel?: string;
}

export interface QuizAttempt {
  id: string;
  date: string;
  curriculum: CurriculumType;
  grade: string;
  subject: string;
  topic: string;
  marksEarned: number;
  totalMarks: number;
  percentage: number;
  questionsCount: number;
  details?: {
    questionId: string;
    questionText: string;
    userAnswer: string;
    marksEarned: number;
    totalMarks: number;
    feedback: string;
  }[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  tip?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'unreviewed' | 'known' | 'needs_practice';
  lastReviewed?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  curriculum: CurriculumType;
  subject: string;
  topic: string;
  cards: Flashcard[];
  createdAt: string;
  isCustom?: boolean;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  date: string;
  durationMinutes: number;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  isAiGenerated?: boolean;
}

export interface ExamCountdownItem {
  id: string;
  curriculum: CurriculumType;
  subject: string;
  paperCode: string; // e.g., "Paper 1 (Non-Calculator)" or "Term 1 Assessment Test"
  examDate: string; // ISO string e.g. "2026-11-15T09:00:00"
  targetGrade?: string;
  notes?: string;
  assessmentKind?: 'final_exam' | 'term_assessment';
  term?: 'Term 1' | 'Term 2';
}

export interface SavedNote {
  id: string;
  title: string;
  curriculum: CurriculumType;
  subject: string;
  topic: string;
  originalNotes: string;
  executiveSummary: string;
  keyTerms: { term: string; definition: string; examRelevance?: string }[];
  revisionPoints: string[];
  createdAt: string;
}

export interface WeaknessTopicAnalysis {
  topic: string;
  subject: string;
  attemptsCount: number;
  averageScore: number;
  trend: 'Improving' | 'Needs Attention' | 'Critical Weakness' | 'Mastered';
  evidence: string;
  lastTestedDate: string;
}

export interface StudentProfile {
  name: string;
  curriculum: CurriculumType;
  grade: string;
  targetExamYear: string;
  schoolOrCenter?: string;
  dailyGoalMinutes: number;
  planTier: 'free' | 'premium';
  isGuest: boolean;
}
