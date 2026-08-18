from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")


def _desktop_settings_file() -> Path | None:
    raw = os.getenv("DESKTOP_SETTINGS_PATH", "").strip()
    return Path(raw).expanduser().resolve() if raw else None


def _load_desktop_settings() -> None:
    path = _desktop_settings_file()
    if not path or not path.exists():
        return
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return
    mapping = {
        "api_key": "DEEPSEEK_API_KEY",
        "base_url": "DEEPSEEK_BASE_URL",
        "model": "DEEPSEEK_MODEL",
    }
    for source, target in mapping.items():
        value = str(payload.get(source) or "").strip()
        if value:
            os.environ[target] = value


_load_desktop_settings()


def _path_from_env(name: str, default: str) -> Path:
    raw = Path(os.getenv(name, default))
    return raw if raw.is_absolute() else (BACKEND_DIR / raw).resolve()


def _csv(name: str, default: str) -> tuple[str, ...]:
    return tuple(item.strip() for item in os.getenv(name, default).split(",") if item.strip())


@dataclass
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
    desktop_settings_path: Path | None = _desktop_settings_file()
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


def save_desktop_ai_settings(api_key: str | None, base_url: str, model: str) -> None:
    path = settings.desktop_settings_path
    if settings.app_env.lower() != "desktop" or path is None:
        raise RuntimeError("桌面设置只在 Windows 本地版中可用")
    if api_key is not None:
        settings.deepseek_api_key = api_key.strip()
    settings.deepseek_base_url = base_url.strip().rstrip("/") or "https://api.deepseek.com"
    settings.deepseek_model = model.strip() or "deepseek-v4-flash"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            {
                "api_key": settings.deepseek_api_key,
                "base_url": settings.deepseek_base_url,
                "model": settings.deepseek_model,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
