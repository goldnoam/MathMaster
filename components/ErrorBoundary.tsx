import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let readable = 'אירעה שגיאה בלתי צפויה במערכת.';
    if (error?.message) {
      try {
        const parsed = JSON.parse(error.message);
        if (parsed && parsed.operationType && parsed.error) {
          readable = `שגיאת סנכרון מול מסד הנתונים (${parsed.operationType}): ${parsed.error}`;
        }
      } catch {
        readable = error.message;
      }
    }
    return { hasError: true, message: readable };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans"
        >
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-right shadow-sm">
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white mb-2">
              התרחשה תקלה בטעינת התצוגה
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, message: '' })}
              className="px-5 py-2.5 rounded-xl bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 text-sm font-semibold hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors"
            >
              חזרה לעבודה
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
