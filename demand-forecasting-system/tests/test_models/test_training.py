"""Unit tests for model training (Phase 4 implementation)."""

from __future__ import annotations


def test_trainer_module_is_importable() -> None:
    """The trainer module exists and exposes a logger."""
    from src.models import trainer

    assert trainer.__doc__ is not None
    assert hasattr(trainer, "logger")
