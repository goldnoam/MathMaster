import React, { useMemo, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  ALL_CATEGORIES,
  DIFFICULTY_LABELS,
  Difficulty,
  GradeLevel,
  StudyGoal,
  Topic,
  TopicCategory,
  UserAccountProfile,
  UserProgressData,
} from '../types.ts';
import { CURRICULUM } from '../constants.ts';
import {
  CategoryRadarPoint,
  computeDashboardAnalytics,
  MASTERY_THRESHOLD,
} from '../services/progressService.ts';
import TopicGlyph from './TopicGlyph.tsx';
import StudyPlannerPanel from './StudyPlannerPanel.tsx';

interface DashboardViewProps {
  progress: UserProgressData;
  isDarkMode: boolean;
  initialSection?: 'overview' | 'planner';
  account?: UserAccountProfile | null;
  onOpenAuthModal?: () => void;
  onGoalChange?: (goal: StudyGoal) => void;
  onBack: () => void;
  onOpenTopic: (grade: GradeLevel, topic: Topic, difficulty?: Difficulty) => void;
  onResetProgress: () => void;
}

interface TooltipPayloadEntry {
  payload?: CategoryRadarPoint;
}

const CustomRadarTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0 || !payload[0].payload) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div
      dir="rtl"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 shadow-lg text-right min-w-[200px]"
    >
      <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
        {data.category}
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600 dark:text-slate-400">רמת שליטה (ציון):</span>
          <span className="font-mono tabular-nums font-bold text-blue-600 dark:text-sky-400">
            {data.masteryScore}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-600 dark:text-slate-400">כיסוי נושאי לימוד:</span>
          <span className="font-mono tabular-nums font-bold text-emerald-600 dark:text-emerald-400">
            {data.coverageScore}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">נשלטו / סה״כ:</span>
          <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
            {data.masteredCount} / {data.totalTopics}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500 dark:text-slate-400">מבחנים שהושלמו:</span>
          <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
            {data.quizzesCount}
          </span>
        </div>
      </div>
    </div>
  );
};

const findGradeAndTopic = (
  gradeId: string,
  topicId: string
): { grade: GradeLevel; topic: Topic } | null => {
  const grade = CURRICULUM.find((g) => g.id === gradeId);
  if (!grade) return null;
  const topic = grade.topics.find((t) => t.id === topicId);
  if (!topic) return null;
  return { grade, topic };
};

const formatDate = (timestamp: number): string => {
  try {
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(new Date(timestamp));
  } catch {
    return '';
  }
};

