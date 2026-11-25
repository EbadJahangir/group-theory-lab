/**
 * Utilities for converting GroupTheory Lab mathematical expressions between:
 * - Authentic LaTeX (for KaTeX rendering in React UI and print layouts)
 * - Authentic Unicode mathematical notation (for PDF, CSV, and SVG text)
 */

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
  '+': '⁺',
  'n': 'ⁿ',
  'k': 'ᵏ',
  'c': 'ᶜ',
  'i': 'ⁱ',
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  'n': 'ₙ',
  'k': 'ₖ',
  'i': 'ᵢ',
  'j': 'ⱼ',
  'm': 'ₘ',
};

function toSuperscript(str: string): string {
  return [...str].map((ch) => SUPERSCRIPT_MAP[ch] ?? ch).join('');
}

function toSubscript(str: string): string {
  return [...str].map((ch) => SUBSCRIPT_MAP[ch] ?? ch).join('');
}

/**
 * Convert an expression (without prose) into authentic LaTeX for KaTeX.
 */
export function exprToLatex(expr: string): string {
  let s = expr.trim();
  if (!s) return '';

  // Normalize Unicode super/subscripts back to LaTeX forms
  s = s
    .replace(/⁻¹/g, '^{-1}')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/ℤ/g, 'Z')
    .replace(/⟨/g, '\\langle ')
    .replace(/⟩/g, '\\rangle ')
    .replace(/φ/g, '\\phi ')
    .replace(/σ/g, '\\sigma ')
    .replace(/∏/g, '\\prod ')
    .replace(/∈/g, '\\in ')
    .replace(/∉/g, '\\notin ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/≠/g, '\\ne ')
    .replace(/×/g, '\\times ')
    .replace(/∘/g, '\\circ ')
    .replace(/·/g, '\\cdot ');

  // Subscript numerals
  s = s.replace(/[₀₁₂₃₄₅₆₇₈₉ₙₖ]+/g, (m) => {
    const rev: Record<string, string> = {
      '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
      '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
      'ₙ': 'n', 'ₖ': 'k',
    };
    const plain = [...m].map((c) => rev[c] ?? c).join('');
    return `_{${plain}}`;
  });

  // Group centres Z(D_n) -> \mathbb{Z}(D_n)
  s = s.replace(/\bZ\((D_[a-zA-Z0-9]+)\)/g, '\\mathbb{Z}($1)');
  // Cyclic groups Z_n, Z_72, Z_{n} -> \mathbb{Z}_{...}
  s = s.replace(/\bZ_\{([^}]+)\}/g, '\\mathbb{Z}_{$1}');
  s = s.replace(/\bZ_([a-zA-Z0-9]+)/g, '\\mathbb{Z}_{$1}');
  // Dihedral / Symmetric / Alternating multi-char subscripts
  s = s.replace(/\b([DSA])_([a-zA-Z0-9]{2,})/g, '$1_{$2}');

  // Dihedral element r^ks -> r^k s, r^10s -> r^{10}s
  s = s.replace(/\br\^\(([^)]+)\)\s*s\b/g, 'r^{$1}s');
  s = s.replace(/\br\^\(([^)]+)\)/g, 'r^{$1}');
  s = s.replace(/\br\^([a-zA-Z0-9]+)\s*s\b/g, 'r^{$1}s');
  s = s.replace(/\br\^([a-zA-Z0-9]+)/g, 'r^{$1}');

  // Exponents like (-1)^(n - c), p^(k-1), p_1^a_1, 2^3, (-1)^3
  s = s.replace(/\^\(([^)]+)\)/g, '^{$1}');
  s = s.replace(/\^([a-zA-Z0-9]{2,})/g, '^{$1}');
  s = s.replace(/_([a-zA-Z0-9]{2,})/g, '_{$1}');

  // Operator names
  s = s.replace(/\bord_([a-zA-Z0-9]+)/g, '\\operatorname{ord}_{$1}');
  s = s.replace(/\bord\b/g, '\\operatorname{ord}');
  s = s.replace(/\blcm\b/g, '\\operatorname{lcm}');
  s = s.replace(/\bgcd\b/g, '\\gcd');
  s = s.replace(/\bsign\b/g, '\\operatorname{sign}');

  // Subscripts on prod: \prod _{p | n} or \prod_{p | n}
  s = s.replace(/\\prod\s*_\{([^}]+)\}/g, '\\prod_{$1}');
  s = s.replace(/\b([a-zA-Z])_([a-zA-Z0-9]+)\b/g, '$1_{$2}');

  // Known clean fraction formulas
  s = s.replace(/n\s*\/\s*\\gcd\(n,\s*([a-zA-Z0-9]+)\)/g, '\\frac{n}{\\gcd(n, $1)}');
  s = s.replace(/n!\s*\/\s*2/g, '\\frac{n!}{2}');
  s = s.replace(/(\d+!)\s*\/\s*(\d+)/g, '\\frac{$1}{$2}');
  s = s.replace(/(\d+)\s*\/\s*\\gcd\((\d+),\s*(\d+)\)/g, '\\frac{$1}{\\gcd($2, $3)}');
  s = s.replace(/\b1\s*\/\s*([a-zA-Z0-9]+)/g, '\\frac{1}{$1}');

  // Clean up spacing around `|` in sets / products
  s = s.replace(/\s\|\s/g, ' \\mid ');

  return s;
}

/**
 * Convert mixed English + math prose into segments of { type: 'text' | 'math', value: string }.
 */
