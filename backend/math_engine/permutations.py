"""Permutation group S_n and Alternating group A_n mathematical engine."""

from __future__ import annotations
import itertools
import math
import re
from typing import Any

from backend.validation.validators import ValidationError, parse_positive_int

MAX_SINGLE_PERM_N = 20
MAX_FULL_SN_N = 5


def parse_permutation_input(raw_input: Any, expected_n: int | None = None) -> tuple[list[int], str]:
    """
    Parse a permutation from either:
    - one-line array/string: [2, 3, 1] or "2 3 1" or "2,3,1"
    - cycle notation: "(1 2 3)(4 5)", "(1,2)(3,4)", "()", "e", "id"
    Returns (one_line_list_1_indexed, input_mode).
    """
    if expected_n is not None:
        expected_n = parse_positive_int(expected_n, "Degree n", min_val=1, max_val=MAX_SINGLE_PERM_N)

    if isinstance(raw_input, list):
        if len(raw_input) == 0:
            raise ValidationError("Permutation cannot be empty.", "permutation")
        arr = [parse_positive_int(x, "Permutation entry", min_val=1, max_val=MAX_SINGLE_PERM_N) for x in raw_input]
        n = expected_n if expected_n is not None else len(arr)
        _validate_one_line(arr, n)
        return arr, "one-line"

    if not isinstance(raw_input, str) or raw_input.strip() == "":
        raise ValidationError("Permutation input cannot be empty.", "permutation")

    text = raw_input.strip()

    # Identity shortcuts
    if text in ("()", "e", "id", "identity"):
        n = expected_n if expected_n is not None else 1
        return list(range(1, n + 1)), "cycle"

    # Cycle notation check
    if "(" in text or ")" in text:
        # Validate balanced parentheses and no stray non-cycle tokens
        cycles_raw = re.findall(r"\(([^()]*)\)", text)
        stripped_without_cycles = re.sub(r"\([^()]*\)", "", text).strip()
        if not cycles_raw or stripped_without_cycles != "":
            raise ValidationError(
                "Invalid cycle notation. Use format like (1 2 3)(4 5) or (1,2)(3,4).",
                "permutation",
            )
        parsed_cycles: list[list[int]] = []
        max_elem = 0
        for cyc_str in cycles_raw:
            tokens = [t for t in re.split(r"[\s,]+", cyc_str.strip()) if t]
            if not tokens:
                continue
            cyc = [parse_positive_int(t, "Cycle element", min_val=1, max_val=MAX_SINGLE_PERM_N) for t in tokens]
            if len(set(cyc)) != len(cyc):
                raise ValidationError(
                    f"Cycle ({' '.join(str(x) for x in cyc)}) contains duplicate elements.",
                    "permutation",
                )
            max_elem = max(max_elem, max(cyc))
            parsed_cycles.append(cyc)

        n = expected_n if expected_n is not None else max(max_elem, 1)
        if max_elem > n:
            raise ValidationError(
                f"Cycle contains element {max_elem}, which exceeds degree n = {n}.",
                "permutation",
            )

        # Compose cycles right-to-left: (f o g)(x) = f(g(x))
        mapping = list(range(1, n + 1))
        for cyc in reversed(parsed_cycles):
            if len(cyc) <= 1:
                continue
            cyc_map = {cyc[i]: cyc[(i + 1) % len(cyc)] for i in range(len(cyc))}
            mapping = [cyc_map.get(val, val) for val in mapping]

        _validate_one_line(mapping, n)
        return mapping, "cycle"

    # One-line notation: strip optional brackets
    cleaned = text
    if cleaned.startswith("[") and cleaned.endswith("]"):
        cleaned = cleaned[1:-1].strip()
    tokens = [t for t in re.split(r"[\s,]+", cleaned) if t]
    if not tokens:
        raise ValidationError("Permutation input cannot be empty.", "permutation")

    arr = [parse_positive_int(t, "Permutation entry", min_val=1, max_val=MAX_SINGLE_PERM_N) for t in tokens]
    n = expected_n if expected_n is not None else len(arr)
    _validate_one_line(arr, n)
    return arr, "one-line"


