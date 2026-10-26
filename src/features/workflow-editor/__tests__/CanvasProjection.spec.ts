import { describe, expect, it } from 'vitest'
import { NodeGroup, NodeKind, NodeTypeStatus, PortKind, type NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import { CommandHistory, MoveNodesCommand, RemoveNodesCommand, UpdateNodeCommand } from '@/core/workflow/commands'
import { WorkflowDocument } from '@/core/workflow/WorkflowDocument'
import { link, node } from '@/core/workflow/__tests__/fixtures'
import { CanvasModelFactory } from '../canvas/canvasModel'
import { CanvasProjection, type CanvasPort } from '../canvas/CanvasProjection'

const switchType: NodeTypeDescriptor = {
  key: 'core.switch@1', name: 'core.switch', version: 1, kind: NodeKind.ACTION, displayName: 'Switch', description: '',
  group: NodeGroup.LOGIC, icon: '', status: NodeTypeStatus.STABLE,
  inputs: [{ name: 'main', displayName: '', kind: PortKind.MAIN }], outputs: [],
  dynamicOutputs: { parameter: 'rules', labelField: 'outputName', fallback: true },
  credentials: { types: [], required: false }, properties: [],
}

/** Records every call so tests can assert that changes are applied point by point. */
const recordingCanvas = () => {
  const calls: string[] = []
  const edgeLabels = new Map<string, string>()
  const port: CanvasPort = {
    setNodes: (nodes) => calls.push(`setNodes:${nodes.length}`),
    setEdges: (edges) => {
      calls.push(`setEdges:${edges.length}`)
      edges.forEach((edge) => edgeLabels.set(edge.id, edge.data.label))
    },
    addNodes: (nodes) => calls.push(`addNodes:${nodes.map((n) => n.id)}`),
    removeNodes: (ids) => calls.push(`removeNodes:${ids}`),
    updateNode: (id, update) => calls.push(`updateNode:${id}:${Object.keys(update).sort()}`),
    addEdges: (edges) => calls.push(`addEdges:${edges.length}`),
    removeEdges: (ids) => calls.push(`removeEdges:${ids.length}`),
    updateEdgeData: (id, data) => {
      calls.push(`updateEdgeData:${id}`)
      edgeLabels.set(id, data.label)
    },
  }
  return { port, calls, edgeLabels }
}

describe('CanvasProjection', () => {
  const setup = () => {
    const doc = new WorkflowDocument({
      nodes: [node('s', { type: 'core.switch', parameters: { rules: [{ outputName: 'vip' }] } }), node('a'), node('b')],
      connections: [link('s', 'a', 0), link('s', 'b', 1)],
    })
    const canvas = recordingCanvas()
    const projection = new CanvasProjection(doc, new CanvasModelFactory(new NodeTypeCatalog([switchType])), canvas.port)
    projection.render()
    canvas.calls.length = 0
    return { doc, history: new CommandHistory(doc), projection, ...canvas }
  }

  it('applies each change as a point update', () => {
    const { history, calls } = setup()
    history.execute(new MoveNodesCommand(new Map([['a', { x: 5, y: 5 }]])))
    history.execute(new UpdateNodeCommand('b', 'name', 'B'))
    history.execute(new RemoveNodesCommand(['b']))
    history.undo()

    expect(calls).toEqual([
      'updateNode:a:position',
      'updateNode:b:data,position',
      'removeEdges:1',
      'removeNodes:b',
      'addNodes:b',
      'addEdges:1',
    ])
  })

  it('edge labels follow the dynamic ports of their source', () => {
    const { history, edgeLabels, calls } = setup()
    expect([...edgeLabels.values()]).toEqual(['vip', 'fallback'])

    history.execute(new UpdateNodeCommand('s', 'parameters', { rules: [{ outputName: 'gold' }] }))
    expect(calls.filter((call) => call.startsWith('updateEdgeData'))).toHaveLength(2)
    expect([...edgeLabels.values()]).toEqual(['gold', 'fallback'])
  })

  it('unknown node types still render with one main port each way', () => {
    const { projection } = setup()
    const data = projection.dataOf('a')!
    expect(data.descriptor).toBeUndefined()
    expect([data.inputs.length, data.outputs.length]).toEqual([1, 1])
  })
})
