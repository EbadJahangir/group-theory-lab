import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';
import type {
  AppStats,
  DihedralElement,
  DihedralResult,
  ModuleId,
  ReportSnapshot,
} from '../../types/symmetry';
import { ExplanationDrawer } from '../ExplanationDrawer';
import { MathExpr, MathInline, MathText } from '../MathExpr';

interface DihedralViewProps {
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

export const DihedralView: React.FC<DihedralViewProps> = ({
  initialParams,
  onRecordActivity,
}) => {
  const [nInput, setNInput] = useState<string>(
    initialParams?.n ? String(initialParams.n) : '6'
  );
  const [includeCayley, setIncludeCayley] = useState<boolean>(false);
  const [result, setResult] = useState<DihedralResult | null>(null);
  const [selectedElem, setSelectedElem] = useState<DihedralElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDihedral = async (rawN: string, withCayley: boolean) => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.exploreDihedral(rawN.trim(), withCayley);
      setResult(data);
      setSelectedElem(data.elements[1] ?? data.elements[0] ?? null);
      onRecordActivity({
        module: 'dihedral',
        type: 'Dihedral Group',
        description: `Explored D_${data.n} (order ${data.order}, Centre Z(D_${data.n}) = {${data.centre.join(', ')}})`,
        params: { n: data.n, include_cayley: withCayley },
        statsDelta: {
          groupsExplored: 1,
          calculationsPerformed: 1,
          dihedralExplored: 1,
          elementsAnalyzed: data.order,
        },
        report: {
          id: `dihedral-${Date.now()}`,
          title: `Dihedral Group D_${data.n} Analysis`,
          module: 'dihedral',
          groupOrSubject: data.group_name,
          inputsSummary: `Polygon sides n = ${data.n}`,
          formulas: [data.explanation.formula],
          summary: data.explanation.summary,
          verificationLines: data.explanation.reasoning,
          tableHeaders: ['Element', 'Type', 'Order', 'Inverse', 'Vertex Image'],
          tableRows: data.elements.map((e) => [
            e.label,
            e.classification,
            String(e.order),
            e.inverse,
            `[${e.vertex_permutation.join(', ')}]`,
          ]),
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to explore dihedral group.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const startN = initialParams?.n ? String(initialParams.n) : '6';
    const startCayley = Boolean(initialParams?.include_cayley);
    setNInput(startN);
    setIncludeCayley(startCayley);
    void runDihedral(startN, startCayley);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialParams]);

  // Compute SVG polygon vertex coordinates
  const renderPolygonSvg = () => {
    if (!result || !selectedElem) return null;
    const n = result.n;
    const cx = 130;
    const cy = 130;
    const radius = 92;

    const slotCoords = Array.from({ length: n }, (_, pos) => {
      const angle = -Math.PI / 2 - (2 * Math.PI * pos) / n;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        angle,
      };
    });

    const vertexPositions = Array.from({ length: n }, (_, vIdx) => {
      const targetSlot = selectedElem.vertex_permutation[vIdx] - 1;
      return {
        vertexLabel: vIdx + 1,
        ...slotCoords[targetSlot],
      };
    });

    const polygonPoints = slotCoords.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    let axisLine: { x1: number; y1: number; x2: number; y2: number } | null = null;
    if (selectedElem.is_reflection) {
      const axisAngle = -Math.PI / 2 - (Math.PI * selectedElem.k) / n;
      const rExt = radius + 24;
      axisLine = {
        x1: cx + rExt * Math.cos(axisAngle),
        y1: cy + rExt * Math.sin(axisAngle),
        x2: cx - rExt * Math.cos(axisAngle),
        y2: cy - rExt * Math.sin(axisAngle),
      };
    }

    return (
      <svg viewBox="0 0 260 260" className="w-full max-w-[280px] mx-auto" aria-label={`Regular ${n}-gon symmetry visualization`}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-[#D8D4C9] dark:text-[#2D3730]"
          strokeDasharray="3 4"
        />

        {axisLine && (
          <line
            x1={axisLine.x1}
            y1={axisLine.y1}
            x2={axisLine.x2}
            y2={axisLine.y2}
            stroke="#B45309"
            strokeWidth="1.6"
            strokeDasharray="5 3"
          />
        )}

        <polygon
          points={polygonPoints}
          className="fill-[#C8D3BD]/35 dark:fill-[#263229]/65 stroke-[#526B58] dark:stroke-[#6F9278]"
          strokeWidth="2"
        />

        <circle cx={cx} cy={cy} r="3" className="fill-[#526B58] dark:fill-[#6F9278]" />

        {slotCoords.map((slot, idx) => {
          const lx = cx + (radius + 20) * Math.cos(slot.angle);
          const ly = cy + (radius + 20) * Math.sin(slot.angle);
          return (
            <text
              key={`slot-${idx}`}
              x={lx}
              y={ly + 3.5}
              textAnchor="middle"
              className="fill-[#656B61] dark:fill-[#A2ACA0] font-mono text-[10px]"
            >
              p{idx + 1}
            </text>
          );
        })}

        {vertexPositions.map((vp) => (
          <g
            key={vp.vertexLabel}
            style={{
              transform: `translate(${vp.x}px, ${vp.y}px)`,
              transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <circle
              cx={0}
              cy={0}
              r={n > 14 ? 8 : 11}
              className={
                vp.vertexLabel === 1
                  ? 'fill-[#373B35] dark:fill-[#ECEEE9]'
                  : 'fill-[#526B58] dark:fill-[#6F9278]'
              }
            />
            <text
              x={0}
              y={3.5}
              textAnchor="middle"
              className={`font-mono font-semibold ${
                n > 14 ? 'text-[9px]' : 'text-[11px]'
              } ${
                vp.vertexLabel === 1
                  ? 'fill-white dark:fill-[#141815]'
                  : 'fill-white'
              }`}
            >
              {vp.vertexLabel}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">
              Dihedral Group <MathInline tex="D_n = \langle r, s \rangle" /> Explorer
            </h2>
            <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
              Explore symmetries of a regular <MathInline tex="n" />-gon (
              <MathInline tex="3 \le n \le 24" />), rotation orders{' '}
              <MathInline tex="\operatorname{ord}(r^k)" />, reflections <MathInline tex="r^k s" />,
              and centre <MathInline tex="\mathbb{Z}(D_n)" />.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[3, 4, 5, 6, 8, 12].map((val) => (
              <button
                key={val}
                type="button"
                aria-label={`D_${val}`}
                onClick={() => {
                  setNInput(String(val));
                  void runDihedral(String(val), includeCayley);
                }}
                className={`px-2.5 py-1 rounded text-xs border cursor-pointer ${
                  nInput === String(val)
                    ? 'bg-[#526B58] dark:bg-[#6F9278] text-white border-[#526B58] dark:border-[#6F9278]'
                    : 'border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25]'
                }`}
              >
                <MathInline tex={`D_{${val}}`} />
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runDihedral(nInput, includeCayley);
          }}
          className="flex flex-wrap items-end gap-4"
        >
          <div>
            <label className="block text-xs font-medium text-[#656B61] dark:text-[#A2ACA0] mb-1">
              Polygon sides <MathInline tex="n" /> (<MathInline tex="3 \le n \le 24" />)
            </label>
            <input
              type="number"
              min={3}
              max={24}
              value={nInput}
              onChange={(e) => setNInput(e.target.value)}
              className="w-28 px-3 py-2 rounded-md border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#141815] font-mono text-sm tabular-nums"
            />
          </div>

          <label className="inline-flex items-center gap-2 text-xs font-medium text-[#373B35] dark:text-[#ECEEE9] pb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCayley}
              onChange={(e) => {
                setIncludeCayley(e.target.checked);
                void runDihedral(nInput, e.target.checked);
              }}
              className="rounded accent-[#526B58]"
            />
            <span>
              Include Cayley Table (<MathInline tex="n \le 12" />)
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-md text-xs font-semibold bg-[#526B58] dark:bg-[#6F9278] text-white hover:bg-[#435948] dark:hover:bg-[#7EA488] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? 'Exploring...' : 'Explore Group'}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-3.5">
              <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                Order <MathInline tex={`|D_{${result.n}}|`} />
              </div>
              <div className="font-mono text-lg font-semibold tabular-nums">{result.order}</div>
            </div>
            <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-3.5">
              <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Rotations / Reflections</div>
              <div className="font-mono text-base font-semibold tabular-nums">
                {result.rotation_count} / {result.reflection_count}
              </div>
            </div>
            <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-3.5">
              <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                Centre <MathInline tex={`\\mathbb{Z}(D_{${result.n}})`} />
              </div>
              <div className="text-base font-semibold mt-0.5">
                <MathExpr value={`{${result.centre.join(', ')}}`} />
              </div>
            </div>
            <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-3.5">
              <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Centre Check</div>
              <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#526B58] dark:text-[#8FB498] mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{result.centre_verified ? 'Verified' : 'Mismatch'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Polygon Visualizer */}
            <div className="lg:col-span-5 rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold">
                  Polygon Symmetry Visualizer
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedElem(result.elements[0])}
                  className="inline-flex items-center gap-1 text-xs text-[#526B58] dark:text-[#8FB498] hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>
                    Reset to <MathInline tex="e" />
                  </span>
                </button>
              </div>

              {renderPolygonSvg()}

              {selectedElem && (
                <div className="p-3.5 rounded-lg bg-[#F3F0E8]/70 dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">
                      <MathExpr value={selectedElem.label} />
                    </span>
                    <span className="font-medium text-[#526B58] dark:text-[#8FB498] capitalize">
                      {selectedElem.classification} · Order {selectedElem.order}
                    </span>
                  </div>
                  <div className="text-[#656B61] dark:text-[#A2ACA0]">
                    <MathText text={selectedElem.order_explanation} />
                  </div>
                  <div className="text-[#373B35] dark:text-[#ECEEE9]">
                    Vertex image (<MathInline tex={`1 \\dots ${result.n}`} />):{' '}
                    <span className="font-mono">[{selectedElem.vertex_permutation.join(', ')}]</span>
                  </div>
                </div>
              )}
            </div>

            {/* Element Selector & Table */}
            <div className="lg:col-span-7 rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#D8D4C9] dark:border-[#2D3730] flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold">
                  Elements of <MathInline tex={`D_{${result.n}}`} /> ({result.order})
                </h3>
                <span className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  Click any transformation to apply
                </span>
              </div>
              <div className="max-h-[420px] overflow-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="sticky top-0 bg-[#F3F0E8] dark:bg-[#232B25] text-[#656B61] dark:text-[#A2ACA0] border-b border-[#D8D4C9] dark:border-[#2D3730]">
                    <tr>
                      <th className="py-2 px-3.5 font-medium">Element</th>
                      <th className="py-2 px-3.5 font-medium">Type</th>
                      <th className="py-2 px-3.5 font-medium">
                        <MathInline tex="\operatorname{ord}(g)" />
                      </th>
                      <th className="py-2 px-3.5 font-medium">
                        <MathInline tex="g^{-1}" />
                      </th>
                      <th className="py-2 px-3.5 font-medium">Geometry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8D4C9] dark:divide-[#2D3730]">
                    {result.elements.map((el) => {
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
                          <td className="py-2 px-3.5 font-semibold">
                            <MathExpr value={el.label} />
                          </td>
                          <td className="py-2 px-3.5 text-xs capitalize">{el.classification}</td>
                          <td className="py-2 px-3.5 font-mono tabular-nums">{el.order}</td>
                          <td className="py-2 px-3.5">
                            <MathExpr value={el.inverse} />
                          </td>
                          <td className="py-2 px-3.5 font-mono text-xs tabular-nums">
                            {el.is_reflection ? `axis ${el.angle_deg}°` : `rot ${el.angle_deg}°`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {result.cayley_note && (
            <div className="p-3.5 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] text-xs text-[#656B61] dark:text-[#A2ACA0]">
              <MathText text={result.cayley_note} />
            </div>
          )}

          {result.cayley_table && (
            <div className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#D8D4C9] dark:border-[#2D3730]">
                <h3 className="font-display text-sm font-semibold">
                  Cayley Table for <MathInline tex={`D_{${result.n}}`} />
                </h3>
              </div>
              <div className="overflow-auto max-h-96">
                <table className="w-full text-xs border-collapse">
                  <thead className="bg-[#F3F0E8] dark:bg-[#232B25]">
                    <tr>
                      <th className="p-2 border-b border-r border-[#D8D4C9] dark:border-[#2D3730]">
                        <MathInline tex="\cdot" />
                      </th>
                      {result.cayley_table.labels.map((lbl) => (
                        <th key={lbl} className="p-2 border-b border-r border-[#D8D4C9] dark:border-[#2D3730]">
                          <MathExpr value={lbl} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.cayley_table.labels.map((rowLbl, rIdx) => (
                      <tr key={rowLbl}>
                        <th className="p-2 border-b border-r border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25]">
                          <MathExpr value={rowLbl} />
                        </th>
                        {result.cayley_table!.matrix[rIdx].map((cell, cIdx) => (
                          <td key={cIdx} className="p-2 border-b border-r border-[#D8D4C9] dark:border-[#2D3730] text-center">
                            <MathExpr value={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <ExplanationDrawer
            explanation={result.explanation}
            formulaNote="Here, r denotes a counterclockwise rotation by 2π/n and s denotes a reflection across a symmetry axis."
          />
        </div>
      )}
    </div>
  );
};
