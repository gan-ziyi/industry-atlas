import { Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { Evidence } from '../types'

export function EvidenceEditor({ evidence, onClose, onSave, onDelete }: { evidence?: Evidence; onClose: () => void; onSave: (evidence: Evidence) => void; onDelete?: () => void }) {
  const [type, setType] = useState(evidence?.type || 'PDF')
  const [title, setTitle] = useState(evidence?.title || '')
  const [location, setLocation] = useState(evidence?.location || '')
  const [quote, setQuote] = useState(evidence?.quote || '')
  const [verified, setVerified] = useState(Boolean(evidence?.verified))
  const submit = (event: React.FormEvent) => { event.preventDefault(); onSave({ id: evidence?.id || `evidence-${Date.now()}`, type, title: title.trim(), location: location.trim(), quote: quote.trim(), verified }) }
  return <div className="formal-modal"><form className="evidence-editor" onSubmit={submit}><header><div><span>EVIDENCE CITATION</span><h2>{evidence ? '编辑节点证据' : '新增节点证据'}</h2></div><button type="button" onClick={onClose}><X size={17} /></button></header><div className="evidence-form"><label><span>资料类型</span><select value={type} onChange={event => setType(event.target.value)}><option>PDF</option><option>ANNUAL</option><option>NEWS</option><option>WEB</option></select></label><label><span>资料标题</span><input required value={title} onChange={event => setTitle(event.target.value)} placeholder="年报、研报或网页标题" /></label><label><span>原文位置</span><input value={location} onChange={event => setLocation(event.target.value)} placeholder="例如：第 28 页 · 经营情况讨论" /></label><label className="full"><span>原文摘录</span><textarea rows={6} value={quote} onChange={event => setQuote(event.target.value)} placeholder="与研究结论直接对应的原文" /></label><label className="verify-evidence"><input type="checkbox" checked={verified} onChange={event => setVerified(event.target.checked)} /><span><strong>已人工核验</strong><small>只有阅读原始资料并确认无误后才勾选</small></span></label></div><footer>{onDelete ? <button className="danger" type="button" onClick={onDelete}><Trash2 size={13} />删除证据</button> : <span>证据会随项目同步并进入精准报告。</span>}<div><button type="button" onClick={onClose}>取消</button><button className="primary" type="submit">保存证据</button></div></footer></form></div>
}
