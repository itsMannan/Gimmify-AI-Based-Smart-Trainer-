"""HTTP endpoint tests for the FastAPI application."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from src.api.routes import health as health_routes
from src.api.schemas import DependencyCheck


def test_health_returns_ok(client: TestClient) -> None:
    """Liveness endpoint returns the service identity."""
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["service"]
    assert payload["version"]
    assert "timestamp" in payload


def test_live_alias_matches_health(client: TestClient) -> None:
    """``/live`` is an alias of ``/health``."""
    health = client.get("/health").json()
    live = client.get("/live").json()
    assert live["status"] == health["status"]
    assert live["service"] == health["service"]


def test_security_headers_are_present(client: TestClient) -> None:
    """Every response includes the baseline security headers."""
    response = client.get("/health")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Referrer-Policy"] == "no-referrer"
    assert "X-Request-ID" in response.headers
    assert "X-Response-Time-ms" in response.headers


def test_request_id_is_echoed(client: TestClient) -> None:
    """A caller-supplied request ID is returned unchanged."""
    response = client.get("/health", headers={"X-Request-ID": "fixed-id-1"})
    assert response.headers["X-Request-ID"] == "fixed-id-1"


def test_ready_reports_not_ready_when_deps_down(client: TestClient) -> None:
    """Readiness fails closed when PostgreSQL or Redis is unreachable."""
    down = DependencyCheck(name="postgres", status="down", detail="refused")
    redis_down = DependencyCheck(name="redis", status="down", detail="refused")
    with (
        patch.object(health_routes, "_ping_postgres", return_value=down),
        patch.object(health_routes, "_ping_redis", return_value=redis_down),
    ):
        response = client.get("/ready")
    assert response.status_code == 503
    payload = response.json()
    assert payload["status"] == "not_ready"
    assert len(payload["checks"]) == 2


def test_ready_ok_when_dependencies_up(client: TestClient) -> None:
    """Readiness succeeds when both dependencies report up."""
    up_pg = DependencyCheck(name="postgres", status="up", latency_ms=1.2)
    up_redis = DependencyCheck(name="redis", status="up", latency_ms=0.4)
    with (
        patch.object(health_routes, "_ping_postgres", return_value=up_pg),
        patch.object(health_routes, "_ping_redis", return_value=up_redis),
    ):
        response = client.get("/ready")
    assert response.status_code == 200
    assert response.json()["status"] == "ready"


def test_unknown_route_is_json_404(client: TestClient) -> None:
    """Unhandled paths return the standard JSON error envelope."""
    response = client.get("/does-not-exist")
    assert response.status_code == 404
    payload = response.json()
    assert payload["error"] == "http_error"
    assert payload["request_id"]


def test_ping_postgres_handles_driver_and_connection_errors() -> None:
    """Postgres probe degrades instead of raising."""
    with patch.dict("sys.modules", {"psycopg2": None}):
        result = health_routes._ping_postgres("postgresql+psycopg2://u:p@localhost:5432/db")
    assert result.status in {"skipped", "down"}

    fake_mod = MagicMock()
    fake_mod.connect.side_effect = RuntimeError("boom")
    with patch.dict("sys.modules", {"psycopg2": fake_mod}):
        result = health_routes._ping_postgres("postgresql+psycopg2://u:p@localhost:5432/db")
    assert result.name == "postgres"
    assert result.status == "down"


def test_ping_redis_handles_connection_errors() -> None:
    """Redis probe degrades instead of raising."""
    result = health_routes._ping_redis("redis://localhost:6379/0")
    assert result.name == "redis"
    assert result.status in {"up", "down", "skipped"}
