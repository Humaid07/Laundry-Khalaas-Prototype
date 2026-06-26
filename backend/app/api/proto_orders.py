"""
Orders and drivers API — bridges the Next.js frontend to PostgreSQL.
Uses a JSONB store so the frontend's data shape is preserved exactly.
"""
import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db

# Valid status transitions for prototype frontend statuses.
# Mirrors the DB trigger on the real `orders` table (adapted to frontend taxonomy).
VALID_TRANSITIONS: dict[str, set[str]] = {
    "created":            {"confirmed", "cancelled"},
    "confirmed":          {"pickup_assigned", "cancelled"},
    "pickup_assigned":    {"picked_up", "cancelled"},
    "picked_up":          {"cleaning"},
    "cleaning":           {"ready_for_delivery"},
    "ready_for_delivery": {"out_for_delivery"},
    "out_for_delivery":   {"delivered"},
    "delivered":          set(),
    "cancelled":          set(),
}

router = APIRouter(prefix="/api", tags=["orders"])


class CreateOrderRequest(BaseModel):
    """Pydantic schema for order creation. Required fields are validated server-side.
    extra='allow' so the user-booking flow can POST the full Order object without rejection."""
    model_config = ConfigDict(extra="allow")

    customerName: str
    customerPhone: str
    pickupAddress: str
    emirate: str
    amount: float
    pickupSlot: str
    paymentMethod: str
    # Fields with defaults
    id: Optional[str] = None
    customerId: str = "admin"
    services: List[str] = []
    items: List[Any] = []
    deliveryAddress: Optional[str] = None
    deliveryEta: str = ""
    status: str = "created"
    driverId: Optional[str] = None
    driverName: Optional[str] = None
    currency: str = "AED"
    paymentStatus: str = "pending"
    notes: str = ""
    facilityAssigned: str = ""
    isB2B: bool = False
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

# ── Seed data (mirrors lib/mock-data.ts) ────────────────────────────────────

SEED_ORDERS = [
    {
        "id": "LK-AE-1024",
        "customerId": "c1",
        "customerName": "Humaid Al Mansoori",
        "customerPhone": "+971 50 XXX 5566",
        "services": ["Wash & Fold", "Dry Cleaning"],
        "items": [{"name": "Shirts", "qty": 6}, {"name": "Trousers", "qty": 3}, {"name": "Suit", "qty": 1}, {"name": "Duvet", "qty": 1}],
        "pickupAddress": "Apt 1204, Marina Heights, Dubai Marina, Dubai",
        "deliveryAddress": "Apt 1204, Marina Heights, Dubai Marina, Dubai",
        "emirate": "Dubai",
        "pickupSlot": "Today, 6:00 PM – 8:00 PM",
        "deliveryEta": "Tomorrow by 8:00 PM",
        "status": "pickup_assigned",
        "driverId": "d1",
        "driverName": "Ahmed Khan",
        "amount": 145,
        "paymentMethod": "Pay on Delivery",
        "paymentStatus": "pending",
        "notes": "",
        "createdAt": "2024-01-15T14:30:00",
        "updatedAt": "2024-01-15T14:45:00",
        "facilityAssigned": "Dubai Marina Facility",
        "isB2B": False,
    },
    {
        "id": "LK-AE-1025",
        "customerId": "c2",
        "customerName": "Sarah Johnson",
        "customerPhone": "+971 55 XXX 7788",
        "services": ["Blankets & Duvets"],
        "items": [{"name": "Duvet (King)", "qty": 2}, {"name": "Pillows", "qty": 4}],
        "pickupAddress": "Villa 23, Al Reem Street, Abu Dhabi",
        "deliveryAddress": "Villa 23, Al Reem Street, Abu Dhabi",
        "emirate": "Abu Dhabi",
        "pickupSlot": "Today, 10:00 AM – 12:00 PM",
        "deliveryEta": "Tomorrow by 6:00 PM",
        "status": "cleaning",
        "driverId": "d2",
        "driverName": "Fatima Noor",
        "amount": 90,
        "paymentMethod": "Pay on Delivery",
        "paymentStatus": "pending",
        "notes": "Hypoallergenic detergent required",
        "createdAt": "2024-01-15T09:00:00",
        "updatedAt": "2024-01-15T12:30:00",
        "facilityAssigned": "Abu Dhabi Central Facility",
        "isB2B": False,
    },
    {
        "id": "LK-AE-1026",
        "customerId": "b1",
        "customerName": "Jumeirah Grand Hotel",
        "customerPhone": "+971 4 XXX 5500",
        "services": ["Business Laundry"],
        "items": [{"name": "Bed Linen Sets", "qty": 120}, {"name": "Bath Towels", "qty": 200}, {"name": "Table Cloths", "qty": 80}],
        "pickupAddress": "Jumeirah Grand Hotel, Jumeirah Beach Road, Dubai",
        "deliveryAddress": "Jumeirah Grand Hotel, Jumeirah Beach Road, Dubai",
        "emirate": "Dubai",
        "pickupSlot": "Today, 7:00 AM – 9:00 AM",
        "deliveryEta": "Tomorrow by 6:00 AM",
        "status": "picked_up",
        "driverId": "d3",
        "driverName": "Team Driver 03",
        "amount": 2800,
        "paymentMethod": "Monthly Invoice",
        "paymentStatus": "pending",
        "notes": "Priority client — use premium fragrance",
        "createdAt": "2024-01-15T06:00:00",
        "updatedAt": "2024-01-15T09:15:00",
        "facilityAssigned": "Jebel Ali Commercial Facility",
        "isB2B": True,
    },
    {
        "id": "LK-AE-1023",
        "customerId": "c3",
        "customerName": "Omar Al Mansouri",
        "customerPhone": "+971 52 XXX 1122",
        "services": ["Dry Cleaning", "Ironing & Pressing"],
        "items": [{"name": "Suit", "qty": 2}, {"name": "Dress Shirts", "qty": 5}, {"name": "Kandura", "qty": 3}],
        "pickupAddress": "Office 801, The Exchange, Business Bay, Dubai",
        "deliveryAddress": "Apt 3302, Burj Vista, Downtown Dubai",
        "emirate": "Dubai",
        "pickupSlot": "Yesterday, 2:00 PM – 4:00 PM",
        "deliveryEta": "Today by 2:00 PM",
        "status": "out_for_delivery",
        "driverId": "d2",
        "driverName": "Fatima Noor",
        "amount": 210,
        "paymentMethod": "Card",
        "paymentStatus": "paid",
        "notes": "",
        "createdAt": "2024-01-14T13:00:00",
        "updatedAt": "2024-01-15T13:45:00",
        "facilityAssigned": "Dubai Marina Facility",
        "isB2B": False,
    },
    {
        "id": "LK-AE-1022",
        "customerId": "c4",
        "customerName": "Priya Nair",
        "customerPhone": "+971 56 XXX 9900",
        "services": ["Wash & Fold"],
        "items": [{"name": "Mixed Clothing", "qty": 8}, {"name": "Bedsheets", "qty": 3}],
        "pickupAddress": "Apt 506, JVC District 15, JVC, Dubai",
        "deliveryAddress": "Apt 506, JVC District 15, JVC, Dubai",
        "emirate": "Dubai",
        "pickupSlot": "Yesterday, 4:00 PM – 6:00 PM",
        "deliveryEta": "Today by 4:00 PM",
        "status": "delivered",
        "driverId": "d6",
        "driverName": "Rania Malik",
        "amount": 75,
        "paymentMethod": "Pay on Delivery",
        "paymentStatus": "paid",
        "notes": "",
        "createdAt": "2024-01-14T15:00:00",
        "updatedAt": "2024-01-15T15:30:00",
        "facilityAssigned": "JVC Facility",
        "isB2B": False,
    },
    {
        "id": "LK-AE-1021",
        "customerId": "c5",
        "customerName": "David Chen",
        "customerPhone": "+971 50 XXX 4455",
        "services": ["Curtains & Upholstery"],
        "items": [{"name": "Curtain Panels", "qty": 6}, {"name": "Sofa Cover", "qty": 1}],
        "pickupAddress": "Villa 12, Al Barsha 2, Dubai",
        "deliveryAddress": "Villa 12, Al Barsha 2, Dubai",
        "emirate": "Dubai",
        "pickupSlot": "2 days ago, 10:00 AM – 12:00 PM",
        "deliveryEta": "Yesterday by 8:00 PM",
        "status": "delivered",
        "driverId": "d1",
        "driverName": "Ahmed Khan",
        "amount": 320,
        "paymentMethod": "Card",
        "paymentStatus": "paid",
        "notes": "",
        "createdAt": "2024-01-13T09:00:00",
        "updatedAt": "2024-01-14T19:00:00",
        "facilityAssigned": "Al Barsha Facility",
        "isB2B": False,
    },
]

SEED_DRIVERS = [
    {"id": "d1", "name": "Ahmed Khan", "phone": "+971 50 XXX 1660", "vehicle": "Toyota Hiace Van", "vehicleNumber": "Dubai A 12345", "rating": 4.8, "status": "on_pickup", "location": "Dubai Marina", "emirate": "Dubai", "completedToday": 7, "avatar": "AK"},
    {"id": "d2", "name": "Fatima Noor", "phone": "+971 55 XXX 2891", "vehicle": "Hyundai H-1 Van", "vehicleNumber": "Dubai B 67890", "rating": 4.9, "status": "on_delivery", "location": "Business Bay", "emirate": "Dubai", "completedToday": 9, "avatar": "FN"},
    {"id": "d3", "name": "Imran Ali", "phone": "+971 52 XXX 4422", "vehicle": "Kia Bongo Van", "vehicleNumber": "Dubai C 11223", "rating": 4.7, "status": "on_pickup", "location": "JVC", "emirate": "Dubai", "completedToday": 6, "avatar": "IA"},
    {"id": "d4", "name": "Mohammed Rashid", "phone": "+971 56 XXX 7733", "vehicle": "Toyota Hiace Van", "vehicleNumber": "Sharjah A 44556", "rating": 4.6, "status": "available", "location": "Al Nahda, Sharjah", "emirate": "Sharjah", "completedToday": 5, "avatar": "MR"},
    {"id": "d5", "name": "Khalid Hassan", "phone": "+971 50 XXX 9988", "vehicle": "Ford Transit Van", "vehicleNumber": "Abu Dhabi A 77889", "rating": 4.9, "status": "available", "location": "Al Reem Island, Abu Dhabi", "emirate": "Abu Dhabi", "completedToday": 11, "avatar": "KH"},
    {"id": "d6", "name": "Rania Malik", "phone": "+971 54 XXX 3344", "vehicle": "Nissan Urvan Van", "vehicleNumber": "Dubai D 55667", "rating": 4.8, "status": "available", "location": "Al Barsha, Dubai", "emirate": "Dubai", "completedToday": 8, "avatar": "RM"},
]


# ── Helpers ──────────────────────────────────────────────────────────────────

async def _seed(db: AsyncSession) -> None:
    for order in SEED_ORDERS:
        await db.execute(
            text("INSERT INTO prototype_orders (id, data) VALUES (:id, CAST(:data AS jsonb)) ON CONFLICT DO NOTHING"),
            {"id": order["id"], "data": json.dumps(order)},
        )
    await db.commit()


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("/orders")
async def list_orders(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT CAST(data AS text) FROM prototype_orders ORDER BY created_at DESC")
    )
    rows = result.fetchall()
    if not rows:
        await _seed(db)
        return SEED_ORDERS
    return [json.loads(row[0]) for row in rows]


@router.get("/orders/{order_id}")
async def get_order(order_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("SELECT CAST(data AS text) FROM prototype_orders WHERE id = :id"),
        {"id": order_id},
    )
    row = result.fetchone()
    if not row:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Order not found")
    return json.loads(row[0])


@router.post("/orders", status_code=201)
async def create_order(body: CreateOrderRequest, db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc).isoformat()

    # Generate ID if not provided: find max numeric suffix and increment.
    order_id = body.id
    if not order_id:
        result = await db.execute(text("SELECT id FROM prototype_orders"))
        rows = result.fetchall()
        max_num = 1026
        for row in rows:
            try:
                max_num = max(max_num, int(row[0].split("-")[-1]))
            except (ValueError, IndexError):
                pass
        order_id = f"LK-AE-{max_num + 1}"

    order = body.model_dump()
    order["id"] = order_id
    order.setdefault("createdAt", now)
    order.setdefault("updatedAt", now)
    if order.get("deliveryAddress") is None:
        order["deliveryAddress"] = order["pickupAddress"]
    if not order.get("services"):
        order["services"] = [order.get("service", "")]

    await db.execute(
        text("INSERT INTO prototype_orders (id, data) VALUES (:id, CAST(:data AS jsonb)) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()"),
        {"id": order_id, "data": json.dumps(order)},
    )
    await db.commit()
    return order


class StatusUpdate(BaseModel):
    status: str


@router.patch("/orders/{order_id}/status")
async def update_status(order_id: str, body: StatusUpdate, db: AsyncSession = Depends(get_db)):
    row = (await db.execute(
        text("SELECT data->>'status' FROM prototype_orders WHERE id = :id"),
        {"id": order_id},
    )).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Order not found")

    current = row[0]
    new = body.status
    allowed = VALID_TRANSITIONS.get(current, set())
    if new not in allowed:
        raise HTTPException(
            status_code=422,
            detail=f"invalid_order_status_transition: {current} → {new}",
        )

    await db.execute(
        text("UPDATE prototype_orders SET data = data || CAST(:patch AS jsonb), updated_at = NOW() WHERE id = :id"),
        {"id": order_id, "patch": json.dumps({"status": new})},
    )
    await db.commit()
    return {"ok": True}


class DriverUpdate(BaseModel):
    driverId: str
    driverName: str


@router.patch("/orders/{order_id}/driver")
async def assign_driver(order_id: str, body: DriverUpdate, db: AsyncSession = Depends(get_db)):
    await db.execute(
        text("UPDATE prototype_orders SET data = data || CAST(:patch AS jsonb), updated_at = NOW() WHERE id = :id"),
        {"id": order_id, "patch": json.dumps({"driverId": body.driverId, "driverName": body.driverName, "status": "driver_assigned"})},
    )
    await db.commit()
    return {"ok": True}


@router.get("/drivers")
async def list_drivers():
    return SEED_DRIVERS
