# Demand Forecasting System

Production-grade retail demand forecasting: data pipeline → features → models → inventory optimization → REST API → monitoring.

**Phase 1 (Project Setup) is complete.** Later-phase modules are importable stubs so Docker, CI, and package discovery stay green.

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Project setup, config, logging, Docker, CI | **Complete** |
| 2 | Data pipeline | Next |
| 3 | Feature engineering | Pending |
| 4 | Model training | Pending |
| 5 | Inventory optimization | Pending |
| 6 | REST API (forecast + cache) | Health API live |
| 7 | Monitoring | Scrape + dashboard scaffold |
| 8 | Testing & CI/CD | Phase 1 coverage enforced |
| 9 | Documentation | This README + `docs/` |

## Dataset

Kaggle Retail Store Inventory Forecasting — 73k+ daily store-SKU rows. Set `DATA_RAW_PATH` (default `retail_store_inventory.csv`).

## Quick start

```bash
cd demand-forecasting-system
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# replace every CHANGE_ME value

docker compose up -d --build
docker compose exec api python scripts/setup_db.py
curl -fsS http://localhost:8000/health
```

Generate secrets:

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

| Service | URL |
| --- | --- |
| API docs | http://localhost:8000/docs |
| Health | http://localhost:8000/health |
| Metrics | http://localhost:8000/metrics |
| MLflow | http://localhost:5000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |

```bash
docker compose --profile airflow up -d
```

Local API without Docker:

```bash
export PYTHONPATH=.
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

## Testing

```bash
export PYTHONPATH=.
pytest
ruff check src tests scripts
mypy src/config.py src/logger.py src/api
```

Coverage of `src.config`, `src.logger`, and `src.api` must stay ≥ 80%.

## Configuration

Secrets live in `.env` (never committed). YAML overlays:

- `configs/development.yaml` / `configs/production.yaml`
- `configs/hyperparameters.yaml`
- `configs/thresholds.yaml`

Production refuses placeholder `SECRET_KEY` and `POSTGRES_PASSWORD`. CORS origins and allowed hosts are comma-separated strings in the environment.

## Next

Phase 2 implements `src/data/loader.py`, `validator.py`, `cleaner.py`, `schema.py`, `quality.py`, `scripts/load_kaggle_data.py`, and `dags/data_pipeline.py`.
