-- Bootstrap extensions and application role defaults.
-- The database and user are created from POSTGRES_* env vars.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

CREATE SCHEMA IF NOT EXISTS forecasting;
CREATE SCHEMA IF NOT EXISTS mlops;
CREATE SCHEMA IF NOT EXISTS monitoring;

GRANT USAGE ON SCHEMA forecasting TO CURRENT_USER;
GRANT USAGE ON SCHEMA mlops TO CURRENT_USER;
GRANT USAGE ON SCHEMA monitoring TO CURRENT_USER;
