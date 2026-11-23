import { TopicCategory } from '../types.ts';

export interface FormulaItem {
  id: string;
  title: string;
  latex: string;
  explanation: string;
  example?: string;
}

export interface TopicFormulaSheet {
  title: string;
  formulas: FormulaItem[];
}

export const TOPIC_FORMULA_SHEETS: Record<string, TopicFormulaSheet> = {
  // ===== כיתה א׳ =====
  'g1-add-sub-10': {
    title: 'נוסחאות חיבור וחיסור עד 10',
    formulas: [
      {
        id: 'g1-add-comm',
        title: 'חוק החילוף בחיבור',
        latex: 'a + b = b + a',
        explanation: 'אפשר להחליף את סדר המספרים בחיבור והסכום נשאר זהה.',
        example: '$3 + 5 = 5 + 3 = 8$',
      },
      {
        id: 'g1-add-zero',
        title: 'חיבור וחיסור עם אפס',
        latex: 'a + 0 = a, \\qquad a - 0 = a, \\qquad a - a = 0',
        explanation: 'הוספה או הורדה של 0 אינה משנה את המספר; מספר פחות עצמו שווה 0.',
      },
      {
        id: 'g1-sub-check',
        title: 'הקשר בין חיבור לחיסור',
        latex: 'a + b = c \\iff c - b = a',
        explanation: 'חיסור הוא הפעולה ההפוכה לחיבור, וניתן לבדוק תרגיל חיסור בעזרת חיבור.',
        example: '$9 - 4 = 5$ כי $5 + 4 = 9$',
      },
    ],
  },
  'g1-shapes': {
    title: 'מאפייני צורות הנדסיות',
    formulas: [
      {
        id: 'g1-triangle',
        title: 'משולש',
        latex: '\\text{צלעות} = 3, \\qquad \\text{קודקודים} = 3',
        explanation: 'לכל משולש יש בדיוק 3 צלעות ישרות ו-3 קודקודים.',
      },
      {
        id: 'g1-quad',
        title: 'ריבוע ומלבן (מרובעים)',
        latex: '\\text{צלעות} = 4, \\qquad \\text{קודקודים} = 4',
        explanation: 'בריבוע כל 4 הצלעות שוות באורכן; במלבן כל זוג צלעות נגדיות שוות.',
      },
      {
        id: 'g1-circle',
        title: 'עיגול',
        latex: '\\text{צלעות} = 0, \\qquad \\text{קודקודים} = 0',
        explanation: 'העיגול תחום בקו עקום סגור ואין לו צלעות ישרות או פינות.',
      },
    ],
  },
  'g1-order': {
    title: 'סדר והשוואת מספרים',
    formulas: [
      {
        id: 'g1-compare',
        title: 'סימני השוואה',
        latex: 'a > b \\; (\\text{גדול מ-}), \\quad a < b \\; (\\text{קטן מ-}), \\quad a = b \\; (\\text{שווה})',
        explanation: 'הפתח הרחב של הסימן פונה תמיד אל המספר הגדול יותר.',
        example: '$8 > 5$, וגם $4 < 9$',
      },
      {
        id: 'g1-neighbors',
        title: 'מספר עוקב ומספר קודם',
        latex: '\\text{קודם} = n - 1, \\qquad \\text{עוקב} = n + 1',
        explanation: 'לכל מספר שלם $n$ יש שכן קטן ממנו ב-1 ושכן גדול ממנו ב-1.',
      },
    ],
  },

  // ===== כיתה ב׳ =====
  'g2-mult-intro': {
    title: 'עקרונות לוח הכפל',
    formulas: [
      {
        id: 'g2-mult-sum',
        title: 'כפל כחיבור חוזר',
        latex: 'a \\times b = \\underbrace{b + b + \\dots + b}_{a \\text{ פעמים}}',
        explanation: 'כפל הוא דרך מקוצרת לחבר קבוצות שוות.',
        example: '$4 \\times 3 = 3 + 3 + 3 + 3 = 12$',
      },
      {
        id: 'g2-mult-comm',
        title: 'חוק החילוף בכפל',
        latex: 'a \\times b = b \\times a',
        explanation: 'שינוי סדר הגורמים אינו משנה את המכפלה.',
      },
      {
        id: 'g2-mult-zero-one',
        title: 'כפל ב-0 וב-1',
        latex: 'a \\times 0 = 0, \\qquad a \\times 1 = a',
        explanation: 'כל מספר כפול 0 נותן 0, וכל מספר כפול 1 נשאר עצמו.',
      },
    ],
  },
  'g2-add-sub-100': {
    title: 'חיבור וחיסור עד 100',
    formulas: [
      {
        id: 'g2-tens-ones',
        title: 'פירוק לעשרות ולאחדות',
        latex: 'n = 10 \\cdot \\text{עשרות} + \\text{אחדות}',
        explanation: 'כל מספר דו-ספרתי מורכב מעשרות שלמות ומאחדות.',
        example: '$47 = 40 + 7$',
      },
      {
        id: 'g2-complete-ten',
        title: 'השלמה לעשרת שלמה',
        latex: 'a + b = (a + c) + (b - c)',
        explanation: 'מפרקים את המחובר השני כדי להגיע לעשרת שלמה ולהקל על החישוב.',
        example: '$28 + 7 = (28 + 2) + 5 = 35$',
      },
    ],
  },
  'g2-geometry': {
    title: 'מצולעים ותכונותיהם',
    formulas: [
      {
        id: 'g2-polygons',
        title: 'מספר צלעות במצולעים נפוצים',
        latex: '\\text{משולש}=3,\\; \\text{מרובע}=4,\\; \\text{מחומש}=5,\\; \\text{משושה}=6',
        explanation: 'שם המצולע נקבע לפי מספר הצלעות והקודקודים שלו.',
      },
      {
        id: 'g2-right-angle',
        title: 'זווית ישרה',
        latex: '\\alpha = 90^\\circ',
        explanation: 'פינה "ישרה" כמו פינת דף או ריבוע מוגדרת כזווית של 90 מעלות.',
      },
    ],
  },

  // ===== כיתה ג׳ =====
  'g3-large-numbers': {
    title: 'מבנה עשרוני ומספרים גדולים',
    formulas: [
      {
        id: 'g3-place-value',
        title: 'מבנה עשרוני עד אלפים',
        latex: 'abcd = 1000a + 100b + 10c + d',
        explanation: 'כל ספרה שמאלה גדולה פי 10 בערכה מהמקום שמימינה.',
        example: '$3,452 = 3000 + 400 + 50 + 2$',
      },
      {
        id: 'g3-rounding',
        title: 'כלל עיגול מספרים',
        latex: '\\text{ספרה } \\ge 5 \\Rightarrow \\text{מעגלים למעלה}, \\quad \\text{ספרה } < 5 \\Rightarrow \\text{למטה}',
        explanation: 'בודקים את הספרה שמימין לספרת העיגול כדי להחליט אם להוסיף 1 או להשאיר.',
      },
    ],
  },
  'g3-division': {
    title: 'חילוק ושארית',
    formulas: [
      {
        id: 'g3-div-check',
        title: 'הקשר בין חילוק לכפל',
        latex: 'a \\div b = c \\iff c \\times b = a \\quad (b \\neq 0)',
        explanation: 'תוצאת החילוק (המנה) כפול המחלק מחזירה את המחולק.',
      },
      {
        id: 'g3-div-rem',
        title: 'חילוק עם שארית',
        latex: 'a = b \\cdot q + r, \\qquad 0 \\le r < b',
        explanation: 'השארית $r$ חייבת להיות קטנה תמיד מהמחלק $b$.',
        example: '$23 \\div 5 = 4$ שארית $3$, כי $5 \\cdot 4 + 3 = 23$',
      },
    ],
  },
  'g3-fractions-intro': {
    title: 'היכרות עם שברים',
    formulas: [
      {
        id: 'g3-frac-def',
        title: 'מבנה השבר',
        latex: '\\frac{\\text{מונה}}{\\text{מכנה}}',
        explanation: 'המכנה (למטה) מראה לכמה חלקים שווים חולק השלם; המונה (למעלה) סופר כמה חלקים נלקחו.',
      },
      {
        id: 'g3-frac-whole',
        title: 'שבר השווה לשלם',
        latex: '\\frac{n}{n} = 1 \\qquad (n \\neq 0)',
        explanation: 'כאשר המונה והמכנה שווים, לקחנו את כל החלקים — כלומר שלם אחד.',
      },
    ],
  },

  // ===== כיתה ד׳ =====
  'g4-fractions': {
    title: 'נוסחאות שברים פשוטים',
    formulas: [
      {
        id: 'g4-frac-add-same',
        title: 'חיבור וחיסור במכנה זהה',
        latex: '\\frac{a}{c} \\pm \\frac{b}{c} = \\frac{a \\pm b}{c}',
        explanation: 'כאשר המכנים שווים, מחברים או מחסרים רק את המונים והמכנה נשאר ללא שינוי.',
      },
      {
        id: 'g4-frac-expand',
        title: 'הרחבה וצמצום שבר',
        latex: '\\frac{a}{b} = \\frac{a \\cdot k}{b \\cdot k} \\qquad (k \\neq 0)',
        explanation: 'כפל או חילוק של המונה והמכנה באותו מספר שומר על ערך השבר.',
        example: '$\\frac{2}{3} = \\frac{2 \\cdot 4}{3 \\cdot 4} = \\frac{8}{12}$',
      },
      {
        id: 'g4-frac-mixed',
        title: 'מעבר משבר מדומה למספר מעורב',
        latex: 'q\\frac{r}{b} = \\frac{q \\cdot b + r}{b}',
        explanation: 'הופכים מספר מעורב לשבר מדומה על ידי כפל השלם במכנה והוספת המונה.',
      },
    ],
  },
  'g4-long-division': {
    title: 'כללי חילוק ארוך וסימני התחלקות',
    formulas: [
      {
        id: 'g4-div-algo',
        title: 'אימות חילוק ארוך',
        latex: '\\text{מחולק} = \\text{מחלק} \\times \\text{מנה} + \\text{שארית}',
        explanation: 'בסיום חילוק ארוך בודקים שהשארית קטנה מהמחלק ומאמתים בכפל.',
      },
      {
        id: 'g4-div-rules',
        title: 'סימני התחלקות ב-2, 3, 5, 9, 10',
        latex: '2:\\text{זוגי}, \\quad 3/9:\\text{סכום ספרות}, \\quad 5:\\text{0 או 5}, \\quad 10:\\text{0}',
        explanation: 'סימני ההתחלקות עוזרים לדעת מראש אם תהיה שארית בחילוק.',
      },
    ],
  },
  'g4-perimeter-area': {
    title: 'נוסחאות היקף ושטח',
    formulas: [
      {
        id: 'g4-rect',
        title: 'מלבן (צלעות $a, b$)',
        latex: 'P = 2(a + b), \\qquad S = a \\cdot b',
        explanation: 'היקף המלבן הוא סכום כל צלעותיו, והשטח הוא מכפלת האורך ברוחב.',
      },
      {
        id: 'g4-square',
        title: 'ריבוע (צלע $a$)',
        latex: 'P = 4a, \\qquad S = a^2',
        explanation: 'לריבוע ארבע צלעות שוות באורכן.',
      },
      {
        id: 'g4-right-tri',
        title: 'משולש ישר-זווית (ניצבים $a, b$)',
        latex: 'S = \\frac{a \\cdot b}{2}',
        explanation: 'שטח משולש ישר-זווית הוא מחצית שטח המלבן המתאים לו.',
      },
    ],
  },

  // ===== כיתה ה׳ =====
  'g5-decimals': {
    title: 'שברים עשרוניים',
    formulas: [
      {
        id: 'g5-dec-frac',
        title: 'המרה משבר עשרוני לפשוט',
        latex: '0.a = \\frac{a}{10}, \\qquad 0.ab = \\frac{ab}{100}, \\qquad 0.abc = \\frac{abc}{1000}',
        explanation: 'מספר הספרות מימין לנקודה קובע את חזקת ה-10 במכנה.',
      },
      {
        id: 'g5-dec-shift',
        title: 'כפל וחילוק ב-10, 100, 1000',
        latex: '\\times 10^n \\Rightarrow \\text{נקודה ימינה}, \\qquad \\div 10^n \\Rightarrow \\text{נקודה שמאלה}',
        explanation: 'מזיזים את הנקודה העשרונית כמספר האפסים.',
        example: '$2.45 \\times 100 = 245$',
      },
    ],
  },
  'g5-fractions-ops': {
    title: 'פעולות בשברים',
    formulas: [
      {
        id: 'g5-frac-add',
        title: 'חיבור וחיסור במכנים שונים',
        latex: '\\frac{a}{b} \\pm \\frac{c}{d} = \\frac{ad \\pm bc}{bd}',
        explanation: 'מוצאים מכנה משותף, מרחיבים את השברים, ורק אז מחברים או מחסרים מונים.',
      },
      {
        id: 'g5-frac-mult',
        title: 'כפל שברים',
        latex: '\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{a \\cdot c}{b \\cdot d}',
        explanation: 'כופלים מונה במונה ומכנה במכנה (רצוי לצמצם באלכסון לפני הכפל).',
      },
      {
        id: 'g5-frac-div',
        title: 'חילוק שברים (כפל בהופכי)',
        latex: '\\frac{a}{b} \\div \\frac{c}{d} = \\frac{a}{b} \\cdot \\frac{d}{c}',
        explanation: 'כדי לחלק בשבר, כופלים בשבר ההופכי שלו.',
      },
    ],
  },
  'g5-angles': {
    title: 'זוויות במצולעים ובמישור',
    formulas: [
      {
        id: 'g5-angle-types',
        title: 'סוגי זוויות',
        latex: '\\text{חדה } (<90^\\circ), \\; \\text{ישרה } (=90^\\circ), \\; \\text{קהה } (90^\\circ<\\alpha<180^\\circ), \\; \\text{שטוחה } (=180^\\circ)',
        explanation: 'סיווג זוויות לפי גודלן במעלות.',
      },
      {
        id: 'g5-triangle-sum',
        title: 'סכום זוויות במשולש ומרובע',
        latex: '\\alpha + \\beta + \\gamma = 180^\\circ \\; (\\text{משולש}), \\qquad \\Sigma = 360^\\circ \\; (\\text{מרובע})',
        explanation: 'סכום הזוויות הפנימיות במשולש הוא תמיד $180^\\circ$, ובמרובע $360^\\circ$.',
      },
      {
        id: 'g5-adjacent',
        title: 'זוויות צמודות וקודקודיות',
        latex: '\\alpha + \\beta = 180^\\circ \\; (\\text{צמודות}), \\qquad \\alpha = \\gamma \\; (\\text{קודקודיות})',
        explanation: 'זוויות צמודות משלימות ל-$180^\\circ$; זוויות קודקודיות שוות זו לזו.',
      },
    ],
  },

  // ===== כיתה ו׳ =====
  'g6-percentages': {
    title: 'נוסחאות אחוזים',
    formulas: [
      {
        id: 'g6-pct-part',
        title: 'מציאת ערך האחוז (החלק)',
        latex: '\\text{חלק} = \\frac{p}{100} \\cdot \\text{שלם}',
        explanation: 'ממירים את האחוז לשבר חלקי 100 וכופלים בכמות השלמה.',
        example: '$25\\% \\text{ מ-} 80 = \\frac{25}{100} \\cdot 80 = 20$',
      },
      {
        id: 'g6-pct-rate',
        title: 'מציאת שיעור האחוז',
        latex: 'p\\% = \\frac{\\text{חלק}}{\\text{שלם}} \\cdot 100\\%',
        explanation: 'מחלקים את החלק בשלם וכופלים ב-100 כדי לקבל אחוז.',
      },
      {
        id: 'g6-pct-change',
        title: 'הנחה והתייקרות',
        latex: '\\text{מחיר חדש} = \\text{מקורי} \\cdot \\left(1 \\pm \\frac{p}{100}\\right)',
        explanation: 'בהתייקרות מוסיפים את האחוז, ובהנחה מחסרים את האחוז מ-100%.',
      },
    ],
  },
  'g6-ratio': {
    title: 'יחס, פרופורציה וקנה מידה',
    formulas: [
      {
        id: 'g6-ratio-prop',
        title: 'כפל בהצלבה בפרופורציה',
        latex: '\\frac{a}{b} = \\frac{c}{d} \\iff a \\cdot d = b \\cdot c',
        explanation: 'שוויון בין שני יחסים נשמר כאשר מכפלות האלכסונים שוות.',
      },
      {
        id: 'g6-ratio-split',
        title: 'חלוקת כמות ביחס נתון $a : b$',
        latex: '\\text{ערך יחידת יחס} = \\frac{\\text{כמות כוללת}}{a + b}',
        explanation: 'סוכמים את חלקי היחס, מוצאים ערך יחידה אחת וכופלים כל חלק.',
      },
      {
        id: 'g6-scale',
        title: 'קנה מידה',
        latex: '\\text{קנה מידה} = \\frac{\\text{אורך בשרטוט}}{\\text{אורך במציאות}}',
        explanation: 'חשוב להשתמש באותן יחידות מידה (למשל סנטימטרים) לפני החישוב.',
      },
    ],
  },
  'g6-circle': {
    title: 'נוסחאות המעגל והעיגול',
    formulas: [
      {
        id: 'g6-circle-diam',
        title: 'רדיוס ($r$) וקוטר ($d$)',
        latex: 'd = 2r, \\qquad r = \\frac{d}{2}',
        explanation: 'הקוטר עובר דרך מרכז המעגל ואורכו כפול מהרדיוס.',
      },
      {
        id: 'g6-circle-circ',
        title: 'היקף המעגל ($P$ או $C$)',
        latex: 'C = 2\\pi r = \\pi d \\qquad (\\pi \\approx 3.14)',
        explanation: 'היחס בין היקף כל מעגל לקוטרו שווה לקבוע פאי ($\\pi$).',
      },
      {
        id: 'g6-circle-area',
        title: 'שטח העיגול ($S$)',
        latex: 'S = \\pi r^2',
        explanation: 'מעלים את הרדיוס בריבוע וכופלים בפאי.',
        example: 'עבור $r=5$: $S = 25\\pi \\approx 78.5$',
      },
    ],
  },

  // ===== כיתה ז׳ =====
  'g7-algebra-intro': {
    title: 'חוקי אלגברה וכינוס איברים',
    formulas: [
      {
        id: 'g7-dist',
        title: 'חוק הפילוג (פתיחת סוגריים)',
        latex: 'a(b + c) = ab + ac, \\qquad a(b - c) = ab - ac',
        explanation: 'כופלים את הגורם שמחוץ לסוגריים בכל איבר שבתוך הסוגריים.',
      },
      {
        id: 'g7-like-terms',
        title: 'כינוס איברים דומים',
        latex: 'ax + bx = (a + b)x',
        explanation: 'מחברים או מחסרים רק איברים בעלי אותו משתנה ואותה חזקה.',
      },
      {
        id: 'g7-minus-parens',
        title: 'מינוס לפני סוגריים',
        latex: '-(a - b) = -a + b',
        explanation: 'סימן מינוס לפני סוגריים הופך את הסימן של כל איבר בתוך הסוגריים.',
      },
    ],
  },
  'g7-signed-numbers': {
    title: 'כללי מספרים מכוונים',
    formulas: [
      {
        id: 'g7-mult-signs',
        title: 'כללי סימנים בכפל וחילוק',
        latex: '(+)\\cdot(+)=+, \\; (-)\\cdot(-)=+, \\; (+)\\cdot(-)=-, \\; (-)\\cdot(+)=-',
        explanation: 'שני סימנים זהים נותנים תוצאה חיובית; סימנים הפוכים נותנים תוצאה שלילית.',
      },
      {
        id: 'g7-sub-signed',
        title: 'חיסור של מספר שלילי',
        latex: 'a - (-b) = a + b, \\qquad a + (-b) = a - b',
        explanation: 'מינוס כפול מינוס הופך לפלוס.',
      },
      {
        id: 'g7-abs',
        title: 'ערך מוחלט',
        latex: '|x| = \\begin{cases} x & x \\ge 0 \\\\ -x & x < 0 \\end{cases}',
        explanation: 'המרחק של המספר מהאפס על ציר המספרים (תמיד אי-שלילי).',
      },
    ],
  },
  'g7-equations': {
    title: 'פתרון משוואות במעלה ראשונה',
    formulas: [
      {
        id: 'g7-eq-std',
        title: 'צורה כללית ופתרון',
        latex: 'ax + b = c \\implies x = \\frac{c - b}{a} \\quad (a \\neq 0)',
        explanation: 'מבודדים את המשתנה באמצעות העברת אגפים (שינוי סימן) וחילוק במקדם.',
      },
      {
        id: 'g7-eq-special',
        title: 'מקרים מיוחדים במשוואות',
        latex: '0 \\cdot x = 0 \\; (\\text{אינסוף פתרונות}), \\qquad 0 \\cdot x = k \\neq 0 \\; (\\text{אין פתרון})',
        explanation: 'כאשר הנעלם מצטמצם: פסוק אמת מעיד על אינסוף פתרונות, ופסוק שקר על אף פתרון.',
      },
    ],
  },

  // ===== כיתה ח׳ =====
  'g8-functions': {
    title: 'נוסחאות הפונקציה הקווית',
    formulas: [
      {
        id: 'g8-line-eq',
        title: 'משוואת הישר',
        latex: 'y = mx + b',
        explanation: '$m$ הוא השיפוע, ו-$b$ הוא ערך ה-$y$ של נקודת החיתוך עם ציר $y$ — $(0, b)$.',
      },
      {
        id: 'g8-slope',
        title: 'חישוב שיפוע לפי שתי נקודות',
        latex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}',
        explanation: 'השיפוע מודד את השינוי ב-$y$ חלקי השינוי ב-$x$.',
      },
      {
        id: 'g8-parallel-perp',
        title: 'ישרים מקבילים וישרים נחתכים',
        latex: 'm_1 = m_2 \\; (\\text{מקבילים}), \\qquad m_1 \\cdot m_2 = -1 \\; (\\text{מאונכים})',
        explanation: 'ישרים מקבילים בעלי שיפוע זהה; לישרים מאונכים שיפועים הופכיים ונגדיים.',
      },
    ],
  },
  'g8-systems': {
    title: 'מערכת שתי משוואות ליניאריות',
    formulas: [
      {
        id: 'g8-sys-form',
        title: 'מערכת משוואות בשני נעלמים',
        latex: '\\begin{cases} a_1x + b_1y = c_1 \\\\ a_2x + b_2y = c_2 \\end{cases}',
        explanation: 'הפתרון $(x, y)$ מקיים את שתי המשוואות יחד ומייצג את נקודת החיתוך של שני הישרים.',
      },
      {
        id: 'g8-sys-cases',
        title: 'מספר פתרונות לפי שיפועים',
        latex: 'm_1 \\neq m_2 \\Rightarrow \\text{פתרון יחיד}, \\quad m_1=m_2, b_1\\neq b_2 \\Rightarrow \\text{אין פתרון}',
        explanation: 'ישרים מקבילים שונים אינם נחתכים; ישרים מתלכדים ($m_1=m_2, b_1=b_2$) נותנים אינסוף פתרונות.',
      },
    ],
  },
  'g8-pythagoras': {
    title: 'משפט פיתגורס והפוך לו',
    formulas: [
      {
        id: 'g8-pyth-main',
        title: 'משפט פיתגורס (במשולש ישר-זווית)',
        latex: 'a^2 + b^2 = c^2',
        explanation: 'סכום ריבועי הניצבים ($a, b$) שווה לריבוע היתר ($c$).',
        example: 'שלשות נפוצות: $(3,4,5)$, $(5,12,13)$, $(8,15,17)$',
      },
      {
        id: 'g8-pyth-leg',
        title: 'מציאת ניצב חסר',
        latex: 'a = \\sqrt{c^2 - b^2}',
        explanation: 'כדי למצוא ניצב, מחסרים מריבוע היתר את ריבוע הניצב הנתון ומוציאים שורש.',
      },
    ],
  },

  // ===== כיתה ט׳ =====
  'g9-powers-roots': {
    title: 'חוקי חזקות ושורשים',
    formulas: [
      {
        id: 'g9-pow-mult-div',
        title: 'כפל וחילוק חזקות באותו בסיס',
        latex: 'a^m \\cdot a^n = a^{m+n}, \\qquad \\frac{a^m}{a^n} = a^{m-n} \\quad (a \\neq 0)',
        explanation: 'בכפל בסיסים זהים מחברים מעריכים; בחילוק מחסרים מעריכים.',
      },
      {
        id: 'g9-pow-power',
        title: 'חזקה של חזקה, מכפלה ומנה',
        latex: '(a^m)^n = a^{m \\cdot n}, \\qquad (a \\cdot b)^n = a^n \\cdot b^n, \\qquad \\left(\\frac{a}{b}\\right)^n = \\frac{a^n}{b^n}',
        explanation: 'חזקה על סוגריים של כפל או חילוק חלה על כל גורם בפנים.',
      },
      {
        id: 'g9-pow-zero-neg',
        title: 'חזקת אפס ומעריך שלילי',
        latex: 'a^0 = 1 \\; (a \\neq 0), \\qquad a^{-n} = \\frac{1}{a^n}, \\qquad \\left(\\frac{a}{b}\\right)^{-n} = \\left(\\frac{b}{a}\\right)^n',
        explanation: 'מעריך שלילי הופך את השבר (הופכי), לא משנה את סימן הבסיס!',
      },
      {
        id: 'g9-root-rules',
        title: 'חוקי שורשים',
        latex: '\\sqrt{a \\cdot b} = \\sqrt{a}\\cdot\\sqrt{b}, \\qquad \\sqrt{\\frac{a}{b}} = \\frac{\\sqrt{a}}{\\sqrt{b}}, \\qquad \\sqrt{a^2} = |a|',
        explanation: 'אסור לפרק שורש על חיבור או חיסור! $\\sqrt{a+b} \\neq \\sqrt{a}+\\sqrt{b}$.',
        example: '$\\sqrt{72} = \\sqrt{36 \\cdot 2} = 6\\sqrt{2}$',
      },
    ],
  },
  'g9-factoring': {
    title: 'נוסחאות פירוק לגורמים וטרינום',
    formulas: [
      {
        id: 'g9-fact-common',
        title: 'הוצאת גורם משותף',
        latex: 'ab + ac = a(b + c)',
        explanation: 'תמיד בודקים תחילה הוצאת המספר הגדול ביותר והמשתנה בחזקה הנמוכה ביותר.',
        example: '$6x^3 - 15x^2 = 3x^2(2x - 5)$',
      },
      {
        id: 'g9-fact-grouping',
        title: 'פירוק בקבוצות (4 איברים)',
        latex: 'ax + ay + bx + by = a(x + y) + b(x + y) = (x + y)(a + b)',
        explanation: 'מחלקים לזוגות, מוציאים גורם משותף מכל זוג ומזהים סוגריים משותפים.',
      },
      {
        id: 'g9-fact-reverse-sign',
        title: 'היפוך סימן בסוגריים נגדיים',
        latex: '(b - a) = -(a - b)',
        explanation: 'מאפשר להשוות סוגריים הפוכי סימן ולהוציאם כגורם משותף.',
        example: '$2x(x - 3) + 5(3 - x) = (x - 3)(2x - 5)$',
      },
      {
        id: 'g9-fact-trinomial',
        title: 'טרינום פשוט ($a = 1$)',
        latex: 'x^2 + bx + c = (x + p)(x + q) \\iff \\begin{cases} p + q = b \\\\ p \\cdot q = c \\end{cases}',
        explanation: 'מחפשים שני מספרים שסכומם הוא המקדם של $x$ ומכפלתם היא האיבר החופשי.',
        example: '$x^2 - 5x + 6 = (x - 2)(x - 3)$',
      },
      {
        id: 'g9-fact-diff-sq',
        title: 'הפרש ריבועים',
        latex: 'a^2 - b^2 = (a - b)(a + b)',
        explanation: 'הפרש בין שני ביטויים ריבועיים מתפרק למכפלת ההפרש בסכום.',
      },
      {
        id: 'g9-fact-split',
        title: 'פירוק טרינום מתקדם ($ax^2 + bx + c$)',
        latex: 'p + q = b, \\quad p \\cdot q = a \\cdot c \\implies ax^2 + px + qx + c',
        explanation: 'מפצלים את האיבר האמצעי לשני חלקים שמכפלת מקדמיהם $a \\cdot c$ ומוציאים גורם משותף בקבוצות.',
      },
      {
        id: 'g9-fact-roots',
        title: 'משוואת מכפלה ונקודות אפס',
        latex: '(x - x_1)(x - x_2) = 0 \\iff x = x_1 \\; \\text{או} \\; x = x_2',
        explanation: 'מכפלה שווה לאפס רק אם לפחות אחד מהגורמים שלה שווה לאפס.',
      },
    ],
  },
  'g9-short-formulas': {
    title: 'נוסחאות הכפל המקוצר',
    formulas: [
      {
        id: 'g9-sf-sum',
        title: 'ריבוע של סכום',
        latex: '(a + b)^2 = a^2 + 2ab + b^2',
        explanation: 'אסור לשכוח את האיבר האמצעי $2ab$!',
        example: '$(x + 5)^2 = x^2 + 10x + 25$',
      },
      {
        id: 'g9-sf-diff',
        title: 'ריבוע של הפרש',
        latex: '(a - b)^2 = a^2 - 2ab + b^2',
        explanation: 'האיבר האחרון $b^2$ הוא תמיד חיובי; רק האיבר האמצעי $-2ab$ שלילי.',
      },
      {
        id: 'g9-sf-sq-diff',
        title: 'הפרש ריבועים',
        latex: '(a - b)(a + b) = a^2 - b^2',
        explanation: 'כפל של סכום בהפרש מבטל את האיברים האמצעיים ומשאיר הפרש ריבועים.',
      },
    ],
  },
  'g9-algebraic-fractions': {
    title: 'שברים אלגבריים ומשוואות שבריות',
    formulas: [
      {
        id: 'g9-af-domain',
        title: 'תחום הצבה (תחום הגדרה)',
        latex: '\\frac{P(x)}{Q(x)} \\implies Q(x) \\neq 0',
        explanation: 'תמיד מפרקים את כל המכנים לגורמים וקובעים אילו ערכים של $x$ מאפסים אותם לפני צמצום.',
      },
      {
        id: 'g9-af-ops',
        title: 'כפל וחילוק שברים אלגבריים',
        latex: '\\frac{A}{B} \\cdot \\frac{C}{D} = \\frac{A \\cdot C}{B \\cdot D}, \\qquad \\frac{A}{B} : \\frac{C}{D} = \\frac{A}{B} \\cdot \\frac{D}{C}',
        explanation: 'בכפל וחילוק מפרקים מונים ומכנים לגורמים, הופכים את השבר המחלק ומצמצמים.',
      },
      {
        id: 'g9-af-add',
        title: 'חיבור, חיסור ומשוואה שברית',
        latex: '\\frac{A}{C} \\pm \\frac{B}{C} = \\frac{A \\pm B}{C}',
        explanation: 'מפרקים מכנים לגורמים, מוצאים מכנה משותף, כופלים ובמשוואה פוסלים פתרון מחוץ לתחום ההצבה.',
      },
    ],
  },
  'g9-inequalities': {
    title: 'אי-שוויונות ליניאריים וריבועיים',
    formulas: [
      {
        id: 'g9-ineq-flip',
        title: 'היפוך סימן בכפל או חילוק בשלילי',
        latex: 'a < b \\text{ וגם } c < 0 \\implies a \\cdot c > b \\cdot c',
        explanation: 'כאשר כופלים או מחלקים אי-שוויון במספר שלילי, כיוון אי-השוויון מתהפך.',
      },
      {
        id: 'g9-ineq-and-or',
        title: 'מערכת "וגם" לעומת מערכת "או"',
        latex: '\\text{חיתוך (וגם)}: A \\cap B, \\qquad \\text{איחוד (או)}: A \\cup B',
        explanation: 'במערכת "וגם" לוקחים רק את התחום המשותף לשני התנאים; במערכת "או" מאחדים את התחומים.',
      },
      {
        id: 'g9-ineq-quad',
        title: 'אי-שוויון ריבועי בעזרת פרבולה',
        latex: 'a(x - x_1)(x - x_2) > 0 \\; (a > 0, x_1 < x_2) \\iff x < x_1 \\text{ או } x > x_2',
        explanation: 'מציירים סקיצה של הפרבולה לפי צחוק/בכי ונקודות החיתוך עם ציר $x$, וקוראים מעל/מתחת לציר.',
      },
    ],
  },
  'g9-quadratic': {
    title: 'נוסחאות הפרבולה והמשוואה הריבועית',
    formulas: [
      {
        id: 'g9-quad-formula',
        title: 'נוסחת השורשים',
        latex: 'x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
        explanation: 'פותרת כל משוואה ריבועית מהצורה $ax^2 + bx + c = 0$ ($a \\neq 0$).',
      },
      {
        id: 'g9-quad-disc',
        title: 'הדיסקרימיננטה ($\\Delta$)',
        latex: '\\Delta = b^2 - 4ac',
        explanation: '$\\Delta > 0$: 2 פתרונות; $\\Delta = 0$: פתרון יחיד; $\\Delta < 0$: אין פתרון ממשי.',
      },
      {
        id: 'g9-quad-vertex',
        title: 'קודקוד הפרבולה והצגה קודקודית',
        latex: 'x_v = -\\frac{b}{2a}, \\quad y_v = f(x_v), \\qquad y = a(x - p)^2 + k',
        explanation: 'בהצגה קודקודית $y = a(x - p)^2 + k$ הקודקוד נקרא ישירות: $(p, k)$.',
      },
      {
        id: 'g9-quad-vieta',
        title: 'הצגה מכפלתית ונוסחאות וייטה',
        latex: 'y = a(x - x_1)(x - x_2), \\qquad x_1 + x_2 = -\\frac{b}{a}, \\quad x_1 \\cdot x_2 = \\frac{c}{a}',
        explanation: 'מקשרות בין שורשי המשוואה לפרבולה ולמקדמים $a, b, c$.',
      },
    ],
  },
  'g9-quadrilaterals': {
    title: 'נוסחאות מרובעים מיוחדים',
    formulas: [
      {
        id: 'g9-quad-sum',
        title: 'סכום זוויות במרובע והיקף/שטח מקבילית',
        latex: '\\sum \\sphericalangle = 360^\\circ, \\qquad S_{\\text{מקבילית}} = a \\cdot h_a',
        explanation: 'סכום הזוויות בכל מרובע קמור הוא $360^\\circ$; שטח מקבילית הוא צלע כפול גובה לצלע.',
      },
      {
        id: 'g9-quad-rhombus',
        title: 'שטח מעוין וריבוע לפי אלכסונים',
        latex: 'S_{\\text{מעוין}} = \\frac{d_1 \\cdot d_2}{2}, \\qquad d_{\\text{ריבוע}} = a\\sqrt{2}',
        explanation: 'במעוין ובריבוע האלכסונים מאונכים זה לזה; בריבוע הם גם שווים.',
      },
      {
        id: 'g9-quad-trap',
        title: 'שטח טרפז',
        latex: 'S_{\\text{טרפז}} = \\frac{(a + b) \\cdot h}{2}',
        explanation: 'ממוצע הבסיסים המקבילים ($a$ ו-$b$) כפול הגובה ($h$).',
      },
    ],
  },
  'g9-thales-midsegment': {
    title: 'קטע אמצעים ומשפט תאלס',
    formulas: [
      {
        id: 'g9-mid-tri',
        title: 'קטע אמצעים במשולש',
        latex: 'DE \\parallel BC \\quad \\text{וגם} \\quad DE = \\frac{1}{2}BC',
        explanation: 'קטע המחבר אמצעי שתי צלעות במשולש מקביל לצלע השלישית ושווה למחציתה.',
      },
      {
        id: 'g9-mid-trap',
        title: 'קטע אמצעים בטרפז',
        latex: 'MN \\parallel AD \\parallel BC, \\qquad MN = \\frac{AD + BC}{2}',
        explanation: 'קטע המחבר את אמצעי שוקי הטרפז מקביל לבסיסים ושווה לממוצע אורכיהם.',
      },
      {
        id: 'g9-thales-ext',
        title: 'משפט תאלס והרחבה ראשונה',
        latex: 'DE \\parallel BC \\implies \\frac{AD}{DB} = \\frac{AE}{EC}, \\qquad \\frac{AD}{AB} = \\frac{AE}{AC} = \\frac{DE}{BC}',
        explanation: 'ליחס הצלעות החתוכות משתמשים בחלקים; לחישוב הבסיסים המקבילים חייבים לקחת חלק חלקי שלם!',
      },
    ],
  },
  'g9-geometry': {
    title: 'דמיון משולשים ופרופורציה',
    formulas: [
      {
        id: 'g9-sim-ratio',
        title: 'יחס דמיון ($k$) בצלעות',
        latex: '\\frac{AB}{DE} = \\frac{BC}{EF} = \\frac{AC}{DF} = k',
        explanation: 'במשולשים דומים הזוויות המתאימות שוות והצלעות המתאימות ביחס קבוע $k$.',
      },
      {
        id: 'g9-sim-area',
        title: 'יחס היקפים ויחס שטחים',
        latex: '\\frac{P_1}{P_2} = k, \\qquad \\frac{S_1}{S_2} = k^2',
        explanation: 'יחס השטחים בין משולשים דומים שווה לריבוע יחס הדמיון.',
      },
      {
        id: 'g9-sim-crit',
        title: 'משפטי דמיון',
        latex: '\\text{ז.ז (AA)}, \\qquad \\text{צ.ז.צ (SAS)}, \\qquad \\text{צ.צ.צ (SSS)}',
        explanation: 'מספיקות שתי זוויות שוות בהתאמה כדי להוכיח דמיון משולשים.',
      },
    ],
  },
  'g9-probability': {
    title: 'הסתברות וסטטיסטיקה',
    formulas: [
      {
        id: 'g9-prob-def',
        title: 'הסתברות מאורע שווה-הסתברות',
        latex: 'P(A) = \\frac{|A|}{|\\Omega|} = \\frac{\\text{תוצאות רצויות}}{\\text{כל התוצאות האפשריות}}',
        explanation: 'ערך ההסתברות נמצא תמיד בטווח $0 \\le P(A) \\le 1$.',
      },
      {
        id: 'g9-prob-comp',
        title: 'המאורע המשלים',
        latex: 'P(\\overline{A}) = 1 - P(A)',
        explanation: 'ההסתברות שמאורע לא יתרחש שווה ל-1 פחות ההסתברות שיתרחש.',
      },
      {
        id: 'g9-prob-indep',
        title: 'הסתברות דו-שלבית (וגם / בלי החזרה)',
        latex: 'P(A \\text{ וגם } B) = P(A) \\cdot P(B \\mid A)',
        explanation: 'לאורך ענף בעץ כופלים הסתברויות; בלי החזרה המכנה (ולעיתים המונה) קטן ב-1 בשלב השני.',
      },
      {
        id: 'g9-stat-avg',
        title: 'ממוצע משוקלל, חציון ושכיח',
        latex: '\\bar{x} = \\frac{\\sum (x_i \\cdot f_i)}{\\sum f_i}',
        explanation: 'כופלים כל ערך בשכיחותו, סוכמים, ומחלקים בסך כל התצפיות.',
      },
    ],
  },

  // ===== כיתה י׳ =====
  'g10-analytic': {
    title: 'נוסחאות גאומטריה אנליטית',
    formulas: [
      {
        id: 'g10-dist',
        title: 'מרחק בין שתי נקודות',
        latex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}',
        explanation: 'אורך הקטע המחבר בין $A(x_1, y_1)$ ל-$B(x_2, y_2)$.',
      },
      {
        id: 'g10-mid',
        title: 'נקודת אמצע קטע',
        latex: 'M = \\left(\\frac{x_1 + x_2}{2}, \\; \\frac{y_1 + y_2}{2}\\right)',
        explanation: 'ממוצע שיעורי ה-$x$ וממוצע שיעורי ה-$y$ של קצות הקטע.',
      },
      {
        id: 'g10-line-point',
        title: 'משוואת ישר לפי נקודה ושיפוע',
        latex: 'y - y_1 = m(x - x_1)',
        explanation: 'מאפשרת לבנות ישירות משוואת ישר מנקודה אחת ושיפוע $m$.',
      },
      {
        id: 'g10-circle',
        title: 'משוואת מעגל קנונית',
        latex: '(x - a)^2 + (y - b)^2 = R^2',
        explanation: 'מעגל שמרכזו ב-$(a, b)$ ורדיוסו $R$.',
      },
    ],
  },
  'g10-trig': {
    title: 'נוסחאות טריגונומטריה',
    formulas: [
      {
        id: 'g10-trig-defs',
        title: 'יחסים במשולש ישר-זווית',
        latex: '\\sin\\alpha = \\frac{\\text{מול}}{\\text{יתר}}, \\quad \\cos\\alpha = \\frac{\\text{ליד}}{\\text{יתר}}, \\quad \\tan\\alpha = \\frac{\\text{מול}}{\\text{ליד}}',
        explanation: 'הפונקציות הטריגונומטריות הבסיסיות לזווית חדה $\\alpha$.',
      },
      {
        id: 'g10-trig-id',
        title: 'הזהות היסודית',
        latex: '\\sin^2\\alpha + \\cos^2\\alpha = 1, \\qquad \\tan\\alpha = \\frac{\\sin\\alpha}{\\cos\\alpha}',
        explanation: 'מתקיימת עבור כל זווית $\\alpha$.',
      },
      {
        id: 'g10-trig-area',
        title: 'שטח משולש ומשפט הסינוסים',
        latex: 'S = \\frac{1}{2}ab\\sin\\gamma, \\qquad \\frac{a}{\\sin\\alpha} = \\frac{b}{\\sin\\beta} = \\frac{c}{\\sin\\gamma} = 2R',
        explanation: 'נוסחת השטח והסינוסים תקפות לכל משולש (לא רק ישר-זווית).',
      },
    ],
  },
  'g10-algebra': {
    title: 'טכניקה אלגברית ושברים אלגבריים',
    formulas: [
      {
        id: 'g10-alg-frac',
        title: 'תחום הצבה וצמצום שבר אלגברי',
        latex: '\\frac{P(x)}{Q(x)} \\implies Q(x) \\neq 0',
        explanation: 'תמיד מוצאים תחום הצבה מהמכנה המקורי לפני צמצום גורמים משותפים.',
      },
      {
        id: 'g10-alg-ineq',
        title: 'אי-שוויונות (שינוי סימן)',
        latex: 'a < b \\text{ וגם } c < 0 \\implies ac > bc',
        explanation: 'בעת כפל או חילוק של אי-שוויון במספר שלילי, כיוון האי-שוויון מתהפך.',
      },
      {
        id: 'g10-alg-exp',
        title: 'חוקי חזקות ושורשים',
        latex: 'a^m \\cdot a^n = a^{m+n}, \\quad \\frac{a^m}{a^n} = a^{m-n}, \\quad (a^m)^n = a^{mn}, \\quad a^{-n} = \\frac{1}{a^n}',
        explanation: 'שליטה בחוקי החזקות חיונית לפישוט ביטויים ומשוואות מעריכיות.',
      },
    ],
  },

  // ===== כיתה י״א =====
  'g11-calculus': {
    title: 'נוסחאות חשבון דיפרנציאלי (נגזרות)',
    formulas: [
      {
        id: 'g11-der-pow',
        title: 'נגזרת של חזקה וקבוע',
        latex: '(c)\' = 0, \\qquad (x^n)\' = n \\cdot x^{n-1}, \\qquad (\\sqrt{x})\' = \\frac{1}{2\\sqrt{x}}',
        explanation: 'כללי הגזירה הבסיסיים ביותר.',
      },
      {
        id: 'g11-der-prod-quot',
        title: 'נגזרת מכפלה ומנה',
        latex: '(u \\cdot v)\' = u\'v + uv\', \\qquad \\left(\\frac{u}{v}\\right)\' = \\frac{u\'v - uv\'}{v^2}',
        explanation: 'שימו לב לסימן המינוס במונה של נגזרת המנה.',
      },
      {
        id: 'g11-der-chain',
        title: 'כלל השרשרת (פונקציה מורכבת)',
        latex: '\\big(f(g(x))\\big)\' = f\'(g(x)) \\cdot g\'(x)',
        explanation: 'גוזרים את הפונקציה החיצונית וכופלים בנגזרת הפנימית.',
      },
      {
        id: 'g11-der-extrema',
        title: 'חקירת קיצון ומשיק',
        latex: 'f\'(x_0) = m_{\\text{משיק}}, \\qquad f\'(x_0) = 0 \\; (\\text{חשודה לקיצון})',
        explanation: 'אם $f\'\'(x_0) > 0$ — מינימום; אם $f\'\'(x_0) < 0$ — מקסימום.',
      },
    ],
  },
  'g11-word-problems': {
    title: 'נוסחאות לבעיות מילוליות',
    formulas: [
      {
        id: 'g11-wp-motion',
        title: 'בעיות תנועה',
        latex: 'S = V \\cdot t, \\qquad V = \\frac{S}{t}, \\qquad t = \\frac{S}{V}',
        explanation: 'דרך ($S$) שווה מהירות ($V$) כפול זמן ($t$). הקפידו על יחידות תואמות.',
      },
      {
        id: 'g11-wp-work',
        title: 'בעיות הספק ועבודה',
        latex: 'W = P \\cdot t, \\qquad P_{\\text{משותף}} = P_1 + P_2',
        explanation: 'כששני גורמים עובדים יחד, מחברים את ההספקים שלהם (ולא את הזמנים).',
      },
      {
        id: 'g11-wp-mix',
        title: 'בעיות קנייה, מכירה ואחוזים',
        latex: '\\text{רווח} = \\text{פדיון} - \\text{עלות}, \\qquad \\text{מחיר לאחר שינוי} = M \\cdot (1 \\pm r)',
        explanation: 'קשר בסיסי לבניית משוואה מתוך טקסט כלכלי.',
      },
    ],
  },
  'g11-sequence': {
    title: 'נוסחאות סדרות',
    formulas: [
      {
        id: 'g11-seq-arith',
        title: 'סדרה חשבונית (הפרש $d$)',
        latex: 'a_n = a_1 + (n-1)d, \\qquad S_n = \\frac{n(a_1 + a_n)}{2} = \\frac{n[2a_1 + (n-1)d]}{2}',
        explanation: 'ההפרש בין כל שני איברים עוקבים הוא קבוע: $a_{n+1} - a_n = d$.',
      },
      {
        id: 'g11-seq-geom',
        title: 'סדרה הנדסית (מנה $q \\neq 1$)',
        latex: 'a_n = a_1 \\cdot q^{n-1}, \\qquad S_n = \\frac{a_1(q^n - 1)}{q - 1}',
        explanation: 'המנה בין כל שני איברים עוקבים קבועה: $\\frac{a_{n+1}}{a_n} = q$.',
      },
      {
        id: 'g11-seq-inf',
        title: 'סדרה הנדסית אינסופית מתכנסת ($|q| < 1$)',
        latex: 'S_{\\infty} = \\frac{a_1}{1 - q}',
        explanation: 'תקף רק כאשר המנה $q$ מקיימת $-1 < q < 1$.',
      },
    ],
  },

  // ===== כיתה י״ב =====
  'g12-integral': {
    title: 'נוסחאות אינטגרלים ושטחים',
    formulas: [
      {
        id: 'g12-int-pow',
        title: 'אינטגרל של חזקה ($n \\neq -1$)',
        latex: '\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C',
        explanation: 'מעלים את החזקה ב-1 ומחלקים בחזקה החדשה; באינטגרל לא מסוים מוסיפים קבוע $C$.',
      },
      {
        id: 'g12-int-lin',
        title: 'אינטגרל של פונקציה ליניארית מורכבת',
        latex: '\\int (ax+b)^n\\,dx = \\frac{(ax+b)^{n+1}}{a(n+1)} + C',
        explanation: 'מחלקים גם במקדם הפנימי $a$.',
      },
      {
        id: 'g12-int-trig',
        title: 'אינטגרלים טריגונומטריים בסיסיים',
        latex: '\\int \\sin x\\,dx = -\\cos x + C, \\qquad \\int \\cos x\\,dx = \\sin x + C',
        explanation: 'פעולה הפוכה לגזירת סינוס וקוסינוס.',
      },
      {
        id: 'g12-int-area',
        title: 'שטח כלוא בין שתי עקומות',
        latex: 'S = \\int_a^b \\big(f(x) - g(x)\\big)\\,dx \\qquad (f(x) \\ge g(x))',
        explanation: 'מחשבים אינטגרל מסוים של הפונקציה העליונה פחות הפונקציה התחתונה.',
      },
    ],
  },
  'g12-vectors': {
    title: 'נוסחאות וקטורים',
    formulas: [
      {
        id: 'g12-vec-len',
        title: 'אורך וקטור (נורמה)',
        latex: '|\\vec{u}| = \\sqrt{x^2 + y^2 + z^2}',
        explanation: 'אורך של וקטור במרחב התלת-ממדי.',
      },
      {
        id: 'g12-vec-dot',
        title: 'מכפלה סקלרית וזווית בין וקטורים',
        latex: '\\vec{u} \\cdot \\vec{v} = x_1x_2 + y_1y_2 + z_1z_2 = |\\vec{u}|\\cdot|\\vec{v}|\\cos\\theta',
        explanation: 'וקטורים מאונכים זה לזה אם ורק אם מכפלתם הסקלרית שווה לאפס ($\\vec{u}\\cdot\\vec{v}=0$).',
      },
      {
        id: 'g12-vec-line',
        title: 'הצגה פרמטרית של ישר',
        latex: '\\vec{r} = \\vec{P}_0 + t\\vec{v} \\qquad (t \\in \\mathbb{R})',
        explanation: 'ישר העובר בנקודה $P_0$ בכיוון הווקטור $\\vec{v}$.',
      },
    ],
  },
  'g12-complex': {
    title: 'נוסחאות מספרים מרוכבים',
    formulas: [
      {
        id: 'g12-comp-alg',
        title: 'היחידה המדומה וצורה אלגברית',
        latex: 'i^2 = -1, \\qquad z = a + bi, \\qquad \\overline{z} = a - bi',
        explanation: 'מכפלת מספר בצמוד שלו נותנת מספר ממשי: $z \\cdot \\overline{z} = a^2 + b^2$.',
      },
      {
        id: 'g12-comp-polar',
        title: 'הצגה קוטבית (טריגונומטרית)',
        latex: 'z = r(\\cos\\theta + i\\sin\\theta) = r\\operatorname{cis}\\theta, \\qquad r = |z| = \\sqrt{a^2 + b^2}',
        explanation: '$r$ הוא המודול (המרחק מהראשית) ו-$\\theta$ היא הארגומנט (הזווית).',
      },
      {
        id: 'g12-comp-demoivre',
        title: 'כפל ומשפט דה-מואבר',
        latex: 'z^n = r^n(\\cos(n\\theta) + i\\sin(n\\theta))',
        explanation: 'בהעלאה בחזקה $n$ מעלים את הרדיוס בחזקה $n$ וכופלים את הזווית פי $n$.',
      },
    ],
  },
};

