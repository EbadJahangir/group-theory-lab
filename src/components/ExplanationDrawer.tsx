import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ExplanationBlock } from '../types/symmetry';
import { exprToLatex } from '../utils/mathFormat';
import { MathBlock, MathText } from './MathExpr';

interface ExplanationDrawerProps {
  explanation: ExplanationBlock;
  title?: string;
  formulaNote?: string;
}

export const ExplanationDrawer: React.FC<ExplanationDrawerProps> = ({
  explanation,
  title = 'Mathematical Summary',
  formulaNote,
}) => {
  const [expanded, setExpanded] = useState(false);

  const formulaParts = explanation.formula
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-display text-sm font-semibold text-[#373B35] dark:text-[#ECEEE9]">
            {title}
          </h3>
          <p className="text-sm text-[#373B35] dark:text-[#ECEEE9] leading-relaxed">
            <MathText text={explanation.summary} />
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1.5 self-start px-3 py-1.5 rounded-md text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] text-[#373B35] dark:text-[#ECEEE9] hover:bg-[#C8D3BD]/40 dark:hover:bg-[#2E3A31] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span>{expanded ? 'Hide Derivation' : 'Show Formula & Steps'}</span>
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#D8D4C9] dark:border-[#2D3730] space-y-3">
          <div>
            <div className="text-xs font-medium text-[#656B61] dark:text-[#A2ACA0] mb-1">
              Governing Formula
            </div>
            <div className="px-3 py-2 rounded-md bg-[#F3F0E8] dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730] text-[#373B35] dark:text-[#ECEEE9] space-y-1">
              {formulaParts.map((part, i) => (
                <MathBlock key={i} tex={exprToLatex(part)} ariaLabel={part} />
              ))}
              {formulaNote && (
                <p className="text-xs text-[#656B61] dark:text-[#A2ACA0] pt-1 leading-relaxed">
                  <MathText text={formulaNote} />
                </p>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-[#656B61] dark:text-[#A2ACA0] mb-1.5">
              Calculation Steps & Reasoning
            </div>
            <ol className="space-y-1.5 text-sm text-[#373B35] dark:text-[#ECEEE9] list-decimal list-inside">
              {explanation.reasoning.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  <MathText text={step} />
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};
