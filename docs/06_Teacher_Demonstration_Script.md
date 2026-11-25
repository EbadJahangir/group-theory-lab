# 6. GroupTheory Lab — Teacher Demonstration Script (8–10 Minutes)

This script guides you step by step through a live **8–10 minute** demonstration of **GroupTheory Lab** for your Algebra II instructor. Every button name, tab, preset, and expected result matches the actual application.

---

## Pre-Demo Checklist (30 Seconds Before Starting)

1. Confirm the app is running on port `3000` (`npm run dev`).
2. Start on the **Welcome** screen (if already inside the workspace, click the **GroupTheory Lab** logo in the top-left of the sidebar to return to Welcome, or simply explain from Dashboard).
3. Keep light or dark mode crisp for the projector (the **Light / Dark** toggle is in the top bar).

---

## 10-Step Live Walkthrough Script

### Step 1 — Introduction & Welcome Screen (0:00 – 0:45)

- **Click:** Nothing yet; point to the Welcome screen, then click **Get Started** (or **Open Workspace**).
- **Expected Output:** Opens the main **Dashboard**.
- **What to Say:**
  > "Good morning/afternoon. My Algebra II project is **GroupTheory Lab — Interactive Abstract Algebra Explorer** (*Explore. Compute. Visualize. Verify.*). It is a real interactive group-theory laboratory backed by a Python mathematical engine—there are no hardcoded answers. Every formula and table is computed live and rendered using authentic mathematical notation."
- **Roman English Tip:** *"Shuru mein simple aur confident bolna hai: yeh sirf static UI nahi hai, har calculation live Python backend se compute hoti hai."*

---

### Step 2 — Dashboard Overview (0:45 – 1:25)

- **Action:** Point to the **Session Metrics** cards, **Quick Module Launchers**, **Recent Calculations** list, and **Latest Verified Report** card on the **Dashboard**.
- **Expected Output:** Shows live session counters (`Groups Explored`, `Calculations`, `Permutations`, `Elements`), quick navigation cards, and clickable history saved in `localStorage`.
- **What to Say:**
  > "The Dashboard summarizes my current session, provides one-click launchers for every module, and keeps a clickable history of recent calculations so I can reopen any previous group instantly."

---

### Step 3 — Classification of Finite Abelian Groups of Order $72$ (1:25 – 2:35)

- **Clicks:**
  1. In the left sidebar, click **Abelian Group Explorer**.
  2. Click the tab **Classification of Order $n$**.
  3. Click the **`n=72`** preset (or type `72` and click **Classify Order**).
- **Expected Output:** Displays $72 = 2^3 \times 3^2$, total count $N(72) = p(3) \times p(2) = 3 \times 2 = 6$, and the table of all $6$ non-isomorphic Abelian groups in both **invariant-factor** and **elementary-divisor** forms.
- **What to Say:**
  > "Here is Assignment Question 1: classifying all finite Abelian groups of order $72$. Since $72 = 2^3 \times 3^2$, the Fundamental Theorem of Finite Abelian Groups gives $p(3) \times p(2) = 3 \times 2 = 6$ non-isomorphic groups. Notice how the engine pairs each elementary-divisor form, like $\mathbb{Z}_2 \times \mathbb{Z}_4 \times \mathbb{Z}_9$, with its invariant-factor form $\mathbb{Z}_2 \times \mathbb{Z}_{36}$, and shows that only $\mathbb{Z}_{72}$ is cyclic."
- **Optional Quick Check:** Click **Open in Explorer** or switch to **Cyclic & Direct Product Builder** and show $\mathbb{Z}_2 \times \mathbb{Z}_4$ (`|G|=8`, non-cyclic, $\max\operatorname{ord}(g) = 4$).

---

### Step 4 — Cayley Table & Group Axiom Verification (2:35 – 3:50)

- **Clicks:**
  1. In the sidebar, click **Cayley Table Generator**.
  2. Click the **`Symmetric (S_n)`** tab and click **`S_3 (6)`** (or select **Dihedral ($D_n$)** $\to$ **`D_4`**) to show a non-Abelian group.
  3. Next, click the **`Custom Axiom Test`** tab (pre-loaded with $(a - b) \bmod 3$ on $\{0,1,2\}$) and click **Generate & Verify Table**.
