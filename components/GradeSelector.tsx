import React, { useState, useMemo } from 'react';
import { GradeLevel, Topic, TopicCategory } from '../types.ts';
import { CURRICULUM } from '../constants.ts';
import TopicGlyph from './TopicGlyph.tsx';

interface GradeSelectorProps {
  onSelectGrade: (grade: GradeLevel) => void;
  onSelectDirectTopic?: (grade: GradeLevel, topic: Topic) => void;
  onOpenCustomExam?: () => void;
  onOpenVisualLab?: () => void;
}

const CATEGORIES: { id: TopicCategory | 'הכל'; name: string }[] = [
  { id: 'הכל', name: 'כל התחומים' },
  { id: 'חשבון יסודי', name: 'חשבון יסודי' },
  { id: 'אלגברה', name: 'אלגברה' },
  { id: 'גיאומטריה', name: 'גיאומטריה' },
  { id: 'טריגונומטריה', name: 'טריגונומטריה' },
  { id: 'חשבון דיפרנציאלי ואינטגרלי', name: 'חדו״א' },
  { id: 'הסתברות וסטטיסטיקה', name: 'הסתברות' },
];

type SchoolStage = 'all' | 'elementary' | 'middle' | 'high';

const getStageInfo = (gradeId: string): { stage: Exclude<SchoolStage, 'all'>; label: string; number: string } => {
  const num = parseInt(gradeId.replace('grade-', ''), 10);
  const padded = num < 10 ? `0${num}` : `${num}`;
  if (num <= 6) return { stage: 'elementary', label: 'בית ספר יסודי', number: padded };
  if (num <= 9) return { stage: 'middle', label: 'חטיבת ביניים', number: padded };
  return { stage: 'high', label: 'תיכון ובגרות', number: padded };
};

