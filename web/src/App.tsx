import { useEffect, useMemo, useState } from 'react'
import { acceptCloudProject, cloudSession, createCloudProject, downloadProjectExport, forceSyncProject, formalProjectId, getCloudProject, getDocumentChunks, ProjectConflictError, selectWorkspace, startExtraction, storageScope, syncCompanies, syncProject, uploadPdf, waitForDocument, waitForExtraction } from './api/client'
import { AIResearchDialog } from './components/AIResearchDialog'
import { CompanyLibrary } from './components/CompanyLibrary'
import { ConnectionDialog } from './components/ConnectionDialog'
import { Dashboard } from './components/Dashboard'
import { EvidenceEditor } from './components/EvidenceEditor'
import { ExportDialog } from './components/ExportDialog'
import { ExtractionReview } from './components/ExtractionReview'
import { IndustryGraph } from './components/IndustryGraph'
import { NodeInspector } from './components/NodeInspector'
import { ProjectCenter } from './components/ProjectCenter'
import { ProjectConflictDialog } from './components/ProjectConflictDialog'
import { ResearchLibrary } from './components/ResearchLibrary'
import { Shell, type ViewName } from './components/Shell'
import { SnapshotManager } from './components/SnapshotManager'
import { TaskEditor } from './components/TaskEditor'
import { Topbar } from './components/Topbar'
import { WorkspaceMembers } from './components/WorkspaceMembers'
import { loadProject, loadSnapshots, saveProject, saveSnapshots } from './persistence'
import type { CloudProject, Company, DocumentTable, DocumentTask, Evidence, ExtractionTask, Finding, GraphPatch, ProjectSnapshot, ProjectState, ResearchTask } from './types'

