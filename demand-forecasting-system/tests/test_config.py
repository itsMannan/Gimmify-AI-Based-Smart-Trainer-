"""Unit tests for application configuration."""

from __future__ import annotations

from pathlib import Path
from typing import Any

import pytest
from pydantic import ValidationError

from src.config import (
    PROJECT_ROOT,
    Settings,
    clear_settings_cache,
    get_project_root,
    get_settings,
    load_hyperparameters,
    load_thresholds,
    load_yaml_config,
    load_yaml_file,
)


def test_get_project_root_returns_existing_directory() -> None:
    """Project root must exist and contain ``src``."""
    root = get_project_root()
    assert root.exists()
    assert (root / "src").is_dir()
    assert PROJECT_ROOT == root


def test_settings_defaults_are_safe_for_tests(monkeypatch: pytest.MonkeyPatch) -> None:
    """Test environment loads without requiring a real .env file."""
    monkeypatch.setenv("ENVIRONMENT", "test")
    monkeypatch.setenv("SECRET_KEY", "test-secret-key-not-for-production-use")
    clear_settings_cache()
    settings = Settings()
    assert settings.environment == "test"
    assert settings.is_test is True
    assert settings.is_production is False
    assert settings.api_port == 8000
    assert "localhost" in settings.allowed_host_list


def test_list_constructor_values_are_coerced_to_csv() -> None:
    """List constructor args are stored as CSV and exposed as lists."""
    settings = Settings(
        allowed_hosts=["alpha.example.com", "beta.example.com"],
        api_cors_origins=["https://a.test", "https://b.test"],
    )
    assert settings.allowed_host_list == ["alpha.example.com", "beta.example.com"]
    assert settings.cors_origin_list == ["https://a.test", "https://b.test"]


def test_csv_env_lists_are_parsed(monkeypatch: pytest.MonkeyPatch) -> None:
    """Comma-separated hosts and CORS origins become lists."""
    monkeypatch.setenv("ALLOWED_HOSTS", "api.example.com, localhost")
    monkeypatch.setenv("API_CORS_ORIGINS", "https://app.example.com,https://admin.example.com")
    settings = Settings()
    assert settings.allowed_host_list == ["api.example.com", "localhost"]
    assert settings.cors_origin_list == ["https://app.example.com", "https://admin.example.com"]


def test_invalid_log_level_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    """Unknown log levels raise a validation error."""
    monkeypatch.setenv("LOG_LEVEL", "VERBOSE")
    with pytest.raises(ValidationError):
        Settings()


def test_empty_redis_password_becomes_none(monkeypatch: pytest.MonkeyPatch) -> None:
    """Blank Redis passwords are treated as unset."""
    monkeypatch.setenv("REDIS_PASSWORD", "")
    settings = Settings()
    assert settings.redis_password is None
    assert settings.redis_url == "redis://localhost:6379/0"


def test_redis_url_includes_auth_and_tls(monkeypatch: pytest.MonkeyPatch) -> None:
    """Redis URL encodes password and TLS scheme."""
    monkeypatch.setenv("REDIS_PASSWORD", "s3cret")
    monkeypatch.setenv("REDIS_SSL", "true")
    monkeypatch.setenv("REDIS_HOST", "cache.internal")
    monkeypatch.setenv("REDIS_PORT", "6380")
    settings = Settings()
    assert settings.redis_url == "rediss://:s3cret@cache.internal:6380/0"


def test_postgres_dsn_redacts_password(monkeypatch: pytest.MonkeyPatch) -> None:
    """Safe DSN never includes the raw password."""
    monkeypatch.setenv("POSTGRES_PASSWORD", "super-secret")
    monkeypatch.setenv("POSTGRES_USER", "forecast")
    monkeypatch.setenv("POSTGRES_HOST", "db.internal")
    settings = Settings()
    assert "super-secret" in settings.postgres_dsn
    assert "super-secret" not in settings.postgres_dsn_safe
    assert "***" in settings.postgres_dsn_safe
    assert "db.internal" in settings.postgres_dsn_safe


def test_production_rejects_default_secrets(monkeypatch: pytest.MonkeyPatch) -> None:
    """Production environment cannot boot with placeholder secrets."""
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("SECRET_KEY", "dev-only-change-me")
    monkeypatch.setenv("POSTGRES_PASSWORD", "forecast")
    with pytest.raises(ValidationError):
        Settings()


def test_production_accepts_strong_secrets(monkeypatch: pytest.MonkeyPatch) -> None:
    """Production boots when secrets are replaced."""
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("SECRET_KEY", "n" * 64)
    monkeypatch.setenv("POSTGRES_PASSWORD", "a-strong-db-password")
    settings = Settings()
    assert settings.is_production is True


def test_resolve_path_handles_relative_and_absolute(tmp_path: Path) -> None:
    """Relative paths are resolved against the project root."""
    settings = Settings()
    relative = settings.resolve_path("configs/development.yaml")
    assert relative.is_absolute()
    assert relative.exists()
    absolute = settings.resolve_path(tmp_path)
    assert absolute == tmp_path.resolve()


def test_load_yaml_file_success() -> None:
    """Known YAML configs parse into dictionaries."""
    payload = load_yaml_file(PROJECT_ROOT / "configs" / "development.yaml")
    assert payload["app"]["name"] == "demand-forecasting-system"
    assert "api" in payload


def test_load_yaml_file_missing(tmp_path: Path) -> None:
    """Missing files raise FileNotFoundError."""
    with pytest.raises(FileNotFoundError):
        load_yaml_file(tmp_path / "missing.yaml")


def test_load_yaml_file_invalid(tmp_path: Path) -> None:
    """Malformed YAML raises ValueError."""
    path = tmp_path / "bad.yaml"
    path.write_text("{[}", encoding="utf-8")
    with pytest.raises(ValueError):
        load_yaml_file(path)


def test_load_yaml_file_non_mapping(tmp_path: Path) -> None:
    """YAML lists are rejected."""
    path = tmp_path / "list.yaml"
    path.write_text("- just\n- a\n- list\n", encoding="utf-8")
    with pytest.raises(ValueError, match="must be a mapping"):
        load_yaml_file(path)


def test_load_yaml_file_empty(tmp_path: Path) -> None:
    """Empty YAML files yield an empty dict."""
    path = tmp_path / "empty.yaml"
    path.write_text("", encoding="utf-8")
    assert load_yaml_file(path) == {}


def test_load_yaml_config_test_uses_development() -> None:
    """The test environment overlays development YAML."""
    payload = load_yaml_config("test")
    assert payload["app"]["debug"] is True


def test_load_hyperparameters_and_thresholds() -> None:
    """Pinned YAML catalogs contain expected algorithm and metric keys."""
    hypers: dict[str, Any] = load_hyperparameters()
    thresholds: dict[str, Any] = load_thresholds()
    assert set(hypers) >= {"xgboost", "lightgbm", "prophet", "ensemble"}
    assert "data_quality" in thresholds
    assert "drift" in thresholds


def test_get_settings_is_cached(monkeypatch: pytest.MonkeyPatch) -> None:
    """``get_settings`` returns the same instance until the cache is cleared."""
    monkeypatch.setenv("ENVIRONMENT", "test")
    clear_settings_cache()
    first = get_settings()
    second = get_settings()
    assert first is second
    clear_settings_cache()
    third = get_settings()
    assert third is not first
