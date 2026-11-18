import { beforeEach, describe, expect, it } from 'vitest'
import { link, node } from '../../__tests__/fixtures'
import { WorkflowDocument } from '../../WorkflowDocument'
import { createFragment, extractFragment, FragmentInstantiator, placeAt, shiftBy, WebhookPathRule } from '..'

describe('FragmentInstantiator', () => {
  let ids: number
  let instantiator: FragmentInstantiator

  beforeEach(() => {
    ids = 0
    instantiator = new FragmentInstantiator({ newId: () => `new-${++ids}`, rules: [new WebhookPathRule(() => 'fresh')] })
  })

  const docWith = (...names: string[]) =>
    new WorkflowDocument({ nodes: names.map((name) => node(name)), connections: [] })

  it('gives fresh ids and keeps names that are free', () => {
    const graph = instantiator.instantiate(createFragment([node('a')], []), docWith(), shiftBy())
    expect(graph.nodes[0]).toMatchObject({ id: 'new-1', name: 'a' })
  })

  it('renames copies so that names stay unique, also among themselves', () => {
    const fragment = createFragment([node('x', { name: 'If' }), node('y', { name: 'If 2' })], [])
    const graph = instantiator.instantiate(fragment, docWith('If', 'If 2'), shiftBy())
    expect(graph.nodes.map((n) => n.name)).toEqual(['If 3', 'If 4'])
  })

  it('points references between pasted nodes at the new names', () => {
    const fragment = createFragment(
      [node('x', { name: 'If' }), node('y', { name: 'Set', parameters: { value: "{{ $node['If'].json.a }}" } })],
      [link('x', 'y')],
    )
    const graph = instantiator.instantiate(fragment, docWith('If'), shiftBy())
    expect(graph.nodes[1]!.parameters.value).toBe("{{ $node['If 2'].json.a }}")
  })

  it('rewires connections to the new ids and drops dangling ones', () => {
    const fragment = createFragment([node('x'), node('y')], [link('x', 'y'), link('x', 'gone')])
    const graph = instantiator.instantiate(fragment, docWith(), shiftBy())
    expect(graph.connections).toEqual([{ ...link('new-1', 'new-2') }])
  })

  it('moves the top-left corner onto the paste point and keeps the layout', () => {
    const fragment = createFragment(
      [node('x', { position: { x: 100, y: 200 } }), node('y', { position: { x: 300, y: 150 } })],
      [],
    )
    const graph = instantiator.instantiate(fragment, docWith(), placeAt({ x: 0, y: 0 }))
    expect(graph.nodes.map((n) => n.position)).toEqual([{ x: 0, y: 50 }, { x: 200, y: 0 }])
  })

  it('shifts duplicates by the offset', () => {
    const fragment = createFragment([node('x', { position: { x: 10, y: 10 } })], [])
    const graph = instantiator.instantiate(fragment, docWith(), shiftBy({ x: 40, y: 40 }))
    expect(graph.nodes[0]!.position).toEqual({ x: 50, y: 50 })
  })

  it('gives a pasted webhook a fresh path', () => {
    const webhook = node('w', { type: 'core.webhook', parameters: { path: 'orders', method: 'POST' } })
    const graph = instantiator.instantiate(createFragment([webhook], []), docWith(), shiftBy())
    expect(graph.nodes[0]!.parameters).toEqual({ path: 'fresh', method: 'POST' })
  })
})

describe('extractFragment', () => {
  const doc = new WorkflowDocument({
    nodes: [node('a'), node('b'), node('c')],
    connections: [link('a', 'b'), link('b', 'c')],
  })

  it('keeps only connections inside the selection', () => {
    const fragment = extractFragment(doc, ['a', 'b'])!
    expect(fragment.nodes.map((n) => n.id)).toEqual(['a', 'b'])
    expect(fragment.connections).toEqual([link('a', 'b')])
  })

  it('returns null when nothing is selected', () => {
    expect(extractFragment(doc, ['missing'])).toBeNull()
  })
})
