import React, { useState } from 'react';
import { VisualDemoType } from '../types.ts';
import MathVisualWidget from './widgets/MathVisualWidget.tsx';

interface VisualLabViewProps {
  onBack: () => void;
}

const LAB_ITEMS: {
  id: VisualDemoType;
  label: string;
  grades: string;
  summary: string;
}[] = [
  {
    id: 'parabola',
    label: 'פרבולה וטרינום',
    grades: 'כיתות ט׳–י״ב',
    summary: 'חקירת מקדמי הפרבולה, נקודת קודקוד, דיסקרימיננטה ונקודות חיתוך.',
  },
  {
    id: 'linear',
    label: 'פונקציה קווית ושיפוע',
    grades: 'כיתות ח׳–י׳',
    summary: 'המחשה דינמית של שיפוע הישר (עלייה/ירידה) ונקודות חיתוך עם הצירים.',
  },
  {
    id: 'pythagoras',
    label: 'משפט פיתגורס',
    grades: 'כיתות ח׳–ט׳',
    summary: 'הוכחה חזותית של הקשר בין שטחי הריבועים הבנויים על הניצבים ועל היתר.',
  },
  {
    id: 'calculus',
    label: 'נגזרת ומשיק (חדו״א)',
    grades: 'כיתות י״א–י״ב',
    summary: 'אנימציית התכנסות מיתר למשיק כאשר המרווח Δx שואף לאפס.',
  },
  {
    id: 'trigonometry',
    label: 'מעגל היחידה',
    grades: 'כיתות י׳–י״ב',
    summary: 'הקשר בין הזווית במעגל היחידה לגלי הסינוס והקוסינוס.',
  },
  {
    id: 'fractions',
    label: 'שברים פשוטים',
    grades: 'כיתות ג׳–ו׳',
    summary: 'ייצוג ויזואלי של מונה ומכנה, השוואת שברים ומעבר לאחוזים.',
  },
];

const VisualLabView: React.FC<VisualLabViewProps> = ({ onBack }) => {
  const [selectedDemo, setSelectedDemo] = useState<VisualDemoType>('parabola');

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-14 animate-fadeIn">
      <div className="mb-6">
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
          מעבדת הדגמות ויזואליות אינטראקטיביות
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          חקרו מושגים מרכזיים באלגברה, גיאומטריה, טריגונומטריה וחדו״א באמצעות גרפים נעים ודיאגרמות חיות.
        </p>
      </div>

      {/* Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
        {LAB_ITEMS.map((item) => {
          const active = selectedDemo === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedDemo(item.id)}
              className={`p-3.5 rounded-xl border text-right transition-colors flex flex-col justify-between gap-2 ${
                active
                  ? 'bg-blue-600 dark:bg-sky-500 border-transparent text-white dark:text-slate-950'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-blue-500 dark:hover:border-sky-400'
              }`}
            >
              <span className="font-display font-bold text-sm leading-snug">
                {item.label}
              </span>
              <span
                className={`text-[11px] ${
                  active ? 'opacity-90' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.grades}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Visual Canvas */}
      <MathVisualWidget type={selectedDemo} />
    </div>
  );
};

export default VisualLabView;
