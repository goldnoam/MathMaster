import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase.ts';
import {
  AchievementCategory,
  CompletedQuizRecord,
  Difficulty,
  StudiedTopicRecord,
  StudyGoal,
  TopicCategory,
  UnlockedAchievementRecord,
  UserAccountProfile,
  UserProgressData,
} from '../types.ts';
import {
  collectActiveDateKeys,
  DATE_KEY_REGEX,
  evaluateAchievements,
} from './achievementService.ts';

const sanitizeId = (raw: string, maxLen = 64): string => {
  const cleaned = raw.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, maxLen);
  return cleaned || `item_${Date.now()}`;
};

const sanitizeText = (raw: string, maxLen: number, fallback: string): string => {
  const trimmed = (raw || '').trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLen);
};

const sanitizeGradeId = (raw?: string): string => {
  if (raw && /^(all|grade-(1[0-2]|[1-9]))$/.test(raw)) {
    return raw;
  }
  return 'all';
};

const sanitizeQuizGradeId = (raw?: string): string => {
  if (raw && /^(custom|grade-(1[0-2]|[1-9]))$/.test(raw)) {
    return raw;
  }
  return 'custom';
};

const sanitizeDifficulty = (raw?: string): Difficulty => {
  if (raw === 'easy' || raw === 'medium' || raw === 'hard') return raw;
  return 'medium';
};

const sanitizeAchievementCategory = (raw?: string): AchievementCategory => {
  if (raw === 'streak' || raw === 'mastery' || raw === 'quiz') return raw;
  return 'quiz';
};

const sanitizeStudyDays = (days: number[]): number[] => {
  const valid = Array.from(
    new Set(days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))
  ).sort((a, b) => a - b);
  return valid.length > 0 ? valid.slice(0, 7) : [0, 2, 4];
};

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  return onAuthStateChanged(auth, callback);
};

export const signInWithGoogleAccount = async (): Promise<User> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signOutAccount = async (): Promise<void> => {
  await signOut(auth);
};

