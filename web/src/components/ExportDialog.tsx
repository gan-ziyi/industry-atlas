import { FileDown, X } from 'lucide-react'
import { useState } from 'react'

export function ExportDialog({ onClose, onExport }: { onClose: () => void; onExport: (format: 'docx' | 'xlsx' | 'pdf') => Promise<void> }) {
  const [format, setFormat] = useState<'docx' | 'xlsx' | 'pdf'>('docx')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const run = async () => { setBusy(true); setError(''); try { await onExport(format); onClose() } catch (reason) { setError(reason instanceof Error ? reason.message : '导出失败') } finally { setBusy(false) } }
  return <div className="formal-modal"><section className="export-dialog"><header><div><span>PRECISE EXPORT</span><h2>生成正式研究报告</h2></div><button onClick={onClose}><X size={17} /></button></header><div className="export-options"><button className={format === 'docx' ? 'active' : ''} onClick={() => setFormat('docx')}><b>Word</b><span>层级报告、公司映射与证据原文</span></button><button className={format === 'xlsx' ? 'active' : ''} onClick={() => setFormat('xlsx')}><b>Excel</b><span>节点、公司、指标、证据与年报表格</span></button><button className={format === 'pdf' ? 'active' : ''} onClick={() => setFormat('pdf')}><b>PDF</b><span>适合分享和归档的固定版式</span></button></div>{error && <div className="inline-error">{error}</div>}<footer><span>导出前会先同步当前项目，确保报告使用最新数据。</span><button onClick={() => void run()} disabled={busy}><FileDown size={14} />{busy ? '生成中…' : `导出 ${format.toUpperCase()}`}</button></footer></section></div>
}
