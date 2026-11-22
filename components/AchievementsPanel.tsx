import React, { useMemo, useState } from 'react';
import {
  AchievementCategory,
  AchievementDefinition,
  UserProgressData,
} from '../types.ts';
import {
  ACHIEVEMENT_CATEGORY_LABELS,
  evaluateAchievements,
  getRecentSevenDayWindow,
} from '../services/achievementService.ts';
import AchievementBadgeIcon from './AchievementBadgeIcon.tsx';

interface AchievementsPanelProps {
  progress: UserProgressData;
  onStartPractice?: () => void;
}

const ACCENT_ICON_CLASSES: Record<AchievementDefinition['accentColor'], string> = {
  amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/70',
  blue: 'bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-400 border-blue-200 dark:border-sky-800/70',
  emerald: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/70',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/70',
  violet: 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800/70',
};

const ACCENT_BAR_CLASSES: Record<AchievementDefinition['accentColor'], string> = {
  amber: 'bg-amber-600 dark:bg-amber-400',
  blue: 'bg-blue-600 dark:bg-sky-400',
  emerald: 'bg-emerald-600 dark:bg-emerald-400',
  indigo: 'bg-indigo-600 dark:bg-indigo-400',
  violet: 'bg-violet-600 dark:bg-violet-400',
};

