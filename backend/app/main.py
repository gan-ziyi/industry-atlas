from __future__ import annotations

import json
import sqlite3
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any
from urllib.parse import quote, unquote

import httpx
from fastapi import BackgroundTasks, Body, Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import Response

from .auth import CurrentUser, hash_password, issue_token, require_user, require_workspace_role, verify_password
from .config import save_desktop_ai_settings, settings
from .db import connection, init_db, json_dump, json_load, row_dict, utc_now
from .documents import extract_pdf, ocr_pdf
from .extraction import extraction_response, run_document_extraction
from .exports import build_export
from .schemas import AccountLoginRequest, AccountRegisterRequest, CompanyMasterSyncRequest, DeepSeekRequest, DesktopSettingsUpdate, DevLoginRequest, DocumentExtractionRequest, LegacyImportRequest, ProjectCreate, ProjectUpdate, WechatBindRequest, WechatLoginRequest, WorkspaceCreate, WorkspaceMemberAdd, WorkspaceMemberUpdate


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="Industry Atlas API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=list(settings.allowed_hosts))


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex}"


def project_response(row: dict[str, Any]) -> dict[str, Any]:
    state_json = row.pop("state_json")
    return {**row, "state": json_load(state_json)}


def normalize_company_name(value: Any) -> str:
    return "".join(str(value or "").lower().split())


def normalize_email(value: str) -> str:
    email = value.strip().lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise HTTPException(status_code=422, detail="请输入有效邮箱")
    return email


def merge_unique(existing: list[Any], incoming: list[Any], key) -> list[Any]:
    result = list(existing)
    keys = {key(item) for item in result}
    for item in incoming:
        item_key = key(item)
        if item_key not in keys:
            result.append(item)
            keys.add(item_key)
    return result


def merge_company_data(existing: dict[str, Any], incoming: dict[str, Any]) -> dict[str, Any]:
    merged = {**existing}
    for field in ("name", "summary", "updatedAt"):
        if incoming.get(field):
            merged[field] = incoming[field]
    periods = [str(value) for value in (existing.get("reportPeriod"), incoming.get("reportPeriod")) if value]
    if periods:
        merged["reportPeriod"] = max(periods)
    merged["documents"] = merge_unique(existing.get("documents") or [], incoming.get("documents") or [], lambda item: f"{item.get('documentId','')}:{item.get('filename','')}")
    merged["findings"] = merge_unique(existing.get("findings") or [], incoming.get("findings") or [], lambda item: f"{item.get('reportPeriod','')}:{item.get('category','')}:{item.get('title','')}:{item.get('value','')}")
    periods = list(existing.get("periods") or [])
    for period in incoming.get("periods") or []:
        current = next((item for item in periods if item.get("period") == period.get("period")), None)
        if current is None:
            periods.append(period)
            continue
        current["documents"] = merge_unique(current.get("documents") or [], period.get("documents") or [], lambda item: f"{item.get('documentId','')}:{item.get('filename','')}")
        current["findingIds"] = list(dict.fromkeys([*(current.get("findingIds") or []), *(period.get("findingIds") or [])]))
        if not current.get("summary") and period.get("summary"):
            current["summary"] = period["summary"]
    merged["periods"] = periods
    merged["mappings"] = merge_unique(existing.get("mappings") or [], incoming.get("mappings") or [], lambda item: f"{item.get('projectId','')}:{item.get('nodeTitle') or item.get('nodeId','')}")
    merged["sourceProjects"] = list(dict.fromkeys([*(existing.get("sourceProjects") or []), *(incoming.get("sourceProjects") or [])]))
    return merged


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "industry-atlas-api"}


@app.get("/api/local-settings")
def get_local_settings() -> dict[str, Any]:
    if settings.app_env.lower() != "desktop":
        raise HTTPException(status_code=404, detail="本机设置接口仅在桌面版中可用")
    return {
        "configured": bool(settings.deepseek_api_key),
        "base_url": settings.deepseek_base_url,
        "model": settings.deepseek_model,
    }


@app.put("/api/local-settings")
def update_local_settings(payload: DesktopSettingsUpdate) -> dict[str, Any]:
    if settings.app_env.lower() != "desktop":
        raise HTTPException(status_code=404, detail="本机设置接口仅在桌面版中可用")
    if not payload.base_url.startswith(("https://", "http://127.0.0.1", "http://localhost")):
        raise HTTPException(status_code=422, detail="模型地址必须使用 HTTPS；仅本机地址可使用 HTTP")
    save_desktop_ai_settings(payload.api_key, payload.base_url, payload.model)
    return {
        "configured": bool(settings.deepseek_api_key),
        "base_url": settings.deepseek_base_url,
        "model": settings.deepseek_model,
    }