def _validate_one_line(arr: list[int], n: int) -> None:
    if len(arr) != n:
        raise ValidationError(
            f"Permutation must have exactly {n} entries for S_{n} (got {len(arr)}).",
            "permutation",
        )
    seen = set()
    duplicates = set()
    for val in arr:
        if val < 1 or val > n:
            raise ValidationError(
                f"Entry {val} is out of range; S_{n} requires integers 1 through {n}.",
                "permutation",
            )
        if val in seen:
            duplicates.add(val)
        seen.add(val)
    if duplicates:
        raise ValidationError(
            f"Duplicate entry/entries {sorted(duplicates)}; every element 1..{n} must appear exactly once.",
            "permutation",
        )
    if len(seen) != n:
        missing = sorted(set(range(1, n + 1)) - seen)
        raise ValidationError(
            f"Missing element(s) {missing}; every element 1..{n} must appear exactly once.",
            "permutation",
        )


def compute_disjoint_cycles(one_line: list[int]) -> tuple[list[list[int]], list[list[int]]]:
    """Return (non_trivial_cycles, all_cycles_including_fixed_points)."""
    n = len(one_line)
    visited = [False] * n
    all_cycles: list[list[int]] = []
    non_trivial: list[list[int]] = []

    for start in range(1, n + 1):
        if visited[start - 1]:
            continue
        cycle: list[int] = []
        curr = start
        while not visited[curr - 1]:
            visited[curr - 1] = True
            cycle.append(curr)
            curr = one_line[curr - 1]
        all_cycles.append(cycle)
        if len(cycle) > 1:
            non_trivial.append(cycle)

    return non_trivial, all_cycles


def format_cycles(non_trivial: list[list[int]]) -> str:
    if not non_trivial:
        return "e"
    return "".join("(" + " ".join(str(x) for x in c) + ")" for c in non_trivial)


def format_all_cycles(all_cycles: list[list[int]]) -> str:
    return "".join("(" + " ".join(str(x) for x in c) + ")" for c in all_cycles)


def decompose_to_transpositions(non_trivial: list[list[int]]) -> list[tuple[int, int]]:
    transpositions: list[tuple[int, int]] = []
    for cyc in non_trivial:
        # (a_1 a_2 ... a_k) = (a_1 a_k)(a_1 a_{k-1})...(a_1 a_2)
        for i in range(len(cyc) - 1, 0, -1):
            transpositions.append((cyc[0], cyc[i]))
    return transpositions


def analyze_permutation(raw_input: Any, expected_n: int | None = None) -> dict[str, Any]:
    one_line, input_mode = parse_permutation_input(raw_input, expected_n)
    n = len(one_line)
    non_trivial, all_cycles = compute_disjoint_cycles(one_line)
    cycle_lengths = [len(c) for c in all_cycles]
    non_trivial_lengths = [len(c) for c in non_trivial]

    order = 1
    for length in cycle_lengths:
        order = math.lcm(order, length)

    num_cycles = len(all_cycles)
    transposition_count = n - num_cycles
    sign = 1 if transposition_count % 2 == 0 else -1
    parity = "even" if sign == 1 else "odd"

    transpositions = decompose_to_transpositions(non_trivial)
    transpositions_str = (
        "".join(f"({a} {b})" for a, b in transpositions) if transpositions else "e (0 transpositions)"
    )

    cycle_str = format_cycles(non_trivial)
    full_cycle_str = format_all_cycles(all_cycles)
    one_line_str = "[" + ", ".join(str(x) for x in one_line) + "]"

    # Inverse permutation
    inv = [0] * n
    for i, target in enumerate(one_line, start=1):
        inv[target - 1] = i
    inv_non_trivial, _ = compute_disjoint_cycles(inv)

    return {
        "n": n,
        "input_mode": input_mode,
        "one_line": one_line,
        "one_line_notation": one_line_str,
        "two_line": {
            "top": list(range(1, n + 1)),
            "bottom": one_line,
        },
        "disjoint_cycles": non_trivial,
        "all_cycles": all_cycles,
        "cycle_notation": cycle_str,
        "full_cycle_notation": full_cycle_str,
        "cycle_lengths": cycle_lengths,
        "non_trivial_cycle_lengths": non_trivial_lengths,
        "cycle_count_c": num_cycles,
        "order": order,
        "sign": sign,
        "parity": parity,
        "is_even": sign == 1,
        "transposition_count": transposition_count,
        "transpositions_str": transpositions_str,
        "inverse_one_line": inv,
        "inverse_cycle_notation": format_cycles(inv_non_trivial),
        "explanation": {
            "summary": (
                f"In S_{n}, {cycle_str} has order {order} and sign {'+1' if sign == 1 else '-1'} ({parity})."
            ),
            "formula": "ord(σ) = lcm(cycle lengths); sign(σ) = (-1)^(n - c) where c is total cycles including fixed points",
            "reasoning": [
                f"Full cycle decomposition (with fixed points): {full_cycle_str}, so c = {num_cycles} cycles.",
                f"Cycle lengths: {cycle_lengths}, giving ord(σ) = lcm({', '.join(str(x) for x in cycle_lengths)}) = {order}.",
                f"Minimal transposition count: n - c = {n} - {num_cycles} = {transposition_count}.",
                f"Transposition product: {transpositions_str}.",
                f"sign(σ) = (-1)^({n} - {num_cycles}) = (-1)^{transposition_count} = {'+1' if sign == 1 else '-1'}, so σ is {parity}.",
            ],
        },
    }


