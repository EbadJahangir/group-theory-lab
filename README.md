# GroupTheory Lab — Interactive Abstract Algebra Explorer

**Explore. Compute. Visualize. Verify.**

GroupTheory Lab is an Algebra II computational laboratory for exploring **Finite Abelian Groups**, **Permutation & Alternating Groups**, and **Dihedral Groups** (official assignment: *Finite Abelian, Permutation & Dihedral Group Explorer*), powered by a Python mathematical engine.

---

## Project Architecture

- **`backend/`** — Python mathematical engine (single source of truth for all group-theory calculations):
  - `math_engine/abelian.py` — Cyclic groups `Z_n` and direct products `Z_{n1} × ... × Z_{nk}`
  - `math_engine/classification.py` — Classification of finite Abelian groups of order `n` (invariant factors & elementary divisors)
  - `math_engine/cayley.py` — Cayley table generation and group axiom verification (closure, identity, inverses, associativity, commutativity)
  - `math_engine/permutations.py` — Cycle decomposition, element order (`lcm`), sign `(-1)^(n-c)`, `S_n`, and `A_n`
  - `math_engine/dihedral.py` — Dihedral group `D_n` elements, orders, vertex permutations, and centre `Z(D_n)`
  - `math_engine/generators.py` — Euler's totient `φ(n)` and cyclic group generators
  - `math_engine/analysis.py` — Element order distributions and group comparisons
  - `math_engine/guided.py` — Six Algebra II assignment problems and automated answer verification
  - `validation/validators.py` — Input validation and safety bounds
  - `app.py` — HTTP API server (uses Flask when installed, with a built-in Python stdlib HTTP fallback)
- **`server.ts`** — Express server on port `3000` that launches the Python backend and proxies `/api/*` requests directly to it while serving the frontend.
- **`src/`** — Modular React + TypeScript + Tailwind CSS frontend with Warm Sage Light & Dark modes, localStorage history/statistics, interactive SVG polygon visualizer, and PDF/CSV exporters.
- **`tests/`** — Automated `unittest` / `pytest` test suite covering Abelian groups, Cayley tables, permutations, dihedral groups, Euler's totient, classification of order 72, and API validation.

---

## Setup & Running Commands

### Run Full Application (Frontend + Python Math Engine)

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

### Run Automated Mathematical Tests

With Python's built-in `unittest`:
```bash
python3 -m unittest discover -s tests -v
```

Or with `pytest` (if installed via `pip install -r requirements.txt`):
```bash
pytest -v
```

### Run Standalone Python API Server (Optional)

```bash
pip install -r requirements.txt
python3 backend/app.py
```

---

## Teacher Demonstration Guide

1. **Welcome & Dashboard**: Start on the welcome screen (`Explore. Compute. Visualize. Verify.`), click **Get Started**, and show the live session statistics (starting at 0 with real calculation tracking).
2. **Abelian Groups & Order 72 Classification**: Open **Abelian Group Explorer**, build `Z_2 × Z_2` and `Z_4`, then switch to **Classification of Order n** (`n = 72`) to show all 6 non-isomorphic groups (`p(3) × p(2) = 6`) in both invariant-factor and elementary-divisor forms.
3. **Cayley Table & Axiom Verification**: Open **Cayley Table Generator** for `Z_4`, `D_4`, or `S_3`, click cells to inspect products, and switch to **Custom Axiom Test** to demonstrate a non-associative operation failing verification.
4. **Permutations & `S_5` / `A_5`**: Open **Permutation Explorer**, analyze `(1 2 3)(4 5)` (order 6, sign `-1`, odd), and inspect `S_5` showing `|A_5| = 60 = 5!/2`.
5. **Dihedral Geometry**: Open **Dihedral Group Explorer** for `D_6` and `D_8`, click rotations and reflections to watch the SVG polygon transform, and verify `Z(D_6) = {e, r^3}` and `Z(D_8) = {e, r^4}`.
6. **Guided Learning & Reports**: Answer questions in **Guided Learning** and export a formatted **PDF** or **CSV** report from **Reports & Verification**.
