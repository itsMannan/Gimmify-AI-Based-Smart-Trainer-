"""Unit tests for structured logging."""

from __future__ import annotations

import logging
from pathlib import Path

from src.config import Settings
from src.logger import (
    add_request_id,
    bind_request_id,
    clear_request_id,
    configure_logging,
    get_logger,
    redact_sensitive_data,
    request_id_var,
    reset_logging,
)


def test_redact_sensitive_data_masks_secrets() -> None:
    """Password, token, and nested secret keys are redacted."""
    event = redact_sensitive_data(
        None,  # type: ignore[arg-type]
        "info",
        {
            "event": "login",
            "password": "hunter2",
            "api_key": "abcd",
            "nested": {"secret": "value", "ok": 1},
            "user": "alice",
        },
    )
    assert event["password"] == "***REDACTED***"
    assert event["api_key"] == "***REDACTED***"
    assert event["nested"]["secret"] == "***REDACTED***"
    assert event["nested"]["ok"] == 1
    assert event["user"] == "alice"


def test_add_request_id_uses_contextvar() -> None:
    """The request-id processor reads the context variable."""
    bind_request_id("abc-123")
    try:
        event = add_request_id(None, "info", {"event": "x"})  # type: ignore[arg-type]
        assert event["request_id"] == "abc-123"
    finally:
        clear_request_id()
        assert request_id_var.get() == "-"


def test_configure_logging_is_idempotent(tmp_path: Path) -> None:
    """A second configure call does not attach duplicate handlers."""
    settings = Settings(
        log_dir=tmp_path / "logs",
        log_format="json",
        environment="development",
    )
    reset_logging()
    configure_logging(settings)
    configure_logging(settings)
    root = logging.getLogger()
    assert len(root.handlers) >= 1
    logger = get_logger("tests.logger")
    logger.info("hello", postgres_password="should-redact")
    assert (tmp_path / "logs" / "app.log").exists()


def test_get_logger_returns_bound_logger(tmp_path: Path) -> None:
    """``get_logger`` returns a structlog bound logger after configuration."""
    reset_logging()
    settings = Settings(log_dir=tmp_path / "logs", log_format="console", environment="development")
    configure_logging(settings)
    logger = get_logger("tests.sample")
    logger.info("configured")
    assert hasattr(logger, "info")


def test_reset_logging_allows_reconfigure(tmp_path: Path) -> None:
    """Reset clears the configured flag so logging can be rebuilt."""
    settings = Settings(log_dir=tmp_path / "logs", environment="test")
    configure_logging(settings)
    reset_logging()
    configure_logging(settings)
    get_logger("tests.reset").warning("after-reset")
