import React, { useState } from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { api } from '../../services/api';
import { downloadCsv, exportReportPdf } from '../../services/exporters';
import type { ReportSnapshot } from '../../types/symmetry';
import { exprToLatex } from '../../utils/mathFormat';
import { MathBlock, MathExpr, MathInline, MathText } from '../MathExpr';

interface ReportsViewProps {
  latestReport: ReportSnapshot | null;
  onUpdateReport: (report: ReportSnapshot) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  latestReport,
  onUpdateReport,
}) => {
  const [generating, setGenerating] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePresetReport = async (
    kind: 'abelian72' | 'phi20' | 'd8' | 's4cayley'
  ) => {
    setError(null);
    setGenerating(true);
    try {
      if (kind === 'abelian72') {
        const data = await api.classifyAbelian(72);
        onUpdateReport({
          id: `rep-72-${Date.now()}`,
          title: 'Classification of Finite Abelian Groups of Order 72',
          module: 'abelian',
          groupOrSubject: `Order 72 (${data.factorization_str})`,
          inputsSummary: 'n = 72',
          formulas: [data.explanation.formula, data.formula_str],
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
        });
      } else if (kind === 'phi20') {
        const table = await api.getTotientTable();
        onUpdateReport({
          id: `rep-phi-${Date.now()}`,
          title: "Euler's Totient Table (1 ≤ n ≤ 20)",
          module: 'generators',
          groupOrSubject: 'φ(1) through φ(20)',
          inputsSummary: '1 ≤ n ≤ 20',
          formulas: ['φ(n) = n · ∏_{p | n} (1 - 1/p)'],
          summary: `Computed and verified φ(n) and all generators of Z_n for 1 ≤ n ≤ 20. All rows verified: ${table.all_verified}.`,
          verificationLines: [
            'Every generator count matches φ(n) explicitly.',
            'Z_1 = {0} handled with φ(1) = 1.',
          ],
          tableHeaders: ['n', 'Factorization', 'φ(n)', 'Generators'],
          tableRows: table.rows.map((r) => [
            String(r.n),
            r.factorization,
            String(r.phi),
            r.generators.join(' '),
          ]),
          createdAt: new Date().toISOString(),
        });
      } else if (kind === 'd8') {
        const d8 = await api.exploreDihedral(8, true);
        onUpdateReport({
          id: `rep-d8-${Date.now()}`,
          title: 'Dihedral Group D_8 Complete Analysis',
          module: 'dihedral',
          groupOrSubject: 'D_8 (Regular Octagon)',
          inputsSummary: 'n = 8',
          formulas: [d8.explanation.formula],
          summary: d8.explanation.summary,
          verificationLines: d8.explanation.reasoning,
          tableHeaders: ['Element', 'Type', 'Order', 'Inverse'],
          tableRows: d8.elements.map((e) => [
            e.label,
            e.classification,
            String(e.order),
            e.inverse,
          ]),
          createdAt: new Date().toISOString(),
        });
      } else {
        const z2z4 = await api.generateCayley({ group_type: 'abelian', moduli: [2, 4] });
        onUpdateReport({
          id: `rep-cayley-${Date.now()}`,
          title: 'Cayley Table & Axiom Verification — Z_2 × Z_4',
          module: 'cayley',
          groupOrSubject: z2z4.group_name,
          inputsSummary: 'Moduli [2, 4]',
          formulas: [z2z4.explanation.formula],
          summary: z2z4.explanation.summary,
          verificationLines: z2z4.explanation.reasoning,
          tableHeaders: [z2z4.operation_symbol, ...z2z4.labels],
          tableRows: z2z4.labels.map((lbl, i) => [lbl, ...z2z4.matrix[i]]),
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate report.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!latestReport) return;
    setError(null);
    setExportingPdf(true);
    try {
      await exportReportPdf(latestReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate PDF report.');
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="no-print rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="font-display text-base font-semibold">
              Reports & Verification Export
            </h2>
            <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
              Export your latest calculated group or generate a fresh verified report as Unicode
              math PDF, UTF-8 CSV, or print-ready layout.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={generating}
              onClick={() => void generatePresetReport('abelian72')}
              className="px-3 py-1.5 rounded text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 cursor-pointer"
            >
              Order 72 Classification
            </button>
            <button
              type="button"
              disabled={generating}
              aria-label="φ(1..20) Table"
              onClick={() => void generatePresetReport('phi20')}
              className="px-3 py-1.5 rounded text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 cursor-pointer"
            >
              <MathInline tex="\phi(1\dots 20)" /> Table
            </button>
            <button
              type="button"
              disabled={generating}
              aria-label="D_8 Elements"
              onClick={() => void generatePresetReport('d8')}
              className="px-3 py-1.5 rounded text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 cursor-pointer"
            >
              <MathInline tex="D_8" /> Elements
            </button>
            <button
              type="button"
              disabled={generating}
              aria-label="Z_2 × Z_4 Cayley"
              onClick={() => void generatePresetReport('s4cayley')}
              className="px-3 py-1.5 rounded text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 cursor-pointer"
            >
              <MathInline tex="\mathbb{Z}_2 \times \mathbb{Z}_4" /> Cayley
            </button>
          </div>
        </div>

        {latestReport && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#D8D4C9] dark:border-[#2D3730]">
            <button
              type="button"
              disabled={exportingPdf}
              onClick={() => void handleDownloadPdf()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-[#526B58] dark:bg-[#6F9278] text-white hover:bg-[#435948] dark:hover:bg-[#7EA488] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exportingPdf ? 'Building PDF...' : 'Download PDF Report'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const slug = latestReport.groupOrSubject
                  .replace(/[^a-zA-Z0-9_-]+/g, '_')
                  .toLowerCase();
                downloadCsv(
                  `grouptheory_lab_${slug}`,
                  latestReport.tableHeaders,
                  latestReport.tableRows
                );
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download CSV Dataset</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Layout</span>
            </button>
          </div>
        )}
      </section>

      {error && (
        <div className="p-3.5 rounded-lg border border-red-300 bg-red-50 text-red-800 text-sm">
          {error}
        </div>
      )}

      {!latestReport ? (
        <div className="rounded-xl border border-dashed border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-10 text-center space-y-2">
          <p className="text-sm text-[#656B61] dark:text-[#A2ACA0]">
            No active calculation snapshot selected yet.
          </p>
          <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
            Run a calculation in any explorer or click one of the report presets above to preview
            and export a formatted mathematical report.
          </p>
        </div>
      ) : (
        <article className="print-area rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#D8D4C9] dark:border-[#2D3730] pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <div className="text-xs font-medium text-[#526B58] dark:text-[#8FB498]">
                GroupTheory Lab · Mathematical Verification Report
              </div>
              <h3 className="font-display text-xl font-bold mt-1">
                <MathText text={latestReport.title} />
              </h3>
            </div>
            <div className="text-xs text-[#656B61] dark:text-[#A2ACA0] tabular-nums">
              {new Date(latestReport.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="p-3.5 rounded-lg bg-[#F3F0E8]/60 dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730]">
              <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Group / Subject</div>
              <div className="font-semibold mt-0.5">
                <MathText text={latestReport.groupOrSubject} />
              </div>
            </div>
            <div className="p-3.5 rounded-lg bg-[#F3F0E8]/60 dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730]">
              <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Input Parameters</div>
              <div className="font-semibold mt-0.5">
                <MathText text={latestReport.inputsSummary} />
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-display text-sm font-semibold">Summary & Formula</h4>
            <p className="text-sm leading-relaxed">
              <MathText text={latestReport.summary} />
            </p>
            {latestReport.formulas.map((f, i) => (
              <div
                key={i}
                className="px-3 py-1 rounded bg-[#F3F0E8] dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730]"
              >
                <MathBlock tex={exprToLatex(f)} />
              </div>
            ))}
          </div>

          {latestReport.verificationLines.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-display text-sm font-semibold">Verification & Steps</h4>
              <ul className="space-y-1 text-sm list-disc list-inside">
                {latestReport.verificationLines.map((line, i) => (
                  <li key={i} className="leading-relaxed">
                    <MathText text={line} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {latestReport.tableHeaders.length > 0 && latestReport.tableRows.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-display text-sm font-semibold">
                Calculated Data ({latestReport.tableRows.length} rows)
              </h4>
              <div className="overflow-x-auto rounded-lg border border-[#D8D4C9] dark:border-[#2D3730]">
                <table className="w-full text-left text-xs tabular-nums">
                  <thead className="bg-[#F3F0E8] dark:bg-[#232B25] border-b border-[#D8D4C9] dark:border-[#2D3730]">
                    <tr>
                      {latestReport.tableHeaders.map((h, i) => (
                        <th key={i} className="py-2 px-3 font-sans font-semibold">
                          {latestReport.module === 'cayley' ? (
                            <MathExpr value={h} />
                          ) : (
                            <MathText text={h} />
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8D4C9] dark:divide-[#2D3730]">
                    {latestReport.tableRows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="py-1.5 px-3">
                            {latestReport.module === 'cayley' ? (
                              <MathExpr value={String(cell)} />
                            ) : (
                              <MathText text={String(cell)} />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
};
