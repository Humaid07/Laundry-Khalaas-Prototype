from pydantic import BaseModel, Field


class ClassifierOutput(BaseModel):
    intent: str = Field(..., description="Primary intent of the message")
    sentiment: str = Field(..., description="Sentiment label: positive, neutral, or negative")
    sentiment_score: float = Field(..., ge=0.0, le=1.0, description="Sentiment confidence 0–1")
    sales_stage_delta: str = Field(..., description="Change in sales stage this message represents")
    topic: str = Field(..., description="Primary topic category")
