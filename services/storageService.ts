import { QuizQuestion, Difficulty } from '../types.ts';

const STORAGE_PREFIX = 'mathmaster_cache_';
const CACHE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7; // 7 Days

interface CacheItem<T> {
  timestamp: number;
  data: T;
}

const getKey = (type: 'lesson' | 'quiz', grade: string, topic: string, difficulty: Difficulty) => {
  // Sanitize strings to be safe for keys
  const safeGrade = grade.replace(/\s+/g, '_');
  const safeTopic = topic.replace(/\s+/g, '_');
  return `${STORAGE_PREFIX}${type}_${safeGrade}_${safeTopic}_${difficulty}`;
};

export const saveToCache = <T>(type: 'lesson' | 'quiz', grade: string, topic: string, difficulty: Difficulty, data: T): void => {
  try {
    const key = getKey(type, grade, topic, difficulty);
    const item: CacheItem<T> = {
      timestamp: Date.now(),
      data
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    console.warn('Failed to save to localStorage (quota exceeded?)', e);
  }
};

export const loadFromCache = <T>(type: 'lesson' | 'quiz', grade: string, topic: string, difficulty: Difficulty): T | null => {
  try {
    const key = getKey(type, grade, topic, difficulty);
    const stored = localStorage.getItem(key);
    
    if (!stored) return null;

    const item: CacheItem<T> = JSON.parse(stored);
    
    // Check expiry
    if (Date.now() - item.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data;
  } catch (e) {
    console.error('Failed to load from localStorage', e);
    return null;
  }
};

export const isCached = (type: 'lesson' | 'quiz', grade: string, topic: string, difficulty: Difficulty): boolean => {
  return !!loadFromCache(type, grade, topic, difficulty);
};