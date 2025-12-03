import React, { useState, useCallback, useEffect } from 'react';
import Navigation from './components/Navigation.tsx';
import GradeSelector from './components/GradeSelector.tsx';
import TopicSelector from './components/TopicSelector.tsx';
import LessonView from './components/LessonView.tsx';
import QuizView from './components/QuizView.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import Footer from './components/Footer.tsx';
import { GradeLevel, Topic, AppView, QuizQuestion, Difficulty } from './types.ts';
import { getLessonContent, getQuizContent } from './services/contentService.ts';

const App: React.FC = () => {
  // Theme State - Initialize from LocalStorage
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('mathmaster_theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    }
    return 'dark';
  });
  
  // Online State (Logic kept for UI indication, but core is now offline)
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mathmaster_theme', theme);
  }, [theme]);

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
  const [lessonKeywords, setLessonKeywords] = useState<Record<string, string>>({});
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
    setLoadingMessage(`טוען שיעור בנושא ${topic.name}...`);
    
    try {
      // Load Offline Content
      const { markdown, keywords } = await getLessonContent(selectedGrade.id, topic.id, difficulty);
      setLessonContent(markdown);
      setLessonKeywords(keywords);
      setCurrentView(AppView.LESSON);
    } catch (error) {
      console.error(error);
      alert("שגיאה בטעינת השיעור.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedGrade]);

  // Handler for search - sets grade and topic simultaneously
  const handleDirectTopicSelect = useCallback(async (grade: GradeLevel, topic: Topic) => {
    setSelectedGrade(grade);
    setSelectedTopic(topic);
    setSelectedDifficulty('medium'); // Default difficulty for search
    setIsLoading(true);
    setLoadingMessage(`טוען שיעור בנושא ${topic.name}...`);
    
    try {
      const { markdown, keywords } = await getLessonContent(grade.id, topic.id, 'medium');
      setLessonContent(markdown);
      setLessonKeywords(keywords);
      setCurrentView(AppView.LESSON);
    } catch (error) {
      console.error(error);
      alert("שגיאה בטעינת השיעור.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStartQuiz = useCallback(async () => {
    if (!selectedGrade || !selectedTopic) return;

    setIsLoading(true);
    setLoadingMessage("מכין שאלות לתרגול...");

    try {
      const questions = await getQuizContent(selectedGrade.id, selectedTopic.id, selectedDifficulty);
      setQuizQuestions(questions);
      setCurrentView(AppView.QUIZ);
    } catch (error) {
      console.error(error);
      alert("לא ניתן לטעון את השאלון.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedGrade, selectedTopic, selectedDifficulty]);

  const handleQuizComplete = (score: number) => {
    setPoints(prev => prev + (score * 10) + 5); 
    // Alert removed as QuizView now handles the summary screen
    setCurrentView(AppView.TOPICS);
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
              <GradeSelector 
                onSelectGrade={handleGradeSelect} 
                onSelectDirectTopic={handleDirectTopicSelect} 
              />
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
                keywords={lessonKeywords}
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

      {currentView !== AppView.LESSON && <Footer />}
    </div>
  );
};

export default App;