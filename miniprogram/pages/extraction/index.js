const api = require('../../utils/api')

Page({
  data: { id: '', documentId: '', filename: '', task: null, findings: [], nodeIds: [], nodeNames: [], nodeIndex: 0, loading: true, message: 'DeepSeek 正在分析年报，请保持页面打开。' },
  onLoad(options) {
    const cached = api.getCurrentProject(), nodes = Object.values(cached.state.nodes || {})
    this.setData({ id: decodeURIComponent(options.id || ''), documentId: decodeURIComponent(options.documentId || ''), filename: decodeURIComponent(options.filename || ''), nodeIds: nodes.map(node => node.id), nodeNames: nodes.map(node => node.title) })
    this.poll()
  },
  onUnload() { this.stopped = true },
  async poll() {
    for (let attempt = 0; attempt < 120 && !this.stopped; attempt += 1) {
      try {
        const task = await api.getExtraction(this.data.id)
        if (task.status === 'ready') { const findings = (task.result.findings || []).map((item, index) => ({ ...item, matched_pages: item.matched_pages || [], id: item.id || `finding-${index}`, selected: item.citation_status === 'matched', citationLabel: item.citation_status === 'matched' ? '原文已匹配' : '原文未匹配', pageLabel: item.matched_pages && item.matched_pages.length ? `第 ${item.matched_pages.join('、')} 页` : '页码未匹配' })); this.setData({ task, findings, loading: false, message: '' }); return }
        if (task.status === 'failed') { this.setData({ task, loading: false, message: task.error || 'AI 提取失败' }); return }
      } catch (reason) { this.setData({ loading: false, message: reason.message || '读取提取结果失败' }); return }
      await new Promise(resolve => setTimeout(resolve, 1200))
    }
    if (!this.stopped) this.setData({ loading: false, message: '任务仍在后台运行，请稍后返回资料页重试。' })
  },
  chooseNode(event) { this.setData({ nodeIndex: Number(event.detail.value) }) },
  toggle(event) { const id = event.currentTarget.dataset.id; this.setData({ findings: this.data.findings.map(item => item.id === id ? { ...item, selected: !item.selected } : item) }) },
  selectMatched() { this.setData({ findings: this.data.findings.map(item => ({ ...item, selected: item.citation_status === 'matched' })) }) },
  async accept() {
    const selected = this.data.findings.filter(item => item.selected)
    if (!selected.length) { wx.showToast({ title: '请至少选择一条发现', icon: 'none' }); return }
    const cached = api.getCurrentProject(), state = JSON.parse(JSON.stringify(cached.state)), nodeId = this.data.nodeIds[this.data.nodeIndex], node = state.nodes[nodeId], result = this.data.task.result
    const evidence = [...(state.evidenceData[nodeId] || [])]
    selected.forEach(item => evidence.push({ id: `finding-${this.data.id}-${item.id}`, type: 'ANNUAL', title: `${this.data.filename} · ${item.title}`, location: item.matched_pages && item.matched_pages.length ? `第 ${item.matched_pages.join('、')} 页` : '页码待核对', quote: item.quote || item.value, verified: false }))
    state.evidenceData[nodeId] = evidence; state.nodes[nodeId] = { ...node, status: 'evidenced' }
    if (result.company) mergeCompany(state, result, selected, nodeId, node.title, this.data.documentId, this.data.filename)
    this.setData({ loading: true, message: '正在写入证据并保存云端版本……' })
    try {
      const updated = await api.updateProject(cached.project, state, false)
      getApp().setProject(updated)
      wx.showModal({ title: '已写入研究项目', content: `已将 ${selected.length} 条发现写入“${node.title}”，并保存为云端版本 v${updated.version}。`, showCancel: false, success: () => wx.redirectTo({ url: `/pages/node/index?id=${encodeURIComponent(nodeId)}` }) })
    } catch (reason) { this.setData({ loading: false, message: reason.statusCode === 409 ? '云端项目已有更新，请重新打开项目后再次接纳' : (reason.message || '写入研究项目失败') }) }
  }
})

function mergeCompany(state, result, findings, nodeId, nodeTitle, documentId, filename) {
  let company = state.companyData.find(item => String(item.name).trim().toLowerCase() === String(result.company).trim().toLowerCase())
  if (!company) { company = { id: `company-${Date.now()}`, name: result.company, reportPeriod: result.report_period, summary: result.summary, findings: [], mappings: [], periods: [], documents: [] }; state.companyData.push(company) }
  company.summary = result.summary || company.summary; company.reportPeriod = result.report_period || company.reportPeriod
  const keys = new Set(company.findings.map(item => `${item.reportPeriod}:${item.category}:${item.title}:${item.value}`)); findings.forEach(item => { const next = { ...item, reportPeriod: result.report_period }; const key = `${next.reportPeriod}:${next.category}:${next.title}:${next.value}`; if (!keys.has(key)) { company.findings.push(next); keys.add(key) } })
  if (!company.documents.some(item => item.documentId === documentId)) company.documents.push({ documentId, filename })
  if (!company.mappings.some(item => item.nodeId === nodeId)) company.mappings.push({ id: `mapping-${Date.now()}`, nodeId, nodeTitle, status: 'suggested', score: 72, reason: '由小程序年报提取结果生成，等待人工确认' })
  if (!company.periods.some(item => item.period === result.report_period)) company.periods.push({ period: result.report_period || '报告期未识别', summary: result.summary, findingIds: findings.map(item => item.id), documents: [{ documentId, filename }] })
}
