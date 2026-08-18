const api = require('../../utils/api')
const { demoState, aiState } = require('../../utils/project')

Page({
  data: { session: null, workspaces: [], workspaceNames: [], workspaceIndex: 0, projects: [], currentId: '', busy: false, message: '' },
  onShow() { if (getApp().requireSession()) this.load() },
  async load() {
    this.setData({ busy: true, message: '' })
    try {
      const session = api.getSession(), workspaces = await api.listWorkspaces()
      const index = Math.max(0, workspaces.findIndex(item => item.id === session.workspace.id))
      const projects = await api.listProjects(session.workspace.id)
      this.setData({ session, workspaces, workspaceNames: workspaces.map(item => `${item.name} · ${roleName(item.role)}`), workspaceIndex: index, projects, currentId: (api.getCurrentProject().project || {}).id || '' })
    } catch (reason) { this.setData({ message: reason.message || '加载失败' }) }
    finally { this.setData({ busy: false }) }
  },
  async switchWorkspace(event) {
    const index = Number(event.detail.value), workspace = this.data.workspaces[index]
    api.selectWorkspace(workspace); getApp().globalData.session = api.getSession(); getApp().setProject(null)
    this.setData({ workspaceIndex: index, session: api.getSession(), projects: [], currentId: '' }); await this.load()
  },
  async openProject(event) {
    if (this.data.busy) return
    this.setData({ busy: true })
    try { const project = await api.getProject(event.currentTarget.dataset.id); getApp().setProject(project); wx.switchTab({ url: '/pages/graph/index' }) }
    catch (reason) { this.setData({ message: reason.message || '打开项目失败' }) }
    finally { this.setData({ busy: false }) }
  },
  createProject() {
    if (this.data.session.workspace.role === 'viewer') return
    wx.showModal({ title: '新建产业研究', editable: true, placeholderText: '例如：光伏产业链', success: async result => {
      const title = String(result.content || '').trim(); if (!result.confirm || !title) return
      this.setData({ busy: true })
      try { const project = await api.createProject(title, demoState(title)); getApp().setProject(project); wx.switchTab({ url: '/pages/graph/index' }) }
      catch (reason) { this.setData({ message: reason.message || '创建项目失败' }) }
      finally { this.setData({ busy: false }) }
    } })
  },
  createWithAi() {
    if (this.data.session.workspace.role === 'viewer' || this.data.busy) return
    wx.showModal({ title: 'AI 新建产业研究', editable: true, placeholderText: '例如：光伏、储能或人形机器人', confirmText: '开始生成', success: async input => {
      const industry = String(input.content || '').trim()
      if (!input.confirm || !industry) return
      this.setData({ busy: true, message: `DeepSeek 正在拆解“${industry}”，不会自动写入项目……` })
      try {
        const proposal = await api.generateIndustry(industry)
        const branches = Array.isArray(proposal.branches) ? proposal.branches : []
        if (branches.length < 2) throw new Error('AI 没有返回完整的产业分支')
        const preview = branches.slice(0, 6).map((item, index) => `${index + 1}. ${item.title}`).join('\n')
        wx.showModal({
          title: proposal.title || `${industry}产业链`,
          content: `AI 建议先建立以下核心分支：\n${preview}\n\n确认后才会创建项目，进入后仍可逐项修改。`,
          confirmText: '确认创建', cancelText: '暂不采用', confirmColor: '#6558d5',
          success: async review => {
            if (!review.confirm) { this.setData({ message: '已放弃这次 AI 建议，现有项目没有变化' }); return }
            try {
              const state = aiState(proposal, industry)
              const project = await api.createProject(state.projectTitle, state)
              getApp().setProject(project)
              wx.switchTab({ url: '/pages/graph/index' })
            } catch (reason) { this.setData({ message: reason.message || '创建 AI 产业研究失败' }) }
          }
        })
      } catch (reason) { this.setData({ message: reason.message || 'AI 生成失败，请检查 DeepSeek 配置' }) }
      finally { this.setData({ busy: false }) }
    } })
  },
  renameProject(event) {
    if (this.data.session.workspace.role === 'viewer' || this.data.busy) return
    const id = event.currentTarget.dataset.id, existing = this.data.projects.find(item => item.id === id)
    wx.showModal({ title: '修改项目名称', editable: true, placeholderText: existing.title, success: async result => {
      const title = String(result.content || '').trim(); if (!result.confirm || !title || title === existing.title) return
      this.setData({ busy: true, message: '正在更新项目名称……' })
      try {
        const project = await api.getProject(id), state = { ...project.state, projectTitle: title }, updated = await api.updateProject(project, state, false)
        if ((api.getCurrentProject().project || {}).id === id) getApp().setProject(updated)
        this.setData({ message: '项目名称已更新' }); await this.load()
      } catch (reason) { this.setData({ message: reason.message || '项目改名失败' }) }
      finally { this.setData({ busy: false }) }
    } })
  },
  removeProject(event) {
    if (this.data.session.workspace.role === 'viewer') return
    const project = this.data.projects.find(item => item.id === event.currentTarget.dataset.id)
    wx.showModal({ title: '删除云端项目', content: `确定删除“${project.title}”吗？`, confirmColor: '#b64f48', success: async result => { if (!result.confirm) return; try { await api.deleteProject(project.id); getApp().setProject(null); await this.load() } catch (reason) { this.setData({ message: reason.message || '删除失败' }) } } })
  }
})

function roleName(role) { return ({ owner: '所有者', editor: '编辑者', viewer: '查看者' })[role] || '成员' }
