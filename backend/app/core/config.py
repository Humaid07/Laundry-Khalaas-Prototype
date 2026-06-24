from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    DEBUG: bool = True
    MOCK_LLM: bool = True

    DATABASE_URL: str = "postgresql+asyncpg://laundrykhalaas:laundrykhalaas_dev@postgres:5432/laundrykhalaas"
    POSTGRES_USER: str = "laundrykhalaas"
    POSTGRES_PASSWORD: str = "laundrykhalaas_dev"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "laundrykhalaas"

    REDIS_URL: str = "redis://redis:6379/0"
    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"

    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_COMPLEX_MODEL: str = "claude-sonnet-4-6"
    ANTHROPIC_ROUTINE_MODEL: str = "claude-haiku-4-5-20251001"

    LLM_PER_MESSAGE_TOKEN_CAP: int = 2000
    LLM_CONVERSATION_TOKEN_CEILING: int = 20000

    @property
    def sync_database_url(self) -> str:
        return self.DATABASE_URL.replace(
            "postgresql+asyncpg://", "postgresql+psycopg2://"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
