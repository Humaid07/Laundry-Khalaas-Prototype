from typing import Optional
from pydantic import BaseModel


class RLSStatus(BaseModel):
    orders: str
    messages: str
    customer_addresses: str


class VerificationStatus(BaseModel):
    status: str
    database: str
    redis: str
    pgvector: str
    rls: RLSStatus
    llm_mode: str
    health: str


class ClassifierDemoResult(BaseModel):
    message_id: str
    intent: str
    sentiment: str
    sentiment_score: float
    sales_stage_delta: str
    topic: str
    redaction_applied: bool
    raw_phone_in_prompt: bool
    ai_action_logged: bool
    llm_mode: str
