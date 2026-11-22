import {
  AchievementCategory,
  AchievementDefinition,
  AchievementStatus,
  StreakStats,
  TopicCategory,
  UnlockedAchievementRecord,
  UserProgressData,
} from '../types.ts';
import { CURRICULUM } from '../constants.ts';

export const DATE_KEY_REGEX = /^20[0-9]{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
const MASTERY_SCORE_THRESHOLD = 80;

export const ACHIEVEMENT_CATEGORY_LABELS: Record<AchievementCategory, string> = {
  streak: 'רצף והתמדה',
  mastery: 'שליטה בתחומים',
  quiz: 'ביצועי מבחנים',
};

export const ACHIEVEMENT_CATALOG: AchievementDefinition[] = [
  {
    id: 'first-step',
    title: 'צעד ראשון במתמטיקה',
    subtitle: 'First Step',
    description: 'פתיחת שיעור ראשון או השלמת תרגול ראשון במערכת.',
    category: 'streak',
    target: 1,
    unitLabel: 'פעילויות',
    iconKey: 'spark',
    accentColor: 'blue',
  },
  {
    id: 'streak-3',
    title: 'התמדה של 3 ימים',
    subtitle: '3-Day Streak',
    description: 'למידה או תרגול במשך 3 ימים רצופים.',
    category: 'streak',
    target: 3,
    unitLabel: 'ימים ברצף',
    iconKey: 'flame',
    accentColor: 'amber',
  },
  {
    id: 'consistent-learner',
    title: 'לומד מתמיד',
    subtitle: 'Consistent Learner',
    description: 'שמירה על רצף למידה ותרגול של 7 ימים רצופים.',
    category: 'streak',
    target: 7,
    unitLabel: 'ימים ברצף',
    iconKey: 'calendar-check',
    accentColor: 'emerald',
  },
  {
    id: 'active-14-days',
    title: 'שגרה מתמטית',
    subtitle: '14 Active Days',
    description: 'צבר של 14 ימי למידה ותרגול שונים ביומן הפעילות.',
    category: 'streak',
    target: 14,
    unitLabel: 'ימי פעילות',
    iconKey: 'compass',
    accentColor: 'indigo',
  },
  {
    id: 'first-mastery',
    title: 'שליטה ראשונה',
    subtitle: 'First Mastery',
    description: 'השגת ציון 80% ומעלה בנושא לימוד ראשון.',
    category: 'quiz',
    target: 1,
    unitLabel: 'נושאים שנשלטו',
    iconKey: 'shield-check',
    accentColor: 'emerald',
  },
  {
    id: 'perfect-score',
    title: 'פתרון מושלם 100%',
    subtitle: 'Perfect Score',
    description: 'סיום מבחן או תרגול עם 100% תשובות נכונות.',
    category: 'quiz',
    target: 1,
    unitLabel: 'מבחנים מושלמים',
    iconKey: 'crown',
    accentColor: 'amber',
  },
  {
    id: 'quiz-veteran',
    title: 'מתרגל מנוסה',
    subtitle: 'Quiz Veteran',
    description: 'השלמת 10 מבחנים ותרגולים בהצלחה (כל רמה).',
    category: 'quiz',
    target: 10,
    unitLabel: 'מבחנים',
    iconKey: 'trophy',
    accentColor: 'blue',
  },
  {
    id: 'points-500',
    title: 'צובר 500 נקודות',
    subtitle: '500 Points Milestone',
    description: 'הגעה ל-500 נקודות תרגול מצטברות במערכת.',
    category: 'quiz',
    target: 500,
    unitLabel: 'נקודות',
    iconKey: 'spark',
    accentColor: 'violet',
  },
  {
    id: 'algebra-master',
    title: 'שליטה באלגברה',
    subtitle: 'Algebra Master',
    description: 'שליטה (ציון 80%+) ב-3 נושאים שונים בתחום האלגברה.',
    category: 'mastery',
    target: 3,
    unitLabel: 'נושאי אלגברה',
    iconKey: 'sigma',
    accentColor: 'indigo',
  },
  {
    id: 'geometry-explorer',
    title: 'חוקר גיאומטריה',
    subtitle: 'Geometry Explorer',
    description: 'שליטה (ציון 80%+) ב-2 נושאים שונים בגיאומטריה.',
    category: 'mastery',
    target: 2,
    unitLabel: 'נושאי גיאומטריה',
    iconKey: 'triangle',
    accentColor: 'blue',
  },
  {
    id: 'arithmetic-champion',
    title: 'אלוף החשבון היסודי',
    subtitle: 'Arithmetic Champion',
    description: 'שליטה (ציון 80%+) ב-3 נושאים שונים בחשבון יסודי.',
    category: 'mastery',
    target: 3,
    unitLabel: 'נושאי חשבון',
    iconKey: 'abacus',
    accentColor: 'emerald',
  },
  {
    id: 'advanced-stem-master',
    title: 'מאסטר טריגו וחדו״א',
    subtitle: 'Trig & Calculus Master',
    description: 'שליטה (ציון 80%+) ב-2 נושאים בטריגונומטריה או חדו״א.',
    category: 'mastery',
    target: 2,
    unitLabel: 'נושאים מתקדמים',
    iconKey: 'wave',
    accentColor: 'violet',
  },
];

export const toLocalDateKey = (dateOrMs: Date | number = new Date()): string => {
  const d = typeof dateOrMs === 'number' ? new Date(dateOrMs) : dateOrMs;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKeyToEpochDays = (dateKey: string): number => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
};

export const getRecentSevenDayWindow = (
  activeDateKeys: string[],
  referenceDate: Date = new Date()
): Array<{ dateKey: string; dayLabel: string; isActive: boolean; isToday: boolean }> => {
  const HEBREW_SHORT_DAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
  const activeSet = new Set(activeDateKeys);
  const todayKey = toLocalDateKey(referenceDate);

  const days: Array<{ dateKey: string; dayLabel: string; isActive: boolean; isToday: boolean }> = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const d = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate() - offset
    );
    const key = toLocalDateKey(d);
    days.push({
      dateKey: key,
      dayLabel: HEBREW_SHORT_DAYS[d.getDay()],
      isActive: activeSet.has(key),
      isToday: key === todayKey,
    });
  }
  return days;
};

