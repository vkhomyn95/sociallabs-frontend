import { describe, expect, it } from 'vitest'
import { compactOps } from '../compactOps'
import type { DraftOp } from '../ops'

describe('compactOps', () => {
  it('merges neighbouring overwrites only', () => {
    const ops: DraftOp[] = [
      { op: 'moveNodes', positions: { a: { x: 1, y: 1 } } },
      { op: 'moveNodes', positions: { a: { x: 2, y: 2 }, b: { x: 3, y: 3 } } },
      { op: 'renameNode', nodeId: 'a', name: 'S' },
      { op: 'renameNode', nodeId: 'a', name: 'Start' },
      { op: 'renameNode', nodeId: 'b', name: 'B' },
      { op: 'removeNodes', nodeIds: ['b'] },
      { op: 'renameNode', nodeId: 'a', name: 'End' },
    ]
    expect(compactOps(ops)).toEqual([
      { op: 'moveNodes', positions: { a: { x: 2, y: 2 }, b: { x: 3, y: 3 } } },
      { op: 'renameNode', nodeId: 'a', name: 'Start' },
      { op: 'renameNode', nodeId: 'b', name: 'B' },
      { op: 'removeNodes', nodeIds: ['b'] },
      { op: 'renameNode', nodeId: 'a', name: 'End' },
    ])
  })
})
