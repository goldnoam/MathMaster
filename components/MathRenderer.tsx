import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';

interface MathRendererProps {
  text?: string;
  className?: string;
  block?: boolean;
}

interface TextSegment {
  type: 'text' | 'inline-math' | 'block-math';
  content: string;
}

/**
 * Splits text into standard text and LaTeX mathematical formula segments ($$...$$, $...$, \(...\), \[...\]).
 */
export const parseMathSegments = (rawText: string): TextSegment[] => {
  if (!rawText) return [];

  const segments: TextSegment[] = [];

  // Match:
  // 1. $$ ... $$ (block math)
  // 2. \[ ... \] (block math)
  // 3. $ ... $ (inline math)
  // 4. \( ... \) (inline math)
  // 5. Standalone LaTeX commands if prefixed with backslash like \frac{...}{...} or \sqrt{...}
  const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$(?!\$)[\s\S]*?\$|\\\([\s\S]*?\\\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      const textPart = rawText.slice(lastIndex, match.index);
      if (textPart) {
        segments.push({ type: 'text', content: textPart });
      }
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
      segments.push({
        type: 'block-math',
        content: matchedStr.slice(2, -2).trim(),
      });
    } else if (matchedStr.startsWith('\\[') && matchedStr.endsWith('\\]')) {
      segments.push({
        type: 'block-math',
        content: matchedStr.slice(2, -2).trim(),
      });
    } else if (matchedStr.startsWith('\\(') && matchedStr.endsWith('\\)')) {
      segments.push({
        type: 'inline-math',
        content: matchedStr.slice(2, -2).trim(),
      });
    } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$')) {
      segments.push({
        type: 'inline-math',
        content: matchedStr.slice(1, -1).trim(),
      });
    } else {
      segments.push({ type: 'text', content: matchedStr });
    }

    lastIndex = match.index + matchedStr.length;
  }

  if (lastIndex < rawText.length) {
    segments.push({ type: 'text', content: rawText.slice(lastIndex) });
  }

  return segments;
};

/**
 * MathRenderer component using 'react-katex' to render LaTeX formulas cleanly
 * within Hebrew RTL academic layouts.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  text = '',
  className = '',
  block = false,
}) => {
  if (!text) return null;

  // If explicitly requested as full block math or text is pure single formula
  if (block && (text.startsWith('$$') || text.startsWith('\\['))) {
    const cleanFormula = text
      .replace(/^\$\$|^\\\[/, '')
      .replace(/\$\$|\\\]$/, '')
      .trim();
    return (
      <div dir="ltr" className={`my-3 overflow-x-auto text-center ${className}`}>
        <BlockMath
          math={cleanFormula}
          renderError={() => (
            <pre className="font-mono text-sm text-slate-700 dark:text-slate-300">
              {cleanFormula}
            </pre>
          )}
        />
      </div>
    );
  }

  const segments = parseMathSegments(text);

  // If no math delimiters were detected but the string is a recognized single raw LaTeX expression
  if (
    segments.length === 1 &&
    segments[0].type === 'text' &&
    /\\(frac|sqrt|pm|cdot|sum|int|alpha|beta|gamma|theta|pi|le|ge|ne|in|times|div)\b/.test(text)
  ) {
    return (
      <span dir="ltr" className={`inline-block px-1 align-baseline ${className}`}>
        <InlineMath
          math={text}
          renderError={() => (
            <span className="font-mono text-sm text-slate-800 dark:text-slate-200">
              {text}
            </span>
          )}
        />
      </span>
    );
  }

  return (
    <span className={className}>
      {segments.map((seg, idx) => {
        if (seg.type === 'block-math') {
          return (
            <div
              key={idx}
              dir="ltr"
              className="my-3 overflow-x-auto text-center block"
            >
              <BlockMath
                math={seg.content}
                renderError={() => (
                  <pre className="font-mono text-sm text-slate-700 dark:text-slate-300">
                    {seg.content}
                  </pre>
                )}
              />
            </div>
          );
        }

        if (seg.type === 'inline-math') {
          return (
            <span
              key={idx}
              dir="ltr"
              className="inline-block px-1 align-baseline text-slate-900 dark:text-slate-100"
            >
              <InlineMath
                math={seg.content}
                renderError={() => (
                  <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                    {seg.content}
                  </span>
                )}
              />
            </span>
          );
        }

        return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
      })}
    </span>
  );
};

/**
 * Utility helper for React Markdown or nested nodes to render any string children
 * through MathRenderer while preserving React elements.
 */
export const renderChildrenWithMath = (children: React.ReactNode): React.ReactNode => {
  if (typeof children === 'string') {
    return <MathRenderer text={children} />;
  }
  if (Array.isArray(children)) {
    return React.Children.map(children, (child) => renderChildrenWithMath(child));
  }
  return children;
};

export default MathRenderer;

