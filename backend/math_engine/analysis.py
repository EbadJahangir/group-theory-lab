"""Element order distribution analysis and group comparison engine."""

from __future__ import annotations
from typing import Any

from backend.math_engine.abelian import analyze_abelian_group
from backend.math_engine.dihedral import analyze_dihedral_group
from backend.math_engine.permutations import explore_symmetric_group
from backend.validation.validators import ValidationError


def analyze_group_orders(spec: dict[str, Any]) -> dict[str, Any]:
    group_type = str(spec.get("group_type", "abelian")).strip().lower()

    if group_type == "abelian":
        res = analyze_abelian_group(spec.get("moduli", [4]))
        elements = [
            {"label": e["label"], "order": e["order"], "detail": e["order_explanation"]}
            for e in res["elements"]
        ]
        return {
            "group_name": res["group_name"],
            "group_type": "abelian",
            "order": res["order"],
            "is_cyclic": res["is_cyclic"],
            "is_abelian": True,
            "max_element_order": res["max_element_order"],
            "elements": elements,
            "order_distribution": res["order_distribution"],
        }

    if group_type == "dihedral":
        res = analyze_dihedral_group(spec.get("n", 4), include_cayley=False)
        elements = [
            {"label": e["label"], "order": e["order"], "detail": e["order_explanation"]}
            for e in res["elements"]
        ]
        max_ord = max(e["order"] for e in elements)
        return {
            "group_name": res["group_name"],
            "group_type": "dihedral",
            "order": res["order"],
            "is_cyclic": False,
            "is_abelian": False,
            "max_element_order": max_ord,
            "elements": elements,
            "order_distribution": res["order_distribution"],
        }

    if group_type == "permutation":
        res = explore_symmetric_group(spec.get("n", 3))
        elements = [
            {
                "label": e["cycle_notation"],
                "order": e["order"],
                "detail": f"Cycle lengths {e['cycle_lengths']} -> lcm = {e['order']} ({e['parity']})",
            }
            for e in res["permutations"]
        ]
        max_ord = max(e["order"] for e in elements)
        return {
            "group_name": res["group_name"],
            "group_type": "permutation",
            "order": res["total_order"],
            "is_cyclic": res["n"] <= 2,
            "is_abelian": res["n"] <= 2,
            "max_element_order": max_ord,
            "elements": elements,
            "order_distribution": res["order_distribution"],
        }

    raise ValidationError(f"Unsupported group_type '{group_type}' for order analysis.", "group_type")


def compare_groups(spec_a: dict[str, Any], spec_b: dict[str, Any]) -> dict[str, Any]:
    a = analyze_group_orders(spec_a)
    b = analyze_group_orders(spec_b)

    dist_a = {d["order"]: d["count"] for d in a["order_distribution"]}
    dist_b = {d["order"]: d["count"] for d in b["order_distribution"]}
    all_orders = sorted(set(dist_a.keys()) | set(dist_b.keys()))

    comparison_rows = [
        {
            "order": ord_val,
            "count_a": dist_a.get(ord_val, 0),
            "count_b": dist_b.get(ord_val, 0),
        }
        for ord_val in all_orders
    ]

    same_order = a["order"] == b["order"]
    same_distribution = dist_a == dist_b
    highlights: list[str] = []

    if same_order:
        highlights.append(f"Both {a['group_name']} and {b['group_name']} have group order {a['order']}.")
    else:
        highlights.append(
            f"Different group orders: |{a['group_name']}| = {a['order']} vs |{b['group_name']}| = {b['order']}."
        )

    if a["is_cyclic"] != b["is_cyclic"]:
        cyclic_g = a["group_name"] if a["is_cyclic"] else b["group_name"]
        non_cyclic_g = b["group_name"] if a["is_cyclic"] else a["group_name"]
        highlights.append(
            f"{cyclic_g} is cyclic (has an element of order {a['order'] if a['is_cyclic'] else b['order']}), "
            f"whereas {non_cyclic_g} is non-cyclic (maximum element order {b['max_element_order'] if a['is_cyclic'] else a['max_element_order']})."
        )
    elif same_order and same_distribution and a["is_abelian"] and b["is_abelian"]:
        highlights.append(
            f"{a['group_name']} and {b['group_name']} have identical order distributions and are both cyclic/isomorphic."
        )

    if not same_distribution:
        diff_orders = [str(r["order"]) for r in comparison_rows if r["count_a"] != r["count_b"]]
        highlights.append(
            f"Their element order counts differ at order(s): {', '.join(diff_orders)}, proving they are NOT isomorphic."
        )

    return {
        "group_a": a,
        "group_b": b,
        "comparison_table": comparison_rows,
        "same_group_order": same_order,
        "same_order_distribution": same_distribution,
        "highlights": highlights,
    }
