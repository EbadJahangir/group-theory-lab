# 2. GroupTheory Lab — Module-by-Module Explanation

This guide explains all **nine modules** of GroupTheory Lab in a structured viva-ready format, using authentic mathematical notation alongside simple English and helpful Roman English notes.

---

## Module 1: Dashboard

- **What is this module?** The central overview workspace (`DashboardView`) opened after clicking **Get Started** on the welcome screen.
- **Why is it included?** It gives immediate orientation: session activity counters, direct navigation to all mathematical tools, quick reopening of past calculations, and access to the latest report snapshot.
- **Mathematical concept demonstrated:** Summarizes cross-module algebraic activity (groups explored, calculations performed, permutations analyzed, dihedral groups explored, elements analyzed) and tracks completion of the 6 Guided Learning challenges.
- **Input accepted:** Clicks on module launcher cards, recent history entries, **Clear History**, or report shortcuts.
- **Output generated:** Updated metrics cards, module shortcut grid, chronological calculation history list, and a preview card of the most recent verified calculation.
- **Formulas / algorithms used:** Reads persisted state from `localStorage` (`grouptheory_lab_stats`, `grouptheory_lab_history`, `grouptheory_lab_guided_done`, `grouptheory_lab_latest_report`) without modifying math results.
- **Practical example:** After classifying order $72$ and exploring $D_8$, clicking the saved `Classification` entry in **Recent Calculations** immediately reopens the Abelian Classification tab with $n = 72$ loaded.
- **What to say during the teacher demonstration:**
  > *"This is the GroupTheory Lab Dashboard. It starts at zero and updates automatically as we run real calculations in Python. From here, I can jump into any explorer, reopen any recent calculation, or inspect my latest verified result."*

---

## Module 2: Abelian Group Explorer & Classification

- **What is this module?** A dual-mode workspace (`AbelianView`) with two tabs: **Cyclic & Direct Product Builder** and **Classification of Order $n$**.
- **Why is it included?** Finite Abelian groups and the Fundamental Theorem of Finite Abelian Groups are core topics in Algebra II, especially comparing cyclic vs. non-cyclic groups and enumerating groups of order $72$.
- **Mathematical concept demonstrated:** Cyclic groups $\mathbb{Z}_n$, direct products $\mathbb{Z}_{n_1} \times \cdots \times \mathbb{Z}_{n_k}$, element orders, inverses, generators, cyclicity via pairwise coprimality, prime factorization, integer partitions $p(a_i)$, **elementary divisors**, and **invariant factors**.
- **How a student uses it:**
  1. In **Builder**, add/remove cyclic factors $\mathbb{Z}_n$ (or pick presets like $\mathbb{Z}_4$, $\mathbb{Z}_2 \times \mathbb{Z}_2$, $\mathbb{Z}_4 \times \mathbb{Z}_6$), click **Generate Group**, and click any element row to inspect its step-by-step order calculation.
  2. In **Classification of Order $n$**, enter $n$ (or click presets $12, 24, 36, 72, 100$) and click **Classify Order**.
- **Input accepted:**
  - Builder: list of 1 to 6 positive integers with total product order $|G| \le 256$.
  - Classification: positive integer $1 \le n \le 100{,}000$ (up to 500 non-isomorphic groups).
- **Output generated:** Group notation, $|G|$, identity, $\max \operatorname{ord}(a)$, cyclicity status, generator list, searchable element table, element inspector, order-distribution chart, and for Classification: prime factorization, partition breakdown $\prod p(a_i)$, and table of all non-isomorphic groups in both elementary-divisor and invariant-factor forms.
- **Formulas and algorithms used (`abelian.py` & `classification.py`):**
  $$\operatorname{ord}(a) = \frac{n}{\gcd(n, a)} \quad \text{in } \mathbb{Z}_n$$
  $$\operatorname{ord}(a_1, \ldots, a_k) = \operatorname{lcm}(\operatorname{ord}(a_1), \ldots, \operatorname{ord}(a_k))$$
  $$n = p_1^{a_1} p_2^{a_2} \cdots p_k^{a_k} \implies N(n) = \prod_{i=1}^{k} p(a_i)$$
  Invariant factors $d_1 \mid d_2 \mid \cdots \mid d_m$ are built by reversing each prime's partition into ascending order, right-aligning, and multiplying columns.
