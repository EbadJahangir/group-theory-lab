# 1. GroupTheory Lab — Project Overview & Academic Documentation

- **Project Title:** GroupTheory Lab
- **Subtitle:** Interactive Abstract Algebra Explorer
- **Tagline:** *Explore. Compute. Visualize. Verify.*
- **Course Context:** University-Level Algebra II — Assignment Artifact 1 (*Finite Abelian, Permutation & Dihedral Group Explorer*)

---

## 1.1 Project Objectives

GroupTheory Lab was built to turn abstract finite group theory into an interactive, verifiable computational laboratory. Its primary objectives are:

1. **Compute Exact Algebraic Structures:** Replace manual error-prone calculations with exact algorithms for cyclic groups $\mathbb{Z}_n$, direct products $\mathbb{Z}_{n_1} \times \cdots \times \mathbb{Z}_{n_k}$, symmetric groups $S_n$, alternating groups $A_n$, and dihedral groups $D_n$.
2. **Classify Finite Abelian Groups:** Implement the Fundamental Theorem of Finite Abelian Groups to enumerate all non-isomorphic Abelian groups of a given order $n$ in both **elementary-divisor** and **invariant-factor** forms.
3. **Verify Group Axioms Explicitly:** Construct Cayley tables and check **closure, identity, inverses, associativity, and commutativity** cell by cell, including custom user-entered operation tables.
4. **Visualize Geometric Symmetries & Order Distributions:** Show regular $n$-gon transformations ($r^k$ and $r^k s$) dynamically via an interactive SVG polygon, and compare element-order frequencies using bar charts.
5. **Connect Theory to Coursework:** Provide a Guided Learning workspace containing the six Algebra II assignment problems checked live against the Python engine, along with authentic KaTeX notation and exportable Unicode PDF and CSV reports.

---

## 1.2 Problem Statement

Undergraduate Algebra II students often find finite group theory difficult because:

- **High manual calculation overhead:** Checking associativity on an $8 \times 8$ Cayley table requires checking $8^3 = 512$ triples, and enumerating all $5! = 120$ permutations of $S_5$ by hand is tedious and error-prone.
- **Confusion between isomorphic vs. non-isomorphic groups:** Students frequently assume groups of the same order (such as $\mathbb{Z}_4$ and $\mathbb{Z}_2 \times \mathbb{Z}_2$, or $D_3$ and $S_3$) behave identically, or struggle to convert between elementary divisors and invariant factors (e.g., for order $72$).
- **Static textbook representations:** Dihedral groups $D_n$ and permutation compositions $\sigma \in S_n$ represent dynamic actions on vertices, yet static notes make it hard to see why reflections have order $2$ or why $sr = r^{-1}s \neq rs$.

> **Roman English Note:** Jab students haath se $72$ order ke Abelian groups ya $S_5$ ke $120$ permutations aur unke orders nikaalte hain, toh chhoti si calculation mistake se poora jawab ghalat ho jaata hai. GroupTheory Lab is problem ko solve karta hai kyunki har calculation real Python algorithm se verify hoti hai aur step-by-step reasoning saamne dikhti hai.

---

## 1.3 Proposed Solution

GroupTheory Lab provides a single-workspace web laboratory powered by a **Python mathematical engine** (single source of truth) and a **React + TypeScript** interface rendered with authentic **KaTeX** mathematical typography:

- Every calculation runs live on the backend—there are **no hardcoded demo outputs**.
- Every computed result includes an **Explanation Drawer** showing the exact formula, English explanation, and step-by-step reasoning.
- Every calculation can be revisited from **localStorage recent history** or exported to a **Unicode PDF report** (using embedded DejaVu fonts with stacked fractions) or a **UTF-8 CSV dataset**.

---

## 1.4 Target Users

- **Undergraduate Mathematics / Algebra II Students:** Studying finite Abelian groups, permutations, dihedral symmetries, and Euler's totient function, or preparing assignments and oral vivas.
- **Course Instructors & Teaching Assistants:** Demonstrating non-isomorphic groups (e.g., $\mathbb{Z}_4$ vs. $\mathbb{Z}_2 \times \mathbb{Z}_2$), non-associative operations, $A_5$, and $Z(D_n)$ live during lectures or grading student demonstrations.

---

## 1.5 Main Features