export const loadOrCreateUserCloudState = async (
  user: User,
  localProgress: UserProgressData,
  localGoal: StudyGoal
): Promise<{
  profile: UserAccountProfile;
  progress: UserProgressData;
  studyGoal: StudyGoal | null;
}> => {
  const uid = user.uid;
  const userRef = doc(db, 'users', uid);
  const privateRef = doc(db, 'users', uid, 'private', 'info');

  let userSnap;
  try {
    userSnap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  }

  if (!userSnap.exists()) {
    const initialDisplayName = sanitizeText(
      user.displayName || user.email?.split('@')[0] || '',
      80,
      'תלמיד/ה'
    );
    const safePoints = Math.min(10000000, Math.max(0, Math.round(localProgress.points || 0)));

    const batch = writeBatch(db);

    batch.set(userRef, {
      uid,
      displayName: initialDisplayName,
      gradeId: 'all',
      points: safePoints,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const privatePayload: Record<string, unknown> = {
      uid,
      email: sanitizeText(user.email || 'student@mathmaster.local', 160, 'student@mathmaster.local'),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (user.photoURL) {
      privatePayload.photoURL = user.photoURL.slice(0, 500);
    }
    batch.set(privateRef, privatePayload);

    // Migrate guest studied topics (cap batch safely)
    const studiedEntries = Object.values(localProgress.studiedTopics).slice(0, 40);
    studiedEntries.forEach((topic) => {
      const safeTopicId = sanitizeId(topic.topicId, 64);
      const ref = doc(db, 'users', uid, 'studiedTopics', safeTopicId);
      batch.set(ref, {
        userId: uid,
        topicId: safeTopicId,
        topicName: sanitizeText(topic.topicName, 120, 'נושא לימוד'),
        gradeId: sanitizeQuizGradeId(topic.gradeId),
        gradeName: sanitizeText(topic.gradeName, 40, 'כיתה'),
        category: sanitizeText(topic.category, 60, 'אלגברה'),
        difficulty: sanitizeDifficulty(topic.difficulty),
        lastStudiedAt: topic.lastStudiedAt || Date.now(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    // Migrate guest completed quizzes
    const quizEntries = localProgress.completedQuizzes.slice(0, 40);
    quizEntries.forEach((q) => {
      const safeQuizId = sanitizeId(q.id, 120);
      const total = Math.min(100, Math.max(1, Math.round(q.total || 1)));
      const score = Math.min(total, Math.max(0, Math.round(q.score || 0)));
      const percentage = Math.min(100, Math.max(0, Math.round((score / total) * 100)));
      const ref = doc(db, 'users', uid, 'quizzes', safeQuizId);
      batch.set(ref, {
        userId: uid,
        topicId: sanitizeId(q.topicId, 80),
        topicName: sanitizeText(q.topicName, 140, 'תרגול'),
        gradeId: sanitizeQuizGradeId(q.gradeId),
        gradeName: sanitizeText(q.gradeName, 50, 'מותאם אישית'),
        category: sanitizeText(q.category, 60, 'אלגברה'),
        difficulty: sanitizeDifficulty(q.difficulty),
        mode: q.mode === 'custom_exam' || q.mode === 'custom_practice' ? q.mode : 'topic',
        score,
        total,
        percentage,
        completedAt: q.completedAt || Date.now(),
        createdAt: serverTimestamp(),
      });
    });

    // Migrate guest activity days & unlocked achievements
    const activeDates = collectActiveDateKeys(localProgress).slice(-45);
    activeDates.forEach((dateKey) => {
      if (DATE_KEY_REGEX.test(dateKey)) {
        const dayRef = doc(db, 'users', uid, 'activityDays', dateKey);
        batch.set(dayRef, {
          userId: uid,
          dateKey,
          actionsCount: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    });

    const evaluated = evaluateAchievements(localProgress);
    Object.values(evaluated.mergedUnlockedMap)
      .slice(0, 30)
      .forEach((badge) => {
        const safeBadgeId = sanitizeId(badge.badgeId, 64);
        const achRef = doc(db, 'users', uid, 'achievements', safeBadgeId);
        batch.set(achRef, {
          userId: uid,
          badgeId: safeBadgeId,
          title: sanitizeText(badge.title, 100, 'הישג'),
          category: sanitizeAchievementCategory(badge.category),
          unlockedAt: badge.unlockedAt || Date.now(),
          createdAt: serverTimestamp(),
        });
      });

    // Save initial study goal
    const goalRef = doc(db, 'users', uid, 'studyGoals', 'current');
    batch.set(goalRef, {
      userId: uid,
      targetGradeId: sanitizeGradeId(localGoal.targetGradeId),
      focusCategory: sanitizeText(localGoal.focusCategory || 'all', 60, 'all'),
      studyDays: sanitizeStudyDays(localGoal.studyDays),
      dailyMinutes: Math.min(240, Math.max(5, Math.round(localGoal.dailyMinutes || 30))),
      weeklyTopicsTarget: Math.min(30, Math.max(1, Math.round(localGoal.weeklyTopicsTarget || 4))),
      includeMasteredReview: Boolean(localGoal.includeMasteredReview),
      updatedAt: serverTimestamp(),
    });

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
    }

    return {
      profile: {
        uid,
        displayName: initialDisplayName,
        email: user.email || undefined,
        photoURL: user.photoURL || undefined,
        gradeId: 'all',
        points: safePoints,
        isNewProfile: true,
      },
      progress: {
        ...localProgress,
        activityDates: activeDates,
        unlockedAchievements: evaluated.mergedUnlockedMap,
      },
      studyGoal: localGoal,
    };
  }

  // Existing user: fetch profile, private info, studiedTopics, quizzes, studyGoal, achievements, activityDays
  const userData = userSnap.data();

  let privateSnap;
  try {
    privateSnap = await getDoc(privateRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/private/info`);
  }
  const privateData = privateSnap.exists() ? privateSnap.data() : {};

  let studiedSnap;
  try {
    studiedSnap = await getDocs(
      query(collection(db, 'users', uid, 'studiedTopics'), where('userId', '==', uid))
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/studiedTopics`);
  }

  const studiedTopics: Record<string, StudiedTopicRecord> = {};
  studiedSnap.forEach((d) => {
    const data = d.data();
    studiedTopics[data.topicId] = {
      topicId: data.topicId,
      topicName: data.topicName,
      gradeId: data.gradeId,
      gradeName: data.gradeName,
      category: data.category as TopicCategory,
      difficulty: data.difficulty as Difficulty,
      lastStudiedAt: data.lastStudiedAt,
    };
  });

  let quizzesSnap;
  try {
    quizzesSnap = await getDocs(
      query(collection(db, 'users', uid, 'quizzes'), where('userId', '==', uid))
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/quizzes`);
  }

  const completedQuizzes: CompletedQuizRecord[] = [];
  quizzesSnap.forEach((d) => {
    const data = d.data();
    completedQuizzes.push({
      id: d.id,
      topicId: data.topicId,
      topicName: data.topicName,
      gradeId: data.gradeId,
      gradeName: data.gradeName,
      category: data.category as TopicCategory,
      difficulty: data.difficulty as Difficulty,
      mode: data.mode,
      score: data.score,
      total: data.total,
      percentage: data.percentage,
      completedAt: data.completedAt,
    });
  });
  completedQuizzes.sort((a, b) => b.completedAt - a.completedAt);

  let achievementsSnap;
  try {
    achievementsSnap = await getDocs(
      query(collection(db, 'users', uid, 'achievements'), where('userId', '==', uid))
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/achievements`);
  }

  const cloudUnlocked: Record<string, UnlockedAchievementRecord> = {};
  achievementsSnap.forEach((d) => {
    const data = d.data();
    cloudUnlocked[d.id] = {
      badgeId: data.badgeId || d.id,
      title: data.title,
      category: sanitizeAchievementCategory(data.category),
      unlockedAt: typeof data.unlockedAt === 'number' ? data.unlockedAt : Date.now(),
    };
  });

  let activitySnap;
  try {
    activitySnap = await getDocs(
      query(collection(db, 'users', uid, 'activityDays'), where('userId', '==', uid))
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `users/${uid}/activityDays`);
  }

  const cloudActivityDates: string[] = [];
  activitySnap.forEach((d) => {
    const key = d.data().dateKey || d.id;
    if (typeof key === 'string' && DATE_KEY_REGEX.test(key)) {
      cloudActivityDates.push(key);
    }
  });

  let goalSnap;
  try {
    goalSnap = await getDoc(doc(db, 'users', uid, 'studyGoals', 'current'));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${uid}/studyGoals/current`);
  }

  let loadedGoal: StudyGoal | null = null;
  if (goalSnap.exists()) {
    const g = goalSnap.data();
    loadedGoal = {
      targetGradeId: g.targetGradeId || 'all',
      focusCategory: (g.focusCategory as TopicCategory | 'all') || 'all',
      studyDays: Array.isArray(g.studyDays) ? g.studyDays : [0, 2, 4],
      dailyMinutes: typeof g.dailyMinutes === 'number' ? g.dailyMinutes : 30,
      weeklyTopicsTarget: typeof g.weeklyTopicsTarget === 'number' ? g.weeklyTopicsTarget : 4,
      includeMasteredReview: Boolean(g.includeMasteredReview),
      updatedAt: Date.now(),
    };
  }

  const baseLoadedProgress: UserProgressData = {
    points: typeof userData.points === 'number' ? userData.points : 0,
    studiedTopics,
    completedQuizzes,
    activityDates: cloudActivityDates,
    unlockedAchievements: cloudUnlocked,
  };

  const mergedActivityDates = collectActiveDateKeys(baseLoadedProgress);
  const evalAfterLoad = evaluateAchievements({
    ...baseLoadedProgress,
    activityDates: mergedActivityDates,
  });

  // Persist any retroactively earned badges seamlessly
  if (evalAfterLoad.newlyUnlocked.length > 0) {
    syncAchievementsAndActivityToCloud(uid, null, evalAfterLoad.newlyUnlocked).catch((err) =>
      console.warn('Cloud retroactive achievement sync warning:', err)
    );
  }

  return {
    profile: {
      uid,
      displayName: userData.displayName || user.displayName || 'תלמיד/ה',
      email: privateData.email || user.email || undefined,
      photoURL: privateData.photoURL || user.photoURL || undefined,
      gradeId: userData.gradeId || 'all',
      points: typeof userData.points === 'number' ? userData.points : 0,
      isNewProfile: false,
    },
    progress: {
      ...baseLoadedProgress,
      activityDates: mergedActivityDates,
      unlockedAchievements: evalAfterLoad.mergedUnlockedMap,
    },
    studyGoal: loadedGoal,
  };
};

export const updateUserProfileInCloud = async (
  uid: string,
  displayName: string,
  gradeId: string
): Promise<{ displayName: string; gradeId: string }> => {
  const safeName = sanitizeText(displayName, 80, 'תלמיד/ה');
  const safeGrade = sanitizeGradeId(gradeId);
  const userRef = doc(db, 'users', uid);

  try {
    await updateDoc(userRef, {
      displayName: safeName,
      gradeId: safeGrade,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }

  return { displayName: safeName, gradeId: safeGrade };
};

export const syncAchievementsAndActivityToCloud = async (
  uid: string,
  activeDateKey: string | null,
  newlyUnlocked: UnlockedAchievementRecord[]
): Promise<void> => {
  if (activeDateKey && DATE_KEY_REGEX.test(activeDateKey)) {
    const dayRef = doc(db, 'users', uid, 'activityDays', activeDateKey);
    try {
      const existingDay = await getDoc(dayRef);
      if (existingDay.exists()) {
        const currentCount = Number(existingDay.data().actionsCount || 1);
        await updateDoc(dayRef, {
          actionsCount: Math.min(500, Math.max(1, currentCount + 1)),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(dayRef, {
          userId: uid,
          dateKey: activeDateKey,
          actionsCount: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/activityDays/${activeDateKey}`);
    }
  }

  for (const badge of newlyUnlocked) {
    const safeBadgeId = sanitizeId(badge.badgeId, 64);
    const achRef = doc(db, 'users', uid, 'achievements', safeBadgeId);
    try {
      const existingAch = await getDoc(achRef);
      if (!existingAch.exists()) {
        await setDoc(achRef, {
          userId: uid,
          badgeId: safeBadgeId,
          title: sanitizeText(badge.title, 100, 'הישג'),
          category: sanitizeAchievementCategory(badge.category),
          unlockedAt: badge.unlockedAt || Date.now(),
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${uid}/achievements/${safeBadgeId}`);
    }
  }
};

export const syncStudiedTopicToCloud = async (
  uid: string,
  record: StudiedTopicRecord
): Promise<void> => {
  const safeTopicId = sanitizeId(record.topicId, 64);
  const ref = doc(db, 'users', uid, 'studiedTopics', safeTopicId);

  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, {
        topicName: sanitizeText(record.topicName, 120, 'נושא לימוד'),
        gradeId: sanitizeQuizGradeId(record.gradeId),
        gradeName: sanitizeText(record.gradeName, 40, 'כיתה'),
        category: sanitizeText(record.category, 60, 'אלגברה'),
        difficulty: sanitizeDifficulty(record.difficulty),
        lastStudiedAt: record.lastStudiedAt || Date.now(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        userId: uid,
        topicId: safeTopicId,
        topicName: sanitizeText(record.topicName, 120, 'נושא לימוד'),
        gradeId: sanitizeQuizGradeId(record.gradeId),
        gradeName: sanitizeText(record.gradeName, 40, 'כיתה'),
        category: sanitizeText(record.category, 60, 'אלגברה'),
        difficulty: sanitizeDifficulty(record.difficulty),
        lastStudiedAt: record.lastStudiedAt || Date.now(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/studiedTopics/${safeTopicId}`);
  }
};

export const syncQuizCompletedToCloud = async (
  uid: string,
  quizRecord: CompletedQuizRecord,
  newTotalPoints: number
): Promise<void> => {
  const safeQuizId = sanitizeId(quizRecord.id, 120);
  const quizRef = doc(db, 'users', uid, 'quizzes', safeQuizId);
  const userRef = doc(db, 'users', uid);

  const total = Math.min(100, Math.max(1, Math.round(quizRecord.total || 1)));
  const score = Math.min(total, Math.max(0, Math.round(quizRecord.score || 0)));
  const percentage = Math.min(100, Math.max(0, Math.round((score / total) * 100)));

  const batch = writeBatch(db);
  batch.set(quizRef, {
    userId: uid,
    topicId: sanitizeId(quizRecord.topicId, 80),
    topicName: sanitizeText(quizRecord.topicName, 140, 'תרגול'),
    gradeId: sanitizeQuizGradeId(quizRecord.gradeId),
    gradeName: sanitizeText(quizRecord.gradeName, 50, 'מותאם אישית'),
    category: sanitizeText(quizRecord.category, 60, 'אלגברה'),
    difficulty: sanitizeDifficulty(quizRecord.difficulty),
    mode:
      quizRecord.mode === 'custom_exam' || quizRecord.mode === 'custom_practice'
        ? quizRecord.mode
        : 'topic',
    score,
    total,
    percentage,
    completedAt: quizRecord.completedAt || Date.now(),
    createdAt: serverTimestamp(),
  });

  batch.update(userRef, {
    points: Math.min(10000000, Math.max(0, Math.round(newTotalPoints))),
    updatedAt: serverTimestamp(),
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/quizzes/${safeQuizId}`);
  }
};

export const syncStudyGoalToCloud = async (
  uid: string,
  goal: StudyGoal
): Promise<void> => {
  const ref = doc(db, 'users', uid, 'studyGoals', 'current');
  const payload = {
    targetGradeId: sanitizeGradeId(goal.targetGradeId),
    focusCategory: sanitizeText(goal.focusCategory || 'all', 60, 'all'),
    studyDays: sanitizeStudyDays(goal.studyDays),
    dailyMinutes: Math.min(240, Math.max(5, Math.round(goal.dailyMinutes || 30))),
    weeklyTopicsTarget: Math.min(30, Math.max(1, Math.round(goal.weeklyTopicsTarget || 4))),
    includeMasteredReview: Boolean(goal.includeMasteredReview),
    updatedAt: serverTimestamp(),
  };

  try {
    const existing = await getDoc(ref);
    if (existing.exists()) {
      await updateDoc(ref, payload);
    } else {
      await setDoc(ref, {
        userId: uid,
        ...payload,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}/studyGoals/current`);
  }
};

export const resetCloudUserProgress = async (uid: string): Promise<void> => {
  try {
    const [studiedSnap, quizzesSnap, achievementsSnap, activitySnap] = await Promise.all([
      getDocs(query(collection(db, 'users', uid, 'studiedTopics'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'users', uid, 'quizzes'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'users', uid, 'achievements'), where('userId', '==', uid))),
      getDocs(query(collection(db, 'users', uid, 'activityDays'), where('userId', '==', uid))),
    ]);

    const batch = writeBatch(db);
    studiedSnap.forEach((d) => batch.delete(d.ref));
    quizzesSnap.forEach((d) => batch.delete(d.ref));
    achievementsSnap.forEach((d) => batch.delete(d.ref));
    activitySnap.forEach((d) => batch.delete(d.ref));
    batch.update(doc(db, 'users', uid), {
      points: 0,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${uid}`);
  }
};
