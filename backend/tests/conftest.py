import asyncio
import os
import uuid

import pytest
import pytest_asyncio
import redis.asyncio as aioredis
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

os.environ.setdefault("MOCK_LLM", "true")
os.environ.setdefault("APP_ENV", "test")

from app.core.config import settings
from app.main import app
from app.db.session import AsyncSessionLocal

DATABASE_URL = settings.DATABASE_URL
REDIS_URL = settings.REDIS_URL


@pytest.fixture(scope="session")
def event_loop_policy():
    return asyncio.DefaultEventLoopPolicy()


@pytest_asyncio.fixture
async def db_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def redis_client() -> aioredis.Redis:
    client = aioredis.from_url(REDIS_URL, decode_responses=True)
    yield client
    await client.aclose()


@pytest_asyncio.fixture
async def http_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def sample_market(db_session):
    from app.models.market import Market
    market = Market(
        id=uuid.uuid4(),
        name="Test Market",
        country_code="AE",
        currency="AED",
        timezone="Asia/Dubai",
    )
    db_session.add(market)
    await db_session.commit()
    await db_session.refresh(market)
    return market


@pytest_asyncio.fixture
async def sample_customer(db_session, sample_market):
    from app.models.customer import Customer
    customer = Customer(
        id=uuid.uuid4(),
        market_id=sample_market.id,
        full_name="Test Customer",
        phone="+971501234567",
    )
    db_session.add(customer)
    await db_session.commit()
    await db_session.refresh(customer)
    return customer


@pytest_asyncio.fixture
async def sample_address(db_session, sample_customer, sample_market):
    from app.models.customer import CustomerAddress
    address = CustomerAddress(
        id=uuid.uuid4(),
        customer_id=sample_customer.id,
        market_id=sample_market.id,
        address_line_1="123 Test St",
        city="Dubai",
        emirate="Dubai",
        country_code="AE",
    )
    db_session.add(address)
    await db_session.commit()
    await db_session.refresh(address)
    return address


@pytest_asyncio.fixture
async def sample_order(db_session, sample_market, sample_customer, sample_address):
    from app.models.order import Order
    order = Order(
        id=uuid.uuid4(),
        market_id=sample_market.id,
        customer_id=sample_customer.id,
        customer_address_id=sample_address.id,
        status="created",
        service_type="wash_and_fold",
        currency="AED",
    )
    db_session.add(order)
    await db_session.commit()
    await db_session.refresh(order)
    return order


@pytest_asyncio.fixture
async def sample_conversation(db_session, sample_market, sample_customer, sample_order):
    from app.models.conversation import Conversation
    conv = Conversation(
        id=uuid.uuid4(),
        market_id=sample_market.id,
        customer_id=sample_customer.id,
        order_id=sample_order.id,
        channel="whatsapp",
        status="active",
    )
    db_session.add(conv)
    await db_session.commit()
    await db_session.refresh(conv)
    return conv


@pytest_asyncio.fixture
async def sample_message(db_session, sample_conversation, sample_market):
    from app.models.conversation import Message
    msg = Message(
        id=uuid.uuid4(),
        conversation_id=sample_conversation.id,
        market_id=sample_market.id,
        sender_type="customer",
        body="I need pickup today for my laundry",
    )
    db_session.add(msg)
    await db_session.commit()
    await db_session.refresh(msg)
    return msg