- **Practical example:** Enter $n = 72$ in **Classification of Order $n$**. The engine factors $72 = 2^3 \times 3^2$, computes partitions of $3$ ($[3], [2+1], [1+1+1]$, so $p(3)=3$) and $2$ ($[2], [1+1]$, so $p(2)=2$), and lists all $3 \times 2 = 6$ non-isomorphic groups (e.g., $\mathbb{Z}_2 \times \mathbb{Z}_6 \times \mathbb{Z}_6$ with elementary divisors $\mathbb{Z}_2 \times \mathbb{Z}_2 \times \mathbb{Z}_2 \times \mathbb{Z}_3 \times \mathbb{Z}_3$).
- **What to say during the teacher demonstration:**
  > *"Here we can build any finite Abelian direct product and inspect each element's order using $\operatorname{lcm}$. When I switch to Classification and enter $n = 72$, Python computes $72 = 2^3 \times 3^2$, generates the integer partitions $p(3)=3$ and $p(2)=2$, and verifies all $6$ non-isomorphic groups in both elementary-divisor and invariant-factor forms."*

---

## Module 3: Cayley Table Generator

- **What is this module?** An interactive operation-table generator and group-axiom verifier (`CayleyView`).
- **Why is it included?** Understanding a finite group via its $n \times n$ multiplication table—and seeing *why* an arbitrary binary operation fails to be a group—is essential in Algebra II.
- **Mathematical concept demonstrated:** Binary operations $(S, *)$, Cayley tables, and explicit verification of the four group axioms (**closure, identity, inverses, associativity**) plus **commutativity** (Abelian vs. non-Abelian).
- **How a student uses it:** Select a group family (**Abelian**, **Dihedral**, **Symmetric**), choose a preset (e.g., $\mathbb{Z}_4$, $D_4$, $S_3$), click any cell $(a, b)$ to highlight row $a$, column $b$, and the result $a * b$, or switch to **Custom Axiom Test** to edit cells or load a failing preset.
- **Input accepted:**
  - Abelian: moduli with $|G| \le 24$.
  - Dihedral: $3 \le n \le 12$.
  - Symmetric: $1 \le n \le 4$.
  - Custom: $2 \le |S| \le 12$ element labels and an $n \times n$ matrix.
- **Output generated:** Full interactive Cayley matrix, selected operation bar ($a * b = c$), pass/fail badges with witness details for all five properties, and final classification (*Abelian group*, *Non-Abelian group*, or *Not a group*).
- **Formulas and algorithms used (`cayley.py`):**
  - Checks closure ($a * b \in S$), unique two-sided identity ($e * x = x * e = x$), two-sided inverses ($a * a^{-1} = a^{-1} * a = e$), brute-force associativity over all $n^3$ triples $(a * b) * c = a * (b * c)$, and matrix symmetry ($a * b = b * a$).
- **Practical example:** Load **Failing Preset: Subtraction mod 3** on $\{0, 1, 2\}$ where $a * b = (a - b) \bmod 3$. Closure passes, but identity fails and associativity fails with an explicit witness such as $(0 * 1) * 2 \neq 0 * (1 * 2)$ (Wait: $(0 - 1) - 2 \equiv 0 \pmod 3$, whereas $0 - (1 - 2) \equiv 1 \pmod 3$, so $0 \neq 1$).
- **What to say during the teacher demonstration:**
  > *"In the Cayley Table Generator, clicking any cell highlights $a * b$, and the engine checks every single axiom directly from the table. For $S_3$, all four group axioms pass while commutativity fails, proving it is a non-Abelian group. And in Custom Axiom Test, subtraction modulo 3 fails associativity with an exact counterexample."*

---

## Module 4: Permutation Explorer

- **What is this module?** A permutation analyzer and full $S_n / A_n$ explorer (`PermutationView`).
- **Why is it included?** Symmetric groups $S_n$ and alternating groups $A_n$ are the canonical source of non-Abelian finite groups in Algebra II, and students often make mistakes converting between one-line notation, disjoint cycles, and parity.
- **Mathematical concept demonstrated:** Permutations $\sigma \in S_n$, one-line vs. two-line vs. disjoint cycle notation, right-to-left cycle composition, transposition decomposition, element order via cycle lengths, parity/sign, inverse $\sigma^{-1}$, $S_n$, and $A_n$.
- **How a student uses it:** Enter a permutation in cycle notation like `(1 2 3)(4 5)` or one-line notation like `2 3 1 5 4` and click **Analyze Permutation**. Below, click $S_1 \dots S_5$ and filter by **All**, **Even ($A_n$)**, or **Odd** permutations.
- **Input accepted:**
  - Single analysis: cycle or one-line string for degree $1 \le n \le 20$.
  - Full group exploration: $1 \le n \le 5$ ($|S_5| = 120$).
