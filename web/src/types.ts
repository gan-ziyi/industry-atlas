export type ResearchStatus = 'unresearched' | 'ai_draft' | 'edited' | 'evidenced' | 'verified' | 'stale'

export interface AtlasNode {
  id: string
  title: string
  category: string
  summary: string
  why: string
  status: ResearchStatus
  children: string[]
  position: { x: number; y: number }
  metrics?: string[]
  bottlenecks?: string[]
}

export interface AtlasEdge {
  id: string
  source: string
  target: string
  type?: 'structure' | 'supply' | 'dependency' | 'constraint' | 'substitute' | 'benefit'
  reason?: string
}

export interface Finding {
  id: string
  category: string
  category_label?: string
  title: string
  value: string
  quote?: string
  reportPeriod?: string
  matched_pages?: number[]
  citation_status?: 'matched' | 'unmatched'
}

export interface CompanyMapping {
  id: string
  nodeId: string
  nodeTitle?: string
  status: 'suggested' | 'confirmed' | 'rejected'
  score: number
  reason: string
  projectId?: string
}

export interface Company {
  id: string
  name: string
  reportPeriod?: string
  summary?: string
  findings: Finding[]
  mappings: CompanyMapping[]
  periods: Array<{ period: string; summary?: string; findingIds?: string[]; documents?: unknown[] }>
  documents: Array<{ documentId?: string; filename?: string }>
}

export interface Evidence {
  id: string
  type: string
  title: string
  location?: string
  quote?: string
  verified?: boolean
}

export interface ResearchTask {
  id: string
  nodeId: string
  title: string
  status: 'todo' | 'doing' | 'done'
  priority: 'high' | 'medium' | 'low'
  type?: 'structure' | 'explain' | 'evidence' | 'verify' | 'update'
  note?: string
}

export interface ProjectState {
  projectTitle: string
  rootId: string
  nodes: Record<string, AtlasNode>
  edges: AtlasEdge[]
  companyData: Company[]
  evidenceData: Record<string, Evidence[]>
  researchTasks: ResearchTask[]
}

export interface CloudWorkspace {
  id: string
  name: string
  role?: 'owner' | 'editor' | 'viewer'
  user?: { id: string; email?: string; display_name: string }
}

export interface CloudMember {
  id: string
  email?: string | null
  display_name: string
  role: 'owner' | 'editor' | 'viewer'
  created_at?: string
}

export interface CloudProject {
  id: string
  title: string
  state: ProjectState
  version: number
  updated_at: string
}

export interface CloudProjectSummary {
  id: string
  workspace_id: string
  title: string
  version: number
  created_at: string
  updated_at: string
}

export interface DocumentTask {
  id: string
  filename: string
  status: string
  page_count: number
  char_count: number
  table_count: number
  extraction_count: number
  updated_at: string
  needs_ocr?: number
  error?: string | null
}

export interface DocumentChunk { id: string; page_number: number; text: string }

export interface DocumentTable {
  id: string
  page_number: number
  table_number: number
  row_count: number
  column_count: number
  data: string[][]
}

export interface ExtractionResult {
  company: string
  report_period: string
  summary: string
  findings: Finding[]
  validation: { total: number; matched: number; unmatched: number }
}

export interface ExtractionTask {
  id: string
  document_id: string
  status: 'processing' | 'ready' | 'failed'
  result: ExtractionResult | null
  error?: string | null
}

export interface ProjectSnapshot {
  id: string
  label: string
  createdAt: string
  state: ProjectState
}

export interface GraphPatch {
  id: string
  type: 'update_node' | 'add_node' | 'add_edge'
  targetId?: string
  parentId?: string
  source?: string
  target?: string
  before?: Partial<AtlasNode>
  after?: Partial<AtlasNode>
  reason: string
}
