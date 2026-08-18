const api = require('../../utils/api')

Page({
  data: { id: '', rootId: '', node: null, title: '', category: '', summary: '', why: '', metricsText: '', bottlenecksText: '', evidence: [], evidenceTitle: '', evidenceLocation: '', evidenceQuote: '', companies: 0, readOnly: false, saved: false, busy: false, message: '' },
  onLoad(options) { this.setData({ id: decodeURIComponent(options.id || '') }) },
  onShow() {
    if (!getApp().requireSession()) return
    const cached = api.getCurrentProject(), state = cached.state, node = state && state.nodes[this.data.id]
    if (!node) { wx.showToast({ title: '节点不存在', icon: 'none' }); wx.navigateBack(); return }
    const companies = (state.companyData || []).filter(company => (company.mappings || []).some(mapping => mapping.nodeId === node.id && mapping.status !== 'rejected')).length
    this.setData({ rootId: state.rootId, node, title: node.title || '', category: node.category || '', summary: node.summary || '', why: node.why || '', metricsText: (node.metrics || []).join('、'), bottlenecksText: (node.bottlenecks || []).join('、'), evidence: state.evidenceData[node.id] || [], companies, readOnly: api.getSession().workspace.role === 'viewer', saved: false, message: '' })
    wx.setNavigationBarTitle({ title: node.title })
  },
  field(event) { this.setData({ [event.currentTarget.dataset.field]: event.detail.value, saved: false }) },
  async save() {
    if (this.data.readOnly || this.data.busy) return
    const cached = api.getCurrentProject(), state = JSON.parse(JSON.stringify(cached.state))
    state.nodes[this.data.id] = { ...state.nodes[this.data.id], title: this.data.title.trim() || state.nodes[this.data.id].title, category: this.data.category.trim() || '待分类', summary: this.data.summary.trim(), why: this.data.why.trim(), metrics: splitTags(this.data.metricsText), bottlenecks: splitTags(this.data.bottlenecksText), status: 'edited' }
    this.setData({ busy: true, message: '正在保存云端版本……' })
    try {
      const updated = await api.updateProject(cached.project, state, false)
      getApp().setProject(updated); this.setData({ node: updated.state.nodes[this.data.id], saved: true, message: `已保存云端版本 v${updated.version}` })
      wx.setNavigationBarTitle({ title: updated.state.nodes[this.data.id].title })
    } catch (reason) { this.setData({ message: reason.statusCode === 409 ? '云端已有新版本，请返回产业地图同步后再编辑' : (reason.message || '保存失败') }) }
    finally { this.setData({ busy: false }) }
  },
  addChild() {
    if (this.data.readOnly) return
    wx.showModal({ title: `拆解“${this.data.node.title}”`, editable: true, placeholderText: '新增下级产业环节', success: async result => {
      const title = String(result.content || '').trim(); if (!result.confirm || !title) return
      const cached = api.getCurrentProject(), state = JSON.parse(JSON.stringify(cached.state)), parent = state.nodes[this.data.id], id = `node-${Date.now()}`
      const position = parent.position || { x: 0, y: 0 }
      state.nodes[id] = { id, title, category: `${parent.title} · 待分类`, summary: '', why: '', status: 'unresearched', children: [], position: { x: position.x + 280, y: position.y + parent.children.length * 90 }, metrics: [], bottlenecks: [] }
      parent.children.push(id); state.edges = state.edges || []; state.edges.push({ source: parent.id, target: id, type: 'structure' })
      this.setData({ busy: true, message: '正在新增下级并同步云端……' })
      try { const updated = await api.updateProject(cached.project, state, false); getApp().setProject(updated); this.setData({ node: updated.state.nodes[this.data.id], message: `下级节点已加入云端版本 v${updated.version}` }); wx.showToast({ title: '已新增下级', icon: 'success' }) }
      catch (reason) { this.setData({ message: reason.message || '新增下级失败' }) }
      finally { this.setData({ busy: false }) }
    } })
  },
  async addEvidence() {
    const title = this.data.evidenceTitle.trim(), quote = this.data.evidenceQuote.trim()
    if (this.data.readOnly || this.data.busy || !title || !quote) return
    const cached = api.getCurrentProject(), state = JSON.parse(JSON.stringify(cached.state)), list = state.evidenceData[this.data.id] || []
    list.push({ id: `evidence-${Date.now()}`, type: 'MANUAL', title, location: this.data.evidenceLocation.trim() || '位置待核对', quote, verified: false, createdAt: new Date().toISOString() })
    state.evidenceData[this.data.id] = list; state.nodes[this.data.id].status = 'evidenced'
    await this.persistState(cached.project, state, '手工证据已加入并保存云端')
    this.setData({ evidenceTitle: '', evidenceLocation: '', evidenceQuote: '' })
  },
  async toggleEvidence(event) {
    if (this.data.readOnly || this.data.busy) return
    const cached = api.getCurrentProject(), state = JSON.parse(JSON.stringify(cached.state)), evidence = (state.evidenceData[this.data.id] || []).find(item => item.id === event.currentTarget.dataset.id)
    if (!evidence) return
    evidence.verified = !evidence.verified; evidence.verifiedAt = evidence.verified ? new Date().toISOString() : null
    await this.persistState(cached.project, state, evidence.verified ? '证据已标记为人工核验' : '已取消证据核验')
  },
  removeNode() {
    if (this.data.readOnly || this.data.id === (api.getCurrentProject().state || {}).rootId) return
    const cached = api.getCurrentProject(), ids = collectSubtree(cached.state, this.data.id)
    wx.showModal({ title: '删除产业节点', content: `将删除“${this.data.node.title}”及其 ${ids.length - 1} 个下级节点，同时移除相关关系、任务、证据和公司映射。此操作会保存为新版本。`, confirmColor: '#b64f48', success: async result => {
      if (!result.confirm) return
      const state = JSON.parse(JSON.stringify(cached.state)), removed = new Set(ids)
      Object.keys(state.nodes).forEach(id => { if (removed.has(id)) delete state.nodes[id]; else state.nodes[id].children = (state.nodes[id].children || []).filter(child => !removed.has(child)) })
      state.edges = (state.edges || []).filter(edge => !removed.has(edge.source) && !removed.has(edge.target)); ids.forEach(id => delete state.evidenceData[id]); state.researchTasks = (state.researchTasks || []).filter(task => !removed.has(task.nodeId)); (state.companyData || []).forEach(company => { company.mappings = (company.mappings || []).filter(mapping => !removed.has(mapping.nodeId)) })
      const ok = await this.persistState(cached.project, state, `已删除 ${ids.length} 个产业节点`)
      if (ok) wx.navigateBack()
    } })
  },
  async persistState(project, state, successMessage) {
    this.setData({ busy: true, message: '正在保存云端版本……' })
    try {
      const updated = await api.updateProject(project, state, false); getApp().setProject(updated)
      const node = updated.state.nodes[this.data.id]
      this.setData({ node: node || this.data.node, evidence: node ? (updated.state.evidenceData[this.data.id] || []) : [], message: `${successMessage} · v${updated.version}` })
      return true
    } catch (reason) { this.setData({ message: reason.statusCode === 409 ? '云端已有新版本，请重新打开项目后操作' : (reason.message || '保存失败') }); return false }
    finally { this.setData({ busy: false }) }
  }
})

function splitTags(value) { return String(value || '').split(/[、，,\n]/).map(item => item.trim()).filter(Boolean).slice(0, 20) }
function collectSubtree(state, startId) { const ids = []; function walk(id) { if (!state.nodes[id] || ids.includes(id)) return; ids.push(id); (state.nodes[id].children || []).forEach(walk) } walk(startId); return ids }
