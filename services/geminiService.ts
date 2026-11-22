import { GoogleGenAI, Type, Schema } from '@google/genai';
import { QuizQuestion, Difficulty, TopicCategory } from '../types.ts';

const getAIClient = () => {
  const apiKey =
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY || process.env?.API_KEY : undefined);

  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLessonWithAI = async (
  gradeName: string,
  topicName: string,
  difficulty: Difficulty
): Promise<{ markdown: string; keywords: Record<string, string> }> => {
  try {
    const ai = getAIClient();
    const difficultyHebrew =
      difficulty === 'easy'
        ? 'בסיסי / למתחילים'
        : difficulty === 'medium'
        ? 'בינוני / רגיל'
        : 'מתקדם / מאתגר';

    const prompt = `
אתה מורה פרטי מומחה למתמטיקה בישראל, בעל ניסיון רב בהוראה לכיתות ${gradeName}.
צור שיעור מקיף, מרתק וברור בעברית עבור הנושא: "${topicName}" ברמת קושי: ${difficultyHebrew}.

השיעור צריך לכלול:
1. מבוא ברור ומוטיבציה להבנת הנושא עם דוגמאות מעולם הילדים/בני הנוער.
2. הסבר מפורט של החוקים או הנוסחאות (באמצעות סימוני יוניקוד ברורים כמו x², √, ±, Δ ולא LaTeX).
3. בלוק צעדים בפורמט מיוחד בדיוק כך:
\`\`\`steps
כותרת הצעד | שלב 1 | שלב 2 | שלב 3 | תוצאה סופית
\`\`\`
4. תרגיל אינטראקטיבי אחד לפחות בפורמט:
\`\`\`exercise
תרגיל מתמטי | תשובה נכונה
\`\`\`
5. קריאה למחשבון בפורמט:
\`\`\`calculator
\`\`\`

כמו כן, ספק מילון מונחים (Keywords) עם מונחים מרכזיים והסבר קצר עליהם בפורמט JSON טהור (מפתח: ערך).
החזר את התשובה במבנה JSON הבא בלבד (ללא טקסט נוסף מחוץ ל-JSON):
{
  "markdown": "תוכן השיעור המלא ב-Markdown...",
  "keywords": {
    "מונח 1": "הסבר למונח 1",
    "מונח 2": "הסבר למונח 2"
  }
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response from Gemini');
    }

    const parsed = JSON.parse(text);
    return {
      markdown:
        parsed.markdown || `## שיעור בנושא ${topicName}\n\nתוכן נטען בהצלחה.`,
      keywords: parsed.keywords || {},
    };
  } catch (error) {
    console.error('AI Lesson Generation Error:', error);
    throw error;
  }
};

const quizSchema: Schema = {
  type: Type.ARRAY,
  description: 'רשימת שאלות מבחן במתמטיקה עם פתרונות מלאים שלב אחר שלב',
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: 'נוסח השאלה בעברית' },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: '4 אפשרויות תשובה',
      },
      correctAnswerIndex: {
        type: Type.INTEGER,
        description: 'אינדקס התשובה הנכונה (0 עד 3)',
      },
      explanation: {
        type: Type.STRING,
        description: 'תקציר ההסבר מדוע זו התשובה הנכונה',
      },
      fullSolution: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'פירוט פתרון מלא שלב אחר שלב (3-5 שלבים ברורים)',
      },
      hint: { type: Type.STRING, description: 'רמז מנחה לתלמיד' },
    },
    required: [
      'question',
      'options',
      'correctAnswerIndex',
      'explanation',
      'fullSolution',
      'hint',
    ],
  },
};

export const generateQuizWithAI = async (
  gradeName: string,
  topicName: string,
  difficulty: Difficulty
): Promise<QuizQuestion[]> => {
  try {
    const ai = getAIClient();
    const difficultyHebrew =
      difficulty === 'easy' ? 'בסיסי' : difficulty === 'medium' ? 'בינוני' : 'מתקדם';

    const prompt = `
צור 4 שאלות מבחן אמריקאיות (רב ברירה) ברמת קושי ${difficultyHebrew} בנושא "${topicName}" לכיתה ${gradeName}.
השאלות צריכות להיות מדויקות מבחינה מתמטית, כתובות בעברית תקנית (ללא סימני LaTeX אלא יוניקוד כמו x², √, Δ), וכוללות מסיחים הגיוניים, רמז מועיל, תקציר הסבר, וכן מערך שלבי פתרון מלאים (fullSolution) מפורט שלב אחר שלב.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: quizSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No response for quiz');
    }

    const questions: QuizQuestion[] = JSON.parse(text);
    return questions;
  } catch (error) {
    console.error('AI Quiz Generation Error:', error);
    throw error;
  }
};

export const generateCustomQuestionsWithAI = async (params: {
  category: TopicCategory | 'all';
  gradeNames: string[];
  difficulty: Difficulty | 'mixed';
  count: number;
}): Promise<QuizQuestion[]> => {
  try {
    const ai = getAIClient();
    const domainText =
      params.category === 'all' ? 'תחומי מתמטיקה מגוונים' : params.category;
    const gradesText =
      params.gradeNames.length > 0 ? params.gradeNames.join(', ') : 'כיתות א׳–י״ב';
    const diffText =
      params.difficulty === 'mixed'
        ? 'מדורגת (בסיסי, בינוני ומתקדם)'
        : params.difficulty === 'easy'
        ? 'בסיסית'
        : params.difficulty === 'medium'
        ? 'בינונית'
        : 'מתקדמת';

    const prompt = `
צור בדיוק ${params.count} שאלות מתמטיקה אמריקאיות (4 אפשרויות) בעברית תקנית עבור תרגול/מבחן מותאם אישית:
- תחום: ${domainText}
- שכבת גיל / כיתות: ${gradesText}
- רמת קושי: ${diffText}

הקפד על דיוק מתמטי מלא, כתיב יוניקוד ברור (x², √, π, Δ ולא LaTeX), רמז מועיל ופתרון מלא שלב אחר שלב (fullSolution) לכל שאלה.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: quizSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) return [];
    const parsed: QuizQuestion[] = JSON.parse(text);
    return parsed.map((q) => ({
      ...q,
      category: params.category === 'all' ? 'אלגברה' : params.category,
      difficulty: params.difficulty === 'mixed' ? 'medium' : params.difficulty,
    }));
  } catch (error) {
    console.warn('AI custom question generation failed, using local bank:', error);
    return [];
  }
};