@app.get("/api/ready")
def ready() -> dict[str, Any]:
    issues = settings.production_issues()
    if issues:
        raise HTTPException(status_code=503, detail={"status": "not_ready", "issues": issues})
    try:
        with connection() as conn:
            conn.execute("SELECT 1").fetchone()
    except sqlite3.Error as exc:
        raise HTTPException(status_code=503, detail={"status": "not_ready", "issues": ["数据库不可用"]}) from exc
    return {"status": "ready", "environment": settings.app_env}


@app.get("/api/system/status")
def system_status(user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    return {
        "ai_configured": bool(settings.deepseek_api_key),
        "ai_model": settings.deepseek_model,
        "wechat_configured": bool(settings.wechat_app_id and settings.wechat_app_secret),
    }


@app.post("/api/auth/dev-login")
def dev_login(payload: DevLoginRequest) -> dict[str, Any]:
    if not settings.allow_dev_login:
        raise HTTPException(status_code=404, detail="开发登录未启用")
    display_name = payload.display_name.strip()
    if payload.device_key:
        with connection() as conn:
            existing = row_dict(conn.execute(
                "SELECT u.id,u.display_name,w.id AS workspace_id FROM users u "
                "JOIN workspaces w ON w.owner_id=u.id WHERE u.dev_key=? ORDER BY w.created_at LIMIT 1",
                (payload.device_key,),
            ).fetchone())
            if existing:
                if existing["display_name"] != display_name:
                    conn.execute("UPDATE users SET display_name=? WHERE id=?", (display_name, existing["id"]))
                return {
                    "token": issue_token(existing["id"]),
                    "user": {"id": existing["id"], "display_name": display_name},
                    "workspace_id": existing["workspace_id"],
                }
    user_id, workspace_id, now = new_id("usr"), new_id("ws"), utc_now()
    with connection() as conn:
        conn.execute("INSERT INTO users(id,display_name,dev_key,created_at) VALUES(?,?,?,?)", (user_id, display_name, payload.device_key, now))
        conn.execute("INSERT INTO workspaces(id,name,owner_id,created_at) VALUES(?,?,?,?)", (workspace_id, f"{display_name}的研究空间", user_id, now))
        conn.execute("INSERT INTO workspace_members(workspace_id,user_id,role,created_at) VALUES(?,?,?,?)", (workspace_id, user_id, "owner", now))
    return {"token": issue_token(user_id), "user": {"id": user_id, "display_name": display_name}, "workspace_id": workspace_id}


@app.post("/api/auth/register", status_code=201)
def register_account(payload: AccountRegisterRequest) -> dict[str, Any]:
    email, user_id, workspace_id, now = normalize_email(payload.email), new_id("usr"), new_id("ws"), utc_now()
    try:
        with connection() as conn:
            conn.execute(
                "INSERT INTO users(id,email,password_hash,display_name,created_at) VALUES(?,?,?,?,?)",
                (user_id, email, hash_password(payload.password), payload.display_name.strip(), now),
            )
            conn.execute("INSERT INTO workspaces(id,name,owner_id,created_at) VALUES(?,?,?,?)", (workspace_id, payload.workspace_name.strip(), user_id, now))
            conn.execute("INSERT INTO workspace_members(workspace_id,user_id,role,created_at) VALUES(?,?,?,?)", (workspace_id, user_id, "owner", now))
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=409, detail="该邮箱已注册") from None
    return {
        "token": issue_token(user_id),
        "user": {"id": user_id, "email": email, "display_name": payload.display_name.strip()},
        "workspace": {"id": workspace_id, "name": payload.workspace_name.strip(), "role": "owner"},
    }


@app.post("/api/auth/login")
def login_account(payload: AccountLoginRequest) -> dict[str, Any]:
    email = normalize_email(payload.email)
    with connection() as conn:
        user = row_dict(conn.execute("SELECT id,email,password_hash,display_name FROM users WHERE email=?", (email,)).fetchone())
        workspace = row_dict(conn.execute(
            "SELECT w.id,w.name,m.role FROM workspaces w JOIN workspace_members m ON m.workspace_id=w.id WHERE m.user_id=? ORDER BY CASE m.role WHEN 'owner' THEN 0 ELSE 1 END,w.created_at LIMIT 1",
            (user["id"],),
        ).fetchone()) if user else None
    if not user or not user.get("password_hash") or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    if not workspace:
        raise HTTPException(status_code=403, detail="账号尚未加入研究空间")
    return {"token": issue_token(user["id"]), "user": {key: user[key] for key in ("id", "email", "display_name")}, "workspace": workspace}


