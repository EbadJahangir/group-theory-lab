# 4. Assignment Questions — Complete Solutions & Viva Prep

All six Guided Learning assignment problems below have been **verified directly against GroupTheory Lab's Python engine** (`backend/math_engine/guided.py` and `tests/test_guided_questions.py`).

---

## Question 1: Classify All Finite Abelian Groups of Order $72$

- **Given:** Group order $n = 72$.
- **Relevant Concept:** Fundamental Theorem of Finite Abelian Groups (elementary divisors & invariant factors).
- **Formulas:**
  $$n = \prod_{i=1}^k p_i^{a_i}, \qquad N(n) = \prod_{i=1}^k p(a_i)$$
- **Step-by-Step Solution:**
  1. Factor $72$ into prime powers:
     $$72 = 8 \times 9 = 2^3 \times 3^2$$
  2. List integer partitions of exponent $3$ ($p = 2$):
     $$[3],\quad [2+1],\quad [1+1+1] \implies p(3) = 3$$
     Corresponding $2$-Sylow components: $\mathbb{Z}_8$, $\mathbb{Z}_2 \times \mathbb{Z}_4$, $\mathbb{Z}_2 \times \mathbb{Z}_2 \times \mathbb{Z}_2$.
  3. List integer partitions of exponent $2$ ($p = 3$):
     $$[2],\quad [1+1] \implies p(2) = 2$$
     Corresponding $3$-Sylow components: $\mathbb{Z}_9$, $\mathbb{Z}_3 \times \mathbb{Z}_3$.
  4. Multiply partition counts:
     $$N(72) = p(3) \times p(2) = 3 \times 2 = 6$$
  5. Combine every pair and align prime powers from smallest to largest to form invariant factors $d_1 \mid d_2 \mid \cdots \mid d_m$:
     1. $\mathbb{Z}_8 \times \mathbb{Z}_9 \cong \mathbb{Z}_{72}$ *(cyclic)*
     2. $\mathbb{Z}_8 \times \mathbb{Z}_3 \times \mathbb{Z}_3 \cong \mathbb{Z}_3 \times \mathbb{Z}_{24}$
     3. $\mathbb{Z}_2 \times \mathbb{Z}_4 \times \mathbb{Z}_9 \cong \mathbb{Z}_2 \times \mathbb{Z}_{36}$
     4. $\mathbb{Z}_2 \times \mathbb{Z}_4 \times \mathbb{Z}_3 \times \mathbb{Z}_3 \cong \mathbb{Z}_6 \times \mathbb{Z}_{12}$
     5. $\mathbb{Z}_2 \times \mathbb{Z}_2 \times \mathbb{Z}_2 \times \mathbb{Z}_9 \cong \mathbb{Z}_2 \times \mathbb{Z}_2 \times \mathbb{Z}_{18}$
     6. $\mathbb{Z}_2 \times \mathbb{Z}_2 \times \mathbb{Z}_2 \times \mathbb{Z}_3 \times \mathbb{Z}_3 \cong \mathbb{Z}_2 \times \mathbb{Z}_6 \times \mathbb{Z}_6$
- **Final Result (Guided Input):** `6` non-isomorphic Abelian groups of order $72$.
- **Short Oral Viva Explanation:**
  > *"Factor $72 = 2^3 \times 3^2$. Because $3$ has $3$ partitions and $2$ has $2$ partitions, there are $p(3) \times p(2) = 3 \times 2 = 6$ non-isomorphic Abelian groups. Only $\mathbb{Z}_{72}$ is cyclic; the other five have repeated prime factors so they are non-cyclic."*

---

## Question 2: Tabulate $\phi(n)$ for $1 \le n \le 20$

- **Given:** Range $1 \le n \le 20$; verify with $\phi(20)$.
- **Relevant Concept:** Euler's totient function and cyclic group generators of $\mathbb{Z}_n$.
- **Formulas:**
  $$\phi(n) = n \prod_{p \mid n} \left(1 - \frac{1}{p}\right), \qquad \phi(p^k) = p^k - p^{k-1}, \qquad \phi(1) = 1$$
