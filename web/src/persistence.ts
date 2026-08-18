import { demoProject } from './data/demo'
import type { AtlasNode, ProjectSnapshot, ProjectState } from './types'

const FORMAL_KEY = 'industry-atlas-formal-workspace-v1'
const LEGACY_KEY = 'industry-atlas-workspace-v1'
const SNAPSHOT_KEY = 'industry-atlas-formal-snapshots-v1'
const SCOPED_PROJECT_PREFIX = 'industry-atlas-project-v2:'
const SCOPED_SNAPSHOT_PREFIX = 'industry-atlas-snapshots-v2:'
const MIGRATION_OWNER_KEY = 'industry-atlas-v2-migration-owner'

function scopedKey(prefix: string, scope: string) { return `${prefix}${encodeURIComponent(scope)}` }

export function loadProject(scope = 'guest:local:draft'): ProjectState {
  try {
    const scoped = localStorage.getItem(scopedKey(SCOPED_PROJECT_PREFIX, scope))
    if (scoped) return normalize(JSON.parse(scoped))
    const formal = localStorage.getItem(FORMAL_KEY)
    const owner = scope.split(':', 1)[0]
    const migrationOwner = localStorage.getItem(MIGRATION_OWNER_KEY)
    if (formal && owner !== 'guest' && (!migrationOwner || migrationOwner === owner)) {
      localStorage.setItem(MIGRATION_OWNER_KEY, owner)
      localStorage.setItem(scopedKey(SCOPED_PROJECT_PREFIX, scope), formal)
      return normalize(JSON.parse(formal))
    }
    if (formal && owner === 'guest' && !migrationOwner) return normalize(JSON.parse(formal))
    const legacy = localStorage.getItem(LEGACY_KEY)
    if (legacy && (!migrationOwner || migrationOwner === owner)) return migrateLegacy(JSON.parse(legacy))
  } catch { /* fall back to demo */ }
  return structuredClone(demoProject)
}

export function saveProject(state: ProjectState, scope = 'guest:local:draft') { localStorage.setItem(scopedKey(SCOPED_PROJECT_PREFIX, scope), JSON.stringify(state)) }
export function loadSnapshots(scope = 'guest:local:draft'): ProjectSnapshot[] {
  try {
    const scoped = localStorage.getItem(scopedKey(SCOPED_SNAPSHOT_PREFIX, scope))
    if (scoped) return JSON.parse(scoped)
    const owner = scope.split(':', 1)[0], migrationOwner = localStorage.getItem(MIGRATION_OWNER_KEY)
    if (owner !== 'guest' && migrationOwner === owner) return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || '[]')
    return []
  } catch { return [] }
}
export function saveSnapshots(snapshots: ProjectSnapshot[], scope = 'guest:local:draft') { localStorage.setItem(scopedKey(SCOPED_SNAPSHOT_PREFIX, scope), JSON.stringify(snapshots.slice(0, 40))) }

function normalize(state: ProjectState): ProjectState {
  return { ...structuredClone(demoProject), ...state, nodes: state.nodes || demoProject.nodes, edges: state.edges || [], companyData: state.companyData || [], evidenceData: state.evidenceData || {}, researchTasks: state.researchTasks || [] }
}

function migrateLegacy(raw: Record<string, any>): ProjectState {
  if (!raw.nodes || !raw.rootId) return structuredClone(demoProject)
  const nodes = Object.fromEntries(Object.entries(raw.nodes as Record<string, any>).filter(([, value]) => value?.title && value.type !== 'draft').map(([id, value]) => {
    const research = raw.researchData?.[id] || {}
    const position = raw.nodePositions?.[id] || { x: value.x || 0, y: value.y || 0 }
    const node: AtlasNode = { id, title: value.title, category: value.category || value.desc || '产业环节', summary: research.summary || value.summary || '', why: research.why || value.why || '', status: value.status || 'unresearched', children: (value.children || []).filter((child: string) => raw.nodes[child] && raw.nodes[child].type !== 'draft'), position, metrics: research.metrics || value.metrics || [], bottlenecks: research.bottlenecks || value.bottlenecks || [] }
    return [id, node]
  }))
  return normalize({ projectTitle: raw.projectTitle || '产业研究项目', rootId: raw.rootId, nodes, edges: (raw.edges || []).filter((edge: any) => nodes[edge.source] && nodes[edge.target]).map((edge: any, index: number) => ({ id: edge.id || `legacy-edge-${index}`, source: edge.source, target: edge.target, type: edge.type === 'depend' ? 'dependency' : edge.type, reason: edge.reason })), companyData: raw.companyData || [], evidenceData: raw.evidenceData || {}, researchTasks: raw.researchTasks || [] })
}
