import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Lightbulb } from 'lucide-react';
import { api } from '../../services/api';
import type { GuidedQuestion } from '../../types/symmetry';
import { MathExpr, MathInline, MathText } from '../MathExpr';

interface LearningViewProps {
  completedIds: number[];
  onMarkCompleted: (questionId: number) => void;
}

export const LearningView: React.FC<LearningViewProps> = ({
  completedIds,
  onMarkCompleted,
}) => {
  const [questions, setQuestions] = useState<GuidedQuestion[]>([]);
  const [activeId, setActiveId] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<
    Record<number, { correct: boolean; message: string }>
  >({});
  const [showHints, setShowHints] = useState<Record<number, boolean>>({});
  const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getGuidedQuestions()
      .then((res) => {
        setQuestions(res.questions);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Unable to load assignment questions.');
        setLoading(false);
      });
  }, []);

  const currentQ = questions.find((q) => q.id === activeId) || questions[0] || null;

  const handleCheck = async (q: GuidedQuestion) => {
    setError(null);
    setChecking(true);
    try {
      const val = answers[q.id] ?? '';
      const res = await api.checkGuidedAnswer(q.id, val);
      setFeedback((prev) => ({
        ...prev,
        [q.id]: { correct: res.correct, message: res.feedback },
      }));
      if (res.correct) {
        onMarkCompleted(q.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to check answer.');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-8 text-sm text-[#656B61] dark:text-[#A2ACA0]">
        Loading Algebra II guided problems from the mathematical engine...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <section className="rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-base font-semibold">
            Guided Learning & Algebra II Assignment Challenges
          </h2>
          <p className="text-xs text-[#656B61] dark:text-[#A2ACA0]">
            Verify all six assignment questions directly against live Python group-theory
            algorithms.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-sm font-semibold tabular-nums text-[#526B58] dark:text-[#8FB498]">
            {completedIds.length} of 6 verified
          </div>
          <div className="w-40 h-2 rounded-full bg-[#EAE6DC] dark:bg-[#232B25] overflow-hidden mt-1.5">
            <div
              style={{ width: `${(completedIds.length / 6) * 100}%` }}
              className="h-full bg-[#526B58] dark:bg-[#6F9278] transition-all"
            />
          </div>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Question List */}
        <div className="lg:col-span-4 space-y-2">
          {questions.map((q) => {
            const isSelected = currentQ?.id === q.id;
            const isDone = completedIds.includes(q.id);
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setError(null);
                  setActiveId(q.id);
                }}
                className={`w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#526B58] dark:border-[#6F9278] bg-[#FFFFFF] dark:bg-[#1C221E]'
                    : 'border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF]/65 dark:bg-[#1C221E]/60 hover:bg-[#FFFFFF] dark:hover:bg-[#1C221E]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs mb-1">
                  <span className="font-mono font-semibold text-[#526B58] dark:text-[#8FB498]">
                    Question {q.id}
                  </span>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 text-[#526B58] dark:text-[#8FB498] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Completed</span>
                    </span>
                  ) : (
                    <span className="text-[#656B61] dark:text-[#A2ACA0]">Pending</span>
                  )}
                </div>
                <div className="text-sm font-medium text-[#373B35] dark:text-[#ECEEE9] leading-snug">
                  <MathText text={q.title} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Question Workspace */}
        {currentQ && (
          <div className="lg:col-span-8 rounded-xl border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E] p-6 space-y-5">
            <div className="space-y-1.5 border-b border-[#D8D4C9] dark:border-[#2D3730] pb-4">
              <div className="text-xs font-medium text-[#526B58] dark:text-[#8FB498]">
                Question {currentQ.id} · <MathText text={currentQ.concept} />
              </div>
              <h3 className="font-display text-lg font-semibold text-[#373B35] dark:text-[#ECEEE9]">
                <MathText text={currentQ.title} />
              </h3>
              <p className="text-sm text-[#656B61] dark:text-[#A2ACA0] leading-relaxed">
                <MathText text={currentQ.prompt} />
              </p>
            </div>

            {/* Answer Verification Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleCheck(currentQ);
              }}
              className="space-y-3"
            >
              <label className="block text-xs font-medium text-[#373B35] dark:text-[#ECEEE9]">
                <MathText text={currentQ.input_label} />
              </label>
              <div className="flex flex-wrap gap-3">
                <input
                  type={currentQ.input_type === 'integer' ? 'number' : 'text'}
                  value={answers[currentQ.id] ?? ''}
                  onChange={(e) =>
                    setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
                  }
                  placeholder={currentQ.input_placeholder}
                  className="flex-1 min-w-[200px] px-3 py-2 rounded-md border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#141815] font-mono text-sm"
                />
                <button
                  type="submit"
                  disabled={checking}
                  className="px-4 py-2 rounded-md text-xs font-semibold bg-[#526B58] dark:bg-[#6F9278] text-white hover:bg-[#435948] dark:hover:bg-[#7EA488] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {checking ? 'Checking...' : 'Check Answer'}
                </button>
              </div>
            </form>

            {feedback[currentQ.id] && (
              <div
                className={`p-3.5 rounded-lg border text-sm leading-relaxed ${
                  feedback[currentQ.id].correct
                    ? 'border-[#526B58]/50 bg-[#C8D3BD]/30 dark:bg-[#263229] text-[#373B35] dark:text-[#ECEEE9]'
                    : 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                }`}
              >
                <MathText text={feedback[currentQ.id].message} />
              </div>
            )}

            {/* Hints & Solution Toggles */}
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={() =>
                  setShowHints((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-[#526B58] dark:text-[#8FB498]" />
                <span>{showHints[currentQ.id] ? 'Hide Hints' : 'Show Hints'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowSolution((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }))
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8] dark:bg-[#232B25] cursor-pointer"
              >
                {showSolution[currentQ.id] ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <span>
                  {showSolution[currentQ.id]
                    ? 'Hide Step-by-Step Solution'
                    : 'Reveal Step-by-Step Solution'}
                </span>
              </button>
            </div>

            {showHints[currentQ.id] && (
              <div className="p-4 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/60 dark:bg-[#141815] space-y-1.5">
                <div className="text-xs font-semibold text-[#656B61] dark:text-[#A2ACA0]">Hints</div>
                <ul className="space-y-1.5 text-xs sm:text-sm list-disc list-inside leading-relaxed">
                  {currentQ.hints.map((h, i) => (
                    <li key={i}>
                      <MathText text={h} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showSolution[currentQ.id] && (
              <div className="p-4 rounded-lg border border-[#D8D4C9] dark:border-[#2D3730] bg-[#F3F0E8]/60 dark:bg-[#141815] space-y-3">
                <div>
                  <div className="text-xs font-semibold text-[#656B61] dark:text-[#A2ACA0] mb-1">
                    Verified Final Answer
                  </div>
                  <div className="text-sm font-semibold text-[#526B58] dark:text-[#8FB498]">
                    <MathText text={currentQ.final_answer} />
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-[#656B61] dark:text-[#A2ACA0] mb-1">
                    Step-by-Step Mathematical Proof
                  </div>
                  <ol className="space-y-1.5 text-xs sm:text-sm list-decimal list-inside">
                    {currentQ.steps.map((s, i) => (
                      <li key={i} className="leading-relaxed">
                        <MathText text={s} />
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Question-specific computed verification details */}
                {currentQ.id === 1 && renderQ1Groups(currentQ.computed_data)}
                {currentQ.id === 2 && renderQ2Table(currentQ.computed_data)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function renderQ1Groups(data: unknown) {
  const typed = data as {
    groups?: {
      index: number;
      invariant_notation: string;
      elementary_notation: string;
      verified_order: number;
    }[];
  };
  if (!typed?.groups) return null;
  return (
    <div className="overflow-x-auto pt-2">
      <table className="w-full text-left text-xs border border-[#D8D4C9] dark:border-[#2D3730]">
        <thead className="bg-[#EAE6DC] dark:bg-[#232B25]">
          <tr>
            <th className="p-2">#</th>
            <th className="p-2">Invariant Factors</th>
            <th className="p-2">Elementary Divisors</th>
            <th className="p-2">Order</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D8D4C9] dark:divide-[#2D3730]">
          {typed.groups.map((g) => (
            <tr key={g.index}>
              <td className="p-2 font-mono">{g.index}</td>
              <td className="p-2 font-semibold">
                <MathExpr value={g.invariant_notation} />
              </td>
              <td className="p-2">
                <MathExpr value={g.elementary_notation} />
              </td>
              <td className="p-2 font-mono tabular-nums">{g.verified_order}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderQ2Table(data: unknown) {
  const typed = data as { rows?: { n: number; phi: number; factorization: string }[] };
  if (!typed?.rows) return null;
  return (
    <div className="overflow-x-auto pt-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {typed.rows.map((r) => (
          <div
            key={r.n}
            className="p-2 rounded border border-[#D8D4C9] dark:border-[#2D3730] bg-[#FFFFFF] dark:bg-[#1C221E]"
          >
            <MathInline tex={`\\phi(${r.n}) = ${r.phi}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