const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  isDarkMode,
  initialSection = 'overview',
  account,
  onOpenAuthModal,
  onGoalChange,
  onBack,
  onOpenTopic,
  onResetProgress,
}) => {
  const [section, setSection] = useState<'overview' | 'planner'>(initialSection);
  const [activeTab, setActiveTab] = useState<'quizzes' | 'topics'>('quizzes');
  const [categoryFilter, setCategoryFilter] = useState<TopicCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  React.useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  const analytics = useMemo(() => computeDashboardAnalytics(progress), [progress]);

  const hasAnyActivity =
    progress.completedQuizzes.length > 0 || Object.keys(progress.studiedTopics).length > 0;

  // Build unified topic mastery rows from studiedTopics + completedQuizzes
  const trackedTopicsList = useMemo(() => {
    const map = new Map<
      string,
      {
        topicId: string;
        topicName: string;
        gradeId: string;
        gradeName: string;
        category: TopicCategory;
        bestScore: number | null;
        quizzesCount: number;
        isMastered: boolean;
        lastActivityAt: number;
      }
    >();

    Object.values(progress.studiedTopics).forEach((s) => {
      map.set(s.topicId, {
        topicId: s.topicId,
        topicName: s.topicName,
        gradeId: s.gradeId,
        gradeName: s.gradeName,
        category: s.category,
        bestScore: analytics.bestByTopic[s.topicId] ?? null,
        quizzesCount: analytics.quizCountByTopic[s.topicId] || 0,
        isMastered: analytics.masteredTopicIds.has(s.topicId),
        lastActivityAt: s.lastStudiedAt,
      });
    });

    progress.completedQuizzes.forEach((q) => {
      const existing = map.get(q.topicId);
      if (!existing) {
        map.set(q.topicId, {
          topicId: q.topicId,
          topicName: q.topicName,
          gradeId: q.gradeId,
          gradeName: q.gradeName,
          category: q.category,
          bestScore: analytics.bestByTopic[q.topicId] ?? q.percentage,
          quizzesCount: analytics.quizCountByTopic[q.topicId] || 1,
          isMastered: analytics.masteredTopicIds.has(q.topicId),
          lastActivityAt: q.completedAt,
        });
      } else if (q.completedAt > existing.lastActivityAt) {
        existing.lastActivityAt = q.completedAt;
      }
    });

    return Array.from(map.values())
      .filter((item) => {
        if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
        if (searchTerm.trim()) {
          const q = searchTerm.trim().toLowerCase();
          return (
            item.topicName.toLowerCase().includes(q) ||
            item.gradeName.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.lastActivityAt - a.lastActivityAt);
  }, [progress, analytics, categoryFilter, searchTerm]);

  const filteredQuizzes = useMemo(() => {
    return progress.completedQuizzes.filter((q) => {
      if (categoryFilter !== 'all' && q.category !== categoryFilter) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.trim().toLowerCase();
        return (
          q.topicName.toLowerCase().includes(query) ||
          q.gradeName.toLowerCase().includes(query) ||
          q.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [progress.completedQuizzes, categoryFilter, searchTerm]);

  const handleOpenStarterTopic = (gradeId: string, topicId: string) => {
    const match = findGradeAndTopic(gradeId, topicId);
    if (match) {
      onOpenTopic(match.grade, match.topic);
    } else {
      onBack();
    }
  };

  // Theme-aware Recharts colors
  const gridStroke = isDarkMode ? '#334155' : '#E2E8F0';
  const tickColor = isDarkMode ? '#CBD5E1' : '#334155';
  const radiusTickColor = isDarkMode ? '#64748B' : '#94A3B8';
  const masteryStroke = isDarkMode ? '#38BDF8' : '#2563EB';
  const masteryFill = isDarkMode ? '#38BDF8' : '#2563EB';
  const coverageStroke = isDarkMode ? '#34D399' : '#059669';
  const coverageFill = isDarkMode ? '#34D399' : '#059669';

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-14 animate-fadeIn">
      {/* Top Action & Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span>חזרה למרכז הלמידה</span>
          </button>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {account ? `לוח ההתקדמות של ${account.displayName}` : 'לוח התקדמות ושליטה'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {account
              ? 'ההישגים והמבחנים שלך מסונכרנים לחשבון האישי בענן'
              : 'מעקב אחר נושאים שנלמדו ונשלטו ומאזן מיומנות · '}
            {!account && onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="text-blue-600 dark:text-sky-400 font-semibold hover:underline"
              >
                התחברו לסנכרון בענן
              </button>
            )}
          </p>
        </div>

        {/* Two-Step Safe Reset Progress Control */}
        {hasAnyActivity && (
          <div className="flex items-center gap-2 self-start sm:self-end">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-800 transition-colors whitespace-nowrap"
              >
                איפוס נתוני התקדמות
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-lg px-3 py-1.5">
                <span className="text-xs font-medium text-rose-800 dark:text-rose-200">
                  לאפס הכל?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onResetProgress();
                    setConfirmReset(false);
                  }}
                  className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline"
                >
                  אישור
                </button>
                <span className="text-rose-300 dark:text-rose-800">|</span>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:underline"
                >
                  ביטול
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Primary Section Switcher: Overview & Radar vs. Weekly Study Planner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div
          className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
          role="tablist"
          aria-label="תצוגת לוח התקדמות"
        >
          <button
            type="button"
            role="tab"
            aria-selected={section === 'overview'}
            onClick={() => setSection('overview')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
              section === 'overview'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            רדאר שליטה והישגים
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={section === 'planner'}
            onClick={() => setSection('planner')}
            className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
              section === 'planner'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            יעד ותכנית לימוד שבועית
          </button>
        </div>
      </div>

      {section === 'planner' ? (
        <StudyPlannerPanel
          progress={progress}
          onGoalChange={onGoalChange}
          onStartScheduledTopic={(grade, topic, difficulty) =>
            onOpenTopic(grade, topic, difficulty)
          }
        />
      ) : (
        <>
      {/* 4-Column KPI Summary Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" aria-label="מדדי התקדמות עיקריים">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            נושאים שנשלטו
          </div>
          <div className="font-mono tabular-nums text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {analytics.masteredCount}
            <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
              {' '}
              / {analytics.totalCurriculumTopics}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            נדרש ציון {MASTERY_THRESHOLD}%+ במבחן
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            מבחנים שהושלמו
          </div>
          <div className="font-mono tabular-nums text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {progress.completedQuizzes.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            {analytics.studiedCount} נושאים נלמדו
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            ממוצע ציונים
          </div>
          <div className="font-mono tabular-nums text-2xl md:text-3xl font-bold text-blue-600 dark:text-sky-400">
            {analytics.averageQuizScore !== null ? `${analytics.averageQuizScore}%` : '—'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            {analytics.averageQuizScore !== null ? 'מכלל המבחנים' : 'טרם הושלם מבחן'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            ניקוד תרגול מצטבר
          </div>
          <div className="font-mono tabular-nums text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {progress.points}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            נקודות שנצברו מתרגול
          </div>
        </div>
      </section>

      {/* Main 2-Column Split: Radar Chart + Domain Breakdown Table */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-6 mb-8 items-stretch">
        {/* Radar Chart Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                פרופיל שליטה לפי תחום מתמטי
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                השוואה בין ממוצע ההישגים במבחנים לבין אחוז כיסוי הנושאים
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 dark:bg-sky-400 inline-block" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">שליטה (ציון)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 dark:bg-emerald-400 inline-block" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">כיסוי נושאים</span>
              </div>
            </div>
          </div>

          <div className="relative w-full h-[320px] md:h-[340px]" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="72%" data={analytics.radarData}>
                <PolarGrid stroke={gridStroke} />
                <PolarAngleAxis
                  dataKey="shortLabel"
                  tick={{ fill: tickColor, fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tickCount={5}
                  tick={{ fill: radiusTickColor, fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="שליטה (ציון)"
                  dataKey="masteryScore"
                  stroke={masteryStroke}
                  fill={masteryFill}
                  fillOpacity={0.28}
                  strokeWidth={2.2}
                />
                <Radar
                  name="כיסוי נושאים"
                  dataKey="coverageScore"
                  stroke={coverageStroke}
                  fill={coverageFill}
                  fillOpacity={0.16}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>

            {!hasAnyActivity && (
              <div
                dir="rtl"
                className="absolute inset-0 flex items-center justify-center bg-white/75 dark:bg-slate-900/80 backdrop-blur-[2px] rounded-xl p-6 text-center"
              >
                <div className="max-w-sm">
                  <p className="font-display font-bold text-base text-slate-900 dark:text-white mb-1.5">
                    תרשים המיומנות יתמלא עם התרגול הראשון
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                    פתחו שיעור והשלימו מבחן כדי לראות את החוזקות שלכם מתפרסות על פני ששת תחומי המתמטיקה.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenStarterTopic('grade-9', 'g9-factoring')}
                      className="px-4 py-2 rounded-lg bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors"
                    >
                      התחילו בפירוק לגורמים (ט׳)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenStarterTopic('grade-4', 'g4-fractions')}
                      className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      שברים פשוטים (ד׳)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 6-Domain Breakdown Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                פירוט לפי תחום לימוד
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                לחצו על תחום כדי לסנן את רשימת השיעורים והמבחנים
              </p>
            </div>
            {categoryFilter !== 'all' && (
              <button
                type="button"
                onClick={() => setCategoryFilter('all')}
                className="text-xs font-medium text-blue-600 dark:text-sky-400 hover:underline"
              >
                הצגת הכל
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1 flex flex-col justify-between">
            {analytics.radarData.map((item) => {
              const isSelected = categoryFilter === item.category;
              return (
                <button
                  key={item.category}
                  type="button"
                  onClick={() =>
                    setCategoryFilter(isSelected ? 'all' : item.category)
                  }
                  className={`w-full py-3 px-2.5 -mx-2.5 rounded-lg text-right transition-colors flex items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-sky-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {item.category}
                      </span>
                      <span className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 shrink-0">
                        {item.masteredCount}/{item.totalTopics} נשלטו
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-sky-400 transition-all duration-300"
                        style={{ width: `${item.masteryScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-left shrink-0 w-12">
                    <span className="font-mono tabular-nums text-sm font-bold text-slate-800 dark:text-slate-200">
                      {item.masteryScore}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Directory: Completed Quizzes & Tracked Topics */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
          {/* Segmented View Tabs */}
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setActiveTab('quizzes')}
              className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'quizzes'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              מבחנים שהושלמו ({filteredQuizzes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'topics'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              נושאים שנלמדו ({trackedTopicsList.length})
            </button>
          </div>

          {/* Search & Category Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="סינון לפי נושא או כיתה..."
              aria-label="סינון לפי נושא או כיתה"
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs md:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as TopicCategory | 'all')
              }
              aria-label="סינון לפי תחום מתמטי"
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs md:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">כל התחומים</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab 1: Completed Quizzes */}
        {activeTab === 'quizzes' ? (
          filteredQuizzes.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">
                {progress.completedQuizzes.length === 0
                  ? 'עדיין לא הושלמו מבחנים'
                  : 'לא נמצאו מבחנים התואמים לסינון'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {progress.completedQuizzes.length === 0
                  ? 'בחרו נושא, עברו על השיעור ולחצו על "מעבר לתרגול החומר" כדי לצבור ציון ושליטה.'
                  : 'נסו לנקות את שדה החיפוש או לבחור "כל התחומים".'}
              </p>
              {progress.completedQuizzes.length === 0 && (
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 rounded-lg bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors"
                >
                  בחירת נושא לתרגול
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <th className="py-3 pl-4 font-medium">נושא</th>
                    <th className="py-3 px-3 font-medium">כיתה ותחום</th>
                    <th className="py-3 px-3 font-medium">רמה</th>
                    <th className="py-3 px-3 font-medium">ציון</th>
                    <th className="py-3 px-3 font-medium">סטטוס</th>
                    <th className="py-3 pr-3 font-medium text-left">תאריך</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                  {filteredQuizzes.map((quiz) => {
                    const isMastered = quiz.percentage >= MASTERY_THRESHOLD;
                    return (
                      <tr
                        key={quiz.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 pl-4">
                          <button
                            type="button"
                            onClick={() => handleOpenStarterTopic(quiz.gradeId, quiz.topicId)}
                            className="flex items-center gap-3 text-right hover:text-blue-600 dark:hover:text-sky-400 transition-colors font-semibold text-slate-900 dark:text-white"
                          >
                            <TopicGlyph topicId={quiz.topicId} size="sm" />
                            <span>{quiz.topicName}</span>
                          </button>
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {quiz.gradeName} · {quiz.category}
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {DIFFICULTY_LABELS[quiz.difficulty]}
                        </td>
                        <td className="py-3 px-3 font-mono tabular-nums font-semibold whitespace-nowrap">
                          <span className="text-slate-900 dark:text-white">{quiz.percentage}%</span>
                          <span className="text-xs font-normal text-slate-400 mr-1.5">
                            ({quiz.score}/{quiz.total})
                          </span>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {isMastered ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span>נשלט</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>בתהליך</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-3 text-left font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(quiz.completedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : /* Tab 2: Studied & Mastered Topics */
        trackedTopicsList.length === 0 ? (
          <div className="py-10 text-center">
            <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1">
              טרם נפתחו נושאים ללמידה
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              היכנסו לאחד השיעורים במערכת כדי להתחיל לעקוב אחר ההתקדמות שלכם.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 rounded-lg bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors"
            >
              לרשימת הכיתות והנושאים
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <th className="py-3 pl-4 font-medium">נושא לימוד</th>
                  <th className="py-3 px-3 font-medium">כיתה ותחום</th>
                  <th className="py-3 px-3 font-medium">ציון שיא</th>
                  <th className="py-3 px-3 font-medium">מבחנים</th>
                  <th className="py-3 pr-3 font-medium text-left">סטטוס שליטה</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {trackedTopicsList.map((item) => (
                  <tr
                    key={item.topicId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 pl-4">
                      <button
                        type="button"
                        onClick={() => handleOpenStarterTopic(item.gradeId, item.topicId)}
                        className="flex items-center gap-3 text-right hover:text-blue-600 dark:hover:text-sky-400 transition-colors font-semibold text-slate-900 dark:text-white"
                      >
                        <TopicGlyph topicId={item.topicId} size="sm" />
                        <span>{item.topicName}</span>
                      </button>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.gradeName} · {item.category}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums font-semibold whitespace-nowrap">
                      {item.bestScore !== null ? `${item.bestScore}%` : '—'}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {item.quizzesCount}
                    </td>
                    <td className="py-3 pr-3 text-left whitespace-nowrap">
                      {item.isMastered ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span>נושא נשלט</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                          <span>נלמד — ממתין לתרגול</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
        </>
      )}
    </div>
  );
};

export default DashboardView;
