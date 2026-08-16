import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    DATABASE_URL: str = "sqlite:///./resumeai.db"
    JWT_SECRET: str = "dev_placeholder_jwt_secret_change_me_before_deploying"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    PROJECT_NAME: str = "ResumeAI Pro"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    def __init__(self, **values):
        super().__init__(**values)
        if self.ENVIRONMENT.lower() == "production":
            if self.JWT_SECRET in (
                "supersecretjwtsecretkeyforresumeaiprodevelopment123",
                "dev_placeholder_jwt_secret_change_me_before_deploying",
                "your_jwt_secret_key_here"
            ) or not self.JWT_SECRET:
                raise ValueError("JWT_SECRET must be set to a secure custom value in production mode!")
            if self.DATABASE_URL.startswith("sqlite"):
                raise ValueError("DATABASE_URL must be a production-ready database (e.g. PostgreSQL) in production mode!")

settings = Settings()
