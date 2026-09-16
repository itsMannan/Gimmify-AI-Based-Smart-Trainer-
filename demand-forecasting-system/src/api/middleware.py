"""HTTP middleware: request IDs, timing, and security headers."""

from __future__ import annotations

import time
import uuid
from collections.abc import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp

from src.logger import bind_request_id, clear_request_id, get_logger

logger = get_logger(__name__)


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Attach a request ID, measure latency, and emit access logs."""

    def __init__(self, app: ASGIApp, header_name: str = "X-Request-ID") -> None:
        """Initialize the middleware.

        Args:
            app: Downstream ASGI app.
            header_name: Header used to propagate the request ID.
        """
        super().__init__(app)
        self.header_name = header_name

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        """Process one request.

        Args:
            request: Incoming request.
            call_next: Next ASGI handler.

        Returns:
            Downstream response with correlation and timing headers.

        Raises:
            Exception: Re-raises unexpected handler errors after logging.
        """
        request_id = request.headers.get(self.header_name) or str(uuid.uuid4())
        request.state.request_id = request_id
        bind_request_id(request_id)
        started = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            duration_ms = (time.perf_counter() - started) * 1000
            logger.exception(
                "unhandled_request_error",
                method=request.method,
                path=request.url.path,
                duration_ms=round(duration_ms, 2),
            )
            raise
        else:
            duration_ms = (time.perf_counter() - started) * 1000
            response.headers[self.header_name] = request_id
            response.headers["X-Response-Time-ms"] = f"{duration_ms:.2f}"
            logger.info(
                "http_request",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_ms=round(duration_ms, 2),
            )
            return response
        finally:
            clear_request_id()


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Apply a conservative set of security headers to every response."""

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        """Add security headers to the downstream response.

        Args:
            request: Incoming request.
            call_next: Next ASGI handler.

        Returns:
            Response with security headers set.
        """
        try:
            response = await call_next(request)
        except Exception:
            logger.exception("security_headers_middleware_error", path=request.url.path)
            raise
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        response.headers.setdefault("X-XSS-Protection", "1; mode=block")
        response.headers.setdefault("Cache-Control", "no-store")
        return response
