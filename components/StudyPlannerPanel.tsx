import React, { useMemo, useState } from 'react';
import {
  ALL_CATEGORIES,
  DIFFICULTY_LABELS,
  Difficulty,
  GradeLevel,
  StudyGoal,
  Topic,
  TopicCategory,
  UserProgressData,
} from '../types.ts';
import { CURRICULUM } from '../constants.ts';
import {
  generateWeeklySchedule,
  loadCompletedScheduleSessions,
  loadStudyGoal,
  saveStudyGoal,
  toggleCompletedScheduleSession,
} from '../services/studyPlanService.ts';
import TopicGlyph from './TopicGlyph.tsx';

interface StudyPlannerPanelProps {
  progress: UserProgressData;
  onStartScheduledTopic: (
    grade: GradeLevel,
    topic: Topic,
    difficulty: Difficulty
  ) => void;
  onGoalChange?: (goal: StudyGoal) => void;
}

const SHORT_DAY_LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const DURATION_OPTIONS = [20, 30, 45, 60];
const PACE_OPTIONS = [1, 2, 3, 4, 5];

const StudyPlannerPanel: React.FC<StudyPlannerPanelProps> = ({
  progress,
  onStartScheduledTopic,
  onGoalChange,
}) => {
  const [goal, setGoal] = useState<StudyGoal>(() => loadStudyGoal());
  const [rotationOffset, setRotationOffset] = useState(0);
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() =>
    loadCompletedScheduleSessions()
  );

  React.useEffect(() => {
    setGoal(loadStudyGoal());
  }, [progress]);

  const updateGoal = (patch: Partial<StudyGoal>) => {
    const next: StudyGoal = {
      ...goal,
      ...patch,
      updatedAt: Date.now(),
    };
    setGoal(next);
    saveStudyGoal(next);
    if (onGoalChange) {
      onGoalChange(next);
    }
  };

  const toggleDay = (dayIndex: number) => {
    const exists = goal.studyDays.includes(dayIndex);
    const nextDays = exists
      ? goal.studyDays.filter((d) => d !== dayIndex)
      : [...goal.studyDays, dayIndex].sort((a, b) => a - b);
    updateGoal({ studyDays: nextDays });
  };

  const schedule = useMemo(
    () => generateWeeklySchedule(goal, progress, rotationOffset),
    [goal, progress, rotationOffset]
  );

  const completedSessionsCount = useMemo(() => {
    let count = 0;
    schedule.days.forEach((day) => {
      day.sessions.forEach((session) => {
        if (completedMap[session.id]) count += 1;
      });
    });
    return count;
  }, [schedule, completedMap]);

  const handleToggleSessionDone = (sessionId: string) => {
    const updated = toggleCompletedScheduleSession(sessionId);
    setCompletedMap(updated);
  };

  const handleOpenSession = (
    gradeId: string,
    topicId: string,
    difficulty: Difficulty
  ) => {
    const grade = CURRICULUM.find((g) => g.id === gradeId);
    const topic = grade?.topics.find((t) => t.id === topicId);
    if (grade && topic) {
      onStartScheduledTopic(grade, topic, difficulty);
    }
  };

  const todayIndex = new Date().getDay();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start animate-fadeIn">
      {/* Goal Configuration Sidebar */}
      <aside className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            הגדרת יעד לימוד
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            המערכת תתאים את הלו״ז השבועי לנושאים שטרם נשלטו
          </p>
        </div>

        {/* Target Grade */}
        <div>
          <label
            htmlFor="goal-grade"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            שכבת גיל ממוקדת
          </label>
          <select
            id="goal-grade"
            value={goal.targetGradeId}
            onChange={(e) => updateGoal({ targetGradeId: e.target.value })}
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">כל הכיתות (א׳–י״ב)</option>
            {CURRICULUM.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Focus Category */}
        <div>
          <label
            htmlFor="goal-category"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
          >
            תחום מתמטי מועדף
          </label>
          <select
            id="goal-category"
            value={goal.focusCategory}
            onChange={(e) =>
              updateGoal({
                focusCategory: e.target.value as TopicCategory | 'all',
              })
            }
            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">כל תחומי המתמטיקה</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Active Study Days */}
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              ימי לימוד בשבוע
            </span>
            <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {goal.studyDays.length} ימים
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {SHORT_DAY_LABELS.map((label, idx) => {
              const active = goal.studyDays.includes(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  aria-pressed={active}
                  className={`h-9 rounded-lg text-xs font-semibold transition-colors border ${
                    active
                      ? 'bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 border-transparent'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Daily Duration */}
        <div>
          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            משך מפגש יומי
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {DURATION_OPTIONS.map((mins) => {
              const active = goal.dailyMinutes === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => updateGoal({ dailyMinutes: mins })}
                  className={`h-9 rounded-lg font-mono tabular-nums text-xs font-semibold transition-colors border ${
                    active
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {mins}ד׳
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Mastery Target */}
        <div>
          <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            יעד יחידות לימוד בשבוע
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {PACE_OPTIONS.map((count) => {
              const active = goal.weeklyTopicsTarget === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => updateGoal({ weeklyTopicsTarget: count })}
                  className={`h-9 rounded-lg font-mono tabular-nums text-xs font-semibold transition-colors border ${
                    active
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mastered Spaced-Review Toggle */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            שילוב חזרה על נושאים שנשלטו
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={goal.includeMasteredReview}
            onClick={() =>
              updateGoal({ includeMasteredReview: !goal.includeMasteredReview })
            }
            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors shrink-0 ${
              goal.includeMasteredReview
                ? 'bg-blue-600 dark:bg-sky-500'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                goal.includeMasteredReview ? '-translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Scope & Pace Forecast */}
        <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 text-xs">
          <div className="font-semibold text-slate-800 dark:text-slate-200">
            תחזית עמידה ביעד
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>נשלטו בהיקף הנבחר:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              {schedule.masteredInScope} / {schedule.totalInScope}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>נותרו לשליטה מלאה:</span>
            <span className="font-mono tabular-nums font-semibold text-blue-600 dark:text-sky-400">
              {schedule.unmasteredInScope} נושאים
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1.5 border-t border-slate-200/70 dark:border-slate-800">
            <span>זמן משוער להשלמה:</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
              {schedule.estimatedWeeksToMastery === 0
                ? 'היעד הושלם'
                : schedule.estimatedWeeksToMastery === null
                ? 'בחרו ימי לימוד'
                : `${schedule.estimatedWeeksToMastery} שבועות`}
            </span>
          </div>
        </div>
      </aside>

      {/* Auto-Generated Weekly Schedule */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              לוח לימודים שבועי אוטומטי
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span className="tabular-nums">
                הושלמו השבוע: {completedSessionsCount}/{schedule.totalSessions} מפגשים
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                סה״כ {schedule.totalMinutes} דקות שבועיות
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRotationOffset((r) => r + 1)}
            disabled={schedule.totalInScope === 0 || goal.studyDays.length === 0}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-blue-500 dark:hover:border-sky-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors disabled:opacity-40 whitespace-nowrap self-start sm:self-center inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>רענון שיבוץ</span>
          </button>
        </div>

        {/* Empty Scope or No Study Days */}
        {schedule.totalInScope === 0 ? (
          <div className="py-12 text-center">
            <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
              אין נושאים התואמים לשילוב הכיתה והתחום שנבחרו
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              הרחיבו את בחירת הכיתה או בחרו &quot;כל תחומי המתמטיקה&quot; כדי לבנות תכנית שבועית.
            </p>
            <button
              type="button"
              onClick={() =>
                updateGoal({ targetGradeId: 'all', focusCategory: 'all' })
              }
              className="px-4 py-2 rounded-lg bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors"
            >
              הרחבה לכל הנושאים
            </button>
          </div>
        ) : goal.studyDays.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1">
              לא נבחרו ימי לימוד פעילים
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              בחרו לפחות יום אחד בשבוע בהגדרות היעד כדי לשבץ מפגשי למידה.
            </p>
            <button
              type="button"
              onClick={() => updateGoal({ studyDays: [0, 1, 2, 3, 4] })}
              className="px-4 py-2 rounded-lg bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors"
            >
              בחירת ימים א׳–ה׳
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {schedule.days.map((day) => {
              const isToday = day.dayIndex === todayIndex;

              return (
                <div
                  key={day.dayIndex}
                  className={`rounded-xl border transition-colors ${
                    day.isStudyDay
                      ? isToday
                        ? 'border-blue-300 dark:border-sky-700 bg-blue-50/30 dark:bg-sky-950/15'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                      : 'border-slate-100 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-950/40'
                  }`}
                >
                  {/* Day Header */}
                  <div className="px-4 py-2.5 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/70">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-display font-bold text-sm text-slate-900 dark:text-white">
                        {day.dayLabel}
                      </span>
                      {isToday && (
                        <>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                          <span className="font-semibold text-blue-600 dark:text-sky-400">
                            היום
                          </span>
                        </>
                      )}
                    </div>

                    {day.isStudyDay ? (
                      <span className="font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400">
                        {day.sessions.length} מפגשים ·{' '}
                        {day.sessions.reduce((sum, s) => sum + s.durationMinutes, 0)} דק׳
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleDay(day.dayIndex)}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
                      >
                        יום מנוחה · הוספה ללו״ז
                      </button>
                    )}
                  </div>

                  {/* Scheduled Sessions for Day */}
                  {day.isStudyDay && day.sessions.length > 0 && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {day.sessions.map((session) => {
                        const isDone = Boolean(completedMap[session.id]);

                        return (
                          <div
                            key={session.id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <button
                                type="button"
                                onClick={() => handleToggleSessionDone(session.id)}
                                aria-label={
                                  isDone
                                    ? `סימון ${session.topicName} כלא הושלם`
                                    : `סימון ${session.topicName} כהושלם`
                                }
                                className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                  isDone
                                    ? 'bg-emerald-600 dark:bg-emerald-500 border-transparent text-white'
                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-blue-500'
                                }`}
                              >
                                {isDone && (
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </button>

                              <TopicGlyph topicId={session.topicId} size="sm" />

                              <div className="min-w-0">
                                <div
                                  className={`font-display font-bold text-sm leading-snug ${
                                    isDone
                                      ? 'line-through text-slate-400 dark:text-slate-500'
                                      : 'text-slate-900 dark:text-white'
                                  }`}
                                >
                                  {session.topicName}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                                  <span>{session.gradeName}</span>
                                  <span aria-hidden="true">·</span>
                                  <span>{session.category}</span>
                                  <span aria-hidden="true">·</span>
                                  <span>רמה: {DIFFICULTY_LABELS[session.recommendedDifficulty]}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="font-mono tabular-nums">
                                    {session.durationMinutes} דק׳
                                  </span>
                                </div>
                                <div
                                  className={`text-xs mt-1 font-medium ${
                                    session.sessionType === 'reinforce'
                                      ? 'text-amber-700 dark:text-amber-400'
                                      : session.sessionType === 'mastered_review'
                                      ? 'text-emerald-700 dark:text-emerald-400'
                                      : 'text-blue-600 dark:text-sky-400'
                                  }`}
                                >
                                  {session.reasonText}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenSession(
                                  session.gradeId,
                                  session.topicId,
                                  session.recommendedDifficulty
                                )
                              }
                              className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-sky-950/40 hover:border-blue-300 dark:hover:border-sky-700 transition-colors whitespace-nowrap self-end sm:self-center inline-flex items-center gap-1.5 shrink-0"
                            >
                              <span>פתיחת שיעור</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlannerPanel;
