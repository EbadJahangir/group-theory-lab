"""Cayley table generator and algebraic axiom verification engine."""

from __future__ import annotations
import itertools
import math
from typing import Any

from backend.math_engine.abelian import format_element, format_group_notation
from backend.math_engine.dihedral import format_dihedral_element, multiply_dihedral
from backend.math_engine.permutations import (
    compose_one_line,
    compute_disjoint_cycles,
    format_cycles,
)
from backend.validation.validators import ValidationError, parse_moduli_list, parse_positive_int

MAX_CAYLEY_ORDER = 24


def verify_cayley_table(labels: list[str], matrix: list[list[str]]) -> dict[str, Any]:
    """
    Verify group axioms directly from the Cayley table:
    - Closure
    - Identity
    - Inverses
    - Associativity
    - Commutativity
    """
    n = len(labels)
    label_to_idx = {lbl: idx for idx, lbl in enumerate(labels)}

    # 1. Closure
    closure_ok = True
    closure_detail = "Every product a * b belongs to the set S."
    for r in range(n):
        if len(matrix[r]) != n:
            raise ValidationError("Cayley table must be a square n × n matrix.", "matrix")
        for c in range(n):
            val = matrix[r][c]
            if val not in label_to_idx:
                closure_ok = False
                closure_detail = f"Closure fails: {labels[r]} * {labels[c]} = {val}, which is not in S."
                break
        if not closure_ok:
            break

    # 2. Identity (only meaningful if closure holds, though we check row/col matching)
    identity_idx: int | None = None
    identity_candidates: list[str] = []
    for e in range(n):
        is_left = all(matrix[e][x] == labels[x] for x in range(n))
        is_right = all(matrix[x][e] == labels[x] for x in range(n))
        if is_left and is_right:
            identity_idx = e
            identity_candidates.append(labels[e])

    identity_ok = len(identity_candidates) == 1
    if identity_ok:
        identity_label = identity_candidates[0]
        identity_detail = f"Unique two-sided identity is {identity_label}."
    else:
        identity_label = None
        identity_detail = "No two-sided identity element e satisfying e * x = x * e = x exists."

    # 3. Inverses
    inverses_ok = False
    inverses_detail = "Cannot verify inverses without a unique identity element."
    missing_inverses: list[str] = []
    if identity_ok and identity_idx is not None:
        e_lbl = labels[identity_idx]
        for a in range(n):
            has_inv = any(
                matrix[a][b] == e_lbl and matrix[b][a] == e_lbl
                for b in range(n)
            )
            if not has_inv:
                missing_inverses.append(labels[a])
        inverses_ok = len(missing_inverses) == 0
        if inverses_ok:
            inverses_detail = f"Every element has a two-sided inverse yielding {e_lbl}."
        else:
            inverses_detail = f"Element(s) without a two-sided inverse: {', '.join(missing_inverses)}."

    # 4. Associativity
    assoc_ok = True
    assoc_detail = "Verified (a * b) * c = a * (b * c) for all triples in S."
    if not closure_ok:
        assoc_ok = False
        assoc_detail = "Associativity fails because the operation is not closed on S."
    else:
        for a in range(n):
            for b in range(n):
                ab_idx = label_to_idx[matrix[a][b]]
                for c in range(n):
                    bc_idx = label_to_idx[matrix[b][c]]
                    lhs = matrix[ab_idx][c]
                    rhs = matrix[a][bc_idx]
                    if lhs != rhs:
                        assoc_ok = False
                        assoc_detail = (
                            f"Associativity fails: ({labels[a]} * {labels[b]}) * {labels[c]} = {lhs} "
                            f"≠ {rhs} = {labels[a]} * ({labels[b]} * {labels[c]})."
                        )
                        break
                if not assoc_ok:
                    break
            if not assoc_ok:
                break

    # 5. Commutativity
    comm_ok = True
    comm_detail = "Verified a * b = b * a for all pairs in S (table is symmetric)."
    for a in range(n):
        for b in range(a + 1, n):
            if matrix[a][b] != matrix[b][a]:
                comm_ok = False
                comm_detail = (
                    f"Non-commutative witness: {labels[a]} * {labels[b]} = {matrix[a][b]} "
                    f"≠ {matrix[b][a]} = {labels[b]} * {labels[a]}."
                )
                break
        if not comm_ok:
            break

    is_group = closure_ok and identity_ok and inverses_ok and assoc_ok

    return {
        "closure": {"passed": closure_ok, "detail": closure_detail},
        "identity": {"passed": identity_ok, "detail": identity_detail, "element": identity_label},
        "inverses": {"passed": inverses_ok, "detail": inverses_detail},
        "associativity": {"passed": assoc_ok, "detail": assoc_detail},
        "commutativity": {"passed": comm_ok, "detail": comm_detail},
        "is_group": is_group,
        "is_abelian_group": is_group and comm_ok,
    }


