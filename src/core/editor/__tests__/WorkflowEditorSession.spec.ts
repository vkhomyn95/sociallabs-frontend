import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NodeGroup, NodeKind, NodeTypeStatus, PortKind, PropertyType, type NodeTypeDescriptor } from '@/core/node-types/descriptor'
import type { DraftApi } from '@/core/sync/DraftApi'
import type { DraftOp } from '@/core/sync/ops'
import { ConnectionType, connectionKey } from '@/core/workflow/model'
import { link, node } from '@/core/workflow/__tests__/fixtures'
import { ConnectRejection, LinkDirection, WorkflowEditorSession } from '../WorkflowEditorSession'

const httpType: NodeTypeDescriptor = {
  key: 'http.request@1',
  name: 'http.request',
  version: 1,
  kind: NodeKind.ACTION,
  displayName: 'HTTP Request',
  description: '',
  group: NodeGroup.CORE,
  icon: '',
  status: NodeTypeStatus.STABLE,
  inputs: [{ name: 'main', displayName: '', kind: PortKind.MAIN, show: [] }],
  outputs: [{ name: 'main', displayName: '', kind: PortKind.MAIN, show: [] }],
  credentials: { types: [], required: false },
  properties: [
    {
      name: 'method', displayName: 'Method', description: '', placeholder: '', type: PropertyType.OPTIONS, required: true,
      defaultValue: 'GET', expression: false, options: [], children: [], show: [], hide: [], loadOptions: false,
    },
  ],
}

describe('WorkflowEditorSession', () => {
  let saved: DraftOp[][]
  let session: WorkflowEditorSession
  let ids: number

  beforeEach(() => {
    vi.useFakeTimers()
    saved = []
    ids = 0
    const api: DraftApi = {
      patch: async (_id, revision, ops) => {
        saved.push(ops)
        return { revision: revision + 1 }
      },
    }
    session = new WorkflowEditorSession(api, 1, 1, { nodes: [node('a'), node('b')], connections: [link('a', 'b')] }, {
      newId: () => `n${++ids}`,
    })
  })

  afterEach(() => {
    session.dispose()
    vi.useRealTimers()
  })

  it('every change, undo included, reaches the server as operations', async () => {
    const added = session.insertNode(httpType, { x: 100, y: 0 })
    session.insertNode(httpType, { x: 200, y: 0 })
    session.undo()
    await session.sync.flush()

    expect(added).toMatchObject({ id: 'n1', name: 'HTTP Request', parameters: { method: 'GET' } })
    expect(saved).toHaveLength(1)
    expect(saved[0]!.map((op) => op.op)).toEqual(['addNode', 'addNode', 'removeNodes'])
    expect(session.document.node('n2')).toBeUndefined()
    expect(session.insertNode(httpType, { x: 0, y: 0 }).name).toBe('HTTP Request 2')
  })

  it('adds a node with preset parameters, wired to the node it was added after, as one undo step', () => {
    session.document.load({ nodes: [node('a')], connections: [] })
    const added = session.insertNode(httpType, { x: 200, y: 0 }, {
      parameters: { method: 'POST' },
      link: { node: 'a', port: 0, direction: LinkDirection.FROM_EXISTING, type: ConnectionType.MAIN },
    })

    expect(added.parameters).toEqual({ method: 'POST' })
    expect(session.document.incoming(added.id)).toEqual([
      { source: 'a', sourceOutput: 0, target: added.id, targetInput: 0, type: ConnectionType.MAIN },
    ])
    session.undo()
    expect(session.document.node(added.id)).toBeUndefined()
    expect(session.document.connections()).toEqual([])
  })

  it('refuses duplicate, self and cyclic connections', () => {
    expect(session.connect({ source: 'a', sourceOutput: 0, target: 'b', targetInput: 0 })).toBe(ConnectRejection.DUPLICATE)
    expect(session.connect({ source: 'b', sourceOutput: 0, target: 'a', targetInput: 0 })).toBe(ConnectRejection.CYCLE)
    expect(session.connect({ source: 'a', sourceOutput: 0, target: 'a', targetInput: 0 })).toBe(ConnectRejection.SAME_NODE)
    expect(session.connect({ source: 'a', sourceOutput: 1, target: 'b', targetInput: 0 })).toBeNull()
    expect(session.history.canUndo).toBe(true)
  })

  it('deleting a selection is one undo step and skips connections of deleted nodes', () => {
    session.connect({ source: 'a', sourceOutput: 1, target: 'b', targetInput: 0 })
    session.remove(['b'], [connectionKey(link('a', 'b'))])
    expect(session.document.nodeCount).toBe(1)
    session.undo()
    expect(session.document.connections()).toHaveLength(2)
  })

  it('unchanged values and positions are not recorded', () => {
    session.update('a', 'name', 'a')
    session.patch('a', { parameters: {}, disabled: false })
    session.move(new Map([['a', { x: 0.2, y: 0 }]]))
    expect(session.history.canUndo).toBe(false)

    session.patch('a', { parameters: { x: 1 }, name: 'Start', disabled: false })
    session.undo()
    expect(session.document.node('a')).toMatchObject({ name: 'a', parameters: {} })
  })

  it('reload drops history and pending operations', async () => {
    session.update('a', 'notes', 'x')
    session.reload({ nodes: [node('z')], connections: [] }, 9)
    await vi.advanceTimersByTimeAsync(5000)
    expect(saved).toEqual([])
    expect(session.history.canUndo).toBe(false)
    expect(session.sync.revision).toBe(9)
  })
})
