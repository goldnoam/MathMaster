import {
  Difficulty,
  ScheduledSession,
  StudyGoal,
  StudySessionType,
  TopicCategory,
  UserProgressData,
  WeeklySchedule,
  WeeklyScheduleDay,
} from '../types.ts';
import { CURRICULUM } from '../constants.ts';
import { computeDashboardAnalytics } from './progressService.ts';

const GOAL_STORAGE_KEY = 'mathmaster_study_goal_v1';
const COMPLETED_TASKS_STORAGE_KEY = 'mathmaster_weekly_tasks_v1';

export const HEBREW_WEEKDAYS = [
  'יום ראשון',
  'יום שני',
  'יום שלישי',
  'יום רביעי',
  'יום חמישי',
  'יום שישי',
  'שבת',
];

export const DEFAULT_STUDY_GOAL: StudyGoal = {
  targetGradeId: 'all',
  focusCategory: 'all',
  studyDays: [0, 1, 2, 3, 4], // Sunday to Thursday
  dailyMinutes: 30,
  weeklyTopicsTarget: 3,
  includeMasteredReview: true,
  updatedAt: Date.now(),
};

export const loadStudyGoal = (): StudyGoal => {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_STUDY_GOAL;
    const raw = localStorage.getItem(GOAL_STORAGE_KEY);
    if (!raw) return DEFAULT_STUDY_GOAL;
    const parsed = JSON.parse(raw) as Partial<StudyGoal>;
    return {
      targetGradeId: typeof parsed.targetGradeId === 'string' ? parsed.targetGradeId : 'all',
      focusCategory: parsed.focusCategory || 'all',
      studyDays:
        Array.isArray(parsed.studyDays) && parsed.studyDays.length > 0
          ? parsed.studyDays.filter((d) => typeof d === 'number' && d >= 0 && d <= 6)
          : [0, 1, 2, 3, 4],
      dailyMinutes: typeof parsed.dailyMinutes === 'number' ? parsed.dailyMinutes : 30,
      weeklyTopicsTarget:
        typeof parsed.weeklyTopicsTarget === 'number' ? parsed.weeklyTopicsTarget : 3,
      includeMasteredReview:
        typeof parsed.includeMasteredReview === 'boolean' ? parsed.includeMasteredReview : true,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    };
  } catch (e) {
    console.warn('Failed to load study goal:', e);
    return DEFAULT_STUDY_GOAL;
  }
};

export const saveStudyGoal = (goal: StudyGoal): void => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goal));
  } catch (e) {
    console.warn('Failed to save study goal:', e);
  }
};

// Get Sunday 00:00 key for the current week so completed checkboxes reset weekly
const getCurrentWeekKey = (): string => {
  const now = new Date();
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay());
  return `${sunday.getFullYear()}-${sunday.getMonth() + 1}-${sunday.getDate()}`;
};

export const loadCompletedScheduleSessions = (): Record<string, boolean> => {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(COMPLETED_TASKS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { weekKey?: string; items?: Record<string, boolean> };
    if (parsed.weekKey !== getCurrentWeekKey()) {
      return {};
    }
    return parsed.items || {};
  } catch {
    return {};
  }
};

export const toggleCompletedScheduleSession = (
  sessionId: string
): Record<string, boolean> => {
  const current = loadCompletedScheduleSessions();
  const updated = {
    ...current,
    [sessionId]: !current[sessionId],
  };
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        COMPLETED_TASKS_STORAGE_KEY,
        JSON.stringify({ weekKey: getCurrentWeekKey(), items: updated })
      );
    }
  } catch (e) {
    console.warn('Failed to save schedule check:', e);
  }
  return updated;
};

interface CandidateTopic {
  topicId: string;
  topicName: string;
  gradeId: string;
  gradeName: string;
  category: TopicCategory;
  sessionType: StudySessionType;
  recommendedDifficulty: Difficulty;
  reasonText: string;
  bestScore: number | null;
  priority: number;
}

