const CONFIG_KEY = 'atlas-mini-config-v1'
const SESSION_KEY = 'atlas-mini-session-v1'
const PROJECT_KEY = 'atlas-mini-current-project-v1'
const DEVICE_KEY = 'atlas-mini-device-v1'

function config() {
  const stored = wx.getStorageSync(CONFIG_KEY)
  return stored && /^https?:\/\//i.test(String(stored.baseUrl || '')) ? stored : { baseUrl: 'http://127.0.0.1:8000' }
}

function setBaseUrl(baseUrl) {
  wx.setStorageSync(CONFIG_KEY, { baseUrl: String(baseUrl || '').trim().replace(/\/+$/, '') })
}

function getSession() {
  const session = wx.getStorageSync(SESSION_KEY) || null
  if (session && session.workspace && !['owner', 'editor', 'viewer'].includes(session.workspace.role)) {
    session.workspace.role = 'owner'
    wx.setStorageSync(SESSION_KEY, session)
  }
  return session
}
function setSession(payload) {
  const session = { token: payload.token, user: payload.user, workspace: payload.workspace }
  wx.setStorageSync(SESSION_KEY, session)
  wx.removeStorageSync(PROJECT_KEY)
  return session
}
function logout() { wx.removeStorageSync(SESSION_KEY); wx.removeStorageSync(PROJECT_KEY) }
function deviceKey() {
  let value = wx.getStorageSync(DEVICE_KEY)
  if (!value) {
    value = `device-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
    wx.setStorageSync(DEVICE_KEY, value)
  }
  return value
}

function request(path, options = {}) {
  const session = getSession()
  return new Promise((resolve, reject) => wx.request({
    url: `${config().baseUrl}${path}`,
    method: options.method || 'GET',
    data: options.data,
    timeout: options.timeout || 30000,
    header: { 'Content-Type': 'application/json', ...(session && session.token ? { Authorization: `Bearer ${session.token}` } : {}), ...(options.header || {}) },
    success(response) {
      if (response.statusCode >= 200 && response.statusCode < 300) return resolve(response.data)
      const detail = response.data && response.data.detail
      const message = typeof detail === 'string' ? detail : `服务器返回 ${response.statusCode}`
      const error = new Error(message); error.statusCode = response.statusCode; error.detail = detail; reject(error)
    },
    fail: reject
  }))
}

function emailLogin(email, password) { return request('/api/auth/login', { method: 'POST', data: { email, password } }).then(setSession) }
function emailRegister(email, password, displayName, workspaceName) { return request('/api/auth/register', { method: 'POST', data: { email, password, display_name: displayName, workspace_name: workspaceName } }).then(setSession) }
function devLogin(displayName) {
  return request('/api/auth/dev-login', { method: 'POST', data: { display_name: displayName || '本地研究员', device_key: deviceKey() } })
    .then(payload => setSession({
      token: payload.token,
      user: payload.user,
      workspace: {
        id: payload.workspace_id,
        name: `${payload.user.display_name}的研究空间`,
        role: 'owner',
        user: payload.user
      }
    }))
}
function structuredAi({ purpose, system, user, projectId, thinking = true }) {
  const session = getSession()
  return request('/api/ai/structured', {
    method: 'POST',
    timeout: 120000,
    data: {
      workspace_id: session.workspace.id,
      project_id: projectId || null,
      purpose: purpose || 'industry_research',
      system,
      user,
      thinking
    }
  }).then(payload => payload.result)
}
function generateIndustry(industryName) {
  const name = String(industryName || '').trim()
  return structuredAi({
    purpose: 'generate_industry_map',
    system: '你是一名严谨的产业研究分析师。只返回合法 JSON，不要 Markdown。先建立稳定的产业骨架，再逐层拆解。避免把公司当作产业主节点。所有内容使用中文。',
    user: `为“${name}”创建产业研究图谱。返回严格结构：{"title":"产业链名称","overview":"一句话总览","branches":[{"title":"核心分支","summary":"它是什么","why":"为什么重要","children":[{"title":"细分环节","summary":"它是什么","why":"为什么重要"}]}]}。要求 3-6 个核心分支，每个分支 2-5 个细分环节，概念之间不能重复。`
  })
}
function requestMapPatches(instruction, state, projectId) {
  const context = {
    projectTitle: state.projectTitle,
    rootId: state.rootId,
    nodes: Object.values(state.nodes || {}).map(node => ({
      id: node.id, title: node.title, category: node.category, summary: node.summary,
      why: node.why, children: node.children || []
    })),
    relations: (state.edges || []).map(edge => ({ source: edge.source, target: edge.target, type: edge.type }))
  }
  return structuredAi({
    purpose: 'modify_industry_map', projectId,
    system: '你是产业图谱编辑助手。只返回合法 JSON，不要 Markdown。你只能提出补丁，不能返回整张重写后的图。引用已有节点时必须使用输入中的节点 ID；新增节点使用简短英文 ID。所有文字使用中文。',
    user: `当前图谱：${JSON.stringify(context)}\n用户要求：${instruction}\n返回严格结构：{"patches":[{"operation":"add_node|update_node|add_relation","id":"新增节点ID","parentId":"父节点ID","targetId":"修改目标ID","sourceId":"关系起点ID","field":"summary|why|title|category","value":"修改后的字段值","title":"节点标题","summary":"节点说明","why":"重要性","relationType":"supply|depend|constraint|structure","reason":"修改理由"}]}。只提出必要修改，最多 10 项。`
  }).then(result => {
    if (!Array.isArray(result.patches) || !result.patches.length) throw new Error('AI 没有返回可审核的修改项')
    return result.patches.slice(0, 10)
  })
}
function wechatLogin(displayName) {
  return new Promise((resolve, reject) => wx.login({ success: result => result.code ? resolve(result.code) : reject(new Error('微信未返回登录凭证')), fail: reject }))
    .then(code => request('/api/auth/wechat', { method: 'POST', data: { code, display_name: displayName || '微信研究员' } }))
    .then(setSession)
}
function bindWechat() {
  return new Promise((resolve, reject) => wx.login({ success: result => result.code ? resolve(result.code) : reject(new Error('微信未返回绑定凭证')), fail: reject }))
    .then(code => request('/api/auth/bind-wechat', { method: 'POST', data: { code } }))
    .then(payload => { const session = getSession(); session.user = payload.user; wx.setStorageSync(SESSION_KEY, session); return payload })
}
function systemStatus() { return request('/api/system/status') }
function listWorkspaces() { return request('/api/workspaces') }
function createWorkspace(name) { return request('/api/workspaces', { method: 'POST', data: { name } }) }
function listMembers(workspaceId) { return request(`/api/workspaces/${encodeURIComponent(workspaceId || getSession().workspace.id)}/members`) }
function addMember(email, role) { return request(`/api/workspaces/${encodeURIComponent(getSession().workspace.id)}/members`, { method: 'POST', data: { email, role } }) }
function updateMember(memberId, role) { return request(`/api/workspaces/${encodeURIComponent(getSession().workspace.id)}/members/${encodeURIComponent(memberId)}`, { method: 'PATCH', data: { role } }) }
function removeMember(memberId) { return request(`/api/workspaces/${encodeURIComponent(getSession().workspace.id)}/members/${encodeURIComponent(memberId)}`, { method: 'DELETE' }) }
function selectWorkspace(workspace) {
  const session = getSession(); session.workspace = { ...workspace, user: session.user }; wx.setStorageSync(SESSION_KEY, session); wx.removeStorageSync(PROJECT_KEY); return session
}
function listProjects(workspaceId) { return request(`/api/projects?workspace_id=${encodeURIComponent(workspaceId || getSession().workspace.id)}`) }
function getProject(id) { return request(`/api/projects/${encodeURIComponent(id)}`).then(project => { saveCurrentProject(project); return project }) }
function createProject(title, state) { return request('/api/projects', { method: 'POST', data: { workspace_id: getSession().workspace.id, title, state } }).then(project => { saveCurrentProject(project); return project }) }
function updateProject(project, state, force) {
  return request(`/api/projects/${encodeURIComponent(project.id)}`, { method: 'PUT', data: { title: state.projectTitle, state, ...(force ? {} : { expected_version: project.version }) } }).then(updated => { saveCurrentProject(updated); return updated })
}
function deleteProject(id) { return request(`/api/projects/${encodeURIComponent(id)}`, { method: 'DELETE' }).then(() => { const current = getCurrentProject().project; if (current && current.id === id) wx.removeStorageSync(PROJECT_KEY) }) }
function getCurrentProject() { const project = wx.getStorageSync(PROJECT_KEY) || null; return { project, state: project && project.state } }
function saveCurrentProject(project) { if (project) wx.setStorageSync(PROJECT_KEY, project); else wx.removeStorageSync(PROJECT_KEY) }
function downloadProject(format, options = {}) {
  const project = getCurrentProject().project, session = getSession()
  if (!project) return Promise.reject(new Error('请先打开研究项目'))
  const query = [`format=${encodeURIComponent(format)}`, `include_evidence=${options.includeEvidence !== false}`, `include_tasks=${options.includeTasks !== false}`, `only_expanded=${options.onlyExpanded === true}`].join('&')
  return new Promise((resolve, reject) => wx.downloadFile({
    url: `${config().baseUrl}/api/projects/${encodeURIComponent(project.id)}/export?${query}`,
    header: { Authorization: `Bearer ${session.token}` }, timeout: 120000,
    success(response) { response.statusCode >= 200 && response.statusCode < 300 ? resolve(response.tempFilePath) : reject(new Error(`导出失败：${response.statusCode}`)) }, fail: reject
  }))
}
function openExport(format, options) {
  return downloadProject(format, options).then(filePath => new Promise((resolve, reject) => wx.openDocument({ filePath, fileType: format, showMenu: true, success: resolve, fail: reject })))
}

function listDocuments() {
  const session = getSession(), current = getCurrentProject().project
  const params = [`workspace_id=${encodeURIComponent(session.workspace.id)}`]
  if (current) params.push(`project_id=${encodeURIComponent(current.id)}`)
  return request(`/api/documents?${params.join('&')}`)
}
function getDocument(id) { return request(`/api/documents/${encodeURIComponent(id)}`) }
function uploadPdf(filePath, filename) {
  const session = getSession(), current = getCurrentProject().project
  if (!current) return Promise.reject(new Error('请先打开云端项目'))
  return new Promise((resolve, reject) => wx.getFileSystemManager().readFile({ filePath, success: file => wx.request({
    url: `${config().baseUrl}/api/documents?workspace_id=${encodeURIComponent(session.workspace.id)}&project_id=${encodeURIComponent(current.id)}`,
    method: 'POST', data: file.data, timeout: 120000,
    header: { Authorization: `Bearer ${session.token}`, 'Content-Type': 'application/pdf', 'X-Filename': encodeURIComponent(filename) },
    success(response) { if (response.statusCode >= 200 && response.statusCode < 300) resolve(response.data); else reject(new Error((response.data && response.data.detail) || `上传失败：${response.statusCode}`)) }, fail: reject
  }), fail: reject }))
}
function startOcr(id) { return request(`/api/documents/${encodeURIComponent(id)}/ocr`, { method: 'POST', timeout: 120000 }) }
function startExtraction(id) { return request(`/api/documents/${encodeURIComponent(id)}/extractions`, { method: 'POST', data: {}, timeout: 120000 }) }
function getExtraction(id) { return request(`/api/document-extractions/${encodeURIComponent(id)}`, { timeout: 120000 }) }
function waitDocument(id, attempts = 60) {
  return getDocument(id).then(document => ['ready', 'failed', 'ocr_failed'].includes(document.status) || attempts <= 1 ? document : new Promise(resolve => setTimeout(resolve, 1200)).then(() => waitDocument(id, attempts - 1)))
}

module.exports = { config, setBaseUrl, getSession, logout, request, emailLogin, emailRegister, devLogin, wechatLogin, bindWechat, systemStatus, structuredAi, generateIndustry, requestMapPatches, listWorkspaces, createWorkspace, listMembers, addMember, updateMember, removeMember, selectWorkspace, listProjects, getProject, createProject, updateProject, deleteProject, getCurrentProject, saveCurrentProject, downloadProject, openExport, listDocuments, getDocument, uploadPdf, startOcr, startExtraction, getExtraction, waitDocument }
