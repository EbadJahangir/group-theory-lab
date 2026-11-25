import React from 'react';
import katex from 'katex';
import { exprToLatex, splitMixedMathText } from '../utils/mathFormat';

const katexCache = new Map<string, string>();

function renderTexCached(tex: string, displayMode: boolean): string {
  const key = `${displayMode ? 'D' : 'I'}:${tex}`;
  const cached = katexCache.get(key);
  if (cached !== undefined) return cached;

  const html = katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: false,
    output: 'htmlAndMathml',
  });
  if (katexCache.size > 1500) {
    katexCache.clear();
  }
  katexCache.set(key, html);
  return html;
}

interface MathProps {
  tex: string;
  className?: string;
  ariaLabel?: string;
}

export const MathInline: React.FC<MathProps> = React.memo(({ tex, className = '', ariaLabel }) => {
  const html = renderTexCached(tex, false);
  return (
    <span
      className={`inline-block align-baseline leading-none ${className}`}
      aria-label={ariaLabel || tex}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
MathInline.displayName = 'MathInline';

export const MathBlock: React.FC<MathProps> = React.memo(({ tex, className = '', ariaLabel }) => {
  const html = renderTexCached(tex, true);
  return (
    <div
      className={`overflow-x-auto max-w-full py-1.5 text-[#373B35] dark:text-[#ECEEE9] ${className}`}
      aria-label={ariaLabel || tex}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});
MathBlock.displayName = 'MathBlock';

/**
 * Renders a mathematical string (group name, element, equation) directly via KaTeX.
 */
export const MathExpr: React.FC<{ value: string; className?: string }> = React.memo(
  ({ value, className = '' }) => {
    const tex = exprToLatex(value);
    return <MathInline tex={tex} className={className} ariaLabel={value} />;
  }
);
MathExpr.displayName = 'MathExpr';

/**
 * Renders mixed English prose and mathematical expressions with inline KaTeX.
 */
export const MathText: React.FC<{ text: string; className?: string }> = React.memo(
  ({ text, className = '' }) => {
    const segments = splitMixedMathText(text);
    return (
      <span className={className}>
        {segments.map((seg, idx) =>
          seg.type === 'math' ? (
            <MathInline key={idx} tex={seg.value} />
          ) : (
            <React.Fragment key={idx}>{seg.value}</React.Fragment>
          )
        )}
      </span>
    );
  }
);
MathText.displayName = 'MathText';
