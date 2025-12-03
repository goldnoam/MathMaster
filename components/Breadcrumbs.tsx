import React from 'react';

interface BreadcrumbsProps {
  gradeName?: string;
  topicName?: string;
  onHomeClick: () => void;
  onGradeClick?: () => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  gradeName,
  topicName,
  onHomeClick,
  onGradeClick
}) => {
  return (
    <nav className="flex items-center text-sm md:text-base whitespace-nowrap overflow-hidden" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 space-x-reverse">
        {/* Home */}
        <li className="inline-flex items-center">
          <button
            onClick={onHomeClick}
            className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            <svg className="w-4 h-4 ml-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
            </svg>
            <span className="hidden sm:inline">ראשי</span>
          </button>
        </li>

        {/* Grade */}
        {gradeName && (
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-gray-400 dark:text-gray-500 mx-1 transform rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
              {topicName ? (
                <button
                  onClick={onGradeClick}
                  className="mr-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-gray-700 dark:text-gray-300"
                >
                  {gradeName}
                </button>
              ) : (
                <span className="mr-1 font-bold text-gray-900 dark:text-white">{gradeName}</span>
              )}
            </div>
          </li>
        )}

        {/* Topic */}
        {topicName && (
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-gray-400 dark:text-gray-500 mx-1 transform rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
              </svg>
              <span className="mr-1 font-bold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[200px]">
                {topicName}
              </span>
            </div>
          </li>
        )}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;