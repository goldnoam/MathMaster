import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onBack: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    
    if (index === currentQuestion.correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      onComplete(score + (selectedOption === currentQuestion.correctAnswerIndex ? 0 : 0)); // Score already updated
    }
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm">יציאה</button>
        <div className="flex-1 mx-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            className="h-full bg-green-500 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-gray-600 dark:text-gray-400 font-mono font-bold">{currentIndex + 1}/{questions.length}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 flex-1 border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-8 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => {
            let btnClass = "w-full p-4 rounded-xl text-right border-2 transition-all font-medium text-lg ";
            
            if (isAnswered) {
              if (idx === currentQuestion.correctAnswerIndex) {
                btnClass += "bg-green-100 dark:bg-green-900/40 border-green-500 text-green-800 dark:text-green-300";
              } else if (idx === selectedOption) {
                btnClass += "bg-red-100 dark:bg-red-900/40 border-red-500 text-red-800 dark:text-red-300";
              } else {
                btnClass += "bg-gray-50 dark:bg-gray-700 border-transparent opacity-50 dark:text-gray-400";
              }
            } else {
              btnClass += "bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                className={btnClass}
                disabled={isAnswered}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`mt-8 p-4 rounded-xl border animate-fadeIn ${
             selectedOption === currentQuestion.correctAnswerIndex 
             ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
             : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <h4 className={`font-bold mb-2 flex items-center gap-2 ${
                selectedOption === currentQuestion.correctAnswerIndex ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
            }`}>
              {selectedOption === currentQuestion.correctAnswerIndex 
                ? '🎉 כל הכבוד! תשובה נכונה.' 
                : '😕 לא נורא!'}
            </h4>
            
            {selectedOption !== currentQuestion.correctAnswerIndex && (
              <p className="text-red-900 dark:text-red-300 font-medium mb-2">
                התשובה הנכונה היא: {currentQuestion.options[currentQuestion.correctAnswerIndex]}
              </p>
            )}

            <div className="text-gray-800 dark:text-gray-200 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg mt-2 text-sm md:text-base">
                <span className="font-bold block mb-1">הסבר:</span>
                {currentQuestion.explanation}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
            isAnswered 
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 transform hover:-translate-y-1' 
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentIndex === questions.length - 1 ? 'סיום תרגול 🏆' : 'השאלה הבאה ➡️'}
        </button>
      </div>
    </div>
  );
};

export default QuizView;