# GroupTheory Lab — Phase 6 Academic, Teacher Demo & Viva Preparation Index

- **Project:** GroupTheory Lab — *Interactive Abstract Algebra Explorer* (*Explore. Compute. Visualize. Verify.*)
- **Course:** University-Level Algebra II — Assignment Artifact 1 (*Finite Abelian, Permutation & Dihedral Group Explorer*)

This folder contains the complete, verified academic preparation package for your teacher demonstration and oral viva. Every mathematical statement, formula, UI label, endpoint, and test count reflects the verified GroupTheory Lab codebase.

---

## Preparation Documents

| # | Document | Purpose |
| :--- | :--- | :--- |
| **1** | [`01_Project_Overview_and_Documentation.md`](./01_Project_Overview_and_Documentation.md) | Project title, objectives, problem statement, proposed solution, target users, features, tech stack, mathematical scope, and limitations. |
| **2** | [`02_Module_by_Module_Explanation.md`](./02_Module_by_Module_Explanation.md) | Complete walkthrough of all $9$ modules: purpose, math concept, inputs/outputs, formulas, worked example, and 1-sentence demo pitch. |
| **3** | [`03_Mathematical_Concepts_and_Formulas.md`](./03_Mathematical_Concepts_and_Formulas.md) | Formula reference with original mathematical notation, full order-$72$ classification table, Cayley axioms, $S_n/A_n$, $D_n$ & $Z(D_n)$, $\phi(1\dots 20)$, and common mistakes. |
| **4** | [`04_Assignment_Questions_Complete_Solutions.md`](./04_Assignment_Questions_Complete_Solutions.md) | Full step-by-step proofs and oral viva scripts for all $6$ Algebra II Guided Learning assignment questions. |
| **5** | [`05_Software_Architecture_Explanation.md`](./05_Software_Architecture_Explanation.md) | Plain-language explanation of `React UI → Express API → Python Mathematical Engine → JSON Response → React UI`, endpoints, KaTeX, PDF/CSV exports, `localStorage`, and tests. |
| **6** | [`06_Teacher_Demonstration_Script.md`](./06_Teacher_Demonstration_Script.md) | Timed 8–10 minute, 10-step live demo script with exact sidebar/button clicks, expected outputs, and spoken lines. |
| **7** | [`07_Viva_Questions_and_Answers.md`](./07_Viva_Questions_and_Answers.md) | $45$ expected viva Q&As across all $9$ categories (project, fundamentals, Abelian classification, Cayley, permutations, dihedral, totient, architecture, testing). |

---

## Quick Study Strategy Before Your Viva

1. **Master the Math First (Docs 03 & 04):** Be able to write and explain from memory:
   - $72 = 2^3 \times 3^2 \implies N(72) = p(3)\times p(2) = 3\times 2 = 6$, and convert $\mathbb{Z}_2\times\mathbb{Z}_4\times\mathbb{Z}_9 \leftrightarrow \mathbb{Z}_2\times\mathbb{Z}_{36}$.
   - Why $\mathbb{Z}_4 \not\cong \mathbb{Z}_2 \times \mathbb{Z}_2$ using element orders.
   - Disjoint cycle order $\operatorname{ord}(\sigma) = \operatorname{lcm}(L_1, \dots, L_c)$, parity $(-1)^{n-c}$, and $|A_5| = 5!/2 = 60$.
   - Dihedral relations $r^n = s^2 = e$, $sr = r^{-1}s$, reflection order $2$, rotation order $\frac{n}{\gcd(n,k)}$, and $Z(D_n)$ for odd vs. even $n$.
   - $\phi(n) = n \prod_{p\mid n}\left(1 - \frac{1}{p}\right)$, $\phi(1)=1$, and generators of $\mathbb{Z}_n$.
2. **Keep Software Explanations Simple (Doc 05):**
   - Explain cleanly: *"React sends JSON through Express on port 3000 to Python on port 5050, Python runs the exact algebra algorithms, and React renders the verified results with KaTeX."*
3. **Rehearse the 10-Step Demo Twice (Doc 06):**
   - Time yourself once using the exact 10 steps so your live presentation finishes comfortably within 8–10 minutes.
   - > **Roman English Reminder:** *"Viva mein teacher sab se pehle math poochte hain (orders, $72$ ke $6$ groups, $Z(D_n)$, $A_5$, $\phi(n)$). Code ke baare mein bas clear aur simple flow bataana kaafi hota hai!"*
