"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-06-25 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # order_status enum
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE order_status AS ENUM (
                'created', 'confirmed', 'pickup_assigned', 'picked_up',
                'cleaning', 'ready_for_delivery', 'out_for_delivery',
                'delivered', 'cancelled'
            );
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
    """)

    # markets
    op.create_table(
        "markets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("country_code", sa.String(10), nullable=False),
        sa.Column("currency", sa.String(10), nullable=False),
        sa.Column("timezone", sa.String(100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # country_configs
    op.create_table(
        "country_configs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("market_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("markets.id"), nullable=False),
        sa.Column("phone_code", sa.String(20), nullable=False),
        sa.Column("default_language", sa.String(10), nullable=False, server_default="'en'"),
        sa.Column("supported_languages", postgresql.JSON(), nullable=True),
        sa.Column("service_areas", postgresql.JSON(), nullable=True),
        sa.Column("tax_config", postgresql.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # customers
    op.create_table(
        "customers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("market_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("markets.id"), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(50), nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # customer_addresses (RLS enabled)
    op.create_table(
        "customer_addresses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("market_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("markets.id"), nullable=False),
        sa.Column("label", sa.String(100), nullable=True),
        sa.Column("address_line_1", sa.String(500), nullable=False),
        sa.Column("address_line_2", sa.String(500), nullable=True),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("emirate", sa.String(100), nullable=False),
        sa.Column("country_code", sa.String(10), nullable=False),
        sa.Column("latitude", sa.Numeric(10, 7), nullable=True),
        sa.Column("longitude", sa.Numeric(10, 7), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # orders (RLS enabled)
    op.create_table(
        "orders",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("market_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("markets.id"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("customer_address_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("customer_addresses.id"), nullable=False),
        sa.Column("status", sa.Text(), nullable=False, server_default="'created'"),
        sa.Column("service_type", sa.String(100), nullable=False),
        sa.Column("pickup_window_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("pickup_window_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivery_window_start", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivery_window_end", sa.DateTime(timezone=True), nullable=True),
        sa.Column("total_amount", sa.Numeric(10, 2), nullable=True),
        sa.Column("currency", sa.String(10), nullable=False, server_default="'AED'"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # order_events
    op.create_table(
        "order_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id"), nullable=False),
        sa.Column("from_status", sa.String(50), nullable=True),
        sa.Column("to_status", sa.String(50), nullable=False),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("metadata", postgresql.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # conversations
    op.create_table(
        "conversations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("market_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("markets.id"), nullable=False),
        sa.Column("customer_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id"), nullable=True),
        sa.Column("channel", sa.String(50), nullable=False, server_default="'whatsapp'"),
        sa.Column("status", sa.String(50), nullable=False, server_default="'active'"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # messages (RLS enabled)
    op.create_table(
        "messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("conversations.id"), nullable=False),
        sa.Column("market_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("markets.id"), nullable=False),
        sa.Column("sender_type", sa.String(50), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("intent", sa.String(100), nullable=True),
        sa.Column("sentiment", sa.String(50), nullable=True),
        sa.Column("sentiment_score", sa.Numeric(4, 3), nullable=True),
        sa.Column("sales_stage_delta", sa.String(100), nullable=True),
        sa.Column("topic", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ai_action_logs
    op.create_table(
        "ai_action_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("conversations.id"), nullable=True),
        sa.Column("message_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("messages.id"), nullable=True),
        sa.Column("provider", sa.String(100), nullable=False),
        sa.Column("model", sa.String(100), nullable=False),
        sa.Column("action_type", sa.String(100), nullable=False),
        sa.Column("prompt_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completion_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("estimated_cost", sa.Numeric(10, 6), nullable=False, server_default="0"),
        sa.Column("status", sa.String(50), nullable=False, server_default="'success'"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # cost_tracking
    op.create_table(
        "cost_tracking",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("conversation_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("conversations.id"), nullable=False),
        sa.Column("total_prompt_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_completion_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total_estimated_cost", sa.Numeric(10, 6), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ------------------------------------------------------------------ #
    # DB-level order state machine trigger
    # ------------------------------------------------------------------ #
    op.execute("""
        CREATE OR REPLACE FUNCTION enforce_order_status_transition()
        RETURNS TRIGGER AS $$
        BEGIN
            IF OLD.status = NEW.status THEN
                RETURN NEW;
            END IF;

            IF NOT (
                (OLD.status = 'created'          AND NEW.status IN ('confirmed', 'cancelled')) OR
                (OLD.status = 'confirmed'         AND NEW.status IN ('pickup_assigned', 'cancelled')) OR
                (OLD.status = 'pickup_assigned'   AND NEW.status IN ('picked_up', 'cancelled')) OR
                (OLD.status = 'picked_up'         AND NEW.status = 'cleaning') OR
                (OLD.status = 'cleaning'          AND NEW.status = 'ready_for_delivery') OR
                (OLD.status = 'ready_for_delivery' AND NEW.status = 'out_for_delivery') OR
                (OLD.status = 'out_for_delivery'  AND NEW.status = 'delivered')
            ) THEN
                RAISE EXCEPTION USING
                    MESSAGE = 'Invalid order status transition from "' || OLD.status || '" to "' || NEW.status || '". Permitted transitions are defined in the order state machine.',
                    ERRCODE = 'check_violation';
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)

    op.execute("""
        CREATE TRIGGER order_status_transition_check
        BEFORE UPDATE ON orders
        FOR EACH ROW
        WHEN (OLD.status IS DISTINCT FROM NEW.status)
        EXECUTE FUNCTION enforce_order_status_transition();
    """)

    # ------------------------------------------------------------------ #
    # Row Level Security
    # ------------------------------------------------------------------ #
    for table in ("orders", "messages", "customer_addresses"):
        op.execute(f"ALTER TABLE {table} ENABLE ROW SECURITY")
        op.execute(f"""
            CREATE POLICY service_access ON {table}
            USING (true)
            WITH CHECK (true)
        """)


def downgrade() -> None:
    for table in ("orders", "messages", "customer_addresses"):
        op.execute(f"DROP POLICY IF EXISTS service_access ON {table}")
        op.execute(f"ALTER TABLE {table} DISABLE ROW SECURITY")

    op.execute("DROP TRIGGER IF EXISTS order_status_transition_check ON orders")
    op.execute("DROP FUNCTION IF EXISTS enforce_order_status_transition()")

    for t in reversed([
        "cost_tracking", "ai_action_logs", "messages", "conversations",
        "order_events", "orders", "customer_addresses", "customers",
        "country_configs", "markets",
    ]):
        op.drop_table(t)

    op.execute("DROP TYPE IF EXISTS order_status")
