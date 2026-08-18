import { Cloud, HardDrive, X } from 'lucide-react'
import type { CloudProject, ProjectState } from '../types'

function summary(state: ProjectState) {
  return { nodes: Object.keys(state.nodes || {}).length, companies: state.companyData?.length || 0, tasks: state.researchTasks?.length || 0 }
}

export function ProjectConflictDialog({ local, remote, onUseCloud, onKeepLocal, onClose, busy }: { local: ProjectState; remote: CloudProject; onUseCloud: () => void; onKeepLocal: () => void; onClose: () => void; busy: boolean }) {
  const localSummary = summary(local), cloudSummary = summary(remote.state)
  return <div className="formal-modal"><section className="conflict-dialog"><header><div><span>SYNC CONFLICT</span><h2>云端已有更新</h2></div><button onClick={onClose}><X size={17} /></button></header><div className="conflict-copy"><p>另一位成员在你上次同步后修改了项目。请选择保留哪一版；系统不会静默覆盖。</p></div><div className="conflict-versions"><article><HardDrive size={21} /><strong>当前本地版本</strong><small>{local.projectTitle}</small><div><span>{localSummary.nodes} 节点</span><span>{localSummary.companies} 公司</span><span>{localSummary.tasks} 任务</span></div></article><article><Cloud size={21} /><strong>云端版本 v{remote.version}</strong><small>{new Date(remote.updated_at).toLocaleString('zh-CN')}</small><div><span>{cloudSummary.nodes} 节点</span><span>{cloudSummary.companies} 公司</span><span>{cloudSummary.tasks} 任务</span></div></article></div><footer><button onClick={onUseCloud} disabled={busy}><Cloud size={15} />使用云端版本</button><button className="primary" onClick={onKeepLocal} disabled={busy}><HardDrive size={15} />保留本地并覆盖</button></footer></section></div>
}
