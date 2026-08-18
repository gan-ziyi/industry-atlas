from __future__ import annotations

import json
import os
import secrets
import subprocess
import sys
import threading
import time
import traceback
import urllib.request
import webbrowser
from pathlib import Path


APP_NAME = "IndustryAtlas"
APP_URL = "http://127.0.0.1:8000"


def app_data_dir() -> Path:
    root = os.getenv("LOCALAPPDATA") or str(Path.home() / "AppData" / "Local")
    path = Path(root) / APP_NAME
    path.mkdir(parents=True, exist_ok=True)
    return path


def stable_app_secret(root: Path) -> str:
    path = root / "runtime.json"
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        if len(str(payload.get("app_secret") or "")) >= 32:
            return str(payload["app_secret"])
    except (OSError, json.JSONDecodeError):
        pass
    value = secrets.token_urlsafe(48)
    path.write_text(json.dumps({"app_secret": value}, indent=2), encoding="utf-8")
    return value


def configure_environment(root: Path) -> None:
    data = root / "data"
    os.environ.update(
        {
            "APP_ENV": "desktop",
            "APP_SECRET": stable_app_secret(root),
            "ALLOW_DEV_LOGIN": "true",
            "DATABASE_PATH": str(data / "industry_atlas.db"),
            "UPLOAD_DIR": str(data / "uploads"),
            "DESKTOP_SETTINGS_PATH": str(root / "settings.json"),
            "CORS_ORIGINS": APP_URL,
            "ALLOWED_HOSTS": "127.0.0.1,localhost",
        }
    )


def service_is_ready() -> bool:
    try:
        with urllib.request.urlopen(f"{APP_URL}/api/health", timeout=1.5) as response:
            payload = json.loads(response.read().decode("utf-8"))
        return payload.get("status") == "ok" and payload.get("service") == "industry-atlas-api"
    except Exception:
        return False


def open_app_window(root: Path) -> None:
    if os.getenv("INDUSTRY_ATLAS_NO_BROWSER") == "1":
        return
    profile = root / "browser-profile"
    profile.mkdir(parents=True, exist_ok=True)
    candidates = [
        Path(os.getenv("PROGRAMFILES(X86)", "")) / "Microsoft/Edge/Application/msedge.exe",
        Path(os.getenv("PROGRAMFILES", "")) / "Microsoft/Edge/Application/msedge.exe",
    ]
    edge = next((path for path in candidates if path.is_file()), None)
    if edge:
        subprocess.Popen(
            [str(edge), f"--app={APP_URL}", f"--user-data-dir={profile}", "--no-first-run"],
            close_fds=True,
        )
    else:
        webbrowser.open(APP_URL)


def open_when_ready(root: Path) -> None:
    for _ in range(80):
        if service_is_ready():
            open_app_window(root)
            return
        time.sleep(0.25)


def bundled_web_dir() -> Path:
    base = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parents[1]))
    path = base / "web_dist"
    if not (path / "index.html").exists():
        raise FileNotFoundError(f"Web assets were not found: {path}")
    return path


def run() -> None:
    root = app_data_dir()
    configure_environment(root)
    if service_is_ready():
        open_app_window(root)
        return

    import uvicorn
    from fastapi.staticfiles import StaticFiles
    from app.main import app

    app.mount("/", StaticFiles(directory=bundled_web_dir(), html=True), name="desktop-web")
    threading.Thread(target=open_when_ready, args=(root,), daemon=True).start()
    uvicorn.run(app, host="127.0.0.1", port=8000, log_config=None, access_log=False)


if __name__ == "__main__":
    try:
        run()
    except Exception:
        root = app_data_dir()
        (root / "startup-error.log").write_text(traceback.format_exc(), encoding="utf-8")
        try:
            import ctypes

            ctypes.windll.user32.MessageBoxW(0, f"产业研究工作台启动失败。\n请查看：{root / 'startup-error.log'}", "Industry Atlas", 0x10)
        except Exception:
            pass
        raise
