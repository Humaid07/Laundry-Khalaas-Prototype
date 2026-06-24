"""
MockProvider — offline deterministic provider for tests and verification mode.

Returns fixed, structured responses without any external API calls.
Used when MOCK_LLM=true or when no Anthropic key is configured.
"""
import json
from app.services.llm.base import LLMProvider, LLMRequest, LLMResponse


class MockProvider(LLMProvider):
    PROVIDER_NAME = "mock"
    MODEL_NAME = "mock-deterministic-v1"

    async def complete(self, request: LLMRequest) -> LLMResponse:
        content = self._build_response(request.action_type)
        prompt_tokens = self._estimate_tokens(request.messages)
        completion_tokens = self._estimate_tokens([{"content": content}])

        return LLMResponse(
            content=content,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
            estimated_cost=0.0,
            provider=self.PROVIDER_NAME,
            model=self.MODEL_NAME,
        )

    def _build_response(self, action_type: str) -> str:
        if action_type == "conversation_classifier":
            return json.dumps({
                "intent": "booking_request",
                "sentiment": "positive",
                "sentiment_score": 0.85,
                "sales_stage_delta": "interest",
                "topic": "laundry_pickup",
            })
        return "Offline deterministic response from verification provider."

    def _estimate_tokens(self, messages: list[dict]) -> int:
        total_chars = sum(len(str(m.get("content", ""))) for m in messages)
        return max(1, total_chars // 4)