- **Output generated:** Disjoint cycles, full cycles (including fixed points $1$-cycles), two-line matrix $\sigma = \begin{pmatrix} 1 & \dots & n \\ \sigma(1) & \dots & \sigma(n) \end{pmatrix}$, $\operatorname{ord}(\sigma)$, $\operatorname{sgn}(\sigma)$ and parity, transposition product, inverse $\sigma^{-1}$, and full $S_n / A_n$ counts with order distribution.
- **Formulas and algorithms used (`permutations.py`):**
  $$\operatorname{ord}(\sigma) = \operatorname{lcm}(l_1, l_2, \ldots, l_k)$$
  $$\operatorname{sgn}(\sigma) = (-1)^{n - c}$$
  where $c$ is the total number of disjoint cycles *including fixed points* (1-cycles). For $n \ge 2$, $|A_n| = \frac{n!}{2}$.
- **Practical example:** Analyze $\sigma = (1\;2\;3)(4\;5)$ in $S_5$. It has $n = 5$, cycle lengths $[3, 2]$, $c = 2$ cycles (no fixed points), $\operatorname{ord}(\sigma) = \operatorname{lcm}(3, 2) = 6$, $\operatorname{sgn}(\sigma) = (-1)^{5 - 2} = (-1)^3 = -1$ (odd), transposition product $(1\;3)(1\;2)(4\;5)$, and $\sigma^{-1} = (1\;3\;2)(4\;5)$. Exploring $S_5$ confirms $|S_5| = 120$ and $|A_5| = 60$.
- **What to say during the teacher demonstration:**
  > *"Here we enter $(1\;2\;3)(4\;5)$ in $S_5$. GroupTheory Lab shows its two-line matrix, order $\operatorname{lcm}(3, 2) = 6$, sign $(-1)^{5-2} = -1$ (odd), transposition factorization, and inverse. In the $S_5$ explorer below, Python generates all $120$ permutations and verifies that exactly $60 = 5!/2$ are even, forming $A_5$."*

---

## Module 5: Dihedral Group Explorer

- **What is this module?** A geometric and algebraic laboratory for dihedral groups $D_n = \langle r, s \rangle$ (`DihedralView`).
- **Why is it included?** Dihedral groups unite abstract algebra (generators and relations) with polygon geometry, making non-commutativity ($srs = r^{-1}$) visually obvious.
- **Mathematical concept demonstrated:** Symmetries of a regular $n$-gon ($n$ rotations $r^k$ and $n$ reflections $r^k s$), group order $|D_n| = 2n$, rotation and reflection orders, vertex permutations, and the centre $Z(D_n)$.
- **How a student uses it:** Choose a preset ($D_3, D_4, D_5, D_6, D_8, D_{12}$) or enter $3 \le n \le 24$, optionally toggle **Include Cayley Table**, and click any element row in the table to animate the regular $n$-gon and inspect its vertex mapping, inverse, and order.
- **Input accepted:** Integer $3 \le n \le 24$ (Cayley table available up to $n \le 12$).
- **Output generated:** Interactive SVG regular $n$-gon showing labelled vertices moving across fixed slots $p_1 \dots p_n$, summary cards ($|D_n|$, rotations/reflections, $Z(D_n)$), full element table, order distribution chart, and optional Cayley table.
- **Formulas and algorithms used (`dihedral.py`):**
  $$D_n = \langle r, s \mid r^n = e,\ s^2 = e,\ srs = r^{-1} \rangle, \qquad |D_n| = 2n$$
  $$\operatorname{ord}(r^k) = \frac{n}{\gcd(n, k)}, \qquad \operatorname{ord}(r^k s) = 2$$
  $$Z(D_n) = \begin{cases} \{e\}, & n \text{ odd} \\ \{e, r^{n/2}\}, & n \text{ even} \end{cases}$$
  (Computed explicitly in Python by checking $a \cdot b = b \cdot a$ for every pair, then cross-verified against the theorem.)
- **Practical example:** Select $D_8$ ($|D_8| = 16$). All $8$ reflections $r^k s$ have order $2$, and the half-turn rotation $r^4$ has $\operatorname{ord}(r^4) = \frac{8}{\gcd(8, 4)} = 2$, giving $8 + 1 = 9$ elements of order $2$ and centre $Z(D_8) = \{e, r^4\}$.
- **What to say during the teacher demonstration:**
  > *"When I select $D_8$, we see all $16$ symmetries of the regular octagon. Clicking a rotation like $r^2$ rotates the vertices, while clicking a reflection flips them across a symmetry axis. Python also verifies the centre $Z(D_8) = \{e, r^4\}$ because $180^\circ$ rotation commutes with every symmetry, whereas $D_5$ has trivial centre $\{e\}$."*

