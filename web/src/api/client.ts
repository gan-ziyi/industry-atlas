import type { CloudMember, CloudProject, CloudProjectSummary, CloudWorkspace, Company, DocumentChunk, DocumentTable, DocumentTask, ExtractionTask, GraphPatch, ProjectState } from '../types'

const TOKEN_KEY = 'industry-atlas-cloud-token-session'
const WORKSPACE_KEY = 'industry-atlas-cloud-workspace-session'
const DEVICE_KEY = 'industry-atlas-desktop-device-v1'
const CONFIG_KEY = 'industry-atlas-cloud-config-v1'
const FORMAL_PROJECT_KEY = 'industry-atlas-formal-cloud-project-id'
const FORMAL_PROJECT_VERSION_KEY = 'industry-atlas-formal-cloud-project-version'

export function backendUrl(): string {
  try { return JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}').baseUrl?.replace(/\/+$/, '') || 'http://127.0.0.1:8000' }
  catch { return 'http://127.0.0.1:8000' }
}

export function configureBackend(baseUrl: string) { localStorage.setItem(CONFIG_KEY, JSON.stringify({ baseUrl: baseUrl.trim().replace(/\/+$/, '') })) }

export function cloudSession(): { token: string; workspace: CloudWorkspace | null } {
  const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || ''
  try { return { token, workspace: JSON.parse(localStorage.getItem(WORKSPACE_KEY) || sessionStorage.getItem(WORKSPACE_KEY) || 'null') } }
  catch { return { token, workspace: null } }
}

function desktopDeviceKey() {
  const existing = localStorage.getItem(DEVICE_KEY)
  if (existing) return existing
  const created = globalThis.crypto?.randomUUID?.() || `desktop-${Date.now()}-${Math.random().toString(36).slice(2)}`
  localStorage.setItem(DEVICE_KEY, created)
  return created
}

export function formalProjectId() { return localStorage.getItem(FORMAL_PROJECT_KEY) || '' }

export function storageScope() {
  const { workspace } = cloudSession()
  return `${workspace?.user?.id || 'guest'}:${workspace?.id || 'local'}:${formalProjectId() || 'draft'}`
}

export async function checkHealth() { return request<{ status: string; service: string }>('/api/health') }

export interface LocalAISettings {
  configured: boolean
  base_url: string
  model: string
}

export async function getLocalAISettings() { return request<LocalAISettings>('/api/local-settings', {}, false) }

export async function updateLocalAISettings(input: { apiKey?: string; baseUrl: string; model: string }) {
  return request<LocalAISettings>('/api/local-settings', {
    method: 'PUT',
    body: JSON.stringify({ api_key: input.apiKey || null, base_url: input.baseUrl, model: input.model }),
  }, false)
}

