#!/bin/bash
set -e

export PYTHONPATH=/app

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting FastAPI server on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