export type MathSegment =
  | { type: 'text'; value: string }
  | { type: 'math'; value: string };

const INLINE_MATH_TOKEN_REGEX =
  /(\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\\mathbb\{[^}]+\}|\|(?:Z|D|S|A)_(?:\{[^}]+\}|[a-zA-Z0-9]+)\||(?:Z|D|S|A)_(?:\{[^}]+\}|[a-zA-Z0-9]+)(?:\s*(?:×|\\times)\s*(?:Z|D|S|A)_(?:\{[^}]+\}|[a-zA-Z0-9]+))*|Z\(D_[a-zA-Z0-9]+\)|φ\([^)]+\)|σ⁻¹|σ|\(\d+(?:\s+\d+)+\)(?:\(\d+(?:\s+\d+)+\))*|ord(?:_[a-zA-Z0-9]+)?\([^)]+\)|gcd\([^)]+\)|lcm\([^)]+\)|sign\([^)]+\)|p\(\d+\)|p\(a(?:_i)?\)|r\^\([^)]+\)\s*s?|r\^[a-zA-Z0-9]+\s*s?|[a-zA-Z]\^\([^)]+\)|[a-zA-Z]\^[a-zA-Z0-9]+|\(-1\)\^\([^)]+\)|\(-1\)\^[a-zA-Z0-9]+|\d+\^\d+(?:\s*×\s*\d+\^\d+)*|\{[^}]+\}|∏(?:_\{[^}]+\})?|[a-zA-Z]_[a-zA-Z0-9]+|∈|∉|≤|≥|≠|×|∘|\bn!\s*\/\s*2\b|\d+!\s*\/\s*\d+|\b1\s*\/\s*[a-zA-Z0-9]+\b|\bn!\b|\d+!|<r,\s*s>|⟨r,\s*s⟩)/g;

export function splitMixedMathText(text: string): MathSegment[] {
  if (!text) return [];
  const segments: MathSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_MATH_TOKEN_REGEX)) {
    const idx = match.index ?? 0;
    const raw = match[0];

    if (idx > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, idx) });
    }

    let tex = raw;
    if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
      tex = raw.slice(2, -2);
    } else if (raw.startsWith('\\[') && raw.endsWith('\\]')) {
      tex = raw.slice(2, -2);
    } else {
      tex = exprToLatex(raw);
    }

    segments.push({ type: 'math', value: tex });
    lastIndex = idx + raw.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * Convert mathematical notation to authentic Unicode characters for PDF/CSV/plain-text outputs.
 * Never replaces symbols with English words!
 */
export function toAuthenticUnicodeMath(input: string): string {
  let s = String(input);

  // Blackboard Z for Z_n and Z(D_n)
  s = s.replace(/\bZ\((D_[a-zA-Z0-9]+)\)/g, 'ℤ($1)');
  s = s.replace(/\bZ_(\d+|n|m|k)/g, (_m, sub: string) => `ℤ${toSubscript(sub)}`);

  // Dihedral / Symmetric / Alternating subscripts: D_8 -> D₈, S_5 -> S₅, A_5 -> A₅
  s = s.replace(/\b([DSA])_(\d+|n|k)/g, (_m, letter: string, sub: string) => `${letter}${toSubscript(sub)}`);

  // Angle brackets <r, s> -> ⟨r, s⟩
  s = s.replace(/<([^<>]+)>/g, '⟨$1⟩');

  // Exponents like r^(n/2), (-1)^(n - c), 2^3, r^4s, p^(k-1), p_1^a_1
  s = s.replace(/\(-1\)\^\(([^)]+)\)/g, (_m, exp: string) => {
    const compact = exp.replace(/\s+/g, '');
    return `(-1)${toSuperscript(compact)}`;
  });
  s = s.replace(/\(-1\)\^(\d+)/g, (_m, exp: string) => `(-1)${toSuperscript(exp)}`);
  s = s.replace(/r\^\(n\/2\)/g, 'rⁿ/²');
  s = s.replace(/r\^\(-1\)/g, 'r⁻¹');
  s = s.replace(/r\^(\d+|k)\s*s\b/g, (_m, exp: string) => `r${toSuperscript(exp)}s`);
  s = s.replace(/r\^(\d+|k)\b/g, (_m, exp: string) => `r${toSuperscript(exp)}`);
  s = s.replace(/\b([a-zA-Z])\^\(([^)]+)\)/g, (_m, base: string, exp: string) => `${base}${toSuperscript(exp.replace(/\s+/g, ''))}`);
  s = s.replace(/\b([a-zA-Z])\^(\d+|k|n)\b/g, (_m, base: string, exp: string) => `${base}${toSuperscript(exp)}`);
  s = s.replace(/(\d+)\^(\d+)/g, (_m, base: string, exp: string) => `${base}${toSuperscript(exp)}`);

  // Generic single-letter subscript like d_1, a_i, p_1
  s = s.replace(/\b([a-zA-Z])_(\d+|n|k|i|j|m)\b/g, (_m, base: string, sub: string) => `${base}${toSubscript(sub)}`);

  // Product subscript notation like ∏_{p | n} -> ∏(p ∣ n) for plain Unicode / CSV
  s = s.replace(/∏_\{([^}]+)\}/g, (_m, cond: string) => `∏(${cond.replace(/\|/g, '∣')})`);

  // Operators
  s = s.replace(/<=/g, '≤').replace(/>=/g, '≥').replace(/!=/g, '≠');

  return s;
}
