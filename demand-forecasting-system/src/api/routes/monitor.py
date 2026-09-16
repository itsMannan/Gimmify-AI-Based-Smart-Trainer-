"""Monitoring snapshot and drift-status endpoints.

This module is part of the demand forecasting system. The public
interface is implemented in a later phase; the module remains importable
so package discovery, Docker builds, and CI stay green from Phase 1.
"""

from __future__ import annotations

from src.logger import get_logger

logger = get_logger(__name__)
