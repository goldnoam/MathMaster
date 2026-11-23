import {
  ALL_CATEGORIES,
  CompletedQuizRecord,
  Difficulty,
  QuizModeType,
  StudiedTopicRecord,
  TopicCategory,
  UnlockedAchievementRecord,
  UserProgressData,
} from '../types.ts';
import { CURRICULUM } from '../constants.ts';
import {
  collectActiveDateKeys,
  DATE_KEY_REGEX,
  evaluateAchievements,
  toLocalDateKey,
} from './achievementService.ts';

const PROGRESS_STORAGE_KEY = 'mathmaster_user_progress_v1';

const DEFAULT_PROGRESS: UserProgressData = {
  points: 0,
  studiedTopics: {},
  completedQuizzes: [],
  activityDates: [],
  unlockedAchievements: {},
};

export interface ProgressMutationResult {
  progress: UserProgressData;
  newlyUnlocked: UnlockedAchievementRecord[];
  activeDateKey: string;
}

const sanitizeUnlockedMap = (
  raw: unknown
): Record<string, UnlockedAchievementRecord> => {
  if (!raw || typeof raw !== 'object') return {};
  const result: Record<string, UnlockedAchievementRecord> = {};
  Object.entries(raw as Record<string, Partial<UnlockedAchievementRecord>>).forEach(
    ([key, val]) => {
      if (
        val &&
        typeof val.badgeId === 'string' &&
        typeof val.title === 'string' &&
        typeof val.unlockedAt === 'number' &&
        (val.category === 'streak' || val.category === 'mastery' || val.category === 'quiz')
      ) {
        result[key] = {
          badgeId: val.badgeId,
          title: val.title,
          category: val.category,
          unlockedAt: val.unlockedAt,
        };
      }
    }
  );
  return result;
};

export const loadProgress = (): UserProgressData => {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_PROGRESS;
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<UserProgressData>;
    const base: UserProgressData = {
      points: typeof parsed.points === 'number' ? parsed.points : 0,
      studiedTopics:
        parsed.studiedTopics && typeof parsed.studiedTopics === 'object'
          ? parsed.studiedTopics
          : {},
      completedQuizzes: Array.isArray(parsed.completedQuizzes)
        ? parsed.completedQuizzes
        : [],
      activityDates: Array.isArray(parsed.activityDates)
        ? parsed.activityDates.filter((d) => typeof d === 'string' && DATE_KEY_REGEX.test(d))
        : [],
      unlockedAchievements: sanitizeUnlockedMap(parsed.unlockedAchievements),
    };
    const mergedDates = collectActiveDateKeys(base);
    const evaluated = evaluateAchievements({ ...base, activityDates: mergedDates });
    return {
      ...base,
      activityDates: mergedDates,
      unlockedAchievements: evaluated.mergedUnlockedMap,
    };
  } catch (e) {
    console.warn('Failed to load user progress:', e);
    return DEFAULT_PROGRESS;
  }
};

export const saveProgress = (data: UserProgressData): void => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save user progress:', e);
  }
};

export const recordLessonStudied = (params: {
  topicId: string;
  topicName: string;
  gradeId: string;
  gradeName: string;
  category?: TopicCategory;
  difficulty: Difficulty;
}): ProgressMutationResult => {
  const current = loadProgress();
  const now = Date.now();
  const activeDateKey = toLocalDateKey(now);

  const existingTime = current.studiedTopics[params.topicId]?.timeSpentSeconds ?? 0;

  const record: StudiedTopicRecord = {
    topicId: params.topicId,
    topicName: params.topicName,
    gradeId: params.gradeId,
    gradeName: params.gradeName,
    category: params.category || 'אלגברה',
    difficulty: params.difficulty,
    lastStudiedAt: now,
    timeSpentSeconds: existingTime,
  };

  const nextDates = Array.from(
    new Set([...(current.activityDates || []), activeDateKey])
  ).sort();

  const candidate: UserProgressData = {
    ...current,
    studiedTopics: {
      ...current.studiedTopics,
      [params.topicId]: record,
    },
    activityDates: nextDates,
  };

  const evaluation = evaluateAchievements(candidate, now);
  const updated: UserProgressData = {
    ...candidate,
    unlockedAchievements: evaluation.mergedUnlockedMap,
  };

  saveProgress(updated);
  return {
    progress: updated,
    newlyUnlocked: evaluation.newlyUnlocked,
    activeDateKey,
  };
};

