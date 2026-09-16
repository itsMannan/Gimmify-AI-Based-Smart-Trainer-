"""Liveness, readiness, and dependency health endpoints."""

from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from src.api.dependencies import SettingsDep
from src.api.schemas import DependencyCheck, HealthStatus, ReadinessStatus
from src.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["health"])


def _ping_postgres(dsn: str) -> DependencyCheck:
    """Attempt a short PostgreSQL connection.

    Args:
        dsn: SQLAlchemy-style PostgreSQL DSN.

    Returns:
        Dependency check result.
    """
    started = time.perf_counter()
    try:
        import psycopg2
    except ImportError:
        logger.warning("postgres_driver_missing")
        return DependencyCheck(name="postgres", status="skipped", detail="psycopg2 not installed")

    try:
        connect_dsn = dsn.replace("postgresql+psycopg2://", "postgresql://")
        conn = psycopg2.connect(connect_dsn, connect_timeout=2)
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        finally:
            conn.close()
        latency_ms = (time.perf_counter() - started) * 1000
        return DependencyCheck(name="postgres", status="up", latency_ms=round(latency_ms, 2))
    except Exception as exc:
        latency_ms = (time.perf_counter() - started) * 1000
        logger.warning("postgres_health_failed", error=str(exc), latency_ms=round(latency_ms, 2))
        return DependencyCheck(
            name="postgres",
            status="down",
            latency_ms=round(latency_ms, 2),
            detail=str(exc),
        )


def _ping_redis(url: str) -> DependencyCheck:
    """Attempt a short Redis PING.

    Args:
        url: Redis connection URL.

    Returns:
        Dependency check result.
    """
    started = time.perf_counter()
    try:
        import redis as redis_lib
    except ImportError:
        logger.warning("redis_driver_missing")
        return DependencyCheck(name="redis", status="skipped", detail="redis not installed")

    client: Any = None
    try:
        client = redis_lib.Redis.from_url(
            url,
            socket_connect_timeout=1.0,
            socket_timeout=1.0,
        )
        client.ping()
        latency_ms = (time.perf_counter() - started) * 1000
        return DependencyCheck(name="redis", status="up", latency_ms=round(latency_ms, 2))
    except Exception as exc:
        latency_ms = (time.perf_counter() - started) * 1000
        logger.warning("redis_health_failed", error=str(exc), latency_ms=round(latency_ms, 2))
        return DependencyCheck(
            name="redis",
            status="down",
            latency_ms=round(latency_ms, 2),
            detail=str(exc),
        )
    finally:
        if client is not None:
            try:
                client.close()
            except Exception:
                logger.debug("redis_health_close_failed", exc_info=True)


@router.get("/health", response_model=HealthStatus)
def health(settings: SettingsDep) -> HealthStatus:
    """Liveness probe — process is up and configuration loaded.

    Args:
        settings: Injected application settings.

    Returns:
        Health payload. Always HTTP 200 if the worker can serve traffic.
    """
    try:
        return HealthStatus(
            status="ok",
            service=settings.app_name,
            version=settings.app_version,
            environment=settings.environment,
        )
    except Exception:
        logger.exception("health_handler_failed")
        return HealthStatus(
            status="error",
            service="demand-forecasting-system",
            version="unknown",
            environment="unknown",
        )


@router.get("/live", response_model=HealthStatus)
def live(settings: SettingsDep) -> HealthStatus:
    """Kubernetes-style liveness alias for ``/health``.

    Args:
        settings: Injected application settings.

    Returns:
        Health payload.
    """
    return health(settings)


@router.get("/ready", response_model=ReadinessStatus)
def ready(settings: SettingsDep) -> JSONResponse:
    """Readiness probe — PostgreSQL and Redis must respond.

    Args:
        settings: Injected application settings.

    Returns:
        JSON response with HTTP 200 when ready, 503 otherwise.
    """
    try:
        checks = [
            _ping_postgres(settings.postgres_dsn),
            _ping_redis(settings.redis_url),
        ]
        is_ready = all(check.status in {"up", "skipped"} for check in checks)
        payload = ReadinessStatus(
            status="ready" if is_ready else "not_ready",
            checks=checks,
        )
        http_status = status.HTTP_200_OK if is_ready else status.HTTP_503_SERVICE_UNAVAILABLE
        return JSONResponse(status_code=http_status, content=payload.model_dump(mode="json"))
    except Exception as exc:
        logger.exception("readiness_handler_failed")
        payload = ReadinessStatus(
            status="not_ready",
            checks=[DependencyCheck(name="internal", status="down", detail=str(exc))],
        )
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=payload.model_dump(mode="json"),
        )
