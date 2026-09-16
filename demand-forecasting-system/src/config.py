"""Application configuration loaded from environment variables and YAML files.

Environment variables always override YAML defaults. Secrets must come from
the process environment (or a local ``.env`` file that is never committed).
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Any, Literal

import yaml
from pydantic import AliasChoices, Field, SecretStr, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

LogFormat = Literal["console", "json"]
EnvironmentName = Literal["development", "staging", "production", "test"]


def get_project_root() -> Path:
    """Return the repository root (parent of the ``src`` package).

    Returns:
        Absolute path to the project root.

    Raises:
        FileNotFoundError: If the project root cannot be resolved.
    """
    try:
        root = Path(__file__).resolve().parent.parent
        if not root.exists():
            raise FileNotFoundError(f"Project root does not exist: {root}")
        return root
    except OSError as exc:  # pragma: no cover - extremely rare filesystem error
        raise FileNotFoundError("Unable to resolve project root") from exc


PROJECT_ROOT: Path = get_project_root()


def _split_csv(value: str | list[str]) -> list[str]:
    """Split a comma-separated string into a stripped list.

    Args:
        value: Raw string or already-parsed list.

    Returns:
        List of non-empty stripped tokens.
    """
    if isinstance(value, list):
        return [item.strip() for item in value if str(item).strip()]
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings(BaseSettings):
    """Strongly-typed process settings for the demand forecasting system.

    Values are read from environment variables (and ``.env``). Nested YAML
    configs under ``configs/`` are loaded separately via ``load_yaml_config``.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
        populate_by_name=True,
        protected_namespaces=(),
        env_ignore_empty=True,
    )

    app_name: str = Field(default="demand-forecasting-system", min_length=1)
    app_version: str = Field(default="1.0.0", min_length=1)
    environment: EnvironmentName = Field(default="development")
    log_level: str = Field(default="INFO")
    log_format: LogFormat = Field(default="console")
    log_dir: Path = Field(default=Path("logs"))
    secret_key: SecretStr = Field(
        default=SecretStr("dev-only-change-me"),
        validation_alias=AliasChoices("SECRET_KEY", "secret_key"),
    )
    allowed_hosts: str = Field(default="localhost,127.0.0.1")

    api_host: str = Field(default="0.0.0.0")
    api_port: int = Field(default=8000, ge=1, le=65535)
    api_workers: int = Field(default=2, ge=1, le=32)
    api_reload: bool = Field(default=False)
    api_cors_origins: str = Field(default="http://localhost:3000,http://localhost:8000")
    api_rate_limit_per_minute: int = Field(default=120, ge=1, le=100_000)
    api_cache_ttl_seconds: int = Field(default=60, ge=1, le=86_400)
    api_request_timeout_seconds: int = Field(default=30, ge=1, le=300)

    postgres_host: str = Field(default="localhost")
    postgres_port: int = Field(default=5432, ge=1, le=65535)
    postgres_user: str = Field(default="forecast")
    postgres_password: SecretStr = Field(default=SecretStr("forecast"))
    postgres_db: str = Field(default="demand_forecasting")
    postgres_pool_size: int = Field(default=5, ge=1, le=100)
    postgres_max_overflow: int = Field(default=10, ge=0, le=100)
    postgres_echo: bool = Field(default=False)

    redis_host: str = Field(default="localhost")
    redis_port: int = Field(default=6379, ge=1, le=65535)
    redis_db: int = Field(default=0, ge=0, le=15)
    redis_password: SecretStr | None = Field(default=None)
    redis_ssl: bool = Field(default=False)

    mlflow_tracking_uri: str = Field(default="http://localhost:5000")
    mlflow_experiment_name: str = Field(default="demand-forecasting")
    mlflow_artifact_root: Path = Field(default=Path("./mlartifacts"))

    data_raw_path: Path = Field(default=Path("retail_store_inventory.csv"))
    data_processed_dir: Path = Field(default=Path("data/processed"))
    data_features_dir: Path = Field(default=Path("data/features"))
    data_date_column: str = Field(default="Date")
    forecast_horizon_days: int = Field(default=14, ge=1, le=365)
    random_seed: int = Field(default=42, ge=0)

    model_artifact_dir: Path = Field(default=Path("models/artifacts"))
    model_default_algorithm: str = Field(default="ensemble")
    model_test_size_days: int = Field(default=28, ge=1, le=365)

    prometheus_enabled: bool = Field(default=True)
    prometheus_metrics_path: str = Field(default="/metrics")
    alert_webhook_url: str | None = Field(default=None)
    drift_psi_threshold: float = Field(default=0.2, ge=0.0, le=1.0)
    drift_kl_threshold: float = Field(default=0.1, ge=0.0)

    @field_validator("log_level")
    @classmethod
    def _normalize_log_level(cls, value: str) -> str:
        """Uppercase and validate the log level name.

        Args:
            value: Raw log level string.

        Returns:
            Canonical log level.

        Raises:
            ValueError: If the level is not a standard logging level.
        """
        normalized = value.upper().strip()
        allowed = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if normalized not in allowed:
            raise ValueError(f"log_level must be one of {sorted(allowed)}, got {value!r}")
        return normalized

    @field_validator("allowed_hosts", "api_cors_origins", mode="before")
    @classmethod
    def _coerce_csv(cls, value: str | list[str]) -> str:
        """Normalize list or CSV input into a comma-separated string.

        Args:
            value: Raw env or constructor value.

        Returns:
            Comma-separated string.
        """
        if isinstance(value, list):
            return ",".join(item.strip() for item in value if str(item).strip())
        return str(value).strip()

    @property
    def allowed_host_list(self) -> list[str]:
        """Return allowed hosts as a list."""
        return _split_csv(self.allowed_hosts)

    @property
    def cors_origin_list(self) -> list[str]:
        """Return CORS origins as a list."""
        return _split_csv(self.api_cors_origins)

    @field_validator("redis_password", mode="before")
    @classmethod
    def _empty_redis_password(cls, value: str | SecretStr | None) -> SecretStr | None:
        """Treat a blank Redis password as unset.

        Args:
            value: Raw password value.

        Returns:
            Secret password or ``None``.
        """
        if value is None:
            return None
        if isinstance(value, SecretStr):
            return value if value.get_secret_value() else None
        return SecretStr(value) if str(value).strip() else None

    @model_validator(mode="after")
    def _production_guards(self) -> Settings:
        """Reject insecure defaults when running in production.

        Returns:
            Validated settings instance.

        Raises:
            ValueError: If production is configured with development secrets.
        """
        if self.environment == "production":
            secret = self.secret_key.get_secret_value()
            if secret in {"", "dev-only-change-me", "CHANGE_ME_TO_A_64_CHAR_RANDOM_STRING"}:
                raise ValueError("SECRET_KEY must be set to a strong value in production")
            if self.postgres_password.get_secret_value() in {"", "CHANGE_ME", "forecast"}:
                raise ValueError("POSTGRES_PASSWORD must be set to a strong value in production")
        return self

    @property
    def is_production(self) -> bool:
        """Return whether the process is running in production."""
        return self.environment == "production"

    @property
    def is_test(self) -> bool:
        """Return whether the process is running under pytest."""
        return self.environment == "test"

    @property
    def postgres_dsn(self) -> str:
        """Return a SQLAlchemy PostgreSQL DSN with the password inlined.

        Returns:
            SQLAlchemy connection URL.
        """
        password = self.postgres_password.get_secret_value()
        return (
            f"postgresql+psycopg2://{self.postgres_user}:{password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def postgres_dsn_safe(self) -> str:
        """Return a log-safe DSN with the password redacted.

        Returns:
            Connection URL with ``***`` instead of the password.
        """
        return (
            f"postgresql+psycopg2://{self.postgres_user}:***"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def redis_url(self) -> str:
        """Return a Redis URL including optional auth and TLS scheme.

        Returns:
            Redis connection URL.
        """
        scheme = "rediss" if self.redis_ssl else "redis"
        password = self.redis_password.get_secret_value() if self.redis_password else ""
        auth = f":{password}@" if password else ""
        return f"{scheme}://{auth}{self.redis_host}:{self.redis_port}/{self.redis_db}"

    def resolve_path(self, path: Path | str) -> Path:
        """Resolve a possibly-relative path against the project root.

        Args:
            path: Path from settings or a caller.

        Returns:
            Absolute path.
        """
        candidate = Path(path)
        if candidate.is_absolute():
            return candidate
        return (PROJECT_ROOT / candidate).resolve()


def load_yaml_file(path: Path) -> dict[str, Any]:
    """Load a YAML mapping from disk.

    Args:
        path: File path.

    Returns:
        Parsed mapping (empty dict if the file is empty).

    Raises:
        FileNotFoundError: If ``path`` does not exist.
        ValueError: If the file cannot be parsed or is not a mapping.
    """
    if not path.exists():
        raise FileNotFoundError(f"YAML config not found: {path}")
    try:
        with path.open("r", encoding="utf-8") as handle:
            payload = yaml.safe_load(handle)
    except yaml.YAMLError as exc:
        raise ValueError(f"Invalid YAML in {path}: {exc}") from exc
    except OSError as exc:
        raise ValueError(f"Unable to read YAML config {path}: {exc}") from exc
    if payload is None:
        return {}
    if not isinstance(payload, dict):
        raise ValueError(f"YAML config {path} must be a mapping, got {type(payload).__name__}")
    return payload


def load_yaml_config(environment: str | None = None) -> dict[str, Any]:
    """Load the environment overlay from ``configs/<environment>.yaml``.

    Args:
        environment: Environment name. Defaults to ``ENVIRONMENT`` or development.

    Returns:
        Parsed YAML mapping.

    Raises:
        FileNotFoundError: If the overlay file is missing.
        ValueError: If the file is invalid.
    """
    env_name = (environment or os.getenv("ENVIRONMENT", "development")).strip().lower()
    if env_name == "test":
        env_name = "development"
    path = PROJECT_ROOT / "configs" / f"{env_name}.yaml"
    return load_yaml_file(path)


def load_hyperparameters() -> dict[str, Any]:
    """Load model hyperparameters from ``configs/hyperparameters.yaml``.

    Returns:
        Hyperparameter mapping keyed by algorithm name.

    Raises:
        FileNotFoundError: If the file is missing.
        ValueError: If the file is invalid.
    """
    return load_yaml_file(PROJECT_ROOT / "configs" / "hyperparameters.yaml")


def load_thresholds() -> dict[str, Any]:
    """Load quality, drift, and inventory thresholds from YAML.

    Returns:
        Threshold mapping.

    Raises:
        FileNotFoundError: If the file is missing.
        ValueError: If the file is invalid.
    """
    return load_yaml_file(PROJECT_ROOT / "configs" / "thresholds.yaml")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a process-wide cached ``Settings`` instance.

    Returns:
        Loaded settings.

    Raises:
        ValidationError: If required environment values are invalid.
    """
    return Settings()


def clear_settings_cache() -> None:
    """Clear the cached settings object (used by tests)."""
    get_settings.cache_clear()
