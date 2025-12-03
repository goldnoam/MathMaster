import { GradeLevel } from './types.ts';

// Icons are emoji for simplicity and performance
export const CURRICULUM: GradeLevel[] = [
  {
    id: 'grade-1',
    name: 'כיתה א׳',
    color: 'bg-red-500',
    topics: [
      { id: 'g1-add-sub-10', name: 'חיבור וחיסור עד 10', icon: '➕' },
      { id: 'g1-shapes', name: 'צורות הנדסיות', icon: '🔺' },
      { id: 'g1-order', name: 'סדר המספרים', icon: '🔢' },
    ],
  },
  {
    id: 'grade-2',
    name: 'כיתה ב׳',
    color: 'bg-orange-500',
    topics: [
      { id: 'g2-mult-intro', name: 'לוח הכפל (התחלה)', icon: '✖️' },
      { id: 'g2-add-sub-100', name: 'חיבור וחיסור עד 100', icon: '💯' },
      { id: 'g2-geometry', name: 'מצולעים', icon: '🔷' },
    ],
  },
  {
    id: 'grade-3',
    name: 'כיתה ג׳',
    color: 'bg-amber-500',
    topics: [
      { id: 'g3-large-numbers', name: 'מספרים גדולים', icon: '🐘' },
      { id: 'g3-division', name: 'חילוק', icon: '➗' },
      { id: 'g3-fractions-intro', name: 'שברים (היכרות)', icon: '🍕' },
    ],
  },
  {
    id: 'grade-4',
    name: 'כיתה ד׳',
    color: 'bg-yellow-500',
    topics: [
      { id: 'g4-fractions', name: 'שברים פשוטים', icon: '🍰' },
      { id: 'g4-long-division', name: 'חילוק ארוך', icon: '📝' },
      { id: 'g4-perimeter-area', name: 'היקף ושטח', icon: '📐' },
    ],
  },
  {
    id: 'grade-5',
    name: 'כיתה ה׳',
    color: 'bg-lime-500',
    topics: [
      { id: 'g5-decimals', name: 'שברים עשרוניים', icon: '0️⃣.5️⃣' },
      { id: 'g5-fractions-ops', name: 'פעולות בשברים', icon: '➗' },
      { id: 'g5-angles', name: 'זוויות', icon: '📐' },
    ],
  },
  {
    id: 'grade-6',
    name: 'כיתה ו׳',
    color: 'bg-green-500',
    topics: [
      { id: 'g6-percentages', name: 'אחוזים', icon: '%' },
      { id: 'g6-ratio', name: 'יחס ופרופורציה', icon: '⚖️' },
      { id: 'g6-circle', name: 'המעגל (היקף ושטח)', icon: '⭕' },
    ],
  },
  {
    id: 'grade-7',
    name: 'כיתה ז׳',
    color: 'bg-emerald-500',
    topics: [
      { id: 'g7-algebra-intro', name: 'משתנים וביטויים אלגבריים', icon: 'x' },
      { id: 'g7-signed-numbers', name: 'מספרים מכוונים', icon: '🌡️' },
      { id: 'g7-equations', name: 'משוואות במעלה ראשונה', icon: '=' },
    ],
  },
  {
    id: 'grade-8',
    name: 'כיתה ח׳',
    color: 'bg-teal-500',
    topics: [
      { id: 'g8-functions', name: 'פונקציות קוויות', icon: '📈' },
      { id: 'g8-systems', name: 'מערכת משוואות', icon: '🔄' },
      { id: 'g8-pythagoras', name: 'משפט פיתגורס', icon: '⊿' },
    ],
  },
  {
    id: 'grade-9',
    name: 'כיתה ט׳',
    color: 'bg-cyan-500',
    topics: [
      { id: 'g9-quadratic', name: 'פונקציה ריבועית', icon: '∪' },
      { id: 'g9-geometry', name: 'דמיון משולשים', icon: '🔍' },
      { id: 'g9-probability', name: 'הסתברות', icon: '🎲' },
    ],
  },
  {
    id: 'grade-10',
    name: 'כיתה י׳',
    color: 'bg-sky-500',
    topics: [
      { id: 'g10-analytic', name: 'גאומטריה אנליטית', icon: '📉' },
      { id: 'g10-trig', name: 'טריגונומטריה', icon: '📐' },
      { id: 'g10-algebra', name: 'טכניקה אלגברית מתקדמת', icon: '🧮' },
    ],
  },
  {
    id: 'grade-11',
    name: 'כיתה י״א',
    color: 'bg-blue-500',
    topics: [
      { id: 'g11-calculus', name: 'חשבון דיפרנציאלי (נגזרות)', icon: '∫' },
      { id: 'g11-word-problems', name: 'בעיות מילוליות', icon: '📝' },
      { id: 'g11-sequence', name: 'סדרות', icon: '1,2,3' },
    ],
  },
  {
    id: 'grade-12',
    name: 'כיתה י״ב',
    color: 'bg-indigo-500',
    topics: [
      { id: 'g12-integral', name: 'אינטגרלים', icon: '∫' },
      { id: 'g12-vectors', name: 'וקטורים', icon: '↗️' },
      { id: 'g12-complex', name: 'מספרים מרוכבים', icon: 'i' },
    ],
  ],