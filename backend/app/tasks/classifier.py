"""
Conversation classifier — Celery task (System 3).

Loads a message from the database, applies the privacy filter, calls the
LLM service, validates the structured output, then writes five classifier
fields back to the message row.

NOTE: The full Section D.4 prompt spec was not found in this repository.
A functional placeholder prompt is used. Replace the CLASSIFIER_PROMPT
constant with the exact text from Section D.4 when available.
See DELIVERY_NOTES.md § Spec Gaps.
"""
import asyncio
import json
import uuid
import logging

from app.core.celery_app import celery_app
from app.core.config import settings
from app.schemas.classifier import ClassifierOutput
from app.services.privacy import apply_privacy_filter

logger = logging.getLogger(__name__)

CLASSIFIER_PROMPT = """
You are a conversation classifier for a laundry operations platform.

Analyse the customer message provided and return a JSON object with exactly these five fields:
- intent: primary intent (e.g. booking_request, status_inquiry, complaint, general_inquiry, cancellation)
- sentiment: one of positive, neutral, negative
- sentiment_score: float 0.0–1.0 (1.0 = strongly positive)
- sales_stage_delta: how this message moves the sales stage (e.g. interest, consideration, decision, none)
- topic: primary topic (e.g. laundry_pickup, pricing, delivery, quality, account)

Return only valid JSON, no additional text.
"""


def _run_classifier_sync(message_id: str) -> dict:
    """Synchronous wrapper that runs the async classifier logic."""
    return asyncio.run(_classify_async(message_id))


async def _classify_async(message_id: str) -> dict:
    from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
    from sqlalchemy import select
    import redis.asyncio as aioredis

    from app.models.conversation import Message
    from app.services.llm.service import LLMService, get_provider
    from app.services.llm.base import LLMRequest

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)

    try:
        async with session_factory() as session:
            result = await session.execute(
                select(Message).where(Message.id == uuid.UUID(message_id))
            )
            message = result.scalar_one_or_none()
            if not message:
                raise ValueError(f"Message {message_id} not found")

            safe_body = apply_privacy_filter(message.body)

            llm_request = LLMRequest(
                action_type="conversation_classifier",
                messages=[
                    {"role": "system", "content": CLASSIFIER_PROMPT},
                    {"role": "user", "content": safe_body},
                ],
                max_tokens=500,
                conversation_id=message.conversation_id,
                message_id=message.id,
            )

            service = LLMService(
                provider=get_provider(),
                redis_client=redis_client,
                session_factory=session_factory,
            )
            response = await service.complete(llm_request)

            output = ClassifierOutput.model_validate(json.loads(response.content))

            message.intent = output.intent
            message.sentiment = output.sentiment
            message.sentiment_score = float(output.sentiment_score)
            message.sales_stage_delta = output.sales_stage_delta
            message.topic = output.topic
            await session.commit()

            return output.model_dump()
    finally:
        await redis_client.aclose()
        await engine.dispose()


@celery_app.task(name="app.tasks.classifier.classify_message", bind=True, max_retries=3)
def classify_message(self, message_id: str) -> dict:
    try:
        return _run_classifier_sync(message_id)
    except Exception as exc:
        logger.exception("Classifier task failed for message %s", message_id)
        raise self.retry(exc=exc, countdown=30)
