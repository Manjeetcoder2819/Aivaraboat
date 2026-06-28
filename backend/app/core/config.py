from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # Supabase Connection
    database_url: str
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str = ""
    db_user: str = "postgres"
    db_password: str = ""
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "postgres"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT Authentication
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    # ChromaDB (optional/legacy)
    chroma_persist_dir: str = "./chroma_db"
    chroma_collection_name: str = "medical_knowledge"

    # Embeddings
    hf_embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    # MiniLM cosine scores for useful medical matches commonly sit around 0.25-0.50.
    similarity_threshold: float = 0.25
    top_k_results: int = 2

    # App Config
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    frontend_url: str = "http://localhost:3000"
    log_level: str = "INFO"
    rate_limit_per_minute: int = 30
    cors_origins: str = "*"

    # Fully local LLM (downloaded once, then loaded from the Hugging Face cache)
    local_model_id: str = "Qwen/Qwen2.5-0.5B-Instruct"
    local_max_new_tokens: int = 256

    @property
    def llm_model(self) -> str:
        return self.local_model_id

    @property
    def cors_origin_list(self) -> list[str]:
        if not self.cors_origins or self.cors_origins == "*":
            return [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3001",
            ]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    # Pydantic Settings V2 configuration
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()
