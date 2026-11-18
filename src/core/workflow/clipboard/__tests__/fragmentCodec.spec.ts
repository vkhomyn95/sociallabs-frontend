import { describe, expect, it } from 'vitest'
import { link, node } from '../../__tests__/fixtures'
import { createFragment, decodeFragment, encodeFragment, filterFragment, FRAGMENT_FORMAT } from '..'

describe('fragment codec', () => {
  const fragment = createFragment([node('a'), node('b', { credentialId: 7, notes: 'n' })], [link('a', 'b')])

  it('round-trips a fragment', () => {
    expect(decodeFragment(encodeFragment(fragment))).toEqual(fragment)
  })

  it('rejects text that is not a fragment', () => {
    expect(decodeFragment('hello')).toBeNull()
    expect(decodeFragment('{"nodes": []}')).toBeNull()
    expect(decodeFragment(JSON.stringify({ ...fragment, version: 99 }))).toBeNull()
    expect(decodeFragment(JSON.stringify({ ...fragment, format: 'n8n' }))).toBeNull()
  })

  it('rejects malformed nodes and connections', () => {
    const badNode = { ...fragment, nodes: [{ ...node('a'), position: { x: 'x', y: 0 } }] }
    const badLink = { ...fragment, connections: [{ ...link('a', 'b'), type: 'WIRE' }] }
    expect(decodeFragment(JSON.stringify(badNode))).toBeNull()
    expect(decodeFragment(JSON.stringify(badLink))).toBeNull()
  })

  it('drops unknown fields', () => {
    const text = JSON.stringify({ format: FRAGMENT_FORMAT, version: 1, extra: 1, nodes: [{ ...node('a'), evil: 1 }], connections: [] })
    expect(decodeFragment(text)!.nodes[0]).toEqual(node('a'))
  })

  it('filters nodes together with their connections', () => {
    const filtered = filterFragment(fragment, (n) => n.id === 'a')
    expect(filtered.nodes.map((n) => n.id)).toEqual(['a'])
    expect(filtered.connections).toEqual([])
    expect(filterFragment(fragment, () => true)).toBe(fragment)
  })
})
