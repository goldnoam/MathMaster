import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'מכין את התוכן הלימודי...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 min-h-[260px]" role="status" aria-live="polite">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-800" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 dark:border-t-sky-400 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{message}</p>
    </div>
  );
};

export default LoadingSpinner;