# Deployment

```bash
cd demand-forecasting-system
cp .env.example .env
docker compose up -d --build
docker compose exec api python scripts/setup_db.py
curl -fsS http://localhost:8000/health
```

Production image: multi-stage, non-root `appuser` (uid 10001), `tini`, Gunicorn + Uvicorn workers, `GET /health` healthcheck.

Required production env: `ENVIRONMENT=production`, strong `SECRET_KEY` and `POSTGRES_PASSWORD`, reachable `POSTGRES_HOST` / `REDIS_HOST`.
