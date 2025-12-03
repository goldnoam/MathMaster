import React, { useState, useMemo, useEffect } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import Footer from './Footer.tsx';
import SimpleCalculator from './widgets/SimpleCalculator.tsx';
import InlineExercise from './widgets/InlineExercise.tsx';
import StepByStep from './widgets/StepByStep.tsx';

interface LessonViewProps {
  content: string;
  keywords: Record<string, string>;
  onStartQuiz: () => void;
  onBack: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ content, keywords, onStartQuiz, onBack }) => {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Reset Focus Mode when Study Mode is turned off
  useEffect(() => {
    if (!isStudyMode) {
      setIsFocusMode(false);
    }
  }, [isStudyMode]);

  // Split content by markdown headers
  const sections = useMemo(() => {
    const splitContent = content.split(/(?=^#{1,2}\s)/gm);
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

  // Custom Markdown Components for Study Mode and Widgets
  const markdownComponents: Components = {
    h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-indigo-700 dark:text-indigo-400 mb-4" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 my-4 text-gray-700 dark:text-gray-300" {...props} />,
    li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
    p: ({node, children, ...props}) => {
      // Focus Mode Logic: Dim paragraphs
      const dimClass = isFocusMode 
        ? 'text-gray-300 dark:text-gray-700 transition-colors duration-500' 
        : 'text-gray-700 dark:text-gray-300 transition-colors duration-300';
      
      return <p className={`leading-relaxed mb-4 ${dimClass}`} {...props}>{children}</p>;
    },
    // Using Strong tag for "Key Terms" in Study Mode
    strong: ({node, children, ...props}) => {
        const text = String(children);
        const description = keywords[text];
        
        let containerClass = "relative inline-block transition-all duration-300 ";
        let innerClass = "font-bold rounded px-1 transition-all duration-300 inline-block ";

        if (isFocusMode) {
            // In Focus Mode, keywords pop out
            innerClass += "text-gray-900 dark:text-white bg-white dark:bg-gray-800 shadow-sm border border-indigo-200 dark:border-indigo-700 scale-105 mx-0.5 ";
        } else if (isStudyMode && description) {
            // Study Mode: Highlight keywords
            innerClass += "text-indigo-900 dark:text-indigo-100 bg-yellow-200 dark:bg-yellow-600/50 border-b-2 border-yellow-500 cursor-help ";
            containerClass += "group cursor-help ";
        } else {
            // Normal
            innerClass += "text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-900/30 ";
        }

        const content = <strong className={innerClass} {...props}>{children}</strong>;

        if (isStudyMode && description) {
            return (
                <span className={containerClass}>
                    {content}
                    {/* Tooltip */}
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {description}
                        <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                    </span>
                </span>
            );
        }
        
        // Even if not a keyword, in focus mode we return it highlighted (no tooltip wrapper needed if no description)
        return content;
    },
    // Detecting Code Blocks for Widgets
    code: ({node, className, children, ...props}) => {
      const match = /language-(\w+)/.exec(className || '');
      const type = match ? match[1] : '';
      const value = String(children).replace(/\n$/, '');

      if (type === 'calculator') {
        return <SimpleCalculator />;
      }
      
      if (type === 'exercise') {
        // Format expected: "Question | Answer"
        const [question, answer] = value.split('|');
        if (question && answer) {
          return <InlineExercise question={question.trim()} answer={answer.trim()} />;
        }
      }

      if (type === 'steps') {
        // Format expected: "Title | Step 1 | Step 2 | Step 3"
        const parts = value.split('|').map(s => s.trim());
        if (parts.length > 1) {
          const title = parts[0];
          const steps = parts.slice(1);
          return <StepByStep title={title} steps={steps} />;
        }
      }

      return <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-400 font-mono text-sm dir-ltr" {...props}>{children}</code>;
    },
    blockquote: ({node, ...props}) => <blockquote className="border-r-4 border-indigo-300 dark:border-indigo-500 pr-4 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-l" {...props} />
  };

  return (
    <div className="max-w-3xl mx-auto p-4 pb-32">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <button 
          onClick={onBack}
          className="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-2 font-medium"
        >
          <span>➡️</span> חזרה לנושאים
        </button>

        <div className="flex items-center gap-3 flex-wrap">
           
           {/* Study Mode Toggle */}
           <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
             <span className="text-xs font-bold text-gray-600 dark:text-gray-300">מצב למידה</span>
             <button 
               onClick={() => setIsStudyMode(!isStudyMode)}
               className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${isStudyMode ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
             >
               <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${isStudyMode ? '-translate-x-5' : 'translate-x-0'}`}></div>
             </button>
           </div>

           {/* Focus Mode Toggle - Only visible when Study Mode is ON */}
           {isStudyMode && (
             <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm animate-fadeIn">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">מצב מיקוד</span>
                <button 
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${isFocusMode ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${isFocusMode ? '-translate-x-5' : 'translate-x-0'}`}></div>
                </button>
             </div>
           )}

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
       </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 md:p-8 min-h-[400px] relative overflow-hidden transition-colors duration-300">
        {/* Progress Bar for sections */}
        {sections.length > 1 && (
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 dark:bg-gray-700">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}
        
        {/* Visual Progress Indicator */}
        {sections.length > 1 && (
           <div className="absolute top-3 left-4 text-xs font-bold text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
             התקדמות: {Math.round(progressPercentage)}%
           </div>
        )}

        <div className="prose prose-lg prose-indigo dark:prose-invert max-w-none text-right font-normal mt-2" dir="rtl">
           <ReactMarkdown components={markdownComponents}>
             {sections[currentSectionIndex]}
           </ReactMarkdown>
        </div>
      </div>

      <Footer />

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-colors duration-300 z-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          
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