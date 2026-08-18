import { Building2, Check, GitCompareArrows, Search, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Company, ProjectState } from '../types'

interface CompanyLibraryProps {
  state: ProjectState
  onMappingStatus: (companyId: string, mappingId: string, status: 'confirmed' | 'rejected') => void
}

export function CompanyLibrary({ state, onMappingStatus }: CompanyLibraryProps) {
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState(state.companyData[0]?.id || '')
  const [compare, setCompare] = useState<string[]>([])
  const companies = useMemo(() => state.companyData.filter(company => `${company.name} ${company.summary || ''} ${company.reportPeriod || ''}`.toLowerCase().includes(query.toLowerCase())), [state.companyData, query])
  const active = state.companyData.find(company => company.id === activeId) || companies[0]
  const comparison = compare.map(id => state.companyData.find(company => company.id === id)).filter(Boolean) as Company[]
  const toggleCompare = (id: string) => setCompare(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 4 ? [...current, id] : current)
  return <section className="workspace-page company-page">
    <div className="page-heading"><div><span>COMPANY INTELLIGENCE</span><h2>公司研究与产业映射</h2><p>公司是产业研究的验证层：先看它覆盖哪些产业环节，再回到年报原文核对。</p></div><button className="page-action" disabled={compare.length < 2}><GitCompareArrows size={15} />对比已选公司 <b>{compare.length}</b></button></div>
    {comparison.length >= 2 && <div className="formal-company-comparison"><strong>横向对比</strong><div>{comparison.map(company => <article key={company.id}><h3>{company.name}</h3><span>{company.reportPeriod || '报告期未识别'}</span><p>{company.summary || '暂无摘要'}</p><small>{company.mappings.filter(item => item.status === 'confirmed').length} 个确认节点 · {company.findings.length} 条发现</small></article>)}</div></div>}
    <div className="company-layout">
      <aside className="company-index"><label><Search size={14} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索公司" /></label><div>{companies.map(company => <div className={`formal-company-row ${active?.id === company.id ? 'active' : ''}`} key={company.id}><button onClick={() => setActiveId(company.id)}><Building2 size={15} /><span><strong>{company.name}</strong><small>{company.reportPeriod || '报告期未识别'} · {company.findings.length} 条发现</small></span></button><button className={compare.includes(company.id) ? 'selected' : ''} onClick={() => toggleCompare(company.id)}><GitCompareArrows size={13} /></button></div>)}</div><footer>共 {state.companyData.length} 家公司</footer></aside>
      <div className="company-profile">{active ? <>
        <header><div><span>COMPANY PROFILE</span><h2>{active.name}</h2><p>{active.summary || '暂无公司摘要'}</p></div><b>{active.reportPeriod || '报告期未识别'}</b></header>
        <section><h3>产业节点映射</h3>{active.mappings.length ? active.mappings.map(mapping => <article className={`formal-mapping ${mapping.status}`} key={mapping.id}><div><strong>{state.nodes[mapping.nodeId]?.title || mapping.nodeTitle || '节点待匹配'}</strong><small>{mapping.reason}</small></div><b>{mapping.score}</b><span>{mapping.status === 'confirmed' ? <><ShieldCheck size={13} />已确认</> : mapping.status === 'rejected' ? '已排除' : <><button onClick={() => onMappingStatus(active.id, mapping.id, 'confirmed')}><Check size={13} />确认</button><button onClick={() => onMappingStatus(active.id, mapping.id, 'rejected')}>排除</button></>}</span></article>) : <div className="page-empty">尚无产业映射</div>}</section>
        <section><h3>多期经营发现</h3><div className="formal-findings">{active.findings.map(finding => <article key={`${finding.id}-${finding.reportPeriod || ''}`}><span>{finding.reportPeriod || active.reportPeriod || '未标注期间'}</span><div><strong>{finding.title}</strong><p>{finding.value}</p><small>{finding.quote || '暂无原文摘录'}</small></div></article>)}{!active.findings.length && <div className="page-empty">上传并分析年报后，这里会形成跨期指标。</div>}</div></section>
      </> : <div className="page-empty large">尚无公司档案。可以先在原型中接纳年报发现，或同步工作空间公司主档。</div>}</div>
    </div>
  </section>
}