@app.post("/api/auth/wechat")
async def login_wechat(payload: WechatLoginRequest) -> dict[str, Any]:
    if not settings.wechat_app_id or not settings.wechat_app_secret:
        raise HTTPException(status_code=503, detail="服务器尚未配置微信小程序 AppID 和 AppSecret")
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get("https://api.weixin.qq.com/sns/jscode2session", params={"appid": settings.wechat_app_id, "secret": settings.wechat_app_secret, "js_code": payload.code, "grant_type": "authorization_code"})
        response.raise_for_status()
        identity = response.json()
    except (httpx.HTTPError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=502, detail="微信登录服务暂时不可用") from exc
    openid = str(identity.get("openid") or "")
    if not openid:
        raise HTTPException(status_code=401, detail=f"微信登录凭证无效：{identity.get('errmsg') or '未返回用户标识'}")
    with connection() as conn:
        account = row_dict(conn.execute("SELECT id,display_name FROM users WHERE wechat_openid=?", (openid,)).fetchone())
        if not account:
            user_id, workspace_id, now = new_id("usr"), new_id("ws"), utc_now()
            conn.execute("INSERT INTO users(id,wechat_openid,wechat_unionid,display_name,created_at) VALUES(?,?,?,?,?)", (user_id, openid, identity.get("unionid"), payload.display_name.strip(), now))
            conn.execute("INSERT INTO workspaces(id,name,owner_id,created_at) VALUES(?,?,?,?)", (workspace_id, f"{payload.display_name.strip()}的研究空间", user_id, now))
            conn.execute("INSERT INTO workspace_members(workspace_id,user_id,role,created_at) VALUES(?,?,?,?)", (workspace_id, user_id, "owner", now))
            account = {"id": user_id, "display_name": payload.display_name.strip()}
        workspace = row_dict(conn.execute(
            "SELECT w.id,w.name,m.role FROM workspaces w JOIN workspace_members m ON m.workspace_id=w.id WHERE m.user_id=? ORDER BY CASE m.role WHEN 'owner' THEN 0 ELSE 1 END,w.created_at LIMIT 1",
            (account["id"],),
        ).fetchone())
    return {"token": issue_token(account["id"]), "user": account, "workspace": workspace}


