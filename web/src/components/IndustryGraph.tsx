import { Background, Controls, MarkerType, MiniMap, ReactFlow, type Edge, type Node, type NodeMouseHandler } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { AtlasNode, ProjectState } from '../types'

const statusColors: Record<AtlasNode['status'], string> = {
  unresearched: '#94a3b8', ai_draft: '#8b5cf6', edited: '#3b82f6', evidenced: '#14b8a6', verified: '#16a36a', stale: '#f59e0b',
}

interface GraphProps {
  state: ProjectState
  selectedId: string
  search: string
  onSelect: (id: string) => void
  onMove: (id: string, position: { x: number; y: number }) => void
  readOnly?: boolean
}

export function IndustryGraph({ state, selectedId, search, onSelect, onMove, readOnly = false }: GraphProps) {
  const query = search.trim().toLowerCase()
  const graphNodes: Node[] = Object.values(state.nodes).map(node => ({
    id: node.id,
    position: node.position,
    data: { label: <div className="atlas-node-content"><small>{node.category}</small><strong>{node.title}</strong><span>{node.children.length} 个下级环节</span></div> },
    className: `atlas-node ${selectedId === node.id ? 'selected' : ''} ${query && `${node.title} ${node.summary}`.toLowerCase().includes(query) ? 'matched' : ''}`,
    style: { borderColor: selectedId === node.id ? '#6558d5' : statusColors[node.status] },
  }))
  const structureEdges: Edge[] = Object.values(state.nodes).flatMap(node => node.children.map(child => ({ id: `tree-${node.id}-${child}`, source: node.id, target: child, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14 }, style: { stroke: '#b8c1d1', strokeWidth: 1.4 } })))
  const relationEdges: Edge[] = state.edges.map(edge => ({ id: edge.id, source: edge.source, target: edge.target, type: 'smoothstep', animated: edge.type === 'constraint', label: edge.type, style: { stroke: '#8b7ee8', strokeDasharray: '5 4' } }))
  const handleClick: NodeMouseHandler = (_, node) => onSelect(node.id)
  return <section className="graph-canvas">
    <div className="graph-legend"><span><i className="verified" />已核验</span><span><i className="evidenced" />已有证据</span><span><i className="draft" />AI 初稿</span><span><i />待研究</span></div>
    <ReactFlow nodes={graphNodes} edges={[...structureEdges, ...relationEdges]} nodesDraggable={!readOnly} onNodeClick={handleClick} onNodeDragStop={(_, node) => { if (!readOnly) onMove(node.id, node.position) }} fitView minZoom={0.25} maxZoom={1.7} proOptions={{ hideAttribution: true }}>
      <Background color="#dfe4ec" gap={24} size={1} />
      <MiniMap pannable zoomable nodeColor={node => String(node.style?.borderColor || '#94a3b8')} maskColor="rgba(245,247,250,.75)" />
      <Controls showInteractive={false} />
    </ReactFlow>
  </section>
}
