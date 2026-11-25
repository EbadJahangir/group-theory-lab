# 5. GroupTheory Lab — Software Architecture Explanation

This document explains how GroupTheory Lab works internally in clear, student-friendly language. As an Algebra II student presenting the project, you do **not** need to memorize low-level framework internals; instead, you should clearly understand **how data flows from the user interface to the Python mathematical engine and back**, why the math lives on the backend, and how outputs are rendered and verified.

---

## 5.1 End-to-End Request Flow

GroupTheory Lab uses a clean **three-layer architecture**:

```text
React UI (Browser)
      │  1. User enters inputs / clicks "Classify Order", "Analyze", etc.
      │     src/services/api.ts sends HTTP JSON request to /api/*
      ▼
Express API Server (Node.js on Port 3000 — server.ts)
      │  2. Serves the React app (Vite in dev, dist/ in production)
      │     and proxies every /api/* request to http://127.0.0.1:5050
      ▼
Python Mathematical Engine (Port 5050 — backend/app.py + math_engine/*.py)
      │  3. Validates inputs (validators.py), dispatches route (math_service.py),
      │     and executes exact Group Theory algorithms
      ▼
JSON Response ({ "ok": true, "data": ... } or HTTP 400 error JSON)
      │  4. Express forwards JSON back to the browser
      ▼
React UI (KaTeX + SVG + Tables + Charts + PDF/CSV Exporters)
         5. Renders authentic math symbols (MathExpr.tsx), updates history
            in localStorage, and lets the user export PDF/CSV reports
```

> **Roman English Summary:** Jab student browser mein koi button dabata hai (jaise $n=72$ classify karna), toh React browser se `/api/...` par JSON bhejta hai. Express server (`server.ts`, port `3000`) us request ko Python backend (`backend/app.py`, port `5050`) tak pahunchata hai. Python real mathematical algorithm chala kar JSON result wapas bhejta hai, aur React use KaTeX ke zariye asli math notation ($\mathbb{Z}_n$, $\phi(n)$, $D_n$) mein screen par dikha deta hai.

---

## 5.2 Layer-by-Layer Breakdown

### Layer 1: Frontend Interface (`src/`)

- **Framework:** React 19 with TypeScript (`src/App.tsx`, `src/components/modules/*.tsx`).
- **Central API Client (`src/services/api.ts`):** Uses `requestJson<T>()` around the browser `fetch` API to send `GET` and `POST` JSON requests to `/api/*` and throw clean, readable error messages when the backend returns HTTP `400` or `500`.
- **Authentic Mathematical Rendering (`src/components/MathExpr.tsx` & `src/utils/mathFormat.ts`):**
  - Converts expressions such as `Z_2 x Z_4`, `phi(n)`, `ord(r^k)`, and `(-1)^(n - c)` into LaTeX via `exprToLatex()` and renders them with **KaTeX** (`katex.renderToString`).
  - Uses a `Map` cache (`katexCache`, capped at $1500$ entries) so repeated mathematical expressions inside large Cayley tables or permutation lists render instantly without lag.
  - Provides `<MathInline />`, `<MathBlock />`, `<MathExpr />`, and `<MathText />` (which splits mixed English prose and formulas automatically via `splitMixedMathText`).
- **Visualizations:**
  - `DihedralView.tsx`: Computes polygon vertex coordinates dynamically in SVG from the backend's `vertex_permutation` array and draws the dashed reflection axis when `is_reflection` is `true`.
  - `OrderChart.tsx`: Renders bar distributions comparing counts of elements of each order $\operatorname{ord}(g)$.
- **Browser Persistence (`src/services/storage.ts`):** Uses `localStorage` (no login or database required) under six keys:
  - `grouptheory_lab_theme` (`light` or `dark` Warm Sage theme)
  - `grouptheory_lab_entered` (remembers whether the user entered the workspace)
  - `grouptheory_lab_stats` (session counters: groups explored, calculations, permutations analyzed, elements analyzed)
  - `grouptheory_lab_history` (last $25$ calculations so any past calculation can be reopened with one click)
  - `grouptheory_lab_guided_done` (completed Question IDs $1\dots 6$)
  - `grouptheory_lab_latest_report` (latest report snapshot ready for PDF/CSV export)
