import type { WorkflowState, Connection } from './types'
import type { NodeInstance, NodeType } from '@/stores/node/types'
import type { Node, Edge } from '@vue-flow/core'
import { ConnectionType, HANDLE_TO_CONNECTION_TYPE } from './types'

// ─── Sub-node helpers (локально, щоб не дублювати в компоненті) ───────────────

const SUB_TYPES = new Set<NodeType>(['AI_MODEL', 'AI_MEMORY', 'AI_TOOL'] as NodeType[])

function isSubNode(type: NodeType): boolean {
  return SUB_TYPES.has(type)
}

function typeToPortKey(type: NodeType): string | null {
  if (type === 'AI_MODEL')  return 'ai_model'
  if (type === 'AI_MEMORY') return 'ai_memory'
  if (type === 'AI_TOOL')   return 'ai_tools'
  return null
}

// ─── Edge helpers ─────────────────────────────────────────────────────────────

const PORT_STYLES: Record<number, { color: string }> = {
  0: { color: '#10b981' },
  1: { color: '#ef4444' },
  2: { color: '#f59e0b' },
  3: { color: '#8b5cf6' },
  4: { color: '#06b6d4' },
  5: { color: '#6366f1' },
}

const SUB_TYPE_COLOR: Partial<Record<NodeType, string>> = {
  AI_MODEL:  '#8b5cf6',
  AI_MEMORY: '#06b6d4',
  AI_TOOL:   '#10b981',
}

function getPortStyle(index: number): { color: string } {
  return PORT_STYLES[index] ?? { color: '#9ca3af' }
}

function getEdgeLabel(conn: Connection, sourceNode?: NodeInstance): string {
  const d = sourceNode?.discriminator
  if (d === 'IF_LOGIC') {
    return conn.sourceOutputIndex === 0 ? 'true' : 'false'
  }
  if (d === 'SWITCH_LOGIC') {
    const rules = (sourceNode?.parameters?.rules ?? []) as Array<{
      outputIndex: number
      outputName?: string
    }>
    const rule = rules.find(r => r.outputIndex === conn.sourceOutputIndex)
    return rule ? (rule.outputName ?? String(conn.sourceOutputIndex)) : 'fallback'
  }
  return ''
}

function buildConnectionEdge(conn: Connection, sourceNode?: NodeInstance): Edge {
  const portStyle = getPortStyle(conn.sourceOutputIndex)
  const label     = getEdgeLabel(conn, sourceNode)

  return {
    id:           `${conn.sourceNodeId}-${conn.sourceOutputIndex}-${conn.targetNodeId}`,
    source:       conn.sourceNodeId,
    target:       conn.targetNodeId,
    sourceHandle: String(conn.sourceOutputIndex),
    targetHandle: conn.targetHandle ?? String(conn.targetInputIndex),
    type:         'smoothstep',
    animated:     false,
    style:        { stroke: portStyle.color, strokeWidth: 1.5 },
    ...(label ? {
      label,
      labelStyle:          { fontWeight: '700', fontSize: '10px', fontFamily: 'inherit' },
      labelBgStyle:        { fill: '#f8f9fa' },
      labelBgPadding:      [4, 6] as [number, number],
      labelBgBorderRadius: 3,
    } : {}),
    markerEnd: { type: 'arrowclosed', color: portStyle.color, width: 16, height: 10 },
  }
}

function buildSubNodeEdge(subNode: NodeInstance, agentNodeId: string): Edge {
  const color    = SUB_TYPE_COLOR[subNode.type] ?? '#9ca3af'
  const portKey  = typeToPortKey(subNode.type) ?? '0'

  return {
    id:           `sub-${subNode.nodeId}-${agentNodeId}`,
    source:       subNode.nodeId,
    target:       agentNodeId,
    sourceHandle: '0',
    targetHandle: portKey,
    type:         'smoothstep',
    animated:     false,
    style:        { stroke: color, strokeWidth: 1.5, strokeDasharray: '4 3' },
    markerEnd:    { type: 'arrowclosed', color, width: 14, height: 9 },
  }
}

// ─── Getters ──────────────────────────────────────────────────────────────────

export const getters = {
  /**
   * VueFlow nodes — маппінг з NodeInstance
   */
  nodes(state: WorkflowState): Node[] {
    if (!state.workflow?.nodes) return []

    return state.workflow.nodes.map(node => ({
      id:       node.nodeId,
      type:     isSubNode(node.type) ? 'sub' : 'custom',
      position: node.position ?? { x: 0, y: 0 },
      data:     node,
    }))
  },

  /**
   * VueFlow edges — з connections + авто-edges для sub-нод
   */
  edges(state: WorkflowState): Edge[] {
    if (!state.workflow) return []

    const result: Edge[] = []

    // 1. Звичайні connections зі store
    for (const conn of state.workflow.connections ?? []) {
      const sourceNode = state.workflow.nodes.find(n => n.nodeId === conn.sourceNodeId)
      result.push(buildConnectionEdge(conn, sourceNode))
    }

    // 2. Авто-edges від sub-нод до AI_AGENT
    for (const node of state.workflow.nodes) {
      if (!isSubNode(node.type)) continue
      const agentNodeId = node.parameters?.agentNodeId as string | undefined
      if (!agentNodeId) continue
      result.push(buildSubNodeEdge(node, agentNodeId))
    }

    return result
  },

  /**
   * Знайти ноду за nodeId
   */
  getNodeById(state: WorkflowState) {
    return (nodeId: string): NodeInstance | undefined =>
      state.workflow?.nodes.find(n => n.nodeId === nodeId)
  },

  /**
   * Знайти всі connections для ноди (як source або target)
   */
  getConnectionsByNodeId(state: WorkflowState) {
    return (nodeId: string): Connection[] =>
      (state.workflow?.connections ?? []).filter(
        c => c.sourceNodeId === nodeId || c.targetNodeId === nodeId
      )
  },
}
