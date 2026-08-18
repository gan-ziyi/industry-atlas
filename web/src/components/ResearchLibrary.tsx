import { BrainCircuit, FileSearch, FileText, RefreshCw, ScanText, Table2, Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getDocumentTables, listDocuments, startOcr, waitForDocument } from '../api/client'
import type { DocumentTable, DocumentTask } from '../types'
import { TableViewer } from './TableViewer'

interface ResearchLibraryProps {
  connected: boolean
  targetNodeTitle: string
  onUpload: (file: File) => Promise<void>
  onExtract: (document: DocumentTask) => Promise<void>
  onAttachTable: (document: DocumentTask, table: DocumentTable) => void
}

export function ResearchLibrary({ connected, targetNodeTitle, onUpload, onExtract, onAttachTable }: ResearchLibraryProps) {
  const [documents, setDocuments] = useState<DocumentTask[]>([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const [tableViewer, setTableViewer] = useState<{ document: DocumentTask; tables: DocumentTable[] } | null>(null)
  const load = async () => { setLoading(true); setError(''); try { setDocuments(await listDocuments()) } catch (reason) { setError(reason instanceof Error ? reason.message : '读取失败') } finally { setLoading(false) } }
  useEffect(() => { if (connected) void load() }, [connected])
  const handleFile = async (file?: File) => { if (!file) return; setBusy('upload'); setError(''); try { await onUpload(file); await load() } catch (reason) { setError(reason instanceof Error ? reason.message : '上传失败') } finally { setBusy('') } }
  const handleExtract = async (document: DocumentTask) => { setBusy(document.id); setError(''); try { await onExtract(document); await load() } catch (reason) { setError(reason instanceof Error ? reason.message : 'AI 提取失败') } finally { setBusy('') } }
  const handleOcr = async (document: DocumentTask) => { setBusy(document.id); setError(''); try { await startOcr(document.id); await waitForDocument(document.id); await load() } catch (reason) { setError(reason instanceof Error ? reason.message : 'OCR 失败') } finally { setBusy('') } }
  const handleTables = async (document: DocumentTask) => { setBusy(document.id); setError(''); try { const tables = await getDocumentTables(document.id); if (!tables.length) throw new Error('这份文件没有识别到结构化表格'); setTableViewer({ document, tables }) } catch (reason) { setError(reason instanceof Error ? reason.message : '读取表格失败') } finally { setBusy('') } }
  return <section className="workspace-page">
    <div className="page-heading"><div><span>RESEARCH LIBRARY</span><h2>资料与年报任务</h2><p>当前写入节点：<b>{targetNodeTitle}</b>。文件解析、OCR、表格与 AI 提取均保留原页码。</p></div><div className="page-actions"><button className="secondary-action" onClick={load} disabled={!connected || loading}><RefreshCw className={loading ? 'spin' : ''} size={15} />刷新任务</button><button className="page-action" onClick={() => fileInput.current?.click()} disabled={!connected || Boolean(busy)}><Upload size={15} />{busy === 'upload' ? '上传解析中' : '上传 PDF'}</button><input ref={fileInput} type="file" accept="application/pdf,.pdf" hidden onChange={event => { void handleFile(event.target.files?.[0]); event.target.value = '' }} /></div></div>
    {error && <div className="inline-error">{error}</div>}
    {!connected ? <div className="page-empty hero"><FileSearch size={28} /><strong>尚未连接研究空间</strong><p>点击左下角“系统设置”即可在正式版完成后端连接与开发登录。</p></div> : <div className="document-grid">{documents.map(document => <article key={document.id}><div className="document-icon"><FileText size={20} /></div><div><span className={`document-state ${document.status}`}>{statusText(document.status)}</span><h3>{document.filename}</h3><p>{document.page_count} 页 · {document.char_count.toLocaleString()} 字符</p><small><Table2 size={12} /> {document.table_count} 个表格 · {document.extraction_count} 次 AI 提取</small><div className="document-actions">{Boolean(document.needs_ocr) && <button onClick={() => void handleOcr(document)} disabled={Boolean(busy)}><ScanText size={12} />运行 OCR</button>}{document.table_count > 0 && <button onClick={() => void handleTables(document)} disabled={Boolean(busy)}><Table2 size={12} />查看表格</button>}{document.status === 'ready' && <button className="document-ai" onClick={() => void handleExtract(document)} disabled={Boolean(busy)}><BrainCircuit className={busy === document.id ? 'spin' : ''} size={13} />{busy === document.id ? '处理中' : 'DeepSeek 提取'}</button>}</div></div></article>)}{!documents.length && !loading && <div className="page-empty hero"><FileSearch size={28} /><strong>当前项目还没有文件</strong><p>上传 PDF 后会自动解析文本、页码和表格，再进入 AI 结构化审核。</p></div>}</div>}
    {tableViewer && <TableViewer document={tableViewer.document} tables={tableViewer.tables} onClose={() => setTableViewer(null)} onAttach={table => { onAttachTable(tableViewer.document, table); setTableViewer(null) }} />}
  </section>
}

function statusText(status: string) { return ({ ready: '解析完成', processing: '解析中', failed: '失败', ocr_processing: 'OCR 中', ocr_failed: 'OCR 失败' } as Record<string, string>)[status] || status }