---

## Module 6: Generator & Euler Totient Calculator

- **What is this module?** A number-theoretic tool (`GeneratorsView`) computing Euler's totient $\phi(n)$ and cyclic group generators of $\mathbb{Z}_n$.
- **Why is it included?** Finding generators of $\mathbb{Z}_n$ directly links elementary number theory ($\gcd(k, n) = 1$) to finite cyclic groups.
- **Mathematical concept demonstrated:** Euler's totient function $\phi(n)$, prime factorization, coprime residue classes, generators of $\mathbb{Z}_n$, and the edge case $\mathbb{Z}_1 = \{0\}$.
- **How a student uses it:** Enter any integer $1 \le n \le 100{,}000$ (or click presets $1, 6, 12, 15, 20, 36$, or click any row in the verified $1 \le n \le 20$ reference table).
- **Input accepted:** Integer $1 \le n \le 100{,}000$ (explicit generator/residue lists displayed up to $n \le 500$).
- **Output generated:** Prime factorization, $\phi(n)$, generator verification badge, set of generators of $\mathbb{Z}_n$, set of coprime residues, Explanation Drawer, and interactive table for $1 \le n \le 20$.
- **Formulas and algorithms used (`generators.py`):**
  $$\phi(n) = n \prod_{p \mid n} \left(1 - \frac{1}{p}\right), \qquad \phi(1) = 1$$
  In $\mathbb{Z}_n$ ($n > 1$), $k$ generates $\mathbb{Z}_n$ if and only if $\gcd(k, n) = 1$. For $n = 1$, $0$ generates $\mathbb{Z}_1 = \{0\}$.
- **Practical example:** Enter $n = 20$. Prime factorization is $20 = 2^2 \times 5$, so $\phi(20) = 20 \left(1 - \frac{1}{2}\right)\left(1 - \frac{1}{5}\right) = 8$. The $8$ generators of $\mathbb{Z}_{20}$ are $\{1, 3, 7, 9, 11, 13, 17, 19\}$.
- **What to say during the teacher demonstration:**
  > *"In the Phi Calculator, entering $n = 20$ gives $20 = 2^2 \times 5$ and $\phi(20) = 8$. Python also enumerates all elements $k$ with $\gcd(k, 20) = 1$ and verifies that the generator count matches $\phi(20)$—and notice the bottom table verifies every integer from $1$ to $20$, including the special case $\phi(1) = 1$."*

---

## Module 7: Element Order Analysis

