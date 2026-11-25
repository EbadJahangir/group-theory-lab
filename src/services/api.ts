import type {
  AbelianGroupResult,
  CayleyResult,
  ClassificationResult,
  DihedralResult,
  GroupComparisonResult,
  GuidedQuestion,
  OrderAnalysisGroup,
  PermutationAnalysis,
  SymmetricGroupResult,
  TotientResult,
  TotientTableResult,
} from '../types/symmetry';

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  let body: { ok?: boolean; data?: T; error?: string } | null = null;
  try {
    body = await res.json();
  } catch {
    throw new Error('Received an invalid response from the mathematical engine.');
  }
  if (!res.ok || !body?.ok || body.data === undefined) {
    throw new Error(body?.error || `Calculation failed (HTTP ${res.status}).`);
  }
  return body.data;
}

export const api = {
  exploreAbelian: (moduli: number[]) =>
    requestJson<AbelianGroupResult>('/api/abelian/explore', {
      method: 'POST',
      body: JSON.stringify({ moduli }),
    }),

  classifyAbelian: (n: number | string) =>
    requestJson<ClassificationResult>('/api/abelian/classify', {
      method: 'POST',
      body: JSON.stringify({ n }),
    }),

  generateCayley: (payload: Record<string, unknown>) =>
    requestJson<CayleyResult>('/api/cayley/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  analyzePermutation: (permutation: string | number[], n?: number | string | null) =>
    requestJson<PermutationAnalysis>('/api/permutations/analyze', {
      method: 'POST',
      body: JSON.stringify({ permutation, n: n ?? null }),
    }),

  exploreSymmetricGroup: (n: number | string) =>
    requestJson<SymmetricGroupResult>('/api/permutations/symmetric', {
      method: 'POST',
      body: JSON.stringify({ n }),
    }),

  exploreDihedral: (n: number | string, includeCayley = false) =>
    requestJson<DihedralResult>('/api/dihedral/explore', {
      method: 'POST',
      body: JSON.stringify({ n, include_cayley: includeCayley }),
    }),

  analyzeTotient: (n: number | string) =>
    requestJson<TotientResult>('/api/generators/phi', {
      method: 'POST',
      body: JSON.stringify({ n }),
    }),

  getTotientTable: () => requestJson<TotientTableResult>('/api/generators/table', { method: 'GET' }),

  analyzeOrders: (spec: Record<string, unknown>) =>
    requestJson<OrderAnalysisGroup>('/api/analysis/orders', {
      method: 'POST',
      body: JSON.stringify(spec),
    }),

  compareGroups: (groupA: Record<string, unknown>, groupB: Record<string, unknown>) =>
    requestJson<GroupComparisonResult>('/api/analysis/compare', {
      method: 'POST',
      body: JSON.stringify({ group_a: groupA, group_b: groupB }),
    }),

  getGuidedQuestions: () =>
    requestJson<{ questions: GuidedQuestion[] }>('/api/guided/questions', { method: 'GET' }),

  checkGuidedAnswer: (questionId: number, answer: string | number) =>
    requestJson<{ question_id: number; correct: boolean; feedback: string; analysis?: PermutationAnalysis }>(
      '/api/guided/check',
      {
        method: 'POST',
        body: JSON.stringify({ question_id: questionId, answer }),
      }
    ),
};
