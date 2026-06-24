"""
LLM offline provider tests.

Verifies that:
- MockProvider returns valid responses without any external API call
- LLMService writes every call to AIActionLog
- No Anthropic key is required
"""
import os
import uuid
import pytest
from sqlalchemy import select

os.environ["MOCK_LLM"] = "true"

from app.services.llm.mock_provider import MockProvider
from app.services.llm.service import LLMService
from app.services.llm.base import LLMRequest
from app.models.ai_log import AIActionLog
from app.db.session import AsyncSessionLocal


@pytest.mark.asyncio
async def test_mock_provider_returns_response_without_api_key(redis_client):
    provider = MockProvider()
    request = LLMRequest(
        action_type="general",
        messages=[{"role": "user", "content": "Hello"}],
    )
    response = await provider.complete(request)
    assert response.content
    assert response.provider == "mock"
    assert response.total_tokens > 0


@pytest.mark.asyncio
async def test_mock_provider_classifier_output_is_valid_json(redis_client):
    import json
    from app.schemas.classifier import ClassifierOutput

    provider = MockProvider()
    request = LLMRequest(
        action_type="conversation_classifier",
        messages=[{"role": "user", "content": "I need pickup"}],
    )
    response = await provider.complete(request)
    parsed = ClassifierOutput.model_validate(json.loads(response.content))
    assert parsed.intent
    assert parsed.sentiment in ("positive", "neutral", "negative")
    assert 0.0 <= parsed.sentiment_score <= 1.0


@pytest.mark.asyncio
async def test_llm_service_writes_ai_action_log(redis_client, sample_conversation):
    conv_id = sample_conversation.id
    provider = MockProvider()
    service = LLMService(
        provider=provider,
        redis_client=redis_client,
        session_factory=AsyncSessionLocal,
    )
    request = LLMRequest(
        action_type="test_action",
        messages=[{"role": "user", "content": "test"}],
        conversation_id=conv_id,
    )
    await service.complete(request)

    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(AIActionLog).where(
                AIActionLog.conversation_id == conv_id,
                AIActionLog.action_type == "test_action",
            )
        )
        log = result.scalar_one_or_none()
        assert log is not None, "AIActionLog entry was not created"
        assert log.provider == "mock"
        assert log.total_tokens > 0
        assert log.status == "success"
