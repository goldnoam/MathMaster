import React, { useState, useCallback, useEffect } from 'react';
import Navigation from './components/Navigation.tsx';
import GradeSelector from './components/GradeSelector.tsx';
import TopicSelector from './components/TopicSelector.tsx';
import LessonView from './components/LessonView.tsx';
import QuizView from './components/QuizView.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import Footer from './components/Footer.tsx';
import { GradeLevel, Topic, AppView, QuizQuestion, Difficulty } from './types.ts';
import { generateLessonContent, generateQuizContent } from './services/geminiService.ts';

const App: React.FC = () => {
  // Theme State - Initialize from LocalStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('mathmaster_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    }
    return 'dark';
  });
  
  // Online State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Apply theme to HTML element and save to storage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mathmaster_theme', theme);
  }, [theme]);

  // Monitor Online Status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  
  // Data State
  const [lessonContent, setLessonContent] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [points, setPoints] = useState(0);

  const handleGradeSelect = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    setCurrentView(AppView.TOPICS);
  };

  const handleTopicSelect = useCallback(async (topic: Topic, difficulty: Difficulty) => {
    if (!selectedGrade) return;

    setSelectedTopic(topic);
    setSelectedDifficulty(difficulty);
    setIsLoading(true);
    setLoadingMessage(`מכין שיעור בנושא ${topic.name} (רמה ${difficulty === 'easy' ? 'קלה' : difficulty === 'medium' ? 'בינונית' : 'קשה'})...`);
    
    try {
      // 1. Generate Lesson
      const content = await generateLessonContent(selectedGrade.name, topic.name, difficulty);
      setLessonContent(content);
      setCurrentView(AppView.LESSON);
    } catch (error) {
      console.error(error);
      alert("שגיאה: לא ניתן לטעון את השיעור. אנא בדוק את החיבור לרשת.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedGrade]);

  const handleStartQuiz = useCallback(async () => {
    if (!selectedGrade || !selectedTopic) return;

    setIsLoading(true);
    setLoadingMessage("מכין שאלות לתרגול...");

    try {
      const questions = await generateQuizContent(selectedGrade.name, selectedTopic.name, selectedDifficulty);
      if (questions.length > 0) {
        setQuizQuestions(questions);
        setCurrentView(AppView.QUIZ);
      } else {
         if (!isOnline) {
             alert("מצב אופליין: לא נמצא שאלון שמור לנושא זה.");
         } else {
             alert("לא הצלחנו לייצר שאלות כרגע, אנא נסה שוב.");
         }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedGrade, selectedTopic, selectedDifficulty, isOnline]);

  const handleQuizComplete = (score: number) => {
    setPoints(prev => prev + (score * 10) + 5); // 10 points per right answer + 5 completion bonus
    alert(`סיימת את התרגול! צברת ${score} תשובות נכונות.`);
    setCurrentView(AppView.TOPICS); // Go back to topics after quiz
  };

  const handleBackToGrades = () => {
    setSelectedGrade(null);
    setCurrentView(AppView.HOME);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setCurrentView(AppView.TOPICS);
  };

  const handleHomeClick = () => {
    setSelectedGrade(null);
    setSelectedTopic(null);
    setCurrentView(AppView.HOME);
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900`}>
      <Navigation 
        currentView={currentView} 
        points={points} 
        onHomeClick={handleHomeClick}
        onGradeClick={handleBackToTopics}
        gradeName={selectedGrade?.name}
        topicName={selectedTopic?.name}
        isDarkMode={theme === 'dark'}
        toggleTheme={toggleTheme}
        isOnline={isOnline}
      />

      <main className="container mx-auto pb-8 min-h-[calc(100vh-140px)]">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner message={loadingMessage} />
          </div>
        ) : (
          <>
            {currentView === AppView.HOME && (
              <GradeSelector onSelectGrade={handleGradeSelect} />
            )}

            {currentView === AppView.TOPICS && selectedGrade && (
              <TopicSelector 
                grade={selectedGrade} 
                onSelectTopic={handleTopicSelect} 
                onBack={handleBackToGrades}
              />
            )}

            {currentView === AppView.LESSON && selectedTopic && (
              <LessonView 
                content={lessonContent} 
                onStartQuiz={handleStartQuiz} 
                onBack={handleBackToTopics} 
              />
            )}

            {currentView === AppView.QUIZ && (
              <QuizView 
                questions={quizQuestions} 
                onComplete={handleQuizComplete} 
                onBack={handleBackToTopics} 
              />
            )}
          </>
        )}
      </main>

      {/* Show global footer only if NOT in LessonView (because LessonView has fixed bottom bar) */}
      {currentView !== AppView.LESSON && <Footer />}
    </div>
  );
};

export default App;