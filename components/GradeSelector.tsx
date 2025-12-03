import React, { useState, useMemo } from 'react';
import { GradeLevel, Topic } from '../types.ts';
import { CURRICULUM } from '../constants.ts';

interface GradeSelectorProps {
  onSelectGrade: (grade: GradeLevel) => void;
  onSelectDirectTopic?: (grade: GradeLevel, topic: Topic) => void;
}

const GradeSelector: React.FC<GradeSelectorProps> = ({ onSelectGrade, onSelectDirectTopic }) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fuzzy Search Logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results: { grade: GradeLevel, topic: Topic }[] = [];

    CURRICULUM.forEach(grade => {
      grade.topics.forEach(topic => {
        if (
          topic.name.toLowerCase().includes(query) || 
          grade.name.toLowerCase().includes(query)
        ) {
          results.push({ grade, topic });
        }
      });
    });

    return results;
  }, [searchQuery]);

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fadeIn">
      <div className="text-center mb-6 mt-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">ברוכים הבאים ל-MathMaster</h2>
        <p className="text-gray-600 dark:text-gray-300">בחרו את הכיתה שלכם או חפשו נושא כדי להתחיל</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-10 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="חפש נושא לימוד (למשל: שברים, אחוזים...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 pr-12 rounded-full border border-gray-300 dark:border-gray-600 shadow-md focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all outline-none"
          />
          <span className="absolute top-1/2 right-4 transform -translate-y-1/2 text-xl">
            🔍
          </span>
          {searchQuery && (
             <button 
               onClick={() => setSearchQuery('')}
               className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
             >
               ✖️
             </button>
          )}
        </div>
      </div>
      
      {/* Search Results View */}
      {searchQuery ? (
        <div className="animate-fadeIn">
          <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-4 px-2">
            תוצאות חיפוש עבור "{searchQuery}": {searchResults.length > 0 ? '' : '(לא נמצאו תוצאות)'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {searchResults.map((result) => (
              <button
                key={`${result.grade.id}-${result.topic.id}`}
                onClick={() => onSelectDirectTopic && onSelectDirectTopic(result.grade, result.topic)}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-500 hover:shadow-md transition-all flex items-center justify-between text-right"
              >
                 <div className="flex items-center gap-3">
                    <span className="text-2xl">{result.topic.icon}</span>
                    <div>
                      <div className="font-bold text-gray-800 dark:text-white">{result.topic.name}</div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full inline-block mt-1">
                        {result.grade.name}
                      </div>
                    </div>
                 </div>
                 <span className="text-gray-400">⬅️</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Regular Grade Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {CURRICULUM.map((grade) => (
            <button
              key={grade.id}
              onClick={() => onSelectGrade(grade)}
              className={`${grade.color} group relative hover:brightness-110 text-white p-6 rounded-2xl shadow-lg transform transition-all hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-2 min-h-[120px]`}
            >
              <span className="text-2xl font-bold">{grade.name}</span>
              <span className="text-sm opacity-90">{grade.topics.length} נושאים</span>

              {/* Tooltip */}
              <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bottom-[110%] left-1/2 transform -translate-x-1/2 w-48 bg-gray-800 text-white text-xs rounded-lg p-3 pointer-events-none z-20 shadow-xl border border-gray-700">
                <div className="font-bold mb-1 border-b border-gray-600 pb-1">נושאים:</div>
                <ul className="list-disc list-inside space-y-0.5 text-right">
                  {grade.topics.map((t) => (
                    <li key={t.id} className="truncate">{t.name}</li>
                  ))}
                </ul>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-800"></div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GradeSelector;