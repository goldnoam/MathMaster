import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import Footer from './Footer.tsx';
import SimpleCalculator from './widgets/SimpleCalculator.tsx';
import InlineExercise from './widgets/InlineExercise.tsx';
import StepByStep from './widgets/StepByStep.tsx';
import MathVisualWidget from './widgets/MathVisualWidget.tsx';

import { Difficulty, DIFFICULTY_LABELS, VisualDemoType } from '../types.ts';

interface LessonViewProps {
  content: string;
  keywords: Record<string, string>;
  onStartQuiz: () => void;
  onBack: () => void;
  onOpenVisualLab?: () => void;
  isLoading?: boolean;
  contentSource?: 'ai' | 'static' | 'cache';
  difficulty?: Difficulty;
}

const LessonSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-28 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-8">
        <div className="hidden lg:block space-y-4">
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
            <div className="h-8 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 min-h-[420px]">
          <div className="h-7 w-2/3 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-11/12 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="mt-8 h-36 w-full bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
          <div className="mt-8 space-y-3">
            <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

const extractSectionTitle = (markdownChunk: string, index: number): string => {
  const match = markdownChunk.match(/^#{1,2}\s+(.+)$/m);
  if (match && match[1]) {
    return match[1].replace(/[*_`]/g, '').trim();
  }
  return `חלק ${index + 1}`;
};

const LessonView: React.FC<LessonViewProps> = ({
  content,
  keywords,
  onStartQuiz,
  onBack,
  onOpenVisualLab,
  isLoading = false,
  contentSource,
  difficulty = 'medium',
}) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Reset section index whenever a new lesson loads
  useEffect(() => {
    setCurrentSectionIndex(0);
  }, [content]);

  // Reset Focus Mode when Study Mode is turned off
  useEffect(() => {
    if (!isStudyMode) {
      setIsFocusMode(false);
    }
  }, [isStudyMode]);

  const sections = useMemo(() => {
    if (!content) return [];
    const splitContent = content.split(/(?=^#{1,2}\s)/gm);
    const validSections = splitContent.filter((s) => s.trim().length > 0);
    return validSections.length > 0 ? validSections : [content];
  }, [content]);

  const sectionTitles = useMemo(() => {
    return sections.map((sec, idx) => extractSectionTitle(sec, idx));
  }, [sections]);

  const safeIndex = Math.min(currentSectionIndex, Math.max(0, sections.length - 1));

  const handleNext = () => {
    if (safeIndex < sections.length - 1) {
      setCurrentSectionIndex(safeIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentSectionIndex(safeIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'שיעור במתמטיקה — MathMaster IL',
      text: content,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(content);
        setCopiedNotice(true);
        setTimeout(() => setCopiedNotice(false), 2500);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const progressPercentage =
    sections.length > 0 ? ((safeIndex + 1) / sections.length) * 100 : 0;

  const markdownComponents: Components = {
    h1: ({ node, ...props }) => (
      <h1
        className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-5 leading-tight"
        {...props}
      />
    ),
    h2: ({ node, ...props }) => (
      <h2
        className="font-display text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-2 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800"
        {...props}
      />
    ),
    h3: ({ node, ...props }) => (
      <h3
        className="font-display text-lg font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-2"
        {...props}
      />
    ),
    ul: ({ node, ...props }) => (
      <ul
        className="list-disc list-inside space-y-2 my-4 text-slate-700 dark:text-slate-300"
        {...props}
      />
    ),
    ol: ({ node, ...props }) => (
      <ol
        className="list-decimal list-inside space-y-2 my-4 text-slate-700 dark:text-slate-300"
        {...props}
      />
    ),
    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
    hr: () => <hr className="my-6 border-slate-200 dark:border-slate-800" />,
    p: ({ node, children, ...props }) => {
      const dimClass = isFocusMode
        ? 'text-slate-300 dark:text-slate-700 transition-colors duration-300'
        : 'text-slate-700 dark:text-slate-300 transition-colors duration-200';

      return (
        <p className={`leading-relaxed mb-4 text-base ${dimClass}`} {...props}>
          {children}
        </p>
      );
    },
    strong: ({ node, children, ...props }) => {
      const text = String(children);
      const description = keywords[text];

      let containerClass = 'relative inline-block ';
      let innerClass = 'font-semibold rounded px-1 transition-colors duration-200 inline-block ';

      if (isFocusMode) {
        innerClass +=
          'text-slate-950 dark:text-white bg-blue-50 dark:bg-sky-950/70 border border-blue-200 dark:border-sky-700 mx-0.5 ';
      } else if (isStudyMode && description) {
        innerClass +=
          'text-slate-900 dark:text-amber-100 bg-amber-100/80 dark:bg-amber-900/40 border-b border-amber-500 cursor-help ';
        containerClass += 'group cursor-help ';
      } else {
        innerClass += 'text-slate-900 dark:text-white font-bold ';
      }

      const termEl = (
        <strong className={innerClass} {...props}>
          {children}
        </strong>
      );

      if (isStudyMode && description) {
        return (
          <span className={containerClass}>
            {termEl}
            <span
              role="tooltip"
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs leading-relaxed rounded-lg shadow-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 text-right font-normal"
            >
              {description}
            </span>
          </span>
        );
      }

      return termEl;
    },
    code: ({ node, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const type = match ? match[1] : '';
      const value = String(children).replace(/\n$/, '');

      if (type === 'calculator') {
        return <SimpleCalculator />;
      }

      if (type === 'exercise') {
        const [question, answer] = value.split('|');
        if (question && answer) {
          return <InlineExercise question={question.trim()} answer={answer.trim()} />;
        }
      }

      if (type === 'steps') {
        const parts = value.split('|').map((s) => s.trim());
        if (parts.length > 1) {
          const title = parts[0];
          const steps = parts.slice(1);
          return <StepByStep title={title} steps={steps} />;
        }
      }

      if (type === 'visual') {
        const visualKey = value.trim().toLowerCase() as VisualDemoType;
        const allowed: VisualDemoType[] = [
          'parabola',
          'linear',
          'pythagoras',
          'calculus',
          'trigonometry',
          'fractions',
        ];
        if (allowed.includes(visualKey)) {
          return <MathVisualWidget type={visualKey} compact />;
        }
      }

      return (
        <code
          className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-blue-700 dark:text-sky-300 font-mono text-sm"
          dir="ltr"
          {...props}
        >
          {children}
        </code>
      );
    },
    blockquote: ({ node, ...props }) => (
      <blockquote
        className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 my-5 text-slate-700 dark:text-slate-300"
        {...props}
      />
    ),
  };

  if (isLoading) {
    return <LessonSkeleton />;
  }

  const sourceLabel =
    contentSource === 'ai'
      ? 'שיעור מקוון (AI)'
      : contentSource === 'cache'
      ? 'שמור במטמון המקומי'
      : 'מאגר לימוד מובנה';

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-28 lg:pb-12 animate-fadeIn">
      {/* Top Action Row (Mobile & Desktop Back + Quick Controls) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span>חזרה לרשימת הנושאים</span>
        </button>

        {/* Mobile Quick Controls */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setIsStudyMode(!isStudyMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isStudyMode
                ? 'bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 border-transparent'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            הדגשת מונחים
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            title="העתקה או שיתוף"
            aria-label="שיתוף שיעור"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Two-Zone Desktop Academic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-6 lg:gap-8 items-start">
        {/* Right Sidebar (RTL Start Column): TOC, Study Controls & Quiz CTA */}
        <aside className="hidden lg:flex flex-col gap-4 sticky top-24">
          {/* Section Navigator */}
          {sections.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span>תוכן השיעור</span>
                <span className="font-mono tabular-nums">
                  {safeIndex + 1}/{sections.length}
                </span>
              </div>
              <nav className="space-y-1" aria-label="סעיפי השיעור">
                {sectionTitles.map((title, idx) => {
                  const active = idx === safeIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCurrentSectionIndex(idx);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full text-right px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-2.5 ${
                        active
                          ? 'bg-blue-50 dark:bg-sky-950/50 text-blue-700 dark:text-sky-300 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="font-mono tabular-nums text-[11px] opacity-70">
                        0{idx + 1}
                      </span>
                      <span className="truncate">{title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Study Mode Tools */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              כלי למידה
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                הדגשת מונחים
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isStudyMode}
                onClick={() => setIsStudyMode(!isStudyMode)}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  isStudyMode ? 'bg-blue-600 dark:bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                    isStudyMode ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {isStudyMode && (
              <div className="flex items-center justify-between gap-2 pt-1 animate-fadeIn">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  מצב מיקוד במושגים
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isFocusMode}
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                    isFocusMode ? 'bg-blue-600 dark:bg-sky-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                      isFocusMode ? '-translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="w-full mt-2 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{copiedNotice ? 'התוכן הועתק ללוח' : 'העתקת תוכן השיעור'}</span>
            </button>
          </div>

          {/* Primary Quiz CTA */}
          <button
            type="button"
            onClick={onStartQuiz}
            className="w-full py-3.5 px-5 rounded-xl bg-blue-600 dark:bg-sky-500 hover:bg-blue-700 dark:hover:bg-sky-400 text-white dark:text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <span>מעבר לתרגול החומר</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          {onOpenVisualLab && (
            <button
              type="button"
              onClick={onOpenVisualLab}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-blue-500 dark:hover:border-sky-400 hover:text-blue-600 dark:hover:text-sky-400 text-xs font-semibold transition-colors"
            >
              מעבדת הדגמות ויזואליות
            </button>
          )}
        </aside>

        {/* Main Lesson Stage */}
        <div className="min-w-0">
          <article className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Top Progress Hairline */}
            {sections.length > 1 && (
              <div className="h-1 bg-slate-100 dark:bg-slate-800 w-full">
                <div
                  className="h-full bg-blue-600 dark:bg-sky-400 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}

            <div className="p-6 md:p-10">
              {/* Unboxed Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span>{sourceLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>רמה: {DIFFICULTY_LABELS[difficulty]}</span>
                  {sections.length > 1 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        חלק {safeIndex + 1} מתוך {sections.length}
                      </span>
                    </>
                  )}
                </div>
                {sections.length > 1 && (
                  <span className="font-mono tabular-nums text-blue-600 dark:text-sky-400 font-semibold">
                    {Math.round(progressPercentage)}%
                  </span>
                )}
              </div>

              {copiedNotice && (
                <div className="mb-4 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs font-medium text-emerald-700 dark:text-emerald-400 lg:hidden">
                  תוכן השיעור הועתק ללוח
                </div>
              )}

              <div className="max-w-3xl text-right" dir="rtl">
                <ReactMarkdown components={markdownComponents}>
                  {sections[safeIndex]}
                </ReactMarkdown>
              </div>

              {/* Desktop Section Footer Navigation */}
              {sections.length > 1 && (
                <div className="hidden lg:flex items-center justify-between gap-4 mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={safeIndex === 0}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors inline-flex items-center gap-2 ${
                      safeIndex === 0
                        ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                        : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span>החלק הקודם</span>
                  </button>

                  {safeIndex < sections.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors inline-flex items-center gap-2"
                    >
                      <span>המשך לחלק הבא</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onStartQuiz}
                      className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors inline-flex items-center gap-2"
                    >
                      <span>סיימתי — התחלת תרגול</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </article>

          <Footer />
        </div>
      </div>

      {/* Compact Mobile Bottom Bar (<= 15% mobile viewport height) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          {sections.length > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                disabled={safeIndex === 0}
                aria-label="הקודם"
                className={`h-10 px-3 rounded-lg border text-xs font-medium ${
                  safeIndex === 0
                    ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                הקודם
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={safeIndex === sections.length - 1}
                aria-label="הבא"
                className={`h-10 px-3 rounded-lg border text-xs font-medium ${
                  safeIndex === sections.length - 1
                    ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600'
                    : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                הבא
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onStartQuiz}
            className="flex-1 h-10 bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>תרגול החומר</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonView;