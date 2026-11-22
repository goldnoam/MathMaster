import { QuizQuestion, Difficulty } from '../types.ts';
import { STATIC_DATA_DB } from '../data/staticCurriculum.ts';
import { loadFromCache, saveToCache } from './storageService.ts';
import { generateLessonWithAI, generateQuizWithAI } from './geminiService.ts';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface ContentResult {
  markdown: string;
  keywords: Record<string, string>;
  source: 'ai' | 'static' | 'cache';
}

export const getLessonContent = async (
  gradeId: string,
  gradeName: string,
  topicId: string,
  topicName: string,
  difficulty: Difficulty
): Promise<ContentResult> => {
  // 1. Try Cache
  const cached = loadFromCache<{ markdown: string; keywords: Record<string, string> }>('lesson', gradeId, topicId, difficulty);
  if (cached) {
    return {
      ...cached,
      source: 'cache'
    };
  }

  // 2. Check Online Mode -> Try Gemini AI
  if (navigator.onLine) {
    try {
      const aiResult = await generateLessonWithAI(gradeName, topicName, difficulty);
      saveToCache('lesson', gradeId, topicId, difficulty, aiResult);
      return {
        ...aiResult,
        source: 'ai'
      };
    } catch (e) {
      console.warn("AI generation failed, falling back to static offline curriculum:", e);
    }
  }

  // 3. Fallback to Static Offline DB
  await delay(400);
  const gradeData = STATIC_DATA_DB[gradeId];
  const topicData = gradeData?.topics[topicId];

  if (!topicData) {
    const fallback = {
      markdown: `
## שיעור בנושא: ${topicName}
כרגע תוכן זה אינו זמין במסד הנתונים הלא מקוון (Offline).
התחברו לאינטרנט כדי לאפשר למודל הבינה המלאכותית (Gemini AI) ליצור שיעור מותאם אישית עבורכם!

### מחשבון לתרגול:
\`\`\`calculator
\`\`\`
      `,
      keywords: {}
    };
    return { ...fallback, source: 'static' };
  }

  const markdown = topicData.lesson.markdown;

  const result = {
    markdown,
    keywords: topicData.lesson.keywords
  };

  saveToCache('lesson', gradeId, topicId, difficulty, result);
  return {
    ...result,
    source: 'static'
  };
};

export const getQuizContent = async (
  gradeId: string,
  gradeName: string,
  topicId: string,
  topicName: string,
  difficulty: Difficulty
): Promise<QuizQuestion[]> => {
  // 1. Try Cache
  const cached = loadFromCache<QuizQuestion[]>('quiz', gradeId, topicId, difficulty);
  if (cached && cached.length > 0) {
    return cached;
  }

  // 2. Check Online Mode -> Try Gemini AI
  if (navigator.onLine) {
    try {
      const aiQuestions = await generateQuizWithAI(gradeName, topicName, difficulty);
      if (aiQuestions && aiQuestions.length > 0) {
        saveToCache('quiz', gradeId, topicId, difficulty, aiQuestions);
        return aiQuestions;
      }
    } catch (e) {
      console.warn("AI quiz generation failed, falling back to static offline quiz:", e);
    }
  }

  // 3. Fallback to Static Offline DB
  await delay(400);
  const gradeData = STATIC_DATA_DB[gradeId];
  const topicData = gradeData?.topics[topicId];

  if (!topicData || !topicData.quiz) {
    return [
      {
        question: `שאלה ראשונה בנושא ${topicName}?`,
        options: ["תשובה א׳", "תשובה ב׳", "תשובה ג׳", "תשובה ד׳"],
        correctAnswerIndex: 0,
        explanation: "הסבר כללי על התשובה הנכונה.",
        hint: "בדקו את הנתונים בשאלה."
      }
    ];
  }

  return topicData.quiz;
};