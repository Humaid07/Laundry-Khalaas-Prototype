"""
Verify that the database schema is correctly applied:
- All required tables exist
- pgvector extension is enabled
- RLS is enabled on orders, messages, customer_addresses
"""
import pytest
from sqlalchemy import text


REQUIRED_TABLES = [
    "markets",
    "country_configs",
    "customers",
    "customer_addresses",
    "orders",
    "order_events",
    "conversations",
    "messages",
    "ai_action_logs",
    "cost_tracking",
]

RLS_TABLES = ["orders", "messages", "customer_addresses"]


@pytest.mark.asyncio
async def test_required_tables_exist(db_session):
    result = await db_session.execute(
        text(
            "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
        )
    )
    existing = {row[0] for row in result.fetchall()}
    for table in REQUIRED_TABLES:
        assert table in existing, f"Table '{table}' not found in public schema"


@pytest.mark.asyncio
async def test_pgvector_extension_enabled(db_session):
    result = await db_session.execute(
        text("SELECT extname FROM pg_extension WHERE extname = 'vector'")
    )
    row = result.fetchone()
    assert row is not None, "pgvector extension is not enabled"


@pytest.mark.asyncio
async def test_rls_enabled_on_required_tables(db_session):
    for table in RLS_TABLES:
        result = await db_session.execute(
            text(
                "SELECT rowsecurity FROM pg_tables "
                "WHERE tablename = :t AND schemaname = 'public'"
            ),
            {"t": table},
        )
        row = result.fetchone()
        assert row is not None, f"Table '{table}' not found"
        assert row[0] is True, f"RLS is not enabled on '{table}'"
