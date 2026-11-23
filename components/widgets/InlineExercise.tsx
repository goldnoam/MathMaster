import React, { useState } from 'react';
import MathRenderer from '../MathRenderer.tsx';

interface InlineExerciseProps {
  question: string;
  answer: string;
}

const InlineExercise: React.FC<InlineExerciseProps> = ({ question, answer }) => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const checkAnswer = () => {
    if (!input.trim()) return;
    if (input.trim().replace(/\s+/g, '') === answer.trim().replace(/\s+/g, '')) {
      setStatus('correct');
    } else {
      setStatus('incorrect');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkAnswer();
    }
  };

  return (
    <div className="my-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-5 rounded-xl">
      <div className="text-xs font-semibold text-blue-600 dark:text-sky-400 mb-2">
        תרגול מהיר
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <label className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed">
          <MathRenderer text={question} />
        </label>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setStatus('idle');
            }}
            onKeyDown={handleKeyDown}
            placeholder="תשובה"
            className="w-28 h-10 px-3 text-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-600 dark:focus:ring-sky-400 focus:border-transparent outline-none"
            dir="ltr"
          />
          <button
            type="button"
            onClick={checkAnswer}
            className="h-10 px-4 bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 rounded-lg hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors text-sm font-semibold whitespace-nowrap"
          >
            בדיקה
          </button>
        </div>
      </div>

      {status === 'correct' && (
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>נכון מאוד! התשובה מדויקת.</span>
        </div>
      )}
      {status === 'incorrect' && (
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>לא מדויק, נסו לחשב שוב.</span>
        </div>
      )}
    </div>
  );
};

export default InlineExercise;