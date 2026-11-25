import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import type {
  AppStats,
  ModuleId,
  ReportSnapshot,
  TotientResult,
  TotientTableResult,
} from '../../types/symmetry';
import { ExplanationDrawer } from '../ExplanationDrawer';
import { MathExpr, MathInline, MathText } from '../MathExpr';

interface GeneratorsViewProps {
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

export const GeneratorsView: React.FC<GeneratorsViewProps> = ({
  initialParams,
  onRecordActivity,
}) => {
  const [nInput, setNInput] = useState<string>(
    initialParams?.n ? String(initialParams.n) : '12'
  );
  const [result, setResult] = useState<TotientResult | null>(null);
  const [tableData, setTableData] = useState<TotientTableResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTotient = async (rawN: string) => {
    setError(null);
    setLoading(true);
    try {
      const data = await api.analyzeTotient(rawN.trim());
      setResult(data);
      onRecordActivity({
        module: 'generators',
        type: 'Euler Totient',
        description: `Computed φ(${data.n}) = ${data.phi} (${data.generator_count} generators in Z_${data.n})`,
        params: { n: data.n },
        statsDelta: {
          calculationsPerformed: 1,
        },
        report: {
          id: `phi-${Date.now()}`,
          title: "Euler's Totient & Generator Verification",
          module: 'generators',
          groupOrSubject: `Z_${data.n} · φ(${data.n}) = ${data.phi}`,
          inputsSummary: `n = ${data.n}`,
          formulas: [data.explanation.formula],
          summary: data.explanation.summary,
          verificationLines: data.explanation.reasoning,
          tableHeaders: ['Property', 'Result'],
          tableRows: [
            ['n', String(data.n)],
            ['Prime Factorization', data.factorization_str],
            ['φ(n)', String(data.phi)],
            [
              'Generators of Z_n',
              data.generators ? data.generators.join(', ') : `Count = ${data.generator_count}`,
            ],
            ['Generator Count = φ(n)', data.verified ? 'Verified' : 'Mismatch'],
          ],
          createdAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to compute Euler totient.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void api.getTotientTable().then(setTableData).catch(() => {});
  }, []);

  useEffect(() => {
    const startN = initialParams?.n ? String(initialParams.n) : '12';
    setNInput(startN);
    void runTotient(startN);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialParams]);

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold">
              Generator & Euler Totient <MathInline tex="\phi(n)" /> Calculator
            </h2>
            <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
              <MathText text="Compute φ(n), prime factorization, coprime residues, and generators of cyclic group Z_n (including Z_1)." />
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[1, 6, 12, 15, 20, 36].map((val) => (
              <button
                key={val}
                type="button"
                aria-label={`n=${val}`}
                onClick={() => {
                  setNInput(String(val));
                  void runTotient(String(val));
                }}
                className="px-2.5 py-1 rounded text-xs border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] hover:bg-[#C8D3BD]/40 cursor-pointer"
              >
                <MathInline tex={`n = ${val}`} />
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runTotient(nInput);
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div>
            <label className="block text-xs font-medium text-[#656B61] dark:text-[#A2ACA0] mb-1">
              Positive integer <MathInline tex="n" /> (<MathInline tex="1 \le n \le 100{,}000" />)
            </label>
            <input
              type="number"
              min={1}
              max={100000}
              value={nInput}
              onChange={(e) => setNInput(e.target.value)}
              className="w-40 px-3 py-2 rounded-md border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#141815] font-mono text-sm tabular-nums"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            aria-label="Compute φ(n)"
            className="px-4 py-2 rounded-md text-xs font-semibold bg-[#526B58] dark:bg-[#6F9278] text-white hover:bg-[#435948] dark:hover:bg-[#7EA488] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {loading ? (
              'Calculating...'
            ) : (
              <>
                Compute <MathInline tex="\phi(n)" />
              </>
            )}
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
            <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4">
              <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                Input Integer <MathInline tex="n" />
              </div>
              <div className="font-mono text-lg font-semibold tabular-nums mt-0.5">{result.n}</div>
            </div>
            <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4">
              <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Prime Factorization</div>
              <div className="text-base font-semibold mt-0.5">
                <MathExpr value={result.factorization_str} />
              </div>
            </div>
            <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4">
              <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                <MathInline tex={`\\phi(${result.n})`} /> / Generators
              </div>
              <div className="font-mono text-lg font-semibold tabular-nums mt-0.5">
                {result.phi}
              </div>
            </div>
            <div className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4">
              <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">Count Verification</div>
              <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#526B58] dark:text-[#8FB498] mt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {result.verified ? (
                    <>
                      Matches <MathInline tex="\phi(n)" />
                    </>
                  ) : (
                    'Mismatch'
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4 space-y-2">
              <h3 className="font-display text-sm font-semibold">
                Generators of <MathInline tex={`\\mathbb{Z}_{${result.n}}`} />
              </h3>
              {result.generators ? (
                result.generators.length <= 32 ? (
                  <div className="text-sm text-[#373B35] dark:text-[#ECEEE9] break-words leading-relaxed">
                    <MathInline tex={`\\{${result.generators.join(', ')}\\}`} />
                  </div>
                ) : (
                  <div className="font-mono text-xs sm:text-sm text-[#373B35] dark:text-[#ECEEE9] break-words leading-relaxed">
                    {'{'}{result.generators.join(', ')}{'}'}
                  </div>
                )
              ) : (
                <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  Explicit residue enumeration is capped at{' '}
                  <MathInline tex={`n \\le ${result.limits.max_enumerate_n}`} />; total generator
                  count is exactly <MathInline tex={`\\phi(${result.n}) = ${result.phi}`} />.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4 space-y-2">
              <h3 className="font-display text-sm font-semibold">
                Coprime Residues (
                <MathInline tex={`1 \\le k \\le ${result.n},\\ \\gcd(k, ${result.n}) = 1`} />)
              </h3>
              {result.coprime_residues ? (
                result.coprime_residues.length <= 32 ? (
                  <div className="text-sm text-[#373B35] dark:text-[#ECEEE9] break-words leading-relaxed">
                    <MathInline tex={`\\{${result.coprime_residues.join(', ')}\\}`} />
                  </div>
                ) : (
                  <div className="font-mono text-xs sm:text-sm text-[#373B35] dark:text-[#ECEEE9] break-words leading-relaxed">
                    {'{'}{result.coprime_residues.join(', ')}{'}'}
                  </div>
                )
              ) : (
                <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  Residue listing omitted for{' '}
                  <MathInline tex={`n > ${result.limits.max_enumerate_n}`} />.
                </p>
              )}
            </div>
          </div>

          <ExplanationDrawer
            explanation={result.explanation}
            formulaNote="Here, φ(n) is Euler's totient function counting positive integers up to n coprime to n (the exact number of generators of Z_n), and the product ∏_{p | n} runs over every distinct prime divisor p of n."
          />
        </div>
      )}

      {/* Reference Table for n = 1 .. 20 */}
      {tableData && (
        <section className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#D8D4C9] dark:border-[#2D3730] flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-sm font-semibold">
              Verified Euler Totient Table (<MathInline tex="1 \le n \le 20" />)
            </h3>
            <span className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
              Click any row to inspect <MathInline tex="\mathbb{Z}_n" /> above
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#F3F0E8] dark:bg-[#232B25] text-[#656B61] dark:text-[#A2ACA0] border-b border-[#D8D4C9] dark:border-[#2D3730]">
                <tr>
                  <th className="py-2 px-4 font-medium">
                    <MathInline tex="n" />
                  </th>
                  <th className="py-2 px-4 font-medium">Factorization</th>
                  <th className="py-2 px-4 font-medium">
                    <MathInline tex="\phi(n)" />
                  </th>
                  <th className="py-2 px-4 font-medium">
                    Generators of <MathInline tex="\mathbb{Z}_n" />
                  </th>
                  <th className="py-2 px-4 font-medium">Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D4C9] dark:divide-[#2D3730]">
                {tableData.rows.map((row) => (
                  <tr
                    key={row.n}
                    onClick={() => {
                      setNInput(String(row.n));
                      void runTotient(String(row.n));
                    }}
                    className="hover:bg-[#F3F0E8]/70 dark:hover:bg-[#232B25]/50 cursor-pointer"
                  >
                    <td className="py-2 px-4 font-mono font-semibold tabular-nums">{row.n}</td>
                    <td className="py-2 px-4">
                      <MathExpr value={row.factorization} />
                    </td>
                    <td className="py-2 px-4 font-mono font-semibold tabular-nums">{row.phi}</td>
                    <td className="py-2 px-4 font-mono text-xs">{row.generators.join(', ')}</td>
                    <td className="py-2 px-4 text-xs text-[#526B58] dark:text-[#8FB498]">
                      {row.verified ? 'Verified' : 'Error'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