const formatUnlockDate = (timestamp: number | null): string => {
  if (!timestamp) return '';
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

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({
  progress,
  onStartPractice,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | 'all'>('all');

  const evaluation = useMemo(() => evaluateAchievements(progress), [progress]);
  const recentSevenDays = useMemo(
    () => getRecentSevenDayWindow(evaluation.streak.activeDateKeys),
    [evaluation.streak.activeDateKeys]
  );

  const filteredStatuses = useMemo(() => {
    return evaluation.statuses.filter((item) => {
      if (statusFilter === 'unlocked' && !item.unlocked) return false;
      if (statusFilter === 'locked' && item.unlocked) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      return true;
    });
  }, [evaluation.statuses, statusFilter, categoryFilter]);

  const { streak } = evaluation;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top 4-Column Streak & Badge Summary KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="סיכום רצף והישגים">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              רצף למידה נוכחי
            </span>
            <AchievementBadgeIcon
              iconKey="flame"
              className={`w-4 h-4 ${
                streak.currentStreak > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-400 dark:text-slate-600'
              }`}
            />
          </div>
          <div className="font-mono tabular-nums text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {streak.currentStreak}
            <span className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400 mr-1.5">
              {streak.currentStreak === 1 ? 'יום' : 'ימים'}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            {streak.activeToday
              ? 'פעילות היום תועדה'
              : 'פתחו שיעור או תרגול היום להארכת הרצף'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              שיא רצף ימים
            </span>
            <AchievementBadgeIcon iconKey="crown" className="w-4 h-4 text-blue-600 dark:text-sky-400" />
          </div>
          <div className="font-mono tabular-nums text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {streak.longestStreak}
            <span className="text-sm font-sans font-normal text-slate-500 dark:text-slate-400 mr-1.5">
              {streak.longestStreak === 1 ? 'יום' : 'ימים'}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            הרצף הארוך ביותר שנמדד
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              ימי פעילות מצטברים
            </span>
            <AchievementBadgeIcon iconKey="calendar-check" className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="font-mono tabular-nums text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            {streak.activeDaysTotal}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            ימים ייחודיים ביומן הלמידה
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              תגים שנפתחו
            </span>
            <AchievementBadgeIcon iconKey="trophy" className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="font-mono tabular-nums text-2xl md:text-3xl font-bold text-blue-600 dark:text-sky-400">
            {evaluation.unlockedCount}
            <span className="text-sm font-normal text-slate-400 dark:text-slate-500">
              {' '}
              / {evaluation.totalCount}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            <span className="font-mono tabular-nums">
              {Math.round((evaluation.unlockedCount / evaluation.totalCount) * 100)}%
            </span>{' '}
            מההישגים הושלמו
          </div>
        </div>
      </section>

      {/* 7-Day Activity Calendar Strip */}
      <section
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6"
        aria-label="פעילות ב-7 הימים האחרונים"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-base md:text-lg font-bold text-slate-900 dark:text-white">
              יומן רצף — 7 הימים האחרונים
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              כל יום שבו נלמד שיעור או הושלם תרגול נספר כיום פעיל ברצף הלמידה
            </p>
          </div>
          {!streak.activeToday && onStartPractice && (
            <button
              type="button"
              onClick={onStartPractice}
              className="px-4 py-2 rounded-lg bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              תרגול יומי קצר
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-2 md:gap-3">
          {recentSevenDays.map((day) => (
            <div
              key={day.dateKey}
              className={`rounded-xl border px-2 py-3 flex flex-col items-center justify-center gap-1.5 transition-colors ${
                day.isActive
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80'
                  : day.isToday
                  ? 'bg-slate-50 dark:bg-slate-800/40 border-blue-300 dark:border-sky-700 border-dashed'
                  : 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
              }`}
              title={`${day.dateKey} · ${day.isActive ? 'יום פעיל' : 'ללא פעילות'}`}
            >
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {day.dayLabel}
              </span>
              {day.isActive ? (
                <span
                  className="w-7 h-7 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 flex items-center justify-center"
                  aria-label="פעיל"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.4} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              ) : (
                <span
                  className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-600 flex items-center justify-center text-[11px] font-mono"
                  aria-label="לא פעיל"
                >
                  —
                </span>
              )}
              <span className="font-mono tabular-nums text-[10px] text-slate-500 dark:text-slate-400">
                {day.isToday ? 'היום' : day.dateKey.slice(5).replace('-', '/')}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Filter Header & Badges Grid */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              כל התגים ({evaluation.totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unlocked')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === 'unlocked'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              נפתחו ({evaluation.unlockedCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('locked')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === 'locked'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              בתהליך ({evaluation.totalCount - evaluation.unlockedCount})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="achievement-category-filter" className="text-xs font-medium text-slate-500 dark:text-slate-400">
              קטגוריה:
            </label>
            <select
              id="achievement-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as AchievementCategory | 'all')}
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs md:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">כל הקטגוריות</option>
              {(Object.keys(ACHIEVEMENT_CATEGORY_LABELS) as AchievementCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {ACHIEVEMENT_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredStatuses.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-1">
              {statusFilter === 'unlocked'
                ? 'עדיין לא נפתחו תגים בקטגוריה זו'
                : 'כל התגים בקטגוריה זו כבר נפתחו'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {statusFilter === 'unlocked'
                ? 'פתחו שיעור או השלימו תרגול עם ציון 80%+ כדי לפתוח את התגים הראשונים.'
                : 'עברו לתצוגת "כל התגים" כדי לראות את כל ההישגים שלכם.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              הצגת כל ההישגים
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStatuses.map((badge) => {
              const iconTone = badge.unlocked
                ? ACCENT_ICON_CLASSES[badge.accentColor]
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700';

              const barTone = badge.unlocked
                ? ACCENT_BAR_CLASSES[badge.accentColor]
                : 'bg-slate-400 dark:bg-slate-600';

              return (
                <article
                  key={badge.id}
                  className={`rounded-xl border p-5 flex flex-col justify-between transition-colors ${
                    badge.unlocked
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      : 'bg-slate-50/70 dark:bg-slate-950/50 border-slate-200/80 dark:border-slate-800/80'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3.5">
                      <div
                        className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${iconTone}`}
                      >
                        <AchievementBadgeIcon iconKey={badge.iconKey} className="w-5 h-5" />
                      </div>

                      {/* Dual-coded Unlock Status (Icon + Text) */}
                      {badge.unlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="font-mono tabular-nums">
                            נפתח {formatUnlockDate(badge.unlockedAt)}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                          </svg>
                          <span>טרם נפתח</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                      {ACHIEVEMENT_CATEGORY_LABELS[badge.category]} · {badge.subtitle}
                    </div>
                    <h3
                      className={`font-display text-base font-bold mb-1.5 ${
                        badge.unlocked
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {badge.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                      {badge.description}
                    </p>
                  </div>

                  {/* Progress Meter */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 dark:text-slate-400">
                        {badge.unlocked ? 'היעד הושלם' : `התקדמות (${badge.unitLabel})`}
                      </span>
                      <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                        {badge.current} / {badge.target}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${barTone}`}
                        style={{ width: `${badge.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default AchievementsPanel;
