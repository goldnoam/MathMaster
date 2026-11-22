export type TopicCategory =
  | 'אלגברה'
  | 'גיאומטריה'
  | 'חשבון יסודי'
  | 'חשבון דיפרנציאלי ואינטגרלי'
  | 'טריגונומטריה'
  | 'הסתברות וסטטיסטיקה';

export const ALL_CATEGORIES: TopicCategory[] = [
  'חשבון יסודי',
  'אלגברה',
  'גיאומטריה',
  'טריגונומטריה',
  'חשבון דיפרנציאלי ואינטגרלי',
  'הסתברות וסטטיסטיקה',
];

export interface Topic {
  id: string;
  name: string;
  icon: string;
  category?: TopicCategory;
}

export interface GradeLevel {
  id: string;
  name: string; // e.g., "כיתה א׳"
  topics: Topic[];
  color: string;
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  fullSolution?: string[];
  hint?: string;
  gradeId?: string;
  gradeName?: string;
  topicId?: string;
  topicName?: string;
  category?: TopicCategory;
  difficulty?: Difficulty;
}

export enum AppView {
  HOME = 'HOME',
  TOPICS = 'TOPICS',
  LESSON = 'LESSON',
  QUIZ = 'QUIZ',
  DASHBOARD = 'DASHBOARD',
  CUSTOM_EXAM = 'CUSTOM_EXAM',
  VISUAL_LAB = 'VISUAL_LAB',
}

export interface QuizResult {
  score: number;
  total: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'בסיסי',
  medium: 'בינוני',
  hard: 'מתקדם',
};

export interface StudiedTopicRecord {
  topicId: string;
  topicName: string;
  gradeId: string;
  gradeName: string;
  category: TopicCategory;
  difficulty: Difficulty;
  lastStudiedAt: number;
}

export type QuizModeType = 'topic' | 'custom_practice' | 'custom_exam';

export interface CompletedQuizRecord {
  id: string;
  topicId: string;
  topicName: string;
  gradeId: string;
  gradeName: string;
  category: TopicCategory;
  difficulty: Difficulty;
  mode?: QuizModeType;
  score: number;
  total: number;
  percentage: number;
  completedAt: number;
}

export interface UserProgressData {
  points: number;
  studiedTopics: Record<string, StudiedTopicRecord>;
  completedQuizzes: CompletedQuizRecord[];
}

export interface UserAccountProfile {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
  gradeId: string;
  points: number;
  isNewProfile?: boolean;
}

export type StudySessionType = 'new_topic' | 'reinforce' | 'mastered_review';

export interface StudyGoal {
  targetGradeId: string; // 'all' or specific grade id like 'grade-9'
  focusCategory: TopicCategory | 'all';
  studyDays: number[]; // 0 (Sunday) through 6 (Saturday)
  dailyMinutes: number;
  weeklyTopicsTarget: number;
  includeMasteredReview: boolean;
  updatedAt: number;
}

export interface ScheduledSession {
  id: string;
  dayIndex: number; // 0..6
  topicId: string;
  topicName: string;
  gradeId: string;
  gradeName: string;
  category: TopicCategory;
  sessionType: StudySessionType;
  recommendedDifficulty: Difficulty;
  durationMinutes: number;
  reasonText: string;
  bestScore: number | null;
}

export interface WeeklyScheduleDay {
  dayIndex: number;
  dayLabel: string;
  isStudyDay: boolean;
  sessions: ScheduledSession[];
}

export interface WeeklySchedule {
  days: WeeklyScheduleDay[];
  totalSessions: number;
  totalMinutes: number;
  unmasteredInScope: number;
  masteredInScope: number;
  totalInScope: number;
  estimatedWeeksToMastery: number | null;
}

export type VisualDemoType =
  | 'parabola'
  | 'linear'
  | 'pythagoras'
  | 'calculus'
  | 'trigonometry'
  | 'fractions';

export interface CustomExamConfig {
  title: string;
  category: TopicCategory | 'all';
  gradeIds: string[];
  difficulty: Difficulty | 'mixed';
  questionCount: number;
  mode: 'practice' | 'exam';
  timerMinutes?: number;
}