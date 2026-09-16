"""Unit tests for feature engineering (Phase 3 implementation)."""

from __future__ import annotations


def test_engineer_module_is_importable() -> None:
    """The feature engineer module exists and exposes a logger."""
    from src.features import engineer

    assert engineer.__doc__ is not None
    assert hasattr(engineer, "logger")
