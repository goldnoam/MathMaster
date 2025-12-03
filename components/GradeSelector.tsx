import React from 'react';
import { GradeLevel } from '../types.ts';
import { CURRICULUM } from '../constants.ts';

interface GradeSelectorProps {
  onSelectGrade: (grade: GradeLevel) => void;
}

const GradeSelector: React.FC<GradeSelectorProps> = ({ onSelectGrade }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 animate-fadeIn">
      <div className="text-center mb-8 mt-4">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">ברוכים הבאים ל-MathMaster</h2>
        <p className="text-gray-600 dark:text-gray-300">בחרו את הכיתה שלכם כדי להתחיל ללמוד</p>
      </div>
      
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
    </div>
  );
};

export default GradeSelector;