export default function App() {
  const [state, setState] = useState<ProjectState>(() => loadProject(storageScope()))
  const [selectedId, setSelectedId] = useState(state.rootId)
  const [view, setView] = useState<ViewName>('graph')
  const [search, setSearch] = useState('')
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle')
  const [review, setReview] = useState<{ task: ExtractionTask; document: DocumentTask; nodeId: string } | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>(() => loadSnapshots(storageScope()))
  const [connectionOpen, setConnectionOpen] = useState(false)
  const [sessionVersion, setSessionVersion] = useState(0)
  const [evidenceEditor, setEvidenceEditor] = useState<{ nodeId: string; evidence?: Evidence } | null>(null)
  const [aiOpen, setAiOpen] = useState(false)
  const [taskEditor, setTaskEditor] = useState<{ task?: ResearchTask } | null>(null)
  const [conflict, setConflict] = useState<CloudProject | null>(null)
  const [conflictBusy, setConflictBusy] = useState(false)
  const session = useMemo(() => cloudSession(), [sessionVersion])
  const connected = Boolean(session.token && session.workspace)
  const canEdit = !connected || session.workspace?.role !== 'viewer'
  const activeScope = storageScope()
  useEffect(() => { const timer = window.setTimeout(() => saveProject(state, activeScope), 250); return () => window.clearTimeout(timer) }, [state, activeScope])
  useEffect(() => { saveSnapshots(snapshots, activeScope) }, [snapshots, activeScope])
  const selected = state.nodes[selectedId] || state.nodes[state.rootId]
  const relatedCompanies = useMemo(() => state.companyData.filter(company => company.mappings.some(mapping => mapping.nodeId === selected.id && mapping.status !== 'rejected')).length, [state.companyData, selected.id])

  const updateNode = (id: string, patch: Partial<ProjectState['nodes'][string]>) => { createSnapshot(`修改节点“${state.nodes[id]?.title || id}”`); setState(current => ({ ...current, nodes: { ...current.nodes, [id]: { ...current.nodes[id], ...patch } } })) }
  const addChild = () => {
    const title = window.prompt(`在“${selected.title}”下新增什么产业环节？`, '新产业环节')?.trim()
    if (!title) return
    createSnapshot(`新增“${title}”前`)
    const id = `node-${Date.now()}`
    const siblingCount = selected.children.length
    const node = { id, title, category: `${selected.title} · 待分类`, summary: '', why: '', status: 'unresearched' as const, children: [], position: { x: selected.position.x + 280, y: selected.position.y + siblingCount * 90 } }
    setState(current => ({ ...current, nodes: { ...current.nodes, [id]: node, [selected.id]: { ...current.nodes[selected.id], children: [...current.nodes[selected.id].children, id] } } }))
    setSelectedId(id)
  }
  const mergeCloudCompanies = (incoming: Company[]) => setState(current => {
    const companies = structuredClone(current.companyData)
    incoming.forEach(remote => {
      const mapped = { ...remote, mappings: (remote.mappings || []).map(mapping => { const nodeId = current.nodes[mapping.nodeId] ? mapping.nodeId : Object.keys(current.nodes).find(id => current.nodes[id].title === mapping.nodeTitle); return nodeId ? { ...mapping, nodeId } : null }).filter(Boolean) as Company['mappings'] }
      const local = companies.find(company => company.name.trim().toLowerCase() === remote.name.trim().toLowerCase())
      if (!local) companies.push(mapped)
      else { local.findings = unique([...local.findings, ...mapped.findings], item => `${item.reportPeriod}:${item.category}:${item.title}:${item.value}`); local.periods = unique([...local.periods, ...mapped.periods], item => item.period); local.documents = unique([...local.documents, ...mapped.documents], item => `${item.documentId}:${item.filename}`); local.mappings = unique([...local.mappings, ...mapped.mappings], item => item.nodeId) }
    })
    return { ...current, companyData: companies }
  })
  const handleSync = async () => {
    if (!connected) { setConnectionOpen(true); return }
    setSyncState('syncing')
    try { const projectId = await syncProject(state); mergeCloudCompanies(await syncCompanies(state, projectId)); setSessionVersion(value => value + 1); setSyncState('done'); window.setTimeout(() => setSyncState('idle'), 1800) }
    catch (reason) { if (reason instanceof ProjectConflictError) setConflict(reason.remote); setSyncState('error') }
  }
  const loadScope = (scope: string) => {
    const next = loadProject(scope)
    setState(next); setSnapshots(loadSnapshots(scope)); setSelectedId(next.rootId); setSearch('')
  }
  const handleSessionChanged = () => {
    saveProject(state, activeScope); saveSnapshots(snapshots, activeScope)
    const nextScope = storageScope()
    if (nextScope !== activeScope) loadScope(nextScope)
    setSessionVersion(value => value + 1)
  }
  const handleWorkspaceSwitch = (workspace: Parameters<typeof selectWorkspace>[0]) => {
    saveProject(state, activeScope); saveSnapshots(snapshots, activeScope); selectWorkspace(workspace)
    loadScope(storageScope()); setSessionVersion(value => value + 1); setView('projects')
  }
  const handleOpenProject = async (projectId: string) => {
    saveProject(state, activeScope); saveSnapshots(snapshots, activeScope)
    const project = await getCloudProject(projectId); acceptCloudProject(project)
    const scope = storageScope(); saveProject(project.state, scope); setState(structuredClone(project.state)); setSnapshots(loadSnapshots(scope)); setSelectedId(project.state.rootId); setSessionVersion(value => value + 1); setView('graph')
  }
  const handleCreateProject = async (title: string) => {
    const next = { ...structuredClone(state), projectTitle: title }
    const project = await createCloudProject(next), scope = storageScope()
    saveProject(project.state, scope); setState(project.state); setSnapshots([]); setSelectedId(project.state.rootId); setSessionVersion(value => value + 1); setView('graph')
  }
  const handleCurrentProjectDeleted = () => { const scope = storageScope(); loadScope(scope); setSessionVersion(value => value + 1) }
  const useCloudVersion = () => {
    if (!conflict) return
    createSnapshot('切换到云端版本前')
    acceptCloudProject(conflict); setState(structuredClone(conflict.state)); setSelectedId(conflict.state.rootId); setConflict(null); setSyncState('done'); window.setTimeout(() => setSyncState('idle'), 1800)
  }
  const keepLocalVersion = async () => {
    if (!conflict) return
    setConflictBusy(true)
    try { const projectId = await forceSyncProject(state); mergeCloudCompanies(await syncCompanies(state, projectId)); setConflict(null); setSyncState('done'); window.setTimeout(() => setSyncState('idle'), 1800) }
    catch { setSyncState('error') }
    finally { setConflictBusy(false) }
  }
  const setMappingStatus = (companyId: string, mappingId: string, status: 'confirmed' | 'rejected') => { createSnapshot(`${status === 'confirmed' ? '确认' : '排除'}公司映射前`); setState(current => ({ ...current, companyData: current.companyData.map(company => company.id === companyId ? { ...company, mappings: company.mappings.map(mapping => mapping.id === mappingId ? { ...mapping, status } : mapping) } : company) })) }
  const openNode = (id: string) => { setSelectedId(id); setView('graph') }
  const createSnapshot = (label = '手动创建的正式版快照') => setSnapshots(current => [{ id: `snapshot-${Date.now()}`, label, createdAt: new Date().toISOString(), state: structuredClone(state) }, ...current].slice(0, 40))
  const handleUpload = async (file: File) => {
    const nodeId = selected.id, projectId = await syncProject(state), uploaded = await uploadPdf(file, projectId), document = await waitForDocument(uploaded.id)
    if (document.status === 'failed') throw new Error(document.error || 'PDF 解析失败')
    const chunks = await getDocumentChunks(document.id), first = chunks.find(chunk => chunk.text.trim())
    createSnapshot(`写入“${document.filename}”前`)
    setState(current => ({ ...current, nodes: { ...current.nodes, [nodeId]: { ...current.nodes[nodeId], status: 'evidenced' } }, evidenceData: { ...current.evidenceData, [nodeId]: [...(current.evidenceData[nodeId] || []), { id: `document-${document.id}`, type: 'PDF', title: document.filename, location: `${document.page_count} 页 · 后端文档 ${document.id}`, quote: first?.text.slice(0, 600) || '未提取到可复制文本，可能需要 OCR。', verified: false }] } }))
  }
  const handleExtraction = async (document: DocumentTask) => {
    const nodeId = selected.id, started = await startExtraction(document.id), task = await waitForExtraction(started.id)
    if (task.status === 'failed' || !task.result) throw new Error(task.error || 'DeepSeek 提取失败')
    setReview({ task, document, nodeId })
  }
  const acceptExtraction = (findings: Finding[]) => {
    if (!review?.task.result) return
    const result = review.task.result, nodeId = review.nodeId
    createSnapshot(`接纳“${review.document.filename}”AI 发现前`)
    setState(current => {
      const companyData = structuredClone(current.companyData)
      const evidence = [...(current.evidenceData[nodeId] || [])]
      findings.forEach(finding => evidence.push({ id: `finding-${review.task.id}-${finding.id}`, type: 'ANNUAL', title: `${review.document.filename} · ${finding.title}`, location: finding.matched_pages?.length ? `第 ${finding.matched_pages.join('、')} 页` : '页码待核对', quote: finding.quote || finding.value, verified: false }))
      if (result.company) {
        let company = companyData.find(item => item.name.trim().toLowerCase() === result.company.trim().toLowerCase())
        if (!company) { company = { id: `company-${Date.now()}`, name: result.company, reportPeriod: result.report_period, summary: result.summary, findings: [], mappings: [], periods: [], documents: [] }; companyData.push(company) }
        company.summary = result.summary || company.summary; company.reportPeriod = result.report_period || company.reportPeriod
        company.findings = unique([...company.findings, ...findings.map(item => ({ ...item, reportPeriod: result.report_period }))], item => `${item.reportPeriod}:${item.category}:${item.title}:${item.value}`)
        company.documents = unique([...company.documents, { documentId: review.document.id, filename: review.document.filename }], item => `${item.documentId}:${item.filename}`)
        if (!company.periods.some(period => period.period === result.report_period)) company.periods.push({ period: result.report_period || '报告期未识别', summary: result.summary, findingIds: findings.map(item => item.id), documents: [{ documentId: review.document.id, filename: review.document.filename }] })
        if (!company.mappings.some(mapping => mapping.nodeId === nodeId)) company.mappings.push({ id: `mapping-${Date.now()}-${nodeId}`, nodeId, nodeTitle: current.nodes[nodeId].title, status: 'suggested', score: 72, reason: `年报在“${current.nodes[nodeId].title}”研究上下文中上传并完成提取` })
      }
      return { ...current, nodes: { ...current.nodes, [nodeId]: { ...current.nodes[nodeId], status: 'evidenced' } }, evidenceData: { ...current.evidenceData, [nodeId]: evidence }, companyData }
    })
    setReview(null); setView('companies')
  }
  const handleExport = async (format: 'docx' | 'xlsx' | 'pdf') => {
    if (!connected) throw new Error('请先连接后端研究空间')
    const projectId = await syncProject(state), blob = await downloadProjectExport(projectId, format), url = URL.createObjectURL(blob), link = document.createElement('a')
    link.href = url; link.download = `${state.projectTitle}-研究报告.${format}`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 800)
  }
  const saveEvidence = (evidence: Evidence) => {
    if (!evidenceEditor) return
    createSnapshot(`${evidenceEditor.evidence ? '编辑' : '新增'}节点证据前`)
    const nodeId = evidenceEditor.nodeId
    setState(current => { const list = [...(current.evidenceData[nodeId] || [])], index = list.findIndex(item => item.id === evidence.id); if (index >= 0) list[index] = evidence; else list.push(evidence); return { ...current, nodes: { ...current.nodes, [nodeId]: { ...current.nodes[nodeId], status: evidence.verified ? 'verified' : 'evidenced' } }, evidenceData: { ...current.evidenceData, [nodeId]: list } } })
    setEvidenceEditor(null)
  }
  const deleteEvidence = () => {
    if (!evidenceEditor?.evidence) return
    createSnapshot('删除节点证据前')
    const { nodeId, evidence } = evidenceEditor
    setState(current => ({ ...current, evidenceData: { ...current.evidenceData, [nodeId]: (current.evidenceData[nodeId] || []).filter(item => item.id !== evidence.id) } }))
    setEvidenceEditor(null)
  }
  const attachTable = (document: DocumentTask, table: DocumentTable) => {
    createSnapshot(`写入“${document.filename}”年报表格前`)
    const nodeId = selected.id, quote = table.data.slice(0, 15).map(row => row.join('｜')).join('\n').slice(0, 1800)
    setState(current => ({ ...current, nodes: { ...current.nodes, [nodeId]: { ...current.nodes[nodeId], status: 'evidenced' } }, evidenceData: { ...current.evidenceData, [nodeId]: [...(current.evidenceData[nodeId] || []), { id: `table-${table.id}`, type: 'ANNUAL', title: `${document.filename} · 表格 ${table.table_number}`, location: `第 ${table.page_number} 页`, quote, verified: false }] } }))
  }
  const applyGraphPatches = (patches: GraphPatch[]) => {
    createSnapshot(`接纳 ${patches.length} 项 AI 图谱修改前`)
    setState(current => {
      const nodes = structuredClone(current.nodes), edges = structuredClone(current.edges)
      patches.forEach((patch, index) => {
        if (patch.type === 'update_node' && patch.targetId && nodes[patch.targetId] && patch.after) {
          const allowed = (({ title, category, summary, why, metrics, bottlenecks }) => ({ title, category, summary, why, metrics, bottlenecks }))(patch.after)
          Object.assign(nodes[patch.targetId], Object.fromEntries(Object.entries(allowed).filter(([, value]) => value !== undefined)), { status: 'ai_draft' })
        }
        if (patch.type === 'add_node' && patch.after) {
          const parentId = patch.parentId && nodes[patch.parentId] ? patch.parentId : selected.id, parent = nodes[parentId], proposedId = String(patch.after.id || '').trim(), id = proposedId && !nodes[proposedId] ? proposedId : `ai-node-${Date.now()}-${index}`
          nodes[id] = { id, title: String(patch.after.title || 'AI 建议节点'), category: String(patch.after.category || `${parent.title} · AI 建议`), summary: String(patch.after.summary || ''), why: String(patch.after.why || ''), metrics: patch.after.metrics || [], bottlenecks: patch.after.bottlenecks || [], status: 'ai_draft', children: [], position: { x: parent.position.x + 280, y: parent.position.y + parent.children.length * 90 } }
          if (!parent.children.includes(id)) parent.children.push(id)
        }
        if (patch.type === 'add_edge' && patch.source && patch.target && nodes[patch.source] && nodes[patch.target] && !edges.some(edge => edge.source === patch.source && edge.target === patch.target)) edges.push({ id: `ai-edge-${Date.now()}-${index}`, source: patch.source, target: patch.target, type: 'dependency', reason: patch.reason })
      })
      return { ...current, nodes, edges }
    })
    setAiOpen(false)
  }
  const saveTask = (task: ResearchTask) => { createSnapshot(`${state.researchTasks.some(item => item.id === task.id) ? '编辑' : '新增'}研究任务前`); setState(current => ({ ...current, researchTasks: current.researchTasks.some(item => item.id === task.id) ? current.researchTasks.map(item => item.id === task.id ? task : item) : [...current.researchTasks, task] })); setTaskEditor(null) }
  const deleteTask = () => { if (!taskEditor?.task) return; createSnapshot('删除研究任务前'); setState(current => ({ ...current, researchTasks: current.researchTasks.filter(item => item.id !== taskEditor.task?.id) })); setTaskEditor(null) }
  const advanceTask = (id: string) => { createSnapshot('更新研究任务状态前'); setState(current => ({ ...current, researchTasks: current.researchTasks.map(task => task.id === id ? { ...task, status: task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo' } : task) })) }
  const generateGapTasks = () => {
    const existing = new Set(state.researchTasks.filter(task => task.status !== 'done').map(task => task.nodeId)), candidates = Object.values(state.nodes).filter(node => !existing.has(node.id) && (!state.evidenceData[node.id]?.length || node.status === 'unresearched')).slice(0, 6)
    if (!candidates.length) return
    createSnapshot('按研究缺口生成任务前')
    setState(current => ({ ...current, researchTasks: [...current.researchTasks, ...candidates.map((node, index): ResearchTask => ({ id: `gap-task-${Date.now()}-${index}`, nodeId: node.id, title: state.evidenceData[node.id]?.length ? `完善“${node.title}”产业解释` : `为“${node.title}”补充可引用证据`, type: state.evidenceData[node.id]?.length ? 'explain' : 'evidence', priority: index < 2 ? 'high' : 'medium', status: 'todo', note: '由正式版研究完整度看板根据当前缺口自动生成。' }))] }))
  }

  return <Shell view={view} onViewChange={setView} connected={connected} onSettings={() => setConnectionOpen(true)}>
    <Topbar title={state.projectTitle} syncState={syncState} readOnly={!canEdit} onSync={handleSync} onSearch={setSearch} onExport={() => setExportOpen(true)} onAI={() => connected ? setAiOpen(true) : setConnectionOpen(true)} />
    {view === 'projects' && <ProjectCenter connected={connected} currentProjectId={formalProjectId()} onOpen={handleOpenProject} onCreate={handleCreateProject} onSwitchWorkspace={handleWorkspaceSwitch} onCurrentDeleted={handleCurrentProjectDeleted} />}
    {view === 'graph' && <div className="graph-workspace"><IndustryGraph state={state} selectedId={selected.id} search={search} readOnly={!canEdit} onSelect={setSelectedId} onMove={(id, position) => updateNode(id, { position })} /><NodeInspector node={selected} evidence={state.evidenceData[selected.id] || []} relatedCompanies={relatedCompanies} readOnly={!canEdit} onSave={patch => updateNode(selected.id, patch)} onAddChild={addChild} onAddEvidence={() => setEvidenceEditor({ nodeId: selected.id })} onEditEvidence={evidence => setEvidenceEditor({ nodeId: selected.id, evidence })} /></div>}
    {view === 'dashboard' && <Dashboard state={state} onOpenNode={openNode} onEditTask={task => setTaskEditor({ task })} onCreateTask={() => setTaskEditor({})} onGenerateTasks={generateGapTasks} onAdvanceTask={advanceTask} />}
    {view === 'library' && <ResearchLibrary connected={connected} targetNodeTitle={selected.title} onUpload={handleUpload} onExtract={handleExtraction} onAttachTable={attachTable} />}
    {view === 'companies' && <CompanyLibrary state={state} onMappingStatus={setMappingStatus} />}
    {view === 'snapshots' && <SnapshotManager snapshots={snapshots} onCreate={() => createSnapshot()} onRestore={snapshot => { createSnapshot('恢复历史版本前自动备份'); setState(structuredClone(snapshot.state)); setSelectedId(snapshot.state.rootId); setView('graph') }} onDelete={id => setSnapshots(current => current.filter(snapshot => snapshot.id !== id))} />}
    {view === 'team' && <WorkspaceMembers connected={connected} />}
    {review && <ExtractionReview task={review.task} document={review.document} onClose={() => setReview(null)} onAccept={acceptExtraction} />}
    {exportOpen && <ExportDialog onClose={() => setExportOpen(false)} onExport={handleExport} />}
    {connectionOpen && <ConnectionDialog onClose={() => setConnectionOpen(false)} onChanged={handleSessionChanged} />}
    {evidenceEditor && <EvidenceEditor evidence={evidenceEditor.evidence} onClose={() => setEvidenceEditor(null)} onSave={saveEvidence} onDelete={evidenceEditor.evidence ? deleteEvidence : undefined} />}
    {aiOpen && <AIResearchDialog state={state} nodeId={selected.id} onClose={() => setAiOpen(false)} onApply={applyGraphPatches} />}
    {taskEditor && <TaskEditor state={state} task={taskEditor.task} defaultNodeId={selected.id} onClose={() => setTaskEditor(null)} onSave={saveTask} onDelete={taskEditor.task ? deleteTask : undefined} />}
    {conflict && <ProjectConflictDialog local={state} remote={conflict} busy={conflictBusy} onUseCloud={useCloudVersion} onKeepLocal={() => void keepLocalVersion()} onClose={() => setConflict(null)} />}
  </Shell>
}

function unique<T>(items: T[], key: (item: T) => string) { const seen = new Set<string>(); return items.filter(item => { const value = key(item); if (seen.has(value)) return false; seen.add(value); return true }) }
