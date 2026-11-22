import React from 'react';

interface TopicGlyphProps {
  topicId: string;
  size?: 'sm' | 'md' | 'lg';
}

const GLYPH_MAP: Record<string, string> = {
  'g1-add-sub-10': '±',
  'g1-shapes': '△',
  'g1-order': '1·2',
  'g2-mult-intro': '×',
  'g2-add-sub-100': '100',
  'g2-geometry': '⬠',
  'g3-large-numbers': '10³',
  'g3-division': '÷',
  'g3-fractions-intro': '½',
  'g4-fractions': '¾',
  'g4-long-division': '⟌',
  'g4-perimeter-area': 'S□',
  'g5-decimals': '0.5',
  'g5-fractions-ops': 'a/b',
  'g5-angles': '∠',
  'g6-percentages': '%',
  'g6-ratio': 'a:b',
  'g6-circle': 'πr²',
  'g7-algebra-intro': 'x',
  'g7-signed-numbers': '±x',
  'g7-equations': 'x=',
  'g8-functions': 'y=mx',
  'g8-systems': '{ }',
  'g8-pythagoras': 'a²+b²',
  'g9-factoring': '(x+a)',
  'g9-short-formulas': '(a±b)²',
  'g9-quadratic': 'x²',
  'g9-geometry': '∼',
  'g9-probability': 'P(A)',
  'g10-analytic': '(x,y)',
  'g10-trig': 'sin',
  'g10-algebra': '√x',
  'g11-calculus': "f'(x)",
  'g11-word-problems': '∑',
  'g11-sequence': 'aₙ',
  'g12-integral': '∫',
  'g12-vectors': 'v⃗',
  'g12-complex': 'ℂ',
};

const TopicGlyph: React.FC<TopicGlyphProps> = ({ topicId, size = 'md' }) => {
  const symbol = GLYPH_MAP[topicId] || '∑';

  const sizeClasses =
    size === 'sm'
      ? 'w-9 h-9 text-xs'
      : size === 'lg'
      ? 'w-12 h-12 text-sm'
      : 'w-11 h-11 text-xs';

  return (
    <span
      className={`${sizeClasses} inline-flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-sky-400 font-mono font-semibold tracking-tight shrink-0 select-none transition-colors group-hover:bg-blue-50 dark:group-hover:bg-sky-950/60 group-hover:border-blue-200 dark:group-hover:border-sky-800`}
      dir="ltr"
      aria-hidden="true"
    >
      {symbol}
    </span>
  );
};

export default TopicGlyph;