- **What is this module?** A side-by-side structural comparison workspace (`AnalysisView`).
- **Why is it included?** Comparing element order histograms is the fastest undergraduate technique to test whether two groups of the same order can be isomorphic.
- **Mathematical concept demonstrated:** Order distributions as an **isomorphism invariant**, cyclicity vs. non-cyclicity, maximum element order, and comparing Abelian vs. non-Abelian groups.
- **How a student uses it:** Configure **Group A** and **Group B** (choosing Abelian, Dihedral, or Symmetric $S_n$ with $n \le 5$) or click presets like $\mathbb{Z}_4 \text{ vs } \mathbb{Z}_2 \times \mathbb{Z}_2$, $\mathbb{Z}_6 \text{ vs } \mathbb{Z}_2 \times \mathbb{Z}_3$, or $D_3 \text{ vs } S_3$, then click **Analyze & Compare**.
- **Input accepted:** Two valid group specifications (within each family's enumeration bounds).
- **Output generated:** Structural comparison bullets, grouped bar chart (`OrderChart`), order-frequency comparison table, and side-by-side scrollable element-order lists.
- **Formulas and algorithms used (`analysis.py`):** Computes order distributions for both groups and compares group order, cyclicity, and counts per element order $d$. If two groups have different counts of elements of order $d$, they are rigorously proven **not isomorphic**.
- **Practical example:** Compare $\mathbb{Z}_4$ vs. $\mathbb{Z}_2 \times \mathbb{Z}_2$. Both have order $4$, yet $\mathbb{Z}_4$ has $\{1\text{ of ord }1,\, 1\text{ of ord }2,\, 2\text{ of ord }4\}$ while $\mathbb{Z}_2 \times \mathbb{Z}_2$ has $\{1\text{ of ord }1,\, 3\text{ of ord }2,\, 0\text{ of ord }4\}$, proving $\mathbb{Z}_4 \not\cong \mathbb{Z}_2 \times \mathbb{Z}_2$. By contrast, $D_3$ and $S_3$ have identical distributions ($1$ of order $1$, $3$ of order $2$, $2$ of order $3$).
- **What to say during the teacher demonstration:**
  > *"If two finite groups are isomorphic, they must have the exact same number of elements of every order. Comparing $\mathbb{Z}_4$ and $\mathbb{Z}_2 \times \mathbb{Z}_2$ immediately highlights that $\mathbb{Z}_4$ has two elements of order $4$ while $\mathbb{Z}_2 \times \mathbb{Z}_2$ has none—proving they cannot be isomorphic."*

---

## Module 8: Guided Learning & Challenges

- **What is this module?** An interactive assignment problem solver (`LearningView`) housing all six required Algebra II problems.
- **Why is it included?** It directly integrates the coursework assignment into the app so students can test their own answers, inspect hints, and verify full mathematical proofs generated by the Python engine.
- **Mathematical concept demonstrated:** Covers all six assignment tasks (Order $72$ Abelian classification, $\phi(1..20)$, $|A_5| = 60$, element orders in $D_6$ and $D_8$, $\mathbb{Z}_2 \times \mathbb{Z}_2$ vs. $\mathbb{Z}_4$, and order-$6$ elements in $S_5$).
- **How a student uses it:** Select Questions $1$–$6$, enter an answer, click **Check Answer**, or expand **Show Hints** and **Reveal Step-by-Step Solution**.
- **Input accepted:** Integer answers for Questions 1–5 and any valid permutation string in $S_5$ (cycle or one-line) for Question 6.
- **Output generated:** Instant verification feedback, progress bar (`X of 6 verified` stored in `localStorage`), hints, final answer, step-by-step proof, and computed verification tables/grids.
- **Formulas and algorithms used (`guided.py`):** Dynamically invokes `classify_abelian_groups(72)`, `totient_table(20)`, `explore_symmetric_group(5)`, `analyze_dihedral_group(6/8)`, `compare_groups`, and `analyze_permutation(raw_answer, expected_n=5)`. (Note: Question 6 accepts *any* order-6 permutation in $S_5$, such as `(1 4)(2 3 5)`!)
- **Practical example:** On Question 6, entering `(2 5)(1 3 4)` is checked dynamically by Python: it decomposes into cycles of lengths $2$ and $3$, confirms $\operatorname{ord}(\sigma) = \operatorname{lcm}(2,3) = 6$, and reports $\operatorname{sgn}(\sigma) = -1$ (odd).
- **What to say during the teacher demonstration:**
  > *"In Guided Learning, all six assignment questions are verified live by Python rather than static text matching. On Question 6, any valid permutation in $S_5$ with order $6$ is accepted and analyzed on the spot."*

---

## Module 9: Reports & Verification

- **What is this module?** A mathematical report previewer and multi-format exporter (`ReportsView`).
- **Why is it included?** Students and teachers need clean, submission-ready mathematical records of computed results, tables, and verification proofs.
- **Mathematical concept demonstrated:** Formats verified group structures, formulas, reasoning steps, and datasets with authentic mathematical symbols ($\mathbb{Z}_n$, $\phi(n)$, $\sigma$, $\prod$, stacked fractions).
- **How a student uses it:** Either inspect the automatically captured snapshot of the latest calculation from any module, or click a quick preset (**Order 72 Classification**, **$\phi(1..20)$ Table**, **$D_8$ Elements**, **$\mathbb{Z}_2 \times \mathbb{Z}_4$ Cayley**), then click **Download PDF Report**, **Download CSV Dataset**, or **Print Layout**.
- **Input accepted:** Active `ReportSnapshot` from state/`localStorage` or preset button click.
- **Output generated:** Styled KaTeX report preview in browser, downloadable A4 Unicode PDF (`exporters.ts` + embedded DejaVu TTF fonts), downloadable UTF-8 BOM CSV file, or print-clean layout.
- **Formulas and algorithms used (`exporters.ts` & `mathFormat.ts`):** Converts expressions into Unicode mathematical glyphs (`toAuthenticUnicodeMath`) and draws vector fraction bars and $\prod_{p \mid n}$ limits in `jsPDF` (`drawPdfFormula`).
- **Practical example:** Click **$\phi(1..20)$ Table** and **Download PDF Report** to produce a crisp A4 report displaying $\phi(n) = n \cdot \prod_{p \mid n} \left(1 - \frac{1}{p}\right)$ with stacked fractions and all 20 verified rows.
- **What to say during the teacher demonstration:**
  > *"Finally, Reports & Verification captures any calculation we just performed—or builds a preset report like Order 72 or $\phi(1..20)$—and exports it as a Unicode PDF with proper mathematical symbols and stacked fractions, or as a UTF-8 CSV dataset."*
