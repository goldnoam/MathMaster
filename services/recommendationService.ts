import { CURRICULUM } from '../constants.ts';
import {
  Difficulty,
  GradeLevel,
  Topic,
  TopicCategory,
  UserProgressData,
} from '../types.ts';
import { computeDashboardAnalytics, MASTERY_THRESHOLD } from './progressService.ts';

export type RecommendationReasonType =
  | 'reinforce'
  | 'complete_quiz'
  | 'weak_domain'
  | 'advance'
  | 'starter';

export interface NextStepRecommendation {
  topic: Topic;
  grade: GradeLevel;
  reasonType: RecommendationReasonType;
  reasonLabel: string;
  reasonText: string;
  ctaLabel: string;
  recommendedDifficulty: Difficulty;
  bestScore: number | null;
  lastScore: number | null;
  attempts: number;
}

export interface NextStepsReport {
  recommendations: NextStepRecommendation[];
  insightSummary: string;
  focusCategory: TopicCategory | null;
}

interface TopicLookupEntry {
  grade: GradeLevel;
  topic: Topic;
  gradeOrder: number;
  topicOrder: number;
}

const buildCurriculumIndex = (): {
  byTopicId: Map<string, TopicLookupEntry>;
  ordered: TopicLookupEntry[];
} => {
  const byTopicId = new Map<string, TopicLookupEntry>();
  const ordered: TopicLookupEntry[] = [];

  CURRICULUM.forEach((grade, gIdx) => {
    grade.topics.forEach((topic, tIdx) => {
      const entry: TopicLookupEntry = {
        grade,
        topic,
        gradeOrder: gIdx,
        topicOrder: tIdx,
      };
      byTopicId.set(topic.id, entry);
      ordered.push(entry);
    });
  });

  return { byTopicId, ordered };
};

