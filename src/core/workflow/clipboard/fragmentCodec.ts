import { ConnectionType, type ConnectionModel, type NodeModel } from '../model'
import { createFragment, FRAGMENT_FORMAT, FRAGMENT_VERSION, type WorkflowFragment } from './WorkflowFragment'

type Json = Record<string, unknown>

const CONNECTION_TYPES = new Set<string>(Object.values(ConnectionType))

const isObject = (value: unknown): value is Json => typeof value === 'object' && value !== null && !Array.isArray(value)

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value)

const isOptionalString = (value: unknown): boolean => value === null || typeof value === 'string'

function isPosition(value: unknown): boolean {
  return isObject(value) && isNumber(value.x) && isNumber(value.y)
}

/** Structural check of a node; parameters and settings are opaque here and validated by the server on save. */
function isNode(value: unknown): value is NodeModel {
  return (
    isObject(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.type === 'string' &&
    isNumber(value.typeVersion) &&
    isPosition(value.position) &&
    isObject(value.parameters) &&
    (value.credentialId === null || isNumber(value.credentialId)) &&
    typeof value.disabled === 'boolean' &&
    isOptionalString(value.notes) &&
    (value.settings === null || isObject(value.settings))
  )
}

function isConnection(value: unknown): value is ConnectionModel {
  return (
    isObject(value) &&
    typeof value.source === 'string' &&
    typeof value.target === 'string' &&
    isNumber(value.sourceOutput) &&
    isNumber(value.targetInput) &&
    typeof value.type === 'string' &&
    CONNECTION_TYPES.has(value.type)
  )
}

function isFragment(value: unknown): value is WorkflowFragment {
  return (
    isObject(value) &&
    value.format === FRAGMENT_FORMAT &&
    value.version === FRAGMENT_VERSION &&
    Array.isArray(value.nodes) &&
    value.nodes.every(isNode) &&
    Array.isArray(value.connections) &&
    value.connections.every(isConnection)
  )
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

/** @returns the fragment as clipboard text (pretty JSON, so it can be read and edited by hand) */
export function encodeFragment(fragment: WorkflowFragment): string {
  return JSON.stringify(fragment, null, 2)
}

/**
 * @param text clipboard text of any origin
 * @returns the fragment, or null when the text is not a fragment of this format and version
 */
export function decodeFragment(text: string): WorkflowFragment | null {
  const value = parseJson(text.trim())
  if (!isFragment(value)) return null
  // Rebuilt so that only known fields travel further, whatever else the text carried.
  return createFragment(value.nodes.map(pickNode), value.connections.map(pickConnection))
}

function pickNode(node: NodeModel): NodeModel {
  return {
    id: node.id,
    name: node.name,
    type: node.type,
    typeVersion: node.typeVersion,
    position: { x: node.position.x, y: node.position.y },
    parameters: node.parameters,
    credentialId: node.credentialId,
    disabled: node.disabled,
    notes: node.notes,
    settings: node.settings,
  }
}

function pickConnection(connection: ConnectionModel): ConnectionModel {
  return {
    source: connection.source,
    sourceOutput: connection.sourceOutput,
    target: connection.target,
    targetInput: connection.targetInput,
    type: connection.type,
  }
}
