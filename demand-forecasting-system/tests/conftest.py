"""Shared pytest fixtures for the demand forecasting test suite."""

from __future__ import annotations

import os
from collections.abc import Generator
from pathlib import Path
from typing import TYPE_CHECKING

import pytest

if TYPE_CHECKING:
    from fastapi.testclient import TestClient

os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("LOG_LEVEL", "INFO")
os.environ.setdefault("LOG_FORMAT", "json")
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production-use")
os.environ.setdefault("POSTGRES_PASSWORD", "test-postgres-password")
os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("REDIS_HOST", "localhost")
os.environ.setdefault("API_CORS_ORIGINS", "http://localhost:8000")
os.environ.setdefault("PROMETHEUS_ENABLED", "false")

from src.config import clear_settings_cache  # noqa: E402
from src.logger import reset_logging  # noqa: E402


@pytest.fixture(autouse=True)
def _reset_singletons(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Generator[None, None, None]:
    """Point logs at a temp dir and reset cached settings around each test.

    Args:
        tmp_path: Pytest temporary directory.
        monkeypatch: Pytest monkeypatch fixture.

    Yields:
        Control to the test.
    """
    monkeypatch.setenv("ENVIRONMENT", "test")
    monkeypatch.setenv("LOG_DIR", str(tmp_path / "logs"))
    monkeypatch.setenv("SECRET_KEY", "test-secret-key-not-for-production-use")
    clear_settings_cache()
    reset_logging()
    yield
    clear_settings_cache()
    reset_logging()


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Return a FastAPI test client for the application.

    Yields:
        Configured ``TestClient``.
    """
    from fastapi.testclient import TestClient

    from src.api.main import app

    with TestClient(app) as test_client:
        yield test_client
