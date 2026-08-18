import { AlertTriangle, CheckCircle2, Clock3, Database, GitBranch, ListChecks, Pencil, Plus, WandSparkles } from 'lucide-react'
import type { ProjectState, ResearchTask } from '../types'

export function Dashboard({ state, onOpenNode, onEditTask, onCreateTask, onGenerateTasks, onAdvanceTask }: { state: ProjectState; onOpenNode: (id: string) => void; onEditTask: (task: ResearchTask) => void; onCreateTask: () => void; onGenerateTasks: () => void; onAdvanceTask: (id: string) => void }) {
  const nodes = Object.values(state.nodes)
  const verified = nodes.filter(node => node.status === 'verified').length
  const evidenced = nodes.filter(node => ['evidenced', 'verified'].includes(node.status)).length
  const evidenceCount = Object.values(state.evidenceData).flat().length
  const pendingTasks = state.researchTasks.filter(task => task.status !== 'done')
  const gaps = [...nodes].sort((a, b) => score(a.id) - score(b.id)).slice(0, 6)
  function score(nodeId: string) { const node = state.nodes[nodeId]; return (node.summary ? 20 : 0) + (node.why ? 20 : 0) + ((state.evidenceData[nodeId]?.length || 0) ? 30 : 0) + (node.status === 'verified' ? 30 : 0) }
  return <section className="workspace-page dashboard-page">
    <div className="page-heading"><div><span>RESEARCH OPERATIONS</span><h2>研究完整度看板</h2><p>把“哪里还没研究清楚”变成可执行任务，而不是只看一张漂亮的图。</p></div><div className="page-actions"><button className="secondary-action" onClick={onGenerateTasks}><WandSparkles size={14} />按缺口生成</button><button className="page-action" onClick={onCreateTask}><Plus size={14} />新建任务</button></div></div>
    <div className="metric-cards"><Metric icon={GitBranch} label="产业节点" value={nodes.length} note="已建立结构" /><Metric icon={CheckCircle2} label="已核验节点" value={verified} note={`${Math.round(verified / nodes.length * 100)}% 核验率`} /><Metric icon={Database} label="证据资料" value={evidenceCount} note={`${evidenced} 个节点有证据`} /><Metric icon={ListChecks} label="待办任务" value={pendingTasks.length} note="需要继续推进" /></div>
    <div className="dashboard-columns"><section className="dashboard-panel"><header><div><AlertTriangle size={16} /><strong>研究缺口</strong></div><span>按完整度排序</span></header>{gaps.map(node => <button className="gap-row" key={node.id} onClick={() => onOpenNode(node.id)}><div><strong>{node.title}</strong><small>{node.category}</small></div><span><i style={{ width: `${score(node.id)}%` }} /></span><b>{score(node.id)}%</b></button>)}</section><section className="dashboard-panel"><header><div><Clock3 size={16} /><strong>研究任务</strong></div><span>{pendingTasks.length} 项未完成</span></header>{pendingTasks.map(task => <article className="task-row" key={task.id}><i className={task.priority} /><div><strong>{task.title}</strong><small>{state.nodes[task.nodeId]?.title || '节点已删除'}</small></div><button className="task-status-button" onClick={() => onAdvanceTask(task.id)}>{task.status === 'doing' ? '完成任务' : '开始任务'}</button><button className="task-edit-button" onClick={() => onEditTask(task)}><Pencil size={12} /></button></article>)}{!pendingTasks.length && <div className="page-empty">所有研究任务均已完成</div>}</section></div>
  </section>
}

function Metric({ icon: Icon, label, value, note }: { icon: typeof GitBranch; label: string; value: number; note: string }) { return <article><span><Icon size={17} /></span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article> }
