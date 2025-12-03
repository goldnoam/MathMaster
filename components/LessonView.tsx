import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import Footer from './Footer.tsx';

interface LessonViewProps {
  content: string;
  onStartQuiz: () => void;
  onBack: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ content, onStartQuiz, onBack }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Split content by markdown headers to create sections
  // We look for '## ' at the start of a line
  const sections = useMemo(() => {
    // Regex splits by Lookahead for "## " or "# " at start of line
    const splitContent = content.split(/(?=^#{1,2}\s)/gm);
    // Filter out empty strings
    const validSections = splitContent.filter(s => s.trim().length > 0);
    return validSections.length > 0 ? validSections : [content];
  }, [content]);

  const handleNext = () => {
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'שיעור במתמטיקה - MathMaster IL',
      text: content,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(content);
        alert('התוכן הועתק ללוח!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const progressPercentage = ((currentSectionIndex + 1) / sections.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-4 pb-32">
       <div className="flex justify-between items-center mb-4">
        <button 
          onClick={onBack}
          className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 font-medium"
        >
          <span>➡️</span> חזרה לנושאים
        </button>

        <button 
          onClick={handleShare}
          className="p-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-gray-800 rounded-full hover:bg-indigo-100 dark:hover:bg-gray-700 transition-colors"
          title="שתף שיעור"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
       </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 min-h-[400px] relative overflow-hidden">
        {/* Progress Bar for sections */}
        {sections.length > 1 && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-gray-700">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
        
        {/* Visual Progress Indicator inside card */}
        {sections.length > 1 && (
           <div className="absolute top-3 left-4 text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
             התקדמות: {Math.round(progressPercentage)}%
           </div>
        )}

        <div className="prose prose-lg prose-indigo dark:prose-invert max-w-none text-right font-normal mt-2" dir="rtl">
           <ReactMarkdown 
             components={{
               h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-4" {...props} />,
               h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2" {...props} />,
               h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2" {...props} />,
               strong: ({node, ...props}) => <strong className="font-bold text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded" {...props} />,
               ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300" {...props} />,
               li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
               p: ({node, ...props}) => <p className="leading-relaxed mb-4 text-gray-700 dark:text-gray-300" {...props} />,
               code: ({node, ...props}) => <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono text-sm dir-ltr" {...props} />,
               blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-indigo-300 dark:border-indigo-500 pr-4 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-l" {...props} />
             }}
           >
             {sections[currentSectionIndex]}
           </ReactMarkdown>
        </div>
      </div>

      {/* Internal Footer for Lesson View */}
      <Footer />

      {/* Navigation & Action Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-colors duration-300 z-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          
          {/* Section Navigation */}
          {sections.length > 1 && (
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handlePrev}
                disabled={currentSectionIndex === 0}
                className={`flex-1 py-2 px-4 rounded-lg font-medium border border-gray-300 dark:border-gray-600 transition-colors ${
                  currentSectionIndex === 0 
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                ⬅️ הקודם
              </button>
              <span className="text-gray-500 dark:text-gray-400 text-sm font-mono">
                {currentSectionIndex + 1} / {sections.length}
              </span>
              <button
                onClick={handleNext}
                disabled={currentSectionIndex === sections.length - 1}
                className={`flex-1 py-2 px-4 rounded-lg font-medium border border-gray-300 dark:border-gray-600 transition-colors ${
                  currentSectionIndex === sections.length - 1
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                הבא ➡️
              </button>
            </div>
          )}

          {/* Start Quiz Action */}
          <button
            onClick={onStartQuiz}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>תרגול החומר</span>
            <span>📝</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonView;