import React, { useEffect, useMemo, useState } from 'react';
import { TopicCategory } from '../types.ts';
import { FormulaItem, getFormulaSheetForTopic } from '../data/formulaSheets.ts';
import MathRenderer from './MathRenderer.tsx';

interface FormulaSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId?: string;
  topicName?: string;
  topicCategory?: TopicCategory;
  gradeName?: string;
}

const FormulaSheetModal: React.FC<FormulaSheetModalProps> = ({
  isOpen,
  onClose,
  topicId,
  topicName,
  topicCategory,
  gradeName,
}) => {
  const [activeScope, setActiveScope] = useState<'topic' | 'category'>('topic');
  const [filterText, setFilterText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { topicSheet, categoryFormulas } = useMemo(
    () => getFormulaSheetForTopic(topicId, topicName, topicCategory),
    [topicId, topicName, topicCategory]
  );

  // Reset modal tab and search whenever the active topic changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveScope('topic');
      setFilterText('');
    }
  }, [isOpen, topicId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentList: FormulaItem[] =
    activeScope === 'topic' ? topicSheet.formulas : categoryFormulas;

  const filteredFormulas = currentList.filter((item) => {
    const q = filterText.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.explanation.toLowerCase().includes(q) ||
      item.latex.toLowerCase().includes(q)
    );
  });

  const handleCopyLatex = async (item: FormulaItem) => {
    try {
      await navigator.clipboard.writeText(item.latex);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId((prev) => (prev === item.id ? null : prev)), 2000);
    } catch {
      // Clipboard may be unavailable in restricted contexts
    }
  };

  const hasDistinctCategoryTab =
    topicCategory &&
    categoryFormulas.length > 0 &&
    categoryFormulas.some((cf) => !topicSheet.formulas.some((tf) => tf.id === cf.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="formula-sheet-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        dir="rtl"
        className="w-full max-w-2xl max-h-[86vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex flex-wrap items-center gap-1.5">
              <span>דף נוסחאות</span>
              {gradeName && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{gradeName}</span>
                </>
              )}
              {topicCategory && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{topicCategory}</span>
                </>
              )}
            </div>
            <h2
              id="formula-sheet-title"
              className="font-display text-xl font-bold text-slate-900 dark:text-white truncate"
            >
              {activeScope === 'topic'
                ? topicSheet.title
                : `נוסחאות מרכזיות בתחום ${topicCategory}`}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center shrink-0"
            aria-label="סגירת דף נוסחאות"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scope Tabs & Quick Filter */}
        <div className="px-6 py-3 bg-slate-50/70 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {hasDistinctCategoryTab ? (
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 self-start">
              <button
                type="button"
                onClick={() => setActiveScope('topic')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeScope === 'topic'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                נוסחאות השיעור ({topicSheet.formulas.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveScope('category')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeScope === 'category'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                כללי {topicCategory} ({categoryFormulas.length})
              </button>
            </div>
          ) : (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
              {currentList.length} נוסחאות חיוניות לנושא
            </span>
          )}

          <div className="relative flex-1 sm:max-w-[220px]">
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="חיפוש נוסחה..."
              aria-label="חיפוש נוסחה"
              className="w-full h-8 pr-3 pl-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {filterText && (
              <button
                type="button"
                onClick={() => setFilterText('')}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="נקה חיפוש"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Formula Cards List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredFormulas.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
              לא נמצאו נוסחאות התואמות לחיפוש.
            </div>
          ) : (
            filteredFormulas.map((item) => (
              <div
                key={item.id}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-white dark:bg-slate-900 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    <MathRenderer text={item.title} />
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCopyLatex(item)}
                    className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors shrink-0 inline-flex items-center gap-1"
                    title="העתקת קוד LaTeX של הנוסחה"
                  >
                    {copiedId === item.id ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        הועתק
                      </span>
                    ) : (
                      <span>העתקה</span>
                    )}
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 overflow-x-auto">
                  <MathRenderer text={`$$${item.latex}$$`} block />
                </div>

                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <MathRenderer text={item.explanation} />
                </p>

                {item.example && (
                  <div className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 ml-1.5">
                      דוגמה:
                    </span>
                    <MathRenderer text={item.example} />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ניתן לפתוח את דף הנוסחאות בכל שלב במהלך הקריאה
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            סגירה
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormulaSheetModal;