- **Expected Output:**
  - For $S_3$: **Closure**, **Identity**, **Inverses**, **Associativity** all show **Pass**, while **Commutativity** shows **Fail** with an explicit non-commuting pair witness.
  - For $(a - b) \bmod 3$: **Identity** and **Associativity** fail with exact triple witnesses like $(a * b) * c \neq a * (b * c)$.
- **What to Say:**
  > "In the Cayley Table Generator, GroupTheory Lab checks all four group axioms plus commutativity element by element. For $S_3$, the four group axioms pass while commutativity fails, proving it is non-Abelian. When I test subtraction modulo $3$ in the Custom Axiom Test, the engine detects that associativity fails and prints the exact failing triple $(a,b,c)$."

---

### Step 5 — Permutation Order, Parity & $S_5 / A_5$ (3:50 – 5:00)

- **Clicks:**
  1. In the sidebar, click **Permutation Explorer**.
  2. Enter `(1 2 3)(4 5)` with degree `5` (pre-loaded by default, or click **Analyze Permutation**).
  3. Scroll to the **Symmetric & Alternating Group Explorer** section below and select `n = 5` (click **`S_5`** / **Generate $S_n$**), then toggle the filter **`Even (A_n)`**.
- **Expected Output:**
  - For $\sigma = (1\,2\,3)(4\,5)$: disjoint cycles $(1\,2\,3)(4\,5)$, $\operatorname{ord}(\sigma) = \operatorname{lcm}(3,2) = 6$, $\operatorname{sgn}(\sigma) = -1$ (**Odd**), transposition decomposition $(1\,3)(1\,2)(4\,5)$, and $\sigma^{-1} = (1\,3\,2)(4\,5)$.
  - For $S_5$: total order $|S_5| = 120$, even permutations $|A_5| = 60$, odd permutations $= 60$.
- **What to Say:**
  > "This answers Assignment Question 6 and checks Question 3 on $S_5$. For $\sigma = (1\,2\,3)(4\,5)$, the cycles are disjoint of lengths $3$ and $2$, so $\operatorname{ord}(\sigma) = \operatorname{lcm}(3,2) = 6$, and its sign is $(-1)^{5-2} = -1$, making it an odd permutation. Below, generating all $120$ elements of $S_5$ confirms that $A_5$ contains exactly $60$ even permutations."

---

### Step 6 — Dihedral Group $D_6$ / $D_8$: Rotations, Reflections & Centre (5:00 – 6:10)

- **Clicks:**
  1. In the sidebar, click **Dihedral Group Explorer**.
  2. Click preset **`D_8`** (or enter `8` and click **Explore $D_n$**).
  3. Click an element row such as **`r^2`**, then **`r^4`**, then a reflection such as **`s`** or **`rs`**.
- **Expected Output:**
  - Polygon SVG updates dynamically to show vertex positions and the dashed reflection axis for reflections.
  - Centre banner reports $Z(D_8) = \{e, r^4\}$ because $8$ is even, and lists rotation orders $\operatorname{ord}(r^k) = \frac{8}{\gcd(8,k)}$ alongside every reflection having $\operatorname{ord}(r^k s) = 2$.
- **What to Say:**
  > "Here in the Dihedral Group Explorer for $D_8$—the symmetries of a regular octagon of order $16$—clicking $r^2$ rotates the vertices, and clicking $s$ draws the reflection axis and flips vertices. Every reflection has order $2$, while rotations follow $\operatorname{ord}(r^k) = \frac{n}{\gcd(n,k)}$. Notice the centre is verified as $Z(D_8) = \{e, r^4\}$ because $n=8$ is even; if I switch to $D_5$ or $D_3$, the centre shrinks to $\{e\}$."

---

### Step 7 — Euler's Totient $\phi(n)$ & Generators (6:10 – 7:05)

