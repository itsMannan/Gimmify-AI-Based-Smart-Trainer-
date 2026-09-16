"""Structured logging for the demand forecasting system.

Production emits JSON logs; development uses a human-readable console
renderer. Secrets matching known key names are redacted.
"""

from __future__ import annotations

import logging
import logging.config
import re
import sys
from contextvars import ContextVar
from pathlib import Path
from typing import Any

import structlog
from structlog.types import EventDict, Processor, WrappedLogger

from src.config import Settings, get_settings

_CONFIGURED: bool = False
request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

_SENSITIVE_KEY_PATTERN = re.compile(
    r"(password|secret|token|api[_-]?key|authorization|credential|fernet)",
    re.IGNORECASE,
)


def _redact_value(_key: str, value: Any) -> str:
    """Return a redacted placeholder for a sensitive value.

    Args:
        _key: Field name (unused, kept for call-site symmetry).
        value: Original value.

    Returns:
        Redaction marker.
    """
    del _key, value
    return "***REDACTED***"


def redact_sensitive_data(
    _logger: WrappedLogger,
    _method: str,
    event_dict: EventDict,
) -> EventDict:
    """Structlog processor that redacts secrets in log event dictionaries.

    Args:
        _logger: Bound logger (unused).
        _method: Log method name (unused).
        event_dict: Event payload.

    Returns:
        Event payload with sensitive keys redacted.
    """
    del _logger, _method
    redacted: EventDict = {}
    for key, value in event_dict.items():
        if _SENSITIVE_KEY_PATTERN.search(str(key)):
            redacted[key] = _redact_value(str(key), value)
        elif isinstance(value, dict):
            redacted[key] = {
                inner_key: (
                    _redact_value(str(inner_key), inner_val)
                    if _SENSITIVE_KEY_PATTERN.search(str(inner_key))
                    else inner_val
                )
                for inner_key, inner_val in value.items()
            }
        else:
            redacted[key] = value
    return redacted


def add_request_id(
    _logger: WrappedLogger,
    _method: str,
    event_dict: EventDict,
) -> EventDict:
    """Attach the current request ID from contextvars, if present.

    Args:
        _logger: Bound logger (unused).
        _method: Log method name (unused).
        event_dict: Event payload.

    Returns:
        Event payload including ``request_id``.
    """
    del _logger, _method
    event_dict["request_id"] = request_id_var.get()
    return event_dict


def add_app_context(settings: Settings) -> Processor:
    """Build a processor that injects application name and environment.

    Args:
        settings: Loaded application settings.

    Returns:
        Structlog processor.
    """

    def processor(
        _logger: WrappedLogger,
        _method: str,
        event_dict: EventDict,
    ) -> EventDict:
        """Inject static application fields into every log event.

        Args:
            _logger: Bound logger (unused).
            _method: Log method name (unused).
            event_dict: Event payload.

        Returns:
            Event payload with application context.
        """
        del _logger, _method
        event_dict.setdefault("app", settings.app_name)
        event_dict.setdefault("environment", settings.environment)
        event_dict.setdefault("version", settings.app_version)
        return event_dict

    return processor


def _ensure_log_directory(path: Path) -> None:
    """Create the log directory if it does not already exist.

    Args:
        path: Directory that should hold log files.

    Raises:
        OSError: If the directory cannot be created.
    """
    try:
        path.mkdir(parents=True, exist_ok=True)
    except OSError:
        logging.getLogger("src.logger").exception("Failed to create log directory %s", path)
        raise


def configure_logging(settings: Settings | None = None) -> None:
    """Configure stdlib logging and structlog for the process.

    Safe to call multiple times; subsequent calls are no-ops unless tests
    call :func:`reset_logging`.

    Args:
        settings: Optional settings override. Defaults to :func:`get_settings`.

    Raises:
        OSError: If the log directory cannot be created in file-logging mode.
    """
    global _CONFIGURED
    if _CONFIGURED:
        return

    resolved = settings or get_settings()
    use_json = resolved.log_format == "json" or resolved.is_production
    log_level = getattr(logging, resolved.log_level, logging.INFO)

    shared_processors: list[Processor] = [
        structlog.contextvars.merge_contextvars,
        add_request_id,
        add_app_context(resolved),
        redact_sensitive_data,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]

    if use_json:
        renderer: Processor = structlog.processors.JSONRenderer()
    else:
        renderer = structlog.dev.ConsoleRenderer(colors=sys.stderr.isatty())

    structlog.configure(
        processors=[
            *shared_processors,
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            renderer,
        ],
        foreign_pre_chain=shared_processors,
    )

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(formatter)
    stream_handler.setLevel(log_level)

    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(stream_handler)
    root.setLevel(log_level)

    if not resolved.is_test:
        try:
            log_dir = resolved.resolve_path(resolved.log_dir)
            _ensure_log_directory(log_dir)
            file_handler = logging.FileHandler(log_dir / "app.log", encoding="utf-8")
            file_handler.setFormatter(formatter)
            file_handler.setLevel(log_level)
            root.addHandler(file_handler)
        except OSError:
            root.exception("File logging disabled because the log directory is not writable")

    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("mlflow").setLevel(logging.WARNING)

    _CONFIGURED = True


def reset_logging() -> None:
    """Reset logging configuration (intended for tests only)."""
    global _CONFIGURED
    _CONFIGURED = False
    structlog.reset_defaults()
    logging.getLogger().handlers.clear()


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """Return a bound structured logger for ``name``.

    Configures logging on first use if the application has not already
    called :func:`configure_logging`.

    Args:
        name: Logger name, typically ``__name__``.

    Returns:
        Bound structlog logger.
    """
    if not _CONFIGURED:
        try:
            configure_logging()
        except Exception:
            logging.basicConfig(level=logging.INFO, stream=sys.stdout)
            logging.getLogger(__name__).exception(
                "Falling back to basicConfig; structured logging failed to initialize"
            )
    return structlog.get_logger(name)


def bind_request_id(request_id: str) -> None:
    """Store the current request ID in a context variable.

    Args:
        request_id: Correlation identifier from middleware.
    """
    request_id_var.set(request_id)


def clear_request_id() -> None:
    """Reset the request ID context variable to the default."""
    request_id_var.set("-")
