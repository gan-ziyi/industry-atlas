function demoState(title) {
  return {
    projectTitle: title || '新的产业研究', rootId: 'industry',
    nodes: { industry: { id: 'industry', title: title || '待研究产业', category: '产业总览', summary: '从这里开始拆解产业链。', why: '建立行业结构、价值流与关键约束的统一研究入口。', status: 'unresearched', children: [], position: { x: 0, y: 0 }, metrics: [], bottlenecks: [] } },
    edges: [], companyData: [], evidenceData: {}, researchTasks: []
  }
}

function aiState(result, fallbackTitle) {
  const title = String(result.title || fallbackTitle || 'AI 产业研究')
  const branches = Array.isArray(result.branches) ? result.branches.slice(0, 6) : []
  if (branches.length < 2) throw new Error('AI 返回的产业分支不足，请重新生成')
  const nodes = {
    industry: {
      id: 'industry', title, category: '产业总览', summary: String(result.overview || `围绕${title}形成的产业体系。`),
      why: '用于理解产业结构、价值传导、关键瓶颈与技术演进。', status: 'ai_draft', children: [],
      position: { x: 40, y: 300 }, metrics: [], bottlenecks: []
    }
  }
  const edges = []
  branches.forEach((branch, branchIndex) => {
    const branchId = `branch_${branchIndex + 1}`
    nodes.industry.children.push(branchId)
    nodes[branchId] = {
      id: branchId, title: String(branch.title || `核心分支 ${branchIndex + 1}`), category: `${title} · 核心分支`,
      summary: String(branch.summary || '待继续研究'), why: String(branch.why || '待继续研究'), status: 'ai_draft', children: [],
      position: { x: 270, y: 60 + branchIndex * 150 }, metrics: [], bottlenecks: []
    }
    edges.push({ source: 'industry', target: branchId, type: 'structure' })
    const children = Array.isArray(branch.children) ? branch.children.slice(0, 5) : []
    children.forEach((child, childIndex) => {
      const childId = `${branchId}_child_${childIndex + 1}`
      nodes[branchId].children.push(childId)
      nodes[childId] = {
        id: childId, title: String(child.title || `细分环节 ${childIndex + 1}`), category: `${nodes[branchId].title} · 细分环节`,
        summary: String(child.summary || '待继续研究'), why: String(child.why || '待继续研究'), status: 'ai_draft', children: [],
        position: { x: 510, y: 60 + branchIndex * 150 + childIndex * 62 }, metrics: [], bottlenecks: []
      }
      edges.push({ source: branchId, target: childId, type: 'structure' })
    })
  })
  return { projectTitle: title, rootId: 'industry', nodes, edges, companyData: [], evidenceData: {}, researchTasks: [] }
}

function flattenNodes(state, expanded, query) {
  if (!state || !state.nodes || !state.nodes[state.rootId]) return []
  const rows = [], normalized = String(query || '').trim().toLowerCase()
  function searchableText(node) {
    const metrics = (node.metrics || []).map(item => typeof item === 'string' ? item : `${item.name || item.title || ''} ${item.value || ''}`).join(' ')
    const bottlenecks = (node.bottlenecks || []).map(item => typeof item === 'string' ? item : `${item.title || item.name || ''} ${item.detail || item.summary || ''}`).join(' ')
    return `${node.title || ''} ${node.summary || ''} ${node.why || ''} ${node.category || ''} ${metrics} ${bottlenecks}`.toLowerCase()
  }
  function walk(id, depth) {
    const node = state.nodes[id]; if (!node) return
    const matches = !normalized || searchableText(node).includes(normalized)
    if (matches || !normalized) rows.push({ ...node, depth, indent: Math.min(depth, 4) * 24, evidenceCount: (state.evidenceData[id] || []).length, expanded: expanded[id] !== false, hasChildren: node.children.length > 0 })
    if (normalized || expanded[id] !== false) node.children.forEach(child => walk(child, depth + 1))
  }
  walk(state.rootId, 0)
  if (normalized) Object.values(state.nodes).forEach(node => { if (!rows.some(row => row.id === node.id) && searchableText(node).includes(normalized)) rows.push({ ...node, depth: 0, indent: 0, evidenceCount: (state.evidenceData[node.id] || []).length, expanded: true, hasChildren: node.children.length > 0 }) })
  return rows
}

module.exports = { demoState, aiState, flattenNodes }
