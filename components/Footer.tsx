import React, { useEffect, useRef, useState } from 'react';

type LegalModalType = 'terms' | 'privacy' | 'accessibility' | null;

const MODAL_CONTENT: Record<
  Exclude<LegalModalType, null>,
  { title: string; sections: { heading: string; body: string }[] }
> = {
  terms: {
    title: 'תנאי שימוש',
    sections: [
      {
        heading: '1. כללי והסכמה לתנאים',
        body: 'השימוש באתר [שם האתר / החברה] (MathMaster IL) ובשירותים המוצעים בו כפוף לתנאי שימוש אלה. גלישה באתר או שימוש בתכני הלימוד והתרגול מהווים הסכמה מלאה מצד המשתמש לתנאים המפורטים להלן.',
      },
      {
        heading: '2. מטרת השירות ושימוש מותר',
        body: 'האתר מספק חומרי לימוד, דוגמאות פתורות ומערכת תרגול אינטראקטיבית במתמטיקה לכיתות א׳–י״ב. התכנים מיועדים לשימוש אישי ולימודי בלבד. אין להעתיק, להפיץ או לעשות שימוש מסחרי בתכני האתר ללא אישור מראש ובכתב מאת [שם האתר / החברה].',
      },
      {
        heading: '3. הגבלת אחריות',
        body: 'התכנים והכלים באתר ניתנים לשימוש כמות שהם (AS-IS) למטרות לימוד ותרגול בלבד. מפעילי [שם האתר / החברה] משקיעים מאמצים בדיוק המתמטי והפדגוגי של החומרים, אך אינם נושאים באחריות לנזק ישיר או עקיף שייגרם כתוצאה מהסתמכות על התכנים או מהפסקות זמינות טכניות.',
      },
      {
        heading: '4. יצירת קשר',
        body: 'בכל שאלה הנוגעת לתנאי השימוש ניתן לפנות אל הנהלת האתר בכתובת [דוא"ל ליצירת קשר] (gold.noam@gmail.com).',
      },
    ],
  },
  privacy: {
    title: 'מדיניות פרטיות',
    sections: [
      {
        heading: '1. איסוף ושימוש בנתונים',
        body: '[שם האתר / החברה] מכבד את פרטיות המשתמשים. האתר שומר באופן מקומי בדפדפן המשתמש (LocalStorage ומטמון מקומי) העדפות תצוגה (כגון מצב כהה/בהיר), שיעורים שנפתחו לצורך עבודה לא מקוונת, ונתוני התקדמות אישיים בתרגול.',
      },
      {
        heading: '2. קובצי Cookie ואחסון דינמי',
        body: 'האתר עשוי להשתמש באחסון מקומי (LocalStorage), Service Worker וקובצי Cookie לצורך תפעול תקין, שמירת רצף הלמידה, שיפור חוויית המשתמש והפעלת שירותי צד שלישי משולבים. ניתן למחוק או לחסום אחסון זה בכל עת דרך הגדרות הדפדפן או באמצעות כפתור איפוס ההתקדמות באתר.',
      },
      {
        heading: '3. שיתוף מידע עם צדדים שלישיים',
        body: 'במצב מקוון, בקשות ליצירת שיעורים ותרגילים עשויות להישלח לשירותי בינה מלאכותית ללא שליחת פרטים מזהים אישיים של התלמיד. [שם האתר / החברה] אינו מוכר או מעביר מידע אישי לצדדים שלישיים.',
      },
      {
        heading: '4. פניות בנושא פרטיות',
        body: 'לבירורים או בקשות בנוגע למדיניות הפרטיות, ניתן ליצור קשר בכתובת [דוא"ל ליצירת קשר] (gold.noam@gmail.com).',
      },
    ],
  },
  accessibility: {
    title: 'הצהרת נגישות',
    sections: [
      {
        heading: '1. מחויבות לנגישות ותקנים',
        body: '[שם האתר / החברה] מחויב להנגשת האתר לאנשים עם מוגבלויות ופועל בהתאם לתקן הישראלי ת"י 5568 (IS 5568) ולהנחיות הבינלאומיות WCAG 2.1 ברמה AA, במטרה לאפשר חוויית למידה שוויונית, מכבדת ונגישה לכלל התלמידים.',
      },
      {
        heading: '2. התאמות נגישות מובנות באתר',
        body: 'האתר בנוי באמצעות HTML סמנטי תקני וכולל תמיכה בניווט מקלדת מלא (Tab, Shift+Tab, Enter, ESC לסגירת חלונות), תיוג ARIA מתאים לקוראי מסך, ניגודיות צבעים תואמת תקן במצב בהיר וכהה, וסימון מיקוד (Focus) ברור ברכיבים האינטראקטיביים.',
      },
      {
        heading: '3. פרטי רכז נגישות ויצירת קשר',
        body: 'אם נתקלתם בקושי נגישות כלשהו במהלך הגלישה או השימוש במערכת התרגול, נשמח לסייע ולתקן בהקדם. פרטי קשר: [שם רכז הנגישות] · דוא"ל: [דוא"ל ליצירת קשר] (gold.noam@gmail.com) · טלפון: [טלפון ליצירת קשר].',
      },
    ],
  },
};

const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<LegalModalType>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const openModal = (type: Exclude<LegalModalType, null>) => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
    if (lastFocusedRef.current && typeof lastFocusedRef.current.focus === 'function') {
      lastFocusedRef.current.focus();
    }
  };

  useEffect(() => {
    if (!activeModal) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal]);

  const modalData = activeModal ? MODAL_CONTENT[activeModal] : null;

  return (
    <>
      <footer className="w-full py-6 mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="font-medium">
            © 2025 MathMaster IL · מרכז למידה ותרגול במתמטיקה לכיתות א׳–י״ב
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => openModal('terms')}
              className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors font-medium focus:outline-none focus-visible:underline"
            >
              תנאי שימוש
            </button>
            <button
              type="button"
              onClick={() => openModal('privacy')}
              className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors font-medium focus:outline-none focus-visible:underline"
            >
              מדיניות פרטיות
            </button>
            <button
              type="button"
              onClick={() => openModal('accessibility')}
              className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors font-medium focus:outline-none focus-visible:underline"
            >
              הצהרת נגישות
            </button>
            <a
              href="mailto:gold.noam@gmail.com"
              className="hover:text-blue-600 dark:hover:text-sky-400 transition-colors inline-flex items-center gap-1.5 font-medium"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>שליחת משוב</span>
            </a>
          </div>
        </div>
      </footer>

      {modalData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden text-right animate-fadeIn"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2
                id="legal-modal-title"
                className="font-display text-lg font-bold text-slate-900 dark:text-white"
              >
                {modalData.title}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeModal}
                aria-label="סגירת חלון"
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {modalData.sections.map((section, idx) => (
                <section key={idx}>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white mb-1.5">
                    {section.heading}
                  </h3>
                  <p>{section.body}</p>
                </section>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-950/50">
              <button
                type="button"
                onClick={closeModal}
                className="px-5 py-2 rounded-lg bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 text-xs font-semibold hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                סגירה
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;