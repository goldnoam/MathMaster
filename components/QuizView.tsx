import React, { useState } from 'react';
import { QuizQuestion } from '../types.ts';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete: (score: number) => void;
  onBack: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // State for tracking flow
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Mode State
  const [isTestMode, setIsTestMode] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Data Tracking
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showHint, setShowHint] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleOptionClick = (index: number) => {
    if (isAnswered && !isTestMode) return; // In practice mode, lock after answer. In test mode, allow changing before 'Next'? Let's lock it for simplicity or allow change. 
    // For this implementation: Test Mode allows changing until "Next" is clicked? Or just immediate select?
    // Let's stick to standard: click selects it.
    
    setSelectedOption(index);
    if (!isTestMode) {
      setIsAnswered(true);
      if (index === currentQuestion.correctAnswerIndex) {
        setScore(s => s + 1);
      }
    }
  };

  const handleNext = () => {
    // Save answer in Test Mode logic
    if (isTestMode) {
       const updatedAnswers = [...userAnswers];
       updatedAnswers[currentIndex] = selectedOption;
       setUserAnswers(updatedAnswers);
       
       if (selectedOption === currentQuestion.correctAnswerIndex) {
         setScore(s => s + 1);
       }
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      setQuizFinished(true);
    }
  };

  const finishQuiz = () => {
      onComplete(score);
  };

  const progress = ((currentIndex + 1) / questions.length) * 100;

  // View: Quiz Summary (Report Card)
  if (quizFinished) {
    const finalScore = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-3xl mx-auto p-4 animate-fadeIn">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">סיכום מבחן 📝</h2>
          
          <div className="flex justify-center items-center mb-8">
            <div className={`w-32 h-32 rounded-full flex items-center justify-center border-8 text-3xl font-bold ${
              finalScore >= 80 ? 'border-green-500 text-green-600' :
              finalScore >= 60 ? 'border-yellow-500 text-yellow-600' :
              'border-red-500 text-red-600'
            }`}>
              {finalScore}%
            </div>
          </div>

          <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">
            ענית נכון על <span className="font-bold">{score}</span> מתוך <span className="font-bold">{questions.length}</span> שאלות.
          </p>
          
          {/* Detailed Breakdown */}
          <div className="text-right space-y-6">
            {questions.map((q, idx) => {
              const userAnswer = userAnswers[idx];
              const isCorrect = userAnswer === q.correctAnswerIndex;
              
              return (
                <div key={idx} className={`p-4 rounded-lg border ${
                  isCorrect 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-start gap-3">
                     <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                       isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                     }`}>
                       {idx + 1}
                     </span>
                     <div className="flex-1">
                       <p className="font-bold text-gray-800 dark:text-gray-200 mb-2">{q.question}</p>
                       <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                         התשובה שלך: <span className={isCorrect ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>
                           {userAnswer !== null ? q.options[userAnswer] : '(לא נענה)'}
                         </span>
                       </p>
                       {!isCorrect && (
                         <p className="text-sm text-green-600 dark:text-green-400 font-bold">
                           התשובה הנכונה: {q.options[q.correctAnswerIndex]}
                         </p>
                       )}
                       <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 bg-white dark:bg-gray-800 p-2 rounded">
                         הסבר: {q.explanation}
                       </p>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={finishQuiz}
            className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
          >
            חזרה לרשימת הנושאים
          </button>
        </div>
      </div>
    );
  }

  // View: Active Quiz
  return (
    <div className="max-w-2xl mx-auto p-4 min-h-screen flex flex-col">
       <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm">יציאה</button>
        
        {/* Test Mode Toggle - Only visible on first question */}
        {currentIndex === 0 && (
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm mx-2">
             <button
               onClick={() => setIsTestMode(false)}
               className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                 !isTestMode ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
               }`}
             >
               אימון
             </button>
             <button
               onClick={() => setIsTestMode(true)}
               className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                 isTestMode ? 'bg-red-100 text-red-700' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
               }`}
             >
               מבחן
             </button>
          </div>
        )}

        <div className="flex-1 mx-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            className="h-full bg-green-500 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-gray-600 dark:text-gray-400 font-mono font-bold">{currentIndex + 1}/{questions.length}</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 flex-1 border border-gray-100 dark:border-gray-700">
        
        {/* Test Mode Badge */}
        {isTestMode && (
          <div className="mb-4 inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 px-3 py-1 rounded-full text-xs font-bold">
            <span>⏱️</span> מצב מבחן: אין רמזים
          </div>
        )}

        <div className="flex justify-between items-start mb-6">
           <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white leading-relaxed">
            {currentQuestion.question}
          </h3>
          {currentQuestion.hint && !isAnswered && !isTestMode && (
            <button 
              onClick={() => setShowHint(!showHint)}
              className="flex-shrink-0 ml-2 p-2 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/50 transition-colors"
              title="קבל רמז"
            >
              <span className="text-xl">💡</span>
            </button>
          )}
        </div>

        {/* Hint Display (Only in Practice Mode) */}
        {showHint && currentQuestion.hint && !isAnswered && !isTestMode && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg text-sm text-yellow-800 dark:text-yellow-200 animate-fadeIn">
             <strong>רמז: </strong> {currentQuestion.hint}
          </div>
        )}

        <div className="space-y-4">
          {currentQuestion.options.map((option, idx) => {
            let btnClass = "w-full p-4 rounded-xl text-right border-2 transition-all font-medium text-lg ";
            
            // Practice Mode Styling
            if (!isTestMode && isAnswered) {
              if (idx === currentQuestion.correctAnswerIndex) {
                btnClass += "bg-green-100 dark:bg-green-900/40 border-green-500 text-green-800 dark:text-green-300";
              } else if (idx === selectedOption) {
                btnClass += "bg-red-100 dark:bg-red-900/40 border-red-500 text-red-800 dark:text-red-300";
              } else {
                btnClass += "bg-gray-50 dark:bg-gray-700 border-transparent opacity-50 dark:text-gray-400";
              }
            } 
            // Test Mode Styling
            else if (isTestMode && selectedOption !== null) {
               if (idx === selectedOption) {
                  btnClass += "bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 text-indigo-800 dark:text-indigo-300";
               } else {
                  btnClass += "bg-gray-50 dark:bg-gray-700/50 border-transparent opacity-70";
               }
            }
            // Default State
            else {
              btnClass += "bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200";
            }

            return (
              <button
                key={idx}
                onClick={() => handleOptionClick(idx)}
                className={btnClass}
                disabled={!isTestMode && isAnswered}
              >
                {option}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback (Only in Practice Mode) */}
        {!isTestMode && isAnswered && (
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
          // In Test Mode: Enable Next only if option selected. In Practice: Enable only if Answered.
          disabled={isTestMode ? selectedOption === null : !isAnswered}
          className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
            (isTestMode ? selectedOption !== null : isAnswered)
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