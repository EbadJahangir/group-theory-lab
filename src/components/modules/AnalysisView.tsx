import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import type {
  AppStats,
  GroupComparisonResult,
  ModuleId,
  ReportSnapshot,
} from '../../types/symmetry';
import { MathExpr, MathInline, MathText } from '../MathExpr';
import { OrderChart } from '../OrderChart';

interface AnalysisViewProps {
  initialParams?: Record<string, unknown> | null;
  onRecordActivity: (opts: {
    module: ModuleId;
    type: string;
    description: string;
    params: Record<string, unknown>;
    statsDelta: Partial<AppStats>;
    report: ReportSnapshot;
  }) => void;
}

interface GroupFormState {
  groupType: 'abelian' | 'dihedral' | 'permutation';
  moduliStr: string;
  nStr: string;
}

function buildSpec(form: GroupFormState): Record<string, unknown> {
  if (form.groupType === 'abelian') {
    const parts = form.moduliStr
      .split(/[\s,×x]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0 || parts.some((p) => !/^-?\d+$/.test(p))) {
      throw new Error('Abelian moduli must be positive integers separated by commas.');
    }
    return { group_type: 'abelian', moduli: parts.map(Number) };
  }
  return { group_type: form.groupType, n: Number(form.nStr) };
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({
  initialParams,
  onRecordActivity,
}) => {
  const [groupA, setGroupA] = useState<GroupFormState>({
    groupType: 'abelian',
    moduliStr: '4',
    nStr: '4',
  });
  const [groupB, setGroupB] = useState<GroupFormState>({
    groupType: 'abelian',
    moduliStr: '2, 2',
    nStr: '4',
  });
  const [result, setResult] = useState<GroupComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCompare = async (formA: GroupFormState, formB: GroupFormState) => {
    setError(null);
    setLoading(true);
    try {
      const specA = buildSpec(formA);
      const specB = buildSpec(formB);
      const data = await api.compareGroups(specA, specB);
      setResult(data);
      onRecordActivity({
        module: 'analysis',
        type: 'Order Analysis',
        description: `Compared ${data.group_a.group_name} vs ${data.group_b.group_name}`,
        params: { group_a: formA, group_b: formB },
        statsDelta: {
          groupsExplored: 2,
          calculationsPerformed: 1,
          elementsAnalyzed: data.group_a.order + data.group_b.order,
        },
        report: {
          id: `analysis-${Date.now()}`,
          title: 'Element Order Distribution & Group Comparison',
          module: 'analysis',
          groupOrSubject: `${data.group_a.group_name} vs ${data.group_b.group_name}`,
          inputsSummary: `Group A: ${data.group_a.group_name}; Group B: ${data.group_b.group_name}`,
          formulas: ['ord(g) = min { k ≥ 1 : g^k = e }'],
          summary: data.highlights.join(' '),
          verificationLines: data.highlights,
          tableHeaders: ['Order', `${data.group_a.group_name} Count`, `${data.group_b.group_name} Count`],
          tableRows: data.comparison_table.map((r) => [
            String(r.order),
            String(r.count_a),
            String(r.count_b),
          ]),
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze group orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialParams?.group_a && initialParams?.group_b) {
      const fa = initialParams.group_a as GroupFormState;
      const fb = initialParams.group_b as GroupFormState;
      setGroupA(fa);
      setGroupB(fb);
      void runCompare(fa, fb);
    } else {
      void runCompare(groupA, groupB);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialParams]);

  const applyComparisonPreset = (a: GroupFormState, b: GroupFormState) => {
    setGroupA(a);
    setGroupB(b);
    void runCompare(a, b);
  };

  const renderGroupInput = (
    title: string,
    state: GroupFormState,
    setState: React.Dispatch<React.SetStateAction<GroupFormState>>
  ) => (
    <div className="p-4 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/50 dark:bg-[#141815] space-y-3">
      <div className="text-xs font-semibold text-[#373B35] dark:text-[#ECEEE9]">{title}</div>
      <div className="flex flex-wrap gap-2">
        <select
          value={state.groupType}
          onChange={(e) =>
            setState({ ...state, groupType: e.target.value as GroupFormState['groupType'] })
          }
          className="px-2.5 py-1.5 rounded border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] text-xs"
        >
          <option value="abelian">Abelian (ℤₙ / Product)</option>
          <option value="dihedral">Dihedral (Dₙ)</option>
          <option value="permutation">Symmetric (Sₙ, n ≤ 5)</option>
        </select>

        {state.groupType === 'abelian' ? (
          <input
            type="text"
            value={state.moduliStr}
            onChange={(e) => setState({ ...state, moduliStr: e.target.value })}
            placeholder="e.g. 2, 2"
            aria-label={`${title} moduli`}
            className="flex-1 min-w-[120px] px-2.5 py-1.5 rounded border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] font-mono text-xs"
          />
        ) : (
          <input
            type="number"
            min={state.groupType === 'dihedral' ? 3 : 1}
            max={state.groupType === 'dihedral' ? 24 : 5}
            value={state.nStr}
            onChange={(e) => setState({ ...state, nStr: e.target.value })}
            aria-label={`${title} n`}
            className="w-24 px-2.5 py-1.5 rounded border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] font-mono text-xs tabular-nums"
          />
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">
              Element Order Analysis & Group Comparison
            </h2>
            <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
              Compare element order distributions (<MathInline tex="\operatorname{ord}(g)" />),
              maximum orders, and cyclicity between any two supported finite groups.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              aria-label="Z_4 vs Z_2 × Z_2"
              onClick={() =>
                applyComparisonPreset(
                  { groupType: 'abelian', moduliStr: '4', nStr: '4' },
                  { groupType: 'abelian', moduliStr: '2, 2', nStr: '4' }
                )
              }
              className="px-2.5 py-1 rounded text-xs border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 cursor-pointer"
            >
              <MathInline tex="\mathbb{Z}_4 \text{ vs } \mathbb{Z}_2 \times \mathbb{Z}_2" />
            </button>
            <button
              type="button"
              aria-label="Z_6 vs Z_2 × Z_3"
              onClick={() =>
                applyComparisonPreset(
                  { groupType: 'abelian', moduliStr: '6', nStr: '6' },
                  { groupType: 'abelian', moduliStr: '2, 3', nStr: '6' }
                )
              }
              className="px-2.5 py-1 rounded text-xs border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 cursor-pointer"
            >
              <MathInline tex="\mathbb{Z}_6 \text{ vs } \mathbb{Z}_2 \times \mathbb{Z}_3" />
            </button>
            <button
              type="button"
              aria-label="D_3 vs S_3"
              onClick={() =>
                applyComparisonPreset(
                  { groupType: 'dihedral', moduliStr: '6', nStr: '3' },
                  { groupType: 'permutation', moduliStr: '6', nStr: '3' }
                )
              }
              className="px-2.5 py-1 rounded text-xs border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 cursor-pointer"
            >
              <MathInline tex="D_3 \text{ vs } S_3" />
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runCompare(groupA, groupB);
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderGroupInput('Group A', groupA, setGroupA)}
            {renderGroupInput('Group B', groupB, setGroupB)}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md text-xs font-semibold bg-[#526B58] dark:bg-[#6F9278] text-white hover:bg-[#435948] dark:hover:bg-[#7EA488] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Comparing...' : 'Analyze & Compare'}
          </button>
        </form>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Highlights */}
          <div className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-2.5">
            <h3 className="font-display text-sm font-semibold">Structural Comparison</h3>
            <ul className="space-y-1.5 text-sm text-[#373B35] dark:text-[#ECEEE9]">
              {result.highlights.map((line, i) => (
                <li key={i}>
                  • <MathText text={line} />
                </li>
              ))}
            </ul>
          </div>

          {/* Histogram + Order Frequency Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5">
              <OrderChart
                distribution={[]}
                groupName=""
                comparison={{
                  rows: result.comparison_table,
                  nameA: result.group_a.group_name,
                  nameB: result.group_b.group_name,
                }}
              />
            </div>

            <div className="lg:col-span-5 rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#D8D4C9] dark:border-[#2D3730]">
                <h3 className="font-display text-sm font-semibold">Order Frequency Table</h3>
              </div>
              <table className="w-full text-left text-xs sm:text-sm font-mono tabular-nums">
                <thead className="bg-[#F3F0E8] dark:bg-[#232B25] text-[#656B61] dark:text-[#A2ACA0] border-b border-[#D8D4C9] dark:border-[#2D3730]">
                  <tr>
                    <th className="py-2 px-4 font-sans font-medium">Order</th>
                    <th className="py-2 px-4 font-sans font-medium">
                      <MathExpr value={result.group_a.group_name} />
                    </th>
                    <th className="py-2 px-4 font-sans font-medium">
                      <MathExpr value={result.group_b.group_name} />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D4C9] dark:divide-[#2D3730]">
                  {result.comparison_table.map((row) => (
                    <tr key={row.order}>
                      <td className="py-2 px-4 font-semibold">{row.order}</td>
                      <td className="py-2 px-4">{row.count_a}</td>
                      <td className="py-2 px-4">{row.count_b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Element lists side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[result.group_a, result.group_b].map((grp, idx) => (
              <div
                key={`${grp.group_name}-${idx}`}
                className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-[#D8D4C9] dark:border-[#2D3730] flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">
                    <MathExpr value={grp.group_name} />
                  </span>
                  <span className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                    Order {grp.order} · {grp.is_cyclic ? 'Cyclic' : 'Non-Cyclic'} · Max{' '}
                    <MathInline tex="\operatorname{ord}" /> {grp.max_element_order}
                  </span>
                </div>
                <div className="max-h-72 overflow-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-[#F3F0E8] dark:bg-[#232B25] border-b border-[#D8D4C9] dark:border-[#2D3730]">
                      <tr>
                        <th className="py-2 px-3 font-medium">Element</th>
                        <th className="py-2 px-3 font-medium">
                          <MathInline tex="\operatorname{ord}(g)" />
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D4C9] dark:divide-[#2D3730]">
                      {grp.elements.map((el, i) => (
                        <tr key={i}>
                          <td className="py-1.5 px-3 font-semibold">
                            <MathExpr value={el.label} />
                          </td>
                          <td className="py-1.5 px-3 font-mono tabular-nums">{el.order}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
