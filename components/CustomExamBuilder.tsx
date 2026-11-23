import React, { useMemo, useState } from 'react';
import { CURRICULUM } from '../constants.ts';
import { BankQuestion, QUESTION_BANK } from '../data/questionBank.ts';
import {
  ALL_CATEGORIES,
  CustomExamConfig,
  DIFFICULTY_LABELS,
  Difficulty,
  QuizQuestion,
  TopicCategory,
} from '../types.ts';
import MathRenderer from './MathRenderer.tsx';

interface CustomExamBuilderProps {
  onBack: () => void;
  onLaunchExam: (questions: QuizQuestion[], config: CustomExamConfig) => void;
  isOnline: boolean;
}

type StagePreset = 'all' | 'elementary' | 'middle' | 'high';

const getStageGradeIds = (stage: StagePreset): string[] => {
  if (stage === 'all') return [];
  return CURRICULUM.filter((g) => {
    const num = parseInt(g.id.replace('grade-', ''), 10);
    if (stage === 'elementary') return num <= 6;
    if (stage === 'middle') return num >= 7 && num <= 9;
    return num >= 10;
  }).map((g) => g.id);
};

const shuffleItems = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const CustomExamBuilder: React.FC<CustomExamBuilderProps> = ({
  onBack,
  onLaunchExam,
  isOnline,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TopicCategory | 'all'>('all');
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty | 'mixed'>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(6);
  const [mode, setMode] = useState<'practice' | 'exam'>('practice');
  const [timerMinutes, setTimerMinutes] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [previewSampleIndex, setPreviewSampleIndex] = useState<number>(0);

  const matchingQuestions = useMemo<BankQuestion[]>(() => {
    return QUESTION_BANK.filter((q) => {
      if (selectedCategory !== 'all' && q.category !== selectedCategory) return false;
      if (selectedGrades.length > 0 && !selectedGrades.includes(q.gradeId)) return false;
      if (difficulty !== 'mixed' && q.difficulty !== difficulty) return false;
      return true;
    });
  }, [selectedCategory, selectedGrades, difficulty]);

  const toggleGrade = (gradeId: string) => {
    setSelectedGrades((prev) =>
      prev.includes(gradeId) ? prev.filter((id) => id !== gradeId) : [...prev, gradeId]
    );
  };

  const applyStagePreset = (stage: StagePreset) => {
    setSelectedGrades(getStageGradeIds(stage));
  };

  const buildTitle = (): string => {
    const domainPart = selectedCategory === 'all' ? 'מבחן משולב' : selectedCategory;
    const diffPart =
      difficulty === 'mixed' ? 'רמה מדורגת' : `רמה ${DIFFICULTY_LABELS[difficulty]}`;
    const modePart = mode === 'exam' ? 'מבחן' : 'תרגול';
    return `${modePart} מותאם אישית · ${domainPart} (${diffPart})`;
  };

  const handleStart = async () => {
    setIsGenerating(true);
    try {
      let pool: QuizQuestion[] = shuffleItems(matchingQuestions);

      if (difficulty === 'mixed' && pool.length > 0) {
        const easy = pool.filter((q) => q.difficulty === 'easy');
        const med = pool.filter((q) => q.difficulty === 'medium');
        const hard = pool.filter((q) => q.difficulty === 'hard');
        pool = [...easy, ...med, ...hard];
      }

      const finalQuestions = pool.slice(0, Math.min(questionCount, pool.length));
      if (finalQuestions.length === 0) return;

      onLaunchExam(finalQuestions, {
        title: buildTitle(),
        category: selectedCategory,
        gradeIds: selectedGrades,
        difficulty,
        questionCount: finalQuestions.length,
        mode,
        timerMinutes: mode === 'exam' ? timerMinutes : undefined,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const safeSample =
    matchingQuestions.length > 0
      ? matchingQuestions[previewSampleIndex % matchingQuestions.length]
      : null;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 pb-14 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
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
          מחולל מבחנים ותרגולים מותאם אישית
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          הרכיבו מבחן או מקבץ תרגול מתוך מאגר השאלות (א׳–י״ב) לפי תחום, כיתה ורמת קושי — כולל פתרון מלא שלב אחר שלב לכל שאלה.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6 items-start">
        {/* Configuration Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
          {/* 1. Domain Filter */}
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
              1. תחום מתמטי
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                כל התחומים
              </button>
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950'
                      : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Grade Filter */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                2. שכבת גיל וכיתות ({selectedGrades.length === 0 ? 'כל הכיתות' : `${selectedGrades.length} נבחרו`})
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => applyStagePreset('all')}
                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  הכל
                </button>
                <button
                  type="button"
                  onClick={() => applyStagePreset('elementary')}
                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  יסודי
                </button>
                <button
                  type="button"
                  onClick={() => applyStagePreset('middle')}
                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  חטיבה
                </button>
                <button
                  type="button"
                  onClick={() => applyStagePreset('high')}
                  className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  תיכון
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {CURRICULUM.map((grade) => {
                const active = selectedGrades.includes(grade.id);
                return (
                  <button
                    key={grade.id}
                    type="button"
                    onClick={() => toggleGrade(grade.id)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-colors ${
                      active
                        ? 'bg-blue-50 dark:bg-sky-950/50 border-blue-600 dark:border-sky-400 text-blue-700 dark:text-sky-300'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {grade.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Difficulty & Question Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
                3. רמת קושי
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'mixed', label: 'משולב (מדורג)' },
                    { id: 'easy', label: 'בסיסי' },
                    { id: 'medium', label: 'בינוני' },
                    { id: 'hard', label: 'מתקדם' },
                  ] as { id: Difficulty | 'mixed'; label: string }[]
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDifficulty(item.id)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                      difficulty === item.id
                        ? 'bg-blue-600 dark:bg-sky-500 border-transparent text-white dark:text-slate-950'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
                4. מספר שאלות
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[4, 6, 8, 10, 12].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`py-2 rounded-lg font-mono tabular-nums text-xs font-bold border transition-colors ${
                      questionCount === count
                        ? 'bg-blue-600 dark:bg-sky-500 border-transparent text-white dark:text-slate-950'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Mode & Timer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">
                5. מצב עבודה
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('practice')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                    mode === 'practice'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  תרגול מודרך
                </button>
                <button
                  type="button"
                  onClick={() => setMode('exam')}
                  className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-colors ${
                    mode === 'exam'
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  מבחן מתוזמן
                </button>
              </div>
            </div>

            <div>
              {mode === 'exam' ? (
                <>
                  <label
                    htmlFor="exam-timer-select"
                    className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5"
                  >
                    מגבלת זמן למבחן
                  </label>
                  <select
                    id="exam-timer-select"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white"
                  >
                    <option value={5}>5 דקות</option>
                    <option value={10}>10 דקות</option>
                    <option value={15}>15 דקות</option>
                    <option value={25}>25 דקות</option>
                  </select>
                </>
              ) : (
                <div className="flex items-center justify-between gap-3 h-full pt-5">
                  <div>
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      מאגר שאלות מובנה
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      שאלות מדויקות עם פתרונות מלאים
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-sky-950/60 text-blue-700 dark:text-sky-300 border border-blue-200 dark:border-sky-800">
                    {matchingQuestions.length} זמינות
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary & Sample Question Preview Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  סיכום התאמה מהמאגר
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  כל השאלות כוללות דרך פתרון מלאה שלב אחר שלב
                </p>
              </div>
              <div className="text-left">
                <div className="font-mono tabular-nums text-2xl font-bold text-blue-600 dark:text-sky-400">
                  {matchingQuestions.length}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  שאלות תואמות במאגר
                </div>
              </div>
            </div>

            <dl className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">תחום נבחר:</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {selectedCategory === 'all' ? 'כל התחומים' : selectedCategory}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">רמת קושי:</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {difficulty === 'mixed' ? 'משולב (מדורג)' : DIFFICULTY_LABELS[difficulty]}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500 dark:text-slate-400">אופן תרגול:</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {mode === 'exam' ? `מבחן (${timerMinutes} דקות)` : 'תרגול מודרך עם פתרון מיידי'}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              disabled={isGenerating || matchingQuestions.length === 0}
              onClick={handleStart}
              className="w-full py-3.5 px-5 rounded-xl bg-blue-600 dark:bg-sky-500 hover:bg-blue-700 dark:hover:bg-sky-400 disabled:opacity-50 text-white dark:text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>
                {isGenerating
                  ? 'מרכיב את המבחן...'
                  : mode === 'exam'
                  ? `התחלת מבחן (${Math.min(questionCount, matchingQuestions.length)} שאלות)`
                  : `התחלת תרגול (${Math.min(questionCount, matchingQuestions.length)} שאלות)`}
              </span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>

          {/* Sample Question & Full Solution Preview */}
          {safeSample ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  דוגמה מתוך השאלות שנבחרו
                </span>
                {matchingQuestions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setPreviewSampleIndex((prev) => prev + 1)}
                    className="text-blue-600 dark:text-sky-400 font-semibold hover:underline"
                  >
                    הצג דוגמה אחרת
                  </button>
                )}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {safeSample.gradeName} · {safeSample.topicName} · {DIFFICULTY_LABELS[safeSample.difficulty]}
              </div>
              <div className="font-semibold text-sm text-slate-900 dark:text-white leading-relaxed">
                <MathRenderer text={safeSample.question} />
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-1.5">
                <div className="font-semibold text-blue-700 dark:text-sky-400">
                  פתרון מלא במאגר ({safeSample.fullSolution.length} שלבים):
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  {safeSample.fullSolution.map((step, i) => (
                    <li key={i}>
                      <MathRenderer text={step} />
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl p-5 text-xs text-amber-900 dark:text-amber-200">
              לא נמצאו שאלות במאגר המקומי לצירוף המסננים הזה. הרחיבו את טווח הכיתות או התחומים.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomExamBuilder;
