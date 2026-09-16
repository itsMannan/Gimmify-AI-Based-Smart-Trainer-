# API

Base URL (local): `http://localhost:8000`

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness |
| GET | `/live` | Liveness alias |
| GET | `/ready` | Postgres + Redis readiness |
| GET | `/metrics` | Prometheus scrape |

All responses include `X-Request-ID` and `X-Response-Time-ms`. Forecast endpoints land in Phase 6.
