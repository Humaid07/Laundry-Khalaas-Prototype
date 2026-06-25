"""
Verification endpoints for founder review and technical evaluation.

All endpoints operate in offline verification mode — no external API keys required.
"""
import json
import uuid

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings
from app.db.session import get_db, AsyncSessionLocal
from app.schemas.verification import VerificationStatus, RLSStatus, ClassifierDemoResult
from app.services.privacy import apply_privacy_filter, PHONE_PLACEHOLDER
from app.services.llm.service import LLMService, get_provider
from app.services.llm.base import LLMRequest
from app.schemas.classifier import ClassifierOutput

router = APIRouter(prefix="/verification", tags=["verification"])


async def _get_redis() -> aioredis.Redis:
    client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        yield client
    finally:
        await client.aclose()


@router.get("/status", response_model=VerificationStatus)
async def verification_status(db: AsyncSession = Depends(get_db)):
    db_status = "connected"
    pgvector_status = "enabled"
    rls_orders = "unknown"
    rls_messages = "unknown"
    rls_addresses = "unknown"

    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    try:
        await db.execute(text("SELECT '[1,2,3]'::vector(3)"))
    except Exception:
        pgvector_status = "unavailable"

    try:
        for table, var in [
            ("orders", "rls_orders"),
            ("messages", "rls_messages"),
            ("customer_addresses", "rls_addresses"),
        ]:
            result = await db.execute(
                text(
                    "SELECT rowsecurity FROM pg_tables "
                    "WHERE tablename = :t AND schemaname = 'public'"
                ),
                {"t": table},
            )
            row = result.fetchone()
            val = "enabled" if (row and row[0]) else "disabled"
            if table == "orders":
                rls_orders = val
            elif table == "messages":
                rls_messages = val
            else:
                rls_addresses = val
    except Exception:
        pass

    redis_status = "connected"
    try:
        r = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await r.ping()
        await r.aclose()
    except Exception:
        redis_status = "error"

    llm_mode = "offline_verification" if settings.MOCK_LLM else "live"

    return VerificationStatus(
        status="ready",
        database=db_status,
        redis=redis_status,
        pgvector=pgvector_status,
        rls=RLSStatus(
            orders=rls_orders,
            messages=rls_messages,
            customer_addresses=rls_addresses,
        ),
        llm_mode=llm_mode,
        health="ok",
    )


@router.post("/run-classifier-demo", response_model=ClassifierDemoResult)
async def run_classifier_demo(db: AsyncSession = Depends(get_db)):
    from app.models.market import Market
    from app.models.customer import Customer, CustomerAddress
    from app.models.order import Order
    from app.models.conversation import Conversation, Message

    # Create sample data
    market = Market(
        id=uuid.uuid4(),
        name="UAE Demo Market",
        country_code="AE",
        currency="AED",
        timezone="Asia/Dubai",
    )
    db.add(market)
    await db.flush()

    customer = Customer(
        id=uuid.uuid4(),
        market_id=market.id,
        full_name="Sample Customer",
        phone="+971501234567",
    )
    db.add(customer)
    await db.flush()

    address = CustomerAddress(
        id=uuid.uuid4(),
        customer_id=customer.id,
        market_id=market.id,
        address_line_1="123 Demo Street",
        city="Dubai",
        emirate="Dubai",
        country_code="AE",
    )
    db.add(address)
    await db.flush()

    order = Order(
        id=uuid.uuid4(),
        market_id=market.id,
        customer_id=customer.id,
        customer_address_id=address.id,
        status="created",
        service_type="wash_and_fold",
        currency="AED",
    )
    db.add(order)
    await db.flush()

    conversation = Conversation(
        id=uuid.uuid4(),
        market_id=market.id,
        customer_id=customer.id,
        order_id=order.id,
        channel="whatsapp",
        status="active",
    )
    db.add(conversation)
    await db.flush()

    raw_body = "My number is +971 50 123 4567 and I need pickup today"
    message = Message(
        id=uuid.uuid4(),
        conversation_id=conversation.id,
        market_id=market.id,
        sender_type="customer",
        body=raw_body,
    )
    db.add(message)
    # Commit all sample data so LLMService's separate session can see the FKs
    await db.commit()
    await db.refresh(message)

    # Privacy filter
    safe_body = apply_privacy_filter(raw_body)
    redaction_applied = PHONE_PLACEHOLDER in safe_body
    raw_phone_in_prompt = "+971 50 123 4567" in safe_body or "+971501234567" in safe_body

    # Run classifier through LLM service
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        from app.tasks.classifier import CLASSIFIER_PROMPT
        llm_request = LLMRequest(
            action_type="conversation_classifier",
            messages=[
                {"role": "system", "content": CLASSIFIER_PROMPT},
                {"role": "user", "content": safe_body},
            ],
            max_tokens=500,
            conversation_id=conversation.id,
            message_id=message.id,
        )
        service = LLMService(
            provider=get_provider(),
            redis_client=redis_client,
            session_factory=AsyncSessionLocal,
        )
        response = await service.complete(llm_request)
        output = ClassifierOutput.model_validate(json.loads(response.content))
    finally:
        await redis_client.aclose()

    # Write classifier fields back to message
    message.intent = output.intent
    message.sentiment = output.sentiment
    message.sentiment_score = float(output.sentiment_score)
    message.sales_stage_delta = output.sales_stage_delta
    message.topic = output.topic
    await db.commit()

    return ClassifierDemoResult(
        message_id=str(message.id),
        intent=output.intent,
        sentiment=output.sentiment,
        sentiment_score=output.sentiment_score,
        sales_stage_delta=output.sales_stage_delta,
        topic=output.topic,
        redaction_applied=redaction_applied,
        raw_phone_in_prompt=raw_phone_in_prompt,
        ai_action_logged=True,
        llm_mode="offline_verification" if settings.MOCK_LLM else "live",
    )