export const recordTopicTimeSpent = (params: {
  topicId: string;
  topicName: string;
  gradeId: string;
  gradeName: string;
  category?: TopicCategory;
  difficulty: Difficulty;
  deltaSeconds: number;
}): { progress: UserProgressData; updatedRecord: StudiedTopicRecord | null } => {
  const safeDelta = Math.min(7200, Math.max(0, Math.round(params.deltaSeconds)));
  const current = loadProgress();
  if (safeDelta <= 0) {
    return { progress: current, updatedRecord: null };
  }

  const now = Date.now();
  const existing = current.studiedTopics[params.topicId];
  const prevSeconds =
    typeof existing?.timeSpentSeconds === 'number' && existing.timeSpentSeconds >= 0
      ? Math.round(existing.timeSpentSeconds)
      : 0;
  const nextSeconds = Math.min(8640000, prevSeconds + safeDelta);

  const record: StudiedTopicRecord = {
    topicId: params.topicId,
    topicName: params.topicName || existing?.topicName || 'נושא לימוד',
    gradeId: params.gradeId || existing?.gradeId || 'grade-9',
    gradeName: params.gradeName || existing?.gradeName || 'כיתה',
    category: params.category || existing?.category || 'אלגברה',
    difficulty: params.difficulty || existing?.difficulty || 'medium',
    lastStudiedAt: now,
    timeSpentSeconds: nextSeconds,
  };

  const updated: UserProgressData = {
    ...current,
    studiedTopics: {
      ...current.studiedTopics,
      [params.topicId]: record,
    },
  };

  saveProgress(updated);
  return { progress: updated, updatedRecord: record };
};

export const recordQuizCompleted = (params: {
  topicId: string;
  topicName: string;
  gradeId: string;
  gradeName: string;
  category?: TopicCategory;
  difficulty: Difficulty;
  mode?: QuizModeType;
  score: number;
  total: number;
}): ProgressMutationResult => {
  const current = loadProgress();
  const now = Date.now();
  const activeDateKey = toLocalDateKey(now);
  const percentage = params.total > 0 ? Math.round((params.score / params.total) * 100) : 0;
  const earnedPoints = params.score * 10 + 5;

  const quizRecord: CompletedQuizRecord = {
    id: `${params.topicId}_${now}_${Math.random().toString(36).slice(2, 7)}`,
    topicId: params.topicId,
    topicName: params.topicName,
    gradeId: params.gradeId,
    gradeName: params.gradeName,
    category: params.category || 'אלגברה',
    difficulty: params.difficulty,
    mode: params.mode || 'topic',
    score: params.score,
    total: params.total,
    percentage,
    completedAt: now,
  };

  const nextDates = Array.from(
    new Set([...(current.activityDates || []), activeDateKey])
  ).sort();

  const candidate: UserProgressData = {
    ...current,
    points: current.points + earnedPoints,
    studiedTopics: current.studiedTopics,
    completedQuizzes: [quizRecord, ...current.completedQuizzes],
    activityDates: nextDates,
  };

  const evaluation = evaluateAchievements(candidate, now);
  const updated: UserProgressData = {
    ...candidate,
    unlockedAchievements: evaluation.mergedUnlockedMap,
  };

  saveProgress(updated);
  return {
    progress: updated,
    newlyUnlocked: evaluation.newlyUnlocked,
    activeDateKey,
  };
};

export const resetUserProgress = (): UserProgressData => {
  const fresh: UserProgressData = {
    points: 0,
    studiedTopics: {},
    completedQuizzes: [],
    activityDates: [],
    unlockedAchievements: {},
  };
  saveProgress(fresh);
  return fresh;
};

export interface CategoryRadarPoint {
  category: TopicCategory;
  shortLabel: string;
  masteryScore: number; // Average best score (0-100) across practiced topics in category
  coverageScore: number; // % of topics in category studied or completed
  totalTopics: number;
  studiedCount: number;
  masteredCount: number;
  quizzesCount: number;
  timeSpentSeconds: number;
}

const SHORT_CATEGORY_LABELS: Record<TopicCategory, string> = {
  'חשבון יסודי': 'חשבון יסודי',
  'אלגברה': 'אלגברה',
  'גיאומטריה': 'גיאומטריה',
  'טריגונומטריה': 'טריגונומטריה',
  'חשבון דיפרנציאלי ואינטגרלי': 'חדו״א',
  'הסתברות וסטטיסטיקה': 'הסתברות',
};

