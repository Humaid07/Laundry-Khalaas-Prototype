from abc import ABC, abstractmethod
from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class LLMRequest(BaseModel):
    action_type: str
    messages: list[dict]
    max_tokens: int = 1000
    conversation_id: Optional[UUID] = None
    message_id: Optional[UUID] = None


class LLMResponse(BaseModel):
    content: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    estimated_cost: float
    provider: str
    model: str


class LLMProvider(ABC):
    @abstractmethod
    async def complete(self, request: LLMRequest) -> LLMResponse:
        """Send a completion request and return a structured response."""
        ...
