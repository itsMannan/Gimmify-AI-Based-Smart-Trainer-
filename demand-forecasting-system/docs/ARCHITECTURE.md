# Architecture

Phase 1 delivers the runtime substrate: configuration, logging, API process, PostgreSQL, Redis, MLflow, Prometheus, and Grafana.

```
Clients / CI
    │
    ▼
┌─────────────┐     ┌──────────┐     ┌────────────┐
│ FastAPI     │────▶│ Redis    │     │ PostgreSQL │
│ /health     │     │ cache    │     │ schemas    │
│ /metrics    │     └──────────┘     └────────────┘
└──────┬──────┘
       │ scrape
       ▼
┌─────────────┐     ┌──────────┐     ┌────────────┐
│ Prometheus  │────▶│ Grafana  │     │ MLflow     │
└─────────────┘     └──────────┘     └────────────┘
```

See [DEPLOYMENT.md](DEPLOYMENT.md) and [API.md](API.md).
