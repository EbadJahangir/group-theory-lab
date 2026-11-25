import React from 'react';
import type { OrderCount } from '../types/symmetry';
import { MathExpr, MathInline } from './MathExpr';

interface OrderChartProps {
  distribution: OrderCount[];
  groupName: string;
  comparison?: {
    rows: { order: number; count_a: number; count_b: number }[];
    nameA: string;
    nameB: string;
  };
}

export const OrderChart: React.FC<OrderChartProps> = ({ distribution, groupName, comparison }) => {
  if (comparison) {
    const rows = comparison.rows;
    if (rows.length === 0) return null;
    const maxCount = Math.max(...rows.flatMap((r) => [r.count_a, r.count_b]), 1);

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#656B61] dark:text-[#A2ACA0]">
          <span>Element Order Distribution Comparison</span>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#526B58] dark:bg-[#6F9278] inline-block" />
              <span className="text-[#373B35] dark:text-[#ECEEE9]">
                <MathExpr value={comparison.nameA} />
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#C8D3BD] dark:bg-[#425848] border border-[#526B58]/40 inline-block" />
              <span className="text-[#373B35] dark:text-[#ECEEE9]">
                <MathExpr value={comparison.nameB} />
              </span>
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[320px] flex items-end gap-3 h-48 pt-6 pb-2 px-3 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/60 dark:bg-[#141815]">
            {rows.map((row) => {
              const hA = Math.round((row.count_a / maxCount) * 124);
              const hB = Math.round((row.count_b / maxCount) * 124);
              return (
                <div key={row.order} className="flex-1 min-w-[44px] flex flex-col items-center gap-1.5">
                  <div className="flex items-end gap-1 h-[130px]">
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-[11px] tabular-nums text-[#373B35] dark:text-[#ECEEE9] mb-0.5">
                        {row.count_a}
                      </span>
                      <div
                        style={{ height: `${Math.max(hA, row.count_a > 0 ? 4 : 0)}px` }}
                        className="w-5 rounded-t bg-[#526B58] dark:bg-[#6F9278] transition-all"
                        title={`${comparison.nameA} order ${row.order}: ${row.count_a}`}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-mono text-[11px] tabular-nums text-[#656B61] dark:text-[#A2ACA0] mb-0.5">
                        {row.count_b}
                      </span>
                      <div
                        style={{ height: `${Math.max(hB, row.count_b > 0 ? 4 : 0)}px` }}
                        className="w-5 rounded-t bg-[#C8D3BD] dark:bg-[#3A4D3E] border border-[#526B58]/40 dark:border-[#6F9278]/50 transition-all"
                        title={`${comparison.nameB} order ${row.order}: ${row.count_b}`}
                      />
                    </div>
                  </div>
                  <div className="text-xs tabular-nums text-[#656B61] dark:text-[#A2ACA0] border-t border-[#D8D4C9] dark:border-[#2D3730] w-full text-center pt-1">
                    <MathInline tex={`\\operatorname{ord}\\,${row.order}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!distribution || distribution.length === 0) return null;
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-[#656B61] dark:text-[#A2ACA0]">
        <span>
          Order Distribution — <MathExpr value={groupName} />
        </span>
        <span>Vertical axis: element count</span>
      </div>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[280px] flex items-end gap-2.5 h-44 pt-5 pb-2 px-3 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/60 dark:bg-[#141815]">
          {distribution.map((d) => {
            const barHeight = Math.round((d.count / maxCount) * 114);
            return (
              <div key={d.order} className="flex-1 min-w-[36px] flex flex-col items-center gap-1">
                <span className="font-mono text-xs tabular-nums text-[#373B35] dark:text-[#ECEEE9]">
                  {d.count}
                </span>
                <div className="w-full flex justify-center items-end h-[116px]">
                  <div
                    style={{ height: `${Math.max(barHeight, 4)}px` }}
                    className="w-7 max-w-full rounded-t bg-[#526B58] dark:bg-[#6F9278] transition-all"
                    title={`Order ${d.order}: ${d.count} element(s)`}
                  />
                </div>
                <div className="text-xs tabular-nums text-[#656B61] dark:text-[#A2ACA0] border-t border-[#D8D4C9] dark:border-[#2D3730] w-full text-center pt-1">
                  <MathInline tex={`\\operatorname{ord}\\,${d.order}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
