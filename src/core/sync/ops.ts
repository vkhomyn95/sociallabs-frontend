import type { ConnectionModel, ConnectionType, NodeId, NodeModel, NodeSettings, Parameters, Position } from '@/core/workflow/model'

/** Node as the server stores it in a draft (backend DocumentNode). */
export interface DocumentNodeDto {
  id: NodeId
  name: string
  type: string
  typeVersion: number
  position: Position
  parameters: Parameters
  credentialId: number | null
  disabled: boolean
  notes: string | null
  settings: NodeSettings | null
}

/** Connection as the server stores it (backend DocumentConnection). */
export interface DocumentConnectionDto {
  source: NodeId
  sourceOutput: number
  target: NodeId
  targetInput: number
  type: ConnectionType
}

/** One change to a draft; mirrors the backend DraftOp sealed hierarchy, discriminated by `op`. */
export type DraftOp =
  | { op: 'addNode'; node: DocumentNodeDto }
  | { op: 'removeNodes'; nodeIds: NodeId[] }
  | { op: 'renameNode'; nodeId: NodeId; name: string }
  | { op: 'moveNodes'; positions: Record<NodeId, Position> }
  | { op: 'setParameters'; nodeId: NodeId; parameters: Parameters }
  | { op: 'setCredential'; nodeId: NodeId; credentialId: number | null }
  | { op: 'setDisabled'; nodeId: NodeId; disabled: boolean }
  | { op: 'setNotes'; nodeId: NodeId; notes: string | null }
  | { op: 'setSettings'; nodeId: NodeId; settings: NodeSettings | null }
  | { op: 'addConnection'; connection: DocumentConnectionDto }
  | { op: 'removeConnection'; connection: DocumentConnectionDto }
  | { op: 'replaceGraph'; document: { nodes: DocumentNodeDto[]; connections: DocumentConnectionDto[] } }

export type DraftOpName = DraftOp['op']

export const toNodeDto = (node: NodeModel): DocumentNodeDto => ({
  id: node.id,
  name: node.name,
  type: node.type,
  typeVersion: node.typeVersion,
  position: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
  parameters: node.parameters,
  credentialId: node.credentialId,
  disabled: node.disabled,
  notes: node.notes,
  settings: node.settings,
})

export const toConnectionDto = (connection: ConnectionModel): DocumentConnectionDto => ({ ...connection })

/** Operations that set one field of a node; the op that undoes a change sets the old value. */
export const NODE_FIELD_OPS = {
  name: (nodeId: NodeId, name: string): DraftOp => ({ op: 'renameNode', nodeId, name }),
  parameters: (nodeId: NodeId, parameters: Parameters): DraftOp => ({ op: 'setParameters', nodeId, parameters }),
  credentialId: (nodeId: NodeId, credentialId: number | null): DraftOp => ({ op: 'setCredential', nodeId, credentialId }),
  disabled: (nodeId: NodeId, disabled: boolean): DraftOp => ({ op: 'setDisabled', nodeId, disabled }),
  notes: (nodeId: NodeId, notes: string | null): DraftOp => ({ op: 'setNotes', nodeId, notes }),
  settings: (nodeId: NodeId, settings: NodeSettings | null): DraftOp => ({ op: 'setSettings', nodeId, settings }),
} satisfies { [K in keyof NodeModel]?: (nodeId: NodeId, value: NodeModel[K]) => DraftOp }

/** Positions are whole pixels on the server. */
export const toPositionsRecord = (positions: ReadonlyMap<NodeId, Position>): Record<NodeId, Position> =>
  Object.fromEntries([...positions].map(([id, p]) => [id, { x: Math.round(p.x), y: Math.round(p.y) }]))
