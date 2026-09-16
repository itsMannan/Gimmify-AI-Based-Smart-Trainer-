"""Unit tests for model validation (Phase 4 implementation)."""

from __future__ import annotations


def test_validator_module_is_importable() -> None:
    """The model validator module exists and exposes a logger."""
    from src.models import validator

    assert validator.__doc__ is not None
    assert hasattr(validator, "logger")
