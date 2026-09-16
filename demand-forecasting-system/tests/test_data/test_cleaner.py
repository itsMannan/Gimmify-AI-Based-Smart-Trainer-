"""Unit tests for the data cleaner (Phase 2 implementation)."""

from __future__ import annotations


def test_cleaner_module_is_importable() -> None:
    """The cleaner module exists and exposes a logger."""
    from src.data import cleaner

    assert cleaner.__doc__ is not None
    assert hasattr(cleaner, "logger")
