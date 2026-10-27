import { describe, expect, it } from 'vitest'
import { PortKind } from '@/core/node-types/descriptor'
import { PortRole, type PortView } from '@/core/node-types/ports'
import { InsertMode } from '../../creator/insertTarget'
import { insertTargetFor, type InsertOrigin } from '../insertPlacement'

const port = (index: number, kind = PortKind.MAIN): PortView => ({ index, label: '', kind, role: PortRole.DEFAULT })
const box = { x: 0, y: 0, width: 100, height: 100 }
const origin = (side: InsertOrigin['side'], p: PortView): InsertOrigin => ({ node: 'n', box, port: p, side })

describe('insertTargetFor', () => {
  it('puts a node added from an output to the right, or where the connection was dropped', () => {
    expect(insertTargetFor(origin('output', port(1)), null)).toEqual({ mode: InsertMode.AFTER, position: { x: 220, y: 0 }, node: 'n', output: 1 })
    expect(insertTargetFor(origin('output', port(0)), { x: 500, y: 300 })?.position).toEqual({ x: 450, y: 250 })
  })

  it('puts a node added before an input to the left', () => {
    expect(insertTargetFor(origin('input', port(0)), null)).toEqual({ mode: InsertMode.BEFORE, position: { x: -220, y: 0 }, node: 'n', input: 0 })
  })

  it('puts a sub-node below the agent, for the kind of its input', () => {
    expect(insertTargetFor(origin('input', port(2, PortKind.AI_TOOL)), null)).toEqual({
      mode: InsertMode.SUB_NODE,
      position: { x: 0, y: 220 },
      node: 'n',
      input: 2,
      kind: PortKind.AI_TOOL,
    })
  })

  it('adds nothing from the output of a sub-node', () => {
    expect(insertTargetFor(origin('output', port(0, PortKind.AI_MODEL)), null)).toBeNull()
  })
})