1. **Dashboard:** Live session metrics, quick module launchers, clickable recent calculation history, and latest verified report preview.
2. **Abelian Group Explorer & Classification:** Build $\mathbb{Z}_{n_1} \times \cdots \times \mathbb{Z}_{n_k}$, inspect every element's order and inverse, and classify all non-isomorphic Abelian groups of order $n$ (e.g., $n = 72$).
3. **Cayley Table Generator:** Generate operation tables for $\mathbb{Z}_n$, products, $D_n$, and $S_n$, or test custom $n \times n$ tables for all five group properties.
4. **Permutation Explorer:** Parse cycle or one-line notation, compute disjoint cycles, two-line form, $\operatorname{ord}(\sigma)$, $\operatorname{sgn}(\sigma)$, transposition product, $\sigma^{-1}$, and explore full $S_n$ and $A_n$.
5. **Dihedral Group Explorer:** Interactive SVG regular $n$-gon visualizer for $D_n = \langle r, s \rangle$, rotation/reflection order formulas, Cayley table, and verified centre $Z(D_n)$.
6. **Generator & Euler Totient Calculator:** Compute $\phi(n)$, prime factorization, coprime residues, cyclic generators of $\mathbb{Z}_n$, and inspect the verified $1 \le n \le 20$ reference table.
7. **Element Order Analysis:** Compare order distributions $\operatorname{ord}(g)$ of any two groups side by side using charts, frequency tables, and isomorphism highlights.
8. **Guided Learning & Challenges:** Interactive solver and proof viewer for all six Algebra II assignment questions checked live by the engine.
9. **Reports & Verification:** Preview snapshots and export authentic Unicode mathematical PDFs, UTF-8 CSVs, or print layouts.

---

## 1.6 Technology Stack

| Layer | Technologies Used (Verified in Project) |
| :--- | :--- |
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS v4 (Warm Sage Light & Dark themes) |
| **Mathematical Typography** | KaTeX (`katex`) for inline and display equations in the browser |
| **Data Visualization** | Custom SVG components (`OrderChart`, `DihedralView` interactive $n$-gon) & `lucide-react` icons |
| **PDF & CSV Export** | `jspdf` with embedded `DejaVuSans`, `DejaVuSans-Bold`, `DejaVuSansMono`, and `DejaVuSerif` fonts; UTF-8 BOM CSV builder |
| **Browser Persistence** | Browser `localStorage` (theme, session stats, up to 25 recent history items, completed guided questions, latest report) |
| **API Proxy / App Server** | Node.js + Express (`server.ts` on port `3000`) launching Python and proxying `/api/*` |
| **Mathematical Engine** | Python 3 (`backend/math_engine/*.py`, Flask when available with built-in `ThreadingHTTPServer` fallback) |
| **Automated Testing** | Python `unittest` / `pytest`-compatible test suite (`tests/*.py`, 19 unit & API integration tests) + `tsc --noEmit` |

---

## 1.7 Mathematical Scope

GroupTheory Lab covers finite discrete groups core to undergraduate Algebra II:

- Finite cyclic groups $\mathbb{Z}_n$ and finite direct products $\mathbb{Z}_{n_1} \times \cdots \times \mathbb{Z}_{n_k}$
- Fundamental Theorem of Finite Abelian Groups (elementary divisors & invariant factors)
- Group axioms via finite Cayley tables (closure, associativity, identity, inverses, commutativity)
- Symmetric groups $S_n$, alternating groups $A_n$, disjoint cycle decomposition, and parity
- Dihedral groups $D_n$, vertex symmetries, element orders, and centres $Z(D_n)$
- Euler's totient function $\phi(n)$ and cyclic group generators
- Element order distributions as an isomorphism invariant

---

## 1.8 Project Limitations

To remain fast, interactive, and safe against combinatorial explosion, GroupTheory Lab enforces clear computational bounds:

1. **Finite Abelian Element Enumeration:** Up to $|G| \le 256$ elements and at most $6$ direct-product components.
2. **Abelian Order Classification:** Integer order $1 \le n \le 100{,}000$, capped at $500$ non-isomorphic groups displayed per query.
3. **Cayley Tables:** Generated tables capped at $|G| \le 24$ (so $D_n$ up to $n = 12$ and $S_n$ up to $n = 4$); custom editable axiom tables capped at $12 \times 12$.
4. **Permutations:** Full $S_n / A_n$ enumeration capped at $n \le 5$ ($|S_5| = 120$); single permutation analysis supports $n \le 20$.
5. **Dihedral Explorer:** Supports $3 \le n \le 24$ (with embedded Cayley tables up to $n \le 12$).
6. **Totient Enumeration:** $\phi(n)$ computes up to $n \le 100{,}000$, while explicit generator/residue listing is capped at $n \le 500$.
7. **Storage Scope:** No server-side database or user accounts in Version 1; history and progress are stored locally in browser `localStorage`.
8. **Scope Boundary:** Infinite groups, continuous Lie groups, general group presentations, and Galois groups are outside Algebra II Version 1 scope.

---

## 1.9 Why Interactive Software Helps in Learning Group Theory

1. **Immediate Counterexamples:** Students can test why $\mathbb{Z}_2 \times \mathbb{Z}_2 \not\cong \mathbb{Z}_4$ or why subtraction modulo $3$ fails associativity and see the exact failing witness immediately.
2. **Bridging Algebra and Geometry:** Clicking $r^k$ or $r^k s$ in $D_n$ connects symbolic relations like $srs = r^{-1}$ directly to physical vertex movement.
3. **Verification Before Memorization:** Students can first try an assignment calculation by hand and then verify every intermediate step (factorization, partitions, cycle lengths, centre elements) against exact proofs.
