"""Pydantic request and response schemas for the forecasting API."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field


class HealthStatus(BaseModel):
    """Liveness payload returned by ``GET /health``."""

    status: Literal["ok", "degraded", "error"] = Field(..., description="Aggregate health state.")
    service: str = Field(..., description="Service name.")
    version: str = Field(..., description="Application version.")
    environment: str = Field(..., description="Deployment environment.")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp of the check.",
    )


class DependencyCheck(BaseModel):
    """Status of a single downstream dependency."""

    name: str
    status: Literal["up", "down", "skipped"]
    latency_ms: float | None = None
    detail: str | None = None


class ReadinessStatus(BaseModel):
    """Readiness payload returned by ``GET /ready``."""

    status: Literal["ready", "not_ready"]
    checks: list[DependencyCheck]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ErrorResponse(BaseModel):
    """Standard error envelope for unhandled and HTTP exceptions."""

    error: str
    detail: str
    request_id: str | None = None
    extra: dict[str, Any] | None = None
