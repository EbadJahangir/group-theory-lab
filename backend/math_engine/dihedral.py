"""Dihedral group D_n (symmetries of a regular n-gon) mathematical engine."""

from __future__ import annotations
import math
from typing import Any

from backend.validation.validators import parse_positive_int

MAX_DIHEDRAL_N = 24
MAX_DIHEDRAL_CAYLEY_N = 12


def format_dihedral_element(is_reflection: bool, k: int, n: int) -> str:
    k_mod = k % n
    if not is_reflection:
        if k_mod == 0:
            return "e"
        if k_mod == 1:
            return "r"
        return f"r^{k_mod}"
    if k_mod == 0:
        return "s"
    if k_mod == 1:
        return "rs"
    return f"r^{k_mod}s"


def multiply_dihedral(a: tuple[bool, int], b: tuple[bool, int], n: int) -> tuple[bool, int]:
    """
    Multiply two dihedral elements (is_refl, k) representing r^k or r^k s.
    Rules:
      r^a * r^b       = r^(a + b)
      r^a * (r^b s)   = r^(a + b) s
      (r^a s) * r^b   = r^(a - b) s
      (r^a s) * (r^b s) = r^(a - b)
    """
    refl_a, ka = a
    refl_b, kb = b
    if not refl_a and not refl_b:
        return (False, (ka + kb) % n)
    if not refl_a and refl_b:
        return (True, (ka + kb) % n)
    if refl_a and not refl_b:
        return (True, (ka - kb) % n)
    return (False, (ka - kb) % n)


def inverse_dihedral(elem: tuple[bool, int], n: int) -> tuple[bool, int]:
    is_refl, k = elem
    if not is_refl:
        return (False, (-k) % n)
    return (True, k % n)


def vertex_mapping(elem: tuple[bool, int], n: int) -> list[int]:
    """Return 1-indexed image of vertices 1..n under elem."""
    is_refl, k = elem
    mapping = []
    for v in range(n):
        if not is_refl:
            img = (v + k) % n
        else:
            img = (k - v) % n
        mapping.append(img + 1)
    return mapping


def analyze_dihedral_group(raw_n: Any, include_cayley: bool = False) -> dict[str, Any]:
    n = parse_positive_int(raw_n, "Polygon sides n", min_val=3, max_val=MAX_DIHEDRAL_N)
    total_order = 2 * n

    raw_elements: list[tuple[bool, int]] = [(False, k) for k in range(n)] + [(True, k) for k in range(n)]
    elements: list[dict[str, Any]] = []
    order_distribution: dict[int, int] = {}

    for is_refl, k in raw_elements:
        label = format_dihedral_element(is_refl, k, n)
        inv_pair = inverse_dihedral((is_refl, k), n)
        inv_label = format_dihedral_element(inv_pair[0], inv_pair[1], n)
        if not is_refl:
            order = 1 if k == 0 else n // math.gcd(n, k)
            classification = "identity" if k == 0 else "rotation"
            order_formula = (
                "ord(e) = 1"
                if k == 0
                else f"ord(r^{k}) = {n} / gcd({n}, {k}) = {n} / {math.gcd(n, k)} = {order}"
            )
            angle_deg = round((360.0 * k) / n, 2)
        else:
            order = 2
            classification = "reflection"
            order_formula = f"ord({label}) = 2 (every reflection is an involution: ({label})^2 = e)"
            angle_deg = round((180.0 * k) / n, 2)

        order_distribution[order] = order_distribution.get(order, 0) + 1

        elements.append(
            {
                "label": label,
                "is_reflection": is_refl,
                "k": k,
                "classification": classification,
                "order": order,
                "inverse": inv_label,
                "angle_deg": angle_deg,
                "vertex_permutation": vertex_mapping((is_refl, k), n),
                "order_explanation": order_formula,
            }
        )

    # Compute centre Z(D_n) directly by checking commutativity with all elements
    centre: list[str] = []
    for a in raw_elements:
        if all(multiply_dihedral(a, b, n) == multiply_dihedral(b, a, n) for b in raw_elements):
            centre.append(format_dihedral_element(a[0], a[1], n))

    expected_centre = ["e", format_dihedral_element(False, n // 2, n)] if n % 2 == 0 else ["e"]
    centre_verified = centre == expected_centre

    cayley_table = None
    cayley_note = None
    if include_cayley:
        if n <= MAX_DIHEDRAL_CAYLEY_N:
            labels = [e["label"] for e in elements]
            matrix = []
            for a in raw_elements:
                row = []
                for b in raw_elements:
                    prod = multiply_dihedral(a, b, n)
                    row.append(format_dihedral_element(prod[0], prod[1], n))
                matrix.append(row)
            cayley_table = {"labels": labels, "matrix": matrix}
        else:
            cayley_note = (
                f"Cayley table generation for D_{n} (order {total_order}) is omitted because "
                f"table display is capped at n ≤ {MAX_DIHEDRAL_CAYLEY_N} (order ≤ {2 * MAX_DIHEDRAL_CAYLEY_N})."
            )

    return {
        "n": n,
        "group_name": f"D_{n}",
        "order": total_order,
        "rotation_count": n,
        "reflection_count": n,
        "elements": elements,
        "centre": centre,
        "centre_verified": centre_verified,
        "is_abelian": False,
        "order_distribution": [{"order": k, "count": order_distribution[k]} for k in sorted(order_distribution)],
        "cayley_table": cayley_table,
        "cayley_note": cayley_note,
        "explanation": {
            "summary": (
                f"D_{n} has order 2({n}) = {total_order} ({n} rotations and {n} reflections). "
                f"Its centre is Z(D_{n}) = {{{', '.join(centre)}}}."
            ),
            "formula": "ord(r^k) = n / gcd(n, k); ord(r^k s) = 2; Z(D_n) = {e, r^(n/2)} for even n, {e} for odd n",
            "reasoning": [
                f"Rotations r^k (k = 0..{n-1}) form a cyclic subgroup of order {n}.",
                f"All {n} reflections r^k s satisfy (r^k s)^2 = e and have order 2.",
                f"Since {n} is {'even' if n % 2 == 0 else 'odd'}, Z(D_{n}) = {{{', '.join(centre)}}}.",
                f"D_{n} is non-Abelian because s·r = r^(-1)·s ≠ r·s for n ≥ 3.",
            ],
        },
        "limits": {
            "max_n": MAX_DIHEDRAL_N,
            "max_cayley_n": MAX_DIHEDRAL_CAYLEY_N,
        },
    }
