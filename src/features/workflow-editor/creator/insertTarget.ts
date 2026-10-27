import { LinkDirection, type InsertLink } from '@/core/editor/WorkflowEditorSession'
import { NodeKind, PortKind, type NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { connectionTypeOf } from '@/core/node-types/ports'
import type { NodeId, Position } from '@/core/workflow/model'

/** Where the node creator puts the node it adds. */
export enum InsertMode {
  /** Anywhere: the canvas button or the Tab key. */
  FREE = 'FREE',
  /** After an output: its plus, or a connection dropped on the empty canvas. */
  AFTER = 'AFTER',
  /** Before a main input: a connection dragged from the input and dropped on the empty canvas. */
  BEFORE = 'BEFORE',
  /** A sub-node (model, memory, tool) for an agent's input. */
  SUB_NODE = 'SUB_NODE',
}

export type InsertTarget =
  | { readonly mode: InsertMode.FREE; readonly position: Position }
  | { readonly mode: InsertMode.AFTER; readonly position: Position; readonly node: NodeId; readonly output: number }
  | { readonly mode: InsertMode.BEFORE; readonly position: Position; readonly node: NodeId; readonly input: number }
  | { readonly mode: InsertMode.SUB_NODE; readonly position: Position; readonly node: NodeId; readonly input: number; readonly kind: PortKind }

const mainPort = (ports: NodeTypeDescriptor['inputs']): boolean => ports[0]?.kind === PortKind.MAIN

/** Whether a node of the type can be added at the target; the new node is wired by its first input or output. */
export function fits(type: NodeTypeDescriptor, target: InsertTarget): boolean {
  switch (target.mode) {
    case InsertMode.FREE:
      return true
    case InsertMode.AFTER:
      return type.kind !== NodeKind.SUPPLY && mainPort(type.inputs)
    case InsertMode.BEFORE:
      return type.kind !== NodeKind.SUPPLY && mainPort(type.outputs)
    case InsertMode.SUB_NODE:
      return type.kind === NodeKind.SUPPLY && type.outputs[0]?.kind === target.kind
  }
}

/** Whether the creator may offer triggers: a trigger has no input, so nothing can come before it. */
export const allowsTriggers = (target: InsertTarget): boolean => target.mode === InsertMode.FREE || target.mode === InsertMode.BEFORE

/** @returns the connection made with the new node, none for a free one */
export function linkOf(target: InsertTarget): InsertLink | undefined {
  switch (target.mode) {
    case InsertMode.FREE:
      return undefined
    case InsertMode.AFTER:
      return { node: target.node, port: target.output, direction: LinkDirection.FROM_EXISTING, type: connectionTypeOf(PortKind.MAIN) }
    case InsertMode.BEFORE:
      return { node: target.node, port: target.input, direction: LinkDirection.INTO_EXISTING, type: connectionTypeOf(PortKind.MAIN) }
    case InsertMode.SUB_NODE:
      return { node: target.node, port: target.input, direction: LinkDirection.INTO_EXISTING, type: connectionTypeOf(target.kind) }
  }
}
