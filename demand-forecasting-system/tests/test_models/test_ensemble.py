"""Unit tests for the model ensemble (Phase 4 implementation)."""

from __future__ import annotations


def test_ensemble_module_is_importable() -> None:
    """The ensemble module exists and exposes a logger."""
    from src.models import ensemble

    assert ensemble.__doc__ is not None
    assert hasattr(ensemble, "logger")
