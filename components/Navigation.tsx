import React from 'react';
import { AppView } from '../types.ts';
import Breadcrumbs from './Breadcrumbs.tsx';

interface NavigationProps {
  currentView: AppView;
  points: number;
  onHomeClick: () => void;
  onGradeClick?: () => void;
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
  gradeName, 
  topicName,
  isDarkMode,
  toggleTheme,
  isOnline
}) => {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={onHomeClick}>
          <div className="bg-indigo-600 text-white p-1.5 rounded-lg font-bold text-xl">∑</div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">MathMaster IL</h1>
        </div>

        {/* Breadcrumbs - Centered and flexible */}
        <div className="flex-1 flex justify-center overflow-hidden min-w-0">
           <Breadcrumbs 
             gradeName={gradeName}
             topicName={topicName}
             onHomeClick={onHomeClick}
             onGradeClick={onGradeClick}
           />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          
          {/* Offline/Online Indicator */}
          {!isOnline && (
            <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded text-xs font-bold" title="אין חיבור אינטרנט">
               <span>⚠️</span>
               <span>אופליין</span>
            </div>
          )}

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xl"
            title={isDarkMode ? "עבור למצב יום" : "עבור למצב לילה"}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* Points Badge */}
          <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full border border-yellow-200 dark:border-yellow-800">
            <span className="text-xl">⭐</span>
            <span className="font-bold text-yellow-800 dark:text-yellow-200">{points}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;