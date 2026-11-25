"""Euler's totient function phi(n) and cyclic group generator calculator."""

from __future__ import annotations
import math
from typing import Any

from backend.math_engine.classification import prime_factorization
from backend.validation.validators import parse_positive_int

MAX_TOTIENT_N = 100000
MAX_ENUMERATE_N = 500


def euler_phi(n: int) -> int:
    if n == 1:
        return 1
    result = n
    for p, _ in prime_factorization(n):
        result = result // p * (p - 1)
    return result


def analyze_totient(raw_n: Any) -> dict[str, Any]:
    n = parse_positive_int(raw_n, "Integer n", min_val=1, max_val=MAX_TOTIENT_N)
    factors = prime_factorization(n)
    phi_val = euler_phi(n)

    factorization_str = (
        "1" if n == 1 else " × ".join(f"{p}^{a}" if a > 1 else str(p) for p, a in factors)
    )

    enumerated = n <= MAX_ENUMERATE_N
    coprime_residues: list[int] | None = None
    generators: list[int] | None = None
    verified = True

    if enumerated:
        if n == 1:
            coprime_residues = [1]
            generators = [0]
            verified = len(generators) == phi_val == 1
        else:
            coprime_residues = [k for k in range(1, n) if math.gcd(k, n) == 1]
            generators = list(coprime_residues)
            verified = len(generators) == phi_val

    formula_steps = []
    if n == 1:
        formula_steps.append("By definition, φ(1) = 1. In Z_1 = {0}, the single element 0 generates Z_1.")
    else:
        product_terms = " × ".join(f"(1 - 1/{p})" for p, _ in factors)
        formula_steps.append(f"Prime factorization: {n} = {factorization_str}.")
        formula_steps.append(f"φ({n}) = {n} × {product_terms} = {phi_val}.")
        if enumerated:
            formula_steps.append(
                f"In Z_{n}, an element k is a generator iff gcd(k, {n}) = 1; "
                f"enumerating yields {len(generators)} generators, matching φ({n}) = {phi_val}."
            )
        else:
            formula_steps.append(
                f"Coprime residue listing is capped at n ≤ {MAX_ENUMERATE_N} for display clarity; "
                f"φ({n}) = {phi_val} is computed exactly via prime factorization."
            )

    return {
        "n": n,
        "phi": phi_val,
        "prime_factorization": [{"prime": p, "exponent": a} for p, a in factors],
        "factorization_str": factorization_str,
        "enumerated": enumerated,
        "coprime_residues": coprime_residues,
        "generators": generators,
        "generator_count": phi_val,
        "verified": verified,
        "explanation": {
            "summary": f"φ({n}) = {phi_val}; Z_{n} has {phi_val} generator(s).",
            "formula": "φ(n) = n · ∏_{p | n} (1 - 1/p)",
            "reasoning": formula_steps,
        },
        "limits": {
            "max_n": MAX_TOTIENT_N,
            "max_enumerate_n": MAX_ENUMERATE_N,
        },
    }


def totient_table(max_n: int = 20) -> dict[str, Any]:
    n_limit = parse_positive_int(max_n, "Table upper bound", min_val=1, max_val=100)
    rows = []
    for k in range(1, n_limit + 1):
        phi_k = euler_phi(k)
        factors = prime_factorization(k)
        fact_str = "1" if k == 1 else " × ".join(f"{p}^{a}" if a > 1 else str(p) for p, a in factors)
        gens = [0] if k == 1 else [r for r in range(1, k) if math.gcd(r, k) == 1]
        rows.append(
            {
                "n": k,
                "phi": phi_k,
                "factorization": fact_str,
                "generators": gens,
                "generator_count": len(gens),
                "verified": len(gens) == phi_k,
            }
        )
    return {
        "max_n": n_limit,
        "rows": rows,
        "all_verified": all(r["verified"] for r in rows),
    }
