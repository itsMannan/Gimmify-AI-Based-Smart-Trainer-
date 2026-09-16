"""Unit tests for the feature store (Phase 3 implementation)."""

from __future__ import annotations


def test_store_module_is_importable() -> None:
    """The feature store module exists and exposes a logger."""
    from src.features import store

    assert store.__doc__ is not None
    assert hasattr(store, "logger")
