import { describe, expect, it } from 'vitest'
import { Position } from '@vue-flow/core'
import { edgePath, EdgeShape, runsBackward, type EdgeEnds } from '../edgePath'

const ends = (sourceX: number, targetX: number, targetY = 50): EdgeEnds => ({
  sourceX,
  sourceY: 50,
  sourcePosition: Position.Right,
  targetX,
  targetY,
  targetPosition: Position.Left,
})

describe('edgePath', () => {
  it('curves forward edges, also over nodes in between', () => {
    const path = edgePath(ends(100, 400))
    expect(path.segments).toHaveLength(1)
    expect(path.segments[0]!.path).toMatch(/^M ?100[ ,]50 ?C/)
    expect([path.labelX, path.labelY]).toEqual([250, 50])
  })

  it('takes an edge back to an earlier node below the source, in two rounded steps', () => {
    const path = edgePath(ends(500, 100))
    expect(path.segments).toHaveLength(2)
    expect(path.segments[0]!.path).toMatch(/^M ?500[ ,]50/)
    // The label sits where the two steps meet, 130 px below the source handle.
    expect([path.labelX, path.labelY]).toEqual([300, 180])
  })

  it('passes below a target that sits lower than the source', () => {
    const path = edgePath(ends(500, 100, 400), { floorY: 520 })
    expect(path.labelY).toBe(544)
  })

  it('keeps a curve while the target is still within reach of the source handle', () => {
    expect(runsBackward(ends(100, 85))).toBe(false)
    expect(runsBackward(ends(100, 79))).toBe(true)
  })

  it('curves sub-node attachments whatever their direction', () => {
    expect(edgePath(ends(500, 100), { shape: EdgeShape.BEZIER }).segments).toHaveLength(1)
  })
})
