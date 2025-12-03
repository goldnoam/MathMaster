export interface Topic {
  id: string;
  name: string;
  icon: string;
}

export interface GradeLevel {
  id: string;
  name: string; // e.g., "כיתה א"
  topics: Topic[];
  color: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  hint?: string; // Optional hint for the user
}

export enum AppView {
  HOME = 'HOME',
  TOPICS = 'TOPICS',
  LESSON = 'LESSON',
  QUIZ = 'QUIZ',
}

export interface QuizResult {
  score: number;
  total: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'קל',
  medium: 'בינוני',
  hard: 'קשה',
};