export const collectActiveDateKeys = (progress: UserProgressData): string[] => {
  const keys = new Set<string>();

  if (Array.isArray(progress.activityDates)) {
    progress.activityDates.forEach((key) => {
      if (typeof key === 'string' && DATE_KEY_REGEX.test(key)) {
        keys.add(key);
      }
    });
  }

  Object.values(progress.studiedTopics || {}).forEach((topic) => {
    if (typeof topic.lastStudiedAt === 'number' && topic.lastStudiedAt > 0) {
      keys.add(toLocalDateKey(topic.lastStudiedAt));
    }
  });

  (progress.completedQuizzes || []).forEach((quiz) => {
    if (typeof quiz.completedAt === 'number' && quiz.completedAt > 0) {
      keys.add(toLocalDateKey(quiz.completedAt));
    }
  });

  return Array.from(keys).sort();
};

export const computeStreakStats = (
  progress: UserProgressData,
  referenceDate: Date = new Date()
): StreakStats => {
  const activeDateKeys = collectActiveDateKeys(progress);
  if (activeDateKeys.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      activeDaysTotal: 0,
      activeToday: false,
      activeDateKeys: [],
    };
  }

  const epochDays = activeDateKeys.map(parseDateKeyToEpochDays).sort((a, b) => a - b);
  const epochSet = new Set(epochDays);

  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < epochDays.length; i += 1) {
    if (epochDays[i] === epochDays[i - 1] + 1) {
      run += 1;
      if (run > longestStreak) longestStreak = run;
    } else if (epochDays[i] > epochDays[i - 1] + 1) {
      run = 1;
    }
  }

  const todayKey = toLocalDateKey(referenceDate);
  const todayEpoch = parseDateKeyToEpochDays(todayKey);
  const activeToday = epochSet.has(todayEpoch);

  let currentStreak = 0;
  let cursor = activeToday ? todayEpoch : epochSet.has(todayEpoch - 1) ? todayEpoch - 1 : -1;
  while (cursor !== -1 && epochSet.has(cursor)) {
    currentStreak += 1;
    cursor -= 1;
  }

  return {
    currentStreak,
    longestStreak,
    activeDaysTotal: activeDateKeys.length,
    activeToday,
    activeDateKeys,
  };
};

// Map every curriculum topicId to its category for reliable mastery grouping
const TOPIC_CATEGORY_LOOKUP: Record<string, TopicCategory> = (() => {
  const map: Record<string, TopicCategory> = {};
  CURRICULUM.forEach((grade) => {
    grade.topics.forEach((topic) => {
      map[topic.id] = topic.category || 'אלגברה';
    });
  });
  return map;
})();

export interface AchievementEvaluationResult {
  statuses: AchievementStatus[];
  streak: StreakStats;
  newlyUnlocked: UnlockedAchievementRecord[];
  mergedUnlockedMap: Record<string, UnlockedAchievementRecord>;
  unlockedCount: number;
  totalCount: number;
}

