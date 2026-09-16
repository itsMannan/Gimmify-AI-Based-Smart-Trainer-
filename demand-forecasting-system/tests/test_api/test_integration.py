"""Lightweight integration tests that the application factory boots."""

from __future__ import annotations

from fastapi.testclient import TestClient

from src.api.main import app


def test_create_app_returns_fastapi_instance() -> None:
    """The module app exposes health routes in OpenAPI."""
    paths = set(app.openapi().get("paths", {}))
    assert "/health" in paths
    assert "/ready" in paths
    assert "/live" in paths


def test_openapi_available_outside_production(client: TestClient) -> None:
    """Docs are enabled in non-production environments."""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    payload = response.json()
    assert payload["info"]["title"]
