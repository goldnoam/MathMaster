import React, { useState } from 'react';

function evaluateExpression(expr: string): number {
  const sanitized = expr.replace(/\s+/g, '');
  if (!sanitized || !/^[0-9+\-*/().]+$/.test(sanitized)) {
    throw new Error('Invalid expression');
  }

  let index = 0;

  const parseExpression = (): number => {
    let value = parseTerm();
    while (index < sanitized.length && (sanitized[index] === '+' || sanitized[index] === '-')) {
      const op = sanitized[index++];
      const right = parseTerm();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  };

  const parseTerm = (): number => {
    let value = parseFactor();
    while (index < sanitized.length && (sanitized[index] === '*' || sanitized[index] === '/')) {
      const op = sanitized[index++];
      const right = parseFactor();
      if (op === '/') {
        if (right === 0) throw new Error('Division by zero');
        value /= right;
      } else {
        value *= right;
      }
    }
    return value;
  };

  const parseFactor = (): number => {
    if (sanitized[index] === '+') {
      index++;
      return parseFactor();
    }
    if (sanitized[index] === '-') {
      index++;
      return -parseFactor();
    }
    if (sanitized[index] === '(') {
      index++;
      const value = parseExpression();
      if (sanitized[index] !== ')') throw new Error('Mismatched parentheses');
      index++;
      return value;
    }
    const start = index;
    while (index < sanitized.length && /[0-9.]/.test(sanitized[index])) {
      index++;
    }
    if (start === index) throw new Error('Expected number');
    const num = Number(sanitized.slice(start, index));
    if (Number.isNaN(num)) throw new Error('Invalid number');
    return num;
  };

  const result = parseExpression();
  if (index !== sanitized.length || !Number.isFinite(result)) {
    throw new Error('Unexpected token');
  }
  return Math.round(result * 1e10) / 1e10;
}

const SimpleCalculator: React.FC = () => {
  const [display, setDisplay] = useState('');
  const [hasError, setHasError] = useState(false);

  const handleClick = (value: string) => {
    if (value === '=') {
      if (!display) return;
      try {
        const result = evaluateExpression(display);
        setDisplay(result.toString());
        setHasError(false);
      } catch {
        setDisplay('שגיאה');
        setHasError(true);
      }
    } else if (value === 'C') {
      setDisplay('');
      setHasError(false);
    } else if (value === '⌫') {
      if (hasError) {
        setDisplay('');
        setHasError(false);
      } else {
        setDisplay((prev) => prev.slice(0, -1));
      }
    } else {
      if (hasError) {
        setDisplay(value);
        setHasError(false);
      } else {
        setDisplay((prev) => prev + value);
      }
    }
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '⌫', '+',
  ];

  return (
    <div
      className="my-6 w-full max-w-[280px] bg-slate-900 dark:bg-slate-950 border border-slate-700 dark:border-slate-800 p-4 rounded-2xl shadow-sm mx-auto md:mx-0"
      dir="ltr"
      aria-label="מחשבון עזר"
    >
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
        <span>CALC</span>
        <span>STD</span>
      </div>

      <div className="bg-slate-950 dark:bg-slate-900 border border-slate-800 text-slate-100 font-mono tabular-nums text-2xl px-3 py-2.5 rounded-xl mb-3 text-right min-h-[48px] flex items-center justify-end overflow-x-auto">
        <span className={hasError ? 'text-rose-400 text-base' : ''}>{display || '0'}</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn) => {
          const isOp = ['/', '*', '-', '+'].includes(btn);
          const isBack = btn === '⌫';
          return (
            <button
              key={btn}
              type="button"
              onClick={() => handleClick(btn)}
              className={`h-10 rounded-lg font-mono font-semibold text-sm transition-colors active:scale-95 ${
                isOp
                  ? 'bg-slate-800 text-sky-400 hover:bg-slate-700 border border-slate-700'
                  : isBack
                  ? 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-slate-700'
                  : 'bg-slate-800/70 text-slate-100 hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              {btn}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => handleClick('C')}
          className="h-10 rounded-lg font-mono font-semibold text-sm bg-rose-950/70 text-rose-300 border border-rose-800/60 hover:bg-rose-900/70 transition-colors active:scale-95"
        >
          C
        </button>
        <button
          type="button"
          onClick={() => handleClick('=')}
          className="col-span-3 h-10 rounded-lg font-mono font-semibold text-base bg-blue-600 dark:bg-sky-500 text-white dark:text-slate-950 hover:bg-blue-700 dark:hover:bg-sky-400 transition-colors active:scale-95"
        >
          =
        </button>
      </div>
    </div>
  );
};

export default SimpleCalculator;