import { describe, expect, it } from 'vitest'
import {
  AddNodesCommand,
  CommandHistory,
  CompositeCommand,
  ConnectCommand,
  DisconnectCommand,
  MoveNodesCommand,
  RemoveNodesCommand,
  UpdateNodeCommand,
} from '../commands'
import { connectionKey } from '../model'
import { DocumentError, WorkflowDocument } from '../WorkflowDocument'
import { link, node } from './fixtures'

const graph = () => new WorkflowDocument({ nodes: [node('a'), node('b'), node('c')], connections: [link('a', 'b'), link('b', 'c')] })

/** Graph content regardless of node order (undo of a removal appends the node, as the server does). */
const state = (doc: WorkflowDocument) =>
  JSON.stringify({ ...doc.snapshot(), nodes: [...doc.nodes()].sort((a, b) => a.id.localeCompare(b.id)) })

describe('commands', () => {
  it('removing nodes takes their connections and undo restores both', () => {
    const doc = graph()
    const before = state(doc)
    const command = new RemoveNodesCommand(['b'])

    command.apply(doc)
    expect(doc.nodes().map((n) => n.id)).toEqual(['a', 'c'])
    expect(doc.connections()).toEqual([])
    expect(command.toOps()).toEqual([{ op: 'removeNodes', nodeIds: ['b'] }])

    command.revert(doc)
    expect(doc.connections()).toHaveLength(2)
    expect(command.toRevertOps().map((op) => op.op)).toEqual(['addNode', 'addConnection', 'addConnection'])
    // Restored nodes are appended, as the server does for addNode.
    expect(doc.nodes().map((n) => n.id)).toEqual(['a', 'c', 'b'])
    expect(JSON.parse(state(doc)).connections).toEqual(JSON.parse(before).connections)
  })

  it('a connection between two removed nodes is restored once', () => {
    const doc = graph()
    const command = new RemoveNodesCommand(['a', 'b'])
    command.apply(doc)
    expect(command.toRevertOps().filter((op) => op.op === 'addConnection')).toHaveLength(2)
    command.revert(doc)
    expect(doc.connections()).toHaveLength(2)
  })

  it('a failing command leaves the document unchanged', () => {
    const doc = graph()
    const before = state(doc)
    expect(() => new AddNodesCommand([node('x')], [link('x', 'missing')]).apply(doc)).toThrow(DocumentError)
    expect(() => new RemoveNodesCommand(['a', 'missing']).apply(doc)).toThrow(DocumentError)
    expect(() =>
      new CompositeCommand('both', [new ConnectCommand(link('a', 'c')), new ConnectCommand(link('a', 'b'))]).apply(doc),
    ).toThrow(DocumentError)
    expect(state(doc)).toBe(before)
  })

  it('move, update and disconnect produce operations for both directions', () => {
    const doc = graph()
    const move = new MoveNodesCommand(new Map([['a', { x: 10.4, y: 20.6 }]]))
    move.apply(doc)
    expect(move.toOps()).toEqual([{ op: 'moveNodes', positions: { a: { x: 10, y: 21 } } }])
    expect(move.toRevertOps()).toEqual([{ op: 'moveNodes', positions: { a: { x: 0, y: 0 } } }])

    const rename = new UpdateNodeCommand('a', 'name', 'Start')
    rename.apply(doc)
    expect(rename.toOps()).toEqual([{ op: 'renameNode', nodeId: 'a', name: 'Start' }])
    expect(rename.toRevertOps()).toEqual([{ op: 'renameNode', nodeId: 'a', name: 'a' }])

    const disconnect = new DisconnectCommand([connectionKey(link('a', 'b'))])
    disconnect.apply(doc)
    expect(disconnect.toOps()).toEqual([{ op: 'removeConnection', connection: link('a', 'b') }])
    disconnect.revert(doc)
    expect(doc.hasConnection(link('a', 'b'))).toBe(true)
  })
})

describe('CommandHistory', () => {
  const setup = () => {
    let now = 0
    const doc = graph()
    const history = new CommandHistory(doc, { mergeWindowMs: 1000, clock: () => now, limit: 3 })
    const ops: string[][] = []
    history.events.on('applied', (applied) => ops.push(applied.map((op) => op.op)))
    return { doc, history, ops, tick: (ms: number) => (now += ms) }
  }

  it('undo and redo replay the document and emit the matching operations', () => {
    const { doc, history, ops } = setup()
    const before = state(doc)
    history.execute(new ConnectCommand(link('a', 'c')))
    history.execute(new RemoveNodesCommand(['b']))
    const after = state(doc)

    expect(history.undo()).toBe(true)
    expect(history.undo()).toBe(true)
    expect(history.undo()).toBe(false)
    expect(state(doc)).toBe(before)
    expect(history.redo()).toBe(true)
    expect(history.redo()).toBe(true)
    expect(state(doc)).toBe(after)
    expect(ops).toEqual([
      ['addConnection'],
      ['removeNodes'],
      ['addNode', 'addConnection', 'addConnection'],
      ['removeConnection'],
      ['addConnection'],
      ['removeNodes'],
    ])
  })

  it('a new command clears redo', () => {
    const { history } = setup()
    history.execute(new UpdateNodeCommand('a', 'disabled', true))
    history.undo()
    history.execute(new UpdateNodeCommand('b', 'disabled', true))
    expect(history.canRedo).toBe(false)
  })

  it('typing into one field within the merge window is one undo step', () => {
    const { doc, history, ops, tick } = setup()
    history.execute(new UpdateNodeCommand('a', 'name', 'S'))
    tick(300)
    history.execute(new UpdateNodeCommand('a', 'name', 'St'))
    tick(300)
    history.execute(new UpdateNodeCommand('a', 'name', 'Start'))
    tick(2000)
    history.execute(new UpdateNodeCommand('a', 'name', 'Start!'))

    expect(ops).toHaveLength(4)
    history.undo()
    expect(doc.node('a')!.name).toBe('Start')
    history.undo()
    expect(doc.node('a')!.name).toBe('a')
    expect(ops.at(-1)).toEqual(['renameNode'])
    expect(history.canUndo).toBe(false)
  })

  it('edits of different fields or nodes do not merge', () => {
    const { history } = setup()
    history.execute(new UpdateNodeCommand('a', 'name', 'x'))
    history.execute(new UpdateNodeCommand('a', 'notes', 'n'))
    history.execute(new UpdateNodeCommand('b', 'notes', 'n'))
    expect([history.undo(), history.undo(), history.undo(), history.undo()]).toEqual([true, true, true, false])
  })

  it('keeps at most the configured number of steps', () => {
    const { history } = setup()
    ;['a', 'b', 'c', 'a'].forEach((id, i) => history.execute(new UpdateNodeCommand(id, 'notes', String(i))))
    let steps = 0
    while (history.undo()) steps++
    expect(steps).toBe(3)
  })
})
