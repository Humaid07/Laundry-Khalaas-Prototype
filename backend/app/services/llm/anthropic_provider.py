"""
AnthropicProvider — production LLM provider using Claude models.

Only active when MOCK_LLM=false and a valid ANTHROPIC_API_KEY is set.
"""
from app.services.llm.base import LLMProvider, LLMRequest, LLMResponse
from app.core.config import settings

COST_PER_1K_TOKENS = {
    settings.ANTHROPIC_COMPLEX_MODEL: {"prompt": 0.003, "completion": 0.015},
    settings.ANTHROPIC_ROUTINE_MODEL: {"prompt": 0.00025, "completion": 0.00125},
}
DEFAULT_COST = {"prompt": 0.003, "completion": 0.015}


class AnthropicProvider(LLMProvider):
    PROVIDER_NAME = "anthropic"

    def __init__(self, model: str | None = None):
        self.model = model or settings.ANTHROPIC_COMPLEX_MODEL

    async def complete(self, request: LLMRequest) -> LLMResponse:
        try:
            import anthropic
        except ImportError as exc:
            raise RuntimeError("anthropic package is required for AnthropicProvider") from exc

        client = anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

        system_messages = [m for m in request.messages if m.get("role") == "system"]
        user_messages = [m for m in request.messages if m.get("role") != "system"]
        system_text = system_messages[0]["content"] if system_messages else None

        response = await client.messages.create(
            model=self.model,
            max_tokens=request.max_tokens,
            system=system_text,
            messages=user_messages,
        )

        content = response.content[0].text
        prompt_tokens = response.usage.input_tokens
        completion_tokens = response.usage.output_tokens
        total_tokens = prompt_tokens + completion_tokens

        costs = COST_PER_1K_TOKENS.get(self.model, DEFAULT_COST)
        estimated_cost = (
            prompt_tokens / 1000 * costs["prompt"]
            + completion_tokens / 1000 * costs["completion"]
        )

        return LLMResponse(
            content=content,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            estimated_cost=estimated_cost,
            provider=self.PROVIDER_NAME,
            model=self.model,
        )
