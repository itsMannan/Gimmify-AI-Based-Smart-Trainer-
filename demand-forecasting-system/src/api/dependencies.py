"""FastAPI dependency providers (settings, cache, database)."""

from __future__ import annotations

from collections.abc import Generator
from typing import Annotated, Any

from fastapi import Depends, HTTPException, Request, status

from src.config import Settings, get_settings
from src.logger import get_logger

logger = get_logger(__name__)


def provide_settings() -> Settings:
    """Return process settings for injection into routes.

    Returns:
        Cached ``Settings`` instance.

    Raises:
        HTTPException: If settings cannot be loaded.
    """
    try:
        return get_settings()
    except Exception as exc:
        logger.exception("settings_load_failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Application configuration is invalid",
        ) from exc


SettingsDep = Annotated[Settings, Depends(provide_settings)]


def provide_request_id(request: Request) -> str:
    """Extract the request ID attached by middleware.

    Args:
        request: Incoming ASGI request.

    Returns:
        Request correlation ID, or ``-`` if missing.
    """
    return str(getattr(request.state, "request_id", "-"))


RequestIdDep = Annotated[str, Depends(provide_request_id)]


def get_redis_client() -> Generator[Any, None, None]:
    """Yield a Redis client when Redis is reachable.

    Yields:
        ``redis.Redis`` client.

    Raises:
        HTTPException: If the client cannot be created.
    """
    try:
        import redis as redis_lib
    except ImportError as exc:  # pragma: no cover - dependency is pinned
        logger.exception("redis_import_failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Redis client library is not installed",
        ) from exc

    settings = get_settings()
    client = redis_lib.Redis.from_url(
        settings.redis_url,
        socket_connect_timeout=1.0,
        socket_timeout=1.0,
        decode_responses=True,
    )
    try:
        yield client
    except Exception:
        logger.exception("redis_client_error")
        raise
    finally:
        try:
            client.close()
        except Exception:
            logger.warning("redis_client_close_failed", exc_info=True)
