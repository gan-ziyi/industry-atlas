const api = require('../../utils/api')

Page({
  data: { instruction: '', project: null, state: null, patches: [], selected: [], loading: false, applying: false, message: '' },
  onLoad() {
    const current = api.getCurrentProject(), session = api.getSession()
    if (!current.project || !current.state || !session || session.workspace.role === 'viewer') {
      wx.showToast({ title: '当前项目不可编辑', icon: 'none' }); wx.navigateBack(); return
    }
    this.setData({ project: current.project, state: current.state })
  },
  input(event) { this.setData({ instruction: event.detail.value }) },
  async generate() {
    const instruction = this.data.instruction.trim()
    if (!instruction || this.data.loading) return
    this.setData({ loading: true, patches: [], selected: [], message: 'DeepSeek 正在分析，只会生成待审核建议……' })
    try {
      const raw = await api.requestMapPatches(instruction, this.data.state, this.data.project.id)
      const patches = raw.map((spec, index) => describePatch(spec, index, this.data.state)).filter(Boolean).map(item => ({ ...item, checked: true }))
      if (!patches.length) throw new Error('AI 建议均无法对应当前产业节点')
      this.setData({ patches, selected: patches.map(item => item.key), message: `已生成 ${patches.length} 项建议，请逐项审核后再应用` })
    } catch (reason) { this.setData({ message: reason.message || 'AI 修改建议生成失败' }) }
    finally { this.setData({ loading: false }) }
  },
  selection(event) {
    const selected = event.detail.value
    this.setData({ selected, patches: this.data.patches.map(item => ({ ...item, checked: selected.includes(item.key) })) })
  },
  async apply() {
    if (this.data.applying) return
    const chosen = this.data.patches.filter(item => item.checked)
    if (!chosen.length) { this.setData({ message: '请至少勾选一项修改' }); return }
    wx.showModal({ title: '确认应用 AI 修改', content: `即将应用 ${chosen.length} 项已勾选修改，并保存为新的云端版本。未勾选项不会写入。`, confirmText: '确认应用', confirmColor: '#6558d5', success: async result => {
      if (!result.confirm) return
      this.setData({ applying: true, message: '正在写入新的项目版本……' })
      try {
        const nextState = applyPatches(this.data.state, chosen)
        const updated = await api.updateProject(this.data.project, nextState, false)
        getApp().setProject(updated)
        wx.showToast({ title: `已应用 ${chosen.length} 项`, icon: 'success' })
        setTimeout(() => wx.navigateBack(), 600)
      } catch (reason) {
        this.setData({ message: reason.statusCode === 409 ? '云端版本已变化，请返回产业地图同步后重新生成' : (reason.message || '应用修改失败') })
      } finally { this.setData({ applying: false }) }
    } })
  }
})

function describePatch(spec, index, state) {
  const operation = ['add_node', 'update_node', 'add_relation'].includes(spec.operation) ? spec.operation : null
  if (!operation) return null
  const key = `patch-${index}`
  if (operation === 'add_node') {
    const parent = state.nodes[spec.parentId] || state.nodes[state.rootId]
    return { key, operation, spec: { ...spec, parentId: parent.id }, title: `新增节点：${spec.title || '未命名节点'}`, scope: `加入“${parent.title}”下`, before: '当前没有该节点', after: String(spec.summary || spec.why || '新增产业细分节点'), reason: String(spec.reason || '补充产业链缺失环节') }
  }
  if (operation === 'update_node') {
    const target = state.nodes[spec.targetId], field = ['summary', 'why', 'title', 'category'].includes(spec.field) ? spec.field : 'summary'
    if (!target || !String(spec.value || '').trim()) return null
    return { key, operation, spec: { ...spec, field }, title: `修改节点：${target.title}`, scope: ({ summary: '节点解释', why: '重要性', title: '节点名称', category: '节点分类' })[field], before: String(target[field] || '原字段为空'), after: String(spec.value), reason: String(spec.reason || '完善现有研究内容') }
  }
  const source = state.nodes[spec.sourceId], target = state.nodes[spec.targetId]
  if (!source || !target) return null
  return { key, operation, spec, title: `新增关系：${source.title} → ${target.title}`, scope: '产业关系', before: '当前没有这条关系', after: `关系类型：${spec.relationType || 'depend'}`, reason: String(spec.reason || '补充节点间逻辑关系') }
}

function applyPatches(current, chosen) {
  const state = JSON.parse(JSON.stringify(current))
  chosen.forEach((item, index) => {
    const spec = item.spec
    if (item.operation === 'add_node') {
      const parent = state.nodes[spec.parentId] || state.nodes[state.rootId]
      let id = String(spec.id || `ai_node_${Date.now()}_${index}`).replace(/[^a-zA-Z0-9_-]/g, '_')
      if (!id || state.nodes[id]) id = `ai_node_${Date.now()}_${index}`
      state.nodes[id] = { id, title: String(spec.title || 'AI 新增节点'), category: String(spec.category || `${parent.title} · 细分环节`), summary: String(spec.summary || '待继续研究'), why: String(spec.why || '待继续研究'), status: 'ai_draft', children: [], position: { x: (parent.position?.x || 0) + 240, y: (parent.position?.y || 0) + (parent.children || []).length * 70 }, metrics: [], bottlenecks: [] }
      parent.children = parent.children || []; parent.children.push(id)
      state.edges = state.edges || []; state.edges.push({ source: parent.id, target: id, type: 'structure' })
    } else if (item.operation === 'update_node') {
      const target = state.nodes[spec.targetId]
      if (target) { target[spec.field] = String(spec.value); target.status = 'ai_draft' }
    } else {
      state.edges = state.edges || []
      if (!state.edges.some(edge => edge.source === spec.sourceId && edge.target === spec.targetId && edge.type === (spec.relationType || 'depend'))) state.edges.push({ source: spec.sourceId, target: spec.targetId, type: spec.relationType || 'depend' })
    }
  })
  return state
}

module.exports = { describePatch, applyPatches }
