"""Unit tests for the data loader (Phase 2 implementation)."""

from __future__ import annotations


def test_loader_module_is_importable() -> None:
    """The loader module exists and exposes a logger."""
    from src.data import loader

    assert loader.__doc__ is not None
    assert hasattr(loader, "logger")
