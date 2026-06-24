# Delivery Notes — LaundryKhalaas Backend

**Delivery date:** 2026-06-25
**Environment:** Local verification mode (MOCK_LLM=true)

---

## Hosted links

> Deployment requires Railway authentication. See **Deployment** section below.
> This file will be updated with live URLs once Railway auth is completed.

| Endpoint | URL |
|----------|-----|
| Health check | `<RAILWAY_URL>/health` |
| API docs | `<RAILWAY_URL>/docs` |
| Verification status | `<RAILWAY_URL>/verification/status` |
| Classifier demo | `<RAILWAY_URL>/verification/run-classifier-demo` (POST) |

---

## Founder verification (no Docker required)

Once deployed, open these links in any browser:

1. **Health**: `GET <RAILWAY_URL>/health` → `{"status":"ok"}`
2. **API Docs**: `GET <RAILWAY_URL>/docs` → Swagger UI
3. **System status**: `GET <RAILWAY_URL>/verification/status` → JSON showing DB, Redis, pgvector, RLS
4. **Classifier demo**: `POST <RAILWAY_URL>/verification/run-classifier-demo` → end-to-end demo result

Use the Swagger UI at `/docs` to run the POST without needing curl or Postman.

---

## Verification checklist

- [x] Health endpoint returns 200
- [x] PostgreSQL schema applied (10 tables)
- [x] pgvector extension enabled
- [x] Alembic migrations apply cleanly from scratch
- [x] RLS enabled on `orders`, `messages`, `customer_addresses`
- [x] Invalid order transition rejected by DB trigger (`created → delivered` raises exception)
- [x] Valid order transition succeeds (`created → confirmed`)
- [x] LLM offline provider works without Anthropic API key
- [x] MockProvider returns deterministic classifier output
- [x] Redis token ceiling enforced atomically
- [x] AIActionLog records every LLM call
- [x] CostTracking updated per conversation
- [x] Classifier writes all five fields: intent, sentiment, sentiment_score, sales_stage_delta, topic
- [x] Phone numbers are redacted before LLM prompt assembly (`[PHONE_REDACTED]`)
- [x] Email addresses are redacted (`[EMAIL_REDACTED]`)
- [x] pytest passes — 7 test modules, no external API keys required
- [ ] Hosted Railway URL (pending auth — see below)
- [ ] Migrations run on hosted DB (pending auth)

---

## Deployment instructions

### Step 1 — Railway authentication (requires your action)

Railway requires a browser-based login. Run this command:

```bash
railway login
```

This will open a browser. Authorize with your Railway account.

### Step 2 — Create Railway project (run after login)

```bash
cd D:\Projects\LaundryKhalaasPrototype
railway init
# Name the project: laundrykhalaas-backend
```

### Step 3 — Add PostgreSQL and Redis services

In the Railway dashboard (https://railway.app/dashboard):
1. Open your project
2. Click "New Service" → "Database" → PostgreSQL
3. Click "New Service" → "Database" → Redis

### Step 4 — Set environment variables on Railway

In Railway dashboard → your backend service → Variables, add:
```
APP_ENV=production
DEBUG=false
MOCK_LLM=true
ANTHROPIC_API_KEY=
ANTHROPIC_COMPLEX_MODEL=claude-sonnet-4-6
ANTHROPIC_ROUTINE_MODEL=claude-haiku-4-5-20251001
LLM_PER_MESSAGE_TOKEN_CAP=2000
LLM_CONVERSATION_TOKEN_CEILING=20000
```
Railway automatically injects `DATABASE_URL` and `REDIS_URL` from linked services.

### Step 5 — Deploy backend service

```bash
cd backend
railway up
```

### Step 6 — Run migrations on hosted database

```bash
railway run alembic upgrade head
```

### Step 7 — Deploy Celery worker

Create a second service in Railway from the same repo, with start command:
```
celery -A app.core.celery_app:celery_app worker --loglevel=info --concurrency=2
```

---

## Local verification

```bash
cp .env.example .env
docker compose up --build
docker compose exec backend alembic upgrade head
docker compose exec backend pytest -v
```

Expected output: all tests pass.

---

## Test results (local)

```
tests/test_health.py          PASSED
tests/test_schema.py          PASSED  (tables, pgvector, RLS)
tests/test_order_transition.py PASSED (DB trigger rejects created→delivered)
tests/test_llm.py             PASSED  (MockProvider, AIActionLog)
tests/test_redis_ceiling.py   PASSED  (atomic Redis counter)
tests/test_classifier.py      PASSED  (5 fields, deterministic values)
tests/test_privacy.py         PASSED  (phone/email redaction)
```

---

## Spec gaps found

1. **Section D.4 classifier prompt** — the exact prompt text from Section D.4 was not found in this repository. A functional placeholder prompt is used in `app/tasks/classifier.py`. Replace `CLASSIFIER_PROMPT` with the exact spec text when available.

---

## Architecture decisions

- **asyncpg** for FastAPI async performance; **psycopg2** for Alembic sync migrations
- **Celery** tasks use `asyncio.run()` to call the async LLM service — avoids duplicating service logic in sync context
- **RLS policies** are permissive (`USING (true)`) to allow service-level access. Market-scoped policies require JWT authentication context, which is outside Stage 1 scope.
- **Token estimation** uses `len(text) // 4` — a standard approximation. Replace with `tiktoken` if precise billing is required.
- **MockProvider** is named `MockProvider` per spec compliance requirement. It is described in all documentation as "offline deterministic provider."

---

## What is not implemented (deferred)

- Live WhatsApp channel integration
- JWT authentication + per-user RLS enforcement
- Payment processing
- Full customer booking API
- Automated market/tenant provisioning
