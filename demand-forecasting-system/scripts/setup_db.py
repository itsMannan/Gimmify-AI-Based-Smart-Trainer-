"""Create PostgreSQL schemas and core tables for the forecasting system.

Usage:
    python scripts/setup_db.py
"""

from __future__ import annotations

import sys
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
from sqlalchemy.exc import SQLAlchemyError

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from src.config import get_settings  # noqa: E402
from src.logger import configure_logging, get_logger  # noqa: E402

logger = get_logger(__name__)

SCHEMA_STATEMENTS: tuple[str, ...] = (
    "CREATE SCHEMA IF NOT EXISTS forecasting",
    "CREATE SCHEMA IF NOT EXISTS mlops",
    "CREATE SCHEMA IF NOT EXISTS monitoring",
    """
    CREATE TABLE IF NOT EXISTS forecasting.raw_sales (
        id              BIGSERIAL PRIMARY KEY,
        event_date      DATE NOT NULL,
        store_id        TEXT NOT NULL,
        product_id      TEXT NOT NULL,
        category        TEXT,
        region          TEXT,
        inventory_level INTEGER,
        units_sold      INTEGER,
        units_ordered   INTEGER,
        demand_forecast DOUBLE PRECISION,
        price           DOUBLE PRECISION,
        discount        DOUBLE PRECISION,
        weather_condition TEXT,
        holiday_promotion SMALLINT,
        competitor_pricing DOUBLE PRECISION,
        seasonality     TEXT,
        ingested_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (event_date, store_id, product_id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS forecasting.features (
        id              BIGSERIAL PRIMARY KEY,
        event_date      DATE NOT NULL,
        store_id        TEXT NOT NULL,
        product_id      TEXT NOT NULL,
        feature_version TEXT NOT NULL,
        payload         JSONB NOT NULL,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (event_date, store_id, product_id, feature_version)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS forecasting.predictions (
        id              BIGSERIAL PRIMARY KEY,
        event_date      DATE NOT NULL,
        store_id        TEXT NOT NULL,
        product_id      TEXT NOT NULL,
        horizon_days    INTEGER NOT NULL,
        model_name      TEXT NOT NULL,
        model_version   TEXT NOT NULL,
        yhat            DOUBLE PRECISION NOT NULL,
        yhat_lower      DOUBLE PRECISION,
        yhat_upper      DOUBLE PRECISION,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS forecasting.recommendations (
        id              BIGSERIAL PRIMARY KEY,
        store_id        TEXT NOT NULL,
        product_id      TEXT NOT NULL,
        as_of_date      DATE NOT NULL,
        reorder_point   DOUBLE PRECISION NOT NULL,
        safety_stock    DOUBLE PRECISION NOT NULL,
        recommended_qty DOUBLE PRECISION NOT NULL,
        rationale       JSONB,
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS mlops.model_versions (
        id              BIGSERIAL PRIMARY KEY,
        algorithm       TEXT NOT NULL,
        mlflow_run_id   TEXT NOT NULL UNIQUE,
        version_label   TEXT NOT NULL,
        stage           TEXT NOT NULL DEFAULT 'staging',
        metrics         JSONB,
        registered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS monitoring.drift_events (
        id              BIGSERIAL PRIMARY KEY,
        detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        feature_name    TEXT NOT NULL,
        metric          TEXT NOT NULL,
        value           DOUBLE PRECISION NOT NULL,
        threshold       DOUBLE PRECISION NOT NULL,
        severity        TEXT NOT NULL
    )
    """,
    "CREATE INDEX IF NOT EXISTS idx_raw_sales_store_product_date ON forecasting.raw_sales (store_id, product_id, event_date)",
    "CREATE INDEX IF NOT EXISTS idx_predictions_lookup ON forecasting.predictions (store_id, product_id, event_date)",
)


def build_engine() -> Engine:
    """Create a SQLAlchemy engine from process settings.

    Returns:
        Connected engine.

    Raises:
        SQLAlchemyError: If the engine cannot be created.
    """
    settings = get_settings()
    try:
        engine = create_engine(
            settings.postgres_dsn,
            pool_pre_ping=True,
            pool_size=settings.postgres_pool_size,
            max_overflow=settings.postgres_max_overflow,
            echo=settings.postgres_echo,
        )
        logger.info("db_engine_created", dsn=settings.postgres_dsn_safe)
        return engine
    except SQLAlchemyError:
        logger.exception("db_engine_create_failed", dsn=settings.postgres_dsn_safe)
        raise


def apply_schema(engine: Engine) -> None:
    """Apply schema and table DDL.

    Args:
        engine: SQLAlchemy engine.

    Raises:
        SQLAlchemyError: If a statement fails.
    """
    try:
        with engine.begin() as connection:
            for statement in SCHEMA_STATEMENTS:
                connection.execute(text(statement))
        logger.info("db_schema_applied", statements=len(SCHEMA_STATEMENTS))
    except SQLAlchemyError:
        logger.exception("db_schema_apply_failed")
        raise


def main() -> int:
    """CLI entry point.

    Returns:
        Process exit code (0 on success, 1 on failure).
    """
    try:
        settings = get_settings()
        configure_logging(settings)
        engine = build_engine()
        apply_schema(engine)
        engine.dispose()
        logger.info("setup_db_complete")
        return 0
    except Exception:
        logger.exception("setup_db_failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