const GradeSelector: React.FC<GradeSelectorProps> = ({
  onSelectGrade,
  onSelectDirectTopic,
  onOpenCustomExam,
  onOpenVisualLab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory | 'הכל'>('הכל');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<SchoolStage>('all');

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const results: { grade: GradeLevel; topic: Topic }[] = [];

    CURRICULUM.forEach((grade) => {
      if (selectedGradeFilter !== 'all' && grade.id !== selectedGradeFilter) {
        return;
      }

      grade.topics.forEach((topic) => {
        if (selectedCategory !== 'הכל' && topic.category !== selectedCategory) {
          return;
        }

        if (query) {
          const matchQuery =
            topic.name.toLowerCase().includes(query) ||
            grade.name.toLowerCase().includes(query) ||
            (topic.category && topic.category.toLowerCase().includes(query));

          if (!matchQuery) return;
        }

        results.push({ grade, topic });
      });
    });

    return results;
  }, [searchQuery, selectedCategory, selectedGradeFilter]);

  const filteredGrades = useMemo(() => {
    if (selectedStage === 'all') return CURRICULUM;
    return CURRICULUM.filter((g) => getStageInfo(g.id).stage === selectedStage);
  }, [selectedStage]);

  const isFiltering =
    searchQuery.trim() !== '' || selectedCategory !== 'הכל' || selectedGradeFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('הכל');
    setSelectedGradeFilter('all');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-12 animate-fadeIn">
      {/* Asymmetric Two-Column Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6 lg:gap-8 items-stretch mb-10">
        {/* Start Column: Headline + Search Command */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-blue-600 dark:text-sky-400 mb-3">
              תכנית הלימודים במתמטיקה · כיתות א׳ עד י״ב
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
              מתמטיקה ברורה, צעד אחר צעד
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed max-w-xl mb-6">
              שיעורים אינטראקטיביים, פתרונות מודרכים ותרגול אדפטיבי המותאם לרמת ההבנה שלך — זמינים גם בלמידה מקוונת וגם במצב אופליין.
            </p>
          </div>

          {/* Search Bar */}
          <div className="space-y-3">
            <label htmlFor="topic-search" className="sr-only">
              חיפוש נושא לימוד או כיתה
            </label>
            <div className="relative">
              <input
                id="topic-search"
                type="text"
                placeholder="חיפוש נושא, נוסחה או כיתה (למשל: טרינום, שברים, נגזרות)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pr-11 pl-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-sky-400 focus:border-transparent transition-shadow"
              />
              <svg
                className="w-5 h-5 text-slate-400 absolute top-1/2 right-3.5 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded"
                  aria-label="נקה חיפוש"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{CURRICULUM.length} שכבות גיל</span>
              <span aria-hidden="true">·</span>
              <span>{CURRICULUM.reduce((acc, g) => acc + g.topics.length, 0)} נושאי לימוד</span>
              <span aria-hidden="true">·</span>
              <span>מאגר שאלות עם פתרונות מלאים</span>
            </div>

            {(onOpenCustomExam || onOpenVisualLab) && (
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {onOpenCustomExam && (
                  <button
                    type="button"
                    onClick={onOpenCustomExam}
                    className="h-10 px-4 rounded-xl bg-blue-600 dark:bg-sky-500 hover:bg-blue-700 dark:hover:bg-sky-400 text-white dark:text-slate-950 text-xs md:text-sm font-semibold transition-colors inline-flex items-center gap-2"
                  >
                    <span>מחולל מבחנים מותאם</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                )}
                {onOpenVisualLab && (
                  <button
                    type="button"
                    onClick={onOpenVisualLab}
                    className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-blue-500 dark:hover:border-sky-400 hover:text-blue-600 dark:hover:text-sky-400 text-xs md:text-sm font-semibold transition-colors inline-flex items-center gap-2"
                  >
                    <span>מעבדת הדגמות ויזואליות</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* End Column: Architectural Coordinate Plane Visual */}
        <div className="hidden lg:flex flex-col justify-between bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-2xl p-6 math-grid-bg relative overflow-hidden text-slate-100">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>y = x² − 2x − 3</span>
            <span className="tabular-nums">x ∈ [-2, 4]</span>
          </div>

          <div className="my-4 flex-1 flex items-center justify-center">
            <svg
              viewBox="0 0 320 190"
              className="w-full h-full max-h-[190px]"
              role="img"
              aria-label="גרף פונקציה ריבועית במערכת צירים"
            >
              {/* Subtle Grid Lines */}
              <g stroke="rgba(148,163,184,0.14)" strokeWidth="1">
                <line x1="40" y1="20" x2="40" y2="170" />
                <line x1="100" y1="20" x2="100" y2="170" />
                <line x1="220" y1="20" x2="220" y2="170" />
                <line x1="280" y1="20" x2="280" y2="170" />
                <line x1="20" y1="45" x2="300" y2="45" />
                <line x1="20" y1="85" x2="300" y2="85" />
                <line x1="20" y1="165" x2="300" y2="165" />
              </g>

              {/* Coordinate Axes */}
              <g stroke="rgba(148,163,184,0.55)" strokeWidth="1.5">
                <line x1="20" y1="125" x2="300" y2="125" />
                <line x1="160" y1="15" x2="160" y2="175" />
              </g>

              {/* Parabola Curve */}
              <path
                d="M 55 25 Q 160 220 265 25"
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Tangent / Secant Reference Line */}
              <line
                x1="70"
                y1="150"
                x2="265"
                y2="58"
                stroke="#F59E0B"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Key Points: Roots and Vertex */}
              <circle cx="101" cy="125" r="4" fill="#38BDF8" />
              <circle cx="219" cy="125" r="4" fill="#38BDF8" />
              <circle cx="160" cy="122" r="4.5" fill="#F59E0B" />
            </svg>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono text-slate-400" dir="ltr">
            <span>(x − 3)(x + 1) = 0</span>
            <span className="text-sky-400">Δ = b² − 4ac</span>
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          {/* Segmented Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="סינון לפי תחום מתמטי">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    active
                      ? 'bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Grade Filter Dropdown & Reset */}
          <div className="flex items-center gap-2.5 shrink-0">
            <label htmlFor="grade-filter" className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
              כיתה:
            </label>
            <select
              id="grade-filter"
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">כל הכיתות (א׳–י״ב)</option>
              {CURRICULUM.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>

            {isFiltering && (
              <button
                type="button"
                onClick={resetFilters}
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                איפוס
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Search / Filter Results OR Grade Directory */}
      {isFiltering ? (
        <section className="animate-fadeIn">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              תוצאות סינון ({searchResults.length})
            </h2>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
              <p className="text-slate-700 dark:text-slate-200 font-semibold text-base mb-1">
                לא נמצאו נושאים תואמים לחיפוש
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
                נסו להקליד מילת מפתח אחרת או לאפס את מסנני הכיתה והתחום.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 rounded-xl text-sm font-semibold hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors"
              >
                הצגת כל הנושאים
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result) => (
                <button
                  key={`${result.grade.id}-${result.topic.id}`}
                  type="button"
                  onClick={() => onSelectDirectTopic && onSelectDirectTopic(result.grade, result.topic)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-sky-400 rounded-xl p-5 text-right transition-all duration-150 hover:shadow-md flex flex-col justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <div className="flex items-start gap-3.5">
                    <TopicGlyph topicId={result.topic.id} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                        <span className="font-medium text-blue-600 dark:text-sky-400">{result.grade.name}</span>
                        {result.topic.category && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="truncate">{result.topic.category}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-display font-bold text-base text-slate-900 dark:text-white leading-snug">
                        {result.topic.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-blue-600 dark:text-sky-400">
                    <span>פתיחת שיעור</span>
                    <svg className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section>
          {/* Stage Selector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                בחירת כיתה לפי שכבת לימוד
              </h2>
            </div>

            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl self-start">
              {(
                [
                  { id: 'all', label: 'הכל' },
                  { id: 'elementary', label: 'יסודי (א׳–ו׳)' },
                  { id: 'middle', label: 'חטיבה (ז׳–ט׳)' },
                  { id: 'high', label: 'תיכון (י׳–י״ב)' },
                ] as { id: SchoolStage; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStage(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    selectedStage === tab.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clean 4-Column Academic Grade Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredGrades.map((grade) => {
              const info = getStageInfo(grade.id);
              return (
                <button
                  key={grade.id}
                  type="button"
                  onClick={() => onSelectGrade(grade)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-sky-400 rounded-xl p-5 text-right transition-all duration-150 hover:shadow-md flex flex-col justify-between min-h-[196px] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                      <span>{info.label}</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-400 dark:text-slate-500">
                        {info.number}
                      </span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                      {grade.name}
                    </h3>

                    <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      {grade.topics.map((topic) => (
                        <li key={topic.id} className="truncate flex items-center gap-1.5">
                          <span className="text-slate-400 dark:text-slate-600 select-none">•</span>
                          <span className="truncate">{topic.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-sky-400">
                    <span className="tabular-nums">{grade.topics.length} נושאי לימוד</span>
                    <svg className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default GradeSelector;