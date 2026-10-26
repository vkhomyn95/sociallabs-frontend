import { describe, expect, it, vi } from 'vitest'
import { link, node } from '@/core/workflow/__tests__/fixtures'
import { WorkflowDocument } from '@/core/workflow/WorkflowDocument'
import { ExecutionTracker, NodeRunState } from '../ExecutionTracker'
import { RunDataView } from '../RunDataView'
import { ExecutionEventType, ExecutionStatus, NodeRunStatus, type ExecutionEvent, type RunData } from '../types'

const event = (type: ExecutionEventType, changes: Partial<ExecutionEvent> = {}): ExecutionEvent => ({
  type,
  executionId: 1,
  workflowId: 9,
  nodeId: null,
  status: null,
  itemsOut: null,
  durationMs: null,
  error: null,
  at: '2026-10-26T10:00:00Z',
  ...changes,
})

describe('ExecutionTracker', () => {
  it('follows node states of one execution and ignores others', () => {
    const tracker = new ExecutionTracker()
    const changes = vi.fn()
    const finished = vi.fn()
    tracker.events.on('node', changes)
    tracker.events.on('finished', finished)
    tracker.follow(1)

    tracker.apply(event(ExecutionEventType.NODE_STARTED, { nodeId: 'a' }))
    tracker.apply(event(ExecutionEventType.NODE_STARTED, { nodeId: 'x', executionId: 2 }))
    expect(tracker.view('a')?.state).toBe(NodeRunState.RUNNING)
    expect(tracker.running).toBe(true)

    tracker.apply(event(ExecutionEventType.NODE_FINISHED, { nodeId: 'a', status: NodeRunStatus.SUCCESS, itemsOut: 3 }))
    tracker.apply(event(ExecutionEventType.NODE_STARTED, { nodeId: 'b' }))
    tracker.apply(event(ExecutionEventType.EXECUTION_FINISHED, { status: ExecutionStatus.ERROR, error: 'boom' }))

    expect(tracker.view('a')).toEqual({ state: NodeRunState.SUCCESS, itemsOut: 3, error: null })
    expect(tracker.view('b')?.state, 'never reported back').toBe(NodeRunState.ERROR)
    expect(tracker.view('x')).toBeUndefined()
    expect(finished).toHaveBeenCalledWith(1, ExecutionStatus.ERROR, 'boom')
    expect(tracker.running).toBe(false)
    expect(changes).toHaveBeenCalledTimes(4)
  })

  it('following another execution clears the previous states', () => {
    const tracker = new ExecutionTracker()
    tracker.follow(1)
    tracker.apply(event(ExecutionEventType.NODE_STARTED, { nodeId: 'a' }))
    const changes = vi.fn()
    tracker.events.on('node', changes)
    tracker.follow(2)
    expect(changes).toHaveBeenCalledWith('a', null)
    expect(tracker.view('a')).toBeUndefined()
  })
})

const runData: RunData = {
  version: 1,
  nodes: {
    t: { nodeId: 't', status: NodeRunStatus.SUCCESS, output: [[{ json: { n: 1 } }, { json: { n: 2 } }]], error: null, startedAt: null, durationMs: 1, attempts: 1 },
    if: {
      nodeId: 'if',
      status: NodeRunStatus.SUCCESS,
      output: [[{ json: { n: 2 } }], [{ json: { n: 1 } }]],
      error: null,
      startedAt: null,
      durationMs: 1,
      attempts: 1,
    },
  },
}

describe('RunDataView', () => {
  const doc = new WorkflowDocument({
    nodes: [node('t', { name: 'Trigger' }), node('if', { name: 'Check' }), node('send'), node('new')],
    connections: [link('t', 'if'), link('if', 'send', 1)],
  })
  const view = new RunDataView(doc, runData)

  it('derives inputs from the connected output port of the source', () => {
    expect(view.inputs('send').map((s) => s.items)).toEqual([[{ json: { n: 1 } }]])
    expect(view.inputs('if')[0]!.source.name).toBe('Trigger')
    expect(view.inputs('new')).toEqual([])
    expect(view.output('send')).toEqual([])
  })

  it('collects upstream outputs for previews and completions', () => {
    expect(view.upstream('send').map((n) => n.name)).toEqual(['Check', 'Trigger'])
    const sample = view.completionSample('send')
    expect(sample.json).toEqual({ n: 1 })
    expect(sample.nodes.get('Trigger')).toEqual({ n: 1 })
    expect(view.previewInput('if')).toEqual([{ n: 1 }, { n: 2 }])
  })
})

describe('schemaOf', () => {
  it('merges fields of the first items and describes arrays by their first element', async () => {
    const { schemaOf, FieldType } = await import('../schema')
    const schema = schemaOf([{ id: 1, user: { name: 'Ann' } }, { id: 2, tags: [{ v: 'x' }], note: null }])
    expect(schema.map((f) => [f.key, f.type])).toEqual([
      ['id', FieldType.NUMBER],
      ['user', FieldType.OBJECT],
      ['tags', FieldType.ARRAY],
      ['note', FieldType.NULL],
    ])
    expect(schema[1]!.children[0]).toMatchObject({ key: 'name', path: ['user', 'name'], sample: '"Ann"' })
    expect(schema[2]!.children[0]!.children[0]!.path).toEqual(['tags', 0, 'v'])
  })
})
