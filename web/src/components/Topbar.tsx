import { Check, Cloud, FileDown, LoaderCircle, Search, Sparkles } from 'lucide-react'

interface TopbarProps {
  title: string
  syncState: 'idle' | 'syncing' | 'done' | 'error'
  onSync: () => void
  onSearch: (query: string) => void
  onExport: () => void
  onAI: () => void
  readOnly?: boolean
}

export function Topbar({ title, syncState, onSync, onSearch, onExport, onAI, readOnly = false }: TopbarProps) {
  return <header className="topbar">
    <div><span className="eyebrow">INDUSTRY RESEARCH</span><h1>{title}</h1></div>
    <label className="global-search"><Search size={15} /><input placeholder="搜索节点、公司或研究结论" onChange={event => onSearch(event.target.value)} /></label>
    <button className="ai-action" onClick={onAI} disabled={readOnly}><Sparkles size={15} />AI 研究</button>
    <button className="ai-action" onClick={onExport}><FileDown size={15} />导出</button>
    <button className={`sync-action ${syncState}`} onClick={onSync} disabled={readOnly || syncState === 'syncing'}>
      {syncState === 'syncing' ? <LoaderCircle className="spin" size={15} /> : syncState === 'done' ? <Check size={15} /> : <Cloud size={15} />}
      {readOnly ? '只读模式' : syncState === 'syncing' ? '同步中' : syncState === 'done' ? '已同步' : '同步项目'}
    </button>
  </header>
}
