FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc curl && rm -rf /var/lib/apt/lists/*

# Copy full backend source first, then install
COPY backend/ .

RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir ".[test]"

ENV PYTHONPATH=/app

RUN chmod +x scripts/start.sh

EXPOSE 8000

CMD ["./scripts/start.sh"]
