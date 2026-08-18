from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")


def _path_from_env(name: str, default: str) -> Path:
    raw = Path(os.getenv(name, default))
    return raw if raw.is_absolute() else (BACKEND_DIR / raw).resolve()


def _csv(name: str, default: str) -> tuple[str, ...]:
    return tuple(item.strip() for item in os.getenv(name, default).split(",") if item.strip())


@dataclass(frozen=True)
class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    app_secret: str = os.getenv("APP_SECRET", "development-only-change-me")
    allow_dev_login: bool = os.getenv("ALLOW_DEV_LOGIN", "true").lower() == "true"
    database_path: Path = _path_from_env("DATABASE_PATH", "./data/industry_atlas.db")
    upload_dir: Path = _path_from_env("UPLOAD_DIR", "./data/uploads")
    max_upload_mb: int = int(os.getenv("MAX_UPLOAD_MB", "30"))
    deepseek_api_key: str = os.getenv("DEEPSEEK_API_KEY", "")
    deepseek_base_url: str = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com").rstrip("/")
    deepseek_model: str = os.getenv("DEEPSEEK_MODEL", "deepseek-v4-flash")
    wechat_app_id: str = os.getenv("WECHAT_APP_ID", "")
    wechat_app_secret: str = os.getenv("WECHAT_APP_SECRET", "")
    cors_origins: tuple[str, ...] = _csv("CORS_ORIGINS", "http://127.0.0.1:5173,http://localhost:5173")
    allowed_hosts: tuple[str, ...] = _csv("ALLOWED_HOSTS", "127.0.0.1,localhost,testserver")

    def production_issues(self) -> list[str]:
        if self.app_env.lower() != "production":
            return []
        issues: list[str] = []
        if len(self.app_secret) < 32 or self.app_secret == "development-only-change-me":
            issues.append("APP_SECRET 必须设置为至少 32 位随机值")
        if self.allow_dev_login:
            issues.append("生产环境必须关闭 ALLOW_DEV_LOGIN")
        if not self.deepseek_api_key:
            issues.append("尚未配置 DEEPSEEK_API_KEY")
        if not self.wechat_app_id or not self.wechat_app_secret:
            issues.append("尚未配置微信小程序 AppID/AppSecret")
        if not self.allowed_hosts or "*" in self.allowed_hosts:
            issues.append("生产环境必须限制 ALLOWED_HOSTS")
        return issues


settings = Settings()