export async function devLogin(displayName: string): Promise<CloudWorkspace> {
  const response = await fetch(`${backendUrl()}/api/auth/dev-login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ display_name: displayName, device_key: desktopDeviceKey() }) })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.detail || `登录失败：${response.status}`)
  const workspace = { id: payload.workspace_id, name: `${payload.user.display_name}的本机研究空间`, role: 'owner' as const, user: payload.user }
  saveSession(payload.token, workspace)
  return workspace
}

function saveSession(token: string, workspace: CloudWorkspace) {
  localStorage.setItem(TOKEN_KEY, token); localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace)); sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(WORKSPACE_KEY); localStorage.removeItem(FORMAL_PROJECT_KEY); localStorage.removeItem(FORMAL_PROJECT_VERSION_KEY)
}

export async function registerAccount(input: { email: string; password: string; displayName: string; workspaceName: string }): Promise<CloudWorkspace> {
  const response = await request<{ token: string; user: CloudWorkspace['user']; workspace: Omit<CloudWorkspace, 'user'> }>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: input.email, password: input.password, display_name: input.displayName, workspace_name: input.workspaceName }) }, false)
  const workspace = { ...response.workspace, user: response.user }
  saveSession(response.token, workspace)
  return workspace
}

export async function loginAccount(email: string, password: string): Promise<CloudWorkspace> {
  const response = await request<{ token: string; user: CloudWorkspace['user']; workspace: Omit<CloudWorkspace, 'user'> }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }, false)
  const workspace = { ...response.workspace, user: response.user }
  saveSession(response.token, workspace)
  return workspace
}

export function logout() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(WORKSPACE_KEY); sessionStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(WORKSPACE_KEY); localStorage.removeItem(FORMAL_PROJECT_KEY); localStorage.removeItem(FORMAL_PROJECT_VERSION_KEY) }

export async function listWorkspaces(): Promise<CloudWorkspace[]> {
  const current = cloudSession().workspace
  const workspaces = await request<Array<CloudWorkspace & { owner_id?: string }>>('/api/workspaces')
  return workspaces.map(workspace => ({ ...workspace, user: current?.user }))
}

export function selectWorkspace(workspace: CloudWorkspace) {
  const current = cloudSession().workspace
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify({ ...workspace, user: current?.user || workspace.user }))
  localStorage.removeItem(FORMAL_PROJECT_KEY); localStorage.removeItem(FORMAL_PROJECT_VERSION_KEY)
}

export async function listProjects(workspaceId?: string): Promise<CloudProjectSummary[]> {
  const id = workspaceId || cloudSession().workspace?.id
  if (!id) throw new Error('尚未连接研究空间')
  return request<CloudProjectSummary[]>(`/api/projects?workspace_id=${encodeURIComponent(id)}`)
}

export async function createCloudProject(state: ProjectState): Promise<CloudProject> {
  const { workspace } = cloudSession()
  if (!workspace) throw new Error('尚未连接研究空间')
  const project = await request<CloudProject>('/api/projects', { method: 'POST', body: JSON.stringify({ workspace_id: workspace.id, title: state.projectTitle, state }) })
  acceptCloudProject(project)
  return project
}

class ApiError extends Error {
  constructor(message: string, public status: number, public detail: unknown) { super(message) }
}

async function request<T>(path: string, init: RequestInit = {}, authenticated = true): Promise<T> {
  const token = authenticated ? cloudSession().token : ''
  const response = await fetch(`${backendUrl()}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers } })
  const text = await response.text()
  const payload = text ? JSON.parse(text) : null
  if (!response.ok) {
    const detail = payload?.detail
    const message = typeof detail === 'string' ? detail : `后端返回 ${response.status}`
    throw new ApiError(message, response.status, detail)
  }
  return payload as T
}

export class ProjectConflictError extends Error {
  constructor(public remote: CloudProject) { super('云端项目已被其他成员更新') }
}

export async function syncProject(state: ProjectState): Promise<string> {
  const { workspace } = cloudSession()
  if (!workspace) throw new Error('请先在原型或登录页连接研究空间')
  const existingId = localStorage.getItem(FORMAL_PROJECT_KEY)
  let project: CloudProject
  try {
    project = existingId
      ? await request<CloudProject>(`/api/projects/${encodeURIComponent(existingId)}`, { method: 'PUT', body: JSON.stringify({ title: state.projectTitle, state, expected_version: Number(localStorage.getItem(FORMAL_PROJECT_VERSION_KEY)) || undefined }) })
      : await request<CloudProject>('/api/projects', { method: 'POST', body: JSON.stringify({ workspace_id: workspace.id, title: state.projectTitle, state }) })
  } catch (reason) {
    if (existingId && reason instanceof ApiError && reason.status === 409) throw new ProjectConflictError(await getCloudProject(existingId))
    throw reason
  }
  localStorage.setItem(FORMAL_PROJECT_KEY, project.id)
  localStorage.setItem(FORMAL_PROJECT_VERSION_KEY, String(project.version))
  return project.id
}

export async function getCloudProject(projectId: string): Promise<CloudProject> { return request<CloudProject>(`/api/projects/${encodeURIComponent(projectId)}`) }