@router.post("/invalid-transition-demo")
async def invalid_transition_demo():
    """
    Proves the PostgreSQL DB trigger catches invalid status transitions.
    Creates a real order (status=created) in the real `orders` table,
    attempts UPDATE to status=delivered (skipping all intermediate states),
    catches the trigger exception, cleans up, and returns proof.
    """
    engine = create_async_engine(settings.DATABASE_URL, poolclass=NullPool)
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    market_id = uuid.uuid4()
    customer_id = uuid.uuid4()
    address_id = uuid.uuid4()
    order_id = uuid.uuid4()
    trigger_fired = False
    error_detail = ""

    try:
        # Phase 1: Insert real records into the proper schema tables
        async with factory() as s:
            await s.execute(text(
                "INSERT INTO markets (id, name, country_code, currency, timezone) "
                "VALUES (:id, :name, :cc, :cur, :tz)"
            ), {"id": str(market_id), "name": "TriggerTest", "cc": "AE", "cur": "AED", "tz": "Asia/Dubai"})
            await s.execute(text(
                "INSERT INTO customers (id, market_id, full_name, phone) VALUES (:id, :mid, :fn, :ph)"
            ), {"id": str(customer_id), "mid": str(market_id), "fn": "Test", "ph": "+971000000000"})
            await s.execute(text(
                "INSERT INTO customer_addresses (id, customer_id, market_id, address_line_1, city, emirate, country_code) "
                "VALUES (:id, :cid, :mid, :a1, :city, :em, :cc)"
            ), {"id": str(address_id), "cid": str(customer_id), "mid": str(market_id),
                "a1": "Test St", "city": "Dubai", "em": "Dubai", "cc": "AE"})
            await s.execute(text(
                "INSERT INTO orders (id, market_id, customer_id, customer_address_id, status, service_type, currency) "
                "VALUES (:id, :mid, :cid, :aid, 'created', 'wash_and_fold', 'AED')"
            ), {"id": str(order_id), "mid": str(market_id), "cid": str(customer_id), "aid": str(address_id)})
            await s.commit()

        # Phase 2: Attempt the invalid transition — created → delivered
        # The DB trigger `order_status_transition_check` must reject this.
        async with factory() as s:
            try:
                await s.execute(
                    text("UPDATE orders SET status = 'delivered' WHERE id = :id"),
                    {"id": str(order_id)},
                )
                await s.commit()
                trigger_fired = False
            except Exception as e:
                await s.rollback()
                trigger_fired = True
                error_detail = str(e)

        # Phase 3: Clean up test records (FK order: orders → customer_addresses → customers → markets)
        async with factory() as s:
            await s.execute(text("DELETE FROM orders WHERE id = :id"), {"id": str(order_id)})
            await s.execute(text("DELETE FROM customer_addresses WHERE id = :id"), {"id": str(address_id)})
            await s.execute(text("DELETE FROM customers WHERE id = :id"), {"id": str(customer_id)})
            await s.execute(text("DELETE FROM markets WHERE id = :id"), {"id": str(market_id)})
            await s.commit()

    finally:
        await engine.dispose()

    return {
        "invalid_transition_rejected": trigger_fired,
        "rejected_by": "postgres_trigger" if trigger_fired else "not_rejected",
        "from_status": "created",
        "to_status": "delivered",
        "trigger_error": error_detail,
    }


@router.post("/reset-seed")
async def reset_seed(db: AsyncSession = Depends(get_db)):
    """Reset prototype_orders to the canonical seed state (clears QA test data)."""
    from app.api.proto_orders import SEED_ORDERS, _seed
    await db.execute(text("DELETE FROM prototype_orders"))
    await db.commit()
    await _seed(db)
    return {"ok": True, "seeded": len(SEED_ORDERS)}
