const api = require('../../utils/api')
const { flattenNodes } = require('../../utils/project')

Page({
  data: { project: null, state: null, rows: [], expanded: {}, query: '', stats: { nodes: 0, evidence: 0, companies: 0 }, readOnly: false, syncing: false, message: '' },
  onShow() {
    if (!getApp().requireSession()) return
    const cached = api.getCurrentProject(), session = api.getSession()
    if (!cached.project || !cached.state) { wx.showToast({ title: '请先打开项目', icon: 'none' }); wx.switchTab({ url: '/pages/projects/index' }); return }
    this.setData({ project: cached.project, state: cached.state, readOnly: session.workspace.role === 'viewer' }, () => this.refreshRows())
  },
  refreshRows() {
    const state = this.data.state
    this.setData({ rows: flattenNodes(state, this.data.expanded, this.data.query), stats: { nodes: Object.keys(state.nodes || {}).length, evidence: Object.values(state.evidenceData || {}).reduce((sum, items) => sum + items.length, 0), companies: (state.companyData || []).length } })
  },
  search(event) { this.setData({ query: event.detail.value }, () => this.refreshRows()) },
  toggle(event) { const id = event.currentTarget.dataset.id, expanded = { ...this.data.expanded, [id]: this.data.expanded[id] === false }; this.setData({ expanded }, () => this.refreshRows()) },
  openNode(event) { wx.navigateTo({ url: `/pages/node/index?id=${encodeURIComponent(event.currentTarget.dataset.id)}` }) },
  openAiReview() {
    if (this.data.readOnly) return
    wx.navigateTo({ url: '/pages/ai-review/index' })
  },
  openCompanies() { wx.navigateTo({ url: '/pages/companies/index' }) },
  async sync() {
    if (this.data.readOnly || this.data.syncing) return
    this.setData({ syncing: true, message: '' })
    try { const updated = await api.updateProject(this.data.project, this.data.state, false); getApp().setProject(updated); this.setData({ project: updated, state: updated.state, message: `已同步云端版本 v${updated.version}` }) }
    catch (reason) {
      if (reason.statusCode === 409) this.resolveConflict()
      else this.setData({ message: reason.message || '同步失败' })
    } finally { this.setData({ syncing: false }) }
  },
  resolveConflict() {
    wx.showModal({ title: '云端已有更新', content: '另一位成员修改了这个项目。选择“保留本地”会覆盖云端；选择“使用云端”会放弃当前本地修改。', confirmText: '保留本地', cancelText: '使用云端', confirmColor: '#6558d5', success: async result => {
      try {
        const project = result.confirm ? await api.updateProject(this.data.project, this.data.state, true) : await api.getProject(this.data.project.id)
        getApp().setProject(project); this.setData({ project, state: project.state, message: result.confirm ? '已用本地版本覆盖云端' : '已载入云端版本' }, () => this.refreshRows())
      } catch (reason) { this.setData({ message: reason.message || '处理冲突失败' }) }
    } })
  }
})