def generate_cayley_table(payload: dict[str, Any]) -> dict[str, Any]:
    group_type = str(payload.get("group_type", "abelian")).strip().lower()

    if group_type == "abelian":
        moduli = parse_moduli_list(payload.get("moduli", [4]), max_components=4, max_total_order=MAX_CAYLEY_ORDER)
        is_single = len(moduli) == 1
        elems = list(itertools.product(*(range(m) for m in moduli)))
        labels = [format_element(e, is_single) for e in elems]
        matrix: list[list[str]] = []
        for a in elems:
            row = []
            for b in elems:
                res = tuple((x + y) % m for x, y, m in zip(a, b, moduli))
                row.append(format_element(res, is_single))
            matrix.append(row)
        group_name = format_group_notation(moduli)
        op_symbol = "+"
        op_description = "Component-wise modular addition"

    elif group_type == "dihedral":
        n = parse_positive_int(payload.get("n", 4), "Dihedral n", min_val=3, max_val=MAX_CAYLEY_ORDER // 2)
        raw_elems: list[tuple[bool, int]] = [(False, k) for k in range(n)] + [(True, k) for k in range(n)]
        labels = [format_dihedral_element(r, k, n) for r, k in raw_elems]
        matrix = []
        for a in raw_elems:
            row = []
            for b in raw_elems:
                prod = multiply_dihedral(a, b, n)
                row.append(format_dihedral_element(prod[0], prod[1], n))
            matrix.append(row)
        group_name = f"D_{n}"
        op_symbol = "·"
        op_description = f"Dihedral composition in D_{n} (apply right factor first)"

    elif group_type == "permutation":
        n = parse_positive_int(payload.get("n", 3), "Symmetric group n", min_val=1, max_val=4)
        # S_4 has 24 elements; S_5 has 120 > MAX_CAYLEY_ORDER
        raw_perms = [list(p) for p in itertools.permutations(range(1, n + 1))]
        labels = []
        perm_to_label: dict[tuple[int, ...], str] = {}
        for p in raw_perms:
            nt, _ = compute_disjoint_cycles(p)
            lbl = format_cycles(nt)
            labels.append(lbl)
            perm_to_label[tuple(p)] = lbl
        matrix = []
        for f in raw_perms:
            row = []
            for g in raw_perms:
                comp = tuple(compose_one_line(f, g))
                row.append(perm_to_label[comp])
            matrix.append(row)
        group_name = f"S_{n}"
        op_symbol = "∘"
        op_description = f"Permutation composition (f ∘ g)(x) = f(g(x)) in S_{n}"

    elif group_type == "custom":
        raw_labels = payload.get("labels")
        raw_matrix = payload.get("matrix")
        if not isinstance(raw_labels, list) or len(raw_labels) == 0:
            raise ValidationError("Custom operation requires a non-empty list of element labels.", "labels")
        if len(raw_labels) > 12:
            raise ValidationError("Custom Cayley table verification supports up to 12 elements.", "labels")
        labels = [str(x).strip() for x in raw_labels]
        if any(lbl == "" for lbl in labels) or len(set(labels)) != len(labels):
            raise ValidationError("Element labels must be non-empty and unique.", "labels")
        if not isinstance(raw_matrix, list) or len(raw_matrix) != len(labels):
            raise ValidationError("Custom matrix must have the same number of rows as element labels.", "matrix")
        matrix = [[str(cell).strip() for cell in row] for row in raw_matrix]
        group_name = str(payload.get("name", "Custom Operation")).strip() or "Custom Operation"
        op_symbol = "*"
        op_description = "User-defined binary operation table"

    else:
        raise ValidationError(f"Unsupported group_type '{group_type}'.", "group_type")

    verification = verify_cayley_table(labels, matrix)
    order = len(labels)

    return {
        "group_name": group_name,
        "group_type": group_type,
        "order": order,
        "operation_symbol": op_symbol,
        "operation_description": op_description,
        "labels": labels,
        "matrix": matrix,
        "verification": verification,
        "explanation": {
            "summary": (
                f"{group_name} (order {order}) {'satisfies all four group axioms' if verification['is_group'] else 'FAILS one or more group axioms'}; "
                f"it is {'Abelian (commutative)' if verification['is_abelian_group'] else 'non-Abelian' if verification['is_group'] else 'not a group'}."
            ),
            "formula": "Group axioms: Closure, Identity (e*x = x*e = x), Inverses (a*a⁻¹ = e), Associativity ((a*b)*c = a*(b*c))",
            "reasoning": [
                verification["closure"]["detail"],
                verification["identity"]["detail"],
                verification["inverses"]["detail"],
                verification["associativity"]["detail"],
                verification["commutativity"]["detail"],
            ],
        },
        "limits": {
            "max_order": MAX_CAYLEY_ORDER,
            "max_permutation_n": 4,
            "max_dihedral_n": MAX_CAYLEY_ORDER // 2,
        },
    }
