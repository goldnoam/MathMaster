import React, { useState, useMemo } from 'react';
import {
  GradeLevel,
  Topic,
  Difficulty,
  DIFFICULTY_LABELS,
  UserProgressData,
} from '../types.ts';
import { STATIC_DATA_DB } from '../data/staticCurriculum.ts';
import { QUESTION_BANK } from '../data/questionBank.ts';
import TopicGlyph from './TopicGlyph.tsx';

interface TopicSelectorProps {
  grade: GradeLevel;
  onSelectTopic: (topic: Topic, difficulty: Difficulty) => void;
  onBack: () => void;
  progress?: UserProgressData;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({
  grade,
  onSelectTopic,
  onBack,
  progress,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

  const topicStats = useMemo(() => {
    const map: Record<
      string,
      {
        studied: boolean;
        bestScore: number | null;
        sectionCount: number;
        exerciseCount: number;
        quizCount: number;
      }
    > = {};
    const gradeStatic = STATIC_DATA_DB[grade.id];

    grade.topics.forEach((t) => {
      const studied = Boolean(progress?.studiedTopics[t.id]);
      const matchingQuizzes = (progress?.completedQuizzes || []).filter(
        (q) => q.topicId === t.id
      );
      const bestScore =
        matchingQuizzes.length > 0
          ? Math.max(...matchingQuizzes.map((q) => q.percentage))
          : null;

      const topicStatic = gradeStatic?.topics[t.id];
      const md = topicStatic?.lesson?.markdown || '';
      const sectionCount = (md.match(/^##\s+/gm) || []).length;
      const exerciseCount = (md.match(/```exercise/g) || []).length;
      const staticQuiz = topicStatic?.quiz || [];
      const bankExtras = QUESTION_BANK.filter(
        (q) =>
          q.topicId === t.id &&
          !staticQuiz.some((sq) => sq.question.trim() === q.question.trim())
      ).length;

      map[t.id] = {
        studied,
        bestScore,
        sectionCount,
        exerciseCount,
        quizCount: staticQuiz.length + bankExtras,
      };
    });
    return map;
  }, [grade.id, grade.topics, progress]);

  const completedCount = useMemo(() => {
    return grade.topics.filter(
      (t) => topicStats[t.id]?.studied || topicStats[t.id]?.bestScore !== null
    ).length;
  }, [grade.topics, topicStats]);

  const completionPercent =
    grade.topics.length > 0 ? Math.round((completedCount / grade.topics.length) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pt-6 pb-12 animate-fadeIn">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <span>חזרה לכל הכיתות</span>
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex flex-wrap items-center gap-2">
              <span>תכנית לימודים</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{grade.topics.length} נושאים</span>
              {progress && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums text-blue-600 dark:text-sky-400 font-semibold">
                    {completedCount}/{grade.topics.length} הושלמו
                  </span>
                </>
              )}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              נושאי הלימוד עבור {grade.name}
            </h1>

            {progress && (
              <div className="mt-4 max-w-sm">
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 dark:bg-sky-400 transition-all duration-300"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Segmented Difficulty Selector */}
          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              בחירת רמת שיעור ותרגול:
            </span>
            <div
              className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
              role="group"
              aria-label="רמת קושי"
            >
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((diff) => {
                const active = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                      active
                        ? 'bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {DIFFICULTY_LABELS[diff]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {grade.topics.map((topic, index) => {
          const stats = topicStats[topic.id];
          const isMastered = stats?.bestScore !== null && stats.bestScore >= 80;

          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onSelectTopic(topic, selectedDifficulty)}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-sky-400 rounded-xl p-5 text-right transition-all duration-150 hover:shadow-md flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <div className="flex items-center gap-4 min-w-0">
                <TopicGlyph topicId={topic.id} size="lg" />
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex flex-wrap items-center gap-1.5">
                    <span className="font-mono tabular-nums">0{index + 1}</span>
                    {topic.category && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{topic.category}</span>
                      </>
                    )}
                    {stats?.bestScore !== null && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-mono tabular-nums font-semibold ${
                            isMastered
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-blue-600 dark:text-sky-400'
                          }`}
                        >
                          שיא {stats.bestScore}%
                        </span>
                      </>
                    )}
                    {stats?.bestScore === null && stats?.studied && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          נלמד
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors truncate">
                    {topic.name}
                  </h2>
                  {stats && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-1.5 tabular-nums">
                      {stats.sectionCount > 0 && <span>{stats.sectionCount} חלקי לימוד</span>}
                      {stats.exerciseCount > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{stats.exerciseCount} תרגילים בשיעור</span>
                        </>
                      )}
                      {stats.quizCount > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{stats.quizCount} שאלות תרגול</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 text-xs font-semibold text-blue-600 dark:text-sky-400">
                <span className="hidden sm:inline">פתיחת שיעור</span>
                <svg className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TopicSelector;