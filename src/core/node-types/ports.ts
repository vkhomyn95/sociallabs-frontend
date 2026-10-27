import { ConnectionType, OnError, type NodeModel } from '@/core/workflow/model'
import { PortKind, type NodeTypeDescriptor } from './descriptor'

/** A port as the canvas draws it; `index` is what connections store. */
export interface PortView {
  readonly index: number
  readonly label: string
  readonly kind: PortKind
  readonly role: PortRole
}

export enum PortRole {
  DEFAULT = 'DEFAULT',
  FALLBACK = 'FALLBACK',
  ERROR = 'ERROR',
}

/** @returns input ports of a node of the type */
export function inputPorts(descriptor: NodeTypeDescriptor): PortView[] {
  return descriptor.inputs.map((port, index) => ({ index, label: port.displayName, kind: port.kind, role: PortRole.DEFAULT }))
}

/**
 * Output ports of a node: static ones from the descriptor, or one per element of the list parameter for
 * dynamic outputs (Switch), plus the error port when the node routes failures to it.
 *
 * @param descriptor node type
 * @param node       node whose parameters and settings decide the ports
 * @returns ports in index order
 */
export function outputPorts(descriptor: NodeTypeDescriptor, node: Pick<NodeModel, 'parameters' | 'settings'>): PortView[] {
  const dynamic = descriptor.dynamicOutputs
  if (dynamic) {
    const elements = node.parameters[dynamic.parameter]
    const list = Array.isArray(elements) ? elements : []
    const ports: PortView[] = list.map((element, index) => ({
      index,
      label: labelOf(element, dynamic.labelField) || `output ${index + 1}`,
      kind: PortKind.MAIN,
      role: PortRole.DEFAULT,
    }))
    if (dynamic.fallback) ports.push({ index: ports.length, label: 'fallback', kind: PortKind.MAIN, role: PortRole.FALLBACK })
    return ports
  }
  const ports: PortView[] = descriptor.outputs.map((port, index) => ({
    index,
    label: port.name === 'main' ? port.displayName : port.displayName || port.name,
    kind: port.kind,
    role: PortRole.DEFAULT,
  }))
  if (node.settings?.onError === OnError.ERROR_OUTPUT) {
    ports.push({ index: ports.length, label: 'error', kind: PortKind.MAIN, role: PortRole.ERROR })
  }
  return ports
}

function labelOf(element: unknown, field: string): string {
  if (!field || typeof element !== 'object' || element === null) return ''
  const value = (element as Record<string, unknown>)[field]
  return typeof value === 'string' ? value : ''
}

/** Whether a port carries a sub-node attachment (model, memory, tool) rather than items. */
export const isSubNodePort = (port: Pick<PortView, 'kind'>): boolean => port.kind !== PortKind.MAIN

const CONNECTION_TYPES: Readonly<Record<PortKind, ConnectionType>> = {
  [PortKind.MAIN]: ConnectionType.MAIN,
  [PortKind.AI_MODEL]: ConnectionType.AI_MODEL,
  [PortKind.AI_MEMORY]: ConnectionType.AI_MEMORY,
  [PortKind.AI_TOOL]: ConnectionType.AI_TOOL,
}

/** @returns the connection type that joins ports of a kind */
export const connectionTypeOf = (kind: PortKind): ConnectionType => CONNECTION_TYPES[kind]

/**
 * Connection type between two ports, as the backend validates it: items between main ports, and a sub-node
 * output only into an input of the same kind.
 *
 * @returns the type, or null when the ports cannot be connected
 */
export function connectionTypeFor(source: Pick<PortView, 'kind'>, target: Pick<PortView, 'kind'>): ConnectionType | null {
  return source.kind === target.kind ? CONNECTION_TYPES[source.kind] : null
}
