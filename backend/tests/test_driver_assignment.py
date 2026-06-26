"""
Tests for PATCH /api/orders/{id}/driver — driver assignment endpoint.
Verifies: full order returned, driver fields persisted, correct status set.
"""
import pytest

ORDER_PAYLOAD = {
    "id": "LK-AE-DA01",
    "customerName": "Driver Test Customer",
    "customerPhone": "+971 50 999 0001",
    "pickupAddress": "Test Area, Dubai",
    "emirate": "Dubai",
    "amount": 100,
    "pickupSlot": "Today, 10:00 AM – 12:00 PM",
    "paymentMethod": "Pay on Delivery",
    "status": "created",
}

DRIVER_PAYLOAD = {
    "driverId": "d1",
    "driverName": "Ahmed Khan",
}


@pytest.fixture(autouse=True)
async def seed_order(http_client):
    """Ensure test order exists before each test."""
    await http_client.post("/api/orders", json=ORDER_PAYLOAD)


@pytest.mark.asyncio
async def test_assign_driver_returns_full_order(http_client):
    r = await http_client.patch("/api/orders/LK-AE-DA01/driver", json=DRIVER_PAYLOAD)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
    body = r.json()
    # Must return a full order object, not {"ok": True}
    assert "id" in body, "Response must contain order id"
    assert body["id"] == "LK-AE-DA01"
    assert "customerName" in body


@pytest.mark.asyncio
async def test_assign_driver_response_contains_driver_fields(http_client):
    r = await http_client.patch("/api/orders/LK-AE-DA01/driver", json=DRIVER_PAYLOAD)
    assert r.status_code == 200
    body = r.json()
    assert body["driverId"] == DRIVER_PAYLOAD["driverId"]
    assert body["driverName"] == DRIVER_PAYLOAD["driverName"]


@pytest.mark.asyncio
async def test_assign_driver_sets_pickup_assigned_status(http_client):
    r = await http_client.patch("/api/orders/LK-AE-DA01/driver", json=DRIVER_PAYLOAD)
    assert r.status_code == 200
    assert r.json()["status"] == "pickup_assigned"


@pytest.mark.asyncio
async def test_assign_driver_persists_to_db(http_client):
    await http_client.patch("/api/orders/LK-AE-DA01/driver", json=DRIVER_PAYLOAD)
    get = await http_client.get("/api/orders/LK-AE-DA01")
    assert get.status_code == 200
    body = get.json()
    assert body["driverId"] == DRIVER_PAYLOAD["driverId"]
    assert body["driverName"] == DRIVER_PAYLOAD["driverName"]
    assert body["status"] == "pickup_assigned"


@pytest.mark.asyncio
async def test_assign_driver_404_for_unknown_order(http_client):
    r = await http_client.patch("/api/orders/LK-AE-NOTEXIST/driver", json=DRIVER_PAYLOAD)
    assert r.status_code == 404
