"""
WhatsApp Agent simulation API — customer-facing message processing.

Simulates the WhatsApp business channel flow without requiring any external
API keys or real WhatsApp integration:

  1. Accept customer message
  2. Store conversation + message in PostgreSQL
  3. Apply privacy filter (redact phone/email before LLM prompt)
  4. Run classifier through LLMService (MockProvider in verification mode)
  5. Parse laundry items from natural language using regex
  6. Calculate price from configurable sample pricing rules
  7. Create order in prototype_orders (visible in admin panel)
  8. Return agent reply + structured proof payload

No external API keys required. Uses MOCK_LLM=true by default.
"""
import json
import re
import uuid
from datetime import datetime, timezone
from typing import Optional

import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db, AsyncSessionLocal
from app.schemas.classifier import ClassifierOutput
from app.services.llm.base import LLMRequest
from app.services.llm.service import LLMService, get_provider
from app.services.privacy import PHONE_PLACEHOLDER, apply_privacy_filter
from app.tasks.classifier import CLASSIFIER_PROMPT

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp-agent"])


# ── Pricing rules ─────────────────────────────────────────────────────────────
# Configurable sample pricing rules for verification mode.
# In production these are driven by the market/service-catalogue tables.

ITEM_PRICING: dict[str, float] = {
    "Shirt":    10.0,
    "Trouser":  12.0,
    "Suit":     45.0,
    "Duvet":    75.0,
    "Pillow":   15.0,
    "Dress":    20.0,
    "Kandura":  20.0,
    "Jacket":   35.0,
    "Bedsheet": 25.0,
}

# Each tuple: (regex pattern, canonical item name).  Quantity in capture group 1.
_ITEM_RE: list[tuple[re.Pattern, str]] = [
    (re.compile(r"\b(\d+)\s+(?:shirt|shirts)\b",                re.I), "Shirt"),
    (re.compile(r"\b(\d+)\s+(?:trouser|trousers|pant|pants)\b", re.I), "Trouser"),
    (re.compile(r"\b(\d+)\s+(?:suit|suits)\b",                  re.I), "Suit"),
    (re.compile(r"\b(\d+)\s+(?:duvet|duvets)\b",                re.I), "Duvet"),
    (re.compile(r"\b(\d+)\s+(?:pillow|pillows)\b",              re.I), "Pillow"),
    (re.compile(r"\b(\d+)\s+(?:dress|dresses)\b",               re.I), "Dress"),
    (re.compile(r"\b(\d+)\s+(?:kandura|kanduras|thobe|thobes)\b", re.I), "Kandura"),
    (re.compile(r"\b(\d+)\s+(?:jacket|jackets|coat|coats)\b",   re.I), "Jacket"),
    (re.compile(r"\b(\d+)\s+(?:bedsheet|bedsheets|sheet|sheets)\b", re.I), "Bedsheet"),
]

# Stable UUID for the shared WhatsApp demo market — avoids creating a new market per call.
_DEMO_MARKET_ID = uuid.UUID("00000000-0000-0000-0000-000000000099")


# ── Schemas ───────────────────────────────────────────────────────────────────

class SimulateMessageRequest(BaseModel):
    customer_name: str = "Demo Customer"
    phone: str = "+971 50 123 4567"
    message: str
    address: str = "Dubai Marina"
    emirate: str = "Dubai"
    pickup_window: str = "Today, 6:00 PM – 8:00 PM"


# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_items(text: str) -> list[dict]:
    """Extract laundry items and quantities from natural language via regex."""
    items = []
    for pattern, name in _ITEM_RE:
        m = pattern.search(text)
        if m:
            items.append({"name": name, "quantity": int(m.group(1))})
    return items


def calculate_price(items: list[dict]) -> float:
    """Sum item quantities × unit prices. Returns 0.0 when items list is empty."""
    return round(sum(ITEM_PRICING.get(i["name"], 0) * i["quantity"] for i in items), 2)


async def _ensure_demo_market(db: AsyncSession) -> None:
    """Upsert the shared demo market so every simulate-message call can reuse it."""
    await db.execute(
        text(
            "INSERT INTO markets (id, name, country_code, currency, timezone) "
            "VALUES (:id, :name, 'AE', 'AED', 'Asia/Dubai') "
            "ON CONFLICT (id) DO NOTHING"
        ),
        {"id": str(_DEMO_MARKET_ID), "name": "UAE WhatsApp Demo Market"},
    )


