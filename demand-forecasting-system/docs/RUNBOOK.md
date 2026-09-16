# Runbook

1. Grafana → Demand Forecasting — API Overview. p95 should stay under 100 ms.
2. Confirm `up{job="demand-forecasting-api"} == 1`.
3. `docker compose logs api --since=24h` for `unhandled_exception`.