export const generateWeeklySchedule = (
  goal: StudyGoal,
  progress: UserProgressData,
  rotationOffset = 0
): WeeklySchedule => {
  const analytics = computeDashboardAnalytics(progress);

  // 1. Gather topics matching the user's goal scope
  const candidates: CandidateTopic[] = [];

  CURRICULUM.forEach((grade, gradeIdx) => {
    if (goal.targetGradeId !== 'all' && grade.id !== goal.targetGradeId) return;

    grade.topics.forEach((topic, topicIdx) => {
      const category: TopicCategory = topic.category || 'אלגברה';
      if (goal.focusCategory !== 'all' && category !== goal.focusCategory) return;

      const bestScore = analytics.bestByTopic[topic.id] ?? null;
      const isMastered = analytics.masteredTopicIds.has(topic.id);
      const isStudied = Boolean(progress.studiedTopics[topic.id]);

      if (isMastered) {
        candidates.push({
          topicId: topic.id,
          topicName: topic.name,
          gradeId: grade.id,
          gradeName: grade.name,
          category,
          sessionType: 'mastered_review',
          recommendedDifficulty: 'hard',
          reasonText: `נושא נשלט (${bestScore}%) · תרגול שימור ברמה מתקדמת`,
          bestScore,
          priority: 30 + gradeIdx * 0.1 + topicIdx * 0.01,
        });
      } else if (bestScore !== null) {
        // Attempted quiz, below mastery threshold
        const difficulty: Difficulty = bestScore < 50 ? 'easy' : 'medium';
        candidates.push({
          topicId: topic.id,
          topicName: topic.name,
          gradeId: grade.id,
          gradeName: grade.name,
          category,
          sessionType: 'reinforce',
          recommendedDifficulty: difficulty,
          reasonText: `ציון נוכחי ${bestScore}% · מיועד לחיזוק והגעה לשליטה`,
          bestScore,
          priority: 10 + bestScore * 0.05, // Lower score = higher priority (smaller number)
        });
      } else if (isStudied) {
        // Studied lesson, not yet quizzed
        candidates.push({
          topicId: topic.id,
          topicName: topic.name,
          gradeId: grade.id,
          gradeName: grade.name,
          category,
          sessionType: 'reinforce',
          recommendedDifficulty: 'medium',
          reasonText: 'השיעור נלמד · מומלץ להשלים תרגול ומבחן',
          bestScore: null,
          priority: 15 + gradeIdx * 0.1,
        });
      } else {
        // Unstudied & unmastered topic
        const difficulty: Difficulty = goal.dailyMinutes <= 20 ? 'easy' : 'medium';
        candidates.push({
          topicId: topic.id,
          topicName: topic.name,
          gradeId: grade.id,
          gradeName: grade.name,
          category,
          sessionType: 'new_topic',
          recommendedDifficulty: difficulty,
          reasonText: 'נושא חדש בתכנית הלימודים',
          bestScore: null,
          priority: 20 + gradeIdx * 0.1 + topicIdx * 0.01,
        });
      }
    });
  });

  const masteredList = candidates
    .filter((c) => c.sessionType === 'mastered_review')
    .sort((a, b) => a.priority - b.priority);

  const reinforceList = candidates
    .filter((c) => c.sessionType === 'reinforce')
    .sort((a, b) => a.priority - b.priority);

  const newTopicsList = candidates
    .filter((c) => c.sessionType === 'new_topic')
    .sort((a, b) => a.priority - b.priority);

  const unmasteredPool = [...reinforceList, ...newTopicsList];
  const unmasteredInScope = unmasteredPool.length;
  const masteredInScope = masteredList.length;
  const totalInScope = candidates.length;

  // Apply rotationOffset so user can refresh/shuffle unmastered order if desired
  const rotatedUnmastered =
    unmasteredPool.length > 0 && rotationOffset > 0
      ? [
          ...unmasteredPool.slice(rotationOffset % unmasteredPool.length),
          ...unmasteredPool.slice(0, rotationOffset % unmasteredPool.length),
        ]
      : unmasteredPool;

  const sortedStudyDays = [...goal.studyDays].sort((a, b) => a - b);
  const activeDaysCount = sortedStudyDays.length;

  // Determine how many sessions to schedule this week
  const totalWeeklySlots =
    activeDaysCount > 0 ? Math.max(activeDaysCount, goal.weeklyTopicsTarget) : 0;

  // Build ordered queue of topics for the week: prioritize unmastered, mix in mastered reviews
  const queue: CandidateTopic[] = [];
  if (totalWeeklySlots > 0 && candidates.length > 0) {
    const reviewSlotsTarget =
      goal.includeMasteredReview && masteredList.length > 0
        ? unmasteredPool.length === 0
          ? totalWeeklySlots
          : Math.max(1, Math.floor(totalWeeklySlots * 0.25))
        : 0;

    const unmasteredSlotsTarget = totalWeeklySlots - reviewSlotsTarget;

    for (let i = 0; i < unmasteredSlotsTarget && rotatedUnmastered.length > 0; i++) {
      queue.push(rotatedUnmastered[i % rotatedUnmastered.length]);
    }

    for (let i = 0; i < reviewSlotsTarget && masteredList.length > 0; i++) {
      queue.push(masteredList[(i + rotationOffset) % masteredList.length]);
    }
  }

  // Distribute across the 7 days of the week
  const daysMap: Record<number, ScheduledSession[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  if (activeDaysCount > 0) {
    queue.forEach((candidate, idx) => {
      const dayIndex = sortedStudyDays[idx % activeDaysCount];
      daysMap[dayIndex].push({
        id: `d${dayIndex}_${idx}_${candidate.topicId}`,
        dayIndex,
        topicId: candidate.topicId,
        topicName: candidate.topicName,
        gradeId: candidate.gradeId,
        gradeName: candidate.gradeName,
        category: candidate.category,
        sessionType: candidate.sessionType,
        recommendedDifficulty: candidate.recommendedDifficulty,
        durationMinutes: goal.dailyMinutes,
        reasonText: candidate.reasonText,
        bestScore: candidate.bestScore,
      });
    });
  }

  const days: WeeklyScheduleDay[] = HEBREW_WEEKDAYS.map((dayLabel, dayIndex) => ({
    dayIndex,
    dayLabel,
    isStudyDay: goal.studyDays.includes(dayIndex),
    sessions: daysMap[dayIndex],
  }));

  const totalSessions = queue.length;
  const totalMinutes = totalSessions * goal.dailyMinutes;

  const effectivePace = Math.max(1, goal.weeklyTopicsTarget);
  const estimatedWeeksToMastery =
    unmasteredInScope === 0
      ? 0
      : activeDaysCount === 0
      ? null
      : Math.ceil(unmasteredInScope / effectivePace);

  return {
    days,
    totalSessions,
    totalMinutes,
    unmasteredInScope,
    masteredInScope,
    totalInScope,
    estimatedWeeksToMastery,
  };
};
