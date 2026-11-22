import React from 'react';
import { AchievementDefinition } from '../types.ts';

interface AchievementBadgeIconProps {
  iconKey: AchievementDefinition['iconKey'];
  className?: string;
}

const AchievementBadgeIcon: React.FC<AchievementBadgeIconProps> = ({
  iconKey,
  className = 'w-6 h-6',
}) => {
  switch (iconKey) {
    case 'flame':
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c.5 3.5-2.5 5.2-2.5 8.5A3.5 3.5 0 0013 15c1.5 0 2.7-1 3.1-2.4C17.8 14 18.5 16 18 18a6 6 0 11-12 0c0-3.2 2-5.5 3.5-7.4C10.8 9 11.8 6.5 12 3z" />
        </svg>
      );
    case 'calendar-check':
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3m8-3v3M4 9h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2zm3.5 9.5l2 2 4-4" />
        </svg>
      );
    case 'compass':
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.2 8.8l-2 5.4-5.4 2 2-5.4 5.4-2z" />
        </svg>
      );
    case 'sigma':
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 5H7l6 7-6 7h11" />
        </svg>
      );
    case 'triangle':
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 19L19 19L5 5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15h4v4" />
        </svg>
      );
    case 'abacus':
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16M9 5v4M15 10v4M11 15v4" />
        </svg>
      );
    case 'wave':
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12c2.5-6 5.5-6 8 0s5.5 6 8 0l2-4" />
        </svg>
      );
    case 'crown':
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l2-9 4.5 4L12 5l2.5 7L19 8l2 9H3zm2 3h14" />
        </svg>
      );
    case 'shield-check':
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 5-3.1 8.5-7 10-3.9-1.5-7-5-7-10V6l7-3zm-2.5 9.5l2 2 4-4" />
        </svg>
      );
    case 'trophy':
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 4h8v5a4 4 0 11-8 0V4zm0 2H5a2 2 0 00-2 2v1a3 3 0 003 3h2m8-6h3a2 2 0 012 2v1a3 3 0 01-3 3h-2m-4 4v4m-4 0h8" />
        </svg>
      );
    case 'chart':
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M7 16v-4m5 4V8m5 8v-6" />
        </svg>
      );
    case 'spark':
    default:
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.9} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3z" />
        </svg>
      );
  }
};

export default AchievementBadgeIcon;
