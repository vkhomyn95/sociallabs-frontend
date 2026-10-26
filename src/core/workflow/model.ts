/** Node id, unique within a workflow. */
export type NodeId = string

export interface Position {
  readonly x: number
  readonly y: number
}

/** Mirrors backend ConnectionType. */
export enum ConnectionType {
  MAIN = 'MAIN',
  AI_AGENT = 'AI_AGENT',
  AI_TOOL = 'AI_TOOL',
  AI_MEMORY = 'AI_MEMORY',
  AI_OUTPUT = 'AI_OUTPUT',
}

/** Mirrors backend OnError. */
export enum OnError {
  STOP_WORKFLOW = 'STOP_WORKFLOW',
  CONTINUE = 'CONTINUE',
  ERROR_OUTPUT = 'ERROR_OUTPUT',
}

/** Engine-level node settings; absent values fall back to the engine defaults. */
export interface NodeSettings {
  readonly onError?: OnError | null
  readonly maxTries?: number | null
  readonly retryDelayMs?: number | null
  readonly retryMultiplier?: number | null
  readonly timeoutMs?: number | null
  readonly alwaysOutputData: boolean
  readonly executeOnce: boolean
}

export type Parameters = Readonly<Record<string, unknown>>

/** Immutable node of the workflow document; changes create a new instance. */
export interface NodeModel {
  readonly id: NodeId
  readonly name: string
  /** Node type name, e.g. `core.if`. */
  readonly type: string
  readonly typeVersion: number
  readonly position: Position
  readonly parameters: Parameters
  readonly credentialId: number | null
  readonly disabled: boolean
  readonly notes: string | null
  readonly settings: NodeSettings | null
}

/** Connection from an output port of one node to an input port of another. */
export interface ConnectionModel {
  readonly source: NodeId
  readonly sourceOutput: number
  readonly target: NodeId
  readonly targetInput: number
  readonly type: ConnectionType
}

/** Node fields edited one at a time; each maps to its own draft operation. */
export type EditableNodeField = 'name' | 'parameters' | 'credentialId' | 'disabled' | 'notes' | 'settings'

/**
 * Identity of a connection, also used as the canvas edge id.
 *
 * @param connection connection ends and ports
 * @returns stable key
 */
export function connectionKey(connection: Omit<ConnectionModel, 'type'>): string {
  return `${connection.source}-${connection.sourceOutput}-${connection.target}-${connection.targetInput}`
}

/** @returns key of the node type, `name@version` */
export function typeKeyOf(node: Pick<NodeModel, 'type' | 'typeVersion'>): string {
  return `${node.type}@${node.typeVersion}`
}
