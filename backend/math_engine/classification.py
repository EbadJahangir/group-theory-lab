"""Classification of finite Abelian groups of order n via Fundamental Theorem."""

from __future__ import annotations
import itertools
import math
from typing import Any

from backend.validation.validators import parse_positive_int

MAX_CLASSIFICATION_N = 100000


def prime_factorization(n: int) -> list[tuple[int, int]]:
    factors: list[tuple[int, int]] = []
    if n <= 1:
        return factors
    d = 2
    temp = n
    while d * d <= temp:
        if temp % d == 0:
            exp = 0
            while temp % d == 0:
                temp //= d
                exp += 1
            factors.append((d, exp))
        d += 1 if d == 2 else 2
    if temp > 1:
        factors.append((temp, 1))
    return factors


def integer_partitions(n: int, max_part: int | None = None) -> list[list[int]]:
    """Return all integer partitions of n sorted in descending part order."""
    if n == 0:
        return [[]]
    if max_part is None or max_part > n:
        max_part = n
    result: list[list[int]] = []
    for first in range(max_part, 0, -1):
        for rest in integer_partitions(n - first, first):
            result.append([first] + rest)
    return result


def classify_abelian_groups(raw_n: Any) -> dict[str, Any]:
    n = parse_positive_int(raw_n, "Group order n", min_val=1, max_val=MAX_CLASSIFICATION_N)

    if n == 1:
        return {
            "n": 1,
            "prime_factorization": [],
            "factorization_str": "1",
            "partition_counts": [],
            "total_groups": 1,
            "formula_str": "1 (trivial group)",
            "groups": [
                {
                    "index": 1,
                    "elementary_divisors": [1],
                    "elementary_notation": "Z_1",
                    "invariant_factors": [1],
                    "invariant_notation": "Z_1",
                    "verified_order": 1,
                    "divisibility_verified": True,
                    "is_cyclic": True,
                    "max_element_order": 1,
                }
            ],
            "all_orders_verified": True,
            "explanation": {
                "summary": "There is exactly 1 group of order 1: the trivial group Z_1.",
                "formula": "Number of non-isomorphic Abelian groups of order p_1^a_1 ... p_k^a_k is ∏ p(a_i)",
                "reasoning": ["Order 1 has empty prime factorization, yielding only the trivial group Z_1."],
            },
        }

    factors = prime_factorization(n)
    factorization_str = " × ".join(f"{p}^{a}" if a > 1 else str(p) for p, a in factors)

    per_prime_partitions: list[tuple[int, int, list[list[int]]]] = []
    total_expected = 1
    partition_counts = []
    for p, a in factors:
        parts = integer_partitions(a)
        total_expected *= len(parts)
        per_prime_partitions.append((p, a, parts))
        partition_counts.append({"prime": p, "exponent": a, "partitions": parts, "p_a": len(parts)})

    if total_expected > 500:
        raise ValueError(
            f"Order {n} yields {total_expected} non-isomorphic Abelian groups, exceeding the display limit of 500."
        )

    groups: list[dict[str, Any]] = []
    for idx, combo in enumerate(itertools.product(*(item[2] for item in per_prime_partitions)), start=1):
        # combo is a tuple of partitions, one per prime (each partition is descending, e.g. [2, 1])
        elementary_divisors: list[int] = []
        max_len = max(len(part) for part in combo)

        # Collect elementary divisors (sorted by prime then ascending exponent)
        aligned_asc: list[list[int]] = []
        for (p, _a, _), part in zip(per_prime_partitions, combo):
            asc = list(reversed(part))  # smallest to largest exponent
            for e in asc:
                elementary_divisors.append(p ** e)
            padded = [0] * (max_len - len(asc)) + asc
            aligned_asc.append(padded)

        # Build invariant factors d_1 | d_2 | ... | d_m
        invariant_factors: list[int] = []
        for col in range(max_len):
            factor = 1
            for row_idx, (p, _a, _) in enumerate(per_prime_partitions):
                exp = aligned_asc[row_idx][col]
                if exp > 0:
                    factor *= p ** exp
            invariant_factors.append(factor)

        verified_order = 1
        for f in invariant_factors:
            verified_order *= f

        elem_order_prod = 1
        for ed in elementary_divisors:
            elem_order_prod *= ed

        divisibility_ok = all(
            invariant_factors[i + 1] % invariant_factors[i] == 0
            for i in range(len(invariant_factors) - 1)
        )

        is_cyclic = len(invariant_factors) == 1
        max_element_order = invariant_factors[-1]

        groups.append(
            {
                "index": idx,
                "elementary_divisors": elementary_divisors,
                "elementary_notation": " × ".join(f"Z_{d}" for d in elementary_divisors),
                "invariant_factors": invariant_factors,
                "invariant_notation": " × ".join(f"Z_{d}" for d in invariant_factors),
                "verified_order": verified_order,
                "elementary_order_verified": elem_order_prod == n,
                "divisibility_verified": divisibility_ok,
                "is_cyclic": is_cyclic,
                "max_element_order": max_element_order,
            }
        )

    formula_parts = [f"p({item['exponent']})={item['p_a']}" for item in partition_counts]
    formula_str = " × ".join(formula_parts) + f" = {total_expected}"

    all_verified = (
        len(groups) == total_expected
        and all(g["verified_order"] == n and g["divisibility_verified"] for g in groups)
    )

    return {
        "n": n,
        "prime_factorization": [{"prime": p, "exponent": a} for p, a in factors],
        "factorization_str": factorization_str,
        "partition_counts": partition_counts,
        "total_groups": len(groups),
        "formula_str": formula_str,
        "groups": groups,
        "all_orders_verified": all_verified,
        "explanation": {
            "summary": (
                f"Since {n} = {factorization_str}, there are {formula_str} non-isomorphic "
                f"finite Abelian groups of order {n}."
            ),
            "formula": "Number of groups = ∏ p(a_i), where p(a) is the integer partition function",
            "reasoning": [
                f"Prime factorization: {n} = {factorization_str}.",
                *[
                    f"For prime p = {pc['prime']} with exponent {pc['exponent']}: partitions are "
                    + ", ".join("[" + "+".join(str(x) for x in pt) + "]" for pt in pc["partitions"])
                    + f" (count p({pc['exponent']}) = {pc['p_a']})."
                    for pc in partition_counts
                ],
                f"Total non-isomorphic Abelian groups: {formula_str}.",
                "Invariant factors d_1 | d_2 | ... | d_m are constructed by multiplying aligned prime-power factors from smallest to largest.",
            ],
        },
    }
