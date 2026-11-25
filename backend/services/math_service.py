"""Service layer orchestrating validation and mathematical engine calls."""

from __future__ import annotations
from typing import Any

from backend.math_engine.abelian import analyze_abelian_group
from backend.math_engine.analysis import analyze_group_orders, compare_groups
from backend.math_engine.cayley import generate_cayley_table
from backend.math_engine.classification import classify_abelian_groups
from backend.math_engine.dihedral import analyze_dihedral_group
from backend.math_engine.generators import analyze_totient, totient_table
from backend.math_engine.guided import check_guided_answer, get_guided_questions
from backend.math_engine.permutations import analyze_permutation, explore_symmetric_group
from backend.validation.validators import ValidationError


def dispatch_endpoint(path: str, method: str, payload: dict[str, Any] | None = None) -> tuple[int, dict[str, Any]]:
    data = payload or {}
    try:
        if path == "/api/health" and method == "GET":
            return 200, {"status": "ok", "engine": "GroupTheory Lab Python Math Engine"}

        if path == "/api/abelian/explore" and method == "POST":
            return 200, {"ok": True, "data": analyze_abelian_group(data.get("moduli", [4]))}

        if path == "/api/abelian/classify" and method == "POST":
            return 200, {"ok": True, "data": classify_abelian_groups(data.get("n"))}

        if path == "/api/cayley/generate" and method == "POST":
            return 200, {"ok": True, "data": generate_cayley_table(data)}

        if path == "/api/permutations/analyze" and method == "POST":
            expected_n = data.get("n")
            if expected_n == "" or expected_n is None:
                expected_n = None
            return 200, {"ok": True, "data": analyze_permutation(data.get("permutation"), expected_n)}

        if path == "/api/permutations/symmetric" and method == "POST":
            return 200, {"ok": True, "data": explore_symmetric_group(data.get("n", 4))}

        if path == "/api/dihedral/explore" and method == "POST":
            include_cayley = bool(data.get("include_cayley", False))
            return 200, {"ok": True, "data": analyze_dihedral_group(data.get("n", 4), include_cayley)}

        if path == "/api/generators/phi" and method == "POST":
            return 200, {"ok": True, "data": analyze_totient(data.get("n"))}

        if path == "/api/generators/table" and method == "GET":
            return 200, {"ok": True, "data": totient_table(20)}

        if path == "/api/analysis/orders" and method == "POST":
            return 200, {"ok": True, "data": analyze_group_orders(data)}

        if path == "/api/analysis/compare" and method == "POST":
            return 200, {
                "ok": True,
                "data": compare_groups(data.get("group_a", {}), data.get("group_b", {})),
            }

        if path == "/api/guided/questions" and method == "GET":
            return 200, {"ok": True, "data": {"questions": get_guided_questions()}}

        if path == "/api/guided/check" and method == "POST":
            q_id = data.get("question_id")
            if not isinstance(q_id, int):
                try:
                    q_id = int(q_id)
                except (TypeError, ValueError) as exc:
                    raise ValidationError("Invalid question_id.", "question_id") from exc
            return 200, {"ok": True, "data": check_guided_answer(q_id, data.get("answer"))}

        return 404, {"ok": False, "error": f"Endpoint {method} {path} not found."}

    except ValidationError as exc:
        return 400, {"ok": False, "error": exc.message, "field": exc.field}
    except ValueError as exc:
        return 400, {"ok": False, "error": str(exc)}
    except Exception:
        return 500, {"ok": False, "error": "An unexpected calculation error occurred. Please verify your inputs."}