- **Step-by-Step Solution:**
  For $n = 20 = 2^2 \times 5$:
  $$\phi(20) = 20\left(1 - \frac{1}{2}\right)\left(1 - \frac{1}{5}\right) = 20 \times \frac{1}{2} \times \frac{4}{5} = 8$$
  Equivalently, $\phi(4) \times \phi(5) = 2 \times 4 = 8$. Complete verified table:

  | $n$ | Factorization | $\phi(n)$ | Generators of $\mathbb{Z}_n$ |
  | :-: | :--- | :-: | :--- |
  | 1 | $1$ | **1** | $\{0\}$ |
  | 2 | $2$ | **1** | $\{1\}$ |
  | 3 | $3$ | **2** | $\{1, 2\}$ |
  | 4 | $2^2$ | **2** | $\{1, 3\}$ |
  | 5 | $5$ | **4** | $\{1, 2, 3, 4\}$ |
  | 6 | $2 \times 3$ | **2** | $\{1, 5\}$ |
  | 7 | $7$ | **6** | $\{1, 2, 3, 4, 5, 6\}$ |
  | 8 | $2^3$ | **4** | $\{1, 3, 5, 7\}$ |
  | 9 | $3^2$ | **6** | $\{1, 2, 4, 5, 7, 8\}$ |
  | 10 | $2 \times 5$ | **4** | $\{1, 3, 7, 9\}$ |
  | 11 | $11$ | **10** | $\{1, \ldots, 10\}$ |
  | 12 | $2^2 \times 3$ | **4** | $\{1, 5, 7, 11\}$ |
  | 13 | $13$ | **12** | $\{1, \ldots, 12\}$ |
  | 14 | $2 \times 7$ | **6** | $\{1, 3, 5, 9, 11, 13\}$ |
  | 15 | $3 \times 5$ | **8** | $\{1, 2, 4, 7, 8, 11, 13, 14\}$ |
  | 16 | $2^4$ | **8** | $\{1, 3, 5, 7, 9, 11, 13, 15\}$ |
  | 17 | $17$ | **16** | $\{1, \ldots, 16\}$ |
  | 18 | $2 \times 3^2$ | **6** | $\{1, 5, 7, 11, 13, 17\}$ |
  | 19 | $19$ | **18** | $\{1, \ldots, 18\}$ |
  | 20 | $2^2 \times 5$ | **8** | $\{1, 3, 7, 9, 11, 13, 17, 19\}$ |

- **Final Result (Guided Input):** `8` ($\phi(20) = 8$).
- **Short Oral Viva Explanation:**
  > *"$\phi(n)$ counts the numbers from $1$ to $n$ coprime to $n$, which are precisely the generators of $\mathbb{Z}_n$. For $n = 20 = 2^2 \times 5$, $\phi(20) = 20 \cdot \frac{1}{2} \cdot \frac{4}{5} = 8$, and for $n=1$, $\phi(1) = 1$ since $0$ generates $\mathbb{Z}_1$."*

---

## Question 3: Count the Even Permutations in $S_5$

- **Given:** Symmetric group $S_5$ ($n = 5$).
- **Relevant Concept:** Alternating group $A_n$ and permutation parity.
- **Formulas:**
  $$|S_n| = n!, \qquad |A_n| = \frac{n!}{2} \quad (n \ge 2)$$
- **Step-by-Step Solution:**
  1. Total elements in $S_5$: $|S_5| = 5! = 5 \times 4 \times 3 \times 2 \times 1 = 120$.
  2. For $n \ge 2$, multiplying by a fixed transposition $(1\;2)$ gives a bijection between even and odd permutations, so exactly half are even.
  3. Compute $|A_5| = \frac{5!}{2} = \frac{120}{2} = 60$.
- **Final Result (Guided Input):** `60` even permutations ($|A_5| = 60$).
- **Short Oral Viva Explanation:**
  > *"$S_5$ has $5! = 120$ permutations. Because $n \ge 2$, exactly half of them are even and half are odd, so $|A_5| = 120/2 = 60$."*

---

## Question 4: Calculate Element Orders in $D_6$ and $D_8$

- **Given:** Dihedral groups $D_6$ ($n = 6$, order $12$) and $D_8$ ($n = 8$, order $16$).
- **Relevant Concept:** Structure and element orders of dihedral groups $D_n = \langle r, s \rangle$.
- **Formulas:**
  $$\operatorname{ord}(r^k) = \frac{n}{\gcd(n, k)}, \qquad \operatorname{ord}(r^k s) = 2$$
- **Step-by-Step Solution:**
  - **In $D_6$ ($|D_6| = 12$):**
    - $e$: order $1$ ($1$ element)
    - $r, r^5$: order $\frac{6}{\gcd(6, 1)} = 6$ ($2$ elements)
    - $r^2, r^4$: order $\frac{6}{\gcd(6, 2)} = 3$ ($2$ elements)
    - $r^3$: order $\frac{6}{\gcd(6, 3)} = 2$ ($1$ element)
    - $6$ reflections $s, rs, r^2s, r^3s, r^4s, r^5s$: order $2$ ($6$ elements)
    - Total order-$2$ elements in $D_6$: $1 + 6 = 7$; maximum order is $6$.
  - **In $D_8$ ($|D_8| = 16$):**
    - $e$: order $1$ ($1$ element)
    - $r, r^3, r^5, r^7$: order $\frac{8}{\gcd(8, k)} = 8$ ($4$ elements)
    - $r^2, r^6$: order $\frac{8}{\gcd(8, 2)} = 4$ ($2$ elements)
    - $r^4$: order $\frac{8}{\gcd(8, 4)} = 2$ ($1$ element — also in $Z(D_8) = \{e, r^4\}$)
    - $8$ reflections $s, rs, \ldots, r^7s$: order $2$ ($8$ elements)
    - Total order-$2$ elements in $D_8$: $8\text{ reflections} + 1\text{ half-turn } (r^4) = 9$; maximum order is $8$.
