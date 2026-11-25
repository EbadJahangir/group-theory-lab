export type ModuleId =
  | 'dashboard'
  | 'abelian'
  | 'cayley'
  | 'permutations'
  | 'dihedral'
  | 'generators'
  | 'analysis'
  | 'learning'
  | 'reports';

export type ThemeMode = 'light' | 'dark';

export interface ExplanationBlock {
  summary: string;
  formula: string;
  reasoning: string[];
}

export interface OrderCount {
  order: number;
  count: number;
}

export interface AbelianElement {
  tuple: number[];
  label: string;
  inverse: string;
  inverse_tuple: number[];
  order: number;
  coordinate_orders: number[];
  is_identity: boolean;
  is_generator: boolean;
  order_explanation: string;
}

export interface AbelianGroupResult {
  group_name: string;
  moduli: number[];
  is_single_cyclic: boolean;
  order: number;
  identity: string;
  max_element_order: number;
  is_cyclic: boolean;
  generators: string[];
  generator_count: number;
  elements: AbelianElement[];
  order_distribution: OrderCount[];
  explanation: ExplanationBlock;
  limits: {
    max_order: number;
    max_components: number;
  };
}

export interface ClassifiedAbelianGroup {
  index: number;
  elementary_divisors: number[];
  elementary_notation: string;
  invariant_factors: number[];
  invariant_notation: string;
  verified_order: number;
  elementary_order_verified?: boolean;
  divisibility_verified: boolean;
  is_cyclic: boolean;
  max_element_order: number;
}

export interface ClassificationResult {
  n: number;
  prime_factorization: { prime: number; exponent: number }[];
  factorization_str: string;
  partition_counts: { prime: number; exponent: number; partitions: number[][]; p_a: number }[];
  total_groups: number;
  formula_str: string;
  groups: ClassifiedAbelianGroup[];
  all_orders_verified: boolean;
  explanation: ExplanationBlock;
}

export interface AxiomCheck {
  passed: boolean;
  detail: string;
  element?: string | null;
}

export interface CayleyResult {
  group_name: string;
  group_type: string;
  order: number;
  operation_symbol: string;
  operation_description: string;
  labels: string[];
  matrix: string[][];
  verification: {
    closure: AxiomCheck;
    identity: AxiomCheck;
    inverses: AxiomCheck;
    associativity: AxiomCheck;
    commutativity: AxiomCheck;
    is_group: boolean;
    is_abelian_group: boolean;
  };
  explanation: ExplanationBlock;
  limits: {
    max_order: number;
    max_permutation_n: number;
    max_dihedral_n: number;
  };
}

export interface PermutationAnalysis {
  n: number;
  input_mode: string;
  one_line: number[];
  one_line_notation: string;
  two_line: { top: number[]; bottom: number[] };
  disjoint_cycles: number[][];
  all_cycles: number[][];
  cycle_notation: string;
  full_cycle_notation: string;
  cycle_lengths: number[];
  non_trivial_cycle_lengths: number[];
  cycle_count_c: number;
  order: number;
  sign: number;
  parity: 'even' | 'odd';
  is_even: boolean;
  transposition_count: number;
  transpositions_str: string;
  inverse_one_line: number[];
  inverse_cycle_notation: string;
  explanation: ExplanationBlock;
}

export interface SymmetricGroupEntry {
  one_line: number[];
  one_line_notation: string;
  cycle_notation: string;
  full_cycle_notation: string;
  cycle_lengths: number[];
  order: number;
  sign: number;
  parity: 'even' | 'odd';
  is_even: boolean;
}

export interface SymmetricGroupResult {
  n: number;
  group_name: string;
  alternating_name: string;
  total_order: number;
  even_count: number;
  odd_count: number;
  expected_an_order: number;
  an_verified: boolean;
  permutations: SymmetricGroupEntry[];
  even_permutations: SymmetricGroupEntry[];
  odd_permutations: SymmetricGroupEntry[];
  order_distribution: OrderCount[];
  explanation: ExplanationBlock;
  limits: {
    max_full_enumeration_n: number;
    max_single_analysis_n: number;
  };
}

export interface DihedralElement {
  label: string;
  is_reflection: boolean;
  k: number;
  classification: 'identity' | 'rotation' | 'reflection';
  order: number;
  inverse: string;
  angle_deg: number;
  vertex_permutation: number[];
  order_explanation: string;
}

export interface DihedralResult {
  n: number;
  group_name: string;
  order: number;
  rotation_count: number;
  reflection_count: number;
  elements: DihedralElement[];
  centre: string[];
  centre_verified: boolean;
  is_abelian: boolean;
  order_distribution: OrderCount[];
  cayley_table: { labels: string[]; matrix: string[][] } | null;
  cayley_note: string | null;
  explanation: ExplanationBlock;
  limits: {
    max_n: number;
    max_cayley_n: number;
  };
}

export interface TotientResult {
  n: number;
  phi: number;
  prime_factorization: { prime: number; exponent: number }[];
  factorization_str: string;
  enumerated: boolean;
  coprime_residues: number[] | null;
  generators: number[] | null;
  generator_count: number;
  verified: boolean;
  explanation: ExplanationBlock;
  limits: {
    max_n: number;
    max_enumerate_n: number;
  };
}

export interface TotientTableRow {
  n: number;
  phi: number;
  factorization: string;
  generators: number[];
  generator_count: number;
  verified: boolean;
}

export interface TotientTableResult {
  max_n: number;
  rows: TotientTableRow[];
  all_verified: boolean;
}

export interface OrderAnalysisGroup {
  group_name: string;
  group_type: string;
  order: number;
  is_cyclic: boolean;
  is_abelian: boolean;
  max_element_order: number;
  elements: { label: string; order: number; detail: string }[];
  order_distribution: OrderCount[];
}

export interface GroupComparisonResult {
  group_a: OrderAnalysisGroup;
  group_b: OrderAnalysisGroup;
  comparison_table: { order: number; count_a: number; count_b: number }[];
  same_group_order: boolean;
  same_order_distribution: boolean;
  highlights: string[];
}

export interface GuidedQuestion {
  id: number;
  title: string;
  concept: string;
  prompt: string;
  input_type: string;
  input_label: string;
  input_placeholder: string;
  hints: string[];
  steps: string[];
  final_answer: string;
  computed_data: unknown;
}

export interface HistoryItem {
  id: string;
  module: ModuleId;
  type: string;
  description: string;
  timestamp: string;
  params: Record<string, unknown>;
}

export interface AppStats {
  groupsExplored: number;
  calculationsPerformed: number;
  permutationsAnalyzed: number;
  dihedralExplored: number;
  elementsAnalyzed: number;
}

export interface ReportSnapshot {
  id: string;
  title: string;
  module: ModuleId;
  groupOrSubject: string;
  inputsSummary: string;
  formulas: string[];
  summary: string;
  verificationLines: string[];
  tableHeaders: string[];
  tableRows: string[][];
  createdAt: string;
}