export const generateNextStepsRecommendations = (
  progress: UserProgressData,
  preferredGradeId?: string,
  maxItems = 3
): NextStepsReport => {
  const { byTopicId, ordered } = buildCurriculumIndex();
  const analytics = computeDashboardAnalytics(progress);

  // Track latest quiz score and attempts per topicId
  const latestQuizByTopic = new Map<
    string,
    { percentage: number; difficulty: Difficulty; completedAt: number }
  >();
  const gradeQuizCounts = new Map<string, number>();

  // completedQuizzes is stored newest-first
  progress.completedQuizzes.forEach((q) => {
    if (!latestQuizByTopic.has(q.topicId)) {
      latestQuizByTopic.set(q.topicId, {
        percentage: q.percentage,
        difficulty: q.difficulty,
        completedAt: q.completedAt,
      });
    }
    if (q.gradeId && q.gradeId !== 'custom') {
      gradeQuizCounts.set(q.gradeId, (gradeQuizCounts.get(q.gradeId) || 0) + 1);
    }
  });

  // Determine the user's anchor grade (from explicit profile, recent activity, or default)
  let anchorGradeId = preferredGradeId;
  if (!anchorGradeId && progress.completedQuizzes.length > 0) {
    const sortedGrades = Array.from(gradeQuizCounts.entries()).sort((a, b) => b[1] - a[1]);
    anchorGradeId = sortedGrades[0]?.[0];
  }
  if (!anchorGradeId) {
    const studiedList = Object.values(progress.studiedTopics).sort(
      (a, b) => b.lastStudiedAt - a.lastStudiedAt
    );
    anchorGradeId = studiedList[0]?.gradeId;
  }

  const anchorGradeOrder = anchorGradeId
    ? CURRICULUM.findIndex((g) => g.id === anchorGradeId)
    : -1;

  const recommendations: NextStepRecommendation[] = [];
  const usedTopicIds = new Set<string>();

  const pushRec = (rec: NextStepRecommendation) => {
    if (usedTopicIds.has(rec.topic.id) || recommendations.length >= maxItems) return;
    usedTopicIds.add(rec.topic.id);
    recommendations.push(rec);
  };

  // Tier 1: Past quizzes below mastery threshold (< 80%) or where latest attempt dipped below 80%
  const reinforceCandidates: {
    entry: TopicLookupEntry;
    bestScore: number;
    lastScore: number;
    attempts: number;
    priorityScore: number;
  }[] = [];

  latestQuizByTopic.forEach((latest, topicId) => {
    const entry = byTopicId.get(topicId);
    if (!entry) return;
    const bestScore = analytics.bestByTopic[topicId] ?? latest.percentage;
    const attempts = analytics.quizCountByTopic[topicId] || 1;

    if (bestScore < MASTERY_THRESHOLD || latest.percentage < MASTERY_THRESHOLD) {
      // Lower scores and multiple failed attempts get higher priority
      const effectiveScore = Math.min(bestScore, latest.percentage);
      const priorityScore = (100 - effectiveScore) + (attempts > 1 ? 10 : 0);
      reinforceCandidates.push({
        entry,
        bestScore,
        lastScore: latest.percentage,
        attempts,
        priorityScore,
      });
    }
  });

  reinforceCandidates.sort((a, b) => b.priorityScore - a.priorityScore);

  reinforceCandidates.forEach((cand) => {
    const recDiff: Difficulty =
      cand.bestScore < 55 || cand.lastScore < 50 ? 'easy' : 'medium';

    const reasonText =
      cand.bestScore < MASTERY_THRESHOLD
        ? `ציון השיא שלך במבחן הוא ${cand.bestScore}% (מתחת לרף השליטה של ${MASTERY_THRESHOLD}%). חזרה ממוקדת תייצב את ההבנה.`
        : `הציון האחרון שלך (${cand.lastScore}%) ירד מתחת לרף השליטה — מומלץ רענון קצר לשמירה על הרמה.`;

    pushRec({
      topic: cand.entry.topic,
      grade: cand.entry.grade,
      reasonType: 'reinforce',
      reasonLabel: 'חיזוק ממוקד',
      reasonText,
      ctaLabel: 'חזרה ותרגול מחדש',
      recommendedDifficulty: recDiff,
      bestScore: cand.bestScore,
      lastScore: cand.lastScore,
      attempts: cand.attempts,
    });
  });

  // Tier 2: Studied lessons that have not been quizzed yet
  const pendingQuizTopics = Object.values(progress.studiedTopics)
    .filter((st) => analytics.bestByTopic[st.topicId] === undefined)
    .sort((a, b) => b.lastStudiedAt - a.lastStudiedAt);

  pendingQuizTopics.forEach((st) => {
    const entry = byTopicId.get(st.topicId);
    if (!entry) return;
    pushRec({
      topic: entry.topic,
      grade: entry.grade,
      reasonType: 'complete_quiz',
      reasonLabel: 'מבחן ממתין',
      reasonText: `למדת את השיעור אך טרם השלמת מבחן בנושא. בדיקת הידע תקבע את רמת השליטה שלך.`,
      ctaLabel: 'לשיעור ולמבחן',
      recommendedDifficulty: st.difficulty || 'medium',
      bestScore: null,
      lastScore: null,
      attempts: 0,
    });
  });

  // Tier 3: Weakest practiced mathematical category -> suggest next unpracticed topic in that category
  const practicedCategories = analytics.radarData
    .filter((r) => r.quizzesCount > 0 && r.studiedCount < r.totalTopics)
    .sort((a, b) => a.masteryScore - b.masteryScore);

  const weakestCategory = practicedCategories[0]?.category || null;

  if (weakestCategory && recommendations.length < maxItems) {
    const catMastery = practicedCategories[0].masteryScore;
    const candidates = ordered
      .filter(
        (e) =>
          (e.topic.category || 'אלגברה') === weakestCategory &&
          !usedTopicIds.has(e.topic.id) &&
          analytics.bestByTopic[e.topic.id] === undefined
      )
      .sort((a, b) => {
        if (anchorGradeOrder >= 0) {
          return (
            Math.abs(a.gradeOrder - anchorGradeOrder) -
            Math.abs(b.gradeOrder - anchorGradeOrder)
          );
        }
        return a.gradeOrder - b.gradeOrder;
      });

    if (candidates[0]) {
      const target = candidates[0];
      pushRec({
        topic: target.topic,
        grade: target.grade,
        reasonType: 'weak_domain',
        reasonLabel: 'איזון תחום',
        reasonText: `הממוצע שלך בתחום ${weakestCategory} הוא ${catMastery}%. נושא משלים זה יחזק את הביצועים בתחום.`,
        ctaLabel: 'התחלת נושא חדש',
        recommendedDifficulty: catMastery < 70 ? 'easy' : 'medium',
        bestScore: null,
        lastScore: null,
        attempts: 0,
      });
    }
  }

  // Tier 4: Progression — suggest the next unmastered topic near the user's anchor grade or level up a mastered topic to 'hard'
  if (recommendations.length < maxItems) {
    const nextUnmastered = ordered
      .filter(
        (e) =>
          !usedTopicIds.has(e.topic.id) && !analytics.masteredTopicIds.has(e.topic.id)
      )
      .sort((a, b) => {
        if (anchorGradeOrder >= 0) {
          const distA = Math.abs(a.gradeOrder - anchorGradeOrder);
          const distB = Math.abs(b.gradeOrder - anchorGradeOrder);
          if (distA !== distB) return distA - distB;
        }
        return a.gradeOrder - b.gradeOrder || a.topicOrder - b.topicOrder;
      });

    for (const item of nextUnmastered) {
      if (recommendations.length >= maxItems) break;
      const isStarterMode = progress.completedQuizzes.length === 0;
      pushRec({
        topic: item.topic,
        grade: item.grade,
        reasonType: isStarterMode ? 'starter' : 'advance',
        reasonLabel: isStarterMode ? 'המלצת פתיחה' : 'הצעד הבא',
        reasonText: isStarterMode
          ? `נושא ליבה ב${item.grade.name} שיעזור למפות את רמת השליטה ההתחלתית שלך.`
          : `המשך טבעי במסלול ${item.grade.name} לצבירת שליטה נוספת בתחום ${item.topic.category || 'אלגברה'}.`,
        ctaLabel: 'פתיחת שיעור',
        recommendedDifficulty: 'medium',
        bestScore: null,
        lastScore: null,
        attempts: 0,
      });
    }
  }

  // Tier 5: If user has mastered nearly everything, recommend hard-mode mastery challenge
  if (recommendations.length < maxItems) {
    for (const q of progress.completedQuizzes) {
      if (recommendations.length >= maxItems) break;
      const entry = byTopicId.get(q.topicId);
      if (!entry || usedTopicIds.has(entry.topic.id)) continue;
      if (q.difficulty !== 'hard') {
        pushRec({
          topic: entry.topic,
          grade: entry.grade,
          reasonType: 'advance',
          reasonLabel: 'אתגר מתקדם',
          reasonText: `השגת ${analytics.bestByTopic[q.topicId] ?? q.percentage}% בנושא — זה הזמן לבדוק שליטה ברמת מתקדם.`,
          ctaLabel: 'לאתגר מתקדם',
          recommendedDifficulty: 'hard',
          bestScore: analytics.bestByTopic[q.topicId] ?? q.percentage,
          lastScore: q.percentage,
          attempts: analytics.quizCountByTopic[q.topicId] || 1,
        });
      }
    }
  }

  // Build concise summary insight
  let insightSummary =
    'המערכת ממפה עבורך מסלול התחלה מומלץ; עם השלמת המבחן הראשון ההמלצות יתעדכנו אוטומטית לפי הציונים.';

  if (progress.completedQuizzes.length > 0) {
    if (reinforceCandidates.length > 0) {
      insightSummary = `נותחו ${progress.completedQuizzes.length} מבחנים קודמים: זוהו ${reinforceCandidates.length} נושאים מתחת לרף השליטה (${MASTERY_THRESHOLD}%) שכדאי לחזק תחילה.`;
    } else if (weakestCategory) {
      insightSummary = `כל המבחנים האחרונים שלך עברו את רף השליטה! מומלץ כעת להרחיב את תחום ${weakestCategory} לאיזון מירבי.`;
    } else {
      insightSummary = `ביצועים מצוינים בכל ${progress.completedQuizzes.length} המבחנים שהושלמו — להלן הנושאים הבאים להמשך ההתקדמות.`;
    }
  }

  return {
    recommendations,
    insightSummary,
    focusCategory: weakestCategory,
  };
};
