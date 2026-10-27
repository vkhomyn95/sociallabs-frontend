import type { Parameters } from '@/core/workflow/model'

/** Data transfer format of a node dragged from the node creator onto the canvas. */
export const NODE_DRAG_FORMAT = 'application/x-workflow-node'

export interface NodeDragPayload {
  /** Node type key, `name@version`. */
  readonly key: string
  /** Preset of the entry that was dragged, e.g. its operation. */
  readonly parameters: Parameters
}

export function writeNodeDrag(event: DragEvent, payload: NodeDragPayload): void {
  if (!event.dataTransfer) return
  event.dataTransfer.setData(NODE_DRAG_FORMAT, JSON.stringify(payload))
  event.dataTransfer.effectAllowed = 'copy'
}

/** @returns the dragged node, or null when the drag carries something else */
export function readNodeDrag(event: DragEvent): NodeDragPayload | null {
  const raw = event.dataTransfer?.getData(NODE_DRAG_FORMAT)
  if (!raw) return null
  try {
    const payload = JSON.parse(raw) as Partial<NodeDragPayload>
    return typeof payload.key === 'string' ? { key: payload.key, parameters: payload.parameters ?? {} } : null
  } catch {
    return null
  }
}

export const carriesNode = (event: DragEvent): boolean => event.dataTransfer?.types.includes(NODE_DRAG_FORMAT) ?? false
