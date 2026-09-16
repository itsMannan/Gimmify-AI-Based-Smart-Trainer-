"""HTTP tests for dependency providers and error handlers."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from src.api import dependencies
from src.config import Settings, clear_settings_cache


def test_provide_settings_returns_settings() -> None:
    """The settings provider returns a Settings instance."""
    clear_settings_cache()
    settings = dependencies.provide_settings()
    assert isinstance(settings, Settings)


def test_provide_settings_maps_failures_to_http_500() -> None:
    """A settings load failure becomes an HTTP 500."""
    with (
        patch("src.api.dependencies.get_settings", side_effect=RuntimeError("boom")),
        pytest.raises(HTTPException) as exc_info,
    ):
        dependencies.provide_settings()
    assert exc_info.value.status_code == 500


def test_provide_request_id_reads_state(client: TestClient) -> None:
    """Request ID dependency reads the value middleware stored on state."""
    response = client.get("/health", headers={"X-Request-ID": "dep-id"})
    assert response.headers["X-Request-ID"] == "dep-id"


def test_get_redis_client_yields_and_closes() -> None:
    """Redis dependency yields a client and always closes it."""
    fake_mod = MagicMock()
    fake_client = MagicMock()
    fake_mod.Redis.from_url.return_value = fake_client
    with patch.dict("sys.modules", {"redis": fake_mod}):
        gen = dependencies.get_redis_client()
        client = next(gen)
        assert client is fake_client
        with pytest.raises(StopIteration):
            next(gen)
    fake_client.close.assert_called()
