const api = require('../../utils/api')

Page({
  data: { project: null, state: null, companies: [], query: '', name: '', period: '', nodeIds: [], nodeNames: [], nodeIndex: 0, readOnly: false, busy: false, message: '' },
  onShow() {
    if (!getApp().requireSession()) return
    const cached = api.getCurrentProject(), nodes = Object.values((cached.state || {}).nodes || {})
    if (!cached.state) { wx.navigateBack(); return }
    this.setData({ project: cached.project, state: cached.state, nodeIds: nodes.map(item => item.id), nodeNames: nodes.map(item => item.title), readOnly: api.getSession().workspace.role === 'viewer' }, () => this.refresh())
  },
  refresh() {
    const query = this.data.query.trim().toLowerCase(), state = this.data.state
    const companies = (state.companyData || []).filter(item => !query || `${item.name} ${item.reportPeriod} ${item.summary}`.toLowerCase().includes(query)).map(company => ({ ...company, findings: company.findings || [], mappings: (company.mappings || []).map(mapping => ({ ...mapping, nodeTitle: (state.nodes[mapping.nodeId] || {}).title || '已删除节点', statusLabel: ({ suggested: '待审核', confirmed: '已确认', rejected: '已排除' })[mapping.status] || mapping.status })) }))
    this.setData({ companies })
  },
  search(event) { this.setData({ query: event.detail.value }, () => this.refresh()) },
  field(event) { this.setData({ [event.currentTarget.dataset.field]: event.detail.value }) },
  pickNode(event) { this.setData({ nodeIndex: Number(event.detail.value) }) },
  async add() {
    const name = this.data.name.trim(); if (!name || this.data.readOnly || this.data.busy) return
    const state = JSON.parse(JSON.stringify(this.data.state)), nodeId = this.data.nodeIds[this.data.nodeIndex], node = state.nodes[nodeId]
    state.companyData = state.companyData || []
    state.companyData.push({ id: `company-${Date.now()}`, name, reportPeriod: this.data.period.trim(), summary: '', findings: [], periods: [], documents: [], manual: true, mappings: node ? [{ id: `mapping-${Date.now()}`, nodeId, nodeTitle: node.title, status: 'confirmed', score: 100, reason: '研究员在小程序中手动确认' }] : [] })
    await this.persist(state, '公司档案与产业映射已创建'); this.setData({ name: '', period: '' })
  },
  async setMapping(event) {
    if (this.data.readOnly || this.data.busy) return
    const state = JSON.parse(JSON.stringify(this.data.state)), company = state.companyData.find(item => item.id === event.currentTarget.dataset.company), mapping = company && company.mappings.find(item => item.id === event.currentTarget.dataset.mapping)
    if (!mapping) return
    mapping.status = event.currentTarget.dataset.status; mapping.reviewedAt = new Date().toISOString()
    await this.persist(state, mapping.status === 'confirmed' ? '公司映射已确认' : mapping.status === 'rejected' ? '公司映射已排除' : '公司映射已恢复待审核')
  },
  remove(event) {
    if (this.data.readOnly) return
    const company = this.data.state.companyData.find(item => item.id === event.currentTarget.dataset.id)
    wx.showModal({ title: '删除公司档案', content: `确定删除“${company.name}”吗？产业节点和原始资料不会删除。`, confirmColor: '#b64f48', success: async result => { if (!result.confirm) return; const state = JSON.parse(JSON.stringify(this.data.state)); state.companyData = state.companyData.filter(item => item.id !== company.id); await this.persist(state, '公司档案已删除') } })
  },
  async persist(state, message) {
    this.setData({ busy: true, message: '正在同步云端……' })
    try { const updated = await api.updateProject(this.data.project, state, false); getApp().setProject(updated); this.setData({ project: updated, state: updated.state, message }, () => this.refresh()) }
    catch (reason) { this.setData({ message: reason.statusCode === 409 ? '云端版本已变化，请重新打开项目后操作' : (reason.message || '保存失败') }) }
    finally { this.setData({ busy: false }) }
  }
})
