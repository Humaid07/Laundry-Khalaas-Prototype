"""
Tests for the WhatsApp agent simulation pipeline.

Pricing reference (3 shirts + 2 trousers + 1 duvet):
  3 × 10 (shirt) + 2 × 12 (trouser) + 1 × 75 (duvet) = 30 + 24 + 75 = AED 129
"""
import pytest

SAMPLE_PAYLOAD = {
    "customer_name": "Test Customer",
    "phone": "+971 50 123 4567",
    "message": "Hi, I need laundry pickup today. I have 3 shirts, 2 trousers and 1 duvet. My number is +971 50 123 4567.",
    "address": "Dubai Marina",
    "emirate": "Dubai",
    "pickup_window": "Today, 6:00 PM – 8:00 PM",
}


# ── Unit tests (no HTTP, no DB) ───────────────────────────────────────────────

def test_item_parser_extracts_all_items():
    from app.api.whatsapp import parse_items
    items = parse_items("I have 3 shirts, 2 trousers and 1 duvet")
    names = {i["name"] for i in items}
    assert "Shirt"   in names
    assert "Trouser" in names
    assert "Duvet"   in names
    assert next(i for i in items if i["name"] == "Shirt")["quantity"]   == 3
    assert next(i for i in items if i["name"] == "Trouser")["quantity"] == 2
    assert next(i for i in items if i["name"] == "Duvet")["quantity"]   == 1


def test_price_calculation_correct():
    from app.api.whatsapp import parse_items, calculate_price
    items = parse_items("3 shirts, 2 trousers and 1 duvet")
    assert calculate_price(items) == 129.0   # 30 + 24 + 75


def test_price_empty_items_returns_zero():
    from app.api.whatsapp import calculate_price
    assert calculate_price([]) == 0.0


# ── Integration tests (HTTP + DB) ─────────────────────────────────────────────

@pytest.mark.asyncio
async def test_simulate_message_returns_200_and_order_created(http_client):
    r = await http_client.post("/api/whatsapp/simulate-message", json=SAMPLE_PAYLOAD)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    assert r.json()["status"] == "order_created"


@pytest.mark.asyncio
async def test_simulate_message_creates_conversation(http_client):
    r = await http_client.post("/api/whatsapp/simulate-message", json=SAMPLE_PAYLOAD)
    assert r.status_code == 200
    body = r.json()
    assert "conversation_id" in body
    # Must be a valid UUID (36 chars with dashes)
    assert len(body["conversation_id"]) == 36


@pytest.mark.asyncio
async def test_simulate_message_stores_message(http_client):
    r = await http_client.post("/api/whatsapp/simulate-message", json=SAMPLE_PAYLOAD)
    assert r.status_code == 200
    conv_id = r.json()["conversation_id"]

    get = await http_client.get(f"/api/whatsapp/demo-conversation/{conv_id}")
    assert get.status_code == 200
    msgs = get.json()["messages"]
    assert len(msgs) >= 1
    assert msgs[0]["sender_type"] == "customer"
    assert "shirt" in msgs[0]["body"].lower()


@pytest.mark.asyncio
async def test_simulate_message_redacts_phone_before_prompt(http_client):
    r = await http_client.post("/api/whatsapp/simulate-message", json=SAMPLE_PAYLOAD)
    assert r.status_code == 200
    privacy = r.json()["privacy"]
    assert privacy["redaction_applied"]   is True
    assert privacy["raw_phone_in_prompt"] is False


@pytest.mark.asyncio
async def test_simulate_message_classifier_five_fields(http_client):
    r = await http_client.post("/api/whatsapp/simulate-message", json=SAMPLE_PAYLOAD)
    assert r.status_code == 200
    clf = r.json()["classifier"]
    for field in ("intent", "sentiment", "sentiment_score", "sales_stage_delta", "topic"):
        assert field in clf, f"Missing classifier field: {field}"


@pytest.mark.asyncio
async def test_simulate_message_price_is_correct(http_client):
    r = await http_client.post("/api/whatsapp/simulate-message", json=SAMPLE_PAYLOAD)
    assert r.status_code == 200
    order = r.json()["order"]
    assert order["amount"]   == 129.0   # 3×10 + 2×12 + 1×75
    assert order["currency"] == "AED"


@pytest.mark.asyncio
async def test_simulate_message_order_created_with_id(http_client):
    r = await http_client.post("/api/whatsapp/simulate-message", json=SAMPLE_PAYLOAD)
    assert r.status_code == 200
    order = r.json()["order"]
    assert "id" in order
    assert order["id"].startswith("LK-AE-")
    assert order["status"] == "created"


@pytest.mark.asyncio
async def test_simulate_message_ai_action_logged(http_client):
    r = await http_client.post("/api/whatsapp/simulate-message", json=SAMPLE_PAYLOAD)
    assert r.status_code == 200
    assert r.json()["ai_action_logged"] is True


@pytest.mark.asyncio
async def test_created_order_visible_in_admin_orders_list(http_client):
    r = await http_client.post("/api/whatsapp/simulate-message", json=SAMPLE_PAYLOAD)
    assert r.status_code == 200
    new_id = r.json()["order"]["id"]

    lst = await http_client.get("/api/orders")
    assert lst.status_code == 200
    ids = [o["id"] for o in lst.json()]
    assert new_id in ids, f"Order {new_id} not found in /api/orders"


@pytest.mark.asyncio
async def test_verification_whatsapp_demo_endpoint(http_client):
    r = await http_client.post("/verification/run-whatsapp-agent-demo")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "order_created"
    assert body["verification"]["external_api_required"] is False
    assert body["order"]["amount"] == 129.0
