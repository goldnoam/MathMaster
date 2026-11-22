import React, { useState, useEffect } from 'react';
import { CURRICULUM } from '../constants.ts';
import { UserAccountProfile } from '../types.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccountProfile | null;
  isAuthBusy: boolean;
  authError: string | null;
  onGoogleSignIn: () => Promise<void>;
  onUpdateProfile: (displayName: string, gradeId: string) => Promise<void>;
  onSignOut: () => Promise<void>;
  studiedCount: number;
  quizzesCount: number;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  account,
  isAuthBusy,
  authError,
  onGoogleSignIn,
  onUpdateProfile,
  onSignOut,
  studiedCount,
  quizzesCount,
}) => {
  const [displayName, setDisplayName] = useState(account?.displayName || '');
  const [gradeId, setGradeId] = useState(account?.gradeId || 'all');
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    if (account) {
      setDisplayName(account.displayName);
      setGradeId(account.gradeId || 'all');
    }
  }, [account, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    await onUpdateProfile(displayName.trim(), gradeId);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={onClose}
    >
      <div
        dir="rtl"
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2
              id="auth-modal-title"
              className="font-display text-lg font-bold text-slate-900 dark:text-white"
            >
              {account
                ? account.isNewProfile
                  ? 'השלמת הרשמה לחשבון תלמיד'
                  : 'הפרופיל האישי שלי'
                : 'הרשמה והתחברות למערכת'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {account
                ? 'ההתקדמות, הציונים ותכנית הלימודים נשמרים בענן'
                : 'שמרו ציונים, נושאים שנלמדו ותכנית שבועית מכל מכשיר'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="סגירת חלון חשבון"
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200">
              {authError}
            </div>
          )}

          {!account ? (
            <>
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  מה כולל החשבון האישי?
                </p>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-sky-400 font-bold">✓</span>
                    <span>סנכרון ציוני מבחנים ונושאים שנשלטו בין מחשב לנייד</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-sky-400 font-bold">✓</span>
                    <span>מיזוג אוטומטי של התרגולים שביצעת כאורח לחשבון</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600 dark:text-sky-400 font-bold">✓</span>
                    <span>שמירת יעד הלימוד השבועי והתאמת רמה אישית</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                disabled={isAuthBusy}
                onClick={onGoogleSignIn}
                className="w-full h-11 px-4 rounded-xl bg-blue-600 dark:bg-sky-500 hover:bg-blue-700 dark:hover:bg-sky-400 disabled:opacity-60 text-white dark:text-slate-950 font-semibold text-sm transition-colors flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z" />
                </svg>
                <span>{isAuthBusy ? 'מתחבר...' : 'הרשמה או התחברות עם Google'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                המשך בלמידה כאורח (שמירה מקומית במכשיר)
              </button>
            </>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Account Summary Header */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="w-11 h-11 rounded-full bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 font-display font-bold text-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {account.photoURL ? (
                    <img
                      src={account.photoURL}
                      alt={account.displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{account.displayName.slice(0, 1)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                    {account.displayName}
                  </div>
                  {account.email && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono" dir="ltr">
                      {account.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Account Stats Strip */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <div className="font-mono tabular-nums font-bold text-base text-amber-600 dark:text-amber-400">
                    {account.points}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">נקודות</div>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <div className="font-mono tabular-nums font-bold text-base text-slate-900 dark:text-white">
                    {studiedCount}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">נושאים</div>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <div className="font-mono tabular-nums font-bold text-base text-blue-600 dark:text-sky-400">
                    {quizzesCount}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">מבחנים</div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="profile-display-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  שם התלמיד/ה במערכת
                </label>
                <input
                  id="profile-display-name"
                  type="text"
                  maxLength={80}
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-grade-select"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  שכבת לימוד עיקרית
                </label>
                <select
                  id="profile-grade-select"
                  value={gradeId}
                  onChange={(e) => setGradeId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="all">כל הכיתות (א׳–י״ב)</option>
                  {CURRICULUM.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {savedFeedback && (
                <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                  פרטי הפרופיל נשמרו בהצלחה בענן
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isAuthBusy}
                  onClick={onSignOut}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  התנתקות
                </button>

                <button
                  type="submit"
                  disabled={isAuthBusy || !displayName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 dark:bg-sky-500 hover:bg-blue-700 dark:hover:bg-sky-400 disabled:opacity-50 text-white dark:text-slate-950 text-xs font-semibold transition-colors"
                >
                  {isAuthBusy ? 'שומר...' : 'שמירת פרטים'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
