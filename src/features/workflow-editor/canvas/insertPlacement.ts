import { PortKind } from '@/core/node-types/descriptor'
import type { PortView } from '@/core/node-types/ports'
import type { NodeId, Position } from '@/core/workflow/model'
import { InsertMode, type InsertTarget } from '../creator/insertTarget'
import { NODE_SIZE } from './canvasModel'

/** Box of a drawn node in flow coordinates. */
export interface NodeBox {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/** The port a node is added from: the plus of a port, or the start of a connection dropped on the empty canvas. */
export interface InsertOrigin {
  readonly node: NodeId
  readonly box: NodeBox
  readonly port: PortView
  readonly side: 'input' | 'output'
}

/** Horizontal room between a node and one added next to it, and vertical room above a sub-node. */
const GAP = 120

const centredOn = (point: Position): Position => ({ x: point.x - NODE_SIZE / 2, y: point.y - NODE_SIZE / 2 })

/**
 * Where the node creator adds a node for a port: after an output, before a main input, or as a sub-node below an
 * agent input. A drop point places the new node there; without one (a plus was clicked) it goes beside the node.
 *
 * @returns the target, or null for ports nothing can be added to (a sub-node's own output)
 */
export function insertTargetFor(origin: InsertOrigin, drop: Position | null): InsertTarget | null {
  const { box, node, port } = origin
  const level = box.y + (box.height - NODE_SIZE) / 2
  if (origin.side === 'output') {
    if (port.kind !== PortKind.MAIN) return null
    const position = drop ? centredOn(drop) : { x: box.x + box.width + GAP, y: level }
    return { mode: InsertMode.AFTER, position, node, output: port.index }
  }
  if (port.kind === PortKind.MAIN) {
    const position = drop ? centredOn(drop) : { x: box.x - GAP - NODE_SIZE, y: level }
    return { mode: InsertMode.BEFORE, position, node, input: port.index }
  }
  const position = drop ? centredOn(drop) : { x: box.x + box.width / 2 - NODE_SIZE / 2, y: box.y + box.height + GAP }
  return { mode: InsertMode.SUB_NODE, position, node, input: port.index, kind: port.kind }
}
