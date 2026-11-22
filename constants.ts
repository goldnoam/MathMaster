import { GradeLevel } from './types.ts';

export const CURRICULUM: GradeLevel[] = [
  {
    id: 'grade-1',
    name: 'כיתה א׳',
    color: 'bg-red-500',
    topics: [
      { id: 'g1-add-sub-10', name: 'חיבור וחיסור עד 10', icon: '➕', category: 'חשבון יסודי' },
      { id: 'g1-shapes', name: 'צורות הנדסיות', icon: '🔺', category: 'גיאומטריה' },
      { id: 'g1-order', name: 'סדר המספרים', icon: '🔢', category: 'חשבון יסודי' },
    ],
  },
  {
    id: 'grade-2',
    name: 'כיתה ב׳',
    color: 'bg-orange-500',
    topics: [
      { id: 'g2-mult-intro', name: 'לוח הכפל (התחלה)', icon: '✖️', category: 'חשבון יסודי' },
      { id: 'g2-add-sub-100', name: 'חיבור וחיסור עד 100', icon: '💯', category: 'חשבון יסודי' },
      { id: 'g2-geometry', name: 'מצולעים', icon: '🔷', category: 'גיאומטריה' },
    ],
  },
  {
    id: 'grade-3',
    name: 'כיתה ג׳',
    color: 'bg-amber-500',
    topics: [
      { id: 'g3-large-numbers', name: 'מספרים גדולים', icon: '🐘', category: 'חשבון יסודי' },
      { id: 'g3-division', name: 'חילוק', icon: '➗', category: 'חשבון יסודי' },
      { id: 'g3-fractions-intro', name: 'שברים (היכרות)', icon: '🍕', category: 'חשבון יסודי' },
    ],
  },
  {
    id: 'grade-4',
    name: 'כיתה ד׳',
    color: 'bg-yellow-500',
    topics: [
      { id: 'g4-fractions', name: 'שברים פשוטים', icon: '🍰', category: 'חשבון יסודי' },
      { id: 'g4-long-division', name: 'חילוק ארוך', icon: '📝', category: 'חשבון יסודי' },
      { id: 'g4-perimeter-area', name: 'היקף ושטח', icon: '📐', category: 'גיאומטריה' },
    ],
  },
  {
    id: 'grade-5',
    name: 'כיתה ה׳',
    color: 'bg-lime-500',
    topics: [
      { id: 'g5-decimals', name: 'שברים עשרוניים', icon: '0️⃣.5️⃣', category: 'חשבון יסודי' },
      { id: 'g5-fractions-ops', name: 'פעולות בשברים', icon: '➗', category: 'חשבון יסודי' },
      { id: 'g5-angles', name: 'זוויות', icon: '📐', category: 'גיאומטריה' },
    ],
  },
  {
    id: 'grade-6',
    name: 'כיתה ו׳',
    color: 'bg-green-500',
    topics: [
      { id: 'g6-percentages', name: 'אחוזים', icon: '%', category: 'חשבון יסודי' },
      { id: 'g6-ratio', name: 'יחס ופרופורציה', icon: '⚖️', category: 'חשבון יסודי' },
      { id: 'g6-circle', name: 'המעגל (היקף ושטח)', icon: '⭕', category: 'גיאומטריה' },
    ],
  },
  {
    id: 'grade-7',
    name: 'כיתה ז׳',
    color: 'bg-emerald-500',
    topics: [
      { id: 'g7-algebra-intro', name: 'משתנים וביטויים אלגבריים', icon: 'x', category: 'אלגברה' },
      { id: 'g7-signed-numbers', name: 'מספרים מכוונים', icon: '🌡️', category: 'חשבון יסודי' },
      { id: 'g7-equations', name: 'משוואות במעלה ראשונה', icon: '=', category: 'אלגברה' },
    ],
  },
  {
    id: 'grade-8',
    name: 'כיתה ח׳',
    color: 'bg-teal-500',
    topics: [
      { id: 'g8-functions', name: 'פונקציות קוויות', icon: '📈', category: 'אלגברה' },
      { id: 'g8-systems', name: 'מערכת משוואות', icon: '🔄', category: 'אלגברה' },
      { id: 'g8-pythagoras', name: 'משפט פיתגורס', icon: '⊿', category: 'גיאומטריה' },
    ],
  },
  {
    id: 'grade-9',
    name: 'כיתה ט׳',
    color: 'bg-cyan-500',
    topics: [
      { id: 'g9-factoring', name: 'פירוק לגורמים וטרינום', icon: '🧩', category: 'אלגברה' },
      { id: 'g9-short-formulas', name: 'נוסחאות הכפל המקוצר', icon: '²', category: 'אלגברה' },
      { id: 'g9-quadratic', name: 'פונקציה ריבועית ונוסחת השורשים', icon: '∪', category: 'אלגברה' },
      { id: 'g9-geometry', name: 'דמיון משולשים', icon: '🔍', category: 'גיאומטריה' },
      { id: 'g9-probability', name: 'הסתברות', icon: '🎲', category: 'הסתברות וסטטיסטיקה' },
    ],
  },
  {
    id: 'grade-10',
    name: 'כיתה י׳',
    color: 'bg-sky-500',
    topics: [
      { id: 'g10-analytic', name: 'גאומטריה אנליטית', icon: '📉', category: 'גיאומטריה' },
      { id: 'g10-trig', name: 'טריגונומטריה', icon: '📐', category: 'טריגונומטריה' },
      { id: 'g10-algebra', name: 'טכניקה אלגברית מתקדמת', icon: '🧮', category: 'אלגברה' },
    ],
  },
  {
    id: 'grade-11',
    name: 'כיתה י״א',
    color: 'bg-blue-500',
    topics: [
      { id: 'g11-calculus', name: 'חשבון דיפרנציאלי (נגזרות)', icon: '∫', category: 'חשבון דיפרנציאלי ואינטגרלי' },
      { id: 'g11-word-problems', name: 'בעיות מילוליות', icon: '📝', category: 'אלגברה' },
      { id: 'g11-sequence', name: 'סדרות', icon: '1,2,3', category: 'אלגברה' },
    ],
  },
  {
    id: 'grade-12',
    name: 'כיתה י״ב',
    color: 'bg-indigo-500',
    topics: [
      { id: 'g12-integral', name: 'אינטגרלים', icon: '∫', category: 'חשבון דיפרנציאלי ואינטגרלי' },
      { id: 'g12-vectors', name: 'וקטורים', icon: '↗️', category: 'גיאומטריה' },
      { id: 'g12-complex', name: 'מספרים מרוכבים', icon: 'i', category: 'אלגברה' },
    ],
  },
];