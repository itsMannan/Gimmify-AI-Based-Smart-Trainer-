# Monitoring

Prometheus scrapes `http://api:8000/metrics`. Grafana is provisioned with datasource UID `prometheus` and `dashboards/grafana/dashboards.json`.

API p95 SLO: 80 ms warning / 100 ms critical (`configs/thresholds.yaml`).
