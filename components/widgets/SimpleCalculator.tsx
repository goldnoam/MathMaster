import React, { useState } from 'react';

const SimpleCalculator: React.FC = () => {
  const [display, setDisplay] = useState('');

  const handleClick = (value: string) => {
    if (value === '=') {
      try {
        // Warning: eval is used here for simplicity in a strictly controlled client-side calc.
        // In production apps, build a parser or use Function constructor.
        // eslint-disable-next-line no-eval
        setDisplay(eval(display).toString());
      } catch {
        setDisplay('Error');
      }
    } else if (value === 'C') {
      setDisplay('');
    } else {
      setDisplay(prev => prev + value);
    }
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', 'C', '+',
    '='
  ];

  return (
    <div className="my-6 max-w-[260px] bg-gray-800 p-4 rounded-xl shadow-lg mx-auto md:mx-0" dir="ltr">
      <div className="bg-gray-200 text-gray-900 font-mono text-2xl p-2 rounded mb-4 text-right h-12 overflow-hidden">
        {display || '0'}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {buttons.map(btn => (
          <button
            key={btn}
            onClick={() => handleClick(btn)}
            className={`p-3 rounded-lg font-bold transition-all active:scale-95 ${
              btn === '=' 
                ? 'col-span-4 bg-indigo-600 text-white hover:bg-indigo-700' 
                : btn === 'C'
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SimpleCalculator;