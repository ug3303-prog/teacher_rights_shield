from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "교권보호 도우미 - 민원방패"
    app_mode: str = "demo"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./minwon_shield.db"
    ai_provider: str = "local"
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None
    storage_dir: str = "storage"
    frontend_origin: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8")

    @property
    def is_demo(self) -> bool:
        return self.app_mode.lower() == "demo"

    @property
    def resolved_database_url(self) -> str:
        prefix = "sqlite:///"
        if not self.database_url.startswith(prefix):
            return self.database_url

        database_path = self.database_url[len(prefix) :]
        if database_path == ":memory:" or Path(database_path).is_absolute():
            return self.database_url

        absolute_path = (BACKEND_DIR / database_path).resolve()
        return f"{prefix}{absolute_path.as_posix()}"

    @property
    def report_dir(self) -> Path:
        storage_path = Path(self.storage_dir)
        if not storage_path.is_absolute():
            storage_path = BACKEND_DIR / storage_path
        path = storage_path / "reports"
        path.mkdir(parents=True, exist_ok=True)
        return path


@lru_cache
def get_settings() -> Settings:
    return Settings()
