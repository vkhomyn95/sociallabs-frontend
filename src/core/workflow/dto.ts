import { ConnectionType, type ConnectionModel, type NodeModel, type NodeSettings } from './model'
import type { WorkflowSnapshot } from './WorkflowDocument'

/** Node of `GET /workflows/{id}` (backend NodeResponse). */
export interface WorkflowNodeDto {
  nodeId: string
  name: string
  typeName: string
  typeVersion: number | null
  position: { x: number | null; y: number | null } | null
  parameters: Record<string, unknown> | null
  credentialId: number | null
  disabled: boolean | null
  notes: string | null
  settings: NodeSettings | null
}

/** Connection of `GET /workflows/{id}` (backend ConnectionResponse). */
export interface WorkflowConnectionDto {
  sourceNodeId: string
  sourceOutputIndex: number | null
  targetNodeId: string
  targetInputIndex: number | null
  type: ConnectionType | null
}

/** `GET /workflows/{id}` (backend WorkflowResponse). */
export interface WorkflowDto {
  id: number
  name: string
  description: string | null
  active: boolean
  revision: number
  activeVersionId: number | null
  hasUnpublishedChanges: boolean
  nodes: WorkflowNodeDto[]
  connections: WorkflowConnectionDto[]
  createdAt?: string | null
  updatedAt?: string | null
}

export const toNodeModel = (dto: WorkflowNodeDto): NodeModel => ({
  id: dto.nodeId,
  name: dto.name || dto.nodeId,
  type: dto.typeName,
  typeVersion: dto.typeVersion ?? 1,
  position: { x: dto.position?.x ?? 0, y: dto.position?.y ?? 0 },
  parameters: dto.parameters ?? {},
  credentialId: dto.credentialId ?? null,
  disabled: dto.disabled ?? false,
  notes: dto.notes ?? null,
  settings: dto.settings ?? null,
})

export const toConnectionModel = (dto: WorkflowConnectionDto): ConnectionModel => ({
  source: dto.sourceNodeId,
  sourceOutput: dto.sourceOutputIndex ?? 0,
  target: dto.targetNodeId,
  targetInput: dto.targetInputIndex ?? 0,
  type: dto.type ?? ConnectionType.MAIN,
})

/** @returns graph of a loaded workflow */
export const toSnapshot = (dto: Pick<WorkflowDto, 'nodes' | 'connections'>): WorkflowSnapshot => ({
  nodes: (dto.nodes ?? []).map(toNodeModel),
  connections: (dto.connections ?? []).map(toConnectionModel),
})
