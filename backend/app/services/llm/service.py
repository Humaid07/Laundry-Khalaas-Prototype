"""
LLMService — single entry point for all LLM calls.

Enforces:
  Layer 1: per-message token cap (LLM_PER_MESSAGE_TOKEN_CAP)
  Layer 2: per-conversation token ceiling via Redis atomic counters (LLM_CONVERSATION_TOKEN_CEILING)

Writes every call to AIActionLog and updates CostTracking.
"""
import uuid
from typing import Optional

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.config import settings
from app.services.llm.base import LLMProvider, LLMRequest, LLMResponse
from app.models.ai_log import AIActionLog, CostTracking


class TokenCeilingExceededError(Exception):
    """Raised when a conversation has consumed its token budget."""


def get_provider() -> LLMProvider:
    if settings.MOCK_LLM or not settings.ANTHROPIC_API_KEY:
        from app.services.llm.mock_provider import MockProvider
        return MockProvider()
    from app.services.llm.anthropic_provider import AnthropicProvider
    return AnthropicProvider()


class LLMService:
    def __init__(
        self,
        provider: LLMProvider,
        redis_client: aioredis.Redis,
        session_factory: async_sessionmaker[AsyncSession],
    ) -> None:
        self.provider = provider
        self.redis = redis_client
        self.session_factory = session_factory

    async def complete(self, request: LLMRequest) -> LLMResponse:
        # Layer 1: cap per-message max_tokens
        if request.max_tokens > settings.LLM_PER_MESSAGE_TOKEN_CAP:
            request.max_tokens = settings.LLM_PER_MESSAGE_TOKEN_CAP

        # Layer 2: check Redis conversation ceiling
        if request.conversation_id:
            await self._check_ceiling(request.conversation_id)

        response = await self.provider.complete(request)

        # Update Redis counter atomically
        if request.conversation_id:
            key = f"conversation:{request.conversation_id}:tokens"
            await self.redis.incrby(key, response.total_tokens)

        # Persist AIActionLog and CostTracking
        await self._persist_log(request, response)

        return response

    async def _check_ceiling(self, conversation_id: uuid.UUID) -> None:
        key = f"conversation:{conversation_id}:tokens"
        raw = await self.redis.get(key)
        current = int(raw) if raw else 0
        if current >= settings.LLM_CONVERSATION_TOKEN_CEILING:
            raise TokenCeilingExceededError(
                f"Conversation {conversation_id} has reached its token ceiling "
                f"({current}/{settings.LLM_CONVERSATION_TOKEN_CEILING})."
            )

    async def _persist_log(self, request: LLMRequest, response: LLMResponse) -> None:
        async with self.session_factory() as session:
            log = AIActionLog(
                id=uuid.uuid4(),
                conversation_id=request.conversation_id,
                message_id=request.message_id,
                provider=response.provider,
                model=response.model,
                action_type=request.action_type,
                prompt_tokens=response.prompt_tokens,
                completion_tokens=response.completion_tokens,
                total_tokens=response.total_tokens,
                estimated_cost=response.estimated_cost,
                status="success",
            )
            session.add(log)

            if request.conversation_id:
                from sqlalchemy import select
                result = await session.execute(
                    select(CostTracking).where(
                        CostTracking.conversation_id == request.conversation_id
                    )
                )
                tracking = result.scalar_one_or_none()
                if tracking:
                    tracking.total_prompt_tokens += response.prompt_tokens
                    tracking.total_completion_tokens += response.completion_tokens
                    tracking.total_tokens += response.total_tokens
                    tracking.total_estimated_cost += response.estimated_cost
                else:
                    tracking = CostTracking(
                        id=uuid.uuid4(),
                        conversation_id=request.conversation_id,
                        total_prompt_tokens=response.prompt_tokens,
                        total_completion_tokens=response.completion_tokens,
                        total_tokens=response.total_tokens,
                        total_estimated_cost=response.estimated_cost,
                    )
                    session.add(tracking)

            await session.commit()
