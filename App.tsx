import React, { useState, useCallback, useEffect } from 'react';
import Navigation from './components/Navigation.tsx';
import GradeSelector from './components/GradeSelector.tsx';
import TopicSelector from './components/TopicSelector.tsx';
import LessonView from './components/LessonView.tsx';
import QuizView from './components/QuizView.tsx';
import DashboardView from './components/DashboardView.tsx';
import CustomExamBuilder from './components/CustomExamBuilder.tsx';
import VisualLabView from './components/VisualLabView.tsx';
import AuthModal from './components/AuthModal.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import Footer from './components/Footer.tsx';
import {
  GradeLevel,
  Topic,
  AppView,
  QuizQuestion,
  Difficulty,
  UserProgressData,
  UserAccountProfile,
  CustomExamConfig,
  StudyGoal,
} from './types.ts';
import { CURRICULUM } from './constants.ts';
import { getLessonContent, getQuizContent } from './services/contentService.ts';
import {
  loadProgress,
  saveProgress,
  recordLessonStudied,
  recordQuizCompleted,
  resetUserProgress,
} from './services/progressService.ts';
import { loadStudyGoal, saveStudyGoal } from './services/studyPlanService.ts';
import {
  subscribeToAuthChanges,
  signInWithGoogleAccount,
  signOutAccount,
  loadOrCreateUserCloudState,
  updateUserProfileInCloud,
  syncStudiedTopicToCloud,
  syncQuizCompletedToCloud,
  syncStudyGoalToCloud,
  resetCloudUserProgress,
} from './services/firebaseUserService.ts';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('mathmaster_theme');
      return saved === 'light' || saved === 'dark' ? saved : 'light';
    }
    return 'light';
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [progress, setProgress] = useState<UserProgressData>(() => loadProgress());

  // User Account State (Firebase Auth + Firestore)
  const [account, setAccount] = useState<UserAccountProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isAuthBusy, setIsAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (!firebaseUser) {
        setAccount(null);
        return;
      }

      setIsAuthBusy(true);
      setAuthError(null);
      try {
        const localProg = loadProgress();
        const localGoal = loadStudyGoal();
        const cloudState = await loadOrCreateUserCloudState(
          firebaseUser,
          localProg,
          localGoal
        );

        saveProgress(cloudState.progress);
        setProgress(cloudState.progress);

        if (cloudState.studyGoal) {
          saveStudyGoal(cloudState.studyGoal);
        }

        setAccount(cloudState.profile);
        if (cloudState.profile.isNewProfile) {
          setAuthModalOpen(true);
        }
      } catch (err) {
        console.error('Failed loading cloud account:', err);
        setAuthError('לא ניתן לסנכרן את נתוני החשבון כרגע. ההתקדמות ממשיכה להישמר מקומית.');
      } finally {
        setIsAuthBusy(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');

  const [lessonContent, setLessonContent] = useState<string>('');
  const [lessonKeywords, setLessonKeywords] = useState<Record<string, string>>({});
  const [lessonSource, setLessonSource] = useState<'ai' | 'static' | 'cache' | undefined>(undefined);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [activeCustomExam, setActiveCustomExam] = useState<CustomExamConfig | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dashboardSection, setDashboardSection] = useState<'overview' | 'planner'>('overview');

  const handleGoogleSignIn = async () => {
    setIsAuthBusy(true);
    setAuthError(null);
    try {
      await signInWithGoogleAccount();
    } catch (err) {
      console.error('Sign in failed:', err);
      setAuthError('ההתחברות בוטלה או נכשלה. ודאו שחלונות קופצים מותרים בדפדפן ונסו שוב.');
      setIsAuthBusy(false);
    }
  };

  const handleUpdateProfile = async (displayName: string, gradeId: string) => {
    if (!account) return;
    setIsAuthBusy(true);
    setAuthError(null);
    try {
      const updated = await updateUserProfileInCloud(account.uid, displayName, gradeId);
      setAccount((prev) =>
        prev
          ? {
              ...prev,
              displayName: updated.displayName,
              gradeId: updated.gradeId,
              isNewProfile: false,
            }
          : null
      );
    } catch (err) {
      console.error('Profile update failed:', err);
      setAuthError('שמירת פרטי הפרופיל נכשלה.');
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    setIsAuthBusy(true);
    try {
      await signOutAccount();
      setAccount(null);
      setAuthModalOpen(false);
    } finally {
      setIsAuthBusy(false);
    }
  };

  const handleGradeSelect = (grade: GradeLevel) => {
    setErrorMessage(null);
    setActiveCustomExam(null);
    setSelectedGrade(grade);
    setCurrentView(AppView.TOPICS);
  };

  const handleTopicSelect = useCallback(
    async (topic: Topic, difficulty: Difficulty) => {
      if (!selectedGrade) return;

      setErrorMessage(null);
      setActiveCustomExam(null);
      setSelectedTopic(topic);
      setSelectedDifficulty(difficulty);
      setCurrentView(AppView.LESSON);
      setIsLoading(true);

      try {
        const { markdown, keywords, source } = await getLessonContent(
          selectedGrade.id,
          selectedGrade.name,
          topic.id,
          topic.name,
          difficulty
        );
        setLessonContent(markdown);
        setLessonKeywords(keywords);
        setLessonSource(source);

        const updated = recordLessonStudied({
          topicId: topic.id,
          topicName: topic.name,
          gradeId: selectedGrade.id,
          gradeName: selectedGrade.name,
          category: topic.category,
          difficulty,
        });
        setProgress(updated);

        if (account && updated.studiedTopics[topic.id]) {
          syncStudiedTopicToCloud(account.uid, updated.studiedTopics[topic.id]).catch((err) =>
            console.warn('Cloud studied topic sync warning:', err)
          );
        }
      } catch (error) {
        console.error(error);
        setErrorMessage('אירעה שגיאה בטעינת השיעור. נסו שוב בעוד רגע.');
        setCurrentView(AppView.TOPICS);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedGrade, account]
  );

  const handleDirectTopicSelect = useCallback(
    async (grade: GradeLevel, topic: Topic, difficulty: Difficulty = 'medium') => {
      setErrorMessage(null);
      setActiveCustomExam(null);
      setSelectedGrade(grade);
      setSelectedTopic(topic);
      setSelectedDifficulty(difficulty);
      setCurrentView(AppView.LESSON);
      setIsLoading(true);

      try {
        const { markdown, keywords, source } = await getLessonContent(
          grade.id,
          grade.name,
          topic.id,
          topic.name,
          difficulty
        );
        setLessonContent(markdown);
        setLessonKeywords(keywords);
        setLessonSource(source);

        const updated = recordLessonStudied({
          topicId: topic.id,
          topicName: topic.name,
          gradeId: grade.id,
          gradeName: grade.name,
          category: topic.category,
          difficulty,
        });
        setProgress(updated);

        if (account && updated.studiedTopics[topic.id]) {
          syncStudiedTopicToCloud(account.uid, updated.studiedTopics[topic.id]).catch((err) =>
            console.warn('Cloud studied topic sync warning:', err)
          );
        }
      } catch (error) {
        console.error(error);
        setErrorMessage('אירעה שגיאה בטעינת השיעור. נסו שוב בעוד רגע.');
        setCurrentView(AppView.TOPICS);
      } finally {
        setIsLoading(false);
      }
    },
    [account]
  );

  const handleStartQuiz = useCallback(async () => {
    if (!selectedGrade || !selectedTopic) return;

    setErrorMessage(null);
    setActiveCustomExam(null);
    setIsLoading(true);
    setLoadingMessage('מכין שאלות לתרגול...');

    try {
      const questions = await getQuizContent(
        selectedGrade.id,
        selectedGrade.name,
        selectedTopic.id,
        selectedTopic.name,
        selectedDifficulty
      );
      setQuizQuestions(questions);
      setCurrentView(AppView.QUIZ);
    } catch (error) {
      console.error(error);
      setErrorMessage('לא ניתן לטעון את התרגול כרגע.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedGrade, selectedTopic, selectedDifficulty]);

  const handleLaunchCustomExam = (
    questions: QuizQuestion[],
    config: CustomExamConfig
  ) => {
    setErrorMessage(null);
    setSelectedGrade(null);
    setSelectedTopic(null);
    setActiveCustomExam(config);
    setQuizQuestions(questions);
    setCurrentView(AppView.QUIZ);
  };

  const handleQuizRecorded = useCallback(
    (score: number, total: number) => {
      if (activeCustomExam) {
        const singleGrade =
          activeCustomExam.gradeIds.length === 1
            ? CURRICULUM.find((g) => g.id === activeCustomExam.gradeIds[0])
            : null;
        const diff: Difficulty =
          activeCustomExam.difficulty === 'mixed' ? 'medium' : activeCustomExam.difficulty;

        const updated = recordQuizCompleted({
          topicId: `custom-${Date.now()}`,
          topicName: activeCustomExam.title,
          gradeId: singleGrade ? singleGrade.id : 'custom',
          gradeName: singleGrade ? singleGrade.name : 'מותאם אישית',
          category: activeCustomExam.category === 'all' ? 'אלגברה' : activeCustomExam.category,
          difficulty: diff,
          mode: activeCustomExam.mode === 'exam' ? 'custom_exam' : 'custom_practice',
          score,
          total,
        });
        setProgress(updated);

        if (account && updated.completedQuizzes[0]) {
          setAccount((prev) => (prev ? { ...prev, points: updated.points } : null));
          syncQuizCompletedToCloud(
            account.uid,
            updated.completedQuizzes[0],
            updated.points
          ).catch((err) => console.warn('Cloud custom quiz sync warning:', err));
        }
        return;
      }

      if (!selectedGrade || !selectedTopic) return;
      const updated = recordQuizCompleted({
        topicId: selectedTopic.id,
        topicName: selectedTopic.name,
        gradeId: selectedGrade.id,
        gradeName: selectedGrade.name,
        category: selectedTopic.category,
        difficulty: selectedDifficulty,
        mode: 'topic',
        score,
        total,
      });
      setProgress(updated);

      if (account && updated.completedQuizzes[0]) {
        setAccount((prev) => (prev ? { ...prev, points: updated.points } : null));
        syncQuizCompletedToCloud(
          account.uid,
          updated.completedQuizzes[0],
          updated.points
        ).catch((err) => console.warn('Cloud quiz sync warning:', err));
      }
    },
    [selectedGrade, selectedTopic, selectedDifficulty, activeCustomExam, account]
  );

  const handleQuizComplete = () => {
    if (activeCustomExam) {
      setActiveCustomExam(null);
      setCurrentView(AppView.CUSTOM_EXAM);
    } else {
      setCurrentView(AppView.TOPICS);
    }
  };

  const handleQuizBack = () => {
    if (activeCustomExam) {
      setActiveCustomExam(null);
      setCurrentView(AppView.CUSTOM_EXAM);
    } else {
      setSelectedTopic(null);
      setCurrentView(AppView.TOPICS);
    }
  };

  const handleBackToGrades = () => {
    setErrorMessage(null);
    setSelectedGrade(null);
    setCurrentView(AppView.HOME);
  };

  const handleBackToTopics = () => {
    setErrorMessage(null);
    setSelectedTopic(null);
    setCurrentView(AppView.TOPICS);
  };

  const handleHomeClick = () => {
    setErrorMessage(null);
    setActiveCustomExam(null);
    setSelectedGrade(null);
    setSelectedTopic(null);
    setCurrentView(AppView.HOME);
  };

  const handleDashboardClick = () => {
    setErrorMessage(null);
    setDashboardSection('overview');
    setCurrentView(AppView.DASHBOARD);
  };

  const handlePlannerClick = () => {
    setErrorMessage(null);
    setDashboardSection('planner');
    setCurrentView(AppView.DASHBOARD);
  };

  const handleCustomExamClick = () => {
    setErrorMessage(null);
    setCurrentView(AppView.CUSTOM_EXAM);
  };

  const handleVisualLabClick = () => {
    setErrorMessage(null);
    setCurrentView(AppView.VISUAL_LAB);
  };

  const handleGoalChange = (goal: StudyGoal) => {
    if (account) {
      syncStudyGoalToCloud(account.uid, goal).catch((err) =>
        console.warn('Cloud study goal sync warning:', err)
      );
    }
  };

  const handleResetProgress = () => {
    const fresh = resetUserProgress();
    setProgress(fresh);
    if (account) {
      setAccount((prev) => (prev ? { ...prev, points: 0 } : null));
      resetCloudUserProgress(account.uid).catch((err) =>
        console.warn('Cloud reset warning:', err)
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Navigation
        currentView={currentView}
        points={progress.points}
        onHomeClick={handleHomeClick}
        onGradeClick={handleBackToTopics}
        onDashboardClick={handleDashboardClick}
        onPlannerClick={handlePlannerClick}
        onCustomExamClick={handleCustomExamClick}
        onVisualLabClick={handleVisualLabClick}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        account={account}
        activeDashboardSection={dashboardSection}
        gradeName={selectedGrade?.name}
        topicName={selectedTopic?.name}
        isDarkMode={theme === 'dark'}
        toggleTheme={toggleTheme}
        isOnline={isOnline}
      />

      {errorMessage && (
        <div className="max-w-6xl mx-auto w-full px-4 md:px-6 pt-4">
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl px-4 py-3 flex items-center justify-between gap-4 text-sm text-rose-800 dark:text-rose-200">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-xs font-semibold hover:underline shrink-0"
            >
              סגירה
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 w-full">
        {isLoading && currentView !== AppView.LESSON ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner message={loadingMessage} />
          </div>
        ) : (
          <>
            {currentView === AppView.HOME && (
              <GradeSelector
                onSelectGrade={handleGradeSelect}
                onSelectDirectTopic={handleDirectTopicSelect}
                onOpenCustomExam={handleCustomExamClick}
                onOpenVisualLab={handleVisualLabClick}
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
                onOpenVisualLab={handleVisualLabClick}
                isLoading={isLoading}
                contentSource={lessonSource}
                difficulty={selectedDifficulty}
              />
            )}

            {currentView === AppView.QUIZ && (
              <QuizView
                questions={quizQuestions}
                onQuizRecorded={handleQuizRecorded}
                onComplete={handleQuizComplete}
                onBack={handleQuizBack}
                quizTitle={activeCustomExam?.title}
                initialMode={activeCustomExam?.mode || 'practice'}
                lockMode={Boolean(activeCustomExam)}
                timerMinutes={activeCustomExam?.timerMinutes}
                backLabel={activeCustomExam ? 'חזרה למחולל המבחנים' : 'יציאה מהתרגול'}
              />
            )}

            {currentView === AppView.DASHBOARD && (
              <DashboardView
                progress={progress}
                isDarkMode={theme === 'dark'}
                initialSection={dashboardSection}
                account={account}
                onOpenAuthModal={() => setAuthModalOpen(true)}
                onGoalChange={handleGoalChange}
                onBack={handleHomeClick}
                onOpenTopic={handleDirectTopicSelect}
                onResetProgress={handleResetProgress}
              />
            )}

            {currentView === AppView.CUSTOM_EXAM && (
              <CustomExamBuilder
                onBack={handleHomeClick}
                onLaunchExam={handleLaunchCustomExam}
                isOnline={isOnline}
              />
            )}

            {currentView === AppView.VISUAL_LAB && (
              <VisualLabView onBack={handleHomeClick} />
            )}
          </>
        )}
      </main>

      {currentView !== AppView.LESSON && <Footer />}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        account={account}
        isAuthBusy={isAuthBusy}
        authError={authError}
        onGoogleSignIn={handleGoogleSignIn}
        onUpdateProfile={handleUpdateProfile}
        onSignOut={handleSignOut}
        studiedCount={Object.keys(progress.studiedTopics).length}
        quizzesCount={progress.completedQuizzes.length}
      />
    </div>
  );
};

export default App;