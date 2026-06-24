"""
Privacy filter tests — non-negotiable.

Verifies that phone numbers and emails are redacted before text enters an LLM prompt.
A raw phone number must never appear in the assembled prompt.
"""
import pytest

from app.services.privacy import apply_privacy_filter, PHONE_PLACEHOLDER, EMAIL_PLACEHOLDER


UAE_PHONE = "+971 50 123 4567"
UAE_PHONE_COMPACT = "+971501234567"
LOCAL_PHONE = "0501234567"
EMAIL = "customer@example.com"


def test_uae_international_phone_is_redacted():
    result = apply_privacy_filter(f"My number is {UAE_PHONE} and I need pickup today")
    assert UAE_PHONE not in result
    assert PHONE_PLACEHOLDER in result


def test_compact_uae_phone_is_redacted():
    result = apply_privacy_filter(f"Call me on {UAE_PHONE_COMPACT}")
    assert UAE_PHONE_COMPACT not in result
    assert PHONE_PLACEHOLDER in result


def test_local_uae_phone_is_redacted():
    result = apply_privacy_filter(f"My phone: {LOCAL_PHONE}")
    assert LOCAL_PHONE not in result
    assert PHONE_PLACEHOLDER in result


def test_email_is_redacted():
    result = apply_privacy_filter(f"Email me at {EMAIL}")
    assert EMAIL not in result
    assert EMAIL_PLACEHOLDER in result


def test_message_with_no_pii_is_unchanged():
    clean = "I need my laundry picked up tomorrow morning"
    result = apply_privacy_filter(clean)
    assert result == clean
    assert PHONE_PLACEHOLDER not in result


def test_privacy_filter_used_before_llm_prompt_assembly():
    """
    Simulate the exact path used by the classifier:
    raw customer body → privacy filter → LLM prompt.
    The raw phone must not appear anywhere in the final prompt.
    """
    raw_body = f"My number is {UAE_PHONE} and I need pickup today"
    safe_body = apply_privacy_filter(raw_body)

    classifier_prompt = f"Classify this message:\n{safe_body}"

    assert UAE_PHONE not in classifier_prompt, (
        f"Raw phone number leaked into LLM prompt. Prompt was: {classifier_prompt}"
    )
    assert PHONE_PLACEHOLDER in classifier_prompt
