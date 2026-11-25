"""Input validation utilities for GroupTheory Lab."""

from __future__ import annotations
from typing import Any


class ValidationError(ValueError):
    """Raised when user input fails mathematical or safety validation."""

    def __init__(self, message: str, field: str | None = None):
        super().__init__(message)
        self.message = message
        self.field = field


def parse_positive_int(value: Any, field_name: str = "value", min_val: int = 1, max_val: int | None = None) -> int:
    if value is None or (isinstance(value, str) and value.strip() == ""):
        raise ValidationError(f"{field_name} is required and cannot be empty.", field_name)
    if isinstance(value, bool):
        raise ValidationError(f"{field_name} must be a valid integer.", field_name)
    try:
        if isinstance(value, str):
            stripped = value.strip()
            if "." in stripped:
                raise ValueError("Float not allowed")
            num = int(stripped)
        elif isinstance(value, float):
            if not value.is_integer():
                raise ValueError("Float not allowed")
            num = int(value)
        else:
            num = int(value)
    except (TypeError, ValueError) as exc:
        raise ValidationError(f"{field_name} must be a valid integer.", field_name) from exc

    if num < min_val:
        if min_val == 1 and num == 0:
            raise ValidationError(f"{field_name} cannot be zero; enter an integer >= 1.", field_name)
        raise ValidationError(f"{field_name} must be at least {min_val}.", field_name)
    if max_val is not None and num > max_val:
        raise ValidationError(f"{field_name} cannot exceed {max_val} (performance limit).", field_name)
    return num


def parse_moduli_list(raw_moduli: Any, max_components: int = 6, max_total_order: int = 256) -> list[int]:
    if not isinstance(raw_moduli, list) or len(raw_moduli) == 0:
        raise ValidationError("Provide at least one cyclic component modulus.", "moduli")
    if len(raw_moduli) > max_components:
        raise ValidationError(f"At most {max_components} cyclic components are supported in a direct product.", "moduli")

    moduli: list[int] = []
    total_order = 1
    for idx, item in enumerate(raw_moduli):
        m = parse_positive_int(item, f"Component {idx + 1}", min_val=1, max_val=max_total_order)
        moduli.append(m)
        total_order *= m
        if total_order > max_total_order:
            raise ValidationError(
                f"Direct product order ({total_order}) exceeds the supported enumeration limit of {max_total_order} elements.",
                "moduli",
            )
    return moduli
