"""Guided Learning & Assignment Challenges powered by the live mathematical engine."""

from __future__ import annotations
from typing import Any

from backend.math_engine.analysis import compare_groups
from backend.math_engine.classification import classify_abelian_groups
from backend.math_engine.dihedral import analyze_dihedral_group
from backend.math_engine.generators import totient_table
from backend.math_engine.permutations import analyze_permutation, explore_symmetric_group
from backend.validation.validators import ValidationError


def get_guided_questions() -> list[dict[str, Any]]:
    # Compute live mathematical proofs directly from the engine
    q1_data = classify_abelian_groups(72)
    q2_data = totient_table(20)
    q3_data = explore_symmetric_group(5)
    d6_data = analyze_dihedral_group(6, include_cayley=False)
    d8_data = analyze_dihedral_group(8, include_cayley=False)
    q5_data = compare_groups(
        {"group_type": "abelian", "moduli": [2, 2]},
        {"group_type": "abelian", "moduli": [4]},
    )
    q6_sample = analyze_permutation("(1 2 3)(4 5)", expected_n=5)

    return [
        {
            "id": 1,
            "title": "Classify all finite Abelian groups of order 72",
            "concept": "Fundamental Theorem of Finite Abelian Groups",
            "prompt": "Using prime factorization 72 = 2^3 × 3^2 and integer partitions, determine how many non-isomorphic finite Abelian groups of order 72 exist and list their invariant-factor and elementary-divisor forms.",
            "input_type": "integer",
            "input_label": "Total number of non-isomorphic Abelian groups of order 72",
            "input_placeholder": "Enter integer (e.g., 6)",
            "hints": [
                "Factor 72 into prime powers: 72 = 2^3 × 3^2.",
                "Count integer partitions of each exponent: p(3) and p(2).",
                "Multiply the partition counts: p(3) × p(2).",
            ],
            "steps": q1_data["explanation"]["reasoning"],
            "final_answer": f"{q1_data['total_groups']} non-isomorphic groups",
            "computed_data": q1_data,
        },
        {
            "id": 2,
            "title": "Tabulate φ(n) for n ≤ 20",
            "concept": "Euler's Totient Function & Cyclic Group Generators",
            "prompt": "Compute Euler's totient function φ(n) for n = 1, 2, ..., 20, representing the number of generators of Z_n. Enter φ(20) to verify your table.",
            "input_type": "integer",
            "input_label": "Value of φ(20)",
            "input_placeholder": "Enter φ(20)",
            "hints": [
                "Factor 20 = 2^2 × 5.",
                "Apply φ(n) = n × ∏(1 - 1/p) = 20 × (1 - 1/2) × (1 - 1/5).",
                "Equivalently, count integers 1 ≤ k < 20 with gcd(k, 20) = 1.",
            ],
            "steps": [
                "Use φ(1) = 1 and φ(p^k) = p^k - p^(k-1) with multiplicativity for coprime factors.",
                "For n = 20 = 4 × 5: φ(20) = φ(4) × φ(5) = 2 × 4 = 8.",
                f"All 20 values verified against explicit generator counts in Z_n: {q2_data['all_verified']}.",
            ],
            "final_answer": "φ(20) = 8; full table for 1 ≤ n ≤ 20 computed and verified",
            "computed_data": q2_data,
        },
        {
            "id": 3,
            "title": "Count the even permutations in S_5",
            "concept": "Alternating Group A_n and Permutation Parity",
            "prompt": "Determine the exact number of even permutations in the symmetric group S_5 (the order of the alternating group A_5).",
            "input_type": "integer",
            "input_label": "Number of even permutations in S_5",
            "input_placeholder": "Enter |A_5|",
            "hints": [
                "Total order of S_5 is 5! = 120.",
                "For any n ≥ 2, exactly half of the permutations in S_n are even and half are odd.",
                "Compute 5! / 2.",
            ],
            "steps": q3_data["explanation"]["reasoning"],
            "final_answer": f"|A_5| = {q3_data['even_count']} even permutations",
            "computed_data": {
                "n": 5,
                "total_order": q3_data["total_order"],
                "even_count": q3_data["even_count"],
                "odd_count": q3_data["odd_count"],
                "an_verified": q3_data["an_verified"],
                "order_distribution": q3_data["order_distribution"],
            },
        },
        {
            "id": 4,
            "title": "Calculate element orders in D_6 and D_8",
            "concept": "Dihedral Groups D_n (Rotations and Reflections)",
            "prompt": "Compute all element orders in D_6 (12 elements) and D_8 (16 elements). Enter the number of elements of order 2 in D_8 (including both reflections and the central half-turn).",
            "input_type": "integer",
            "input_label": "Number of order-2 elements in D_8",
            "input_placeholder": "Enter count of order-2 elements in D_8",
            "hints": [
                "In D_8, all 8 reflections r^k s have order 2.",
                "Also check the rotations r^k using ord(r^k) = 8 / gcd(8, k): which rotation has order 2?",
                "r^4 has order 8 / gcd(8, 4) = 2, giving 8 + 1 = 9 elements of order 2.",
            ],
            "steps": [
                "In D_6 (order 12): 1 identity (ord 1), 2 rotations r,r^5 (ord 6), 2 rotations r^2,r^4 (ord 3), 1 rotation r^3 (ord 2), plus 6 reflections (ord 2) -> 7 elements of order 2.",
                "In D_8 (order 16): 1 identity (ord 1), 4 rotations r,r^3,r^5,r^7 (ord 8), 2 rotations r^2,r^6 (ord 4), 1 rotation r^4 (ord 2), plus 8 reflections (ord 2) -> 9 elements of order 2.",
            ],
            "final_answer": "D_6 has max order 6 (7 order-2 elements); D_8 has max order 8 (9 order-2 elements)",
            "computed_data": {
                "d6": {
                    "order": d6_data["order"],
                    "centre": d6_data["centre"],
                    "order_distribution": d6_data["order_distribution"],
                },
                "d8": {
                    "order": d8_data["order"],
                    "centre": d8_data["centre"],
                    "order_distribution": d8_data["order_distribution"],
                },
            },
        },
        {
            "id": 5,
            "title": "Show Z_2 × Z_2 has no element of order 4 and compare with Z_4",
            "concept": "Non-Cyclic Direct Products vs Cyclic Groups",
            "prompt": "Compare the element orders of Z_2 × Z_2 (Klein four-group) and Z_4. What is the maximum element order in Z_2 × Z_2?",
            "input_type": "integer",
            "input_label": "Maximum element order in Z_2 × Z_2",
            "input_placeholder": "Enter max order in Z_2 × Z_2",
            "hints": [
                "Every element (a, b) in Z_2 × Z_2 satisfies ord(a, b) = lcm(ord_2(a), ord_2(b)).",
                "Since every element in Z_2 has order 1 or 2, lcm(ord_2(a), ord_2(b)) can only be 1 or 2.",
                "By contrast, Z_4 has elements 1 and 3 of order 4.",
            ],
            "steps": [
                "In Z_2 × Z_2: (0,0) has order 1; (1,0), (0,1), (1,1) each satisfy 2·(a,b) = (0,0), so all three have order 2.",
                "Therefore, Z_2 × Z_2 has zero elements of order 4 and is not cyclic.",
                "In Z_4: 0 has order 1, 2 has order 2, and 1, 3 have order 4 (generators), so Z_4 is cyclic.",
            ],
            "final_answer": "Max order in Z_2 × Z_2 is 2 (no order-4 element), whereas Z_4 has two order-4 elements and is cyclic",
            "computed_data": q5_data,
        },
        {
            "id": 6,
            "title": "Find an order-6 element in S_5 and determine its parity",
            "concept": "Disjoint Cycle Decomposition, LCM Order, and Sign",
            "prompt": "Enter any permutation in S_5 (cycle notation like (1 2 3)(4 5) or one-line like 2 3 1 5 4) that has order 6, and verify its parity.",
            "input_type": "permutation_s5",
            "input_label": "Permutation σ ∈ S_5 of order 6",
            "input_placeholder": "e.g. (1 2 3)(4 5) or 2 3 1 5 4",
            "hints": [
                "An element of S_5 has order lcm(cycle lengths) = 6.",
                "Since a single 6-cycle requires 6 symbols, in S_5 you must combine disjoint cycles whose lengths have LCM 6: a 3-cycle and a disjoint 2-cycle!",
                "Example: σ = (1 2 3)(4 5) has cycle lengths [3, 2], order lcm(3, 2) = 6, and sign (-1)^(5 - 2) = -1 (odd).",
            ],
            "steps": [
                "To achieve order 6 in S_5, the partition of 5 must have LCM equal to 6, which uniquely forces cycle type (3, 2) (one 3-cycle and one disjoint 2-cycle).",
                "For σ = (1 2 3)(4 5): c = 2 cycles (no fixed points), n = 5.",
                "Order: lcm(3, 2) = 6.",
                "Sign: (-1)^(5 - 2) = (-1)^3 = -1, so every order-6 element in S_5 is ODD.",
            ],
            "final_answer": f"Example {q6_sample['cycle_notation']} (order 6, sign -1, odd parity — every order-6 element in S_5 is odd)",
            "computed_data": q6_sample,
        },
    ]


