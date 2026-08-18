from __future__ import annotations

import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any, Iterator

from .config import settings


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@contextmanager
def connection() -> Iterator[sqlite3.Connection]:
    conn = sqlite3.connect(settings.database_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db() -> None:
    settings.database_path.parent.mkdir(parents=True, exist_ok=True)
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    schema = """
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, display_name TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, owner_id TEXT NOT NULL,
      created_at TEXT NOT NULL, FOREIGN KEY(owner_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS workspace_members (
      workspace_id TEXT NOT NULL, user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('owner','editor','viewer')),
      created_at TEXT NOT NULL, PRIMARY KEY(workspace_id,user_id),
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, title TEXT NOT NULL,
      state_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, project_id TEXT,
      filename TEXT NOT NULL, storage_path TEXT NOT NULL, status TEXT NOT NULL,
      error TEXT, page_count INTEGER NOT NULL DEFAULT 0,
      char_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS document_chunks (
      id TEXT PRIMARY KEY, document_id TEXT NOT NULL, page_number INTEGER NOT NULL,
      text TEXT NOT NULL, created_at TEXT NOT NULL,
      FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS document_tables (
      id TEXT PRIMARY KEY, document_id TEXT NOT NULL, page_number INTEGER NOT NULL,
      table_number INTEGER NOT NULL, row_count INTEGER NOT NULL, column_count INTEGER NOT NULL,
      data_json TEXT NOT NULL, created_at TEXT NOT NULL,
      FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS ai_runs (
      id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, project_id TEXT,
      model TEXT NOT NULL, purpose TEXT NOT NULL, status TEXT NOT NULL,
      input_json TEXT NOT NULL, output_json TEXT, error TEXT,
      created_at TEXT NOT NULL, completed_at TEXT,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS document_extractions (
      id TEXT PRIMARY KEY, document_id TEXT NOT NULL, workspace_id TEXT NOT NULL,
      project_id TEXT, model TEXT NOT NULL, status TEXT NOT NULL,
      result_json TEXT, error TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      FOREIGN KEY(document_id) REFERENCES documents(id) ON DELETE CASCADE,
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
      FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE SET NULL
    );
    CREATE TABLE IF NOT EXISTS workspace_companies (
      id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL,
      normalized_name TEXT NOT NULL, name TEXT NOT NULL,
      data_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      UNIQUE(workspace_id,normalized_name),
      FOREIGN KEY(workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_workspace_companies_updated
      ON workspace_companies(workspace_id,updated_at DESC);
    """
    with connection() as conn:
        conn.executescript(schema)
        user_columns = {row["name"] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
        user_migrations = {
            "email": "ALTER TABLE users ADD COLUMN email TEXT",
            "password_hash": "ALTER TABLE users ADD COLUMN password_hash TEXT",
            "wechat_openid": "ALTER TABLE users ADD COLUMN wechat_openid TEXT",
            "wechat_unionid": "ALTER TABLE users ADD COLUMN wechat_unionid TEXT",
            "dev_key": "ALTER TABLE users ADD COLUMN dev_key TEXT",
        }
        for column, statement in user_migrations.items():
            if column not in user_columns:
                conn.execute(statement)
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL")
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wechat_openid ON users(wechat_openid) WHERE wechat_openid IS NOT NULL")
        conn.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_dev_key ON users(dev_key) WHERE dev_key IS NOT NULL")
        project_columns = {row["name"] for row in conn.execute("PRAGMA table_info(projects)").fetchall()}
        if "version" not in project_columns:
            conn.execute("ALTER TABLE projects ADD COLUMN version INTEGER NOT NULL DEFAULT 1")
        columns = {row["name"] for row in conn.execute("PRAGMA table_info(documents)").fetchall()}
        migrations = {
            "needs_ocr": "ALTER TABLE documents ADD COLUMN needs_ocr INTEGER NOT NULL DEFAULT 0",
            "ocr_page_count": "ALTER TABLE documents ADD COLUMN ocr_page_count INTEGER NOT NULL DEFAULT 0",
            "table_count": "ALTER TABLE documents ADD COLUMN table_count INTEGER NOT NULL DEFAULT 0",
            "extraction_mode": "ALTER TABLE documents ADD COLUMN extraction_mode TEXT NOT NULL DEFAULT 'text'",
        }
        for column, statement in migrations.items():
            if column not in columns:
                conn.execute(statement)


def row_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    return dict(row) if row else None


def json_dump(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, separators=(",", ":"))


def json_load(value: str) -> Any:
    return json.loads(value)
