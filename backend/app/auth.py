from __future__ import annotations

import base64
import binascii
import hashlib
import hmac
import os
import time
from dataclasses import dataclass

from fastapi import Header, HTTPException

from .config import settings
from .db import connection, row_dict


TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7
PASSWORD_N = 2**14


@dataclass(frozen=True)
class CurrentUser:
    id: str
    display_name: str


def _sign(value: str) -> str:
    return hmac.new(settings.app_secret.encode(), value.encode(), hashlib.sha256).hexdigest()


def issue_token(user_id: str) -> str:
    payload = f"{user_id}.{int(time.time()) + TOKEN_TTL_SECONDS}"
    signed = f"{payload}.{_sign(payload)}"
    return base64.urlsafe_b64encode(signed.encode()).decode().rstrip("=")


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=PASSWORD_N, r=8, p=1, dklen=32)
    return f"scrypt${PASSWORD_N}$8$1${base64.urlsafe_b64encode(salt).decode()}${base64.urlsafe_b64encode(digest).decode()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        algorithm, n, r, p, salt, expected = encoded.split("$", 5)
        if algorithm != "scrypt":
            return False
        digest = hashlib.scrypt(password.encode(), salt=base64.urlsafe_b64decode(salt), n=int(n), r=int(r), p=int(p), dklen=32)
        return hmac.compare_digest(digest, base64.urlsafe_b64decode(expected))
    except (ValueError, TypeError, binascii.Error):
        return False


def _decode_token(token: str) -> str:
    try:
        padded = token + "=" * (-len(token) % 4)
        raw = base64.urlsafe_b64decode(padded).decode()
        user_id, expires, signature = raw.rsplit(".", 2)
        payload = f"{user_id}.{expires}"
        if not hmac.compare_digest(signature, _sign(payload)) or int(expires) < int(time.time()):
            raise ValueError
        return user_id
    except (ValueError, UnicodeDecodeError, binascii.Error):
        raise HTTPException(status_code=401, detail="登录会话无效或已过期") from None


def require_user(authorization: str = Header(default="")) -> CurrentUser:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="缺少登录会话")
    user_id = _decode_token(authorization[7:].strip())
    with connection() as conn:
        user = row_dict(conn.execute("SELECT id,display_name FROM users WHERE id=?", (user_id,)).fetchone())
    if not user:
        raise HTTPException(status_code=401, detail="用户不存在")
    return CurrentUser(**user)


def require_workspace_role(workspace_id: str, user_id: str, allowed: set[str]) -> str:
    with connection() as conn:
        row = conn.execute(
            "SELECT role FROM workspace_members WHERE workspace_id=? AND user_id=?",
            (workspace_id, user_id),
        ).fetchone()
    if not row or row["role"] not in allowed:
        raise HTTPException(status_code=403, detail="没有访问此研究空间的权限")
    return str(row["role"])