export const MASTERY_THRESHOLD = 80;

export const formatClockTimer = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
};

export const formatDurationHebrew = (totalSeconds?: number): string => {
  if (typeof totalSeconds !== 'number' || totalSeconds <= 0) return '—';
  const safe = Math.round(totalSeconds);
  if (safe < 60) {
    return `${safe} שנ׳`;
  }
  const totalMinutes = Math.floor(safe / 60);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  if (hours === 0) {
    return `${totalMinutes} דק׳`;
  }
  if (remainingMinutes === 0) {
    return `${hours} שע׳`;
  }
  return `${hours} שע׳ ${remainingMinutes} דק׳`;
};

export const computeDashboardAnalytics = (progress: UserProgressData) => {
  // Best quiz score per topic
  const bestByTopic: Record<string, number> = {};
  const quizCountByTopic: Record<string, number> = {};
  const timeSpentByTopic: Record<string, number> = {};
  let totalTimeSpentSeconds = 0;

  Object.values(progress.studiedTopics).forEach((s) => {
    const secs =
      typeof s.timeSpentSeconds === 'number' && s.timeSpentSeconds > 0
        ? Math.round(s.timeSpentSeconds)
        : 0;
    timeSpentByTopic[s.topicId] = secs;
    totalTimeSpentSeconds += secs;
  });

  progress.completedQuizzes.forEach((q) => {
    quizCountByTopic[q.topicId] = (quizCountByTopic[q.topicId] || 0) + 1;
    if (bestByTopic[q.topicId] === undefined || q.percentage > bestByTopic[q.topicId]) {
      bestByTopic[q.topicId] = q.percentage;
    }
  });

  const masteredTopicIds = new Set<string>(
    Object.entries(bestByTopic)
      .filter(([, pct]) => pct >= MASTERY_THRESHOLD)
      .map(([topicId]) => topicId)
  );

  // Build radar points across all 6 mathematical domains
  const radarData: CategoryRadarPoint[] = ALL_CATEGORIES.map((category) => {
    const topicsInCategory: string[] = [];
    CURRICULUM.forEach((grade) => {
      grade.topics.forEach((topic) => {
        if ((topic.category || 'אלגברה') === category) {
          topicsInCategory.push(topic.id);
        }
      });
    });

    const totalTopics = topicsInCategory.length;
    let studiedCount = 0;
    let masteredCount = 0;
    let scoreSum = 0;
    let quizzedTopicsCount = 0;
    let quizzesCount = 0;
    let categoryTimeSeconds = 0;

    topicsInCategory.forEach((tid) => {
      const isStudied = Boolean(progress.studiedTopics[tid]) || bestByTopic[tid] !== undefined;
      if (isStudied) studiedCount += 1;
      if (masteredTopicIds.has(tid)) masteredCount += 1;
      if (bestByTopic[tid] !== undefined) {
        scoreSum += bestByTopic[tid];
        quizzedTopicsCount += 1;
      }
      quizzesCount += quizCountByTopic[tid] || 0;
      categoryTimeSeconds += timeSpentByTopic[tid] || 0;
    });

    const masteryScore = quizzedTopicsCount > 0 ? Math.round(scoreSum / quizzedTopicsCount) : 0;
    const coverageScore = totalTopics > 0 ? Math.round((studiedCount / totalTopics) * 100) : 0;

    return {
      category,
      shortLabel: SHORT_CATEGORY_LABELS[category],
      masteryScore,
      coverageScore,
      totalTopics,
      studiedCount,
      masteredCount,
      quizzesCount,
      timeSpentSeconds: categoryTimeSeconds,
    };
  });

  const totalCurriculumTopics = CURRICULUM.reduce((acc, g) => acc + g.topics.length, 0);
  const averageQuizScore =
    progress.completedQuizzes.length > 0
      ? Math.round(
          progress.completedQuizzes.reduce((sum, q) => sum + q.percentage, 0) /
            progress.completedQuizzes.length
        )
      : null;

  return {
    radarData,
    masteredTopicIds,
    bestByTopic,
    quizCountByTopic,
    timeSpentByTopic,
    totalTimeSpentSeconds,
    masteredCount: masteredTopicIds.size,
    studiedCount: Object.keys(progress.studiedTopics).length,
    totalCurriculumTopics,
    averageQuizScore,
  };
};
