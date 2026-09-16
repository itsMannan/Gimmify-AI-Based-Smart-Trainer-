# Troubleshooting

## `/ready` returns 503

Inside Compose, `POSTGRES_HOST` must be `postgres` and `REDIS_HOST` must be `redis` (the API service already overrides these).

## Grafana has no data

Wait ~30s, then confirm `http://localhost:8000/metrics` returns Prometheus text.

## Production boot fails on import

Placeholder `SECRET_KEY` / `POSTGRES_PASSWORD` are rejected when `ENVIRONMENT=production`.
