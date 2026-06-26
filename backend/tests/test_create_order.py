"""
Test suite for POST /api/orders — order creation endpoint.
Covers: 201 response, DB persistence, and required-field validation.
Each test supplies its own unique order ID to avoid ID-generation queries
interfering with event loop state across tests.
"""
import pytest

BASE_PAYLOAD = {
    "customerName": "Test Customer",
    "customerPhone": "+971 50 123 4567",
    "pickupAddress": "Dubai Marina, Dubai",
    "emirate": "Dubai",
    "amount": 145,
    "pickupSlot": "Today, 6:00 PM – 8:00 PM",
    "paymentMethod": "Pay on Delivery",
    "services": ["Wash & Fold"],
    "notes": "Handle with care",
}


@pytest.mark.asyncio
async def test_create_order_returns_201(http_client):
    payload = {**BASE_PAYLOAD, "id": "LK-AE-T901"}
    r = await http_client.post("/api/orders", json=payload)
    assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"


@pytest.mark.asyncio
async def test_create_order_response_shape(http_client):
    payload = {**BASE_PAYLOAD, "id": "LK-AE-T902"}
    r = await http_client.post("/api/orders", json=payload)
    assert r.status_code == 201
    body = r.json()
    assert body["customerName"] == BASE_PAYLOAD["customerName"]
    assert body["status"] == "created"
    assert body["currency"] == "AED"
    assert body["paymentStatus"] == "pending"
    assert body["id"] == "LK-AE-T902"


@pytest.mark.asyncio
async def test_create_order_persists_in_db(http_client):
    payload = {**BASE_PAYLOAD, "id": "LK-AE-T903"}
    r = await http_client.post("/api/orders", json=payload)
    assert r.status_code == 201

    get = await http_client.get("/api/orders/LK-AE-T903")
    assert get.status_code == 200
    assert get.json()["id"] == "LK-AE-T903"
    assert get.json()["customerName"] == BASE_PAYLOAD["customerName"]


@pytest.mark.asyncio
async def test_create_order_missing_required_field_returns_422(http_client):
    incomplete = {k: v for k, v in BASE_PAYLOAD.items() if k != "customerName"}
    r = await http_client.post("/api/orders", json=incomplete)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_create_order_id_auto_generated_when_omitted(http_client):
    payload = {k: v for k, v in BASE_PAYLOAD.items()}  # no 'id' key
    r = await http_client.post("/api/orders", json=payload)
    assert r.status_code == 201
    body = r.json()
    assert "id" in body
    assert body["id"].startswith("LK-AE-")
