import { QuizQuestion, Difficulty } from '../types.ts';
import { STATIC_DATA_DB } from '../data/staticCurriculum.ts';
import { QUESTION_BANK } from '../data/questionBank.ts';
import { loadFromCache, saveToCache } from './storageService.ts';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ContentResult {
  markdown: string;
  keywords: Record<string, string>;
  source: 'static' | 'cache';
}

export const getLessonContent = async (
  gradeId: string,
  _gradeName: string,
  topicId: string,
  topicName: string,
  difficulty: Difficulty
): Promise<ContentResult> => {
  // 1. Always prefer the fresh bundled curriculum database so lesson updates appear immediately
  await delay(80);
  const gradeData = STATIC_DATA_DB[gradeId];
  const topicData = gradeData?.topics[topicId];

  if (topicData) {
    const result = {
      markdown: topicData.lesson.markdown,
      keywords: topicData.lesson.keywords
    };
    saveToCache('lesson', gradeId, topicId, difficulty, result);
    return {
      ...result,
      source: 'static'
    };
  }

  // 2. Fallback to offline local cache if topic is missing from static bundle
  const cached = loadFromCache<{ markdown: string; keywords: Record<string, string> }>('lesson', gradeId, topicId, difficulty);
  if (cached) {
    return {
      ...cached,
      source: 'cache'
    };
  }

  const fallback = {
    markdown: `
## שיעור בנושא: ${topicName}
התוכן בנושא זה נערך ומתעדכן במערכת. מומלץ לבחור באחד מנושאי הליבה המורחבים בכיתה זו.

### מחשבון לתרגול:
\`\`\`calculator
\`\`\`
    `,
    keywords: {}
  };
  return { ...fallback, source: 'static' };
};

export const getQuizContent = async (
  gradeId: string,
  _gradeName: string,
  topicId: string,
  topicName: string,
  difficulty: Difficulty
): Promise<QuizQuestion[]> => {
  await delay(80);
  const gradeData = STATIC_DATA_DB[gradeId];
  const topicData = gradeData?.topics[topicId];

  if (topicData?.quiz && topicData.quiz.length > 0) {
    // Merge any extra questions for this topic from QUESTION_BANK without duplicating
    const bankExtras = QUESTION_BANK.filter(
      (q) =>
        q.topicId === topicId &&
        !topicData.quiz.some((tq) => tq.question.trim() === q.question.trim())
    );
    const combined = [...topicData.quiz, ...bankExtras];

    // Order questions so items matching the chosen difficulty appear first while preserving variety
    const ordered = [...combined].sort((a, b) => {
      const aMatch = a.difficulty === difficulty ? 0 : 1;
      const bMatch = b.difficulty === difficulty ? 0 : 1;
      return aMatch - bMatch;
    });

    const selected = ordered.slice(0, Math.min(10, ordered.length));
    saveToCache('quiz', gradeId, topicId, difficulty, selected);
    return selected;
  }

  const cached = loadFromCache<QuizQuestion[]>('quiz', gradeId, topicId, difficulty);
  if (cached && cached.length > 0) {
    return cached;
  }

  // Check matching questions from question bank
  const matchingBank = QUESTION_BANK.filter(
    (q) => q.gradeId === gradeId || q.topicId === topicId
  );
  if (matchingBank.length > 0) {
    saveToCache('quiz', gradeId, topicId, difficulty, matchingBank);
    return matchingBank;
  }

  return [
    {
      question: `שאלה ראשונה בנושא ${topicName}:`,
      options: ['תשובה א׳', 'תשובה ב׳', 'תשובה ג׳', 'תשובה ד׳'],
      correctAnswerIndex: 0,
      explanation: 'הסבר כללי על התשובה הנכונה.',
      hint: 'בדקו את הנתונים בשאלה.'
    }
  ];
};

export interface AIMistakeFeedbackResult {
  misconception: string;
  pedagogicalTip: string;
  ruleOfThumb: string;
  source: 'pedagogical' | 'offline';
}

const mistakeFeedbackCache = new Map<string, AIMistakeFeedbackResult>();

export const getAIFeedbackForMistake = async (params: {
  questionId?: string;
  gradeName?: string;
  topicName?: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
  fullSolution?: string[];
  difficulty?: Difficulty;
}): Promise<AIMistakeFeedbackResult> => {
  const cacheKey = `${params.question}_${params.userAnswer}`;
  if (mistakeFeedbackCache.has(cacheKey)) {
    return mistakeFeedbackCache.get(cacheKey)!;
  }

  // High-Quality Pedagogical Diagnostic Engine (Standalone, zero external secret API)
  const qLower = params.question.toLowerCase();
  let misconception =
    'נראה שנבחרה תשובה שנובעת מחישוב חלקי, שגיאת סימנים, או בלבול בין שלבים אלגבריים.';
  let pedagogicalTip =
    params.explanation ||
    'בדקו שוב את נתוני השאלה והציבו את התשובה כדי לוודא שוויון.';
  let ruleOfThumb =
    'במתמטיקה: תמיד מציבים את הפתרון שהתקבל במשוואה המקורית לבדיקה עצמית.';

  if (
    qLower.includes('טרינום') ||
    qLower.includes('פירוק') ||
    params.question.includes('x²') ||
    params.question.includes('x^2')
  ) {
    misconception =
      'בפירוק טרינום $x^2 + bx + c$, טעות נפוצה היא בחירת גורמים שסכומם תואם אך מכפלתם שגויה בסימן (פלוס/מינוס), או בלבול בין סימן המספר לסימן בסוגריים $(x - p)(x - q)$.';
    pedagogicalTip =
      'ראשית בדקו את סימן המכפלה $c$: אם $c$ שלילי, לשני המספרים סימנים הפוכים. לאחר מכן בדקו שהסכום שלהם יוצא בדיוק $b$. פתחו תמיד סוגריים חזרה כדי לאמת: $(x+p)(x+q) = x^2 + (p+q)x + pq$.';
    ruleOfThumb =
      'כלל ברזל בטרינום: קודם בודקים מכפלה (כולל הסימן!), ורק אחר כך סכום.';
  } else if (
    params.question.includes('/') ||
    params.question.includes('שבר') ||
    params.question.includes('מונה') ||
    params.question.includes('מכנה')
  ) {
    misconception =
      'בפעולות בשברים (חיבור או חיסור), טעות שכיחה היא חיבור של המכנים יחד במקום להשאיר מכנה משותף זהה, או דילוג על הרחבת המונה.';
    pedagogicalTip =
      'זכרו: בחיבור שברים בעלי אותו מכנה, משאירים את המכנה ללא שינוי ומחברים רק את המונים: $\\frac{a}{c} + \\frac{b}{c} = \\frac{a+b}{c}$. אם המכנים שונים, יש למצוא קודם מכנה משותף.';
    ruleOfThumb =
      'מכנה משותף משאירים זהה — מחברים ומחסרים אך ורק את המונים!';
  } else if (
    params.question.includes('פרבולה') ||
    params.question.includes('קודקוד') ||
    params.question.includes('ציר סימטריה')
  ) {
    misconception =
      'במציאת קודקוד פרבולה או חיתוך עם הצירים, נפוץ לבלבל בין שיעור ה-$x$ של הקודקוד לבין שיעור ה-$y$, או לשכוח את המינוס בנוסחה $x = -\\frac{b}{2a}$.';
    pedagogicalTip =
      'הציבו בנוסחה $x = -\\frac{b}{2a}$, מצאו את $x$, ואז הציבו ערך זה בפונקציה המקורית $f(x)$ כדי למצוא את שיעור ה-$y$ של הקודקוד.';
    ruleOfThumb =
      'קודקוד פרבולה: קודם מוצאים $x = -\\frac{b}{2a}$, ואז מציבים ומקבלים את $y$.';
  } else if (
    params.question.includes('נגזרת') ||
    params.question.includes('שיפוע') ||
    params.question.includes('אינטגרל')
  ) {
    misconception =
      'בגזירה או אינטגרציה, טעות נפוצה היא שכחה להפחית 1 מהמעריך בגזירה $(x^n)\' = n \\cdot x^{n-1}$, או בלבול בכלל השרשרת לפונקציה מורכבת.';
    pedagogicalTip =
      'הקפידו על כלל החזקה: המעריך יורד קדימה כמקדם, והחזקה קטנה ב-1. בנגזרת של מספר קבוע התוצאה היא 0.';
    ruleOfThumb = 'חזקה יורדת כמקדם, המעריך יורד ב-1!';
  } else if (
    params.question.includes('פיתגורס') ||
    params.question.includes('משולש') ||
    params.question.includes('יתר')
  ) {
    misconception =
      'במשפט פיתגורס, טעות נפוצה היא חיבור היתר עם אחד הניצבים, במקום לחבר את ריבועי שני הניצבים: $a^2 + b^2 = c^2$.';
    pedagogicalTip =
      'זהו תמיד את היתר (הצלע הארוכה ביותר מול הזווית הישרה). רק היתר עומד לבדו בריבוע: $c^2 = a^2 + b^2$.';
    ruleOfThumb =
      'משפט פיתגורס תקף אך ורק במשולש ישר זווית: יתר בריבוע שווה לסכום ריבועי הניצבים.';
  }

  const result: AIMistakeFeedbackResult = {
    misconception,
    pedagogicalTip,
    ruleOfThumb,
    source: 'offline',
  };
  mistakeFeedbackCache.set(cacheKey, result);
  return result;
};