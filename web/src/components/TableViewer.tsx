import { Download, Link2, X } from 'lucide-react'
import { useState } from 'react'
import type { DocumentTable, DocumentTask } from '../types'

export function TableViewer({ document, tables, onClose, onAttach }: { document: DocumentTask; tables: DocumentTable[]; onClose: () => void; onAttach: (table: DocumentTable) => void }) {
  const [index, setIndex] = useState(0)
  const table = tables[index]
  const download = () => { const csv = '\ufeff' + table.data.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\r\n'), url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })), link = window.document.createElement('a'); link.href = url; link.download = `${document.filename}-第${table.page_number}页-表格${table.table_number}.csv`; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 500) }
  return <div className="formal-modal"><section className="table-viewer"><header><div><span>ANNUAL REPORT TABLES</span><h2>{document.filename}</h2></div><button onClick={onClose}><X size={17} /></button></header><div className="table-viewer-toolbar"><span>识别到 {tables.length} 个表格</span><select value={index} onChange={event => setIndex(Number(event.target.value))}>{tables.map((item, itemIndex) => <option value={itemIndex} key={item.id}>第 {item.page_number} 页 · 表格 {item.table_number} · {item.row_count}×{item.column_count}</option>)}</select></div><div className="table-scroll"><table><tbody>{table.data.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, columnIndex) => rowIndex === 0 ? <th key={columnIndex}>{cell}</th> : <td key={columnIndex}>{cell}</td>)}</tr>)}</tbody></table></div><footer><span>复杂合并单元格与扫描表格仍需人工核对。</span><div><button onClick={download}><Download size={13} />下载 CSV</button><button className="primary" onClick={() => onAttach(table)}><Link2 size={13} />写入当前节点</button></div></footer></section></div>
}
