import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';
import type {
  AppStats,
  ModuleId,
  PermutationAnalysis,
  ReportSnapshot,
  SymmetricGroupResult,
} from '../../types/symmetry';
import { ExplanationDrawer } from '../ExplanationDrawer';
import { MathBlock, MathExpr, MathInline, MathText } from '../MathExpr';
import { OrderChart } from '../OrderChart';

interface PermutationViewProps {
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

export const PermutationView: React.FC<PermutationViewProps> = ({
  initialParams,
  onRecordActivity,
}) => {
  const [permInput, setPermInput] = useState<string>(
    typeof initialParams?.permutation === 'string' ? initialParams.permutation : '(1 2 3)(4 5)'
  );
  const [degreeInput, setDegreeInput] = useState<string>(
    initialParams?.n ? String(initialParams.n) : '5'
  );
  const [symN, setSymN] = useState<string>(
    initialParams?.symN ? String(initialParams.symN) : '4'
  );
  const [parityFilter, setParityFilter] = useState<'all' | 'even' | 'odd'>('all');

  const [analysis, setAnalysis] = useState<PermutationAnalysis | null>(null);
  const [symResult, setSymResult] = useState<SymmetricGroupResult | null>(null);
  const [loadingPerm, setLoadingPerm] = useState(false);
  const [loadingSym, setLoadingSym] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalyze = async (rawPerm: string, rawDeg: string) => {
    setError(null);
    setLoadingPerm(true);
    try {
      const deg = rawDeg.trim() === '' ? null : rawDeg.trim();
      const data = await api.analyzePermutation(rawPerm, deg);
      setAnalysis(data);
      onRecordActivity({
        module: 'permutations',
        type: 'Permutation Analysis',
        description: `Analyzed ${data.cycle_notation} ∈ S_${data.n} (ord ${data.order}, ${data.parity})`,
        params: { permutation: rawPerm, n: data.n },
        statsDelta: {
          calculationsPerformed: 1,
          permutationsAnalyzed: 1,
        },
        report: {
          id: `perm-${Date.now()}`,
          title: 'Permutation Cycle & Parity Report',
          module: 'permutations',
          groupOrSubject: `${data.cycle_notation} ∈ S_${data.n}`,
          inputsSummary: `Input: ${rawPerm} (n = ${data.n})`,
          formulas: [data.explanation.formula],
          summary: data.explanation.summary,
          verificationLines: data.explanation.reasoning,
          tableHeaders: ['Property', 'Value'],
          tableRows: [
            ['One-Line Notation', data.one_line_notation],
            ['Disjoint Cycles', data.cycle_notation],
            ['Full Cycles (with fixed points)', data.full_cycle_notation],
            ['Cycle Lengths', data.cycle_lengths.join(', ')],
            ['Order', String(data.order)],
            ['Sign', data.sign > 0 ? '+1' : '-1'],
            ['Parity', data.parity],
            ['Inverse', data.inverse_cycle_notation],
          ],
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze permutation.');
    } finally {
      setLoadingPerm(false);
    }
  };

  const runSymmetric = async (rawN: string) => {
    setError(null);
    setLoadingSym(true);
    try {
      const data = await api.exploreSymmetricGroup(rawN.trim());
      setSymResult(data);
      onRecordActivity({
        module: 'permutations',
        type: 'Symmetric Group',
        description: `Generated ${data.group_name} (${data.total_order} permutations, |A_${data.n}| = ${data.even_count})`,
        params: { symN: data.n },
        statsDelta: {
          groupsExplored: 1,
          calculationsPerformed: 1,
          permutationsAnalyzed: data.total_order,
          elementsAnalyzed: data.total_order,
        },
        report: {
          id: `sym-${Date.now()}`,
          title: `Symmetric & Alternating Group ${data.group_name}`,
          module: 'permutations',
          groupOrSubject: `${data.group_name} / ${data.alternating_name}`,
          inputsSummary: `n = ${data.n}`,
          formulas: [data.explanation.formula],
          summary: data.explanation.summary,
          verificationLines: data.explanation.reasoning,
          tableHeaders: ['One-Line', 'Disjoint Cycles', 'Order', 'Sign', 'Parity'],
          tableRows: data.permutations.map((p) => [
            p.one_line_notation,
            p.cycle_notation,
            String(p.order),
            p.sign > 0 ? '+1' : '-1',
            p.parity,
          ]),
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate symmetric group.');
    } finally {
      setLoadingSym(false);
    }
  };

  useEffect(() => {
    if (initialParams?.symN) {
      const nStr = String(initialParams.symN);
      setSymN(nStr);
      void runSymmetric(nStr);
      void runAnalyze(permInput, degreeInput);
    } else if (typeof initialParams?.permutation === 'string') {
      const pStr = initialParams.permutation;
      const dStr = initialParams.n ? String(initialParams.n) : '';
      setPermInput(pStr);
      setDegreeInput(dStr);
      void runAnalyze(pStr, dStr);
      void runSymmetric('4');
    } else {
      void runAnalyze('(1 2 3)(4 5)', '5');
      void runSymmetric('4');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialParams]);

  const filteredPerms = symResult
    ? parityFilter === 'even'
      ? symResult.even_permutations
      : parityFilter === 'odd'
        ? symResult.odd_permutations
        : symResult.permutations
    : [];

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Single Permutation Analyzer */}
      <section className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-semibold">Single Permutation Analyzer</h2>
            <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
              Enter cycle notation such as <MathInline tex="(1\;2\;3)(4\;5)" /> or one-line
              notation <MathInline tex="[2, 3, 1, 5, 4]" /> (supports{' '}
              <MathInline tex="n \le 20" />).
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '(1 2 3)(4 5)', tex: '(1\\;2\\;3)(4\\;5)', p: '(1 2 3)(4 5)', n: '5' },
              { label: '2 3 1 4', tex: '[2,3,1,4]', p: '2 3 1 4', n: '4' },
              { label: '(1 4 2 3)', tex: '(1\\;4\\;2\\;3)', p: '(1 4 2 3)', n: '4' },
            ].map((ex) => (
              <button
                key={ex.label}
                type="button"
                aria-label={ex.label}
                onClick={() => {
                  setPermInput(ex.p);
                  setDegreeInput(ex.n);
                  void runAnalyze(ex.p, ex.n);
                }}
                className="px-2.5 py-1 rounded text-xs border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 cursor-pointer"
              >
                <MathInline tex={ex.tex} />
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runAnalyze(permInput, degreeInput);
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-medium text-[#656B61] dark:text-[#A2ACA0] mb-1">
              Permutation <MathInline tex="\sigma \in S_n" /> (cycle or one-line notation)
            </label>
            <input
              type="text"
              value={permInput}
              onChange={(e) => setPermInput(e.target.value)}
              placeholder="(1 2 3)(4 5) or 2 3 1 5 4"
              className="w-full px-3 py-2 rounded-md border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#141815] font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#656B61] dark:text-[#A2ACA0] mb-1">
              Degree <MathInline tex="n" /> (optional)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={degreeInput}
              onChange={(e) => setDegreeInput(e.target.value)}
              placeholder="Auto"
              className="w-24 px-3 py-2 rounded-md border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#141815] font-mono text-sm tabular-nums"
            />
          </div>
          <button
            type="submit"
            disabled={loadingPerm}
            className="px-4 py-2 rounded-md text-xs font-semibold bg-[#526B58] dark:bg-[#6F9278] text-white hover:bg-[#435948] dark:hover:bg-[#7EA488] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loadingPerm ? 'Analyzing...' : 'Analyze Permutation'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPermInput('(1 2 3)(4 5)');
              setDegreeInput('5');
              void runAnalyze('(1 2 3)(4 5)', '5');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </form>

        {analysis && (
          <div className="pt-4 border-t border-[#D8D4C9] dark:border-[#2D3730] space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 rounded-lg bg-[#F3F0E8]/70 dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730]">
                <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Cycle Notation</div>
                <div className="text-sm font-semibold mt-0.5 break-all">
                  <MathExpr value={analysis.cycle_notation} />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#F3F0E8]/70 dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730]">
                <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">One-Line</div>
                <div className="font-mono text-sm font-semibold mt-0.5 break-all">
                  {analysis.one_line_notation}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#F3F0E8]/70 dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730]">
                <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Cycle Lengths</div>
                <div className="font-mono text-sm font-semibold tabular-nums mt-0.5">
                  [{analysis.cycle_lengths.join(', ')}]
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#F3F0E8]/70 dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730]">
                <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  Order <MathInline tex="\operatorname{ord}(\sigma)" />
                </div>
                <div className="font-mono text-base font-semibold tabular-nums mt-0.5">
                  {analysis.order}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#F3F0E8]/70 dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730]">
                <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  <MathInline tex="\operatorname{sign}(\sigma)" /> & Parity
                </div>
                <div className="text-sm font-semibold mt-0.5">
                  <MathInline tex={analysis.sign > 0 ? '+1' : '-1'} /> ({analysis.parity})
                </div>
              </div>
              <div className="p-3 rounded-lg bg-[#F3F0E8]/70 dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730]">
                <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  Inverse <MathInline tex="\sigma^{-1}" />
                </div>
                <div className="text-sm font-semibold mt-0.5 break-all">
                  <MathExpr value={analysis.inverse_cycle_notation} />
                </div>
              </div>
            </div>

            {/* Authentic Two-Line Matrix Notation */}
            <div className="overflow-x-auto">
              <div className="inline-block rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/50 dark:bg-[#141815] px-4 py-2.5">
                <div className="text-[11px] text-[#656B61] dark:text-[#A2ACA0] mb-1">
                  Two-Line Notation in <MathInline tex={`S_{${analysis.n}}`} />
                </div>
                <MathBlock
                  tex={`\\sigma = \\begin{pmatrix} ${analysis.two_line.top.join(' & ')} \\\\ ${analysis.two_line.bottom.join(' & ')} \\end{pmatrix}`}
                  ariaLabel={`Two-line notation for sigma in S_${analysis.n}`}
                />
              </div>
            </div>

            <ExplanationDrawer
              explanation={analysis.explanation}
              title="Parity & Order Reasoning"
              formulaNote="Here, ord(σ) is the least common multiple of disjoint cycle lengths, and c denotes the total number of disjoint cycles including fixed points."
            />
          </div>
        )}
      </section>

      {/* Symmetric & Alternating Group Explorer */}
      <section className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">
              Symmetric Group <MathInline tex="S_n" /> & Alternating Group{' '}
              <MathInline tex="A_n" />
            </h2>
            <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
              Full enumeration is supported for <MathInline tex="1 \le n \le 5" /> (
              <MathInline tex="|S_5| = 120" />); use the analyzer above for larger{' '}
              <MathInline tex="n \le 20" />.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((nVal) => (
              <button
                key={nVal}
                type="button"
                aria-label={`S_${nVal}`}
                onClick={() => {
                  setSymN(String(nVal));
                  void runSymmetric(String(nVal));
                }}
                className={`px-3 py-1.5 rounded-md text-xs border transition-colors cursor-pointer ${
                  symN === String(nVal)
                    ? 'bg-[#526B58] dark:bg-[#6F9278] text-white border-[#526B58] dark:border-[#6F9278]'
                    : 'border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25]'
                }`}
              >
                <MathInline tex={`S_{${nVal}}`} />
              </button>
            ))}
          </div>
        </div>

        {loadingSym && (
          <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
            Generating <MathInline tex={`S_{${symN}}`} />...
          </div>
        )}

        {symResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/50 dark:bg-[#141815]">
                <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  <MathInline tex={`|S_{${symResult.n}}|`} />
                </div>
                <div className="font-mono text-lg font-semibold tabular-nums">
                  {symResult.total_order}
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/50 dark:bg-[#141815]">
                <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  Even <MathInline tex={`|A_{${symResult.n}}|`} />
                </div>
                <div className="font-mono text-lg font-semibold tabular-nums">
                  {symResult.even_count}
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/50 dark:bg-[#141815]">
                <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Odd Count</div>
                <div className="font-mono text-lg font-semibold tabular-nums">
                  {symResult.odd_count}
                </div>
              </div>
              <div className="p-3.5 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/50 dark:bg-[#141815]">
                <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  <MathInline tex={`|A_{${symResult.n}}| = \\frac{n!}{2}`} />
                </div>
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#526B58] dark:text-[#8FB498] mt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{symResult.an_verified ? 'Verified' : 'Mismatch'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex p-1 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#EAE6DC] dark:bg-[#232B25]">
                    {[
                      { id: 'all', label: `All (${symResult.total_order})`, tex: null },
                      {
                        id: 'even',
                        label: `Even (${symResult.even_count})`,
                        tex: `A_{${symResult.n}}`,
                      },
                      { id: 'odd', label: `Odd (${symResult.odd_count})`, tex: null },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setParityFilter(f.id as typeof parityFilter)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                          parityFilter === f.id
                            ? 'bg-[#FFFFFF] dark:bg-[#1C221E] text-[#373B35] dark:text-[#ECEEE9]'
                            : 'text-[#656B61] dark:text-[#A2ACA0]'
                        }`}
                      >
                        {f.tex ? (
                          <>
                            Even <MathInline tex={f.tex} /> ({symResult.even_count})
                          </>
                        ) : (
                          f.label
                        )}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                    Click a row to inspect in analyzer
                  </span>
                </div>

                <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] overflow-hidden">
                  <div className="max-h-80 overflow-auto">
                    <table className="w-full text-left text-xs tabular-nums">
                      <thead className="sticky top-0 bg-[#F3F0E8] dark:bg-[#232B25] text-[#656B61] dark:text-[#A2ACA0] border-b border-[#D8D4C9] dark:border-[#2D3730]">
                        <tr>
                          <th className="py-2 px-3 font-medium">Disjoint Cycles</th>
                          <th className="py-2 px-3 font-medium">One-Line</th>
                          <th className="py-2 px-3 font-medium">
                            <MathInline tex="\operatorname{ord}(\sigma)" />
                          </th>
                          <th className="py-2 px-3 font-medium">
                            <MathInline tex="\operatorname{sign}(\sigma)" />
                          </th>
                          <th className="py-2 px-3 font-medium">Parity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D8D4C9] dark:divide-[#2D3730]">
                        {filteredPerms.map((p, idx) => (
                          <tr
                            key={idx}
                            onClick={() => {
                              setPermInput(p.cycle_notation);
                              setDegreeInput(String(symResult.n));
                              void runAnalyze(p.cycle_notation, String(symResult.n));
                            }}
                            className="hover:bg-[#C8D3BD]/30 dark:hover:bg-[#263229] cursor-pointer"
                          >
                            <td className="py-2 px-3 font-semibold">
                              <MathExpr value={p.cycle_notation} />
                            </td>
                            <td className="py-2 px-3 font-mono">{p.one_line_notation}</td>
                            <td className="py-2 px-3 font-mono">{p.order}</td>
                            <td className="py-2 px-3 font-mono">
                              {p.sign > 0 ? '+1' : '-1'}
                            </td>
                            <td className="py-2 px-3">{p.parity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/40 dark:bg-[#141815] p-4">
                <OrderChart
                  distribution={symResult.order_distribution}
                  groupName={symResult.group_name}
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
