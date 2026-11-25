import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import type {
  AbelianElement,
  AbelianGroupResult,
  AppStats,
  ClassificationResult,
  ModuleId,
  ReportSnapshot,
} from '../../types/symmetry';
import { ExplanationDrawer } from '../ExplanationDrawer';
import { MathExpr, MathInline, MathText } from '../MathExpr';
import { OrderChart } from '../OrderChart';

interface AbelianViewProps {
  initialParams?: Record<string, unknown> | null;
  onRecordActivity: (opts: {
    module: ModuleId;
    type: string;
    description: string;
    params: Record<string, unknown>;
    statsDelta: Partial<AppStats>;
    report: ReportSnapshot;
  }) => void;
  onOpenCayley: (moduli: number[]) => void;
}

const CYCLIC_PRESETS = [2, 4, 6, 8, 12];
const PRODUCT_PRESETS = [
  { label: 'Z₂ × Z₂', tex: '\\mathbb{Z}_2 \\times \\mathbb{Z}_2', moduli: [2, 2] },
  { label: 'Z₂ × Z₄', tex: '\\mathbb{Z}_2 \\times \\mathbb{Z}_4', moduli: [2, 4] },
  {
    label: 'Z₂ × Z₂ × Z₃',
    tex: '\\mathbb{Z}_2 \\times \\mathbb{Z}_2 \\times \\mathbb{Z}_3',
    moduli: [2, 2, 3],
  },
];

