# Industry Atlas Backend

这是产品化阶段的最小后端，当前包含：

- 邮箱注册/登录、加盐 scrypt 密码哈希、开发登录与签名会话；
- 微信小程序 `wx.login` 凭证交换、OpenID 身份复用和首次登录自动创建研究空间；
- 工作空间成员管理和 owner/editor/viewer 权限边界；
- 项目创建、读取、带版本号乐观锁的更新和旧版 JSON 导入；
- PDF 原始上传、后台解析、页码级文本片段和任务状态；
- RapidOCR + ONNX Runtime 本地中文 OCR；
- pdfplumber 页码级表格提取；
- DeepSeek 结构化 JSON 代理；
- 年报业务、产品、经营数据、产能、客户、产业位置和风险提取；
- 工作空间级公司主档、同名合并、项目来源追踪和跨项目同步；
- 页码级原文摘录匹配与人工选择后写回；
- 原生 Word、Excel、PDF 研究报告导出；
- AI 请求记录表。

## 本地启动

```powershell
cd backend
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
Copy-Item .env.example .env
.venv\Scripts\uvicorn app.main:app --reload --env-file .env
```

打开 `http://127.0.0.1:8000/docs` 查看和调用接口。

随后打开项目根目录的 `index.html`，点击左下角“个人研究空间”，使用 `http://127.0.0.1:8000` 完成开发登录和首次项目同步。资料库中的“上传年报 / PDF”会调用本后端并把解析结果回填到当前节点；解析完成后可继续发起 DeepSeek 结构化提取并逐条审核。

环境变量可以在启动服务前设置。正式部署至少必须修改 `APP_SECRET`，关闭 `ALLOW_DEV_LOGIN`，并设置 `DEEPSEEK_API_KEY`。

微信小程序登录还需要配置 `WECHAT_APP_ID` 与 `WECHAT_APP_SECRET`。AppSecret 只能保存在后端；小程序只提交 `wx.login` 返回的短期 code。未配置时 `/api/auth/wechat` 会明确返回 503，不会回退到不安全的客户端密钥方案。

## PDF 上传

开发接口直接接收 PDF 二进制，查询参数提供 `workspace_id` 和可选 `project_id`，请求头 `X-Filename` 提供原文件名。正式部署时应改为对象存储的临时上传凭证，避免大文件经过 API 进程。

## 年报结构化提取

- `GET /api/documents` 按研究空间和项目查询文件任务；
- `POST /api/documents/{document_id}/retry` 重新解析失败或已完成的 PDF；
- `POST /api/documents/{document_id}/extractions` 创建后台提取任务；
- `GET /api/documents/{document_id}/extractions` 查询单份文件的提取历史；
- `GET /api/document-extractions/{extraction_id}` 查询任务和审核结果；
- `POST /api/documents/{document_id}/ocr` 对文本不足的扫描 PDF 运行本地 OCR；
- `GET /api/documents/{document_id}/tables` 返回带页码的结构化表格；
- 服务端只把模型给出的摘录与指定页码原文进行匹配，并返回 `matched` 或 `unmatched`；
- 前端默认只选择 `matched` 条目，用户可跨分类修改选择后写入节点证据；
- 写入后的证据仍为“待人工核验”，机器原文匹配不会自动替代人工判断。

密钥只配置在本机 `.env` 的 `DEEPSEEK_API_KEY` 中，不应写入源码、浏览器存储或日志。默认轻量模型为 `deepseek-v4-flash`，需要更强综合分析时可使用 `deepseek-v4-pro`。

## 当前边界

- SQLite 用于本机开发；正式环境迁移 PostgreSQL。
- FastAPI `BackgroundTasks` 用于验证解析闭环；正式环境迁移 Redis + Celery/RQ。
- 目前支持可复制文本 PDF、本地中文 OCR、文本型表格提取和 DeepSeek 年报字段抽取；扫描表格、复杂合并单元格和手写内容仍需要人工核对。
- 开发登录不能用于生产；正式小程序应接入微信登录凭证交换。
- 当前签名会话有效期固定为 7 天；正式环境仍需补充刷新令牌、找回密码、邮箱验证和登录风控。

## 账号、成员与同步冲突

- `POST /api/auth/register` 创建邮箱账号及其首个研究空间；
- `POST /api/auth/login` 登录正式账号，密码只与 scrypt 哈希比对；
- `POST /api/auth/wechat` 用微信临时 code 换取 OpenID，并创建或复用平台账号；
- `GET/POST /api/workspaces/{workspace_id}/members` 查询或添加成员；
- `PATCH/DELETE /api/workspaces/{workspace_id}/members/{user_id}` 调整角色或移除成员，只有 owner 可操作；
- 项目响应包含 `version`；更新时传 `expected_version`，若云端已变化则返回 `409 project_conflict`，由前端显式选择版本。
- `GET /api/projects?workspace_id=...` 返回空间项目列表，`GET/DELETE /api/projects/{project_id}` 用于重新打开或删除云端项目。

## 工作空间公司主档

- `GET /api/companies?workspace_id=...` 查询当前工作空间的共享公司库，viewer 也可读取；
- `GET /api/companies/{company_id}` 查看单家公司完整主档；
- `POST /api/companies/sync` 由 owner/editor 批量写入项目公司数据，并按规范化公司名称合并报告期、发现、资料和映射；
- `DELETE /api/companies/{company_id}` 删除工作空间公司主档，不会删除项目、产业节点或原始 PDF。

前端同步项目时会自动上送公司档案；主动点击“云端主档”时才会把工作空间中的其他公司拉入当前研究项目。跨项目映射携带来源项目和节点名称，前端不会直接套用其他项目的节点 ID。

## 精准导出

`GET /api/projects/{project_id}/export?format=docx|xlsx|pdf` 会从服务器中的最新项目状态生成文件，并支持 `include_evidence`、`include_tasks` 和 `only_expanded` 参数。Excel 包含节点、关系、证据、任务、公司、公司映射、公司期间、公司指标和年报表格工作表；Word 与 PDF 会列出证据位置、原文摘录、人工核验状态、多期公司档案、公司映射与年报表格附录。
