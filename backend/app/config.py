from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings, loaded from environment / backend/.env."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/mts"
    )
    cors_origins: list[str] = ["http://localhost:3000"]


settings = Settings()
