import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import type { AppStats, CayleyResult, ModuleId, ReportSnapshot } from '../../types/symmetry';
import { ExplanationDrawer } from '../ExplanationDrawer';
import { MathExpr, MathInline, MathText } from '../MathExpr';

interface CayleyViewProps {
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

const DEFAULT_NON_GROUP_MATRIX = [
  ['0', '2', '1'],
  ['1', '0', '2'],
  ['2', '1', '0'],
];

export const CayleyView: React.FC<CayleyViewProps> = ({ initialParams, onRecordActivity }) => {
  const [groupType, setGroupType] = useState<'abelian' | 'dihedral' | 'permutation' | 'custom'>(
    (initialParams?.group_type as 'abelian' | 'dihedral' | 'permutation' | 'custom') || 'abelian'
  );
  const [moduliInput, setModuliInput] = useState<string>(
    Array.isArray(initialParams?.moduli) ? initialParams.moduli.join(', ') : '4'
  );
  const [dihedralN, setDihedralN] = useState<string>(
    initialParams?.n && initialParams?.group_type === 'dihedral' ? String(initialParams.n) : '4'
  );
  const [permN, setPermN] = useState<string>(
    initialParams?.n && initialParams?.group_type === 'permutation' ? String(initialParams.n) : '3'
  );
  const [customMatrix, setCustomMatrix] = useState<string[][]>(DEFAULT_NON_GROUP_MATRIX);

  const [result, setResult] = useState<CayleyResult | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runGenerate = async (overridePayload?: Record<string, unknown>) => {
    setError(null);
    setLoading(true);
    try {
      let payload: Record<string, unknown>;
      if (overridePayload) {
        payload = overridePayload;
      } else if (groupType === 'abelian') {
        const parts = moduliInput
          .split(/[\s,×x]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        if (parts.length === 0 || parts.some((p) => !/^-?\d+$/.test(p))) {
          throw new Error('Enter positive integer moduli separated by commas (e.g., 2, 2 or 6).');
        }
        payload = { group_type: 'abelian', moduli: parts.map(Number) };
      } else if (groupType === 'dihedral') {
        payload = { group_type: 'dihedral', n: Number(dihedralN) };
      } else if (groupType === 'permutation') {
        payload = { group_type: 'permutation', n: Number(permN) };
      } else {
        payload = {
          group_type: 'custom',
          name: 'Custom 3-Element Table (a - b mod 3)',
          labels: ['0', '1', '2'],
          matrix: customMatrix,
        };
      }

      const data = await api.generateCayley(payload);
      setResult(data);
      setSelectedCell({ row: 0, col: 0 });
      onRecordActivity({
        module: 'cayley',
        type: 'Cayley Table',
        description: `Generated Cayley table for ${data.group_name} (order ${data.order})`,
        params: payload,
        statsDelta: {
          groupsExplored: 1,
          calculationsPerformed: 1,
          elementsAnalyzed: data.order,
        },
        report: {
          id: `cayley-${Date.now()}`,
          title: 'Cayley Table & Axiom Verification',
          module: 'cayley',
          groupOrSubject: data.group_name,
          inputsSummary: `${data.group_type} · order ${data.order}`,
          formulas: [data.explanation.formula],
          summary: data.explanation.summary,
          verificationLines: data.explanation.reasoning,
          tableHeaders: [data.operation_symbol, ...data.labels],
          tableRows: data.labels.map((lbl, rIdx) => [lbl, ...data.matrix[rIdx]]),
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate Cayley table.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialParams && initialParams.group_type) {
      const gt = initialParams.group_type as 'abelian' | 'dihedral' | 'permutation' | 'custom';
      setGroupType(gt);
      if (gt === 'abelian' && Array.isArray(initialParams.moduli)) {
        setModuliInput(initialParams.moduli.join(', '));
      } else if (gt === 'dihedral' && initialParams.n) {
        setDihedralN(String(initialParams.n));
      } else if (gt === 'permutation' && initialParams.n) {
        setPermN(String(initialParams.n));
      } else if (gt === 'custom' && Array.isArray(initialParams.matrix)) {
        setCustomMatrix(initialParams.matrix as string[][]);
      }
      void runGenerate(initialParams);
    } else {
      void runGenerate({ group_type: 'abelian', moduli: [4] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialParams]);

  const axiomList = result
    ? [
        { name: 'Closure', data: result.verification.closure },
        { name: 'Identity', data: result.verification.identity },
        { name: 'Inverses', data: result.verification.inverses },
        { name: 'Associativity', data: result.verification.associativity },
        { name: 'Commutativity', data: result.verification.commutativity },
      ]
    : [];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">
              Cayley Table Generator & Axiom Verifier
            </h2>
            <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
              Generate tables up to <MathInline tex="|G| \le 24" /> or test a custom operation
              table to verify group axioms.
            </p>
          </div>
          <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
            Max table size: <MathInline tex="24 \times 24" />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#EAE6DC] dark:bg-[#232B25] w-fit max-w-full">
          {[
            { id: 'abelian', label: 'Abelian', tex: '\\mathbb{Z}_n / \\text{Product}' },
            { id: 'dihedral', label: 'Dihedral', tex: 'D_n' },
            { id: 'permutation', label: 'Symmetric', tex: 'S_n' },
            { id: 'custom', label: 'Custom Axiom Test', tex: null },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setGroupType(opt.id as typeof groupType)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                groupType === opt.id
                  ? 'bg-[#FFFFFF] dark:bg-[#1C221E] text-[#373B35] dark:text-[#ECEEE9]'
                  : 'text-[#656B61] dark:text-[#A2ACA0] hover:text-[#373B35] dark:hover:text-[#ECEEE9]'
              }`}
            >
              {opt.label}
              {opt.tex && (
                <>
                  {' '}
                  (<MathInline tex={opt.tex} />)
                </>
              )}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runGenerate();
          }}
          className="space-y-4"
        >
          {groupType === 'abelian' && (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-[#656B61] dark:text-[#A2ACA0] mb-1">
                  Moduli (comma-separated, e.g. <MathInline tex="4" /> or{' '}
                  <MathInline tex="2, 2" /> or <MathInline tex="2, 4" />)
                </label>
                <input
                  type="text"
                  value={moduliInput}
                  onChange={(e) => setModuliInput(e.target.value)}
                  className="w-56 px-3 py-2 rounded-md border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#141815] font-mono text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Z_4', tex: '\\mathbb{Z}_4', val: '4' },
                  { label: 'Z_2 × Z_2', tex: '\\mathbb{Z}_2 \\times \\mathbb{Z}_2', val: '2, 2' },
                  { label: 'Z_6', tex: '\\mathbb{Z}_6', val: '6' },
                  { label: 'Z_2 × Z_4', tex: '\\mathbb{Z}_2 \\times \\mathbb{Z}_4', val: '2, 4' },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    aria-label={p.label}
                    onClick={() => {
                      setModuliInput(p.val);
                      void runGenerate({
                        group_type: 'abelian',
                        moduli: p.val.split(',').map((s) => Number(s.trim())),
                      });
                    }}
                    className="px-2.5 py-2 rounded text-xs border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 cursor-pointer"
                  >
                    <MathInline tex={p.tex} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {groupType === 'dihedral' && (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-[#656B61] dark:text-[#A2ACA0] mb-1">
                  Polygon sides <MathInline tex="n" /> (<MathInline tex="3 \le n \le 12" />)
                </label>
                <input
                  type="number"
                  min={3}
                  max={12}
                  value={dihedralN}
                  onChange={(e) => setDihedralN(e.target.value)}
                  className="w-36 px-3 py-2 rounded-md border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#141815] font-mono text-sm tabular-nums"
                />
              </div>
              {[3, 4, 5, 6].map((nVal) => (
                <button
                  key={nVal}
                  type="button"
                  onClick={() => {
                    setDihedralN(String(nVal));
                    void runGenerate({ group_type: 'dihedral', n: nVal });
                  }}
                  className="px-2.5 py-2 rounded text-xs border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 cursor-pointer"
                >
                  <MathInline tex={`D_{${nVal}}`} />
                </button>
              ))}
            </div>
          )}

          {groupType === 'permutation' && (
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-xs font-medium text-[#656B61] dark:text-[#A2ACA0] mb-1">
                  Symmetric group degree <MathInline tex="n" /> (
                  <MathInline tex="1 \le n \le 4" />)
                </label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={permN}
                  onChange={(e) => setPermN(e.target.value)}
                  className="w-36 px-3 py-2 rounded-md border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#141815] font-mono text-sm tabular-nums"
                />
              </div>
              {[2, 3, 4].map((nVal) => (
                <button
                  key={nVal}
                  type="button"
                  onClick={() => {
                    setPermN(String(nVal));
                    void runGenerate({ group_type: 'permutation', n: nVal });
                  }}
                  className="px-2.5 py-2 rounded text-xs border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 cursor-pointer"
                >
                  <MathInline tex={`S_{${nVal}}`} /> ({nVal === 2 ? 2 : nVal === 3 ? 6 : 24})
                </button>
              ))}
            </div>
          )}

          {groupType === 'custom' && (
            <div className="space-y-2">
              <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                Edit the <MathInline tex="3 \times 3" /> operation table on{' '}
                <MathInline tex="\{0, 1, 2\}" /> (initialized to{' '}
                <MathInline tex="(a - b) \bmod 3" />, which fails identity and associativity) to
                test real axiom verification:
              </div>
              <div className="inline-block rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] overflow-hidden">
                <table className="text-xs font-mono">
                  <thead className="bg-[#F3F0E8] dark:bg-[#232B25]">
                    <tr>
                      <th className="p-2 border-b border-r border-[#D8D4C9] dark:border-[#2D3730]">
                        <MathInline tex="*" />
                      </th>
                      {['0', '1', '2'].map((lbl) => (
                        <th key={lbl} className="p-2 border-b border-[#D8D4C9] dark:border-[#2D3730] w-14 text-center">
                          {lbl}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['0', '1', '2'].map((rowLbl, rIdx) => (
                      <tr key={rowLbl}>
                        <th className="p-2 border-r border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25]">
                          {rowLbl}
                        </th>
                        {[0, 1, 2].map((cIdx) => (
                          <td key={cIdx} className="p-1 border-b border-[#D8D4C9] dark:border-[#2D3730]">
                            <input
                              type="text"
                              value={customMatrix[rIdx][cIdx]}
                              onChange={(e) => {
                                const next = customMatrix.map((row) => [...row]);
                                next[rIdx][cIdx] = e.target.value;
                                setCustomMatrix(next);
                              }}
                              className="w-12 text-center py-1 rounded bg-[#F3F0E8] dark:bg-[#141815] text-[#373B35] dark:text-[#ECEEE9]"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md text-xs font-semibold bg-[#526B58] dark:bg-[#6F9278] text-white hover:bg-[#435948] dark:hover:bg-[#7EA488] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Generating & Verifying...' : 'Generate & Verify Table'}
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
          {/* Selected Cell Bar */}
          {selectedCell && (
            <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Selected Operation</div>
                <div className="text-base font-semibold mt-0.5">
                  <MathExpr
                    value={`${result.labels[selectedCell.row]} ${result.operation_symbol} ${result.labels[selectedCell.col]} = ${result.matrix[selectedCell.row][selectedCell.col]}`}
                  />
                </div>
              </div>
              <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                <MathText text={result.operation_description} />
              </div>
            </div>
          )}

          {/* Table + Axiom Verification */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-8 rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#D8D4C9] dark:border-[#2D3730] flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold">
                  Cayley Table — <MathExpr value={result.group_name} /> (
                  <MathInline tex={`${result.order} \\times ${result.order}`} />)
                </h3>
                <span className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  Click a cell to highlight row & column
                </span>
              </div>
              <div className="overflow-auto max-h-[540px]">
                <table className="border-collapse text-xs tabular-nums w-full">
                  <thead>
                    <tr>
                      <th className="sticky top-0 left-0 z-20 p-2.5 bg-[#EAE6DC] dark:bg-[#232B25] border-b border-r border-[#D8D4C9] dark:border-[#2D3730] text-center font-semibold">
                        <MathExpr value={result.operation_symbol} />
                      </th>
                      {result.labels.map((colLbl, cIdx) => {
                        const isColActive = selectedCell?.col === cIdx;
                        return (
                          <th
                            key={colLbl + cIdx}
                            className={`sticky top-0 z-10 p-2.5 border-b border-r border-[#D8D4C9] dark:border-[#2D3730] text-center whitespace-nowrap ${
                              isColActive
                                ? 'bg-[#526B58] dark:bg-[#6F9278] text-white'
                                : 'bg-[#F3F0E8] dark:bg-[#232B25] text-[#373B35] dark:text-[#ECEEE9]'
                            }`}
                          >
                            <MathExpr value={colLbl} />
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {result.labels.map((rowLbl, rIdx) => {
                      const isRowActive = selectedCell?.row === rIdx;
                      return (
                        <tr key={rowLbl + rIdx}>
                          <th
                            className={`sticky left-0 z-10 p-2.5 border-b border-r border-[#D8D4C9] dark:border-[#2D3730] text-center whitespace-nowrap ${
                              isRowActive
                                ? 'bg-[#526B58] dark:bg-[#6F9278] text-white'
                                : 'bg-[#F3F0E8] dark:bg-[#232B25] text-[#373B35] dark:text-[#ECEEE9]'
                            }`}
                          >
                            <MathExpr value={rowLbl} />
                          </th>
                          {result.matrix[rIdx].map((cellVal, cIdx) => {
                            const isExact = selectedCell?.row === rIdx && selectedCell?.col === cIdx;
                            const isCross =
                              selectedCell?.row === rIdx || selectedCell?.col === cIdx;
                            return (
                              <td
                                key={`${rIdx}-${cIdx}`}
                                onClick={() => setSelectedCell({ row: rIdx, col: cIdx })}
                                className={`p-2.5 border-b border-r border-[#D8D4C9] dark:border-[#2D3730] text-center cursor-pointer whitespace-nowrap transition-colors ${
                                  isExact
                                    ? 'bg-[#526B58] dark:bg-[#6F9278] text-white font-semibold'
                                    : isCross
                                      ? 'bg-[#C8D3BD]/40 dark:bg-[#263229]'
                                      : 'hover:bg-[#F3F0E8] dark:hover:bg-[#232B25]/70'
                                }`}
                              >
                                <MathExpr value={cellVal} />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="xl:col-span-4 rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#D8D4C9] dark:border-[#2D3730] pb-2.5">
                <h3 className="font-display text-sm font-semibold">Axiom Verification</h3>
                <span
                  className={`text-xs font-semibold ${
                    result.verification.is_group
                      ? 'text-[#526B58] dark:text-[#8FB498]'
                      : 'text-red-700 dark:text-red-400'
                  }`}
                >
                  {result.verification.is_group ? 'Valid Group' : 'Not a Group'}
                </span>
              </div>
              <div className="space-y-2.5">
                {axiomList.map((ax) => (
                  <div
                    key={ax.name}
                    className="p-2.5 rounded-md border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/50 dark:bg-[#141815] space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span>{ax.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 ${
                          ax.data.passed
                            ? 'text-[#526B58] dark:text-[#8FB498]'
                            : 'text-red-700 dark:text-red-400'
                        }`}
                      >
                        {ax.data.passed ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Pass</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Fail</span>
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-[#656B61] dark:text-[#A2ACA0] leading-relaxed">
                      <MathText text={ax.data.detail} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ExplanationDrawer
            explanation={result.explanation}
            formulaNote="A finite set S with binary operation * forms a group if it satisfies closure, unique identity e, inverses a⁻¹, and associativity."
          />
        </div>
      )}
    </div>
  );
};
