"""Finite Abelian groups (cyclic Z_n and direct products Z_n1 x ... x Z_nk)."""

from __future__ import annotations
import itertools
import math
from typing import Any

from backend.validation.validators import parse_moduli_list

MAX_ABELIAN_ORDER = 256


def format_group_notation(moduli: list[int]) -> str:
    return " × ".join(f"Z_{m}" for m in moduli)


def format_element(elem: tuple[int, ...], is_single: bool) -> str:
    if is_single:
        return str(elem[0])
    return "(" + ", ".join(str(x) for x in elem) + ")"


def element_order_zn(a: int, n: int) -> int:
    if n == 1:
        return 1
    a_mod = a % n
    return n // math.gcd(n, a_mod)


def analyze_abelian_group(raw_moduli: list[int]) -> dict[str, Any]:
    moduli = parse_moduli_list(raw_moduli, max_components=6, max_total_order=MAX_ABELIAN_ORDER)
    is_single = len(moduli) == 1
    total_order = 1
    for m in moduli:
        total_order *= m

    identity_tuple = tuple(0 for _ in moduli)
    identity_label = format_element(identity_tuple, is_single)

    ranges = [range(m) for m in moduli]
    elements_data: list[dict[str, Any]] = []
    order_distribution: dict[int, int] = {}
    generators: list[str] = []
    max_order = 1

    for elem in itertools.product(*ranges):
        coord_orders = [element_order_zn(a, m) for a, m in zip(elem, moduli)]
        elem_order = 1
        for o in coord_orders:
            elem_order = math.lcm(elem_order, o)

        inv_tuple = tuple((m - a) % m for a, m in zip(elem, moduli))
        label = format_element(elem, is_single)
        inv_label = format_element(inv_tuple, is_single)

        if elem_order > max_order:
            max_order = elem_order

        order_distribution[elem_order] = order_distribution.get(elem_order, 0) + 1

        if elem_order == total_order:
            generators.append(label)

        # Build step-by-step order reasoning for this element
        if is_single:
            n_val = moduli[0]
            a_val = elem[0]
            g_val = math.gcd(n_val, a_val)
            order_steps = (
                f"ord({a_val}) = {n_val} / gcd({n_val}, {a_val}) = {n_val} / {g_val} = {elem_order}"
            )
        else:
            parts = [
                f"ord_{m}({a})={o}" for a, m, o in zip(elem, moduli, coord_orders)
            ]
            order_steps = (
                "Coordinate orders: "
                + ", ".join(parts)
                + f"; ord({label}) = lcm({', '.join(str(o) for o in coord_orders)}) = {elem_order}"
            )

        elements_data.append(
            {
                "tuple": list(elem),
                "label": label,
                "inverse": inv_label,
                "inverse_tuple": list(inv_tuple),
                "order": elem_order,
                "coordinate_orders": coord_orders,
                "is_identity": elem == identity_tuple,
                "is_generator": elem_order == total_order,
                "order_explanation": order_steps,
            }
        )

    is_cyclic = max_order == total_order

    # Pairwise coprimality check explanation
    non_trivial = [m for m in moduli if m > 1]
    if len(non_trivial) <= 1:
        cyclicity_reason = f"{format_group_notation(moduli)} is cyclic because it has at most one non-trivial cyclic factor."
    else:
        non_coprime_pairs = []
        for i in range(len(non_trivial)):
            for j in range(i + 1, len(non_trivial)):
                g = math.gcd(non_trivial[i], non_trivial[j])
                if g > 1:
                    non_coprime_pairs.append((non_trivial[i], non_trivial[j], g))
        if not non_coprime_pairs:
            cyclicity_reason = (
                f"{format_group_notation(moduli)} is cyclic because its moduli are pairwise coprime, "
                f"so it is isomorphic to Z_{total_order} with {len(generators)} generator(s)."
            )
        else:
            p_str = ", ".join(f"gcd({a}, {b}) = {g} > 1" for a, b, g in non_coprime_pairs)
            cyclicity_reason = (
                f"{format_group_notation(moduli)} is NOT cyclic because {p_str}; "
                f"the maximum element order is {max_order} < {total_order}."
            )

    sorted_dist = [
        {"order": k, "count": order_distribution[k]}
        for k in sorted(order_distribution.keys())
    ]

    return {
        "group_name": format_group_notation(moduli),
        "moduli": moduli,
        "is_single_cyclic": is_single,
        "order": total_order,
        "identity": identity_label,
        "max_element_order": max_order,
        "is_cyclic": is_cyclic,
        "generators": generators if is_cyclic else [],
        "generator_count": len(generators) if is_cyclic else 0,
        "elements": elements_data,
        "order_distribution": sorted_dist,
        "explanation": {
            "summary": cyclicity_reason,
            "formula": "ord(a) = n / gcd(n, a) in Z_n; ord(a_1, ..., a_k) = lcm(ord(a_1), ..., ord(a_k))",
            "reasoning": [
                f"Group order |G| = {' × '.join(str(m) for m in moduli)} = {total_order}.",
                f"Identity element is {identity_label} with order 1.",
                f"Maximum element order is lcm({', '.join(str(m) for m in moduli)}) = {max_order}.",
                cyclicity_reason,
            ],
        },
        "limits": {
            "max_order": MAX_ABELIAN_ORDER,
            "max_components": 6,
        },
    }
