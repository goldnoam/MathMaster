import React, { useState } from 'react';
import { GradeLevel, Topic, Difficulty, DIFFICULTY_LABELS } from '../types.ts';

interface TopicSelectorProps {
  grade: GradeLevel;
  onSelectTopic: (topic: Topic, difficulty: Difficulty) => void;
  onBack: () => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ grade, onSelectTopic, onBack }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

  return (
    <div className="max-w-2xl mx-auto p-4">
      <button 
        onClick={onBack}
        className="mb-6 text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 font-medium transition-colors"
      >
        <span>➡️</span> חזרה לכיתות
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <span className={`w-3 h-8 rounded-full ${grade.color}`}></span>
          נושאי לימוד ל{grade.name}
        </h2>

        {/* Difficulty Selector */}
        <div className="bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 inline-flex">
          {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((diff) => (
             <button
               key={diff}
               onClick={() => setSelectedDifficulty(diff)}
               className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                 selectedDifficulty === diff 
                   ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shadow-sm' 
                   : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
               }`}
             >
               {DIFFICULTY_LABELS[diff]}
             </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {grade.topics.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onSelectTopic(topic, selectedDifficulty)}
            className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-2 border-transparent hover:border-indigo-500 hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl bg-gray-50 dark:bg-gray-700 w-12 h-12 flex items-center justify-center rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-gray-600 transition-colors">
                {topic.icon}
              </span>
              <span className="text-lg font-medium text-gray-800 dark:text-gray-200">{topic.name}</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                 רמה: {DIFFICULTY_LABELS[selectedDifficulty]}
               </span>
               <span className="text-indigo-500 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:-translate-x-2">
                התחל ⬅️
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicSelector;