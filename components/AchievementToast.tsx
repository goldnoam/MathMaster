import React, { useEffect } from 'react';
import { UnlockedAchievementRecord } from '../types.ts';
import { ACHIEVEMENT_CATALOG } from '../services/achievementService.ts';
import AchievementBadgeIcon from './AchievementBadgeIcon.tsx';

interface AchievementToastProps {
  badges: UnlockedAchievementRecord[];
  onDismiss: () => void;
  onViewAchievements: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({
  badges,
  onDismiss,
  onViewAchievements,
}) => {
  useEffect(() => {
    if (badges.length === 0) return;
    const timer = window.setTimeout(() => {
      onDismiss();
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [badges, onDismiss]);

  if (badges.length === 0) return null;

  const primary = badges[0];
  const definition = ACHIEVEMENT_CATALOG.find((item) => item.id === primary.badgeId);
  const extraCount = badges.length - 1;

  return (
    <div
      dir="rtl"
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-5 z-50 max-w-sm w-[calc(100%-2.5rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 animate-fadeIn"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
          <AchievementBadgeIcon
            iconKey={definition?.iconKey || 'trophy'}
            className="w-5 h-5"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-0.5">
            {extraCount > 0 ? `נפתחו ${badges.length} תגי הישג חדשים` : 'תג הישג חדש נפתח'}
          </div>
          <div className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
            {primary.title}
          </div>
          {definition && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
              {extraCount > 0
                ? `${definition.description} (+${extraCount} נוספים)`
                : definition.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                onViewAchievements();
                onDismiss();
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors whitespace-nowrap"
            >
              צפייה בהישגים
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              סגירה
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="סגירת התראת הישג"
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AchievementToast;
