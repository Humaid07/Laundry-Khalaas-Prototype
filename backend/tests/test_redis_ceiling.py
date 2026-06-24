"""
Redis token ceiling tests.

Verifies that:
- The per-conversation token ceiling is enforced using Redis counters
- Further calls are rejected once the ceiling is reached
- Redis (not in-memory Python state) is the source of truth
"""
import uuid
import pytest

from app.services.llm.mock_provider import MockProvider
from app.services.llm.service import LLMService, TokenCeilingExceededError
from app.services.llm.base import LLMRequest
from app.db.session import AsyncSessionLocal
from app.core.config import settings


@pytest.mark.asyncio
async def test_redis_ceiling_blocks_when_exceeded(redis_client):
    conv_id = uuid.uuid4()
    key = f"conversation:{conv_id}:tokens"

    # Seed the Redis counter just below the ceiling
    ceiling = settings.LLM_CONVERSATION_TOKEN_CEILING
    await redis_client.set(key, ceiling)

    provider = MockProvider()
    service = LLMService(
        provider=provider,
        redis_client=redis_client,
        session_factory=AsyncSessionLocal,
    )

    request = LLMRequest(
        action_type="test",
        messages=[{"role": "user", "content": "hello"}],
        conversation_id=conv_id,
    )

    with pytest.raises(TokenCeilingExceededError):
        await service.complete(request)

    # Clean up
    await redis_client.delete(key)


@pytest.mark.asyncio
async def test_redis_counter_increments_per_call(redis_client):
    conv_id = uuid.uuid4()
    key = f"conversation:{conv_id}:tokens"
    await redis_client.delete(key)

    provider = MockProvider()
    service = LLMService(
        provider=provider,
        redis_client=redis_client,
        session_factory=AsyncSessionLocal,
    )

    request = LLMRequest(
        action_type="test",
        messages=[{"role": "user", "content": "hi"}],
        conversation_id=conv_id,
    )

    await service.complete(request)
    val_after_first = int(await redis_client.get(key) or 0)
    assert val_after_first > 0

    await service.complete(request)
    val_after_second = int(await redis_client.get(key) or 0)
    assert val_after_second > val_after_first, "Redis counter did not increment on second call"

    await redis_client.delete(key)