async def _next_proto_order_id(db: AsyncSession) -> str:
    rows = (await db.execute(text("SELECT id FROM prototype_orders"))).fetchall()
    max_num = 1026
    for row in rows:
        try:
            max_num = max(max_num, int(row[0].split("-")[-1]))
        except (ValueError, IndexError):
            pass
    return f"LK-AE-{max_num + 1}"


async def run_agent_flow(body: SimulateMessageRequest, db: AsyncSession) -> dict:
    """
    Core pipeline — shared by the API endpoint and the verification endpoint.
    Returns a plain dict (no JSONResponse wrapping).
    """
    from app.models.customer import Customer, CustomerAddress
    from app.models.conversation import Conversation, Message

    # ── 1. Ensure demo market exists ─────────────────────────────────────────
    await _ensure_demo_market(db)
    await db.flush()

    # ── 2. Create customer + address records ─────────────────────────────────
    customer = Customer(
        id=uuid.uuid4(),
        market_id=_DEMO_MARKET_ID,
        full_name=body.customer_name,
        phone=body.phone,
    )
    db.add(customer)
    await db.flush()

    address = CustomerAddress(
        id=uuid.uuid4(),
        customer_id=customer.id,
        market_id=_DEMO_MARKET_ID,
        address_line_1=body.address,
        city=body.emirate,
        emirate=body.emirate,
        country_code="AE",
    )
    db.add(address)
    await db.flush()

    # ── 3. Create conversation ───────────────────────────────────────────────
    conversation = Conversation(
        id=uuid.uuid4(),
        market_id=_DEMO_MARKET_ID,
        customer_id=customer.id,
        channel="whatsapp",
        status="active",
    )
    db.add(conversation)
    await db.flush()

    # ── 4. Store incoming customer message ───────────────────────────────────
    message = Message(
        id=uuid.uuid4(),
        conversation_id=conversation.id,
        market_id=_DEMO_MARKET_ID,
        sender_type="customer",
        body=body.message,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)

    # ── 5. Privacy filter ────────────────────────────────────────────────────
    safe_body = apply_privacy_filter(body.message)
    redaction_applied = PHONE_PLACEHOLDER in safe_body
    # Check that no variant of the raw phone survives into the prompt
    raw_phone_in_prompt = any(
        variant in safe_body
        for variant in [
            body.phone,
            body.phone.replace(" ", ""),
            body.phone.replace("+", ""),
            body.phone.replace("+", "").replace(" ", ""),
        ]
    )

    # ── 6. Classifier via LLMService ─────────────────────────────────────────
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        llm_req = LLMRequest(
            action_type="conversation_classifier",
            messages=[
                {"role": "system", "content": CLASSIFIER_PROMPT},
                {"role": "user",   "content": safe_body},
            ],
            max_tokens=500,
            conversation_id=conversation.id,
            message_id=message.id,
        )
        svc = LLMService(
            provider=get_provider(),
            redis_client=redis_client,
            session_factory=AsyncSessionLocal,
        )
        llm_resp = await svc.complete(llm_req)
        classifier_out = ClassifierOutput.model_validate(json.loads(llm_resp.content))
    finally:
        await redis_client.aclose()

    # Write classifier fields back to message row
    message.intent          = classifier_out.intent
    message.sentiment       = classifier_out.sentiment
    message.sentiment_score = float(classifier_out.sentiment_score)
    message.sales_stage_delta = classifier_out.sales_stage_delta
    message.topic           = classifier_out.topic
    await db.commit()

    # ── 7. Item parsing + price calculation ──────────────────────────────────
    items  = parse_items(body.message)
    amount = calculate_price(items) if items else 145.0

    # ── 8. Create order in prototype_orders (shows in admin Orders panel) ────
    order_id = await _next_proto_order_id(db)
    now      = datetime.now(timezone.utc).isoformat()
    order_data = {
        "id":              order_id,
        "customerId":      str(customer.id),
        "customerName":    body.customer_name,
        "customerPhone":   body.phone,
        "services":        ["Wash & Fold"],
        "items":           [{"name": i["name"], "qty": i["quantity"]} for i in items],
        "pickupAddress":   body.address,
        "deliveryAddress": body.address,
        "emirate":         body.emirate,
        "pickupSlot":      body.pickup_window,
        "deliveryEta":     "Tomorrow by 6:00 PM",
        "status":          "created",
        "driverId":        None,
        "driverName":      None,
        "amount":          amount,
        "paymentMethod":   "Pay on Delivery",
        "paymentStatus":   "pending",
        "currency":        "AED",
        "notes":           f"WhatsApp agent order. Items parsed from message.",
        "createdAt":       now,
        "updatedAt":       now,
        "facilityAssigned": "",
        "isB2B":           False,
    }
    await db.execute(
        text(
            "INSERT INTO prototype_orders (id, data) "
            "VALUES (:id, CAST(:data AS jsonb)) "
            "ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()"
        ),
        {"id": order_id, "data": json.dumps(order_data)},
    )
    await db.commit()

    # ── 9. Build agent reply ──────────────────────────────────────────────────
    if items:
        items_str = ", ".join(
            f"{i['quantity']} {i['name'].lower()}{'s' if i['quantity'] != 1 else ''}"
            for i in items
        )
    else:
        items_str = "your laundry items"

    agent_reply = (
        f"Thank you, {body.customer_name}! Your pickup is confirmed. "
        f"We will collect {items_str} from {body.address}. "
        f"Pickup window: {body.pickup_window}. "
        f"Estimated total: AED {amount:.0f}. "
        f"Your order reference is {order_id}."
    )

    return {
        "status":          "order_created",
        "conversation_id": str(conversation.id),
        "agent_reply":     agent_reply,
        "order": {
            "id":             order_id,
            "customer_name":  body.customer_name,
            "service_type":   "Wash & Fold",
            "items":          items,
            "amount":         amount,
            "currency":       "AED",
            "status":         "created",
            "pickup_address": body.address,
            "pickup_window":  body.pickup_window,
        },
        "privacy": {
            "redaction_applied":   redaction_applied,
            "raw_phone_in_prompt": raw_phone_in_prompt,
        },
        "classifier": {
            "intent":             classifier_out.intent,
            "sentiment":          classifier_out.sentiment,
            "sentiment_score":    classifier_out.sentiment_score,
            "sales_stage_delta":  classifier_out.sales_stage_delta,
            "topic":              classifier_out.topic,
        },
        "ai_action_logged": True,
    }


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/simulate-message")
async def simulate_message(body: SimulateMessageRequest, db: AsyncSession = Depends(get_db)):
    """
    Accept a customer message and process it through the WhatsApp agent pipeline.

    - Stores conversation + message in PostgreSQL
    - Applies privacy filter (phone/email redacted before LLM prompt)
    - Runs conversation classifier via LLMService (offline/mock in verification mode)
    - Parses laundry items and calculates price
    - Creates order in prototype_orders (visible in admin panel immediately)
    - Returns agent reply + proof payload
    """
    result = await run_agent_flow(body, db)
    return JSONResponse(content=result, media_type="application/json")


@router.get("/demo-conversation/{conversation_id}")
async def get_demo_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    """Return all stored messages for a simulated WhatsApp conversation."""
    from app.models.conversation import Conversation, Message

    try:
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid conversation_id — must be a UUID")

    conv = (await db.execute(
        select(Conversation).where(Conversation.id == conv_uuid)
    )).scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = (await db.execute(
        select(Message)
        .where(Message.conversation_id == conv_uuid)
        .order_by(Message.created_at)
    )).scalars().all()

    return {
        "conversation_id": conversation_id,
        "channel":         conv.channel,
        "status":          conv.status,
        "messages": [
            {
                "id":                 str(m.id),
                "sender_type":        m.sender_type,
                "body":               m.body,
                "intent":             m.intent,
                "sentiment":          m.sentiment,
                "sentiment_score":    float(m.sentiment_score) if m.sentiment_score is not None else None,
                "sales_stage_delta":  m.sales_stage_delta,
                "topic":              m.topic,
                "created_at":         m.created_at.isoformat(),
            }
            for m in messages
        ],
    }
