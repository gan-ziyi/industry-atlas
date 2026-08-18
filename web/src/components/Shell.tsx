import { BarChart3, BookOpen, Building2, FolderKanban, GitBranch, History, Settings, Sparkles, Users } from 'lucide-react'
import type { ReactNode } from 'react'

export type ViewName = 'graph' | 'projects' | 'dashboard' | 'library' | 'companies' | 'snapshots' | 'team'

const navigation: Array<{ id: ViewName; label: string; icon: typeof GitBranch }> = [
  { id: 'projects', label: '云端项目', icon: FolderKanban },
  { id: 'graph', label: '产业图谱', icon: GitBranch },
  { id: 'dashboard', label: '研究看板', icon: BarChart3 },
  { id: 'library', label: '资料与年报', icon: BookOpen },
  { id: 'companies', label: '公司研究', icon: Building2 },
  { id: 'snapshots', label: '历史版本', icon: History },
  { id: 'team', label: '团队与权限', icon: Users },
]

interface ShellProps {
  view: ViewName
  onViewChange: (view: ViewName) => void
  children: ReactNode
  connected: boolean
  onSettings: () => void
}

export function Shell({ view, onViewChange, children, connected, onSettings }: ShellProps) {
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span><Sparkles size={17} /></span><div><strong>Industry Atlas</strong><small>产业研究工作台</small></div></div>
      <nav>{navigation.map(item => { const Icon = item.icon; return <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => onViewChange(item.id)}><Icon size={16} /><span>{item.label}</span></button> })}</nav>
      <div className="sidebar-spacer" />
      <button className="settings-link" onClick={onSettings}><Settings size={15} /><span>系统设置</span></button>
      <div className="workspace-state"><i className={connected ? 'online' : ''} /><div><strong>{connected ? '研究空间已连接' : '本地研究模式'}</strong><small>{connected ? '项目与公司主档可同步' : '连接后端后启用云端能力'}</small></div></div>
    </aside>
    <main className="main-stage">{children}</main>
  </div>
}
