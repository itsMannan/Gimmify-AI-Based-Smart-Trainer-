"""End-to-end smoke tests for Phase 1 (application boot + health)."""

from __future__ import annotations

from fastapi.testclient import TestClient

from src.api.main import app
from src.config import get_settings, load_hyperparameters, load_thresholds, load_yaml_config


def test_phase1_stack_contract() -> None:
    """Config, YAML overlays, and the API health surface all work together."""
    settings = get_settings()
    overlay = load_yaml_config(settings.environment)
    hypers = load_hyperparameters()
    thresholds = load_thresholds()

    assert overlay["app"]["name"]
    assert "xgboost" in hypers
    assert thresholds["api"]["latency_p95_ms_critical"] == 100

    with TestClient(app) as client:
        health = client.get("/health")
        assert health.status_code == 200
        assert health.json()["status"] == "ok"
        assert float(health.headers["X-Response-Time-ms"]) < 100
