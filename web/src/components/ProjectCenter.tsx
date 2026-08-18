import { Cloud, FolderOpen, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cloudSession, deleteCloudProject, listProjects, listWorkspaces } from '../api/client'
import type { CloudProjectSummary, CloudWorkspace } from '../types'

const roleLabel = { owner: '所有者', editor: '编辑者', viewer: '查看者' }

export function ProjectCenter({ connected, currentProjectId, onOpen, onCreate, onSwitchWorkspace, onCurrentDeleted }: {
  connected: boolean
  currentProjectId: string
  onOpen: (projectId: string) => Promise<void>
  onCreate: (title: string) => Promise<void>
  onSwitchWorkspace: (workspace: CloudWorkspace) => void
  onCurrentDeleted: () => void
}) {
  const [workspaces, setWorkspaces] = useState<CloudWorkspace[]>([])
  const [projects, setProjects] = useState<CloudProjectSummary[]>([])
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const current = cloudSession().workspace
  const canEdit = current?.role !== 'viewer'
  const load = async () => {
    if (!connected) return
    setBusy(true)
    try { const spaces = await listWorkspaces(); setWorkspaces(spaces); setProjects(await listProjects()); setStatus('') }
    catch (reason) { setStatus(reason instanceof Error ? reason.message : '加载项目失败') }
    finally { setBusy(false) }
  }
  useEffect(() => { void load() }, [connected, current?.id])
  const switchSpace = async (id: string) => {
    const workspace = workspaces.find(item => item.id === id)
    if (!workspace) return
    onSwitchWorkspace(workspace); setBusy(true)
    try { setProjects(await listProjects(workspace.id)); setStatus(`已切换到：${workspace.name}`) }
    catch (reason) { setStatus(reason instanceof Error ? reason.message : '切换失败') }
    finally { setBusy(false) }
  }
  const create = async () => {
    const title = window.prompt('新项目名称', '新的产业研究')?.trim()
    if (!title) return
    setBusy(true); try { await onCreate(title); await load(); setStatus('新项目已创建并打开') } catch (reason) { setStatus(reason instanceof Error ? reason.message : '创建失败') } finally { setBusy(false) }
  }
  const remove = async (project: CloudProjectSummary) => {
    if (!window.confirm(`删除云端项目“${project.title}”？此操作无法恢复。`)) return
    setBusy(true)
    try { await deleteCloudProject(project.id); if (project.id === currentProjectId) onCurrentDeleted(); await load(); setStatus('项目已删除') }
    catch (reason) { setStatus(reason instanceof Error ? reason.message : '删除失败') }
    finally { setBusy(false) }
  }
  if (!connected) return <section className="project-center empty-page"><Cloud size={35} /><h2>登录后使用云端项目中心</h2><p>本地草稿仍会自动保存；登录后可以跨设备打开项目并与团队协作。</p></section>
  return <section className="project-center"><header><div><span>PROJECT WORKSPACE</span><h1>云端项目中心</h1><p>选择研究空间，继续已有产业研究或将当前草稿创建为新项目。</p></div><div><button onClick={() => void load()} disabled={busy}><RefreshCw size={15} />刷新</button>{canEdit && <button className="primary" onClick={() => void create()} disabled={busy}><Plus size={15} />新建项目</button>}</div></header>
    <div className="workspace-switcher"><label><span>当前研究空间</span><select aria-label="当前研究空间" value={current?.id || ''} onChange={event => void switchSpace(event.target.value)}>{workspaces.map(workspace => <option key={workspace.id} value={workspace.id}>{workspace.name} · {roleLabel[workspace.role || 'viewer']}</option>)}</select></label><div><strong>{current?.name}</strong><small>{current?.role === 'owner' ? '可以管理成员及全部项目' : current?.role === 'editor' ? '可以创建和编辑项目' : '只读访问，不能修改云端内容'}</small></div></div>
    {status && <div className="project-status">{status}</div>}
    <div className="cloud-project-grid">{projects.map(project => <article key={project.id} className={project.id === currentProjectId ? 'current' : ''}><div className="project-card-icon"><FolderOpen size={20} /></div><div><span>{project.id === currentProjectId ? 'CURRENT PROJECT' : `VERSION ${project.version}`}</span><h3>{project.title}</h3><p>更新于 {new Date(project.updated_at).toLocaleString('zh-CN')}</p></div><footer><button onClick={() => void onOpen(project.id)} disabled={busy}><FolderOpen size={14} />{project.id === currentProjectId ? '重新载入' : '打开项目'}</button>{canEdit && <button className="danger" aria-label={`删除${project.title}`} onClick={() => void remove(project)}><Trash2 size={14} /></button>}</footer></article>)}{!projects.length && <div className="project-empty"><Cloud size={28} /><strong>这个空间还没有云端项目</strong><span>{canEdit ? '点击“新建项目”，将当前本地草稿保存到云端。' : '请让空间编辑者创建项目。'}</span></div>}</div>
  </section>
}
