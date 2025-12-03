import React, { useState } from 'react';

interface InlineExerciseProps {
  question: string;
  answer: string;
}

const InlineExercise: React.FC<InlineExerciseProps> = ({ question, answer }) => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const checkAnswer = () => {
    if (input.trim() === answer.trim()) {
      setStatus('correct');
    } else {
      setStatus('incorrect');
    }
  };

  return (
    <div className="my-6 bg-indigo-50 dark:bg-indigo-900/20 border-r-4 border-indigo-500 p-4 rounded-l-lg shadow-sm">
      <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 text-sm uppercase tracking-wide">
        ✍️ תרגול מהיר
      </h4>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <label className="text-lg font-medium text-gray-900 dark:text-gray-100">{question}</label>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setStatus('idle');
            }}
            placeholder="?"
            className="w-20 p-2 text-center rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            dir="ltr"
          />
          <button 
            onClick={checkAnswer}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors text-sm font-bold"
          >
            בדיקה
          </button>
        </div>
      </div>
      {status === 'correct' && (
        <p className="mt-2 text-green-600 dark:text-green-400 font-bold animate-pulse">🎉 כל הכבוד! תשובה נכונה.</p>
      )}
      {status === 'incorrect' && (
        <p className="mt-2 text-red-500 dark:text-red-400 font-bold">❌ לא מדויק, נסו שוב.</p>
      )}
    </div>
  );
};

export default InlineExercise;