- **Export Engine (`src/services/exporters.ts`):**
  - **PDF Export (`exportReportPdf`):** Fetches and embeds four TrueType Unicode fonts from `/fonts/` (`DejaVuSans.ttf`, `DejaVuSans-Bold.ttf`, `DejaVuSansMono.ttf`, `DejaVuSerif.ttf`) into `jsPDF` so mathematical symbols ($\mathbb{Z}$, $\phi$, $\sigma$, $\times$, $\prod$, $\le$, superscripts/subscripts) never appear as garbled boxes. Draws stacked fractions (like $\frac{n}{\gcd(n,k)}$) and product limits ($\prod_{p \mid n}$) cleanly on the PDF canvas, capping huge tables at $150$ rows in PDF so export stays fast.
  - **CSV Export (`downloadCsv`):** Prepends a UTF-8 Byte Order Mark (`\uFEFF`) and normalizes cells via `toAuthenticUnicodeMath()` so Excel/LibreOffice display $\mathbb{Z}_n$, $\phi(n)$, and cycles cleanly.

### Layer 2: Express Application Server & API Proxy (`server.ts`)

- Runs on **port `3000`** (`npm run dev` launches `tsx server.ts`).
- On startup, `startPythonBackend()` spawns `python3 backend/app.py` on `127.0.0.1:5050` and polls `GET /api/health` (`waitForPythonHealth`) until the math engine is ready.
- Mounts `app.use('/api', ...)` to forward all `/api/*` requests and JSON bodies to the Python engine, returning `502` only if the Python process is unreachable.
- Serves the frontend via Vite middleware in development or from the compiled `dist/` directory in production (`npm run build` runs `vite build`).

### Layer 3: Python Mathematical Engine (`backend/`)

- **Server Entry (`backend/app.py`):** Starts Flask if installed; automatically falls back to Python's standard-library `ThreadingHTTPServer` if Flask is unavailable in the runtime environment. Either way, every request goes into the exact same dispatcher.
- **API Dispatcher (`backend/services/math_service.py`):** Maps all $13$ endpoints (`/api/health` plus $12$ math endpoints) and wraps `ValidationError` / `ValueError` into clean HTTP `400` JSON responses (`{"ok": false, "error": ..., "field": ...}`) without leaking stack traces.
- **Input Validation (`backend/validation/validators.py`):** Checks integer bounds, positive divisors, permutation syntax, and enumeration limits (e.g., $|G| \le 256$ for Abelian exploration, $|G| \le 24$ for Cayley tables, $n \le 5$ for full $S_n$ enumeration, $n \le 24$ for $D_n$, $n \le 10000$ for $\phi(n)$).
- **Modular Math Engine (`backend/math_engine/`):**
  1. `abelian.py` — Element enumeration, tuple addition modulo $n_i$, element orders via $\operatorname{lcm}$, inverses, cyclicity, and generator checks.
  2. `classification.py` — Prime factorization, integer partitions $p(a_i)$, elementary-divisor listing, and greedy invariant-factor conversion.
  3. `cayley.py` — Table generation for Abelian, $D_n$, $S_n$, and custom tables plus explicit checks of all $5$ axioms (with counterexample witnesses on failure).
  4. `permutations.py` — Parser for cycle and one-line notation, composition, disjoint cycle decomposition, $\operatorname{ord}(\sigma)$, $\operatorname{sgn}(\sigma) = (-1)^{n-c}$, transposition product, and full $S_n / A_n$ generation.
  5. `dihedral.py` — Normal form $r^k s^\varepsilon$, exact multiplication using $sr = r^{-1}s$, vertex permutations, element orders, and centre $Z(D_n)$ verification.
  6. `generators.py` — Trial-division prime factorization, $\phi(n)$ product formula, coprime list, cyclic generators of $\mathbb{Z}_n$, and verified $1 \le n \le 20$ table.
  7. `analysis.py` — Frequency distribution of $\operatorname{ord}(g)$ and side-by-side comparison of two groups.
  8. `guided.py` — Dynamic answer verification and proof explanations for all $6$ Algebra II assignment questions.

---

## 5.3 Complete API Endpoints Reference

