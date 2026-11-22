import React, { useState } from 'react';

interface StepByStepProps {
  title: string;
  steps: string[];
}

const StepByStep: React.FC<StepByStepProps> = ({ title, steps }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const showAll = () => setCurrentStep(steps.length);
  const reset = () => setCurrentStep(0);

  return (
    <div
      className="my-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
      dir="rtl"
    >
      <div className="bg-slate-50 dark:bg-slate-800/70 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex flex-wrap justify-between items-center gap-2">
        <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm md:text-base">
          פתרון צעד-אחר-צעד: {title}
        </h4>
        <div className="flex items-center gap-3 text-xs font-medium">
          {currentStep < steps.length && (
            <button
              type="button"
              onClick={showAll}
              className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-sky-400 transition-colors"
            >
              הצגת הכל
            </button>
          )}
          {currentStep > 0 && (
            <button
              type="button"
              onClick={reset}
              className="text-blue-600 dark:text-sky-400 hover:underline"
            >
              איפוס
            </button>
          )}
        </div>
      </div>

      <div className="p-4 md:p-5 space-y-3">
        {steps.map((step, index) => {
          const isVisible = index < currentStep;
          if (!isVisible) return null;

          return (
            <div key={index} className="animate-fadeIn flex items-start gap-3">
              <div className="shrink-0 w-7 h-7 rounded-lg bg-blue-50 dark:bg-sky-950/60 border border-blue-200 dark:border-sky-800 flex items-center justify-center text-blue-700 dark:text-sky-300 font-mono tabular-nums font-semibold text-xs mt-0.5">
                {index + 1}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 rounded-lg flex-1 text-sm md:text-base text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700/70 leading-relaxed">
                {step}
              </div>
            </div>
          );
        })}

        {currentStep < steps.length ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-sky-950/40 text-blue-700 dark:text-sky-300 text-sm font-semibold rounded-lg transition-colors border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center gap-2"
          >
            <span>
              {currentStep === 0
                ? 'התחלת פתרון מודרך (שלב 1)'
                : `הצגת השלב הבא (${currentStep + 1} מתוך ${steps.length})`}
            </span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-semibold py-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>הפתרון הושלם במלואו</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepByStep;