"""
Verify that the PostgreSQL trigger rejects invalid order status transitions.

The rejection must come from the database trigger, not Python-level validation.
"""
import pytest
from sqlalchemy import text


@pytest.mark.asyncio
async def test_invalid_transition_rejected_by_db(db_session, sample_order):
    order_id = sample_order.id
    raised = False

    try:
        await db_session.execute(
            text("UPDATE orders SET status = 'delivered' WHERE id = :id"),
            {"id": str(order_id)},
        )
        await db_session.commit()
    except Exception as exc:
        raised = True
        await db_session.rollback()
        err_str = str(exc).lower()
        assert (
            "invalid order status transition" in err_str
            or "transition" in err_str
            or "permitted" in err_str
            or "check_violation" in err_str
        ), f"Expected trigger error message, got: {err_str}"

    assert raised, "Expected PostgreSQL trigger to raise an exception for created → delivered"


@pytest.mark.asyncio
async def test_valid_transition_succeeds(db_session, sample_order):
    order_id = sample_order.id

    await db_session.execute(
        text("UPDATE orders SET status = 'confirmed' WHERE id = :id"),
        {"id": str(order_id)},
    )
    await db_session.commit()

    result = await db_session.execute(
        text("SELECT status FROM orders WHERE id = :id"),
        {"id": str(order_id)},
    )
    row = result.fetchone()
    assert row is not None
    assert row[0] == "confirmed"