def check_guided_answer(question_id: int, raw_answer: Any) -> dict[str, Any]:
    if raw_answer is None or str(raw_answer).strip() == "":
        raise ValidationError("Please enter an answer before checking.", "answer")

    if question_id == 1:
        val = int(str(raw_answer).strip()) if _is_int(raw_answer) else None
        expected = classify_abelian_groups(72)["total_groups"]  # 6
        correct = val == expected
        return {
            "question_id": 1,
            "correct": correct,
            "feedback": (
                "Correct! 72 = 2^3 × 3^2 gives p(3) × p(2) = 3 × 2 = 6 non-isomorphic Abelian groups."
                if correct
                else "Not quite. Factor 72 = 2^3 × 3^2 and multiply the partition counts p(3) × p(2)."
            ),
        }

    if question_id == 2:
        val = int(str(raw_answer).strip()) if _is_int(raw_answer) else None
        expected = 8
        correct = val == expected
        return {
            "question_id": 2,
            "correct": correct,
            "feedback": (
                "Correct! φ(20) = 20 × (1 - 1/2) × (1 - 1/5) = 8, matching the 8 generators of Z_20."
                if correct
                else "Not quite. Compute φ(20) using prime factorization 20 = 2^2 × 5."
            ),
        }

    if question_id == 3:
        val = int(str(raw_answer).strip()) if _is_int(raw_answer) else None
        expected = explore_symmetric_group(5)["even_count"]  # 60
        correct = val == expected
        return {
            "question_id": 3,
            "correct": correct,
            "feedback": (
                "Correct! |A_5| = 5! / 2 = 120 / 2 = 60 even permutations."
                if correct
                else "Not quite. Remember |S_5| = 5! = 120 and half of them are even."
            ),
        }

    if question_id == 4:
        val = int(str(raw_answer).strip()) if _is_int(raw_answer) else None
        d8 = analyze_dihedral_group(8)
        expected = sum(1 for e in d8["elements"] if e["order"] == 2)  # 9
        correct = val == expected
        return {
            "question_id": 4,
            "correct": correct,
            "feedback": (
                "Correct! D_8 has 8 reflections of order 2 plus the central rotation r^4 of order 2, totaling 9 elements of order 2."
                if correct
                else "Not quite. Count all 8 reflections r^k s PLUS any rotation r^k in D_8 with ord(r^k) = 2."
            ),
        }

    if question_id == 5:
        val = int(str(raw_answer).strip()) if _is_int(raw_answer) else None
        expected = 2
        correct = val == expected
        return {
            "question_id": 5,
            "correct": correct,
            "feedback": (
                "Correct! The maximum element order in Z_2 × Z_2 is 2, so it has no element of order 4 and is not isomorphic to Z_4."
                if correct
                else "Not quite. Check lcm(ord_2(a), ord_2(b)) for all elements (a, b) in Z_2 × Z_2."
            ),
        }

    if question_id == 6:
        analysis = analyze_permutation(raw_answer, expected_n=5)
        correct = analysis["order"] == 6
        return {
            "question_id": 6,
            "correct": correct,
            "analysis": analysis,
            "feedback": (
                f"Correct! {analysis['cycle_notation']} ∈ S_5 has order {analysis['order']}, sign {analysis['sign']:+d}, and is {analysis['parity'].upper()}."
                if correct
                else f"Your permutation {analysis['cycle_notation']} ∈ S_5 has order {analysis['order']} (expected order 6). Try a disjoint 3-cycle and 2-cycle like (1 2 3)(4 5)."
            ),
        }

    raise ValidationError(f"Unknown question id: {question_id}", "question_id")


def _is_int(val: Any) -> bool:
    try:
        s = str(val).strip()
        if "." in s:
            return False
        int(s)
        return True
    except (TypeError, ValueError):
        return False