export async function forceSyncProject(state: ProjectState): Promise<string> {
  const projectId = formalProjectId()
  if (!projectId) return syncProject(state)
  const project = await request<CloudProject>(`/api/projects/${encodeURIComponent(projectId)}`, { method: 'PUT', body: JSON.stringify({ title: state.projectTitle, state }) })
  localStorage.setItem(FORMAL_PROJECT_VERSION_KEY, String(project.version))
  return project.id
}

export function acceptCloudProject(project: CloudProject) {
  localStorage.setItem(FORMAL_PROJECT_KEY, project.id)
  localStorage.setItem(FORMAL_PROJECT_VERSION_KEY, String(project.version))
}

export async function deleteCloudProject(projectId: string) {
  await request<void>(`/api/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' })
  if (formalProjectId() === projectId) { localStorage.removeItem(FORMAL_PROJECT_KEY); localStorage.removeItem(FORMAL_PROJECT_VERSION_KEY) }
}

export async function listWorkspaceMembers(): Promise<CloudMember[]> {
  const { workspace } = cloudSession()
  if (!workspace) throw new Error('尚未连接研究空间')
  return request<CloudMember[]>(`/api/workspaces/${encodeURIComponent(workspace.id)}/members`)
}

export async function addWorkspaceMember(email: string, role: 'editor' | 'viewer') {
  const { workspace } = cloudSession()
  if (!workspace) throw new Error('尚未连接研究空间')
  return request<CloudMember>(`/api/workspaces/${encodeURIComponent(workspace.id)}/members`, { method: 'POST', body: JSON.stringify({ email, role }) })
}

export async function updateWorkspaceMember(memberId: string, role: 'editor' | 'viewer') {
  const { workspace } = cloudSession()
  if (!workspace) throw new Error('尚未连接研究空间')
  return request<CloudMember>(`/api/workspaces/${encodeURIComponent(workspace.id)}/members/${encodeURIComponent(memberId)}`, { method: 'PATCH', body: JSON.stringify({ role }) })
}

export async function removeWorkspaceMember(memberId: string) {
  const { workspace } = cloudSession()
  if (!workspace) throw new Error('尚未连接研究空间')
  await request<void>(`/api/workspaces/${encodeURIComponent(workspace.id)}/members/${encodeURIComponent(memberId)}`, { method: 'DELETE' })
}

export async function syncCompanies(state: ProjectState, projectId: string): Promise<Company[]> {
  const { workspace } = cloudSession()
  if (!workspace) throw new Error('尚未连接研究空间')
  const companies = state.companyData.map(company => ({ ...company, sourceProjects: [projectId], mappings: company.mappings.map(mapping => ({ ...mapping, projectId, nodeTitle: state.nodes[mapping.nodeId]?.title || mapping.nodeTitle })) }))
  const result = await request<{ companies: Array<{ data: Company }> }>('/api/companies/sync', { method: 'POST', body: JSON.stringify({ workspace_id: workspace.id, project_id: projectId, companies }) })
  return result.companies.map(item => item.data)
}

export async function listDocuments(): Promise<DocumentTask[]> {
  const { workspace } = cloudSession()
  const projectId = localStorage.getItem(FORMAL_PROJECT_KEY)
  if (!workspace) throw new Error('尚未连接研究空间')
  const params = new URLSearchParams({ workspace_id: workspace.id })
  if (projectId) params.set('project_id', projectId)
  return request<DocumentTask[]>(`/api/documents?${params}`)
}

export async function uploadPdf(file: File, projectId: string): Promise<DocumentTask> {
  const { token, workspace } = cloudSession()
  if (!token || !workspace) throw new Error('尚未连接研究空间')
  const params = new URLSearchParams({ workspace_id: workspace.id, project_id: projectId })
  const response = await fetch(`${backendUrl()}/api/documents?${params}`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/pdf', 'X-Filename': encodeURIComponent(file.name) }, body: await file.arrayBuffer() })
  const payload = await response.json()
  if (!response.ok) throw new Error(payload?.detail || `上传失败：${response.status}`)
  return payload
}

export async function getDocument(documentId: string) { return request<DocumentTask>(`/api/documents/${encodeURIComponent(documentId)}`) }
export async function getDocumentChunks(documentId: string) { return request<DocumentChunk[]>(`/api/documents/${encodeURIComponent(documentId)}/chunks`) }

export async function waitForDocument(documentId: string): Promise<DocumentTask> {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    const document = await getDocument(documentId)
    if (['ready', 'failed', 'ocr_failed'].includes(document.status)) return document
    await new Promise(resolve => window.setTimeout(resolve, 1000))
  }
  throw new Error('文件仍在后台解析，请稍后刷新任务列表')
}

export async function startOcr(documentId: string) { return request<{ id: string; status: string }>(`/api/documents/${encodeURIComponent(documentId)}/ocr`, { method: 'POST' }) }
export async function getDocumentTables(documentId: string) { return request<DocumentTable[]>(`/api/documents/${encodeURIComponent(documentId)}/tables`) }

export async function startExtraction(documentId: string): Promise<ExtractionTask> {
  return request<ExtractionTask>(`/api/documents/${encodeURIComponent(documentId)}/extractions`, { method: 'POST', body: JSON.stringify({}) })
}

export async function waitForExtraction(extractionId: string): Promise<ExtractionTask> {
  for (let attempt = 0; attempt < 180; attempt += 1) {
    const task = await request<ExtractionTask>(`/api/document-extractions/${encodeURIComponent(extractionId)}`)
    if (task.status !== 'processing') return task
    await new Promise(resolve => window.setTimeout(resolve, 1000))
  }
  throw new Error('AI 提取仍在后台运行，请稍后查看')
}

export async function downloadProjectExport(projectId: string, format: 'docx' | 'xlsx' | 'pdf') {
  const { token } = cloudSession()
  const response = await fetch(`${backendUrl()}/api/projects/${encodeURIComponent(projectId)}/export?format=${format}&include_evidence=true&include_tasks=true&only_expanded=false`, { headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) { let message = `导出失败：${response.status}`; try { message = (await response.json()).detail || message } catch { /* use status */ } throw new Error(message) }
  return response.blob()
}

export async function requestGraphPatches(state: ProjectState, nodeId: string, mode: 'refine' | 'decompose', instruction: string): Promise<GraphPatch[]> {
  const { workspace } = cloudSession()
  if (!workspace) throw new Error('请先连接研究空间')
  const node = state.nodes[nodeId]
  const context = Object.values(state.nodes).map(item => ({ id: item.id, title: item.title, category: item.category, summary: item.summary, why: item.why, parent: Object.values(state.nodes).find(parent => parent.children.includes(item.id))?.id || null }))
  const system = '你是严谨的产业研究架构师。只返回合法 JSON。你只能提出补丁，不能直接覆盖项目。产业节点应该是可研究的产品、技术、基础设施或价值环节，不要用公司名称作为主节点。所有文本使用中文。'
  const user = `当前项目：${state.projectTitle}\n当前节点：${JSON.stringify(node)}\n图谱上下文：${JSON.stringify(context)}\n任务模式：${mode === 'decompose' ? '拆解当前节点的直接下级产业环节' : '完善当前节点解释并在必要时补充直接下级'}\n用户要求：${instruction || '按照严谨产业研究逻辑提出修改'}\n\n返回：{"patches":[{"id":"patch-1","type":"update_node|add_node|add_edge","targetId":"更新节点ID","parentId":"新增节点父ID","source":"关系起点ID","target":"关系终点ID","before":{"summary":"修改前"},"after":{"title":"节点名称","category":"分类","summary":"一句话解释","why":"为什么重要","metrics":["指标"]},"reason":"修改理由"}]}。最多 8 条。add_node 必须给 parentId 和 after；update_node 必须给 targetId、before、after；add_edge 必须给 source、target。`
  const response = await request<{ result: { patches?: GraphPatch[] } }>('/api/ai/structured', { method: 'POST', body: JSON.stringify({ workspace_id: workspace.id, project_id: formalProjectId() || null, purpose: 'graph_patch', system, user, thinking: true }) })
  return (response.result.patches || []).filter(patch => ['update_node', 'add_node', 'add_edge'].includes(patch.type)).slice(0, 8)
}