export const evaluateAchievements = (
  progress: UserProgressData,
  nowMs: number = Date.now()
): AchievementEvaluationResult => {
  const streak = computeStreakStats(progress, new Date(nowMs));
  const existingUnlocked = progress.unlockedAchievements || {};

  // Best score per topicId & mastered topic ids per category
  const bestByTopic: Record<string, { pct: number; category: TopicCategory }> = {};
  let perfectQuizCount = 0;

  (progress.completedQuizzes || []).forEach((q) => {
    if (q.percentage === 100) {
      perfectQuizCount += 1;
    }
    const category = TOPIC_CATEGORY_LOOKUP[q.topicId] || q.category || 'אלגברה';
    const currentBest = bestByTopic[q.topicId];
    if (!currentBest || q.percentage > currentBest.pct) {
      bestByTopic[q.topicId] = { pct: q.percentage, category };
    }
  });

  const masteredTopicsByCategory: Record<TopicCategory, number> = {
    'חשבון יסודי': 0,
    'אלגברה': 0,
    'גיאומטריה': 0,
    'טריגונומטריה': 0,
    'חשבון דיפרנציאלי ואינטגרלי': 0,
    'הסתברות וסטטיסטיקה': 0,
  };

  let totalMasteredTopics = 0;
  Object.values(bestByTopic).forEach(({ pct, category }) => {
    if (pct >= MASTERY_SCORE_THRESHOLD) {
      totalMasteredTopics += 1;
      masteredTopicsByCategory[category] = (masteredTopicsByCategory[category] || 0) + 1;
    }
  });

  const totalActivities =
    Object.keys(progress.studiedTopics || {}).length +
    (progress.completedQuizzes || []).length;
  const totalQuizzes = (progress.completedQuizzes || []).length;
  const points = progress.points || 0;
  const bestStreakEver = Math.max(streak.longestStreak, streak.currentStreak);

  const metricForBadge = (id: string): number => {
    switch (id) {
      case 'first-step':
        return totalActivities;
      case 'streak-3':
        return bestStreakEver;
      case 'consistent-learner':
        return bestStreakEver;
      case 'active-14-days':
        return streak.activeDaysTotal;
      case 'first-mastery':
        return totalMasteredTopics;
      case 'perfect-score':
        return perfectQuizCount;
      case 'quiz-veteran':
        return totalQuizzes;
      case 'points-500':
        return points;
      case 'algebra-master':
        return masteredTopicsByCategory['אלגברה'];
      case 'geometry-explorer':
        return masteredTopicsByCategory['גיאומטריה'];
      case 'arithmetic-champion':
        return masteredTopicsByCategory['חשבון יסודי'];
      case 'advanced-stem-master':
        return (
          masteredTopicsByCategory['טריגונומטריה'] +
          masteredTopicsByCategory['חשבון דיפרנציאלי ואינטגרלי']
        );
      default:
        return 0;
    }
  };

  const mergedUnlockedMap: Record<string, UnlockedAchievementRecord> = {
    ...existingUnlocked,
  };
  const newlyUnlocked: UnlockedAchievementRecord[] = [];

  const statuses: AchievementStatus[] = ACHIEVEMENT_CATALOG.map((def) => {
    const rawCurrent = metricForBadge(def.id);
    const previouslyUnlocked = existingUnlocked[def.id];
    const meetsCriteriaNow = rawCurrent >= def.target;
    const isUnlocked = Boolean(previouslyUnlocked) || meetsCriteriaNow;

    let unlockedAt: number | null = previouslyUnlocked ? previouslyUnlocked.unlockedAt : null;

    if (!previouslyUnlocked && meetsCriteriaNow) {
      unlockedAt = nowMs;
      const newRecord: UnlockedAchievementRecord = {
        badgeId: def.id,
        title: def.title,
        category: def.category,
        unlockedAt: nowMs,
      };
      mergedUnlockedMap[def.id] = newRecord;
      newlyUnlocked.push(newRecord);
    }

    const clampedCurrent = isUnlocked ? Math.max(def.target, rawCurrent) : Math.min(def.target, rawCurrent);
    const progressPercent = isUnlocked
      ? 100
      : Math.min(99, Math.round((clampedCurrent / def.target) * 100));

    return {
      ...def,
      unlocked: isUnlocked,
      unlockedAt,
      current: clampedCurrent,
      progressPercent,
    };
  });

  return {
    statuses,
    streak,
    newlyUnlocked,
    mergedUnlockedMap,
    unlockedCount: statuses.filter((s) => s.unlocked).length,
    totalCount: statuses.length,
  };
};
