import React, { useState, useRef, useEffect } from 'react';
import { AppView, DashboardSection, UserAccountProfile } from '../types.ts';
import Breadcrumbs from './Breadcrumbs.tsx';

interface NavigationProps {
  currentView: AppView;
  points: number;
  onHomeClick: () => void;
  onGradeClick?: () => void;
  onDashboardClick: () => void;
  onAchievementsClick: () => void;
  onPlannerClick: () => void;
  onCustomExamClick: () => void;
  onVisualLabClick: () => void;
  onOpenAuthModal: () => void;
  account: UserAccountProfile | null;
  activeDashboardSection?: DashboardSection;
  gradeName?: string;
  topicName?: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
  isOnline: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  currentView,
  points,
  onHomeClick,
  onGradeClick,
  onDashboardClick,
  onAchievementsClick,
  onPlannerClick,
  onCustomExamClick,
  onVisualLabClick,
  onOpenAuthModal,
  account,
  activeDashboardSection = 'overview',
  gradeName,
  topicName,
  isDarkMode,
  toggleTheme,
  isOnline,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [mobileMenuOpen]);

  const isDashboard = currentView === AppView.DASHBOARD;
  const isOverviewActive = isDashboard && activeDashboardSection === 'overview';
  const isAchievementsActive = isDashboard && activeDashboardSection === 'achievements';
  const isPlannerActive = isDashboard && activeDashboardSection === 'planner';
  const isCustomExamActive = currentView === AppView.CUSTOM_EXAM;
  const isVisualLabActive = currentView === AppView.VISUAL_LAB;

  const handleMobileAction = (fn: () => void) => {
    setMobileMenuOpen(false);
    fn();
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-full flex items-center justify-between gap-3 md:gap-5">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={onHomeClick}
          className="flex items-center gap-2.5 shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg py-1"
        >
          <span
            className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 font-mono font-semibold text-base flex items-center justify-center"
            aria-hidden="true"
          >
            ∑
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white hidden sm:inline">
            MathMaster IL
          </span>
        </button>

        {/* Zone 2: Clean Breadcrumb Navigation */}
        <div className="flex-1 flex justify-start md:justify-center overflow-hidden min-w-0">
          <Breadcrumbs
            currentView={currentView}
            gradeName={gradeName}
            topicName={topicName}
            onHomeClick={onHomeClick}
            onGradeClick={onGradeClick}
          />
        </div>

        {/* Zone 3: Feature Navigation, Progress, User Account & Theme Toggle */}
        <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
          {!isOnline && (
            <div
              className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 whitespace-nowrap"
              title="מצב לא מקוון — מאגר אופליין"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-4.95-9.05a10 10 0 019.9 0" />
              </svg>
              <span>אופליין</span>
            </div>
          )}

          {/* Custom Exam Builder Link */}
          <button
            type="button"
            onClick={onCustomExamClick}
            className={`hidden md:inline-flex items-center text-xs font-medium transition-colors whitespace-nowrap shrink-0 py-1 px-1.5 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded ${
              isCustomExamActive
                ? 'text-blue-600 dark:text-sky-400 underline font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            מחולל מבחנים
          </button>

          {/* Interactive Visual Lab Link */}
          <button
            type="button"
            onClick={onVisualLabClick}
            className={`hidden md:inline-flex items-center text-xs font-medium transition-colors whitespace-nowrap shrink-0 py-1 px-1.5 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded ${
              isVisualLabActive
                ? 'text-blue-600 dark:text-sky-400 underline font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            מעבדה ויזואלית
          </button>

          {/* Weekly Study Planner Text Link */}
          <button
            type="button"
            onClick={onPlannerClick}
            className={`hidden lg:inline-flex items-center text-xs font-medium transition-colors whitespace-nowrap shrink-0 py-1 px-1.5 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded ${
              isPlannerActive
                ? 'text-blue-600 dark:text-sky-400 underline font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            תכנית שבועית
          </button>

          {/* Achievements Text Link */}
          <button
            type="button"
            onClick={onAchievementsClick}
            className={`hidden lg:inline-flex items-center text-xs font-medium transition-colors whitespace-nowrap shrink-0 py-1 px-1.5 hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded ${
              isAchievementsActive
                ? 'text-blue-600 dark:text-sky-400 underline font-semibold'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            הישגים
          </button>

          {/* Progress Dashboard Button */}
          <button
            type="button"
            onClick={onDashboardClick}
            className={`h-9 px-2.5 md:px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              isOverviewActive
                ? 'bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950'
                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 dark:hover:border-sky-400 hover:text-blue-600 dark:hover:text-sky-400'
            }`}
            title="מעבר ללוח התקדמות ושליטה"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden sm:inline">התקדמות</span>
            <span
              className={`font-mono tabular-nums text-xs font-semibold ${
                isOverviewActive ? 'opacity-90' : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {points}
            </span>
          </button>

          {/* User Account / Sign In Button */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="h-9 px-2.5 md:px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-500 dark:hover:border-sky-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            title={account ? `חשבון: ${account.displayName}` : 'הרשמה והתחברות'}
          >
            {account ? (
              <>
                <span className="w-5 h-5 rounded-full bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 font-mono text-[11px] flex items-center justify-center shrink-0 overflow-hidden">
                  {account.photoURL ? (
                    <img
                      src={account.photoURL}
                      alt={account.displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{account.displayName.slice(0, 1)}</span>
                  )}
                </span>
                <span className="hidden sm:inline max-w-[90px] truncate">{account.displayName}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="hidden sm:inline">התחברות</span>
              </>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            title={isDarkMode ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
            aria-label={isDarkMode ? 'מעבר למצב בהיר' : 'מעבר למצב כהה'}
          >
            {isDarkMode ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Compact Navigation Dropdown for Mobile/Tablet (< lg) */}
          <div className="relative lg:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-expanded={mobileMenuOpen}
              aria-label="תפריט ניווט נוסף"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {mobileMenuOpen && (
              <div className="absolute left-0 top-11 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1.5 z-50 animate-fadeIn">
                <button
                  type="button"
                  onClick={() => handleMobileAction(onCustomExamClick)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isCustomExamActive
                      ? 'bg-blue-50 dark:bg-sky-950/50 text-blue-600 dark:text-sky-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  מחולל מבחנים
                </button>
                <button
                  type="button"
                  onClick={() => handleMobileAction(onVisualLabClick)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isVisualLabActive
                      ? 'bg-blue-50 dark:bg-sky-950/50 text-blue-600 dark:text-sky-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  מעבדה ויזואלית
                </button>
                <button
                  type="button"
                  onClick={() => handleMobileAction(onPlannerClick)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isPlannerActive
                      ? 'bg-blue-50 dark:bg-sky-950/50 text-blue-600 dark:text-sky-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  תכנית שבועית
                </button>
                <button
                  type="button"
                  onClick={() => handleMobileAction(onAchievementsClick)}
                  className={`w-full text-right px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isAchievementsActive
                      ? 'bg-blue-50 dark:bg-sky-950/50 text-blue-600 dark:text-sky-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  הישגים ותגים
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;