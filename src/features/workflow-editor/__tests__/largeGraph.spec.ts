import { describe, expect, it } from 'vitest'
import { WorkflowEditorSession } from '@/core/editor/WorkflowEditorSession'
import { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import type { NodeId, Position } from '@/core/workflow/model'
import { link, node } from '@/core/workflow/__tests__/fixtures'
import { CanvasModelFactory } from '../canvas/canvasModel'
import { CanvasProjection, type CanvasPort } from '../canvas/CanvasProjection'

const NODES = 1000

/** A chain of 1000 nodes with a branch every tenth node: ~1100 connections. */
function largeGraph() {
  const nodes = Array.from({ length: NODES }, (_, i) => node(`n${i}`, { position: { x: (i % 40) * 260, y: Math.floor(i / 40) * 120 } }))
  const connections = nodes.slice(1).map((n, i) => link(`n${i}`, n.id))
  for (let i = 0; i + 5 < NODES; i += 10) connections.push(link(`n${i}`, `n${i + 5}`, 1))
  return { nodes, connections }
}

describe('a 1000-node workflow', () => {
  it('each edit costs one point update of the canvas, not a rebuild', () => {
    let updates = 0
    let rebuilds = 0
    const canvas: CanvasPort = {
      setNodes: () => rebuilds++,
      setEdges: () => rebuilds++,
      addNodes: () => updates++,
      removeNodes: () => updates++,
      updateNode: () => updates++,
      addEdges: () => updates++,
      removeEdges: () => updates++,
      updateEdgeData: () => updates++,
    }
    const api = { patch: async (_: number, revision: number) => ({ revision: revision + 1 }) }
    const session = new WorkflowEditorSession(api, 1, 1, largeGraph())
    const projection = new CanvasProjection(session.document, new CanvasModelFactory(new NodeTypeCatalog([])), canvas)
    projection.render()
    rebuilds = 0

    const started = performance.now()
    for (let i = 0; i < NODES; i++) {
      session.move(new Map<NodeId, Position>([[`n${i}`, { x: i + 1, y: i + 1 }]]))
    }
    session.update('n500', 'name', 'Renamed')
    session.remove(['n500'])
    session.undo()
    const elapsed = performance.now() - started

    // 1000 moves + rename + (3 edges and the node removed, then restored)
    expect(updates).toBe(NODES + 1 + 4 + 4)
    expect(rebuilds).toBe(0)
    // Generous bound for slow CI machines; a rebuild-per-change design takes seconds here.
    expect(elapsed).toBeLessThan(1000)
    session.dispose()
  })
})
