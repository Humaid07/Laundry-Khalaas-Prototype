FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc curl dos2unix && rm -rf /var/lib/apt/lists/*

COPY backend/ .

RUN dos2unix scripts/start.sh && \
    pip install --upgrade pip "setuptools>=68" wheel && \
    pip install --no-cache-dir -e ".[test]"

ENV PYTHONPATH=/app

RUN chmod +x scripts/start.sh

EXPOSE 8000

CMD ["./scripts/start.sh"]