export const AbelianView: React.FC<AbelianViewProps> = ({
  initialParams,
  onRecordActivity,
  onOpenCayley,
}) => {
  const [tab, setTab] = useState<'explorer' | 'classify'>(
    initialParams?.tab === 'classify' ? 'classify' : 'explorer'
  );
  const [components, setComponents] = useState<string[]>(() => {
    if (Array.isArray(initialParams?.moduli) && initialParams.moduli.length > 0) {
      return initialParams.moduli.map((x) => String(x));
    }
    return ['4'];
  });
  const [classifyN, setClassifyN] = useState<string>(
    initialParams?.n ? String(initialParams.n) : '72'
  );

  const [groupResult, setGroupResult] = useState<AbelianGroupResult | null>(null);
  const [selectedElem, setSelectedElem] = useState<AbelianElement | null>(null);
  const [classifyResult, setClassifyResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runExplore = async (rawModuli: string[]) => {
    setError(null);
    setLoading(true);
    try {
      const parsed: number[] = [];
      for (let i = 0; i < rawModuli.length; i++) {
        const trimmed = rawModuli[i].trim();
        if (trimmed === '' || !/^-?\d+$/.test(trimmed)) {
          throw new Error(`Component ${i + 1} must be a positive integer.`);
        }
        parsed.push(Number(trimmed));
      }
      const data = await api.exploreAbelian(parsed);
      setGroupResult(data);
      setSelectedElem(data.elements[0] ?? null);
      onRecordActivity({
        module: 'abelian',
        type: 'Abelian Group',
        description: `Explored ${data.group_name} (order ${data.order})`,
        params: { tab: 'explorer', moduli: data.moduli },
        statsDelta: {
          groupsExplored: 1,
          calculationsPerformed: 1,
          elementsAnalyzed: data.order,
        },
        report: {
          id: `abelian-${Date.now()}`,
          title: 'Finite Abelian Group Analysis',
          module: 'abelian',
          groupOrSubject: data.group_name,
          inputsSummary: `Moduli = [${data.moduli.join(', ')}]`,
          formulas: [data.explanation.formula],
          summary: data.explanation.summary,
          verificationLines: data.explanation.reasoning,
          tableHeaders: ['Element', 'Inverse', 'Order', 'Generator'],
          tableRows: data.elements.map((e) => [
            e.label,
            e.inverse,
            String(e.order),
            e.is_generator ? 'Yes' : 'No',
          ]),
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze Abelian group.');
    } finally {
      setLoading(false);
    }
  };

  const runClassify = async (rawN: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.classifyAbelian(rawN.trim());
      setClassifyResult(data);
      onRecordActivity({
        module: 'abelian',
        type: 'Abelian Classification',
        description: `Classified Abelian groups of order ${data.n} (${data.total_groups} groups)`,
        params: { tab: 'classify', n: data.n },
        statsDelta: {
          groupsExplored: data.total_groups,
          calculationsPerformed: 1,
        },
        report: {
          id: `classify-${Date.now()}`,
          title: 'Finite Abelian Group Classification',
          module: 'abelian',
          groupOrSubject: `Order ${data.n} (${data.factorization_str})`,
          inputsSummary: `n = ${data.n}`,
          formulas: [data.explanation.formula, `N(${data.n}) = ${data.formula_str}`],
          summary: data.explanation.summary,
          verificationLines: data.explanation.reasoning,
          tableHeaders: ['#', 'Invariant Factors', 'Elementary Divisors', 'Order', 'Cyclic'],
          tableRows: data.groups.map((g) => [
            String(g.index),
            g.invariant_notation,
            g.elementary_notation,
            String(g.verified_order),
            g.is_cyclic ? 'Yes' : 'No',
          ]),
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to classify order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialParams?.tab === 'classify') {
      const nVal = initialParams?.n ? String(initialParams.n) : '72';
      setTab('classify');
      setClassifyN(nVal);
      void runClassify(nVal);
    } else if (Array.isArray(initialParams?.moduli) && initialParams.moduli.length > 0) {
      const next = initialParams.moduli.map((x) => String(x));
      setTab('explorer');
      setComponents(next);
      void runExplore(next);
    } else {
      setTab('explorer');
      setComponents(['4']);
      void runExplore(['4']);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialParams]);

  const handleTabSwitch = (nextTab: 'explorer' | 'classify') => {
    setError(null);
    setTab(nextTab);
    if (nextTab === 'classify' && !classifyResult) {
      void runClassify(classifyN);
    }
  };

  const applyPreset = (moduli: number[]) => {
    const next = moduli.map((m) => String(m));
    setComponents(next);
    void runExplore(next);
  };

  const handleResetExplorer = () => {
    setComponents(['4']);
    void runExplore(['4']);
  };

  return (
    <div className="space-y-6">
      {/* Sub-mode tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex flex-wrap max-w-full p-1 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#EAE6DC] dark:bg-[#232B25] gap-1">
          <button
            type="button"
            onClick={() => handleTabSwitch('explorer')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'explorer'
                ? 'bg-[#FFFFFF] dark:bg-[#1C221E] text-[#373B35] dark:text-[#ECEEE9]'
                : 'text-[#656B61] dark:text-[#A2ACA0] hover:text-[#373B35] dark:hover:text-[#ECEEE9]'
            }`}
          >
            Cyclic & Direct Product Builder
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('classify')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              tab === 'classify'
                ? 'bg-[#FFFFFF] dark:bg-[#1C221E] text-[#373B35] dark:text-[#ECEEE9]'
                : 'text-[#656B61] dark:text-[#A2ACA0] hover:text-[#373B35] dark:hover:text-[#ECEEE9]'
            }`}
          >
            Classification of Order <MathInline tex="n" />
          </button>
        </div>

        <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
          Enumeration cap: <MathInline tex="|G| \le 256" />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 p-3.5 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 text-sm"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {tab === 'explorer' ? (
        <div className="space-y-6">
          {/* Builder Controls */}
          <section className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="font-display text-base font-semibold text-[#373B35] dark:text-[#ECEEE9]">
                  Custom Group Builder
                </h2>
                <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  Add or remove cyclic factors <MathInline tex="\mathbb{Z}_n" /> to construct cyclic
                  groups or direct products{' '}
                  <MathInline tex="\mathbb{Z}_{n_1} \times \cdots \times \mathbb{Z}_{n_k}" />.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#656B61] dark:text-[#A2ACA0] mr-1">Presets:</span>
                {CYCLIC_PRESETS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Preset Z_${n}`}
                    onClick={() => applyPreset([n])}
                    className="px-2.5 py-1 rounded text-xs border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 dark:hover:bg-[#2E3A31] transition-colors cursor-pointer"
                  >
                    <MathInline tex={`\\mathbb{Z}_{${n}}`} />
                  </button>
                ))}
                {PRODUCT_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    aria-label={p.label}
                    onClick={() => applyPreset(p.moduli)}
                    className="px-2.5 py-1 rounded text-xs border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 dark:hover:bg-[#2E3A31] transition-colors cursor-pointer"
                  >
                    <MathInline tex={p.tex} />
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void runExplore(components);
              }}
              className="space-y-4"
            >
              <div className="flex flex-wrap items-center gap-3">
                {components.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    {idx > 0 && (
                      <span className="text-sm text-[#656B61] dark:text-[#A2ACA0]">
                        <MathInline tex="\times" />
                      </span>
                    )}
                    <div className="flex items-center rounded-md border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#141815] px-2.5 py-1.5 gap-1.5">
                      <span className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                        <MathInline tex="\mathbb{Z}_n,\; n=" />
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={256}
                        value={val}
                        aria-label={`Cyclic component ${idx + 1} modulus`}
                        onChange={(e) => {
                          const next = [...components];
                          next[idx] = e.target.value;
                          setComponents(next);
                        }}
                        className="w-16 bg-transparent font-mono text-sm tabular-nums text-[#373B35] dark:text-[#ECEEE9] focus:outline-none"
                      />
                      {components.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setComponents(components.filter((_, i) => i !== idx))}
                          aria-label={`Remove component ${idx + 1}`}
                          className="p-0.5 text-[#656B61] hover:text-red-600 dark:text-[#A2ACA0] dark:hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {components.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setComponents([...components, '2'])}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border border-dashed border-[#526B58]/60 dark:border-[#6F9278]/60 text-[#526B58] dark:text-[#8FB498] hover:bg-[#C8D3BD]/25 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Factor</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-md text-xs font-semibold bg-[#526B58] dark:bg-[#6F9278] text-white hover:bg-[#435948] dark:hover:bg-[#7EA488] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {loading ? 'Computing...' : 'Generate Group'}
                </button>
                <button
                  type="button"
                  onClick={handleResetExplorer}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] text-[#373B35] dark:text-[#ECEEE9] hover:bg-[#C8D3BD]/40 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
                {groupResult && groupResult.order <= 24 && (
                  <button
                    type="button"
                    onClick={() => onOpenCayley(groupResult.moduli)}
                    className="px-3 py-2 rounded-md text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] text-[#526B58] dark:text-[#8FB498] hover:bg-[#C8D3BD]/25 transition-colors cursor-pointer"
                  >
                    Open Cayley Table for <MathExpr value={groupResult.group_name} />
                  </button>
                )}
              </div>
            </form>
          </section>

          {groupResult && (
            <>
              {/* Key Group Properties */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-3.5">
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Notation</div>
                  <div className="text-base font-semibold mt-0.5">
                    <MathExpr value={groupResult.group_name} />
                  </div>
                </div>
                <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-3.5">
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                    Order <MathInline tex="|G|" />
                  </div>
                  <div className="font-mono text-base font-semibold tabular-nums mt-0.5">
                    {groupResult.order}
                  </div>
                </div>
                <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-3.5">
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Identity</div>
                  <div className="font-mono text-base font-semibold mt-0.5">
                    <MathInline tex={groupResult.identity} />
                  </div>
                </div>
                <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-3.5">
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                    Max <MathInline tex="\operatorname{ord}(a)" />
                  </div>
                  <div className="font-mono text-base font-semibold tabular-nums mt-0.5">
                    {groupResult.max_element_order}
                  </div>
                </div>
                <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-3.5">
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Cyclic</div>
                  <div className="text-sm font-semibold mt-1 text-[#526B58] dark:text-[#8FB498]">
                    {groupResult.is_cyclic ? 'Yes (Cyclic)' : 'No (Non-Cyclic)'}
                  </div>
                </div>
                <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-3.5">
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Generators</div>
                  <div className="font-mono text-base font-semibold tabular-nums mt-0.5">
                    {groupResult.is_cyclic ? groupResult.generator_count : 'None'}
                  </div>
                </div>
              </div>

              {/* Generators summary if cyclic */}
              {groupResult.is_cyclic && (
                <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4">
                  <div className="text-xs font-medium text-[#656B61] dark:text-[#A2ACA0] mb-1.5">
                    All Generators of <MathExpr value={groupResult.group_name} /> (
                    {groupResult.generator_count})
                  </div>
                  <div className="text-xs sm:text-sm text-[#373B35] dark:text-[#ECEEE9] break-words">
                    <MathInline tex={`\\{${groupResult.generators.join(',\\; ')}\\}`} />
                  </div>
                </div>
              )}

              {/* Elements Table + Detail Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#D8D4C9] dark:border-[#2D3730] flex items-center justify-between">
                    <h3 className="font-display text-sm font-semibold">
                      Group Elements (<MathInline tex={`|G|=${groupResult.order}`} />)
                    </h3>
                    <span className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                      Click any row to inspect details
                    </span>
                  </div>
                  <div className="max-h-96 overflow-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="sticky top-0 bg-[#F3F0E8] dark:bg-[#232B25] text-[#656B61] dark:text-[#A2ACA0] border-b border-[#D8D4C9] dark:border-[#2D3730]">
                        <tr>
                          <th className="py-2.5 px-4 font-medium">
                            Element (<MathInline tex="a" />)
                          </th>
                          <th className="py-2.5 px-4 font-medium">
                            Inverse (<MathInline tex="-a" />)
                          </th>
                          <th className="py-2.5 px-4 font-medium">
                            Order (<MathInline tex="\operatorname{ord}(a)" />)
                          </th>
                          <th className="py-2.5 px-4 font-medium">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D8D4C9] dark:divide-[#2D3730]">
                        {groupResult.elements.map((el) => {
                          const active = selectedElem?.label === el.label;
                          return (
                            <tr
                              key={el.label}
                              onClick={() => setSelectedElem(el)}
                              className={`cursor-pointer transition-colors ${
                                active
                                  ? 'bg-[#C8D3BD]/45 dark:bg-[#263229]'
                                  : 'hover:bg-[#F3F0E8]/60 dark:hover:bg-[#232B25]/50'
                              }`}
                            >
                              <td className="py-2 px-4 font-mono font-medium tabular-nums">
                                <MathInline tex={el.label} />
                              </td>
                              <td className="py-2 px-4 font-mono tabular-nums">
                                <MathInline tex={el.inverse} />
                              </td>
                              <td className="py-2 px-4 font-mono tabular-nums">{el.order}</td>
                              <td className="py-2 px-4 text-xs text-[#656B61] dark:text-[#A2ACA0]">
                                {el.is_identity
                                  ? 'Identity'
                                  : el.is_generator
                                    ? 'Generator'
                                    : 'Element'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <div className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4 space-y-3">
                    <h3 className="font-display text-sm font-semibold">Selected Element</h3>
                    {selectedElem ? (
                      <div className="space-y-2.5 text-sm">
                        <div className="p-3 rounded-md bg-[#F3F0E8] dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730]">
                          <div className="text-lg font-semibold">
                            <MathInline tex={selectedElem.label} />
                          </div>
                          <div className="text-xs text-[#656B61] dark:text-[#A2ACA0] mt-0.5">
                            {selectedElem.is_identity ? (
                              'Identity element'
                            ) : selectedElem.is_generator ? (
                              <>
                                Generator of <MathExpr value={groupResult.group_name} />
                              </>
                            ) : (
                              'Non-generating element'
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 rounded border border-[#D8D4C9] dark:border-[#2D3730]">
                            <div className="text-[#656B61] dark:text-[#A2ACA0]">
                              Order <MathInline tex="\operatorname{ord}(a)" />
                            </div>
                            <div className="font-mono text-sm font-semibold tabular-nums mt-0.5">
                              {selectedElem.order}
                            </div>
                          </div>
                          <div className="p-2.5 rounded border border-[#D8D4C9] dark:border-[#2D3730]">
                            <div className="text-[#656B61] dark:text-[#A2ACA0]">
                              Inverse <MathInline tex="-a" />
                            </div>
                            <div className="text-sm font-semibold tabular-nums mt-0.5">
                              <MathInline tex={selectedElem.inverse} />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-[#656B61] dark:text-[#A2ACA0] leading-relaxed">
                          <MathText text={selectedElem.order_explanation} />
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                        Select an element row from the table.
                      </p>
                    )}
                  </div>

                  <div className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4">
                    <OrderChart
                      distribution={groupResult.order_distribution}
                      groupName={groupResult.group_name}
                    />
                  </div>
                </div>
              </div>

              <ExplanationDrawer
                explanation={groupResult.explanation}
                formulaNote="Here, ord(a) represents the order of element a, gcd(n, a) is the greatest common divisor of n and a, and lcm computes the least common multiple of coordinate orders."
              />
            </>
          )}
        </div>
      ) : (
        /* Classification Tab */
        <div className="space-y-6">
          <section className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-semibold">
                  Finite Abelian Group Classification
                </h2>
                <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  Enumerate all non-isomorphic Abelian groups of order{' '}
                  <MathInline tex="n = p_1^{a_1} \cdots p_k^{a_k}" /> via integer partitions{' '}
                  <MathInline tex="\prod p(a_i)" />.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[12, 24, 36, 72, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setClassifyN(String(val));
                      void runClassify(String(val));
                    }}
                    className="px-2.5 py-1 rounded text-xs border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 transition-colors cursor-pointer"
                  >
                    <MathInline tex={`n=${val}`} />
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void runClassify(classifyN);
              }}
              className="flex flex-wrap items-end gap-3"
            >
              <div>
                <label
                  htmlFor="classify-n-input"
                  className="block text-xs font-medium text-[#656B61] dark:text-[#A2ACA0] mb-1"
                >
                  Positive integer order <MathInline tex="n" /> (
                  <MathInline tex="1 \le n \le 100{,}000" />)
                </label>
                <input
                  id="classify-n-input"
                  type="number"
                  min={1}
                  max={100000}
                  value={classifyN}
                  onChange={(e) => setClassifyN(e.target.value)}
                  className="w-44 px-3 py-2 rounded-md border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#141815] font-mono text-sm tabular-nums text-[#373B35] dark:text-[#ECEEE9]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-md text-xs font-semibold bg-[#526B58] dark:bg-[#6F9278] text-white hover:bg-[#435948] dark:hover:bg-[#7EA488] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? 'Classifying...' : 'Classify Order'}
              </button>
            </form>
          </section>

          {classifyResult && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4">
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                    Order <MathInline tex="n" />
                  </div>
                  <div className="font-mono text-lg font-semibold tabular-nums mt-0.5">
                    {classifyResult.n}
                  </div>
                </div>
                <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4">
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                    Prime Factorization
                  </div>
                  <div className="text-base font-semibold mt-0.5">
                    <MathExpr value={classifyResult.factorization_str} />
                  </div>
                </div>
                <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4">
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                    Non-Isomorphic Groups
                  </div>
                  <div className="font-mono text-lg font-semibold tabular-nums mt-0.5">
                    {classifyResult.total_groups}
                  </div>
                </div>
                <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4">
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                    Partition Formula <MathInline tex="N(n)" />
                  </div>
                  <div className="text-sm font-semibold mt-1">
                    <MathExpr value={classifyResult.formula_str} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#D8D4C9] dark:border-[#2D3730] flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-sm font-semibold">
                    All {classifyResult.total_groups} Non-Isomorphic Abelian Groups of Order{' '}
                    {classifyResult.n}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 text-xs text-[#526B58] dark:text-[#8FB498]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {classifyResult.all_orders_verified
                        ? 'All group orders & divisibility chains verified'
                        : 'Verification incomplete'}
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead className="bg-[#F3F0E8] dark:bg-[#232B25] text-[#656B61] dark:text-[#A2ACA0] border-b border-[#D8D4C9] dark:border-[#2D3730]">
                      <tr>
                        <th className="py-2.5 px-4 font-medium">#</th>
                        <th className="py-2.5 px-4 font-medium">
                          Invariant-Factor Form (<MathInline tex="d_1 \mid d_2 \mid \cdots" />)
                        </th>
                        <th className="py-2.5 px-4 font-medium">Elementary-Divisor Form</th>
                        <th className="py-2.5 px-4 font-medium">Verified Order</th>
                        <th className="py-2.5 px-4 font-medium">Cyclic</th>
                        <th className="py-2.5 px-4 font-medium">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D4C9] dark:divide-[#2D3730]">
                      {classifyResult.groups.map((grp) => (
                        <tr key={grp.index}>
                          <td className="py-2.5 px-4 font-mono tabular-nums">{grp.index}</td>
                          <td className="py-2.5 px-4 font-semibold">
                            <MathExpr value={grp.invariant_notation} />
                          </td>
                          <td className="py-2.5 px-4">
                            <MathExpr value={grp.elementary_notation} />
                          </td>
                          <td className="py-2.5 px-4 font-mono tabular-nums">
                            {grp.verified_order}
                          </td>
                          <td className="py-2.5 px-4 text-xs">
                            {grp.is_cyclic ? 'Cyclic' : 'Non-Cyclic'}
                          </td>
                          <td className="py-2.5 px-4">
                            {grp.verified_order <= 256 ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = grp.invariant_factors.map((d) => String(d));
                                  setTab('explorer');
                                  setComponents(next);
                                  void runExplore(next);
                                }}
                                className="text-xs font-medium text-[#526B58] dark:text-[#8FB498] hover:underline cursor-pointer"
                              >
                                Explore
                              </button>
                            ) : (
                              <span className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                                <MathInline tex="> 256" />
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <ExplanationDrawer
                explanation={classifyResult.explanation}
                formulaNote="Here, p(a_i) denotes the integer partition function of exponent a_i in the prime factorization of n."
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
