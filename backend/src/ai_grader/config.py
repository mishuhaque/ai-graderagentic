from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    anthropic_api_key: str = ""
    environment: str = "development"
    debug: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
