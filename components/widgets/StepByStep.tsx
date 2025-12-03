import React, { useState } from 'react';

interface StepByStepProps {
  title: string;
  steps: string[];
}

const StepByStep: React.FC<StepByStepProps> = ({ title, steps }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const reset = () => setCurrentStep(0);

  return (
    <div className="my-6 bg-white dark:bg-gray-800 border border-indigo-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden" dir="rtl">
      <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 border-b border-indigo-100 dark:border-gray-700 flex justify-between items-center">
        <h4 className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2 text-sm md:text-base">
          <span>👣</span> פתרון צעד-אחר-צעד: {title}
        </h4>
        <button onClick={reset} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
          התחל מחדש
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`transition-all duration-500 transform ${
              index < currentStep 
                ? 'opacity-100 translate-x-0' 
                : 'opacity-0 translate-x-4 hidden'
            }`}
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm border border-indigo-200 dark:border-indigo-700">
                {index + 1}
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex-1 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-600">
                {step}
              </div>
            </div>
            {index < steps.length - 1 && index < currentStep - 1 && (
               <div className="w-0.5 h-4 bg-gray-300 dark:bg-gray-600 mr-4 my-1"></div>
            )}
          </div>
        ))}
        
        {currentStep < steps.length ? (
          <button
            onClick={handleNextStep}
            className="w-full py-2 mt-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium rounded-lg transition-colors border border-dashed border-indigo-300 dark:border-indigo-700"
          >
             הצג את השלב הבא 👇
          </button>
        ) : (
          <div className="text-center text-green-600 dark:text-green-400 font-bold py-2 bg-green-50 dark:bg-green-900/20 rounded-lg mt-2">
            ✨ הפתרון הושלם!
          </div>
        )}
      </div>
    </div>
  );
};

export default StepByStep;