- **Clicks:**
  1. In the sidebar, click **Generator & Phi Calculator**.
  2. Click preset **`12`** (or **`20`**) to analyze $\mathbb{Z}_n$, and scroll briefly to the **Verified Reference Table ($1 \le n \le 20$)**.
- **Expected Output:**
  - For $n = 12$: $12 = 2^2 \times 3$, $\phi(12) = 4$, coprime elements & generators $\{1, 5, 7, 11\}$.
  - Table shows all verified values from $\phi(1) = 1$ up to $\phi(20) = 8$.
- **What to Say:**
  > "In the Generator & Phi Calculator, we compute Euler's totient $\phi(n) = n \prod_{p \mid n}\left(1 - \frac{1}{p}\right)$ and list every generator of $\mathbb{Z}_n$—the elements $a$ with $\gcd(n,a)=1$. Below is the complete verified table for $1 \le n \le 20$, including the identity-group case $\phi(1) = 1$."

---

### Step 8 — Element Order Analysis & Non-Isomorphic Comparison (7:05 – 8:00)

- **Clicks:**
  1. In the sidebar, click **Element Order Analysis**.
  2. Click the comparison preset **$\mathbb{Z}_4$ vs $\mathbb{Z}_2 \times \mathbb{Z}_2$** (or **$\mathbb{Z}_6$ vs $D_3$**).
- **Expected Output:** Side-by-side charts and order-frequency table showing both have order $4$, yet $\mathbb{Z}_4$ has two elements of order $4$ whereas $\mathbb{Z}_2 \times \mathbb{Z}_2$ has none (three elements of order $2$).
- **What to Say:**
  > "Isomorphic finite groups must have identical element-order distributions. Comparing $\mathbb{Z}_4$ and $\mathbb{Z}_2 \times \mathbb{Z}_2$ shows both have order $4$, but $\mathbb{Z}_4$ has elements of order $4$ while $\mathbb{Z}_2 \times \mathbb{Z}_2$ has maximum order $2$. This immediately proves they are non-isomorphic."

---

### Step 9 — Guided Learning Assignment Verification (8:00 – 8:50)

- **Clicks:**
  1. In the sidebar, click **Guided Learning**.
  2. Select **`Question 1`** (or **`Question 6`**), type `6`, and click **Check Answer**.
  3. Click **Reveal Step-by-Step Solution**.
- **Expected Output:** Engine confirms the answer is **Verified Correct**, updates the `X of 6 verified` progress bar, and displays the full formatted proof.
- **What to Say:**
  > "Guided Learning connects all six Algebra II assignment questions directly to the backend. When I submit an answer—such as $6$ groups for order $72$, or $(1\,2\,3)(4\,5)$ for Question 6—Python verifies it mathematically and displays the complete proof."

---

### Step 10 — Reports & PDF Export (8:50 – 9:30)

- **Clicks:**
  1. In the sidebar, click **Reports & Verification**.
  2. Click **`Order 72 Classification`** (or **`φ(1..20) Table`**) to load a verified snapshot.
  3. Click **`Download PDF Report`** (and mention **`Download CSV Dataset`**).
- **Expected Output:** Generates and downloads a formatted PDF containing authentic Unicode mathematical notation ($\mathbb{Z}_n$, $\phi(n)$, stacked fractions) via embedded DejaVu fonts.
- **What to Say:**
  > "Finally, in Reports & Verification, any calculation can be exported as a Unicode mathematical PDF or UTF-8 CSV file—preserving symbols like $\mathbb{Z}_n$, $\phi(n)$, and stacked fractions—ready for coursework submission. Thank you—I am ready for any questions."

---

## Backup Tips During Live Demo

- If the instructor asks to test a custom input, avoid guessing large values blindly: keep Abelian exploration $\le 256$, Cayley tables $\le 24$, and full $S_n$ enumeration $\le 5$ (and mention that the backend cleanly returns a validation error if limits are exceeded).
- Always open or point to the **Explanation Drawer** when asked *"How did the program get that number?"*—it displays the exact formula and step-by-step reasoning used.
