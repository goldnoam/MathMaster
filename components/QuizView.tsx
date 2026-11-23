import React, { useState, useEffect, useRef } from 'react';
import { DIFFICULTY_LABELS, QuizQuestion } from '../types.ts';
import MathRenderer from './MathRenderer.tsx';
import {
  getAIFeedbackForMistake,
  AIMistakeFeedbackResult,
} from '../services/contentService.ts';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onQuizRecorded?: (score: number, total: number, usedExamMode: boolean) => void;
  onBack: () => void;
  quizTitle?: string;
  initialMode?: 'practice' | 'exam';
  lockMode?: boolean;
  timerMinutes?: number;
  backLabel?: string;
}

const HEBREW_LETTERS = ['א', 'ב', 'ג', 'ד'];

const formatCountdown = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const QuizView: React.FC<QuizViewProps> = ({
  questions,
  onComplete,
  onQuizRecorded,
  onBack,
  quizTitle,
  initialMode = 'practice',
  lockMode = false,
  timerMinutes,
  backLabel = 'יציאה מהתרגול',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const [isTestMode, setIsTestMode] = useState(initialMode === 'exam');
  const [quizFinished, setQuizFinished] = useState(false);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [showHint, setShowHint] = useState(false);
  const [showFullSolution, setShowFullSolution] = useState(false);
  const [adaptiveMessage, setAdaptiveMessage] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    initialMode === 'exam' && timerMinutes ? timerMinutes * 60 : null
  );

  // AI Explanation State
  const [aiFeedbackMap, setAiFeedbackMap] = useState<
    Record<number, AIMistakeFeedbackResult | null>
  >({});
  const [loadingAiFeedbackIdx, setLoadingAiFeedbackIdx] = useState<number | null>(null);
  const [expandedSummaryAiIdx, setExpandedSummaryAiIdx] = useState<
    Record<number, boolean>
  >({});

  const recordedRef = useRef(false);

  const fetchAiFeedback = async (
    questionIdx: number,
    selectedAnswerIdx: number,
    q: QuizQuestion
  ) => {
    if (aiFeedbackMap[questionIdx] || selectedAnswerIdx === null || selectedAnswerIdx === undefined) {
      return;
    }
    setLoadingAiFeedbackIdx(questionIdx);
    try {
      const feedback = await getAIFeedbackForMistake({
        questionId: q.id,
        gradeName: q.gradeName,
        topicName: q.topicName,
        question: q.question,
        userAnswer: q.options[selectedAnswerIdx],
        correctAnswer: q.options[q.correctAnswerIndex],
        explanation: q.explanation,
        fullSolution: q.fullSolution,
        difficulty: q.difficulty,
      });
      setAiFeedbackMap((prev) => ({ ...prev, [questionIdx]: feedback }));
    } catch (err) {
      console.warn('Failed to fetch AI feedback for question:', err);
    } finally {
      setLoadingAiFeedbackIdx(null);
    }
  };

  useEffect(() => {
    setIsTestMode(initialMode === 'exam');
    setSecondsLeft(initialMode === 'exam' && timerMinutes ? timerMinutes * 60 : null);
  }, [initialMode, timerMinutes]);

  useEffect(() => {
    if (!isTestMode || !timerMinutes || quizFinished) return;
    if (secondsLeft === null) {
      setSecondsLeft(timerMinutes * 60);
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isTestMode, timerMinutes, quizFinished, secondsLeft !== null]);

  // Auto-submit exam if timer expires
  useEffect(() => {
    if (isTestMode && timerMinutes && secondsLeft === 0 && !quizFinished) {
      let computedScore = 0;
      questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctAnswerIndex) {
          computedScore += 1;
        }
      });
      setScore(computedScore);
      setQuizFinished(true);
      if (onQuizRecorded && !recordedRef.current) {
        recordedRef.current = true;
        onQuizRecorded(computedScore, questions.length, true);
      }
    }
  }, [secondsLeft, isTestMode, timerMinutes, quizFinished, questions, userAnswers, onQuizRecorded]);

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 pt-10 pb-14 text-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
            לא נמצאו שאלות לתצוגה
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            בחרו הגדרות סינון רחבות יותר או חזרו לנושא הלימוד.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 rounded-xl bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 text-sm font-semibold"
          >
            חזרה
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index: number) => {
    if (isAnswered && !isTestMode) return;

    setSelectedOption(index);
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentIndex] = index;
    setUserAnswers(updatedAnswers);

    if (!isTestMode) {
      setIsAnswered(true);
      const isCorrect = index === currentQuestion.correctAnswerIndex;
      setShowFullSolution(!isCorrect);

      if (isCorrect) {
        setScore((s) => s + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > maxStreak) setMaxStreak(newStreak);

        if (newStreak >= 2) {
          setAdaptiveMessage(
            `רצף של ${newStreak} תשובות נכונות — השליטה שלך עולה בהתמדה.`
          );
        } else {
          setAdaptiveMessage(null);
        }
      } else {
        setStreak(0);
        setAdaptiveMessage(
          'בדקו את שלבי הפתרון המלא וניתוח הטעות של הבינה המלאכותית למטה.'
        );
        fetchAiFeedback(currentIndex, index, currentQuestion);
      }
    }
  };

  const handleNext = () => {
    let nextScore = score;
    const updatedAnswers = [...userAnswers];

    if (isTestMode) {
      updatedAnswers[currentIndex] = selectedOption;
      setUserAnswers(updatedAnswers);

      if (selectedOption === currentQuestion.correctAnswerIndex) {
        nextScore = score + 1;
        setScore(nextScore);
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > maxStreak) setMaxStreak(newStreak);
      } else {
        setStreak(0);
      }
    }

    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(updatedAnswers[nextIdx]);
      setIsAnswered(false);
      setShowHint(false);
      setShowFullSolution(false);
      setAdaptiveMessage(null);
    } else {
      setQuizFinished(true);
      if (onQuizRecorded && !recordedRef.current) {
        recordedRef.current = true;
        onQuizRecorded(nextScore, questions.length, isTestMode);
      }
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  if (quizFinished) {
    const finalScore = Math.round((score / questions.length) * 100);
    let summaryTitle = 'שליטה מצוינת בחומר';
    let summaryDesc = 'הפגנת הבנה גבוהה ועקבית לאורך כל השאלות.';

    if (finalScore < 60) {
      summaryTitle = 'מומלץ תרגול נוסף';
      summaryDesc = 'עברו על שלבי הפתרון המלאים שלמטה כדי לחזק את נקודות התורפה.';
    } else if (finalScore < 80) {
      summaryTitle = 'התקדמות טובה מאוד';
      summaryDesc = 'קיימת הבנה יציבה של הנושא; תרגול קצר נוסף יבטיח שליטה מלאה.';
    }

    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-6 pb-14 animate-fadeIn">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-10">
          <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-8 mb-8">
            <p className="text-xs font-medium text-blue-600 dark:text-sky-400 mb-2">
              {quizTitle || (isTestMode ? 'סיכום מבחן מסכם' : 'סיכום תרגול אדפטיבי')}
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {summaryTitle}
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-8">
              {summaryDesc}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              <div
                className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 ${
                  finalScore >= 80
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                    : finalScore >= 60
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'border-rose-500 text-rose-600 dark:text-rose-400'
                }`}
              >
                <span className="font-mono tabular-nums text-3xl font-bold">{finalScore}%</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">ציון סופי</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-right">
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-5 py-4 rounded-xl">
                  <div className="font-mono tabular-nums text-2xl font-bold text-slate-900 dark:text-white">
                    {score} / {questions.length}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    תשובות נכונות
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-5 py-4 rounded-xl">
                  <div className="font-mono tabular-nums text-2xl font-bold text-blue-600 dark:text-sky-400">
                    {maxStreak}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    רצף הצלחות מרבי
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              פירוט תשובות ופתרונות מלאים
            </h2>
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[idx];
              const isCorrect = userAnswer === q.correctAnswerIndex;
              const steps = q.fullSolution && q.fullSolution.length > 0 ? q.fullSolution : null;

              return (
                <div
                  key={q.id || idx}
                  className={`p-5 rounded-xl border ${
                    isCorrect
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900'
                      : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <span
                      className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-mono tabular-nums text-xs font-bold ${
                        isCorrect
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      {(q.topicName || q.difficulty) && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 flex flex-wrap items-center gap-1.5">
                          {q.gradeName && <span>{q.gradeName}</span>}
                          {q.topicName && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{q.topicName}</span>
                            </>
                          )}
                          {q.difficulty && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>רמה: {DIFFICULTY_LABELS[q.difficulty]}</span>
                            </>
                          )}
                        </div>
                      )}

                      <div className="font-semibold text-slate-900 dark:text-white mb-2 leading-relaxed">
                        <MathRenderer text={q.question} />
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-slate-600 dark:text-slate-400">
                          התשובה שלך:{' '}
                          <span
                            className={
                              isCorrect
                                ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                                : 'text-rose-700 dark:text-rose-400 font-semibold'
                            }
                          >
                            {userAnswer !== null ? (
                              <MathRenderer text={q.options[userAnswer]} />
                            ) : (
                              'לא סומנה תשובה'
                            )}
                          </span>
                        </p>
                        {!isCorrect && (
                          <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                            <span>התשובה הנכונה: </span>
                            <MathRenderer text={q.options[q.correctAnswerIndex]} />
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-200 mt-3 bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 leading-relaxed space-y-2">
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">תקציר: </span>
                          <MathRenderer text={q.explanation} />
                        </div>

                        {steps && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div className="font-semibold text-blue-700 dark:text-sky-400 mb-1.5">
                              פתרון מלא שלב אחר שלב:
                            </div>
                            <ol className="space-y-1 list-decimal list-inside text-slate-700 dark:text-slate-300">
                              {steps.map((step, sIdx) => (
                                <li key={sIdx}>
                                  <MathRenderer text={step} />
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>

                      {!isCorrect && userAnswer !== null && (
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              const willExpand = !expandedSummaryAiIdx[idx];
                              setExpandedSummaryAiIdx((prev) => ({ ...prev, [idx]: willExpand }));
                              if (willExpand && !aiFeedbackMap[idx]) {
                                fetchAiFeedback(idx, userAnswer, q);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-sky-400 hover:text-indigo-800 dark:hover:text-sky-300 transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                            </svg>
                            <span>
                              {expandedSummaryAiIdx[idx]
                                ? 'הסתרת ניתוח AI לטעות'
                                : 'ניתוח בינה מלאכותית של הטעות (AI Explanation)'}
                            </span>
                          </button>

                          {expandedSummaryAiIdx[idx] && (
                            <div className="mt-2.5 p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/60 dark:bg-indigo-950/25 text-xs space-y-2 animate-fadeIn">
                              {loadingAiFeedbackIdx === idx ? (
                                <div className="flex items-center gap-2 py-1 text-indigo-700 dark:text-indigo-300">
                                  <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                  <span>מפיק ניתוח פדגוגי של הטעות...</span>
                                </div>
                              ) : aiFeedbackMap[idx] ? (
                                <>
                                  <div className="flex items-center justify-between gap-2 pb-1 border-b border-indigo-100 dark:border-indigo-900/40">
                                    <span className="font-bold text-indigo-900 dark:text-indigo-300">
                                      משוב פדגוגי מותאם אישית
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-sky-300 font-medium">
                                      מנוע פדגוגי חכם
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-rose-700 dark:text-rose-400">זיהוי מקור הטעות: </span>
                                    <span className="text-slate-700 dark:text-slate-300">
                                      <MathRenderer text={aiFeedbackMap[idx]!.misconception} />
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-semibold text-indigo-700 dark:text-sky-400">איך לגשת נכון: </span>
                                    <span className="text-slate-700 dark:text-slate-300">
                                      <MathRenderer text={aiFeedbackMap[idx]!.pedagogicalTip} />
                                    </span>
                                  </div>
                                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-950 dark:text-amber-200">
                                    <span className="font-semibold">כלל אצבע ונוסחה: </span>
                                    <MathRenderer text={aiFeedbackMap[idx]!.ruleOfThumb} />
                                  </div>
                                </>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => onComplete(score)}
              className="px-8 py-3 bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 rounded-xl font-semibold text-sm hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors"
            >
              סיום וחזרה
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 pt-6 pb-12 animate-fadeIn">
      {/* Quiz Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span>{backLabel}</span>
        </button>

        {!lockMode && currentIndex === 0 && (
          <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setIsTestMode(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                !isTestMode
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              אימון (משוב מיידי)
            </button>
            <button
              type="button"
              onClick={() => setIsTestMode(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                isTestMode
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              מבחן מסכם
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          {isTestMode && secondsLeft !== null && (
            <span
              className={`font-mono tabular-nums font-bold px-2.5 py-1 rounded-lg border ${
                secondsLeft <= 60
                  ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200'
              }`}
            >
              {formatCountdown(secondsLeft)}
            </span>
          )}
          {streak > 0 && !isTestMode && (
            <span className="text-blue-600 dark:text-sky-400 font-semibold tabular-nums">
              רצף: {streak}
            </span>
          )}
          <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
      </div>

      {quizTitle && (
        <div className="mb-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
          {quizTitle}
        </div>
      )}

      {/* Hairline Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-blue-600 dark:bg-sky-400 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Question Surface */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-500 dark:text-slate-400">
            <span className="font-medium">
              {isTestMode ? 'מצב מבחן מסכם · פתרון מלא בסיום' : 'תרגול אינטראקטיבי · פתרון מלא מיידי'}
            </span>
            {currentQuestion.gradeName && (
              <>
                <span aria-hidden="true">·</span>
                <span>{currentQuestion.gradeName}</span>
              </>
            )}
            {currentQuestion.category && (
              <>
                <span aria-hidden="true">·</span>
                <span>{currentQuestion.category}</span>
              </>
            )}
            {currentQuestion.difficulty && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-blue-600 dark:text-sky-400">
                  {DIFFICULTY_LABELS[currentQuestion.difficulty]}
                </span>
              </>
            )}
          </div>

          {currentQuestion.hint && !isAnswered && !isTestMode && (
            <button
              type="button"
              onClick={() => setShowHint(!showHint)}
              className="inline-flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>{showHint ? 'הסתרת רמז' : 'הצגת רמז'}</span>
            </button>
          )}
        </div>

        {showHint && currentQuestion.hint && !isAnswered && !isTestMode && (
          <div className="mb-5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-3.5 rounded-xl text-sm text-amber-900 dark:text-amber-200 animate-fadeIn">
            <span className="font-semibold">רמז מנחה: </span>
            <MathRenderer text={currentQuestion.hint} />
          </div>
        )}

        {adaptiveMessage && !isTestMode && (
          <div className="mb-5 bg-blue-50 dark:bg-sky-950/30 border border-blue-200 dark:border-sky-900 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-blue-800 dark:text-sky-300 animate-fadeIn">
            {adaptiveMessage}
          </div>
        )}

        <h2 className="font-display text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
          <MathRenderer text={currentQuestion.question} />
        </h2>

        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = idx === selectedOption;
            const isCorrectOption = idx === currentQuestion.correctAnswerIndex;

            let cardClass =
              'w-full p-4 rounded-xl text-right border transition-all duration-150 font-medium text-base flex items-center justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ';

            if (!isTestMode && isAnswered) {
              if (isCorrectOption) {
                cardClass +=
                  'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200';
              } else if (isSelected) {
                cardClass +=
                  'bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-900 dark:text-rose-200';
              } else {
                cardClass +=
                  'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500';
              }
            } else if (isTestMode && isSelected) {
              cardClass +=
                'bg-blue-50 dark:bg-sky-950/40 border-blue-600 dark:border-sky-400 text-blue-900 dark:text-sky-100';
            } else {
              cardClass +=
                'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-sky-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200';
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleOptionClick(idx)}
                className={cardClass}
                disabled={!isTestMode && isAnswered}
              >
                <span className="leading-snug">
                  <MathRenderer text={option} />
                </span>
                <span className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-600 flex items-center justify-center text-xs font-semibold shrink-0 text-slate-500 dark:text-slate-400">
                  {HEBREW_LETTERS[idx] || idx + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback + Expandable Full Step-by-Step Solution */}
        {!isTestMode && isAnswered && (
          <div
            className={`p-4 md:p-5 rounded-xl border animate-fadeIn mb-6 ${
              selectedOption === currentQuestion.correctAnswerIndex
                ? 'bg-emerald-50 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-900'
                : 'bg-rose-50 dark:bg-rose-950/25 border-rose-200 dark:border-rose-900'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div
                className={`flex items-center gap-2 font-bold text-sm ${
                  selectedOption === currentQuestion.correctAnswerIndex
                    ? 'text-emerald-800 dark:text-emerald-300'
                    : 'text-rose-800 dark:text-rose-300'
                }`}
              >
                {selectedOption === currentQuestion.correctAnswerIndex ? (
                  <>
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>תשובה נכונה</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>תשובה שגויה</span>
                  </>
                )}
              </div>

              {currentQuestion.fullSolution && currentQuestion.fullSolution.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowFullSolution((prev) => !prev)}
                  className="text-xs font-semibold text-blue-700 dark:text-sky-400 hover:underline"
                >
                  {showFullSolution ? 'הסתרת דרך פתרון' : 'הצגת פתרון מלא שלב אחר שלב'}
                </button>
              )}
            </div>

            {selectedOption !== currentQuestion.correctAnswerIndex && (
              <div className="text-sm font-semibold text-rose-900 dark:text-rose-200 mb-2">
                <span>התשובה הנכונה היא: </span>
                <MathRenderer text={currentQuestion.options[currentQuestion.correctAnswerIndex]} />
              </div>
            )}

            <div className="text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800 leading-relaxed space-y-2.5">
              <div>
                <span className="font-semibold text-slate-900 dark:text-white">הסבר: </span>
                <MathRenderer text={currentQuestion.explanation} />
              </div>

              {showFullSolution &&
                currentQuestion.fullSolution &&
                currentQuestion.fullSolution.length > 0 && (
                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                    <div className="text-xs font-bold text-blue-700 dark:text-sky-400 mb-1.5">
                      שלבי הפתרון המלאים:
                    </div>
                    <ol className="space-y-1.5 list-decimal list-inside text-xs md:text-sm text-slate-700 dark:text-slate-300">
                      {currentQuestion.fullSolution.map((step, sIdx) => (
                        <li key={sIdx} className="leading-relaxed">
                          <MathRenderer text={step} />
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
            </div>

            {/* AI Pedagogical Feedback Card for Incorrect Answer */}
            {selectedOption !== currentQuestion.correctAnswerIndex && (
              <div className="mt-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/50 dark:from-indigo-950/30 dark:via-slate-900 dark:to-sky-950/20 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-indigo-100 dark:border-indigo-900/40">
                  <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 font-bold text-xs md:text-sm">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-sky-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    <span>הסבר בינה מלאכותית על הטעות (AI Explanation)</span>
                  </div>
                  {aiFeedbackMap[currentIndex] && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-sky-300">
                      מנוע פדגוגי חכם
                    </span>
                  )}
                </div>

                {loadingAiFeedbackIdx === currentIndex ? (
                  <div className="flex items-center gap-3 py-2 text-xs md:text-sm text-indigo-700 dark:text-indigo-300">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>מנתח את מקור הטעות ומגבש משוב פדגוגי אישי...</span>
                  </div>
                ) : aiFeedbackMap[currentIndex] ? (
                  <div className="space-y-2.5 text-xs md:text-sm">
                    <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                      <div className="font-semibold text-rose-700 dark:text-rose-400 mb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
                        זיהוי התפיסה המוטעית:
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        <MathRenderer text={aiFeedbackMap[currentIndex]!.misconception} />
                      </p>
                    </div>

                    <div className="bg-white/90 dark:bg-slate-900/90 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                      <div className="font-semibold text-indigo-700 dark:text-sky-400 mb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-sky-400 inline-block" />
                        איך לגשת נכון לפתרון:
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        <MathRenderer text={aiFeedbackMap[currentIndex]!.pedagogicalTip} />
                      </p>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-200">
                      <div className="font-semibold mb-1 flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                        כלל אצבע ונוסחה לזכירה:
                      </div>
                      <p className="leading-relaxed font-medium">
                        <MathRenderer text={aiFeedbackMap[currentIndex]!.ruleOfThumb} />
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fetchAiFeedback(currentIndex, selectedOption, currentQuestion)}
                    className="text-xs font-semibold text-indigo-700 dark:text-sky-400 hover:underline inline-flex items-center gap-1.5"
                  >
                    <span>קבל הסבר AI על מקור הטעות וכיצד להימנע ממנה</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleNext}
            disabled={isTestMode ? selectedOption === null : !isAnswered}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm md:text-base transition-colors flex items-center justify-center gap-2 ${
              (isTestMode ? selectedOption !== null : isAnswered)
                ? 'bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-blue-700 dark:hover:bg-sky-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>
              {currentIndex === questions.length - 1 ? 'סיום והצגת סיכום' : 'לשאלה הבאה'}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizView;