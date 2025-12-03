import React from 'react';

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "הרובוט החכם מכין את החומר..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 h-64">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 dark:border-indigo-900 rounded-full opacity-25 animate-ping"></div>
        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-indigo-600 border-indigo-200 dark:border-t-indigo-400 dark:border-indigo-900 rounded-full animate-spin"></div>
      </div>
      <p className="text-lg font-medium text-indigo-700 dark:text-indigo-300 animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingSpinner;