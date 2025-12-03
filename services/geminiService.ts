import { GoogleGenAI, Type } from '@google/genai';
import { QuizQuestion, Difficulty } from '../types.ts';
import { loadFromCache, saveToCache } from './storageService.ts';

// Helper function to get AI instance safely
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateLessonContent = async (gradeName: string, topicName: string, difficulty: Difficulty): Promise<string> => {
  // 1. Try to load from cache first
  const cachedLesson = loadFromCache<string>('lesson', gradeName, topicName, difficulty);
  if (cachedLesson) {
    console.log("Serving lesson from cache");
    return cachedLesson;
  }

  // 2. If not in cache (and we are online), call API
  if (!navigator.onLine) {
    throw new Error("No internet connection and lesson not found in cache.");
  }

  const ai = getAI();
  const model = 'gemini-2.5-flash';

  const difficultyPrompt = difficulty === 'easy' ? 'Simple language, very basic examples.' : 
                           difficulty === 'hard' ? 'Advanced concepts, challenging examples, deeper theory.' : 
                           'Standard curriculum level.';

  const prompt = `
    You are an excellent and patient math teacher for Hebrew speaking students.
    Create a short, clear, and engaging lesson for:
    Grade: ${gradeName}
    Topic: ${topicName}
    Difficulty Level: ${difficulty} (${difficultyPrompt})

    Structure the response with strict Markdown headers (##) to separate sections.
    
    Required Sections:
    ## הקדמה
    (Explain what it is)
    ## דוגמה מהחיים
    (Real world example or visual explanation)
    ## איך פותרים?
    (Step-by-step example solution)
    ## סיכום וטיפ
    (Summary tip)

    Format: Use Markdown. Use bolding for emphasis. Keep the tone encouraging.
    Crucial: The Output MUST be in Hebrew.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful Hebrew math tutor.",
      }
    });
    
    const text = response.text || "שגיאה בטעינת השיעור, אנא נסה שנית.";
    
    // 3. Save to cache on success
    saveToCache('lesson', gradeName, topicName, difficulty, text);
    
    return text;
  } catch (error) {
    console.error("Error generating lesson:", error);
    return "מצטערים, ארעה שגיאה בייצור השיעור. אנא נסה שנית מאוחר יותר.";
  }
};

export const generateQuizContent = async (gradeName: string, topicName: string, difficulty: Difficulty): Promise<QuizQuestion[]> => {
  // 1. Try to load from cache
  const cachedQuiz = loadFromCache<QuizQuestion[]>('quiz', gradeName, topicName, difficulty);
  if (cachedQuiz) {
    console.log("Serving quiz from cache");
    return cachedQuiz;
  }

  // 2. API Call
  if (!navigator.onLine) {
    // Return empty or throw, App.tsx handles empty array
    console.warn("Offline and no cached quiz");
    return []; 
  }

  const ai = getAI();
  const model = 'gemini-2.5-flash';

  const difficultyPrompt = difficulty === 'easy' ? 'Basic questions, straightforward numbers.' : 
                           difficulty === 'hard' ? 'Complex multi-step problems, trickier numbers.' : 
                           'Standard difficulty.';

  const prompt = `
    Create a math quiz for:
    Grade: ${gradeName}
    Topic: ${topicName}
    Difficulty Level: ${difficulty} (${difficultyPrompt})
    
    Generate 4 multiple choice questions.
    The response must be in Hebrew.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a math exam creator. Output strict JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The math question text in Hebrew" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Array of 4 possible answers"
              },
              correctAnswerIndex: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
              explanation: { type: Type.STRING, description: "Short explanation of the solution in Hebrew. Explain why the correct answer is correct." }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const quizData = JSON.parse(text) as QuizQuestion[];

    // 3. Save to Cache
    saveToCache('quiz', gradeName, topicName, difficulty, quizData);

    return quizData;

  } catch (error) {
    console.error("Error generating quiz:", error);
    return [
      {
        question: "אירעה שגיאה בטעינת השאלות",
        options: ["נסה שנית", "בדוק חיבור", "פנה לתמיכה", "דלג"],
        correctAnswerIndex: 0,
        explanation: "ישנה בעיה בתקשורת עם השרת."
      }
    ];
  }
};