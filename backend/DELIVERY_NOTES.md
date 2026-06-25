# Delivery Notes — LaundryKhalaas Backend

**Delivery date:** 2026-06-26
**Environment:** Hosted on Railway (live) + local verification mode (MOCK_LLM=true)

---

## Hosted links (live, no Docker required)

| Endpoint | URL |
|----------|-----|
| Health check | https://laundrykhalaas-api-production.up.railway.app/health |
| API docs (Swagger) | https://laundrykhalaas-api-production.up.railway.app/docs |
| System status | https://laundrykhalaas-api-production.up.railway.app/verification/status |
| Classifier demo | https://laundrykhalaas-api-production.up.railway.app/verification/run-classifier-demo (POST) |
| DB trigger demo | https://laundrykhalaas-api-production.up.railway.app/verification/invalid-transition-demo (POST) |

---

## Hosted verification (no setup required)

Open these in a browser or use the Swagger UI at `/docs`:

1. **Health**: `GET /health` → `{"status":"ok"}`
2. **System status**: `GET /verification/status` → JSON showing DB connected, Redis connected, pgvector enabled, RLS enabled on orders/messages/customer_addresses, llm_mode: offline_verification
3. **Classifier demo**: `POST /verification/run-classifier-demo` → runs classifier end-to-end: privacy filter → MockProvider → all 5 fields written to DB → result returned
4. **DB trigger demo**: `POST /verification/invalid-transition-demo` → attempts `created → delivered` on the real orders table, catches the PostgreSQL trigger, returns `{"invalid_transition_rejected":true,"rejected_by":"postgres_trigger"}`

Use Swagger UI to run POST requests without curl.

---

## Local verification (technical reviewers)

**Requirements:** Docker Desktop with Compose v2

```bash
cd backend
cp .env.example .env
docker compose up --build
```

Wait for all services to be healthy (postgres, redis, backend, celery_worker, adminer).
The backend container automatically runs `alembic upgrade head` on startup.

**Run all tests (in a second terminal):**

```bash
docker compose exec backend python -m pytest tests/ -v
```

**Expected output:**

```
tests/test_health.py::test_health_returns_200                              PASSED
tests/test_schema.py::test_required_tables_exist                           PASSED
tests/test_schema.py::test_pgvector_extension_enabled                      PASSED
tests/test_schema.py::test_rls_enabled_on_required_tables                  PASSED
tests/test_order_transition.py::test_invalid_transition_rejected_by_db     PASSED
tests/test_order_transition.py::test_valid_transition_succeeds             PASSED
tests/test_llm.py::test_mock_provider_returns_response_without_api_key    PASSED
tests/test_llm.py::test_mock_provider_classifier_output_is_valid_json     PASSED
tests/test_llm.py::test_llm_service_writes_ai_action_log                  PASSED
tests/test_redis_ceiling.py::test_redis_ceiling_blocks_when_exceeded       PASSED
tests/test_redis_ceiling.py::test_redis_counter_increments_per_call        PASSED
tests/test_classifier.py::test_classifier_populates_all_five_fields        PASSED
tests/test_classifier.py::test_classifier_deterministic_values             PASSED
tests/test_privacy.py::test_uae_international_phone_is_redacted           PASSED
tests/test_privacy.py::test_compact_uae_phone_is_redacted                 PASSED
tests/test_privacy.py::test_local_uae_phone_is_redacted                   PASSED
tests/test_privacy.py::test_email_is_redacted                             PASSED
tests/test_privacy.py::test_message_with_no_pii_is_unchanged              PASSED
tests/test_privacy.py::test_privacy_filter_used_before_llm_prompt_assembly PASSED

19 passed in X.XXs
```

No `ANTHROPIC_API_KEY` is required. `MOCK_LLM=true` is set in `.env.example`.

**Browse database (Adminer):** http://localhost:8080
- System: PostgreSQL
- Server: postgres
- Username: laundrykhalaas
- Password: laundrykhalaas_dev
- Database: laundrykhalaas

**Browse API docs:** http://localhost:8000/docs

---

## Verification checklist

- [x] Health endpoint returns 200
- [x] PostgreSQL schema applied (10 tables)
- [x] pgvector extension enabled
- [x] Alembic migrations apply cleanly from scratch
- [x] RLS enabled on `orders`, `messages`, `customer_addresses`
- [x] Invalid order transition rejected by DB trigger (`created → delivered`)
- [x] Valid order transition succeeds (`created → confirmed`)
- [x] LLM service works without Anthropic API key (`MOCK_LLM=true`)
- [x] MockProvider returns deterministic classifier output
- [x] Redis token ceiling enforced atomically (per-conversation counter)
- [x] Ceiling blocks further calls once exceeded (raises `TokenCeilingExceededError`)
- [x] AIActionLog records every LLM call
- [x] CostTracking updated per conversation
- [x] Classifier writes all five fields: intent, sentiment, sentiment_score, sales_stage_delta, topic
- [x] Classifier values are deterministic and match spec (booking_request / positive / 0.85 / interest / laundry_pickup)
- [x] Phone numbers are redacted before LLM prompt assembly (`[PHONE_REDACTED]`)
- [x] Email addresses are redacted (`[EMAIL_REDACTED]`)
- [x] 19 pytest tests pass — no external API keys required
- [x] Hosted on Railway (live URL above)

---

## Spec gaps found (for founder decision)

1. **Section D.4 classifier prompt** — The exact prompt text from Section D.4 was not found in this repository. A structurally-compliant placeholder is used in `app/tasks/classifier.py`. Replace `CLASSIFIER_PROMPT` with the exact spec text when available. The five output fields and their types match the spec exactly.

2. **RLS policy scope** — Current RLS policies use `USING (true)` (service-level access). Market-scoped enforcement (`USING (market_id = current_setting('app.current_market_id')::uuid)`) requires JWT context injection per request — a founder decision on auth architecture is needed before this can be tightened.

3. **Token estimation** — Uses `len(text) // 4` (standard approximation). The spec does not specify a tokenizer. Replace with `tiktoken` if precise billing is required — this is a founder decision.

4. **Cost ceiling action** — The spec says to enforce a ceiling but does not specify whether to silently drop, return an error, or notify the operator. Currently raises `TokenCeilingExceededError` (HTTP 429 if surfaced). Founder decision needed on the UX of ceiling enforcement.

---

## What is deferred (and why)

| Feature | Reason deferred |
|---------|----------------|
| WhatsApp channel integration | Requires Twilio/Meta account credentials — outside Stage 1 scope |
| JWT authentication | Auth architecture needs founder decision (see RLS gap above) |
| Payment processing | Stage 3+ in the spec |
| Full customer booking API | Stage 2+ |
| Per-user RLS enforcement | Depends on JWT decision |
| `tiktoken` exact token counting | Founder decision needed (see gap #3) |

---

## Architecture decisions

- **asyncpg** for FastAPI async performance; **psycopg2** for Alembic sync migrations
- **Celery tasks** use `asyncio.run()` to call the async LLM service — avoids duplicating service logic in a sync Celery context
- **NullPool** in pytest fixtures — prevents cross-event-loop connection reuse between async tests
- **MockProvider** returns fixed deterministic JSON — classifier tests assert exact values, not just field presence
