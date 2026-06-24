# LaundryKhalaas Backend

FastAPI backend for the LaundryKhalaas operations platform.

## What was built

- **FastAPI** application with async SQLAlchemy 2.x
- **PostgreSQL** schema with 10 tables, Alembic migrations
- **DB-level order state machine** — PostgreSQL trigger rejects invalid transitions
- **pgvector** extension enabled
- **Row Level Security** on `orders`, `messages`, `customer_addresses`
- **LLM abstraction** — `MockProvider` (offline) + `AnthropicProvider` (live)
- **Redis token ceilings** — atomic per-conversation counters (Layer 1 + Layer 2)
- **AIActionLog** — every LLM call is persisted
- **Conversation classifier** — Celery task with privacy filter
- **Privacy filter** — phone/email redacted before any LLM prompt
- **7 pytest test modules** — all pass in local verification mode (no external keys)
- **Adminer** — visual DB browser on port 8080

---

## Hosted verification (no Docker required)

| Link | Purpose |
|------|---------|
| `<RAILWAY_URL>/health` | Health check — must return `{"status":"ok"}` |
| `<RAILWAY_URL>/docs` | Interactive API docs |
| `<RAILWAY_URL>/verification/status` | Full system status JSON |
| `<RAILWAY_URL>/verification/run-classifier-demo` | POST — runs end-to-end classifier demo |

> Replace `<RAILWAY_URL>` with the URL in `DELIVERY_NOTES.md` once deployed.

---

## Local verification (technical reviewers)

```bash
cp .env.example .env
docker compose up --build
```

Run migrations (first time or after restart):
```bash
docker compose exec backend alembic upgrade head
```

Run all tests:
```bash
docker compose exec backend pytest -v
```

Browse API docs: http://localhost:8000/docs

Browse database (Adminer): http://localhost:8080
- System: PostgreSQL
- Server: postgres
- Username: laundrykhalaas
- Password: laundrykhalaas_dev
- Database: laundrykhalaas

---

## Architecture

```
backend/
├── app/
│   ├── api/          — FastAPI routers (health, verification)
│   ├── core/         — Config (pydantic-settings), Celery app
│   ├── db/           — SQLAlchemy async engine + session factory
│   ├── models/       — SQLAlchemy ORM models (all tables)
│   ├── schemas/      — Pydantic v2 schemas
│   ├── services/
│   │   ├── llm/      — LLMProvider base, MockProvider, AnthropicProvider, LLMService
│   │   └── privacy.py — PII redaction (phone, email)
│   ├── tasks/        — Celery tasks (classifier)
│   └── main.py       — FastAPI app
├── alembic/          — Migrations
├── tests/            — pytest suite
├── scripts/start.sh  — Migration + server start
├── Dockerfile
└── railway.json
```

---

## Environment variables

See `.env.example` in the repository root.

Key flags:
- `MOCK_LLM=true` — uses offline deterministic provider (default, no API key needed)
- `ANTHROPIC_API_KEY=` — leave empty for verification mode
- `APP_ENV=development`

---

## Spec gaps

- **Section D.4 classifier prompt** — the exact prompt text from Section D.4 of the build spec was not found in this repository. A functional placeholder prompt is used. Replace `CLASSIFIER_PROMPT` in `app/tasks/classifier.py` with the exact spec text when available.

## What was deferred

- Live WhatsApp integration
- Payment processing
- Full customer-facing API
- Marketing automation
- Multi-tenant RLS policies (current policies allow service-level access; market-scoped policies require authenticated JWT context)

---

## Notes

- No production secrets are committed. `.env.example` contains safe local development values only.
- Verification mode works without any external API keys (`MOCK_LLM=true`).
- The frontend remains deployed on Vercel separately. The backend is deployed on Railway because it requires Celery workers, Redis, and persistent PostgreSQL — none of which are suitable for Vercel.