- **Final Result (Guided Input):** `9` elements of order $2$ in $D_8$.
- **Short Oral Viva Explanation:**
  > *"In $D_8$, all $8$ reflections have order $2$, and the $180^\circ$ rotation $r^4$ also has order $8/\gcd(8,4) = 2$. So $D_8$ has $8 + 1 = 9$ elements of order $2$."*

---

## Question 5: Why $\mathbb{Z}_2 \times \mathbb{Z}_2$ Has No Element of Order $4$ (vs. $\mathbb{Z}_4$)

- **Given:** Groups $\mathbb{Z}_2 \times \mathbb{Z}_2$ and $\mathbb{Z}_4$ (both of order $4$).
- **Relevant Concept:** Direct-product element orders, cyclicity, and non-isomorphic groups of order $4$.
- **Formula:**
  $$\operatorname{ord}(a, b) = \operatorname{lcm}\big(\operatorname{ord}_2(a),\ \operatorname{ord}_2(b)\big)$$
- **Step-by-Step Solution:**
  1. List all elements of $\mathbb{Z}_2 \times \mathbb{Z}_2$:
     - $(0, 0)$: $\operatorname{lcm}(1, 1) = 1$
     - $(1, 0)$: $\operatorname{lcm}(2, 1) = 2$
     - $(0, 1)$: $\operatorname{lcm}(1, 2) = 2$
     - $(1, 1)$: $\operatorname{lcm}(2, 2) = 2$
     Since $2 \cdot (a, b) = (0, 0)$ for every element, the **maximum order** is $2$, so no element can have order $4$.
  2. Compare with $\mathbb{Z}_4$:
     - $\operatorname{ord}(0) = 1$, $\operatorname{ord}(2) = 2$, $\operatorname{ord}(1) = \operatorname{ord}(3) = 4$.
  3. Since $\mathbb{Z}_4$ has two elements of order $4$ and $\mathbb{Z}_2 \times \mathbb{Z}_2$ has zero, $\mathbb{Z}_4 \not\cong \mathbb{Z}_2 \times \mathbb{Z}_2$.
- **Final Result (Guided Input):** `2` (maximum element order in $\mathbb{Z}_2 \times \mathbb{Z}_2$).
- **Short Oral Viva Explanation:**
  > *"In $\mathbb{Z}_2 \times \mathbb{Z}_2$, every coordinate has order $1$ or $2$, so $\operatorname{lcm}(\operatorname{ord}(a), \operatorname{ord}(b))$ can never exceed $2$. Therefore it has no element of order $4$ and is not isomorphic to $\mathbb{Z}_4$."*

---

## Question 6: Find an Order-$6$ Element in $S_5$ and Determine Its Parity

- **Given:** Symmetric group $S_5$ ($n = 5$); find $\sigma \in S_5$ with $\operatorname{ord}(\sigma) = 6$.
- **Relevant Concept:** Cycle decomposition, $\operatorname{lcm}$ order formula, and parity $\operatorname{sgn}(\sigma) = (-1)^{n-c}$.
- **Formulas:**
  $$\operatorname{ord}(\sigma) = \operatorname{lcm}(l_1, l_2, \ldots, l_k), \qquad \operatorname{sgn}(\sigma) = (-1)^{n - c}$$
- **Step-by-Step Solution:**
  1. Cycle lengths must partition $5$ (with $1$-cycles for fixed points) and satisfy $\operatorname{lcm}(l_1, \ldots, l_k) = 6$.
  2. A $6$-cycle needs $6 > 5$ symbols, so the **only** possible partition of $5$ with $\operatorname{lcm} = 6$ is $3 + 2 = 5$: one $3$-cycle and one disjoint $2$-cycle!
  3. Choose any concrete example, such as $\sigma = (1\;2\;3)(4\;5)$ (one-line `[2, 3, 1, 5, 4]`):
     - Cycle lengths: $[3, 2]$, total cycles $c = 2$ (no fixed points).
     - Order: $\operatorname{ord}(\sigma) = \operatorname{lcm}(3, 2) = 6$.
     - Transposition decomposition: $(1\;3)(1\;2)(4\;5)$ ($3$ transpositions).
     - Sign: $\operatorname{sgn}(\sigma) = (-1)^{5 - 2} = (-1)^3 = -1$, so $\sigma$ is **odd**.
  4. Moreover, **every** order-$6$ element in $S_5$ has cycle type $(3, 2)$, so **every** order-$6$ element in $S_5$ is odd (meaning $A_5$ contains no element of order $6$!).
- **Final Result (Guided Input):** `(1 2 3)(4 5)` (or `2 3 1 5 4`, or any disjoint $3$-cycle and $2$-cycle in $S_5$).
- **Short Oral Viva Explanation:**
  > *"Since we only have $5$ symbols, we cannot form a $6$-cycle; instead we combine a disjoint $3$-cycle and $2$-cycle like $\sigma = (1\;2\;3)(4\;5)$. Its order is $\operatorname{lcm}(3, 2) = 6$, and its sign is $(-1)^{5-2} = -1$, so every order-$6$ element in $S_5$ is odd."*
