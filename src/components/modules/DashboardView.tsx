import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  Compass,
  FileText,
  Grid3X3,
  History,
  Shapes,
  Shuffle,
  Trash2,
} from 'lucide-react';
import type { AppStats, HistoryItem, ModuleId, ReportSnapshot } from '../../types/symmetry';
import { MathExpr, MathText } from '../MathExpr';

interface DashboardViewProps {
  stats: AppStats;
  history: HistoryItem[];
  latestReport: ReportSnapshot | null;
  guidedDoneCount: number;
  onNavigate: (module: ModuleId, params?: Record<string, unknown>) => void;
  onClearHistory: () => void;
}

const QUICK_MODULES: {
  id: ModuleId;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'abelian',
    title: 'Abelian Group Explorer',
    description: 'Build Z_n and direct products, inspect element orders, and classify order n.',
    icon: Grid3X3,
  },
  {
    id: 'cayley',
    title: 'Cayley Table Generator',
    description: 'Inspect multiplication matrices and verify closure, identity, inverses, associativity.',
    icon: Compass,
  },
  {
    id: 'permutations',
    title: 'Permutation Explorer',
    description: 'Compute disjoint cycles, orders, sign(σ) = (-1)^(n-c), and Alternating groups A_n.',
    icon: Shuffle,
  },
  {
    id: 'dihedral',
    title: 'Dihedral Group Explorer',
    description: 'Animate regular polygon rotations r^k and reflections r^k s in D_n and verify Z(D_n).',
    icon: Shapes,
  },
  {
    id: 'generators',
    title: 'Generator & Phi Calculator',
    description: 'Compute Euler φ(n), prime factorizations, coprime residues, and generators.',
    icon: Calculator,
  },
  {
    id: 'analysis',
    title: 'Element Order Analysis',
    description: 'Compare order histograms side-by-side (e.g. Z_4 vs Z_2 × Z_2).',
    icon: BarChart3,
  },
  {
    id: 'learning',
    title: 'Guided Learning',
    description: 'Solve and verify the six Algebra II assignment problems with step-by-step proofs.',
    icon: BookOpen,
  },
  {
    id: 'reports',
    title: 'Reports & Verification',
    description: 'Export calculated tables and verified proofs as formatted PDF or CSV files.',
    icon: FileText,
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  history,
  latestReport,
  guidedDoneCount,
  onNavigate,
  onClearHistory,
}) => {
  const statCards = [
    { label: 'Groups Explored', value: stats.groupsExplored },
    { label: 'Calculations Performed', value: stats.calculationsPerformed },
    { label: 'Permutations Analyzed', value: stats.permutationsAnalyzed },
    { label: 'Dihedral Groups Explored', value: stats.dihedralExplored },
    { label: 'Elements Analyzed', value: stats.elementsAnalyzed },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Area */}
      <section className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-[#373B35] dark:text-[#ECEEE9]">
              GroupTheory Lab Workspace
            </h2>
            <p className="text-sm text-[#656B61] dark:text-[#A2ACA0] leading-relaxed">
              Explore finite Abelian, permutation, and dihedral groups using live algorithms
              executed by the Python mathematical engine. All activity counts below reflect your
              actual session calculations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('abelian')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-[#526B58] dark:bg-[#6F9278] text-white hover:bg-[#435948] dark:hover:bg-[#7EA488] transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Abelian Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('learning')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] text-[#373B35] dark:text-[#ECEEE9] hover:bg-[#C8D3BD]/40 dark:hover:bg-[#2E3A31] transition-colors whitespace-nowrap cursor-pointer"
            >
              <span>Assignment Challenges ({guidedDoneCount}/6)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real Statistics Cards */}
      <section aria-label="Session statistics">
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4"
            >
              <div className="font-mono text-2xl font-semibold tabular-nums text-[#373B35] dark:text-[#ECEEE9]">
                {card.value}
              </div>
              <div className="mt-1 text-xs text-[#656B61] dark:text-[#A2ACA0]">{card.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Access Modules */}
      <section className="space-y-3">
        <h3 className="font-display text-base font-semibold text-[#373B35] dark:text-[#ECEEE9]">
          Mathematical Modules
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {QUICK_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => onNavigate(mod.id)}
                className="text-left rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-4 hover:border-[#526B58] dark:hover:border-[#6F9278] transition-colors flex flex-col justify-between gap-3 cursor-pointer group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Icon className="w-4 h-4 text-[#526B58] dark:text-[#6F9278]" />
                    <ArrowRight className="w-3.5 h-3.5 text-[#656B61] dark:text-[#A2ACA0] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="font-display text-sm font-semibold text-[#373B35] dark:text-[#ECEEE9]">
                    {mod.title}
                  </div>
                  <p className="text-xs text-[#656B61] dark:text-[#A2ACA0] leading-relaxed">
                    <MathText text={mod.description} />
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Activity + Mathematical Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#526B58] dark:text-[#6F9278]" />
              <h3 className="font-display text-sm font-semibold text-[#373B35] dark:text-[#ECEEE9]">
                Recent Calculations
              </h3>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-[#656B61] dark:text-[#A2ACA0] hover:text-[#373B35] dark:hover:text-[#ECEEE9] hover:bg-[#F3F0E8] dark:hover:bg-[#232B25] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="py-8 text-center rounded-lg border border-dashed border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/40 dark:bg-[#141815]/50">
              <p className="text-sm text-[#656B61] dark:text-[#A2ACA0]">
                No calculations recorded yet. Open any module above to compute your first group or
                permutation.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#D8D4C9] dark:divide-[#2D3730] max-h-80 overflow-y-auto">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="py-2.5 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#373B35] dark:text-[#ECEEE9] truncate">
                      <MathText text={item.description} />
                    </div>
                    <div className="text-xs text-[#656B61] dark:text-[#A2ACA0] flex items-center gap-1.5">
                      <span>{item.type}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.module, item.params)}
                    className="px-2.5 py-1 rounded text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] text-[#373B35] dark:text-[#ECEEE9] hover:bg-[#C8D3BD]/40 dark:hover:bg-[#2E3A31] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Reopen
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-5 rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-[#373B35] dark:text-[#ECEEE9]">
              Latest Verified Result
            </h3>
            {latestReport && (
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="text-xs font-medium text-[#526B58] dark:text-[#8FB498] hover:underline cursor-pointer"
              >
                Export Report
              </button>
            )}
          </div>

          {!latestReport ? (
            <div className="py-8 px-4 text-center rounded-lg border border-dashed border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/40 dark:bg-[#141815]/50 space-y-2">
              <p className="text-sm text-[#656B61] dark:text-[#A2ACA0]">
                No verified calculation snapshot yet.
              </p>
              <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                Run any Abelian, Cayley, Permutation, Dihedral, or Totient calculation to populate
                this mathematical overview.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-[#F3F0E8]/70 dark:bg-[#141815] border border-[#D8D4C9] dark:border-[#2D3730] space-y-1.5">
                <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  <MathText text={latestReport.title} />
                </div>
                <div className="text-base font-semibold text-[#373B35] dark:text-[#ECEEE9]">
                  <MathExpr value={latestReport.groupOrSubject} />
                </div>
                <p className="text-xs text-[#373B35] dark:text-[#ECEEE9] leading-relaxed">
                  <MathText text={latestReport.summary} />
                </p>
              </div>
              {latestReport.verificationLines.length > 0 && (
                <ul className="space-y-1 text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  {latestReport.verificationLines.slice(0, 3).map((line, i) => (
                    <li key={i} className="leading-relaxed">
                      • <MathText text={line} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