@app.post("/api/auth/bind-wechat")
async def bind_wechat(payload: WechatBindRequest, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    if not settings.wechat_app_id or not settings.wechat_app_secret:
        raise HTTPException(status_code=503, detail="服务器尚未配置微信小程序 AppID 和 AppSecret")
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get("https://api.weixin.qq.com/sns/jscode2session", params={"appid": settings.wechat_app_id, "secret": settings.wechat_app_secret, "js_code": payload.code, "grant_type": "authorization_code"})
        response.raise_for_status()
        identity = response.json()
    except (httpx.HTTPError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=502, detail="微信绑定服务暂时不可用") from exc
    openid = str(identity.get("openid") or "")
    if not openid:
        raise HTTPException(status_code=401, detail=f"微信登录凭证无效：{identity.get('errmsg') or '未返回用户标识'}")
    with connection() as conn:
        linked = conn.execute("SELECT id FROM users WHERE wechat_openid=?", (openid,)).fetchone()
        if linked and linked["id"] != user.id:
            raise HTTPException(status_code=409, detail="该微信已绑定其他研究账号")
        conn.execute("UPDATE users SET wechat_openid=?,wechat_unionid=COALESCE(?,wechat_unionid) WHERE id=?", (openid, identity.get("unionid"), user.id))
        account = row_dict(conn.execute("SELECT id,email,display_name FROM users WHERE id=?", (user.id,)).fetchone())
    return {"bound": True, "user": account}


@app.get("/api/workspaces")
def list_workspaces(user: CurrentUser = Depends(require_user)) -> list[dict[str, Any]]:
    with connection() as conn:
        rows = conn.execute("SELECT w.*,m.role FROM workspaces w JOIN workspace_members m ON m.workspace_id=w.id WHERE m.user_id=? ORDER BY w.created_at", (user.id,)).fetchall()
    return [dict(row) for row in rows]


@app.post("/api/workspaces", status_code=201)
def create_workspace(payload: WorkspaceCreate, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    workspace_id, now = new_id("ws"), utc_now()
    with connection() as conn:
        conn.execute("INSERT INTO workspaces(id,name,owner_id,created_at) VALUES(?,?,?,?)", (workspace_id, payload.name, user.id, now))
        conn.execute("INSERT INTO workspace_members(workspace_id,user_id,role,created_at) VALUES(?,?,?,?)", (workspace_id, user.id, "owner", now))
    return {"id": workspace_id, "name": payload.name, "owner_id": user.id, "role": "owner", "created_at": now}


@app.get("/api/workspaces/{workspace_id}/members")
def list_workspace_members(workspace_id: str, user: CurrentUser = Depends(require_user)) -> list[dict[str, Any]]:
    require_workspace_role(workspace_id, user.id, {"owner", "editor", "viewer"})
    with connection() as conn:
        rows = conn.execute(
            "SELECT u.id,u.email,u.display_name,m.role,m.created_at FROM workspace_members m JOIN users u ON u.id=m.user_id WHERE m.workspace_id=? ORDER BY CASE m.role WHEN 'owner' THEN 0 WHEN 'editor' THEN 1 ELSE 2 END,u.display_name",
            (workspace_id,),
        ).fetchall()
    return [dict(row) for row in rows]


@app.post("/api/workspaces/{workspace_id}/members", status_code=201)
def add_workspace_member(workspace_id: str, payload: WorkspaceMemberAdd, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    require_workspace_role(workspace_id, user.id, {"owner"})
    email = normalize_email(payload.email)
    with connection() as conn:
        member = row_dict(conn.execute("SELECT id,email,display_name FROM users WHERE email=?", (email,)).fetchone())
        if not member:
            raise HTTPException(status_code=404, detail="该邮箱尚未注册，请对方先创建账号")
        existing = conn.execute("SELECT role FROM workspace_members WHERE workspace_id=? AND user_id=?", (workspace_id, member["id"])).fetchone()
        if existing and existing["role"] == "owner":
            raise HTTPException(status_code=409, detail="空间所有者角色不能修改")
        conn.execute(
            "INSERT INTO workspace_members(workspace_id,user_id,role,created_at) VALUES(?,?,?,?) ON CONFLICT(workspace_id,user_id) DO UPDATE SET role=excluded.role",
            (workspace_id, member["id"], payload.role, utc_now()),
        )
    return {**member, "role": payload.role}


@app.patch("/api/workspaces/{workspace_id}/members/{member_id}")
def update_workspace_member(workspace_id: str, member_id: str, payload: WorkspaceMemberUpdate, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    require_workspace_role(workspace_id, user.id, {"owner"})
    with connection() as conn:
        member = row_dict(conn.execute("SELECT u.id,u.email,u.display_name,m.role FROM workspace_members m JOIN users u ON u.id=m.user_id WHERE m.workspace_id=? AND m.user_id=?", (workspace_id, member_id)).fetchone())
        if not member:
            raise HTTPException(status_code=404, detail="成员不存在")
        if member["role"] == "owner":
            raise HTTPException(status_code=409, detail="空间所有者角色不能修改")
        conn.execute("UPDATE workspace_members SET role=? WHERE workspace_id=? AND user_id=?", (payload.role, workspace_id, member_id))
    return {**member, "role": payload.role}


@app.delete("/api/workspaces/{workspace_id}/members/{member_id}", status_code=204)
def remove_workspace_member(workspace_id: str, member_id: str, user: CurrentUser = Depends(require_user)) -> Response:
    require_workspace_role(workspace_id, user.id, {"owner"})
    with connection() as conn:
        member = conn.execute("SELECT role FROM workspace_members WHERE workspace_id=? AND user_id=?", (workspace_id, member_id)).fetchone()
        if not member:
            raise HTTPException(status_code=404, detail="成员不存在")
        if member["role"] == "owner":
            raise HTTPException(status_code=409, detail="不能移除空间所有者")
        conn.execute("DELETE FROM workspace_members WHERE workspace_id=? AND user_id=?", (workspace_id, member_id))
    return Response(status_code=204)


@app.get("/api/projects")
def list_projects(workspace_id: str = Query(...), user: CurrentUser = Depends(require_user)) -> list[dict[str, Any]]:
    require_workspace_role(workspace_id, user.id, {"owner", "editor", "viewer"})
    with connection() as conn:
        rows = conn.execute("SELECT id,workspace_id,title,version,created_at,updated_at FROM projects WHERE workspace_id=? ORDER BY updated_at DESC", (workspace_id,)).fetchall()
    return [dict(row) for row in rows]


@app.post("/api/projects", status_code=201)
def create_project(payload: ProjectCreate, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    require_workspace_role(payload.workspace_id, user.id, {"owner", "editor"})
    project_id, now = new_id("prj"), utc_now()
    with connection() as conn:
        conn.execute("INSERT INTO projects(id,workspace_id,title,state_json,created_at,updated_at) VALUES(?,?,?,?,?,?)", (project_id, payload.workspace_id, payload.title, json_dump(payload.state), now, now))
        row = row_dict(conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone())
    return project_response(row or {})


@app.get("/api/projects/{project_id}")
def get_project(project_id: str, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    with connection() as conn:
        row = row_dict(conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone())
    if not row:
        raise HTTPException(status_code=404, detail="项目不存在")
    require_workspace_role(row["workspace_id"], user.id, {"owner", "editor", "viewer"})
    return project_response(row)


@app.get("/api/projects/{project_id}/export")
def export_project(
    project_id: str,
    format: str = Query(pattern="^(docx|xlsx|pdf)$"),
    include_evidence: bool = Query(default=True),
    include_tasks: bool = Query(default=True),
    only_expanded: bool = Query(default=False),
    user: CurrentUser = Depends(require_user),
) -> Response:
    with connection() as conn:
        row = row_dict(conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone())
    if not row:
        raise HTTPException(status_code=404, detail="项目不存在")
    require_workspace_role(row["workspace_id"], user.id, {"owner", "editor", "viewer"})
    with connection() as conn:
        table_rows = conn.execute("SELECT d.filename,t.page_number,t.table_number,t.data_json FROM document_tables t JOIN documents d ON d.id=t.document_id WHERE d.project_id=? ORDER BY d.created_at,t.page_number,t.table_number", (project_id,)).fetchall()
    document_tables = [{"filename": table["filename"], "page_number": table["page_number"], "table_number": table["table_number"], "data": json_load(table["data_json"])} for table in table_rows]
    content, media_type, extension = build_export(json_load(row["state_json"]), row["title"], format, include_evidence, include_tasks, only_expanded, document_tables)
    safe_title = "".join(character for character in row["title"] if character not in '<>:"/\\|?*').strip() or "industry-report"
    filename = f"{safe_title}-研究报告.{extension}"
    return Response(content=content, media_type=media_type, headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"})


@app.put("/api/projects/{project_id}")
def update_project(project_id: str, payload: ProjectUpdate, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    with connection() as conn:
        row = row_dict(conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone())
    if not row:
        raise HTTPException(status_code=404, detail="项目不存在")
    require_workspace_role(row["workspace_id"], user.id, {"owner", "editor"})
    if payload.expected_version is not None and payload.expected_version != row["version"]:
        raise HTTPException(status_code=409, detail={"code": "project_conflict", "current_version": row["version"], "updated_at": row["updated_at"]})
    title, state = payload.title or row["title"], payload.state if payload.state is not None else json_load(row["state_json"])
    with connection() as conn:
        now = utc_now()
        if payload.expected_version is None:
            cursor = conn.execute("UPDATE projects SET title=?,state_json=?,updated_at=?,version=version+1 WHERE id=?", (title, json_dump(state), now, project_id))
        else:
            cursor = conn.execute("UPDATE projects SET title=?,state_json=?,updated_at=?,version=version+1 WHERE id=? AND version=?", (title, json_dump(state), now, project_id, payload.expected_version))
        if cursor.rowcount != 1:
            current = row_dict(conn.execute("SELECT version,updated_at FROM projects WHERE id=?", (project_id,)).fetchone()) or {}
            raise HTTPException(status_code=409, detail={"code": "project_conflict", "current_version": current.get("version"), "updated_at": current.get("updated_at")})
        updated = row_dict(conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone())
    return project_response(updated or {})


@app.delete("/api/projects/{project_id}", status_code=204)
def delete_project(project_id: str, user: CurrentUser = Depends(require_user)) -> Response:
    with connection() as conn:
        row = row_dict(conn.execute("SELECT workspace_id FROM projects WHERE id=?", (project_id,)).fetchone())
    if not row:
        raise HTTPException(status_code=404, detail="项目不存在")
    require_workspace_role(row["workspace_id"], user.id, {"owner", "editor"})
    with connection() as conn:
        conn.execute("DELETE FROM projects WHERE id=?", (project_id,))
    return Response(status_code=204)


@app.post("/api/projects/import", status_code=201)
def import_legacy_project(payload: LegacyImportRequest, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    require_workspace_role(payload.workspace_id, user.id, {"owner", "editor"})
    if not isinstance(payload.state.get("nodes"), dict) or not payload.state.get("rootId"):
        raise HTTPException(status_code=422, detail="旧版 JSON 缺少 nodes 或 rootId")
    title = str(payload.state.get("projectTitle") or payload.state.get("title") or "导入的产业研究")[:160]
    return create_project(ProjectCreate(workspace_id=payload.workspace_id, title=title, state=payload.state), user)


@app.get("/api/companies")
def list_workspace_companies(
    workspace_id: str = Query(...),
    q: str = Query(default="", max_length=120),
    user: CurrentUser = Depends(require_user),
) -> list[dict[str, Any]]:
    require_workspace_role(workspace_id, user.id, {"owner", "editor", "viewer"})
    sql = "SELECT id,workspace_id,name,data_json,created_at,updated_at FROM workspace_companies WHERE workspace_id=?"
    params: list[Any] = [workspace_id]
    if q.strip():
        sql += " AND (name LIKE ? OR data_json LIKE ?)"
        pattern = f"%{q.strip()}%"
        params.extend([pattern, pattern])
    sql += " ORDER BY updated_at DESC,name"
    with connection() as conn:
        rows = conn.execute(sql, params).fetchall()
    return [{**{key: row[key] for key in ("id", "workspace_id", "name", "created_at", "updated_at")}, "data": json_load(row["data_json"])} for row in rows]


@app.get("/api/companies/{company_id}")
def get_workspace_company(company_id: str, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    with connection() as conn:
        row = row_dict(conn.execute("SELECT * FROM workspace_companies WHERE id=?", (company_id,)).fetchone())
    if not row:
        raise HTTPException(status_code=404, detail="公司主档不存在")
    require_workspace_role(row["workspace_id"], user.id, {"owner", "editor", "viewer"})
    return {key: value for key, value in row.items() if key not in {"data_json", "normalized_name"}} | {"data": json_load(row["data_json"])}


@app.post("/api/companies/sync")
def sync_workspace_companies(payload: CompanyMasterSyncRequest, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    require_workspace_role(payload.workspace_id, user.id, {"owner", "editor"})
    if payload.project_id:
        with connection() as conn:
            project = row_dict(conn.execute("SELECT workspace_id FROM projects WHERE id=?", (payload.project_id,)).fetchone())
        if not project or project["workspace_id"] != payload.workspace_id:
            raise HTTPException(status_code=404, detail="项目不存在于当前研究空间")
    created, updated, skipped, now = 0, 0, 0, utc_now()
    with connection() as conn:
        for incoming in payload.companies:
            name = str(incoming.get("name") or "").strip()[:160]
            normalized_name = normalize_company_name(name)
            if not normalized_name:
                skipped += 1
                continue
            company_data = dict(incoming)
            company_data["name"] = name
            if payload.project_id:
                company_data["sourceProjects"] = list(dict.fromkeys([*(company_data.get("sourceProjects") or []), payload.project_id]))
            current = row_dict(conn.execute("SELECT * FROM workspace_companies WHERE workspace_id=? AND normalized_name=?", (payload.workspace_id, normalized_name)).fetchone())
            if current:
                company_data = merge_company_data(json_load(current["data_json"]), company_data)
                conn.execute("UPDATE workspace_companies SET name=?,data_json=?,updated_at=? WHERE id=?", (name, json_dump(company_data), now, current["id"]))
                updated += 1
            else:
                company_id = new_id("cmp")
                conn.execute("INSERT INTO workspace_companies(id,workspace_id,normalized_name,name,data_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?)", (company_id, payload.workspace_id, normalized_name, name, json_dump(company_data), now, now))
                created += 1
    companies = list_workspace_companies(payload.workspace_id, "", user)
    return {"created": created, "updated": updated, "skipped": skipped, "companies": companies}


@app.delete("/api/companies/{company_id}", status_code=204)
def delete_workspace_company(company_id: str, user: CurrentUser = Depends(require_user)) -> Response:
    with connection() as conn:
        row = row_dict(conn.execute("SELECT workspace_id FROM workspace_companies WHERE id=?", (company_id,)).fetchone())
    if not row:
        raise HTTPException(status_code=404, detail="公司主档不存在")
    require_workspace_role(row["workspace_id"], user.id, {"owner", "editor"})
    with connection() as conn:
        conn.execute("DELETE FROM workspace_companies WHERE id=?", (company_id,))
    return Response(status_code=204)


@app.post("/api/documents", status_code=202)
def upload_document(
    background_tasks: BackgroundTasks,
    workspace_id: str = Query(...),
    project_id: str | None = Query(default=None),
    body: bytes = Body(..., media_type="application/pdf"),
    x_filename: str = Header(default="document.pdf"),
    user: CurrentUser = Depends(require_user),
) -> dict[str, Any]:
    require_workspace_role(workspace_id, user.id, {"owner", "editor"})
    if len(body) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"文件不能超过 {settings.max_upload_mb} MB")
    if not body.startswith(b"%PDF"):
        raise HTTPException(status_code=415, detail="当前只接受 PDF 文件")
    if project_id:
        with connection() as conn:
            project = row_dict(conn.execute("SELECT workspace_id FROM projects WHERE id=?", (project_id,)).fetchone())
        if not project or project["workspace_id"] != workspace_id:
            raise HTTPException(status_code=404, detail="项目不存在于当前研究空间")
    document_id, now = new_id("doc"), utc_now()
    safe_name = Path(unquote(x_filename)).name[:180] or "document.pdf"
    storage_path = settings.upload_dir / f"{document_id}.pdf"
    storage_path.write_bytes(body)
    with connection() as conn:
        conn.execute("INSERT INTO documents(id,workspace_id,project_id,filename,storage_path,status,created_at,updated_at) VALUES(?,?,?,?,?,'processing',?,?)", (document_id, workspace_id, project_id, safe_name, str(storage_path), now, now))
    background_tasks.add_task(extract_pdf, document_id, str(storage_path))
    return {"id": document_id, "filename": safe_name, "status": "processing"}


@app.get("/api/documents")
def list_documents(
    workspace_id: str = Query(...),
    project_id: str | None = Query(default=None),
    user: CurrentUser = Depends(require_user),
) -> list[dict[str, Any]]:
    require_workspace_role(workspace_id, user.id, {"owner", "editor", "viewer"})
    query = """
      SELECT d.id,d.workspace_id,d.project_id,d.filename,d.status,d.error,
             d.page_count,d.char_count,d.needs_ocr,d.ocr_page_count,d.table_count,d.extraction_mode,d.created_at,d.updated_at,
             COUNT(e.id) AS extraction_count,
             MAX(e.updated_at) AS last_extraction_at
      FROM documents d
      LEFT JOIN document_extractions e ON e.document_id=d.id
      WHERE d.workspace_id=?
    """
    params: list[Any] = [workspace_id]
    if project_id:
        query += " AND d.project_id=?"
        params.append(project_id)
    query += " GROUP BY d.id ORDER BY d.updated_at DESC"
    with connection() as conn:
        rows = conn.execute(query, params).fetchall()
    return [dict(row) for row in rows]


@app.get("/api/documents/{document_id}")
def get_document(document_id: str, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    with connection() as conn:
        row = row_dict(conn.execute("SELECT id,workspace_id,project_id,filename,status,error,page_count,char_count,needs_ocr,ocr_page_count,table_count,extraction_mode,created_at,updated_at FROM documents WHERE id=?", (document_id,)).fetchone())
    if not row:
        raise HTTPException(status_code=404, detail="文档不存在")
    require_workspace_role(row["workspace_id"], user.id, {"owner", "editor", "viewer"})
    return row


@app.get("/api/documents/{document_id}/chunks")
def get_document_chunks(document_id: str, user: CurrentUser = Depends(require_user)) -> list[dict[str, Any]]:
    document = get_document(document_id, user)
    if document["status"] != "ready":
        raise HTTPException(status_code=409, detail="文档尚未解析完成")
    with connection() as conn:
        rows = conn.execute("SELECT id,page_number,text FROM document_chunks WHERE document_id=? ORDER BY page_number", (document_id,)).fetchall()
    return [dict(row) for row in rows]


@app.get("/api/documents/{document_id}/tables")
def get_document_tables(document_id: str, user: CurrentUser = Depends(require_user)) -> list[dict[str, Any]]:
    document = get_document(document_id, user)
    if document["status"] not in {"ready", "ocr_failed"}:
        raise HTTPException(status_code=409, detail="文档尚未解析完成")
    with connection() as conn:
        rows = conn.execute("SELECT id,page_number,table_number,row_count,column_count,data_json FROM document_tables WHERE document_id=? ORDER BY page_number,table_number", (document_id,)).fetchall()
    return [{**{key: row[key] for key in ("id", "page_number", "table_number", "row_count", "column_count")}, "data": json_load(row["data_json"])} for row in rows]


@app.post("/api/documents/{document_id}/ocr", status_code=202)
def start_document_ocr(
    document_id: str,
    background_tasks: BackgroundTasks,
    user: CurrentUser = Depends(require_user),
) -> dict[str, Any]:
    with connection() as conn:
        document = row_dict(conn.execute("SELECT workspace_id,storage_path,status FROM documents WHERE id=?", (document_id,)).fetchone())
    if not document:
        raise HTTPException(status_code=404, detail="文档不存在")
    require_workspace_role(document["workspace_id"], user.id, {"owner", "editor"})
    if document["status"] in {"processing", "ocr_processing"}:
        raise HTTPException(status_code=409, detail="文档已有处理任务正在运行")
    if not Path(document["storage_path"]).is_file():
        raise HTTPException(status_code=410, detail="原始 PDF 已不存在，请重新上传")
    with connection() as conn:
        conn.execute("UPDATE documents SET status='ocr_processing',error=NULL,updated_at=? WHERE id=?", (utc_now(), document_id))
    background_tasks.add_task(ocr_pdf, document_id, document["storage_path"])
    return {"id": document_id, "status": "ocr_processing"}


@app.post("/api/documents/{document_id}/retry", status_code=202)
def retry_document_parse(
    document_id: str,
    background_tasks: BackgroundTasks,
    user: CurrentUser = Depends(require_user),
) -> dict[str, Any]:
    with connection() as conn:
        document = row_dict(conn.execute("SELECT workspace_id,storage_path,status FROM documents WHERE id=?", (document_id,)).fetchone())
    if not document:
        raise HTTPException(status_code=404, detail="文档不存在")
    require_workspace_role(document["workspace_id"], user.id, {"owner", "editor"})
    if document["status"] in {"processing", "ocr_processing"}:
        raise HTTPException(status_code=409, detail="文档正在解析，无需重复提交")
    if not Path(document["storage_path"]).is_file():
        raise HTTPException(status_code=410, detail="原始 PDF 已不存在，请重新上传")
    with connection() as conn:
        conn.execute("UPDATE documents SET status='processing',error=NULL,updated_at=? WHERE id=?", (utc_now(), document_id))
    background_tasks.add_task(extract_pdf, document_id, document["storage_path"])
    return {"id": document_id, "status": "processing"}


@app.post("/api/documents/{document_id}/extractions", status_code=202)
def create_document_extraction(
    document_id: str,
    payload: DocumentExtractionRequest,
    background_tasks: BackgroundTasks,
    user: CurrentUser = Depends(require_user),
) -> dict[str, Any]:
    with connection() as conn:
        document = row_dict(conn.execute("SELECT workspace_id,project_id,status FROM documents WHERE id=?", (document_id,)).fetchone())
    if not document:
        raise HTTPException(status_code=404, detail="文档不存在")
    require_workspace_role(document["workspace_id"], user.id, {"owner", "editor"})
    if document["status"] != "ready":
        raise HTTPException(status_code=409, detail="文档尚未完成文本解析")
    if not settings.deepseek_api_key:
        raise HTTPException(status_code=503, detail="服务器尚未配置 DEEPSEEK_API_KEY")
    extraction_id, now, model = new_id("ext"), utc_now(), payload.model or settings.deepseek_model
    with connection() as conn:
        conn.execute(
            "INSERT INTO document_extractions(id,document_id,workspace_id,project_id,model,status,created_at,updated_at) VALUES(?,?,?,?,?,'processing',?,?)",
            (extraction_id, document_id, document["workspace_id"], document["project_id"], model, now, now),
        )
    background_tasks.add_task(run_document_extraction, extraction_id, document_id, model, payload.focus)
    return {"id": extraction_id, "document_id": document_id, "model": model, "status": "processing"}


@app.get("/api/documents/{document_id}/extractions")
def list_document_extractions(document_id: str, user: CurrentUser = Depends(require_user)) -> list[dict[str, Any]]:
    document = get_document(document_id, user)
    require_workspace_role(document["workspace_id"], user.id, {"owner", "editor", "viewer"})
    with connection() as conn:
        rows = conn.execute("SELECT * FROM document_extractions WHERE document_id=? ORDER BY created_at DESC", (document_id,)).fetchall()
    return [extraction_response(dict(row)) for row in rows]


@app.get("/api/document-extractions/{extraction_id}")
def get_document_extraction(extraction_id: str, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    with connection() as conn:
        row = row_dict(conn.execute("SELECT * FROM document_extractions WHERE id=?", (extraction_id,)).fetchone())
    if not row:
        raise HTTPException(status_code=404, detail="提取任务不存在")
    require_workspace_role(row["workspace_id"], user.id, {"owner", "editor", "viewer"})
    return extraction_response(row)


@app.post("/api/ai/structured")
async def deepseek_structured(payload: DeepSeekRequest, user: CurrentUser = Depends(require_user)) -> dict[str, Any]:
    require_workspace_role(payload.workspace_id, user.id, {"owner", "editor"})
    if payload.project_id:
        with connection() as conn:
            project = row_dict(conn.execute("SELECT workspace_id FROM projects WHERE id=?", (payload.project_id,)).fetchone())
        if not project or project["workspace_id"] != payload.workspace_id:
            raise HTTPException(status_code=404, detail="项目不存在于当前研究空间")
    if not settings.deepseek_api_key:
        raise HTTPException(status_code=503, detail="服务器尚未配置 DEEPSEEK_API_KEY")
    run_id, now, model = new_id("airun"), utc_now(), payload.model or settings.deepseek_model
    request_body = {
        "model": model,
        "messages": [{"role": "system", "content": payload.system}, {"role": "user", "content": payload.user}],
        "response_format": {"type": "json_object"},
        "thinking": {"type": "enabled" if payload.thinking else "disabled"},
    }
    with connection() as conn:
        conn.execute("INSERT INTO ai_runs(id,workspace_id,project_id,model,purpose,status,input_json,created_at) VALUES(?,?,?,?,?,'running',?,?)", (run_id, payload.workspace_id, payload.project_id, model, payload.purpose, json_dump(request_body), now))
    try:
        async with httpx.AsyncClient(timeout=120) as client:
            response = await client.post(f"{settings.deepseek_base_url}/chat/completions", headers={"Authorization": f"Bearer {settings.deepseek_api_key}"}, json=request_body)
        response.raise_for_status()
        raw = response.json()["choices"][0]["message"]["content"]
        result = json.loads(raw)
        with connection() as conn:
            conn.execute("UPDATE ai_runs SET status='completed',output_json=?,completed_at=? WHERE id=?", (json_dump(result), utc_now(), run_id))
        return {"run_id": run_id, "model": model, "result": result}
    except (httpx.HTTPError, KeyError, json.JSONDecodeError) as exc:
        with connection() as conn:
            conn.execute("UPDATE ai_runs SET status='failed',error=?,completed_at=? WHERE id=?", (str(exc)[:1000], utc_now(), run_id))
        raise HTTPException(status_code=502, detail=f"DeepSeek 请求失败：{exc}") from exc