| HTTP Method & Route | Handled By (`math_service.py`) | Purpose |
| :--- | :--- | :--- |
| `GET /api/health` | Health check | Verifies Python math engine readiness (`{"status": "ok"}`) |
| `POST /api/abelian/explore` | `analyze_abelian_group(moduli)` | Enumerates $\mathbb{Z}_{n_1} \times \cdots \times \mathbb{Z}_{n_k}$ elements, orders, inverses, generators |
| `POST /api/abelian/classify` | `classify_abelian_groups(n)` | Classifies all non-isomorphic Abelian groups of order $n$ |
| `POST /api/cayley/generate` | `generate_cayley_table(data)` | Builds Cayley matrix and verifies closure, identity, inverses, associativity, commutativity |
| `POST /api/permutations/analyze` | `analyze_permutation(perm, n)` | Analyzes one $\sigma \in S_n$: disjoint cycles, two-line, order, sign, parity, inverse |
| `POST /api/permutations/symmetric` | `explore_symmetric_group(n)` | Generates all $n!$ elements of $S_n$ and filters $A_n$ |
| `POST /api/dihedral/explore` | `analyze_dihedral_group(n, include_cayley)` | Analyzes $D_n$, vertex actions, orders, and centre $Z(D_n)$ |
| `POST /api/generators/phi` | `analyze_totient(n)` | Computes $\phi(n)$, prime factors, coprimes, and generators of $\mathbb{Z}_n$ |
| `GET /api/generators/table` | `totient_table(20)` | Returns verified $\phi(n)$ and generators for $1 \le n \le 20$ |
| `POST /api/analysis/orders` | `analyze_group_orders(data)` | Computes element-order distribution for a single group |
| `POST /api/analysis/compare` | `compare_groups(group_a, group_b)` | Compares order distributions of two groups side by side |
| `GET /api/guided/questions` | `get_guided_questions()` | Fetches the $6$ Algebra II challenges with prompts, hints, and solutions |
| `POST /api/guided/check` | `check_guided_answer(id, answer)` | Checks a student's answer live using the Python engine |

---

## 5.4 Why Keep the Mathematical Engine in Python?

1. **Single Source of Truth:** All mathematical rules live in `backend/math_engine/*.py`, so Guided Learning checks, PDF reports, Cayley tables, and Group Explorers can never disagree.
2. **Clean Testability:** Pure mathematical functions can be verified directly with automated unit tests (`tests/test_*.py`) without needing a browser.
3. **Zero UI Hardcoding:** The React frontend never computes group orders or axioms locally; it sends inputs and formats the Python engine's verified JSON response.
4. **Clean Separation of Concerns:** Python handles exact algebra; TypeScript/React handles interactive visualization, KaTeX typography, and exports.

---

## 5.5 Verification, Type Checking & Production Build

GroupTheory Lab has three layers of automated verification:

1. **Python Unit & API Integration Tests (`tests/`):** $6$ test files (`test_abelian.py`, `test_cayley.py`, `test_dihedral.py`, `test_generators.py`, `test_permutations.py`, `test_guided_questions.py`) containing **$19$ automated tests** verifying classification for orders $1, 4, 8, 12, 24, 36, 72$, group axioms and counterexamples, $|S_5| = 120$ and $|A_5| = 60$, $D_n$ centres, $\phi(1\dots 20)$, all $6$ guided answers, and HTTP `400` error handling via `dispatch_endpoint`.
   - Command: `python3 -m unittest discover -s tests -v` (or `pytest -v` when `pytest` is installed).
2. **TypeScript Type Check:** `npm run lint` executes `tsc --noEmit` to catch type mismatches across the React frontend and Express server.
3. **Production Bundle:** `npm run build` executes `vite build` to bundle the optimized application into `dist/`.

---

## 5.6 What You Must Know Deeply vs. Explain at a High Level

| Must Know Deeply (Algebra II Focus) | Explain at a High Level (Software Focus) |
| :--- | :--- |
| Every definition and formula ($\mathbb{Z}_n$, $p(a)$, $\gcd$, $\operatorname{lcm}$, $\operatorname{ord}(g)$, $\operatorname{sgn}(\sigma)$, $D_n$, $Z(D_n)$, $\phi(n)$). | Why React handles display/KaTeX while Python handles all calculations. |
| How invariant factors and elementary divisors represent the same Abelian group (e.g., for $n=72$). | The 3-tier flow: React $\to$ Express proxy (`3000`) $\to$ Python engine (`5050`) $\to$ JSON $\to$ React. |
| Why two same-order groups (e.g., $\mathbb{Z}_4$ vs. $\mathbb{Z}_2 \times \mathbb{Z}_2$) are non-isomorphic via order distributions. | How `localStorage` stores recent history and why no database/login is needed in Version 1. |
| Why all $5$ Cayley axioms (and failure witnesses) behave the way they do. | How `jsPDF` embeds DejaVu fonts so Unicode math prints cleanly in PDF exports. |
