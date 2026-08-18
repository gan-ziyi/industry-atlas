const api = require('../../utils/api')

Page({
  data: { project: null, state: null, tasks: [], filter: 'all', readOnly: false, busy: false, message: '', taskTitle: '', nodeIds: [], nodeNames: [], nodeIndex: 0, priorities: ['高优先级', '中优先级', '低优先级'], priorityValues: ['high', 'medium', 'low'], priorityIndex: 1 },
  onShow() {
    if (!getApp().requireSession()) return
    const cached = api.getCurrentProject()
    if (!cached.state) { wx.switchTab({ url: '/pages/projects/index' }); return }
    const nodes = Object.values(cached.state.nodes || {})
    this.setData({ project: cached.project, state: cached.state, readOnly: api.getSession().workspace.role === 'viewer', nodeIds: nodes.map(node => node.id), nodeNames: nodes.map(node => node.title), message: '' }, () => this.applyFilter())
  },
  setFilter(event) { this.setData({ filter: event.currentTarget.dataset.filter }, () => this.applyFilter()) },
  applyFilter() {
    const tasks = (this.data.state.researchTasks || []).filter(task => this.data.filter === 'all' || task.status === this.data.filter).map(task => ({ ...task, nodeTitle: (this.data.state.nodes[task.nodeId] || {}).title || '未关联节点', statusLabel: ({ todo: '待处理', doing: '进行中', done: '已完成' })[task.status], priorityLabel: ({ high: '高', medium: '中', low: '低' })[task.priority] }))
    this.setData({ tasks })
  },
  field(event) { this.setData({ taskTitle: event.detail.value }) },
  pickNode(event) { this.setData({ nodeIndex: Number(event.detail.value) }) },
  pickPriority(event) { this.setData({ priorityIndex: Number(event.detail.value) }) },
  async createTask() {
    const title = this.data.taskTitle.trim()
    if (this.data.readOnly || this.data.busy || !title || !this.data.nodeIds.length) return
    const cached = api.getCurrentProject(), state = JSON.parse(JSON.stringify(cached.state))
    state.researchTasks = state.researchTasks || []
    state.researchTasks.unshift({ id: `task-${Date.now()}`, title, nodeId: this.data.nodeIds[this.data.nodeIndex], status: 'todo', priority: this.data.priorityValues[this.data.priorityIndex], note: '', createdAt: new Date().toISOString() })
    await this.persist(cached.project, state, '任务已创建并同步云端')
    this.setData({ taskTitle: '' })
  },
  async advance(event) {
    if (this.data.readOnly || this.data.busy) return
    const id = event.currentTarget.dataset.id, cached = api.getCurrentProject(), state = JSON.parse(JSON.stringify(cached.state))
    state.researchTasks = state.researchTasks.map(task => task.id === id ? { ...task, status: task.status === 'todo' ? 'doing' : task.status === 'doing' ? 'done' : 'todo' } : task)
    await this.persist(cached.project, state, '任务状态已更新')
  },
  async persist(project, state, successMessage) {
    this.setData({ busy: true, message: '正在同步云端……' })
    try { const updated = await api.updateProject(project, state, false); getApp().setProject(updated); this.setData({ project: updated, state: updated.state, message: successMessage }, () => this.applyFilter()) }
    catch (reason) { this.setData({ message: reason.statusCode === 409 ? '云端已有新版本，请重新打开项目后操作' : (reason.message || '任务保存失败') }) }
    finally { this.setData({ busy: false }) }
  },
  openNode(event) { wx.navigateTo({ url: `/pages/node/index?id=${encodeURIComponent(event.currentTarget.dataset.id)}` }) }
})
