"""
Privacy filter — redacts PII before text reaches an LLM prompt.

Phone numbers and email addresses are replaced with structured placeholders
so that no raw customer contact data enters the LLM context.
"""
import re

_PHONE_RE = re.compile(
    r"(?<!\w)"
    r"(\+?[\d][\d\s\-\(\)\.]{5,17}[\d])"
    r"(?!\w)"
)

_EMAIL_RE = re.compile(
    r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
)

PHONE_PLACEHOLDER = "[PHONE_REDACTED]"
EMAIL_PLACEHOLDER = "[EMAIL_REDACTED]"


def redact_phones(text: str) -> str:
    return _PHONE_RE.sub(PHONE_PLACEHOLDER, text)


def redact_emails(text: str) -> str:
    return _EMAIL_RE.sub(EMAIL_PLACEHOLDER, text)


def apply_privacy_filter(text: str) -> str:
    text = redact_phones(text)
    text = redact_emails(text)
    return text
