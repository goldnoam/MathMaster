import { QuizQuestion, Difficulty } from '../types.ts';
import { STATIC_DATA_DB } from '../data/staticCurriculum.ts';
import { loadFromCache, saveToCache } from './storageService.ts';

// Helper to simulate "Processing" time for a realistic feel, even offline
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getLessonContent = async (gradeId: string, topicId: string, difficulty: Difficulty): Promise<{ markdown: string, keywords: Record<string, string> }> => {
  await delay(600); // Small fake loading delay

  // 1. Try Cache
  const cacheKey = `lesson_${gradeId}_${topicId}_${difficulty}`;
  const cached = loadFromCache<{ markdown: string, keywords: Record<string, string> }>('lesson', gradeId, topicId, difficulty);
  
  if (cached) return cached;

  // 2. Load from Static DB
  const gradeData = STATIC_DATA_DB[gradeId];
  const topicData = gradeData?.topics[topicId];

  if (!topicData) {
    return {
      markdown: `
## מצטערים, התוכן בבנייה
כרגע אין שיעור זמין לנושא זה בגרסת האופליין.
אנא נסה את **חיבור וחיסור (כיתה א)** או **שברים (כיתה ד)** להדגמה מלאה.

### נסה מחשבון בינתיים:
\`\`\`calculator
\`\`\`
      `,
      keywords: {}
    };
  }

  // Determine content based on difficulty (Mocking logic, in reality we might have 3 separate texts)
  let markdown = topicData.lesson.markdown;
  if (difficulty === 'easy') {
    markdown = "## הקדמה (רמה קלה)\n" + markdown;
  } else if (difficulty === 'hard') {
    markdown = "## הקדמה (רמה מתקדמת)\n" + markdown + "\n\n## חומר למתקדמים\n...";
  }

  const result = {
    markdown,
    keywords: topicData.lesson.keywords
  };

  saveToCache('lesson', gradeId, topicId, difficulty, result);
  return result;
};

export const getQuizContent = async (gradeId: string, topicId: string, difficulty: Difficulty): Promise<QuizQuestion[]> => {
  await delay(600);

  const gradeData = STATIC_DATA_DB[gradeId];
  const topicData = gradeData?.topics[topicId];

  if (!topicData || !topicData.quiz) {
    return [
      {
        question: "שאלה לדוגמה (התוכן חסר)",
        options: ["תשובה 1", "תשובה 2", "תשובה 3", "תשובה 4"],
        correctAnswerIndex: 0,
        explanation: "הסבר כללי."
      }
    ];
  }

  return topicData.quiz;
};