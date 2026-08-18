import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const root = path.dirname(fileURLToPath(import.meta.url))
const storage = new Map()
const requests = []

globalThis.wx = {
  getStorageSync(key) { return storage.get(key) },
  setStorageSync(key, value) { storage.set(key, value) },
  removeStorageSync(key) { storage.delete(key) },
  login({ success }) { success({ code: 'test-wechat-code' }) },
  request(options) {
    requests.push(options)
    if (options.url.endsWith('/api/auth/dev-login')) {
      options.success({ statusCode: 200, data: { token: 'dev-token', user: { id: 'user-1', display_name: '验收员' }, workspace_id: 'workspace-1' } })
      return
    }
    if (options.url.endsWith('/api/auth/wechat')) {
      options.success({ statusCode: 200, data: { token: 'wechat-token', user: { id: 'user-2', display_name: '微信研究员' }, workspace: { id: 'workspace-2', name: '微信研究空间', role: 'owner' } } })
      return
    }
    if (options.url.endsWith('/api/system/status')) {
      options.success({ statusCode: 200, data: { ai_configured: true, wechat_configured: true } })
      return
    }
    options.success({ statusCode: 200, data: {} })
  }
}

let registeredPage = null
globalThis.Page = definition => { registeredPage = definition }

const project = require('./utils/project.js')
const api = require('./utils/api.js')

const blank = project.demoState('储能产业')
assert.equal(blank.projectTitle, '储能产业')
assert.deepEqual(blank.nodes.industry.children, [])

const generated = project.aiState({
  title: '光伏产业', overview: '从材料到电站运营的完整产业体系',
  branches: [
    { title: '硅料与硅片', summary: '上游材料', why: '决定基础成本', children: [{ title: '多晶硅', summary: '核心原料', why: '供给约束' }] },
    { title: '电池与组件', summary: '中游制造', why: '决定转换效率', children: [{ title: '光伏电池', summary: '完成光电转换', why: '技术迭代核心' }] }
  ]
}, '备用标题')
assert.equal(Object.keys(generated.nodes).length, 5)
assert.equal(generated.edges.length, 4)
assert.equal(project.flattenNodes(generated, {}, '').length, 5)
assert.equal(project.flattenNodes(generated, { branch_1: false }, '').length, 4)
assert.equal(project.flattenNodes(generated, {}, '转换效率')[0].id, 'branch_2')
const deep = project.demoState('深层产业')
let parentId = 'industry'
for (let depth = 1; depth <= 10; depth += 1) {
  const id = `depth_${depth}`
  deep.nodes[parentId].children.push(id)
  deep.nodes[id] = { id, title: `第${depth}层`, category: '深层节点', summary: '', why: '', status: 'unresearched', children: [], metrics: [], bottlenecks: [] }
  parentId = id
}
assert.ok(Math.max(...project.flattenNodes(deep, {}, '').map(row => row.indent)) <= 96, 'deep maps must stay within the phone viewport')
assert.throws(() => project.aiState({ branches: [{ title: '只有一个分支' }] }), /分支不足/)

require('./pages/ai-review/index.js')
assert.ok(registeredPage && typeof registeredPage.generate === 'function')
const { describePatch, applyPatches } = require('./pages/ai-review/index.js')
const suggestions = [
  describePatch({ operation: 'add_node', id: 'inverter', parentId: 'branch_2', title: '逆变器', summary: '直流电转换设备', why: '影响系统效率', reason: '补齐关键设备' }, 0, generated),
  describePatch({ operation: 'update_node', targetId: 'branch_1', field: 'summary', value: '覆盖硅料生产与硅片加工', reason: '提高解释精度' }, 1, generated),
  describePatch({ operation: 'add_relation', sourceId: 'branch_1', targetId: 'branch_2', relationType: 'supply', reason: '体现材料供应关系' }, 2, generated)
]
assert.ok(suggestions.every(Boolean))
const modified = applyPatches(generated, suggestions)
assert.equal(modified.nodes.inverter.title, '逆变器')
assert.ok(modified.nodes.branch_2.children.includes('inverter'))
assert.equal(modified.nodes.branch_1.summary, '覆盖硅料生产与硅片加工')
assert.ok(modified.edges.some(edge => edge.source === 'branch_1' && edge.target === 'branch_2' && edge.type === 'supply'))
assert.equal(generated.nodes.inverter, undefined, 'AI patch preview must not mutate the original state')

api.setBaseUrl('http://127.0.0.1:8000///')
assert.equal(api.config().baseUrl, 'http://127.0.0.1:8000')
await api.devLogin('验收员')
assert.equal(api.getSession().token, 'dev-token')
assert.equal(api.getSession().workspace.role, 'owner')
const status = await api.systemStatus()
assert.equal(status.ai_configured, true)
assert.equal(requests.at(-1).header.Authorization, 'Bearer dev-token')
api.logout()
await api.wechatLogin('微信研究员')
assert.equal(api.getSession().token, 'wechat-token')
assert.equal(requests.at(-1).data.code, 'test-wechat-code')

const apiMethods = new Set(Object.keys(api))
const pageFiles = fs.readdirSync(path.join(root, 'pages'), { withFileTypes: true })
  .filter(item => item.isDirectory())
  .map(item => path.join(root, 'pages', item.name, 'index.js'))
for (const pageFile of pageFiles) {
  const source = fs.readFileSync(pageFile, 'utf8')
  for (const match of source.matchAll(/\bapi\.([A-Za-z_$][\w$]*)/g)) {
    assert.ok(apiMethods.has(match[1]), `${path.relative(root, pageFile)} calls missing api.${match[1]}()`)
  }
}

console.log('mini program runtime check passed (project, AI review, persistence, login and authenticated requests)')
