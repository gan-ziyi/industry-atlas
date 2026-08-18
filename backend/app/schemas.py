from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class DevLoginRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=60)
    device_key: str | None = Field(default=None, min_length=12, max_length=120)


class AccountRegisterRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=10, max_length=128)
    display_name: str = Field(min_length=1, max_length=60)
    workspace_name: str = Field(min_length=1, max_length=100)


class AccountLoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class WechatLoginRequest(BaseModel):
    code: str = Field(min_length=1, max_length=256)
    display_name: str = Field(default="微信研究员", min_length=1, max_length=60)


class WechatBindRequest(BaseModel):
    code: str = Field(min_length=1, max_length=256)


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class ProjectCreate(BaseModel):
    workspace_id: str
    title: str = Field(min_length=1, max_length=160)
    state: dict[str, Any] = Field(default_factory=dict)


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    state: dict[str, Any] | None = None
    expected_version: int | None = Field(default=None, ge=1)


class WorkspaceMemberAdd(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    role: Literal["editor", "viewer"]


class WorkspaceMemberUpdate(BaseModel):
    role: Literal["editor", "viewer"]


class LegacyImportRequest(BaseModel):
    workspace_id: str
    state: dict[str, Any]


class DeepSeekRequest(BaseModel):
    workspace_id: str
    project_id: str | None = None
    purpose: str = Field(default="industry_research", max_length=80)
    system: str = Field(min_length=1, max_length=20_000)
    user: str = Field(min_length=1, max_length=200_000)
    model: Literal["deepseek-v4-flash", "deepseek-v4-pro"] | None = None
    thinking: bool = True


class DesktopSettingsUpdate(BaseModel):
    api_key: str | None = Field(default=None, max_length=512)
    base_url: str = Field(default="https://api.deepseek.com", min_length=8, max_length=500)
    model: str = Field(default="deepseek-v4-flash", min_length=1, max_length=120)


class DocumentExtractionRequest(BaseModel):
    model: Literal["deepseek-v4-flash", "deepseek-v4-pro"] | None = None
    focus: str = Field(default="提取公司业务、产品、收入、产能、客户、产业位置和主要风险", max_length=500)


class CompanyMasterSyncRequest(BaseModel):
    workspace_id: str
    project_id: str | None = None
    companies: list[dict[str, Any]] = Field(default_factory=list, max_length=2000)
