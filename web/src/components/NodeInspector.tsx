import { CheckCircle2, CirclePlus, FileText, Link2, Pencil, Plus, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { AtlasNode, Evidence } from '../types'

interface InspectorProps {
  node: AtlasNode
  evidence: Evidence[]
  relatedCompanies: number
  onSave: (patch: Partial<AtlasNode>) => void
  onAddChild: () => void
  onAddEvidence: () => void
  onEditEvidence: (evidence: Evidence) => void
  readOnly?: boolean
}

export function NodeInspector({ node, evidence, relatedCompanies, onSave, onAddChild, onAddEvidence, onEditEvidence, readOnly = false }: InspectorProps) {
  const [summary, setSummary] = useState(node.summary)
  const [why, setWhy] = useState(node.why)
  useEffect(() => { setSummary(node.summary); setWhy(node.why) }, [node])
  return <aside className="inspector">
    <div className="inspector-head"><div><span>{node.category}</span><h2>{node.title}</h2></div>{!readOnly && <button onClick={onAddChild}><CirclePlus size={15} />新增下级</button>}</div>
    <div className="status-line"><i className={node.status} /><strong>{statusLabel(node.status)}</strong><span>{evidence.length} 条证据 · {relatedCompanies} 家公司</span></div>
    <label className="research-field"><span>一句话解释</span><textarea value={summary} readOnly={readOnly} onChange={event => setSummary(event.target.value)} /></label>
    <label className="research-field"><span>为什么重要</span><textarea value={why} readOnly={readOnly} onChange={event => setWhy(event.target.value)} /></label>
    {!readOnly && <button className="save-inspector" onClick={() => onSave({ summary, why, status: 'edited' })}><Save size={14} />保存研究卡片</button>}
    <section className="inspector-section"><header><strong>关键指标</strong><span>{node.metrics?.length || 0}</span></header>{node.metrics?.length ? <div className="tag-list">{node.metrics.map(metric => <span key={metric}>{metric}</span>)}</div> : <p className="muted">尚未设置关键指标</p>}</section>
    <section className="inspector-section"><header><strong>研究证据</strong><div className="section-actions"><span>{evidence.length}</span>{!readOnly && <button onClick={onAddEvidence}><Plus size={12} />新增</button>}</div></header>{evidence.slice(0, 6).map(item => <article className="evidence-card" key={item.id}><FileText size={15} /><div><strong>{item.title}</strong><small>{item.location || '位置待核对'}</small><p>{item.quote}</p></div>{!readOnly && <button className="edit-evidence" onClick={() => onEditEvidence(item)}><Pencil size={12} /></button>}{item.verified && <CheckCircle2 size={14} className="verified-icon" />}</article>)}{!evidence.length && <p className="muted">上传年报或添加资料后，引用会显示在这里。</p>}</section>
    <section className="inspector-section"><header><strong>产业关系</strong><span>{node.children.length}</span></header><div className="relation-summary"><Link2 size={14} />包含 {node.children.length} 个直接下级环节</div></section>
  </aside>
}

function statusLabel(status: AtlasNode['status']) {
  return ({ unresearched: '待研究', ai_draft: 'AI 初稿', edited: '人工整理', evidenced: '已有证据', verified: '已核验', stale: '需要更新' } as const)[status]
}
