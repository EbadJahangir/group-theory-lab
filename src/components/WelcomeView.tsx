import React from 'react';
import { ArrowRight, CheckCircle2, Compass, Grid3X3, Moon, Shapes, Shuffle, Sun } from 'lucide-react';
import type { ThemeMode } from '../types/symmetry';
import { Logo } from './Logo';
import { MathInline, MathText } from './MathExpr';

interface WelcomeViewProps {
  onGetStarted: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

const HIGHLIGHTS = [
  {
    icon: Grid3X3,
    title: 'Abelian & Classification Engine',
    detail:
      'Construct cyclic groups Z_n and direct products, inspect element orders ord(a), and classify all non-isomorphic Abelian groups of order n via elementary divisors and invariant factors.',
  },
  {
    icon: Compass,
    title: 'Cayley Tables & Axiom Verification',
    detail:
      'Generate full multiplication tables and verify closure, identity e, inverses a⁻¹, associativity, and commutativity.',
  },
  {
    icon: Shuffle,
    title: 'Symmetric & Alternating Groups',
    detail:
      'Decompose permutations σ into disjoint cycles, compute orders via lcm, evaluate sign(σ) = (-1)^(n - c), and verify |A_n| = n! / 2.',
  },
  {
    icon: Shapes,
    title: 'Dihedral Geometry & Totient Analysis',
    detail:
      'Visualize polygon rotations r^k and reflections r^k s in D_n = <r, s>, verify centres Z(D_n), tabulate φ(n), and solve all six Algebra II challenges.',
  },
];

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onGetStarted,
  theme,
  onToggleTheme,
}) => {
  return (
    <div className="min-h-screen bg-[#F3F0E8] dark:bg-[#141815] text-[#373B35] dark:text-[#ECEEE9] flex flex-col">
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-8 border-b border-[#D8D4C9] dark:border-[#2D3730]">
        <Logo size={34} subtitle="Interactive Abstract Algebra Explorer" />
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] text-[#373B35] dark:text-[#ECEEE9] hover:bg-[#C8D3BD]/35 dark:hover:bg-[#263229] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button
            type="button"
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-[#526B58] dark:bg-[#6F9278] text-white hover:bg-[#435948] dark:hover:bg-[#7EA488] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Open Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 lg:py-16 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="text-xs font-medium tracking-wide text-[#526B58] dark:text-[#8FB498]">
              Algebra II · Finite Abelian, Permutation & Dihedral Group Explorer
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#373B35] dark:text-[#ECEEE9] leading-[1.12] [text-wrap:balance]">
              GroupTheory Lab
            </h1>

            <p className="font-display text-lg sm:text-xl font-semibold text-[#526B58] dark:text-[#8FB498]">
              Explore. Compute. Visualize. Verify.
            </p>

            <p className="text-base text-[#656B61] dark:text-[#A2ACA0] leading-relaxed max-w-2xl">
              An interactive undergraduate Algebra II laboratory backed by a dedicated Python
              group-theory engine. Construct direct products{' '}
              <MathInline tex="\mathbb{Z}_{n_1} \times \cdots \times \mathbb{Z}_{n_k}" />, classify
              finite Abelian groups, verify Cayley table axioms, decompose permutations{' '}
              <MathInline tex="\sigma \in S_n" />, and visualize dihedral polygon symmetries{' '}
              <MathInline tex="D_n = \langle r, s \rangle" /> with real-time proof steps.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg text-sm font-semibold bg-[#526B58] dark:bg-[#6F9278] text-white hover:bg-[#435948] dark:hover:bg-[#7EA488] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2 text-xs text-[#656B61] dark:text-[#A2ACA0]">
                <CheckCircle2 className="w-4 h-4 text-[#526B58] dark:text-[#6F9278]" />
                <span>All 9 modules · Real Python algorithms · PDF & CSV export</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-[#D8D4C9] dark:border-[#2D3730] pb-3">
                <span className="font-display text-sm font-semibold text-[#373B35] dark:text-[#ECEEE9]">
                  Dihedral Symmetry Reference — <MathInline tex="D_6" />
                </span>
                <span className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                  <MathInline tex="|D_6| = 12" />
                </span>
              </div>
              <div className="flex justify-center py-2">
                <svg viewBox="0 0 220 220" className="w-52 h-52" aria-label="Regular hexagon symmetry diagram">
                  <circle
                    cx="110"
                    cy="110"
                    r="82"
                    fill="none"
                    stroke="currentColor"
                    className="text-[#D8D4C9] dark:text-[#2D3730]"
                    strokeDasharray="4 4"
                  />
                  {/* Symmetry axes */}
                  <line x1="110" y1="20" x2="110" y2="200" stroke="#C8D3BD" strokeWidth="1.2" strokeDasharray="3 3" />
                  <line x1="32" y1="65" x2="188" y2="155" stroke="#C8D3BD" strokeWidth="1.2" strokeDasharray="3 3" />
                  <line x1="188" y1="65" x2="32" y2="155" stroke="#C8D3BD" strokeWidth="1.2" strokeDasharray="3 3" />
                  {/* Regular hexagon */}
                  <polygon
                    points="110,32 177.5,71 177.5,149 110,188 42.5,149 42.5,71"
                    className="fill-[#C8D3BD]/30 dark:fill-[#263229]/60 stroke-[#526B58] dark:stroke-[#6F9278]"
                    strokeWidth="2.2"
                  />
                  {[
                    [110, 32, '1'],
                    [177.5, 71, '2'],
                    [177.5, 149, '3'],
                    [110, 188, '4'],
                    [42.5, 149, '5'],
                    [42.5, 71, '6'],
                  ].map(([cx, cy, label]) => (
                    <g key={String(label)}>
                      <circle
                        cx={Number(cx)}
                        cy={Number(cy)}
                        r="11"
                        className="fill-[#526B58] dark:fill-[#6F9278]"
                      />
                      <text
                        x={Number(cx)}
                        y={Number(cy) + 4}
                        textAnchor="middle"
                        className="fill-white font-mono text-[11px] font-semibold"
                      >
                        {label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#D8D4C9] dark:border-[#2D3730] text-center">
                <div>
                  <div className="font-mono text-sm font-semibold tabular-nums">6</div>
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                    Rotations (<MathInline tex="r^k" />)
                  </div>
                </div>
                <div>
                  <div className="font-mono text-sm font-semibold tabular-nums">6</div>
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                    Reflections (<MathInline tex="r^k s" />)
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    <MathInline tex="\{e, r^3\}" />
                  </div>
                  <div className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
                    Centre <MathInline tex="\mathbb{Z}(D_6)" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-14 pt-10 border-t border-[#D8D4C9] dark:border-[#2D3730]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 space-y-2.5"
                >
                  <Icon className="w-5 h-5 text-[#526B58] dark:text-[#6F9278]" />
                  <h2 className="font-display text-sm font-semibold text-[#373B35] dark:text-[#ECEEE9]">
                    {item.title}
                  </h2>
                  <p className="text-xs text-[#656B61] dark:text-[#A2ACA0] leading-relaxed">
                    <MathText text={item.detail} />
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