def compose_one_line(f: list[int], g: list[int]) -> list[int]:
    """Compute f o g where (f o g)(i) = f(g(i))."""
    return [f[g[i] - 1] for i in range(len(f))]


def explore_symmetric_group(raw_n: Any) -> dict[str, Any]:
    n = parse_positive_int(raw_n, "Symmetric group degree n", min_val=1, max_val=MAX_FULL_SN_N)

    all_perms: list[dict[str, Any]] = []
    even_perms: list[dict[str, Any]] = []
    odd_perms: list[dict[str, Any]] = []
    order_dist: dict[int, int] = {}

    for tup in itertools.permutations(range(1, n + 1)):
        arr = list(tup)
        non_trivial, all_cycles = compute_disjoint_cycles(arr)
        lengths = [len(c) for c in all_cycles]
        order = 1
        for length in lengths:
            order = math.lcm(order, length)
        c = len(all_cycles)
        sign = 1 if (n - c) % 2 == 0 else -1
        parity = "even" if sign == 1 else "odd"

        order_dist[order] = order_dist.get(order, 0) + 1

        entry = {
            "one_line": arr,
            "one_line_notation": "[" + ", ".join(str(x) for x in arr) + "]",
            "cycle_notation": format_cycles(non_trivial),
            "full_cycle_notation": format_all_cycles(all_cycles),
            "cycle_lengths": lengths,
            "order": order,
            "sign": sign,
            "parity": parity,
            "is_even": sign == 1,
        }
        all_perms.append(entry)
        if sign == 1:
            even_perms.append(entry)
        else:
            odd_perms.append(entry)

    total_order = math.factorial(n)
    expected_an = total_order // 2 if n >= 2 else 1
    an_verified = len(even_perms) == expected_an

    return {
        "n": n,
        "group_name": f"S_{n}",
        "alternating_name": f"A_{n}",
        "total_order": total_order,
        "even_count": len(even_perms),
        "odd_count": len(odd_perms),
        "expected_an_order": expected_an,
        "an_verified": an_verified,
        "permutations": all_perms,
        "even_permutations": even_perms,
        "odd_permutations": odd_perms,
        "order_distribution": [{"order": k, "count": order_dist[k]} for k in sorted(order_dist)],
        "explanation": {
            "summary": (
                f"S_{n} has {n}! = {total_order} permutations: {len(even_perms)} even (forming A_{n}) and {len(odd_perms)} odd."
            ),
            "formula": "|S_n| = n!; |A_n| = n! / 2 for n ≥ 2",
            "reasoning": [
                f"Total permutations in S_{n}: {n}! = {total_order}.",
                f"Even permutations (sign = +1): {len(even_perms)} (verified |A_{n}| = {expected_an}).",
                f"Odd permutations (sign = -1): {len(odd_perms)}.",
            ],
        },
        "limits": {
            "max_full_enumeration_n": MAX_FULL_SN_N,
            "max_single_analysis_n": MAX_SINGLE_PERM_N,
        },
    }
