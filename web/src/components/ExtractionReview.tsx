import { AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DocumentTask, ExtractionTask, Finding } from '../types'

interface ExtractionReviewProps {
  task: ExtractionTask
  document: DocumentTask
  onClose: () => void
  onAccept: (findings: Finding[]) => void
}

export function ExtractionReview({ task, document, onClose, onAccept }: ExtractionReviewProps) {
  const findings = task.result?.findings || []
  const [selected, setSelected] = useState(() => new Set(findings.filter(item => item.citation_status === 'matched').map(item => item.id)))
  const [category, setCategory] = useState('all')
  const visible = useMemo(() => findings.filter(item => category === 'all' || item.category === category), [findings, category])
  const toggle = (id: string) => setSelected(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next })
  return <div className="formal-modal"><section className="extraction-review"><header><div><span>ANNUAL REPORT REVIEW</span><h2>{task.result?.company || document.filename}</h2><p>{task.result?.report_period || '报告期未识别'} · 原文匹配 {task.result?.validation.matched || 0}/{task.result?.validation.total || 0}</p></div><button onClick={onClose}><X size={17} /></button></header><div className="extraction-review-toolbar"><p>{task.result?.summary}</p><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">全部发现</option><option value="business">主营业务</option><option value="product">产品服务</option><option value="financial">经营数据</option><option value="capacity">产能项目</option><option value="customer">客户市场</option><option value="industry">产业位置</option><option value="risk">主要风险</option></select></div><div className="formal-finding-list">{visible.map(finding => <label className={finding.citation_status === 'matched' ? 'matched' : 'unmatched'} key={finding.id}><input type="checkbox" checked={selected.has(finding.id)} onChange={() => toggle(finding.id)} /><span className="finding-kind">{finding.category_label || finding.category}</span><div><strong>{finding.title}</strong><p>{finding.value}</p><small>{finding.quote || '没有原文摘录'}</small></div><span className="citation-check">{finding.citation_status === 'matched' ? <><CheckCircle2 size={14} />第 {finding.matched_pages?.join('、')} 页</> : <><AlertTriangle size={14} />原文未匹配</>}</span></label>)}</div><footer><span>已选择 {selected.size} 条；未匹配内容必须人工判断</span><div><button onClick={onClose}>暂不写入</button><button className="primary" disabled={!selected.size} onClick={() => onAccept(findings.filter(item => selected.has(item.id)))}>写入节点与公司档案</button></div></footer></section></div>
}
