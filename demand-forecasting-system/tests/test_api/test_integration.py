"""Lightweight integration tests that the application factory boots."""

from __future__ import annotations

from fastapi.testclient import TestClient

from src.api.main import create_app


def test_create_app_returns_fastapi_instance() -> None:
    """Application factory produces an app with the health route registered."""
    app = create_app()
    routes = {getattr(route, "path", "") for route in app.routes}
    assert "/health" in routes
    assert "/ready" in routes
    assert "/live" in routes


def test_openapi_available_outside_production(client: TestClient) -> None:
    """Docs are enabled in non-production environments."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    payload = response.json()
    assert payload["info"]["title"]
