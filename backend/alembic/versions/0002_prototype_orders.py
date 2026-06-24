"""prototype orders store

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-25 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
from sqlalchemy import text

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(text("""
        CREATE TABLE prototype_orders (
            id TEXT PRIMARY KEY,
            data JSONB NOT NULL DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    """))


def downgrade() -> None:
    op.execute(text("DROP TABLE IF EXISTS prototype_orders"))
