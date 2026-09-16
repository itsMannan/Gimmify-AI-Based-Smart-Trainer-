"""FastAPI application factory for the demand forecasting service."""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, ORJSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from src.api.middleware import RequestContextMiddleware, SecurityHeadersMiddleware
from src.api.routes.health import router as health_router
from src.api.schemas import ErrorResponse
from src.config import get_settings
from src.logger import configure_logging, get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    """Configure logging and emit process lifecycle events.

    Args:
        _app: FastAPI application (unused, required by the protocol).

    Yields:
        Control to the running application.
    """
    settings = get_settings()
    configure_logging(settings)
    logger.info(
        "api_startup",
        environment=settings.environment,
        postgres=settings.postgres_dsn_safe,
        redis_host=settings.redis_host,
    )
    try:
        yield
    finally:
        logger.info("api_shutdown")


def create_app() -> FastAPI:
    """Build and configure the FastAPI application.

    Returns:
        Fully configured ASGI application.

    Raises:
        Exception: If settings or logging fail during startup configuration.
    """
    try:
        settings = get_settings()
        configure_logging(settings)
    except Exception:
        logging_fallback()
        logger.exception("create_app_settings_failed")
        raise

    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        default_response_class=ORJSONResponse,
        lifespan=lifespan,
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
    )

    application.add_middleware(SecurityHeadersMiddleware)
    application.add_middleware(RequestContextMiddleware)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )

    _install_rate_limiter(application, settings.api_rate_limit_per_minute)
    _install_metrics(application, settings.prometheus_enabled, settings.prometheus_metrics_path)

    application.include_router(health_router)

    @application.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        """Serialize HTTP exceptions into the standard error envelope.

        Args:
            request: Incoming request.
            exc: HTTP exception.

        Returns:
            JSON error response.
        """
        request_id = getattr(request.state, "request_id", "-")
        logger.warning(
            "http_exception",
            status_code=exc.status_code,
            detail=str(exc.detail),
            path=request.url.path,
        )
        payload = ErrorResponse(
            error="http_error",
            detail=str(exc.detail),
            request_id=request_id,
        )
        return JSONResponse(status_code=exc.status_code, content=payload.model_dump())

    @application.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        """Serialize validation errors.

        Args:
            request: Incoming request.
            exc: Validation error.

        Returns:
            JSON 422 error response.
        """
        request_id = getattr(request.state, "request_id", "-")
        logger.warning("validation_error", path=request.url.path, errors=exc.errors())
        payload = ErrorResponse(
            error="validation_error",
            detail="Request validation failed",
            request_id=request_id,
            extra={"errors": exc.errors()},
        )
        return JSONResponse(status_code=422, content=payload.model_dump())

    @application.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        """Catch-all handler so clients never see a raw traceback.

        Args:
            request: Incoming request.
            exc: Unhandled exception.

        Returns:
            JSON 500 error response.
        """
        request_id = getattr(request.state, "request_id", "-")
        logger.exception("unhandled_exception", path=request.url.path, error=str(exc))
        payload = ErrorResponse(
            error="internal_error",
            detail="An unexpected error occurred",
            request_id=request_id,
        )
        return JSONResponse(status_code=500, content=payload.model_dump())

    return application


def _install_rate_limiter(application: FastAPI, limit_per_minute: int) -> None:
    """Install SlowAPI rate limiting when the dependency is available.

    Args:
        application: FastAPI app.
        limit_per_minute: Default request budget per client IP.
    """
    try:
        from slowapi import Limiter, _rate_limit_exceeded_handler
        from slowapi.errors import RateLimitExceeded
        from slowapi.middleware import SlowAPIMiddleware
        from slowapi.util import get_remote_address
    except Exception:
        logger.warning("rate_limiter_unavailable", exc_info=True)
        return

    try:
        limiter = Limiter(
            key_func=get_remote_address,
            default_limits=[f"{limit_per_minute}/minute"],
            headers_enabled=True,
        )
        application.state.limiter = limiter
        application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
        application.add_middleware(SlowAPIMiddleware)
        logger.info("rate_limiter_enabled", limit_per_minute=limit_per_minute)
    except Exception:
        logger.exception("rate_limiter_install_failed")


def _install_metrics(application: FastAPI, enabled: bool, metrics_path: str) -> None:
    """Expose Prometheus metrics when enabled.

    Args:
        application: FastAPI app.
        enabled: Whether to instrument the app.
        metrics_path: HTTP path for the scrape endpoint.
    """
    if not enabled:
        logger.info("prometheus_disabled")
        return
    try:
        from prometheus_fastapi_instrumentator import Instrumentator

        Instrumentator(
            should_group_status_codes=True,
            should_ignore_untemplated=True,
            excluded_handlers=["/metrics", "/health", "/live"],
        ).instrument(application).expose(application, endpoint=metrics_path, include_in_schema=False)
        logger.info("prometheus_enabled", path=metrics_path)
    except Exception:
        logger.exception("prometheus_install_failed")


def logging_fallback() -> None:
    """Configure a last-resort stdlib logger if structured setup fails."""
    import logging
    import sys

    logging.basicConfig(level=logging.INFO, stream=sys.stdout)


app: FastAPI = create_app()