export const CATEGORY_FORMULA_FALLBACKS: Record<TopicCategory, FormulaItem[]> = {
  'חשבון יסודי': [
    ...TOPIC_FORMULA_SHEETS['g4-fractions'].formulas,
    ...TOPIC_FORMULA_SHEETS['g6-percentages'].formulas.slice(0, 2),
  ],
  'אלגברה': [
    ...TOPIC_FORMULA_SHEETS['g9-factoring'].formulas.slice(0, 3),
    ...TOPIC_FORMULA_SHEETS['g9-quadratic'].formulas.slice(0, 2),
  ],
  'גיאומטריה': [
    ...TOPIC_FORMULA_SHEETS['g8-pythagoras'].formulas,
    ...TOPIC_FORMULA_SHEETS['g6-circle'].formulas.slice(1),
  ],
  'טריגונומטריה': TOPIC_FORMULA_SHEETS['g10-trig'].formulas,
  'חשבון דיפרנציאלי ואינטגרלי': [
    ...TOPIC_FORMULA_SHEETS['g11-calculus'].formulas.slice(0, 2),
    ...TOPIC_FORMULA_SHEETS['g12-integral'].formulas.slice(0, 2),
  ],
  'הסתברות וסטטיסטיקה': TOPIC_FORMULA_SHEETS['g9-probability'].formulas,
};

export const getFormulaSheetForTopic = (
  topicId?: string,
  topicName?: string,
  category?: TopicCategory
): { topicSheet: TopicFormulaSheet; categoryFormulas: FormulaItem[] } => {
  const direct = topicId ? TOPIC_FORMULA_SHEETS[topicId] : undefined;
  const resolvedCategory: TopicCategory = category || 'אלגברה';
  const categoryFormulas = CATEGORY_FORMULA_FALLBACKS[resolvedCategory] || [];

  if (direct) {
    return {
      topicSheet: direct,
      categoryFormulas,
    };
  }

  return {
    topicSheet: {
      title: topicName ? `דף נוסחאות — ${topicName}` : `דף נוסחאות — ${resolvedCategory}`,
      formulas: categoryFormulas,
    },
    categoryFormulas,
  };
};
