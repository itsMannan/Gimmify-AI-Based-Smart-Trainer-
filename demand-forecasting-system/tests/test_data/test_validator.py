"""Unit tests for the data validator (Phase 2 implementation)."""

from __future__ import annotations


def test_validator_module_is_importable() -> None:
    """The validator module exists and exposes a logger."""
    from src.data import validator

    assert validator.__doc__ is not None
    assert hasattr(validator, "logger")
