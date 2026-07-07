import type { WorkflowState } from './types'
import {
  NODE_DISCRIMINATOR_TO_WORKFLOW_NODE_TYPE,
  resolveEdgeColor,
  resolveEdgeLabel,
  WorkflowNodeType
} from './types'
import type { Edge, Node } from '@vue-flow/core'
import { MarkerType } from '@vue-flow/core'

// ─── Getters ──────────────────────────────────────────────────────────────────

export const getters = {
  /**
   * VueFlow nodes — маппінг з NodeInstance
   */
  nodes(state: WorkflowState): Node[] {
    if (!state.workflow?.nodes) return []

    return state.workflow.nodes.map(node => ({
      id:       node.nodeId,
      type:     NODE_DISCRIMINATOR_TO_WORKFLOW_NODE_TYPE[node.discriminator] ?? WorkflowNodeType.CUSTOM,
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

    for (const conn of state.workflow.connections ?? []) {
      const sourceNode = state.workflow.nodes.find(n => n.nodeId === conn.sourceNodeId)
      const color = resolveEdgeColor(sourceNode, conn.sourceOutputIndex)
      const label = resolveEdgeLabel(sourceNode, conn.sourceOutputIndex)

      result.push({
        id: `${conn.sourceNodeId}-${conn.sourceOutputIndex}-${conn.targetNodeId}`,
        source: conn.sourceNodeId,
        target: conn.targetNodeId,
        sourceHandle: String(conn.sourceOutputIndex),
        targetHandle: String(conn.targetInputIndex),
        data: {
          color,
          label: label || undefined,
          connectionId: conn.id,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color, width: 14, height: 9 },
      })
    }

    return result
  },
}
