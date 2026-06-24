"""
Conversation classifier tests.

Verifies that after running the classifier, the message row has all five
required fields populated with deterministic values from the offline provider.
"""
import uuid
import pytest
from sqlalchemy import select

from app.tasks.classifier import _classify_async
from app.models.conversation import Message


@pytest.mark.asyncio
async def test_classifier_populates_all_five_fields(db_session, sample_message):
    message_id = str(sample_message.id)

    result = await _classify_async(message_id)

    assert "intent" in result
    assert "sentiment" in result
    assert "sentiment_score" in result
    assert "sales_stage_delta" in result
    assert "topic" in result

    # Verify DB was updated
    await db_session.refresh(sample_message)
    assert sample_message.intent is not None
    assert sample_message.sentiment is not None
    assert sample_message.sentiment_score is not None
    assert sample_message.sales_stage_delta is not None
    assert sample_message.topic is not None


@pytest.mark.asyncio
async def test_classifier_deterministic_values(db_session, sample_message):
    """MockProvider returns fixed values — verify they are exactly correct."""
    message_id = str(sample_message.id)
    result = await _classify_async(message_id)

    assert result["intent"] == "booking_request"
    assert result["sentiment"] == "positive"
    assert result["sentiment_score"] == pytest.approx(0.85)
    assert result["sales_stage_delta"] == "interest"
    assert result["topic"] == "laundry_pickup"
