import React from 'react';
import { AppView } from '../types.ts';

interface BreadcrumbsProps {
  currentView: AppView;
  gradeName?: string;
  topicName?: string;
  onHomeClick: () => void;
  onGradeClick?: () => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentView,
  gradeName,
  topicName,
  onHomeClick,
  onGradeClick,
}) => {
  return (
    <nav className="flex items-center text-sm whitespace-nowrap overflow-hidden" aria-label="ניווט">
      <ol className="inline-flex items-center gap-1.5">
        <li className="inline-flex items-center">
          <button
            type="button"
            onClick={onHomeClick}
            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors font-medium whitespace-nowrap focus:outline-none focus-visible:underline"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">ראשי</span>
          </button>
        </li>

        {currentView === AppView.DASHBOARD ? (
          <li className="inline-flex items-center gap-1.5">
            <span className="text-slate-300 dark:text-slate-600 select-none" aria-hidden="true">/</span>
            <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
              לוח התקדמות ושליטה
            </span>
          </li>
        ) : currentView === AppView.CUSTOM_EXAM ? (
          <li className="inline-flex items-center gap-1.5">
            <span className="text-slate-300 dark:text-slate-600 select-none" aria-hidden="true">/</span>
            <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
              מחולל מבחנים מותאם
            </span>
          </li>
        ) : currentView === AppView.VISUAL_LAB ? (
          <li className="inline-flex items-center gap-1.5">
            <span className="text-slate-300 dark:text-slate-600 select-none" aria-hidden="true">/</span>
            <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
              מעבדת הדגמות ויזואליות
            </span>
          </li>
        ) : (
          <>
            {gradeName && (
              <li className="inline-flex items-center gap-1.5">
                <span className="text-slate-300 dark:text-slate-600 select-none" aria-hidden="true">/</span>
                {topicName ? (
                  <button
                    type="button"
                    onClick={onGradeClick}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors font-medium whitespace-nowrap"
                  >
                    {gradeName}
                  </button>
                ) : (
                  <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {gradeName}
                  </span>
                )}
              </li>
            )}

            {topicName && (
              <li className="inline-flex items-center gap-1.5 min-w-0">
                <span className="text-slate-300 dark:text-slate-600 select-none" aria-hidden="true">/</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-[240px]">
                  {topicName}
                </span>
              </li>
            )}
          </>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;